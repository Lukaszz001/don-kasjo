import mongoose, { Schema, Document, Model } from "mongoose"

export interface IPartnerSite extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  imageUrl: string
  bonus: string
  description: string
  code: string | null
  link: string
  isActive: boolean
  order: number
  color?: string
  htmlContent?: string
  createdAt: Date
  updatedAt: Date
}

const partnerSiteSchema = new Schema<IPartnerSite>(
  {
    name: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    bonus: { type: String, required: true },
    description: { type: String, default: "" },
    code: { type: String, default: null },
    link: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    color: { type: String, default: "primary" },
    htmlContent: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
)

partnerSiteSchema.index({ isActive: 1, order: 1 })

export const PartnerSite: Model<IPartnerSite> =
  mongoose.models.PartnerSite ||
  mongoose.model<IPartnerSite>("PartnerSite", partnerSiteSchema)
