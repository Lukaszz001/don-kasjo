import mongoose, { Schema, Document, Model } from "mongoose"

export type PredictionStatus = "open" | "closed" | "resolved" | "refunded"

export interface IPrediction extends Document {
  _id: mongoose.Types.ObjectId
  question: string
  option1: string
  option2: string
  status: PredictionStatus
  winningOption: 1 | 2 | null
  totalPointsOption1: number
  totalPointsOption2: number
  totalBetsOption1: number
  totalBetsOption2: number
  closesAt: Date
  resolvedAt: Date | null
  createdBy: string
  resolvedBy: string | null
  notes: string
  createdAt: Date
  updatedAt: Date
}

const predictionSchema = new Schema<IPrediction>(
  {
    question: { type: String, required: true },
    option1: { type: String, required: true },
    option2: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "closed", "resolved", "refunded"],
      default: "open",
    },
    winningOption: { type: Number, enum: [1, 2, null], default: null },
    totalPointsOption1: { type: Number, default: 0, min: 0 },
    totalPointsOption2: { type: Number, default: 0, min: 0 },
    totalBetsOption1: { type: Number, default: 0, min: 0 },
    totalBetsOption2: { type: Number, default: 0, min: 0 },
    closesAt: { type: Date, required: true },
    resolvedAt: { type: Date, default: null },
    createdBy: { type: String, required: true },
    resolvedBy: { type: String, default: null },
    notes: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
)

predictionSchema.index({ status: 1, closesAt: -1 })
predictionSchema.index({ createdAt: -1 })

export const Prediction: Model<IPrediction> =
  mongoose.models.Prediction ||
  mongoose.model<IPrediction>("Prediction", predictionSchema)
