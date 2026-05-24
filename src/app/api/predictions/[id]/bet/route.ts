import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/db/mongodb"
import { Prediction, User, UserBet, Activity } from "@/lib/db/models"
import { requireAuth } from "@/lib/auth/session"
import { rateLimit } from "@/lib/db/redis"

const betSchema = z.object({
  option: z.union([z.literal(1), z.literal(2)]),
  amount: z.number().int().min(1).max(100000),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const rl = await rateLimit(`bet:${session.userId}`, 10, 60)
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const body = await request.json()
    const data = betSchema.parse(body)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid prediction ID" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // 1. Get prediction & check status
    const prediction = await Prediction.findById(id)
    if (!prediction) {
      return NextResponse.json({ error: "Prediction not found" }, { status: 404 })
    }

    if (prediction.status !== "open") {
      return NextResponse.json({ error: "Prediction is not open for betting" }, { status: 400 })
    }

    if (new Date() > prediction.closesAt) {
      return NextResponse.json({ error: "Betting has closed" }, { status: 400 })
    }

    // 2. Check if user already bet on this prediction
    const existingBet = await UserBet.findOne({
      predictionId: id,
      userId: session.userId,
    })

    if (existingBet) {
      return NextResponse.json({ error: "Already placed a bet on this prediction" }, { status: 400 })
    }

    // 3. Try to deduct points atomically using findOneAndUpdate with condition
    const user = await User.findOneAndUpdate(
      { _id: session.userId, points: { $gte: data.amount } },
      { $inc: { points: -data.amount } },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ error: "Insufficient points or user not found" }, { status: 400 })
    }

    try {
      // 4. Create bet
      const [bet] = await UserBet.create([
        {
          predictionId: id,
          userId: session.userId,
          option: data.option,
          amount: data.amount,
        }
      ])

      // 5. Update prediction totals atomically
      const updateData = data.option === 1 
        ? { $inc: { totalPointsOption1: data.amount, totalBetsOption1: 1 } }
        : { $inc: { totalPointsOption2: data.amount, totalBetsOption2: 1 } }
      
      await Prediction.findByIdAndUpdate(id, updateData)

      // 6. Record activity
      await Activity.create([
        {
          kickId: user.kickId,
          type: "prediction_bet",
          title: "Zakład na predykcję",
          description: `Obstawiono ${data.amount} pkt na opcję ${data.option === 1 ? prediction.option1 : prediction.option2} w: "${prediction.question}"`,
          pointsChange: -data.amount,
        }
      ])


      return NextResponse.json({
        bet: {
          ...bet.toObject(),
          _id: bet._id.toString(),
        },
        newBalance: user.points,
      })
    } catch (betError) {
      // Critical cleanup: If bet creation or prediction update fails, refund the user
      // This is a manual fallback for missing transactions
      await User.findByIdAndUpdate(session.userId, { $inc: { points: data.amount } })
      console.error("Critical bet error, refunded user:", betError)
      throw betError
    }
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
      if (
        [
          "Prediction not found",
          "Already placed a bet on this prediction",
          "Prediction is not open for betting",
          "Betting has closed",
          "Insufficient points",
          "User not found",
        ].includes(error.message)
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }
    console.error("Place bet error:", error)
    return NextResponse.json(
      { error: "Failed to place bet" },
      { status: 500 }
    )
  }
}
