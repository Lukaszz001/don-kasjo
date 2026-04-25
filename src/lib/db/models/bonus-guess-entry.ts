import mongoose, { Schema, Document, Model } from "mongoose"

export interface IBonusGuessEntry extends Document {
  _id: mongoose.Types.ObjectId
  guessId: mongoose.Types.ObjectId
  kickId: string
  username: string
  guess: number
  difference: number | null
  rank: number | null
  createdAt: Date
  updatedAt: Date
}

const bonusGuessEntrySchema = new Schema<IBonusGuessEntry>(
  {
    guessId: { type: Schema.Types.ObjectId, ref: "BonusGuess", required: true },
    kickId: { type: String, required: true },
    username: { type: String, required: true },
    guess: { type: Number, required: true },
    difference: { type: Number, default: null },
    rank: { type: Number, default: null },
  },
  { timestamps: true }
)

// One guess per user per round
bonusGuessEntrySchema.index({ guessId: 1, kickId: 1 }, { unique: true })
bonusGuessEntrySchema.index({ guessId: 1, difference: 1 })

export const BonusGuessEntry: Model<IBonusGuessEntry> =
  mongoose.models.BonusGuessEntry ||
  mongoose.model<IBonusGuessEntry>("BonusGuessEntry", bonusGuessEntrySchema)
