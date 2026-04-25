import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { connectToDatabase } from "@/lib/db/mongodb"
import { Instruction } from "@/lib/db/models"
import { requireAdmin } from "@/lib/auth/session"

// Mock instructions data for when MongoDB is not configured
const mockInstructions = [
  {
    _id: "1",
    slug: "jak-zdobywac-punkty",
    title: "Jak zdobywac punkty",
    shortDescription: "Dowiedz sie jak zdobywac punkty ogladajac transmisje i uczestniczac w aktywnosciach.",
    imageUrl: "",
  },
  {
    _id: "2",
    slug: "system-nagrod",
    title: "System nagrod",
    shortDescription: "Poznaj dostepne nagrody i sposob ich wymiany za zebrane punkty.",
    imageUrl: "",
  },
  {
    _id: "3",
    slug: "predykcje-poradnik",
    title: "Predykcje - poradnik",
    shortDescription: "Naucz sie jak uczestniczyc w predykcjach i zwiekszyc swoje szanse na wygrana.",
    imageUrl: "",
  },
]

// GET all instructions
export async function GET() {
  try {
    const db = await connectToDatabase()

    // Return mock data if MongoDB is not configured
    if (!db) {
      return NextResponse.json({ instructions: mockInstructions })
    }

    const instructions = await Instruction.find({ isPublished: true })
      .select("slug title shortDescription imageUrl")
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      instructions: instructions.map((i) => ({
        ...i,
        _id: i._id.toString(),
      })),
    })
  } catch (error) {
    console.error("Get instructions error:", error)
    return NextResponse.json(
      { error: "Failed to fetch instructions" },
      { status: 500 }
    )
  }
}

// POST create instruction (admin only)
const createInstructionSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  shortDescription: z.string().min(1).max(500),
  imageUrl: z.string().url().optional().or(z.literal("")),
  htmlContent: z.string(),
  isPublished: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const data = createInstructionSchema.parse(body)

    await connectToDatabase()

    // Check if slug already exists
    const existing = await Instruction.findOne({ slug: data.slug })
    if (existing) {
      return NextResponse.json(
        { error: "Instruction with this slug already exists" },
        { status: 400 }
      )
    }

    const instruction = await Instruction.create({
      slug: data.slug,
      title: data.title,
      shortDescription: data.shortDescription,
      imageUrl: data.imageUrl || "",
      htmlContent: data.htmlContent,
      isPublished: data.isPublished ?? false,
    })

    return NextResponse.json({
      instruction: {
        ...instruction.toObject(),
        _id: instruction._id.toString(),
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
    console.error("Create instruction error:", error)
    return NextResponse.json(
      { error: "Failed to create instruction" },
      { status: 500 }
    )
  }
}
