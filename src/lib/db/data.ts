function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export async function getPartners() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/partners`, { cache: 'no-store' })
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
    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return data.predictions || []
  } catch (e) {
    return []
  }
}

export async function getShopItems() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/shop`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return data.items || []
  } catch (e) {
    return []
  }
}

export async function getInstructions() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/instructions`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return data.instructions || []
  } catch (e) {
    return []
  }
}

export async function getInstructionBySlug(slug: string) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/instructions/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data.instruction || null
  } catch (e) {
    return null
  }
}

export async function getLeaderboard() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/leaderboard`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return data.leaderboard || []
  } catch (e) {
    return []
  }
}

export async function getGlobalStats() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/stats`, { cache: 'no-store' })
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
