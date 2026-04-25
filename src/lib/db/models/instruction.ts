import mongoose, { Schema, Document, Model } from "mongoose"

export interface IInstruction extends Document {
  _id: mongoose.Types.ObjectId
  slug: string
  title: string
  shortDescription: string
  imageUrl: string
  htmlContent: string
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

const instructionSchema = new Schema<IInstruction>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    htmlContent: { type: String, default: "" },
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

export const Instruction: Model<IInstruction> =
  mongoose.models.Instruction ||
  mongoose.model<IInstruction>("Instruction", instructionSchema)
