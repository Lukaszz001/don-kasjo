import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { Activity } from "@/lib/db/models"
import { connectToDatabase } from "@/lib/db/mongodb"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const activities = await Activity.find({ kickId: user.kickId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    return NextResponse.json({
      activities: activities.map((a) => ({
        ...a,
        _id: a._id.toString(),
      })),
    })
  } catch (error) {
    console.error("Fetch activities error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
