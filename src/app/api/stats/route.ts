import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/mongodb"
import { User } from "@/lib/db/models"
import { getAppAccessToken } from "@/lib/auth/kick"
import { redis } from "@/lib/db/redis"
import { getCurrentUser } from "@/lib/auth/session"
import { getConfig, CONFIG_KEYS } from "@/lib/config"
import { serverFetch } from "@/lib/server-fetch"

const DEFAULT_KICK_CHANNEL = process.env.NEXT_PUBLIC_KICK_CHANNEL_ID || process.env.KICK_CHANNEL_ID || "donkasjo"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const user = await getCurrentUser()
    const isDev = user?.isDeveloper || user?.isAdmin
    const configChannel = isDev ? await getConfig(CONFIG_KEYS.KICK_CHANNEL_ID, DEFAULT_KICK_CHANNEL) : DEFAULT_KICK_CHANNEL

    // 1. Try fetching from Redis cache first
    // Note: for devs we might want to bypass cache to see changes immediately
    const cacheKey = isDev ? `stats:global:dev:${user?._id}` : "stats:global"
    const cachedStats = await redis.get(cacheKey)
    if (cachedStats) {
      return NextResponse.json(JSON.parse(cachedStats), {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      })
    }

    await connectToDatabase()

    // 2. Fetch total points and users from our database
    const [pointsResult, totalUsers] = await Promise.all([
      User.aggregate([
        { $group: { _id: null, totalPoints: { $sum: "$points" } } }
      ]),
      User.countDocuments()
    ])

    const totalPoints = pointsResult.length > 0 ? pointsResult[0].totalPoints : 0

    // 3. Try fetching kick subscribers
    let kickSubscribers = 0
    try {
      const token = await getAppAccessToken()
      const params = new URLSearchParams()
      params.append("slug", configChannel)

      const response = await serverFetch(
        `https://api.kick.com/public/v1/channels?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      
      if (response.ok) {
        const json = await response.json()
        const data = json.data?.[0]
        if (data && data.active_subscribers_count) {
          kickSubscribers = data.active_subscribers_count
        }
      }
    } catch (e) {
      console.warn("Could not fetch kick subscribers for stats", e)
    }

    const stats = {
      pointsInCirculation: totalPoints,
      totalUsers: totalUsers,
      kickSubscribers: kickSubscribers
    }

    // 4. Save to Redis cache for 60 seconds
    await redis.set(cacheKey, JSON.stringify(stats), "EX", 15)

    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Failed to fetch global stats:", error)
    return NextResponse.json({
      pointsInCirculation: 0,
      totalUsers: 0,
      kickSubscribers: 0
    }, { 
      status: 500,
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    })
  }
}
