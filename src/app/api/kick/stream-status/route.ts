import { NextResponse } from "next/server"
import { getAppAccessToken } from "@/lib/auth/kick"
import { getCurrentUser } from "@/lib/auth/session"
import { getConfig, CONFIG_KEYS } from "@/lib/config"
import { redis } from "@/lib/db/redis"

const DEFAULT_KICK_CHANNEL = process.env.NEXT_PUBLIC_KICK_CHANNEL_ID || process.env.KICK_CHANNEL_ID || "donkasjo"
const STREAM_CACHE_TTL_SECONDS = 30
const cacheKeyFor = (slug: string) => `kick:stream-status:api:${slug}`

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const slugParam = searchParams.get("slug")

    // Fast path: default-channel requests can be served from Redis cache.
    // Dev/admin and ?slug= overrides bypass the cache so they always see fresh data.
    if (!slugParam) {
      const cached = await redis.get(cacheKeyFor(DEFAULT_KICK_CHANNEL))
      if (cached) {
        return NextResponse.json(JSON.parse(cached))
      }
    }

    const user = await getCurrentUser()
    const isDev = user?.isDeveloper || user?.isAdmin

    // Get channel from DB if dev, otherwise from .env
    const configChannel = isDev ? await getConfig(CONFIG_KEYS.KICK_CHANNEL_ID, DEFAULT_KICK_CHANNEL) : DEFAULT_KICK_CHANNEL
    const slug = slugParam || configChannel
    const token = await getAppAccessToken()

    const params = new URLSearchParams()
    params.append("slug", slug)

    const response = await fetch(
      `https://api.kick.com/public/v1/channels?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        next: { revalidate: 30 },
      }
    )

    if (!response.ok) {
      console.error("Kick API error:", await response.text())
      return NextResponse.json({
        isLive: false,
        title: DEFAULT_KICK_CHANNEL,
      })
    }

    const json = await response.json()
    const data = json.data?.[0]

    let payload: Record<string, unknown>

    if (!data) {
      payload = { isLive: false, title: DEFAULT_KICK_CHANNEL }
    } else if (data.stream && data.stream.is_live) {
      payload = {
        isLive: true,
        title: data.stream_title || DEFAULT_KICK_CHANNEL,
        viewers: data.stream.viewer_count || 0,
        startedAt: data.stream.start_time,
        thumbnail: data.stream.thumbnail || null,
        chatroomId: data.chatroom?.id || null,
        broadcaster_id: data.user_id,
      }
    } else {
      payload = {
        isLive: false,
        title: data.stream_title || data.slug || DEFAULT_KICK_CHANNEL,
        thumbnail: data.banner_picture || null,
        chatroomId: data.chatroom?.id || null,
        broadcaster_id: data.user_id,
      }
    }

    // Cache only the default-channel, non-dev response. Webhooks will push
    // realtime updates over Pusher, so a 30 s window is fine.
    if (!slugParam && !isDev) {
      await redis.set(
        cacheKeyFor(DEFAULT_KICK_CHANNEL),
        JSON.stringify(payload),
        "EX",
        STREAM_CACHE_TTL_SECONDS,
      )
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error("Failed to fetch stream status:", error)
    return NextResponse.json({
      isLive: false,
      title: DEFAULT_KICK_CHANNEL,
    })
  }
}
