import { NextRequest, NextResponse } from "next/server"
import { exchangeCodeForTokens, getKickUser } from "@/lib/auth/kick"
import { getOAuthState, createSession } from "@/lib/auth/session"
import { connectToDatabase } from "@/lib/db/mongodb"
import { User } from "@/lib/db/models"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin).replace(/\/$/, "")

  if (error) {
    return NextResponse.redirect(`${appUrl}/?error=${error}`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/?error=missing_params`)
  }

  try {
    // Verify state and get code verifier
    const codeVerifier = await getOAuthState(state)
    if (!codeVerifier) {
      return NextResponse.redirect(`${appUrl}/?error=invalid_state`)
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, codeVerifier)

    // Get user info from Kick
    const kickUser = await getKickUser(tokens.access_token)

    // Connect to database and find or create user
    await connectToDatabase()

    let user = await User.findOne({ kickId: String(kickUser.user_id) })

    if (!user) {
      user = await User.create({
        kickId: String(kickUser.user_id),
        kickUsername: kickUser.name,
        kickAvatar: kickUser.profile_picture || "",
        points: 0,
        watchTimeMinutes: 0,
        isAdmin: false,
      })
    } else {
      // Update user info
      user.kickUsername = kickUser.name
      user.kickAvatar = kickUser.profile_picture || ""
      await user.save()
    }

    // Create session
    await createSession({
      userId: user._id.toString(),
      kickId: user.kickId,
      kickUsername: user.kickUsername,
      kickAvatar: user.kickAvatar,
      isAdmin: user.isAdmin,
      isDeveloper: user.isDeveloper || false,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    })

    return NextResponse.redirect(`${appUrl}/`)
  } catch (err) {
    console.error("OAuth callback error:", err)
    return NextResponse.redirect(`${appUrl}/?error=auth_failed`)
  }
}
