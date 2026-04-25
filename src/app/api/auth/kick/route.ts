import { NextResponse } from "next/server"
import { nanoid } from "nanoid"
import { generatePKCE, getAuthorizationUrl } from "@/lib/auth/kick"
import { storeOAuthState } from "@/lib/auth/session"

export async function GET() {
  try {
    const state = nanoid(32)
    const { codeVerifier, codeChallenge } = generatePKCE()

    await storeOAuthState(state, codeVerifier)

    const authUrl = getAuthorizationUrl(state, codeChallenge)

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("OAuth init error:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/?error=auth_failed`
    )
  }
}
