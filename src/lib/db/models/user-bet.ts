import mongoose, { Schema, Document, Model } from "mongoose"

export interface IUserBet extends Document {
  _id: mongoose.Types.ObjectId
  predictionId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  option: 1 | 2
  amount: number
  won: boolean | null
  payout: number | null
  createdAt: Date
}

const userBetSchema = new Schema<IUserBet>(
  {
    predictionId: {
      type: Schema.Types.ObjectId,
      ref: "Prediction",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    option: { type: Number, enum: [1, 2], required: true },
    amount: { type: Number, required: true, min: 1 },
    won: { type: Boolean, default: null },
    payout: { type: Number, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

userBetSchema.index({ predictionId: 1, userId: 1 })

export const UserBet: Model<IUserBet> =
  mongoose.models.UserBet || mongoose.model<IUserBet>("UserBet", userBetSchema)
