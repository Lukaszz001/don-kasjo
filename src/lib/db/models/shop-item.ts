import mongoose, { Schema, Document, Model } from "mongoose"

export interface IShopItem extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  description: string
  price: number
  imageUrl: string
  stock: number | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const shopItemSchema = new Schema<IShopItem>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 1 },
    imageUrl: { type: String, default: "" },
    stock: { type: Number, default: null, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
)

shopItemSchema.index({ isActive: 1 })

export const ShopItem: Model<IShopItem> =
  mongoose.models.ShopItem ||
  mongoose.model<IShopItem>("ShopItem", shopItemSchema)
