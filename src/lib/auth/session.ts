import { cookies } from "next/headers"
import { nanoid } from "nanoid"
import { getSession, setSession, deleteSession, redis } from "@/lib/db/redis"
import { connectToDatabase } from "@/lib/db/mongodb"
import { User, type IUser } from "@/lib/db/models"

const SESSION_COOKIE_NAME = "dk_session"
const SESSION_EXPIRY = 60 * 60 * 24 * 7 // 7 days

export interface SessionData {
  userId: string
  kickId: string
  kickUsername: string
  kickAvatar: string
  isAdmin: boolean
  accessToken: string
  refreshToken: string
}

export async function createSession(data: SessionData): Promise<string> {
  const sessionId = nanoid(32)
  await setSession(sessionId, data, SESSION_EXPIRY)

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: SESSION_EXPIRY,
    path: "/",
  })

  return sessionId
}

export async function getCurrentSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    return null
  }

  const session = await getSession(sessionId)
  return session as SessionData | null
}

export async function getCurrentUser(): Promise<IUser | null> {
  const session = await getCurrentSession()
  if (!session) return null

  await connectToDatabase()
  const user = await User.findById(session.userId)
  return user
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getCurrentSession()
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session
}

export async function requireAdmin(): Promise<SessionData> {
  const session = await requireAuth()
  if (!session.isAdmin) {
    throw new Error("Forbidden")
  }
  return session
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sessionId) {
    await deleteSession(sessionId)
    cookieStore.delete(SESSION_COOKIE_NAME)
  }
}

// Store OAuth state in Redis
export async function storeOAuthState(
  state: string,
  codeVerifier: string
): Promise<void> {
  await redis.set(`oauth:${state}`, codeVerifier, "EX", 600) // 10 minutes
}

export async function getOAuthState(state: string): Promise<string | null> {
  const codeVerifier = await redis.get(`oauth:${state}`)
  if (codeVerifier) {
    await redis.del(`oauth:${state}`)
  }
  return codeVerifier
}
