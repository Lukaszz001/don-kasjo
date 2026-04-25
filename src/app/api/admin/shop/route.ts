import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/mongodb"
import { ShopItem } from "@/lib/db/models"
import { requireAdmin } from "@/lib/auth/session"

export async function GET() {
  try {
    await requireAdmin()
    await connectToDatabase()

    const items = await ShopItem.find({})
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      items: items.map((item) => ({
        ...item,
        _id: item._id.toString(),
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
    console.error("Get shop items error:", error)
    return NextResponse.json(
      { error: "Failed to fetch shop items" },
      { status: 500 }
    )
  }
}
