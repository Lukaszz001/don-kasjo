import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { connectToDatabase } from "@/lib/db/mongodb"
import { ShopItem } from "@/lib/db/models"
import { requireAdmin } from "@/lib/auth/session"
import { triggerUpdate } from "@/lib/pusher-server"

// Mock shop items for when MongoDB is not configured
const mockShopItems = [
  {
    _id: "1",
    name: "Ekskluzywna emotka VIP",
    description: "Specjalna emotka dostepna tylko dla najaktywniejszych widzow.",
    price: 5000,
    imageUrl: "",
    stock: 50,
    isActive: true,
  },
  {
    _id: "2",
    name: "Odznaka Legendy",
    description: "Zlota odznaka wyswietlana przy Twoim nicku na czacie.",
    price: 10000,
    imageUrl: "",
    stock: 20,
    isActive: true,
  },
  {
    _id: "3",
    name: "Koszulka Streamera",
    description: "Oficjalna koszulka z logo kanalu. Rozmiary S-XXL.",
    price: 25000,
    imageUrl: "",
    stock: 10,
    isActive: true,
  },
  {
    _id: "4",
    name: "Kubek Premium",
    description: "Ceramiczny kubek z unikatowym designem.",
    price: 15000,
    imageUrl: "",
    stock: 15,
    isActive: true,
  },
]

// GET all shop items
export async function GET() {
  try {
    const db = await connectToDatabase()

    // Return mock data if MongoDB is not configured
    if (!db) {
      return NextResponse.json({ items: mockShopItems })
    }

    const items = await ShopItem.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      items: items.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })),
    })
  } catch (error) {
    console.error("Get shop items error:", error)
    return NextResponse.json(
      { error: "Failed to fetch shop items" },
      { status: 500 }
    )
  }
}

// POST create new shop item (admin only)
const createItemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  price: z.number().int().min(1),
  imageUrl: z.string().url().optional().or(z.literal("")),
  stock: z.number().int().min(0).nullable().optional(),
})

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const data = createItemSchema.parse(body)

    await connectToDatabase()

    const item = await ShopItem.create({
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl || "",
      stock: data.stock ?? null,
      isActive: true,
    })

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
    console.error("Create shop item error:", error)
    return NextResponse.json(
      { error: "Failed to create shop item" },
      { status: 500 }
    )
  }
}
