import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/db/mongodb"
import { User } from "@/lib/db/models"
import { requireAdmin } from "@/lib/auth/session"

const updateUserSchema = z.object({
  isAdmin: z.boolean().optional(),
  isModerator: z.boolean().optional(),
  pointsToAdd: z.number().int().optional(),
  points: z.number().int().min(0).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const data = updateUserSchema.parse(body)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    await connectToDatabase()

    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (data.isAdmin !== undefined) {
      user.isAdmin = data.isAdmin
    }

    if (data.isModerator !== undefined) {
      user.isModerator = data.isModerator
    }

    if (data.pointsToAdd !== undefined) {
      user.points += data.pointsToAdd
    }

    if (data.points !== undefined) {
      user.points = data.points
    }

    await user.save()

    return NextResponse.json({
      user: {
        ...user.toObject(),
        _id: user._id.toString(),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }
    console.error("Update user error:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}
