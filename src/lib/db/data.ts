import { serverFetch } from "@/lib/server-fetch"

function getBaseUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")

  if (appUrl?.startsWith("https://")) return appUrl
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_APP_URL must be an https URL in production")
  }

  return 'http://localhost:3000'
}

export async function getPartners() {
  try {
    const res = await serverFetch(`${getBaseUrl()}/api/partners`)
    if (!res.ok) return []
    const data = await res.json()
    return data.partners || []
  } catch (e) {
    return []
  }
}

export async function getPredictions(status?: string) {
  try {
    const url = new URL(`${getBaseUrl()}/api/predictions`)
    if (status) url.searchParams.set('status', status)
    const res = await serverFetch(url.toString())
    if (!res.ok) return []
    const data = await res.json()
    return data.predictions || []
  } catch (e) {
    return []
  }
}

export async function getShopItems() {
  try {
    const res = await serverFetch(`${getBaseUrl()}/api/shop`)
    if (!res.ok) return []
    const data = await res.json()
    return data.items || []
  } catch (e) {
    return []
  }
}

export async function getInstructions() {
  try {
    const res = await serverFetch(`${getBaseUrl()}/api/instructions`)
    if (!res.ok) return []
    const data = await res.json()
    return data.instructions || []
  } catch (e) {
    return []
  }
}

export async function getInstructionBySlug(slug: string) {
  try {
    const res = await serverFetch(`${getBaseUrl()}/api/instructions/${slug}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.instruction || null
  } catch (e) {
    return null
  }
}

export async function getLeaderboard() {
  try {
    const res = await serverFetch(`${getBaseUrl()}/api/leaderboard`)
    if (!res.ok) return []
    const data = await res.json()
    return data.leaderboard || []
  } catch (e) {
    return []
  }
}

export async function getGlobalStats() {
  try {
    const res = await serverFetch(`${getBaseUrl()}/api/stats`)
    if (!res.ok) return { totalUsers: 0, pointsInCirculation: 0 }
    const data = await res.json()
    return {
      totalUsers: data.totalUsers || 0,
      pointsInCirculation: data.pointsInCirculation || 0
    }
  } catch (e) {
    return { totalUsers: 0, pointsInCirculation: 0 }
  }
}
