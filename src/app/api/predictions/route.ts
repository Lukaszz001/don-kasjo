import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { connectToDatabase } from "@/lib/db/mongodb"
import { Prediction } from "@/lib/db/models"
import { requireModerator } from "@/lib/auth/session"

// Mock predictions data for when MongoDB is not configured
const mockPredictions = [
  {
    _id: "1",
    question: "Czy wygram nastepna runde?",
    option1: "Tak, na pewno!",
    option2: "Nie, przegra",
    status: "open",
    closesAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(), // 30 min from now
    createdBy: "Admin",
    option1Votes: 156,
    option2Votes: 89,
    option1Points: 45200,
    option2Points: 32100,
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "2",
    question: "Ile killsow zdobede w tej grze?",
    option1: "Wiecej niz 10",
    option2: "Mniej niz 10",
    status: "open",
    closesAt: new Date(Date.now() + 1000 * 60 * 15).toISOString(), // 15 min from now
    createdBy: "Admin",
    option1Votes: 78,
    option2Votes: 124,
    option1Points: 28900,
    option2Points: 41500,
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "3",
    question: "Czy stream potrwa dluzej niz 4 godziny?",
    option1: "Tak",
    option2: "Nie",
    status: "closed",
    closesAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    createdBy: "Admin",
    option1Votes: 234,
    option2Votes: 156,
    option1Points: 67800,
    option2Points: 45200,
    winner: "option1",
    notes: "",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
]

// GET all predictions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")

    const db = await connectToDatabase()

    // Return mock data if MongoDB is not configured
    if (!db) {
      let filteredPredictions = mockPredictions
      if (status) {
        filteredPredictions = mockPredictions.filter(p => p.status === status)
      }
      return NextResponse.json({ predictions: filteredPredictions })
    }

    const query: Record<string, unknown> = {}
    if (status) {
      query.status = status
    }

    const predictions = await Prediction.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return NextResponse.json({
      predictions: predictions.map((p) => ({
        ...p,
        _id: p._id.toString(),
      })),
    })
  } catch (error) {
    console.error("Get predictions error:", error)
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    )
  }
}

// POST create new prediction (admin only)
const createPredictionSchema = z.object({
  question: z.string().min(1).max(500),
  option1: z.string().min(1).max(200),
  option2: z.string().min(1).max(200),
  closesAt: z.string().datetime(),
  notes: z.string().max(1000).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await requireModerator()
    const body = await request.json()
    const data = createPredictionSchema.parse(body)

    await connectToDatabase()

    const prediction = await Prediction.create({
      question: data.question,
      option1: data.option1,
      option2: data.option2,
      closesAt: new Date(data.closesAt),
      notes: data.notes || "",
      createdBy: session.kickUsername,
      status: "open",
    })

    return NextResponse.json({
      prediction: {
        ...prediction.toObject(),
        _id: prediction._id.toString(),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Create prediction error:", error)
    return NextResponse.json(
      { error: "Failed to create prediction" },
      { status: 500 }
    )
  }
}
