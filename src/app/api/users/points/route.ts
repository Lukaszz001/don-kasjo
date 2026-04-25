import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { connectToDatabase } from "@/lib/db/mongodb"
import { User } from "@/lib/db/models"

const POINTS_WEBHOOK_SECRET = process.env.POINTS_WEBHOOK_SECRET

const addPointsSchema = z.object({
  apiKey: z.string(),
  kickUsername: z.string(),
  minutesWatched: z.number().int().min(0).optional(),
  pointsToAdd: z.number().int().min(0),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = addPointsSchema.parse(body)

    // Verify API key
    if (!POINTS_WEBHOOK_SECRET || data.apiKey !== POINTS_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    await connectToDatabase()

    // Find user by Kick username
    const user = await User.findOne({ kickUsername: data.kickUsername })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user points and watch time
    user.points += data.pointsToAdd
    if (data.minutesWatched) {
      user.watchTimeMinutes += data.minutesWatched
    }
    await user.save()

    return NextResponse.json({
      success: true,
      kickUsername: user.kickUsername,
      newPoints: user.points,
      newWatchTime: user.watchTimeMinutes,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Add points error:", error)
    return NextResponse.json(
      { error: "Failed to add points" },
      { status: 500 }
    )
  }
}
