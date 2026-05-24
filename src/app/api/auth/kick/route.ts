import { NextRequest, NextResponse } from "next/server"
import { nanoid } from "nanoid"
import { generatePKCE, getAuthorizationUrl } from "@/lib/auth/kick"
import { storeOAuthState } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  try {
    const state = nanoid(32)
    const { codeVerifier, codeChallenge } = generatePKCE()

    await storeOAuthState(state, codeVerifier)

    const authUrl = getAuthorizationUrl(state, codeChallenge)

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("OAuth init error:", error)
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin).replace(/\/$/, "")
    return NextResponse.redirect(
      `${appUrl}/?error=auth_failed`
    )
  }
}
