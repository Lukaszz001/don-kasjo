import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/mongodb"
import { User } from "@/lib/db/models"
import { requireAuth } from "@/lib/auth/session"
import { redis } from "@/lib/db/redis"

export async function POST() {
  try {
    const session = await requireAuth()
    
    // Check if there is actually an ongoing streak
    const streakKey = `user:${session.userId}:afk_streak`
    const streakStr = await redis.get(streakKey)
    let streak = 0
    if (streakStr) {
      streak = parseInt(streakStr)
    }

    if (streak < 10) {
      return NextResponse.json(
        { error: "No required AFK check at this time." },
        { status: 400 }
      )
    }

    // Reset the streak
    await redis.set(streakKey, "0", "EX", 3600)

    // Grant 2 points and 1 watchTimeMinute to make up for the popup minute
    await connectToDatabase()
    
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

    // Refresh last watch to now
    const lastWatchKey = `user:${session.userId}:last_watch`
    const nowSeconds = Math.floor(Date.now() / 1000)
    await redis.set(lastWatchKey, nowSeconds.toString(), "EX", 120)

    return NextResponse.json({
      status: "SUCCESS",
      pointsAdded: 2,
      totalPoints: user.points,
      watchTimeMinutes: user.watchTimeMinutes
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }
    console.error("AFK Verify error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
