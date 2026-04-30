import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/db/mongodb"
import { Prediction, User, UserBet } from "@/lib/db/models"
import { requireAdmin } from "@/lib/auth/session"
import { triggerUpdate } from "@/lib/pusher-server"

const resolveSchema = z.object({
  winningOption: z.union([z.literal(1), z.literal(2)]),
})

const refundSchema = z.object({
  action: z.literal("refund"),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id } = await params
    const body = await request.json()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid prediction ID" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const prediction = await Prediction.findById(id)
    if (!prediction) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      )
    }

    if (prediction.status !== "open" && prediction.status !== "closed") {
      return NextResponse.json(
        { error: "Prediction already resolved or refunded" },
        { status: 400 }
      )
    }

    // Check if this is a refund request
    const refundResult = refundSchema.safeParse(body)
    if (refundResult.success) {
      const bets = await UserBet.find({ predictionId: id })
      const dbSession = await mongoose.startSession()

      try {
        await dbSession.withTransaction(async () => {
          for (const bet of bets) {
            await User.findByIdAndUpdate(bet.userId, { $inc: { points: bet.amount } }, { session: dbSession })
            await UserBet.findByIdAndUpdate(bet._id, { won: null, payout: bet.amount }, { session: dbSession })
          }
          await Prediction.findByIdAndUpdate(id, {
            status: "refunded",
            resolvedAt: new Date(),
            resolvedBy: session.kickUsername,
          }, { session: dbSession })
        })
      } finally {
        await dbSession.endSession()
      }

      await triggerUpdate("platform-updates", "predictions-updated")
      await triggerUpdate("platform-updates", "leaderboard-updated")

      return NextResponse.json({
        message: "Prediction refunded",
        refundedBets: bets.length,
      })
    }

    // Resolve with winning option
    const data = resolveSchema.parse(body)
    const totalPool = prediction.totalPointsOption1 + prediction.totalPointsOption2
    const winningPool =
      data.winningOption === 1
        ? prediction.totalPointsOption1
        : prediction.totalPointsOption2

    const bets = await UserBet.find({ predictionId: id })
    const dbSession = await mongoose.startSession()

    try {
      await dbSession.withTransaction(async () => {
        for (const bet of bets) {
          if (bet.option === data.winningOption) {
            const payout = winningPool > 0
              ? Math.floor((bet.amount / winningPool) * totalPool)
              : bet.amount
            await User.findByIdAndUpdate(bet.userId, { $inc: { points: payout } }, { session: dbSession })
            await UserBet.findByIdAndUpdate(bet._id, { won: true, payout }, { session: dbSession })
          } else {
            await UserBet.findByIdAndUpdate(bet._id, { won: false, payout: 0 }, { session: dbSession })
          }
        }
        await Prediction.findByIdAndUpdate(id, {
          status: "resolved",
          winningOption: data.winningOption,
          resolvedAt: new Date(),
          resolvedBy: session.kickUsername,
        }, { session: dbSession })
      })
    } finally {
      await dbSession.endSession()
    }

    await triggerUpdate("platform-updates", "predictions-updated")
    await triggerUpdate("platform-updates", "leaderboard-updated")

    return NextResponse.json({
      message: "Prediction resolved",
      winningOption: data.winningOption,
      totalPool,
      winningPool,
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
    console.error("Resolve prediction error:", error)
    return NextResponse.json(
      { error: "Failed to resolve prediction" },
      { status: 500 }
    )
  }
}
