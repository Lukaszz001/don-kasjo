import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { User } from "@/lib/db/models"
import { connectToDatabase } from "@/lib/db/mongodb"
import { redis } from "@/lib/db/redis"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { user: null },
        {
          headers: {
            "Cache-Control": "no-store, max-age=0, must-revalidate",
          },
        }
      )
    }

    // 1. Try to get rank from Redis cache first
    const cacheKey = `user:rank:${user._id}`
    const cachedRank = await redis.get(cacheKey)
    let finalRank: number

    if (cachedRank) {
      finalRank = parseInt(cachedRank)
    } else {
      // 2. If not in cache, calculate rank from MongoDB
      await connectToDatabase()
      finalRank = (await User.countDocuments({ points: { $gt: user.points } })) + 1
      
      // 3. Cache the rank for 60 seconds
      await redis.set(cacheKey, finalRank.toString(), "EX", 60)
    }

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          kickId: user.kickId,
          kickUsername: user.kickUsername,
          kickAvatar: user.kickAvatar,
          points: user.points,
          watchTimeMinutes: user.watchTimeMinutes,
          isAdmin: user.isAdmin,
          isDeveloper: user.isDeveloper || false,
          stakeUsername: user.stakeUsername,
          isStakeVerified: user.isStakeVerified,
          lastStakeVerificationDate: user.lastStakeVerificationDate,
          rank: finalRank,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    )
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json(
      { user: null },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    )
  }
}
