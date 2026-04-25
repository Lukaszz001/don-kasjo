import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/db/mongodb"
import { ShopItem, User, Purchase, Activity } from "@/lib/db/models"
import { requireAuth } from "@/lib/auth/session"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const mongoSession = await mongoose.startSession()

    try {
      let result: { purchase: unknown; newBalance: number } | null = null

      await mongoSession.withTransaction(async () => {
        // Get shop item
        const item = await ShopItem.findById(id).session(mongoSession)
        if (!item) {
          throw new Error("Item not found")
        }

        if (!item.isActive) {
          throw new Error("Item is not available")
        }

        if (item.stock !== null && item.stock <= 0) {
          throw new Error("Item is out of stock")
        }

        // Get user
        const user = await User.findById(session.userId).session(mongoSession)
        if (!user) {
          throw new Error("User not found")
        }

        if (user.points < item.price) {
          throw new Error("Insufficient points")
        }

        // Deduct points
        user.points -= item.price
        await user.save({ session: mongoSession })

        // Reduce stock if applicable
        if (item.stock !== null) {
          item.stock -= 1
          await item.save({ session: mongoSession })
        }

        // Create purchase record
        const purchase = await Purchase.create(
          [
            {
              userId: session.userId,
              itemId: id,
              itemName: item.name,
              pointsSpent: item.price,
              status: "pending",
            },
          ],
          { session: mongoSession }
        )

        // Record activity
        await Activity.create([
          {
            kickId: user.kickId,
            type: "shop_purchase",
            title: "Zakup w sklepie",
            description: `Zakupiono przedmiot: "${item.name}" za ${item.price} pkt`,
            pointsChange: -item.price,
          }
        ], { session: mongoSession })

        result = {
          purchase: {
            ...purchase[0].toObject(),
            _id: purchase[0]._id.toString(),
          },
          newBalance: user.points,
        }
      })

      return NextResponse.json(result)
    } finally {
      mongoSession.endSession()
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      if (
        [
          "Item not found",
          "Item is not available",
          "Item is out of stock",
          "Insufficient points",
          "User not found",
        ].includes(error.message)
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }
    console.error("Purchase error:", error)
    return NextResponse.json(
      { error: "Failed to purchase item" },
      { status: 500 }
    )
  }
}
