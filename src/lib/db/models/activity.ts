import mongoose, { Schema, Document, Model } from "mongoose"

export type ActivityType = 
  | "giveaway_entry" 
  | "bonus_guess" 
  | "prediction_bet" 
  | "shop_purchase"
  | "stake_verify"

export interface IActivity extends Document {
  kickId: string
  type: ActivityType
  title: string
  description: string
  pointsChange?: number
  metadata?: any
  createdAt: Date
}

const activitySchema = new Schema<IActivity>(
  {
    kickId: { type: String, required: true, index: true },
    type: { 
      type: String, 
      required: true, 
      enum: ["giveaway_entry", "bonus_guess", "prediction_bet", "shop_purchase", "stake_verify"] 
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    pointsChange: { type: Number },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

activitySchema.index({ kickId: 1, createdAt: -1 })

export const Activity: Model<IActivity> =
  mongoose.models.Activity || mongoose.model<IActivity>("Activity", activitySchema)
