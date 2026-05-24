import Redis from "ioredis"

declare global {
  // eslint-disable-next-line no-var
  var redis: any
}

const REDIS_URL = process.env.REDIS_URL

// Create a mock redis for development without Redis configured
const mockStore = new Map<string, string>()
const mockSets = new Map<string, Set<string>>()
const createMockRedis = () => ({
  get: async (key: string) => mockStore.get(key) || null,
  set: async (key: string, value: string, ...args: any[]) => { mockStore.set(key, value); return "OK"; },
  del: async (key: string) => { mockStore.delete(key); mockSets.delete(key); return 1; },
  incr: async (key: string) => 1,
  expire: async (key: string, seconds: number) => 1,
  sadd: async (key: string, member: string) => {
    if (!mockSets.has(key)) mockSets.set(key, new Set())
    mockSets.get(key)!.add(member)
    return 1
  },
  sismember: async (key: string, member: string) => {
    return mockSets.get(key)?.has(member) ? 1 : 0
  },
})

export const redis: Redis | ReturnType<typeof createMockRedis> = REDIS_URL 
  ? (global.redis || new Redis(REDIS_URL, {
      connectTimeout: 5000,
      maxRetriesPerRequest: 1
    }))
  : createMockRedis()

if (process.env.NODE_ENV !== "production") {
  global.redis = redis
}

export async function getSession(sessionId: string) {
  const session = await redis.get(`session:${sessionId}`)
  if (!session) return null
  return JSON.parse(session)
}

export async function setSession(
  sessionId: string,
  data: unknown,
  expiresInSeconds: number = 60 * 60 * 24 * 7 // 7 days
) {
  await redis.set(
    `session:${sessionId}`,
    JSON.stringify(data),
    "EX",
    expiresInSeconds
  )
}

export async function deleteSession(sessionId: string) {
  await redis.del(`session:${sessionId}`)
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const current = await redis.incr(`ratelimit:${key}`)
  
  if (current === 1) {
    await redis.expire(`ratelimit:${key}`, windowSeconds)
  }
  
  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
  }
}
