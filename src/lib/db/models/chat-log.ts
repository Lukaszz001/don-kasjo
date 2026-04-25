import mongoose, { Schema, Document, Model } from "mongoose"

export interface IChatLog extends Document {
  kickId: string
  username: string
  content: string
  createdAt: Date
}

const chatLogSchema = new Schema<IChatLog>(
  {
    kickId: { type: String, required: true, index: true },
    username: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: "7d" }, // Auto-delete logs after 7 days
  },
  {
    timestamps: false,
  }
)

export const ChatLog: Model<IChatLog> =
  mongoose.models.ChatLog || mongoose.model<IChatLog>("ChatLog", chatLogSchema)
