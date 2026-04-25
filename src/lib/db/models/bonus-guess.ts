import mongoose, { Schema, Document, Model } from "mongoose"

export type BonusGuessStatus = "collecting" | "locked" | "resolved"

export type BonusGuessCurrency = "USD" | "PLN"

export interface IBonusGuess extends Document {
  _id: mongoose.Types.ObjectId
  slotName: string
  currency: BonusGuessCurrency
  status: BonusGuessStatus
  result: number | null
  winnerKickId: string | null
  winnerUsername: string | null
  winnerGuess: number | null
  winnerDifference: number | null
  createdBy: string
  resolvedBy: string | null
  resolvedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const bonusGuessSchema = new Schema<IBonusGuess>(
  {
    slotName: { type: String, required: true },
    currency: { type: String, enum: ["USD", "PLN"], default: "USD" },
    status: {
      type: String,
      enum: ["collecting", "locked", "resolved"],
      default: "collecting",
    },
    result: { type: Number, default: null },
    winnerKickId: { type: String, default: null },
    winnerUsername: { type: String, default: null },
    winnerGuess: { type: Number, default: null },
    winnerDifference: { type: Number, default: null },
    createdBy: { type: String, required: true },
    resolvedBy: { type: String, default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

bonusGuessSchema.index({ status: 1, createdAt: -1 })

export const BonusGuess: Model<IBonusGuess> =
  mongoose.models.BonusGuess ||
  mongoose.model<IBonusGuess>("BonusGuess", bonusGuessSchema)
