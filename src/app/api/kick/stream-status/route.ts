import { NextResponse } from "next/server"
import { getAppAccessToken } from "@/lib/auth/kick"
import { getCurrentUser } from "@/lib/auth/session"
import { getConfig, CONFIG_KEYS } from "@/lib/config"
import { serverFetch } from "@/lib/server-fetch"

const DEFAULT_KICK_CHANNEL = process.env.NEXT_PUBLIC_KICK_CHANNEL_ID || process.env.KICK_CHANNEL_ID || "donkasjo"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()
    const isDev = user?.isDeveloper || user?.isAdmin
    
    // Get channel from DB if dev, otherwise from .env
    const configChannel = isDev ? await getConfig(CONFIG_KEYS.KICK_CHANNEL_ID, DEFAULT_KICK_CHANNEL) : DEFAULT_KICK_CHANNEL

    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug") || configChannel
    const token = await getAppAccessToken()

    const params = new URLSearchParams()
    params.append("slug", slug)

    const response = await serverFetch(
      `https://api.kick.com/public/v1/channels?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
      }
    )

    if (!response.ok) {
      console.error("Kick API error:", await response.text())
      return NextResponse.json({
        isLive: false,
        title: DEFAULT_KICK_CHANNEL,
      }, {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      })
    }

    const json = await response.json()
    const data = json.data?.[0]

    if (!data) {
      return NextResponse.json({ isLive: false, title: DEFAULT_KICK_CHANNEL }, {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      })
    }

    if (data.stream && data.stream.is_live) {
      return NextResponse.json({
        isLive: true,
        title: data.stream_title || DEFAULT_KICK_CHANNEL,
        viewers: data.stream.viewer_count || 0,
        startedAt: data.stream.start_time,
        thumbnail: data.stream.thumbnail || null,
        chatroomId: data.chatroom?.id || null,
        broadcaster_id: data.user_id,
      }, {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      })
    }

    return NextResponse.json({
      isLive: false,
      title: data.stream_title || data.slug || DEFAULT_KICK_CHANNEL,
      thumbnail: data.banner_picture || null,
      chatroomId: data.chatroom?.id || null,
      broadcaster_id: data.user_id,
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Failed to fetch stream status:", error)
    return NextResponse.json({
      isLive: false,
      title: DEFAULT_KICK_CHANNEL,
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    })
  }
}
