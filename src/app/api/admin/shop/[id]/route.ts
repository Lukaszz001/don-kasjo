import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/db/mongodb"
import { ShopItem } from "@/lib/db/models"
import { requireAdmin } from "@/lib/auth/session"
import { triggerUpdate } from "@/lib/pusher-server"

const updateItemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(1000).optional(),
  price: z.number().int().min(1).optional(),
  imageUrl: z.string().optional(),
  stock: z.number().int().min(0).nullable().optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const data = updateItemSchema.parse(body)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 })
    }

    await connectToDatabase()

    const item = await ShopItem.findByIdAndUpdate(id, data, { new: true })
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    await triggerUpdate("platform-updates", "shop-updated")

    return NextResponse.json({
      item: {
        ...item.toObject(),
        _id: item._id.toString(),
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
    console.error("Update shop item error:", error)
    return NextResponse.json(
      { error: "Failed to update shop item" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 })
    }

    await connectToDatabase()

    const item = await ShopItem.findByIdAndDelete(id)
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    await triggerUpdate("platform-updates", "shop-updated")

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }
    console.error("Delete shop item error:", error)
    return NextResponse.json(
      { error: "Failed to delete shop item" },
      { status: 500 }
    )
  }
}
