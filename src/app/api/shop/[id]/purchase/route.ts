import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/db/mongodb"
import { ShopItem, User, Purchase, Activity } from "@/lib/db/models"
import { requireAuth } from "@/lib/auth/session"

/**
 * Purchase a shop item.
 *
 * Implementation note: we deliberately avoid `mongoose.startSession()` /
 * `withTransaction(...)` here, because multi-document transactions in MongoDB
 * require a replica set. On a standalone deployment (typical for local dev)
 * the whole transaction throws and the route fails silently with a 500,
 * which previously caused points not to be deducted AND no purchase/activity
 * log to be written.
 *
 * Instead we use conditional atomic updates and compensate on failure.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 })
    }

    await connectToDatabase()

    // 1. Load item up front so we know the price and can validate availability.
    const item = await ShopItem.findById(id)
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 400 })
    }
    if (!item.isActive) {
      return NextResponse.json(
        { error: "Item is not available" },
        { status: 400 }
      )
    }
    if (item.stock !== null && item.stock <= 0) {
      return NextResponse.json(
        { error: "Item is out of stock" },
        { status: 400 }
      )
    }

    const price = item.price

    // 2. Atomically decrement user's points only if they have enough.
    //    This prevents race conditions and double-spending.
    const updatedUser = await User.findOneAndUpdate(
      { _id: session.userId, points: { $gte: price } },
      { $inc: { points: -price } },
      { new: true }
    )

    if (!updatedUser) {
      // Either user doesn't exist or doesn't have enough points.
      const exists = await User.exists({ _id: session.userId })
      if (!exists) {
        return NextResponse.json({ error: "User not found" }, { status: 400 })
      }
      return NextResponse.json(
        { error: "Insufficient points" },
        { status: 400 }
      )
    }

    // 3. If the item has limited stock, atomically decrement it.
    //    On failure, refund the user's points (compensation).
    if (item.stock !== null) {
      const updatedItem = await ShopItem.findOneAndUpdate(
        { _id: id, isActive: true, stock: { $gt: 0 } },
        { $inc: { stock: -1 } },
        { new: true }
      )

      if (!updatedItem) {
        // Race lost - someone bought the last unit. Refund.
        await User.updateOne(
          { _id: session.userId },
          { $inc: { points: price } }
        )
        return NextResponse.json(
          { error: "Item is out of stock" },
          { status: 400 }
        )
      }
    }

    // 4. Create the purchase record. If this fails, refund + restore stock.
    let purchaseDoc
    try {
      purchaseDoc = await Purchase.create({
        userId: session.userId,
        itemId: id,
        itemName: item.name,
        pointsSpent: price,
        status: "pending",
      })
    } catch (err) {
      await User.updateOne(
        { _id: session.userId },
        { $inc: { points: price } }
      )
      if (item.stock !== null) {
        await ShopItem.updateOne({ _id: id }, { $inc: { stock: 1 } })
      }
      throw err
    }

    // 5. Best-effort activity log. Don't roll back the purchase if this fails
    //    - the purchase itself is the source of truth and is still recorded.
    try {
      await Activity.create({
        kickId: updatedUser.kickId,
        type: "shop_purchase",
        title: "Zakup w sklepie",
        description: `Zakupiono przedmiot: "${item.name}" za ${price} pkt`,
        pointsChange: -price,
      })
    } catch (err) {
      console.error("Failed to write shop_purchase activity:", err)
    }

    return NextResponse.json({
      purchase: {
        ...purchaseDoc.toObject(),
        _id: purchaseDoc._id.toString(),
      },
      newBalance: updatedUser.points,
    })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Purchase error:", error)
    return NextResponse.json(
      { error: "Failed to purchase item" },
      { status: 500 }
    )
  }
}
