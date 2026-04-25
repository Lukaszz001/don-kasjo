import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/mongodb"
import { BonusGuess, BonusGuessEntry } from "@/lib/db/models"
import { redis } from "@/lib/db/redis"
import { requireModerator } from "@/lib/auth/session"
import { triggerUpdate } from "@/lib/pusher-server"
import { z } from "zod"

const updateSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("lock") }),
  z.object({ action: z.literal("resolve"), result: z.number().positive() }),
])

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireModerator()
    const { id } = await params
    await connectToDatabase()

    const [round, entries] = await Promise.all([
      BonusGuess.findById(id).lean(),
      BonusGuessEntry.find({ guessId: id })
        .sort({ difference: 1, createdAt: 1 })
        .lean(),
    ])

    if (!round) return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 })

    return NextResponse.json({
      round: { ...round, _id: round._id.toString() },
      entries: entries.map((e) => ({
        ...e,
        _id: e._id.toString(),
        guessId: e.guessId.toString(),
      })),
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      if (error.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireModerator()
    const { id } = await params
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 })

    await connectToDatabase()

    const round = await BonusGuess.findById(id)
    if (!round) return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 })

    if (parsed.data.action === "lock") {
      round.status = "locked"
      await redis.del("bonus-guess:active")
      await round.save()

      await triggerUpdate("platform-updates", "bonus-guess-updated", {
        id: round._id.toString(),
        status: "locked",
      })
    }

    if (parsed.data.action === "resolve") {
      const { result } = parsed.data

      const entries = await BonusGuessEntry.find({ guessId: id })

      if (entries.length > 0) {
        // Calculate difference for each entry and sort ascending
        const withDiff = entries
          .map((e) => ({ entry: e, difference: Math.abs(e.guess - result) }))
          .sort((a, b) => a.difference - b.difference)

        // Assign rank and difference
        await Promise.all(
          withDiff.map(({ entry, difference }, index) => {
            entry.difference = difference
            entry.rank = index + 1
            return entry.save()
          })
        )

        const top = withDiff[0]
        round.winnerKickId = top.entry.kickId
        round.winnerUsername = top.entry.username
        round.winnerGuess = top.entry.guess
        round.winnerDifference = top.difference
      }

      round.status = "resolved"
      round.result = result
      round.resolvedBy = session.kickUsername
      round.resolvedAt = new Date()
      await redis.del("bonus-guess:active")
      await round.save()

      await triggerUpdate("platform-updates", "bonus-guess-updated", {
        id: round._id.toString(),
        status: "resolved",
        result,
        winner: round.winnerUsername
          ? {
              username: round.winnerUsername,
              guess: round.winnerGuess,
              difference: round.winnerDifference,
            }
          : null,
      })
    }

    return NextResponse.json({ round: { ...round.toObject(), _id: round._id.toString() } })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      if (error.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireModerator()
    const { id } = await params
    await connectToDatabase()

    const round = await BonusGuess.findById(id)
    if (!round) return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 })

    // If deleting active round, clear redis
    const active = await redis.get("bonus-guess:active")
    if (active) {
      const { id: activeId } = JSON.parse(active)
      if (activeId === id) {
        await redis.del("bonus-guess:active")
      }
    }

    await BonusGuess.findByIdAndDelete(id)
    await BonusGuessEntry.deleteMany({ guessId: id })
    await redis.del(`bonus-guess:${id}:guessed`)

    await triggerUpdate("platform-updates", "bonus-guess-updated", {
      id,
      action: "deleted"
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      if (error.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
