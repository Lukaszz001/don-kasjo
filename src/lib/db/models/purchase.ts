import mongoose, { Schema, Document, Model } from "mongoose"

export type PurchaseStatus = "pending" | "completed" | "cancelled"

export interface IPurchase extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  itemId: mongoose.Types.ObjectId
  itemName: string
  pointsSpent: number
  status: PurchaseStatus
  createdAt: Date
}

const purchaseSchema = new Schema<IPurchase>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "ShopItem",
      required: true,
    },
    itemName: { type: String, required: true },
    pointsSpent: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

purchaseSchema.index({ userId: 1, createdAt: -1 })

export const Purchase: Model<IPurchase> =
  mongoose.models.Purchase ||
  mongoose.model<IPurchase>("Purchase", purchaseSchema)
