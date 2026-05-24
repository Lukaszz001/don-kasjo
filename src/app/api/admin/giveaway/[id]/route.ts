import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/mongodb"
import { Giveaway } from "@/lib/db/models"
import { redis } from "@/lib/db/redis"
import { requireAdmin } from "@/lib/auth/session"
import { z } from "zod"

const updateSchema = z.object({
  action: z.enum(["stop", "draw", "reset"]),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 })

    await connectToDatabase()

    const giveaway = await Giveaway.findById(id)
    if (!giveaway) return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 })

    const { action } = parsed.data

    if (action === "stop") {
      giveaway.status = "stopped"
      await redis.del("giveaway:active")
      await giveaway.save()

    }

    if (action === "draw") {
      if (giveaway.participants.length === 0) {
        return NextResponse.json({ error: "Brak uczestników do losowania" }, { status: 400 })
      }

      const randomIndex = Math.floor(Math.random() * giveaway.participants.length)
      const winner = giveaway.participants[randomIndex]

      giveaway.winner = winner
      giveaway.status = "drawn"
      giveaway.drawnAt = new Date()
      await redis.del("giveaway:active")
      await giveaway.save()

    }

    if (action === "reset") {
      giveaway.participants = []
      giveaway.winner = null
      giveaway.status = "collecting"
      giveaway.drawnAt = null
      await redis.del(`giveaway:${id}:participants`)
      await redis.set(
        "giveaway:active",
        JSON.stringify({ id: giveaway._id.toString(), phrase: giveaway.phrase })
      )
      await giveaway.save()

    }

    return NextResponse.json({
      giveaway: { ...giveaway.toObject(), _id: giveaway._id.toString() },
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      if (error.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    await connectToDatabase()

    const giveaway = await Giveaway.findById(id)
    if (!giveaway) return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 })

    // If deleting active giveaway, clear redis
    const active = await redis.get("giveaway:active")
    if (active) {
      const { id: activeId } = JSON.parse(active)
      if (activeId === id) {
        await redis.del("giveaway:active")
      }
    }

    await Giveaway.findByIdAndDelete(id)
    await redis.del(`giveaway:${id}:participants`)


    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      if (error.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
