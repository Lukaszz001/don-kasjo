import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/mongodb"
import { BonusGuess } from "@/lib/db/models"
import { redis } from "@/lib/db/redis"
import { requireModerator } from "@/lib/auth/session"
import { triggerUpdate } from "@/lib/pusher-server"
import { z } from "zod"

const createSchema = z.object({
  slotName: z.string().min(1).max(100),
  currency: z.enum(["USD", "PLN", "EUR"]).default("USD"),
})

export async function GET() {
  try {
    await requireModerator()
    await connectToDatabase()

    const rounds = await BonusGuess.find({}).sort({ createdAt: -1 }).limit(20).lean()

    return NextResponse.json({
      rounds: rounds.map((r) => ({ ...r, _id: r._id.toString() })),
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
    const session = await requireModerator()
    const body = await req.json()

    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 })

    await connectToDatabase()

    const round = await BonusGuess.create({
      slotName: parsed.data.slotName,
      currency: parsed.data.currency,
      status: "collecting",
      createdBy: session.kickUsername,
    })

    await redis.set(
      "bonus-guess:active",
      JSON.stringify({ id: round._id.toString(), status: "collecting", currency: parsed.data.currency })
    )

    await triggerUpdate("platform-updates", "bonus-guess-updated", {
      id: round._id.toString(),
      status: "collecting",
      slotName: parsed.data.slotName,
      currency: parsed.data.currency,
    })

    return NextResponse.json({ round: { ...round.toObject(), _id: round._id.toString() } })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      if (error.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
