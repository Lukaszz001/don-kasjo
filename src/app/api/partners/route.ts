import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { connectToDatabase } from "@/lib/db/mongodb"
import { PartnerSite } from "@/lib/db/models"
import { requireAdmin } from "@/lib/auth/session"
import { triggerUpdate } from "@/lib/pusher-server"

// Mock partners data for when MongoDB is not configured
const mockPartners = [
  {
    _id: "1",
    name: "StreamGear Pro",
    imageUrl: "",
    bonus: "20% zniżki",
    description: "Profesjonalny sprzęt do streamingu",
    code: "KICKPRO20",
    link: "https://example.com/streamgear",
    order: 1,
    isActive: true,
  },
  {
    _id: "2",
    name: "GameZone",
    imageUrl: "",
    bonus: "Darmowa dostawa",
    description: "Najlepsze gry i akcesoria",
    code: null,
    link: "https://example.com/gamezone",
    order: 2,
    isActive: true,
  },
  {
    _id: "3",
    name: "TechHub",
    imageUrl: "",
    bonus: "10% cashback",
    description: "Elektronika i gadżety",
    code: "TECH10",
    link: "https://example.com/techhub",
    order: 3,
    isActive: true,
  },
]

// GET all partners
export async function GET() {
  try {
    const db = await connectToDatabase()

    // Return mock data if MongoDB is not configured
    if (!db) {
      return NextResponse.json({ partners: mockPartners })
    }

    const partners = await PartnerSite.find({ isActive: true })
      .sort({ order: 1 })
      .lean()

    return NextResponse.json({
      partners: partners.map((p) => ({
        ...p,
        _id: p._id.toString(),
      })),
    })
  } catch (error) {
    console.error("Get partners error:", error)
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 }
    )
  }
}

// POST create partner (admin only)
const createPartnerSchema = z.object({
  name: z.string().min(1).max(200),
  imageUrl: z.string().url().optional().or(z.literal("")),
  bonus: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  code: z.string().max(100).optional().nullable(),
  link: z.string().url(),
  order: z.number().int().optional(),
})

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const data = createPartnerSchema.parse(body)

    await connectToDatabase()

    const partner = await PartnerSite.create({
      name: data.name,
      imageUrl: data.imageUrl || "",
      bonus: data.bonus,
      description: data.description || "",
      code: data.code || null,
      link: data.link,
      order: data.order || 0,
      isActive: true,
    })

    // Trigger real-time update
    await triggerUpdate("platform-updates", "partners-updated")

    return NextResponse.json({
      partner: {
        ...partner.toObject(),
        _id: partner._id.toString(),
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
    console.error("Create partner error:", error)
    return NextResponse.json(
      { error: "Failed to create partner" },
      { status: 500 }
    )
  }
}
