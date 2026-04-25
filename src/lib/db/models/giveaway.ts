import mongoose, { Schema, Document, Model } from "mongoose"

export type GiveawayStatus = "collecting" | "stopped" | "drawn"

export interface IGiveawayParticipant {
  kickId: string
  username: string
  enteredAt: Date
}

export interface IGiveaway extends Document {
  _id: mongoose.Types.ObjectId
  phrase: string
  status: GiveawayStatus
  participants: IGiveawayParticipant[]
  winner: IGiveawayParticipant | null
  drawnAt: Date | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const participantSchema = new Schema<IGiveawayParticipant>(
  {
    kickId: { type: String, required: true },
    username: { type: String, required: true },
    enteredAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const giveawaySchema = new Schema<IGiveaway>(
  {
    phrase: { type: String, required: true },
    status: {
      type: String,
      enum: ["collecting", "stopped", "drawn"],
      default: "collecting",
    },
    participants: { type: [participantSchema], default: [] },
    winner: { type: participantSchema, default: null },
    drawnAt: { type: Date, default: null },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
)

giveawaySchema.index({ status: 1, createdAt: -1 })

export const Giveaway: Model<IGiveaway> =
  mongoose.models.Giveaway ||
  mongoose.model<IGiveaway>("Giveaway", giveawaySchema)
