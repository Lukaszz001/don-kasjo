import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { connectToDatabase } from "@/lib/db/mongodb"
import { Purchase } from "@/lib/db/models/purchase"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!user.isAdmin && !user.isDeveloper) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await connectToDatabase()
    // Mongoose populate can be tricky with different models, so we'll do it manually or via join if possible
    // Since we need kickUsername from User, and userId in Purchase is a ref to User
    const purchases = await Purchase.find()
      .sort({ createdAt: -1 })
      .populate("userId", "kickUsername kickAvatar email")
      .limit(100)
      .lean()

    return NextResponse.json({ purchases })
  } catch (error) {
    console.error("Error fetching purchases:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
