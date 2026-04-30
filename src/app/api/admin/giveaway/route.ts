import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/mongodb"
import { Giveaway } from "@/lib/db/models"
import { redis } from "@/lib/db/redis"
import { requireAdmin } from "@/lib/auth/session"
import { triggerUpdate } from "@/lib/pusher-server"
import { z } from "zod"

const createSchema = z.object({
  phrase: z.string().min(1).max(200),
})

export async function GET() {
  try {
    await requireAdmin()
    await connectToDatabase()

    const giveaways = await Giveaway.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    return NextResponse.json({
      giveaways: giveaways.map((g) => ({
        ...g,
        _id: g._id.toString(),
        participantCount: g.participants?.length ?? 0,
      })),
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      if (error.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin()
    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 })

    await connectToDatabase()

    const giveaway = await Giveaway.create({
      phrase: parsed.data.phrase,
      status: "collecting",
      participants: [],
      winner: null,
      createdBy: session.kickUsername,
    })

    // Cache active giveaway for webhook fast lookup
    await redis.set(
      "giveaway:active",
      JSON.stringify({ id: giveaway._id.toString(), phrase: parsed.data.phrase })
    )

    await triggerUpdate("platform-updates", "giveaway-updated", {
      id: giveaway._id.toString(),
      status: "collecting",
      participantCount: 0,
    })

    return NextResponse.json({ giveaway: { ...giveaway.toObject(), _id: giveaway._id.toString() } })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      if (error.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
