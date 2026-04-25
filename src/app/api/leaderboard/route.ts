import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/mongodb"
import { User } from "@/lib/db/models"
import { redis } from "@/lib/db/redis"

// Mock leaderboard data for when MongoDB is not configured
const mockLeaderboard = [
  { rank: 1, kickUsername: "StreamKing", kickAvatar: "", points: 15420, watchTimeMinutes: 3250 },
  { rank: 2, kickUsername: "NightOwl", kickAvatar: "", points: 12850, watchTimeMinutes: 5890 },
  { rank: 3, kickUsername: "GamerPro", kickAvatar: "", points: 11200, watchTimeMinutes: 2120 },
  { rank: 4, kickUsername: "ChatMaster", kickAvatar: "", points: 9870, watchTimeMinutes: 4890 },
  { rank: 5, kickUsername: "LoyalViewer", kickAvatar: "", points: 8540, watchTimeMinutes: 6250 },
  { rank: 6, kickUsername: "MidnightFan", kickAvatar: "", points: 7320, watchTimeMinutes: 3180 },
  { rank: 7, kickUsername: "StreamSniper", kickAvatar: "", points: 6890, watchTimeMinutes: 1950 },
  { rank: 8, kickUsername: "ContentKing", kickAvatar: "", points: 5420, watchTimeMinutes: 4720 },
  { rank: 9, kickUsername: "ViewerOne", kickAvatar: "", points: 4180, watchTimeMinutes: 2340 },
  { rank: 10, kickUsername: "ChatLurker", kickAvatar: "", points: 3250, watchTimeMinutes: 5980 },
]

export async function GET() {
  try {
    // 1. Try fetching from Redis first
    const cachedLeaderboard = await redis.get("leaderboard:top")
    if (cachedLeaderboard) {
      return NextResponse.json({ leaderboard: JSON.parse(cachedLeaderboard) })
    }

    const db = await connectToDatabase()
    
    // Return mock data if MongoDB is not configured
    if (!db) {
      return NextResponse.json({ leaderboard: mockLeaderboard })
    }

    // 2. Fetch from MongoDB
    const users = await User.find({})
      .select("kickUsername kickAvatar points watchTimeMinutes")
      .sort({ points: -1 })
      .limit(100)
      .lean()

    const formattedLeaderboard = users.map((user, index) => ({
      rank: index + 1,
      kickUsername: user.kickUsername,
      kickAvatar: user.kickAvatar,
      points: user.points,
      watchTimeMinutes: user.watchTimeMinutes,
    }))

    // 3. Save to Redis for 60 seconds
    await redis.set("leaderboard:top", JSON.stringify(formattedLeaderboard), "EX", 60)

    return NextResponse.json({
      leaderboard: formattedLeaderboard,
    })
  } catch (error) {
    console.error("Get leaderboard error:", error)
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    )
  }
}
