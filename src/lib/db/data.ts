import { connectToDatabase } from "./mongodb"
import { PartnerSite, Prediction, ShopItem, Instruction, User } from "./models"

export async function getPartners() {
  const db = await connectToDatabase()
  if (!db) {
    // Return empty array or mock data if db is not connected
    return []
  }
  
  const partners = await PartnerSite.find({ isActive: true })
    .sort({ order: 1 })
    .lean()
    
  return partners.map((p) => ({
    ...p,
    _id: p._id.toString(),
  }))
}

export async function getPredictions(status?: string) {
  const db = await connectToDatabase()
  if (!db) {
    return []
  }
  
  const query: Record<string, unknown> = {}
  if (status) {
    query.status = status
  }
  
  const predictions = await Prediction.find(query)
    .sort({ createdAt: -1 })
    .limit( status === "open" ? 20 : 50)
    .lean()
    
  return predictions.map((p) => ({
    ...p,
    _id: p._id.toString(),
    closesAt: p.closesAt instanceof Date ? p.closesAt.toISOString() : p.closesAt,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
  }))
}

export async function getShopItems() {
  const db = await connectToDatabase()
  if (!db) return []
  
  const items = await ShopItem.find({ isActive: true })
    .sort({ price: 1 })
    .lean()
    
  return items.map((i) => ({
    ...i,
    _id: i._id.toString(),
  }))
}

export async function getInstructions() {
  const db = await connectToDatabase()
  if (!db) return []
  
  const instructions = await Instruction.find({ isPublished: true })
    .sort({ updatedAt: -1 })
    .lean()
    
  return instructions.map((i) => ({
    ...i,
    _id: i._id.toString(),
    createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : i.createdAt,
    updatedAt: i.updatedAt instanceof Date ? i.updatedAt.toISOString() : i.updatedAt,
  }))
}

export async function getInstructionBySlug(slug: string) {
  const db = await connectToDatabase()
  if (!db) return null
  
  const instruction = await Instruction.findOne({ slug, isPublished: true }).lean()
  if (!instruction) return null
  
  return {
    ...instruction,
    _id: instruction._id.toString(),
    createdAt: (instruction.createdAt as any) instanceof Date ? (instruction.createdAt as any).toISOString() : instruction.createdAt,
    updatedAt: (instruction.updatedAt as any) instanceof Date ? (instruction.updatedAt as any).toISOString() : instruction.updatedAt,
  }
}

export async function getLeaderboard() {
  const db = await connectToDatabase()
  if (!db) return []
  
  // High performance query for top 100 users
  const users = await User.find({})
    .sort({ points: -1 })
    .limit(100)
    .lean()
    
  return users.map((user, index) => {
    if (user.kickUsername === "BotRix") return null;

    return {
      rank: index + 1,
      kickUsername: user.kickUsername,
      kickAvatar: user.kickAvatar,
      points: user.points,
      watchTimeMinutes: user.watchTimeMinutes,
    };
  })
  .filter(Boolean);
}

export async function getGlobalStats() {
  const db = await connectToDatabase()
  if (!db) return { totalUsers: 0, pointsInCirculation: 0 }
  
  const [totalUsers, pointsData] = await Promise.all([
    User.countDocuments(),
    User.aggregate([
      { $group: { _id: null, totalPoints: { $sum: "$points" } } }
    ])
  ])

  return {
    totalUsers,
    pointsInCirculation: pointsData[0]?.totalPoints || 0
  }
}
