import mongoose, { Schema, Document, Model } from "mongoose"

export interface ISetting extends Document {
  _id: mongoose.Types.ObjectId
  key: string
  value: unknown
  updatedAt: Date
}

const settingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
)

export const Setting: Model<ISetting> =
  mongoose.models.Setting || mongoose.model<ISetting>("Setting", settingSchema)

export interface SocialLinks {
  kick?: string
  youtube?: string
  twitter?: string
  instagram?: string
  tiktok?: string
  discord?: string
}

export async function getSetting<T>(key: string): Promise<T | null> {
  const setting = await Setting.findOne({ key })
  return setting ? (setting.value as T) : null
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  await Setting.findOneAndUpdate(
    { key },
    { key, value },
    { upsert: true, new: true }
  )
}
