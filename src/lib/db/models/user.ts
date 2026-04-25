import mongoose, { Schema, Document, Model } from "mongoose"

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  kickId: string
  kickUsername: string
  kickAvatar: string
  points: number
  watchTimeMinutes: number
  isAdmin: boolean
  isModerator: boolean
  isDeveloper: boolean
  stakeUsername?: string
  isStakeVerified: boolean
  lastStakeVerificationDate?: Date
  lastActive?: Date
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    kickId: { type: String, required: true, unique: true, index: true },
    kickUsername: { type: String, required: true },
    kickAvatar: { type: String, default: "" },
    points: { type: Number, default: 0, min: 0 },
    watchTimeMinutes: { type: Number, default: 0, min: 0 },
    isAdmin: { type: Boolean, default: false },
    isModerator: { type: Boolean, default: false },
    isDeveloper: { type: Boolean, default: false },
    stakeUsername: { type: String, default: "" },
    isStakeVerified: { type: Boolean, default: false },
    lastStakeVerificationDate: { type: Date },
    lastActive: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)

userSchema.index({ points: -1 })
userSchema.index({ kickUsername: 1 })

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema)
