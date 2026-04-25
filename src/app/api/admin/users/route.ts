import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/mongodb"
import { User } from "@/lib/db/models"
import { requireAdmin } from "@/lib/auth/session"

export async function GET() {
  try {
    await requireAdmin()
    await connectToDatabase()

    const users = await User.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean()

    return NextResponse.json({
      users: users.map((user) => ({
        ...user,
        _id: user._id.toString(),
      })),
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }
    console.error("Get users error:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}
