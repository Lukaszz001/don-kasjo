  import { NextResponse } from "next/server"
  import crypto from "crypto"
  import { connectToDatabase } from "@/lib/db/mongodb"
  import { User, ChatLog, Giveaway, BonusGuess, BonusGuessEntry, Activity } from "@/lib/db/models"
  import { redis } from "@/lib/db/redis"
  import { triggerUpdate } from "@/lib/pusher-server"

  import { getKickPublicKey } from "@/lib/kick-api"

  /**
   * Verify Kick signature (RSA-SHA256)
   */
  async function verifySignature(req: Request, rawBody: string): Promise<boolean> {
    const signature = req.headers.get("Kick-Event-Signature")
    const messageId = req.headers.get("Kick-Event-Message-Id")
    const timestamp = req.headers.get("Kick-Event-Message-Timestamp")

    if (!signature || !messageId || !timestamp) {
      return false
    }

    try {
      let publicKey = await redis.get("kick:public_key")

      if (!publicKey) {
        publicKey = await getKickPublicKey()
        await redis.set("kick:public_key", publicKey, "EX", 86400)
      }

      const data = `${messageId}.${timestamp}.${rawBody}`

      const verify = crypto.createVerify("RSA-SHA256")
      verify.update(data)
      verify.end()

      return verify.verify(publicKey, signature, "base64")
    } catch (error) {
      console.error("[WEBHOOK] Signature verification error:", error)
      return false
    }
  }

  export async function POST(req: Request) {
    try {
      const rawBody = await req.text()

      const eventType = req.headers.get("Kick-Event-Type")
      const messageId = req.headers.get("Kick-Event-Message-Id")

      console.log(`[WEBHOOK] hit type=${eventType} msg=${messageId}`)

      // Validate signature
      const isValid = await verifySignature(req, rawBody)

      if (!isValid) {
        console.warn(`[WEBHOOK] invalid signature (env=${process.env.NODE_ENV})`)
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
        }
      }

      const payload = JSON.parse(rawBody)

      await connectToDatabase()

      switch (eventType) {
        case "chat.message.sent": {
          const { sender, content } = payload
          if (!sender || !sender.user_id) {
            break
          }

          const kickId = sender.user_id.toString()
          const username = sender.username

          // Save to ChatLog
          await ChatLog.create({
            kickId,
            username,
            content
          })

          // ── SESSION-BASED POINTS ─────────────────────────────────────────
          // Session starts on first message.
          // Each message within 10 min extends the session by another 10 min.
          // Points: 2 pts per started minute of the active session.
          // Points are awarded progressively — each message earns pts for new
          // minutes that elapsed since the last award within this session.
          const now = Math.floor(Date.now() / 1000)
          const SESSION_TTL = 600 // 10 minutes
          const sessionKey = `session:${kickId}`

          const sessionRaw = await redis.get(sessionKey)
          let pointsToAward = 0
          let minutesToAward = 0
          let sessionData: { start: number; lastAward: number }

          if (!sessionRaw) {
            // New session — first started minute = 2 pts
            sessionData = { start: now, lastAward: 0 }
            pointsToAward = 2
            minutesToAward = 1
          } else {
            sessionData = JSON.parse(sessionRaw)
            const minutesElapsed = Math.floor((now - sessionData.start) / 60)
            const newMinutes = minutesElapsed - sessionData.lastAward
            if (newMinutes > 0) {
              pointsToAward = newMinutes * 2
              minutesToAward = newMinutes
              sessionData.lastAward = minutesElapsed
            }
          }

          // Extend session TTL (10 min from this message)
          await redis.set(sessionKey, JSON.stringify(sessionData), "EX", SESSION_TTL)

          if (pointsToAward > 0) {
            const user = await User.findOneAndUpdate(
              { kickId },
              {
                $inc: { points: pointsToAward, watchTimeMinutes: minutesToAward },
                $set: {
                  kickUsername: username,
                  kickAvatar: sender.profile_picture || "",
                  lastActive: new Date(),
                },
              },
              { new: true, upsert: true, setDefaultsOnInsert: true }
            )

            if (user) {
              // Debounced stats push — max once per 10s
              const statsDebounce = await redis.get("stats:push-debounce")
              if (!statsDebounce) {
                await redis.set("stats:push-debounce", "1", "EX", 10)
                await redis.del("stats:global")
                await triggerUpdate("platform-updates", "stats-updated")
              }
            }
          } else {
            // No new points — still update lastActive
            await User.updateOne(
              { kickId },
              { $set: { kickUsername: username, kickAvatar: sender.profile_picture || "", lastActive: new Date() } }
            )
          }

          // ── GIVEAWAY: check if active and message matches phrase ──────────
          const activeGiveawayRaw = await redis.get("giveaway:active")
          if (activeGiveawayRaw) {
            try {
              const { id: giveawayId, phrase } = JSON.parse(activeGiveawayRaw)
              if (content.trim().toLowerCase() === phrase.trim().toLowerCase()) {
                // Deduplicate via Redis set (fast check before DB write)
                const redisKey = `giveaway:${giveawayId}:participants`
                const alreadyIn = await redis.sismember(redisKey, kickId)
                if (!alreadyIn) {
                  await redis.sadd(redisKey, kickId)
                  const updated = await Giveaway.findByIdAndUpdate(
                    giveawayId,
                    { $push: { participants: { kickId, username, enteredAt: new Date() } } },
                    { new: true }
                  )
                  if (updated) {
                    await Activity.create({
                      kickId,
                      type: "giveaway_entry",
                      title: "Udział w konkursie",
                      description: `Dołączono do konkursu: "${phrase}"`,
                    })

                    await triggerUpdate("platform-updates", "giveaway-updated", {
                      id: giveawayId,
                      status: updated.status,
                      participantCount: updated.participants.length,
                      newParticipant: { kickId, username, enteredAt: new Date().toISOString() },
                    })
                  }
                }
              }
            } catch (e) {
              console.error("[WEBHOOK] Giveaway error:", e)
            }
          }

          // ── BONUS GUESS: collect numeric guesses when round is active ─────
          const activeBonusRaw = await redis.get("bonus-guess:active")
          if (activeBonusRaw) {
            try {
              const { id: guessId, status: guessStatus } = JSON.parse(activeBonusRaw)
              if (guessStatus === "collecting") {
                // Strip common currency symbols/suffixes and normalize decimal separator
                // Accepts: 450 | 450.5 | 450,5 | $450 | 450$ | €450 | 450€ | 450 USD | 450 PLN | 450 EUR | 450zł | 450 zł
                const stripped = content.trim()
                  .replace(/^[$€]/, "")            // leading $ or €
                  .replace(/\s*(USD|PLN|EUR|zł|zl|usd|pln|eur)\s*$/i, "")  // trailing currency
                  .replace(/[$€]$/, "")            // trailing $ or €
                  .replace(",", ".")               // Polish decimal separator
                  .trim()
                const parsed = parseFloat(stripped)
                if (!isNaN(parsed) && parsed > 0 && /^\d+(\.\d+)?$/.test(stripped)) {
                  const dedupKey = `bonus-guess:${guessId}:guessed`
                  const alreadyGuessed = await redis.sismember(dedupKey, kickId)
                  if (!alreadyGuessed) {
                    await redis.sadd(dedupKey, kickId)
                    await BonusGuessEntry.create({ guessId, kickId, username, guess: parsed })

                    await Activity.create({
                      kickId,
                      type: "bonus_guess",
                      title: "Typowanie bonusu",
                      description: `Wytypowano kwotę ${parsed} ${JSON.parse(activeBonusRaw).currency || "USD"}`,
                    })

                    await triggerUpdate("platform-updates", "bonus-guess-updated", {
                      id: guessId,
                      status: "collecting",
                      newEntry: { username, guess: parsed },
                    })
                  }
                }
              }
            } catch (e) {
              console.error("[WEBHOOK] Bonus guess error:", e)
            }
          }

          break
        }

        case "channel.followed": {
          const follower = payload.follower
          if (follower?.user_id) {
            console.log(`[WEBHOOK] new follower: ${follower.username} (${follower.user_id})`)
          }
          break
        }

        case "livestream.status.updated": {
          // Kick payload: { broadcaster, is_live, title, started_at, ended_at }
          const streamData = {
            isLive: !!payload.is_live,
            title: payload.title || "",
            startedAt: payload.started_at || null,
            endedAt: payload.ended_at || null,
          }
          await redis.set("kick:stream-status", JSON.stringify(streamData), "EX", 300)
          // Invalidate the API-route cache so the next fetch reflects the change
          // immediately instead of serving stale data for up to 30s.
          const defaultChannel = process.env.NEXT_PUBLIC_KICK_CHANNEL_ID || process.env.KICK_CHANNEL_ID || "donkasjo"
          await redis.del(`kick:stream-status:api:${defaultChannel}`)
          await triggerUpdate("platform-updates", "stream-status-changed", streamData)
          break
        }

        default:
          console.log(`[WEBHOOK] unhandled event type: ${eventType}`)
          break
      }

      return NextResponse.json({ status: "success" })
    } catch (error: any) {
      console.error("[WEBHOOK] Critical error:", error.message)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
