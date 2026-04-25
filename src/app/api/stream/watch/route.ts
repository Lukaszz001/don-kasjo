import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/mongodb"
import { User } from "@/lib/db/models"
import { requireAuth } from "@/lib/auth/session"
import { redis } from "@/lib/db/redis"

export async function POST(req: Request) {
  try {
    const session = await requireAuth()
    
    // Check rate limit: 1 request per ~58 seconds max
    const lastWatchKey = `user:${session.userId}:last_watch`
    const lastWatchSeconds = await redis.get(lastWatchKey)
    const nowSeconds = Math.floor(Date.now() / 1000)

    if (lastWatchSeconds && (nowSeconds - parseInt(lastWatchSeconds)) < 58) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Wait 60 seconds." },
        { status: 429 }
      )
    }

    // Set new last watch time
    await redis.set(lastWatchKey, nowSeconds.toString(), "EX", 120) // expires in 2 minutes
    
    // Read activity from request
    const { activeOnChat } = await req.json().catch(() => ({ activeOnChat: false }))

    // Track AFK streak
    const streakKey = `user:${session.userId}:afk_streak`
    let streak = 0
    const streakStr = await redis.get(streakKey)
    if (streakStr) {
      streak = parseInt(streakStr)
    }

    if (activeOnChat) {
      // User is active on chat, so we reset or don't increase the streak
      streak = 0
      await redis.set(streakKey, "0", "EX", 3600)
    } else {
      streak += 1
      await redis.set(streakKey, streak.toString(), "EX", 3600) 
    }

    if (streak >= 10) {
      return NextResponse.json({ 
        status: "AFK_CHECK_REQUIRED",
        streak 
      })
    }

    // Verify stream is live from Kick API
    // Optional: we can fetch stream status via Kick API to see if stream is live
    // For now we assume if user has watcher active on the website frontend, they are watching

    // Grant 2 points and 1 watchTimeMinute
    await connectToDatabase()
    
    // Use atomic update
    const user = await User.findByIdAndUpdate(
      session.userId,
      { 
        $inc: { points: 2, watchTimeMinutes: 1 }
      },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      status: "SUCCESS",
      pointsAdded: 2,
      totalPoints: user.points,
      watchTimeMinutes: user.watchTimeMinutes,
      streak
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }
    console.error("Watch time error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
