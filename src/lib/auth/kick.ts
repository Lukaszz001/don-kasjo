import { nanoid } from "nanoid"
import crypto from "crypto"

const KICK_CLIENT_ID = process.env.KICK_CLIENT_ID!
const KICK_CLIENT_SECRET = process.env.KICK_CLIENT_SECRET!
const KICK_REDIRECT_URI = process.env.KICK_REDIRECT_URI!

export interface KickTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

export interface KickUser {
  user_id: number
  name: string
  email: string
  profile_picture: string | null
}

// Generate PKCE code verifier and challenge
export function generatePKCE() {
  const codeVerifier = nanoid(64)
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url")
  return { codeVerifier, codeChallenge }
}

// Generate OAuth authorization URL
export function getAuthorizationUrl(state: string, codeChallenge: string) {
  const params = new URLSearchParams({
    client_id: KICK_CLIENT_ID,
    redirect_uri: KICK_REDIRECT_URI,
    response_type: "code",
    scope: "user:read channel:read",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  })

  return `https://id.kick.com/oauth/authorize?${params.toString()}`
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<KickTokens> {
  const response = await fetch("https://id.kick.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: KICK_CLIENT_ID,
      client_secret: KICK_CLIENT_SECRET,
      redirect_uri: KICK_REDIRECT_URI,
      code,
      code_verifier: codeVerifier,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code: ${error}`)
  }

  return response.json()
}

// Get user info from Kick API
export async function getKickUser(accessToken: string): Promise<KickUser> {
  const response = await fetch("https://api.kick.com/public/v1/users", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to get user info")
  }

  const data = await response.json()
  return data.data[0]
}

// Refresh access token
export async function refreshAccessToken(
  refreshToken: string
): Promise<KickTokens> {
  const response = await fetch("https://id.kick.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: KICK_CLIENT_ID,
      client_secret: KICK_CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to refresh token")
  }

  return response.json()
}

let cachedAppToken: { token: string; expiresAt: number } | null = null

export async function getAppAccessToken(): Promise<string> {
  if (cachedAppToken && Date.now() < cachedAppToken.expiresAt) {
    return cachedAppToken.token
  }

  const response = await fetch("https://id.kick.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: KICK_CLIENT_ID,
      client_secret: KICK_CLIENT_SECRET,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get app access token: ${error}`)
  }

  const data = await response.json()
  cachedAppToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }

  return data.access_token
}
