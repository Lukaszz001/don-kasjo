import { getAppAccessToken } from "./auth/kick"
import { serverFetch } from "@/lib/server-fetch"

const KICK_API_BASE = "https://api.kick.com/public/v1"

export interface KickSubscription {
  id: string
  app_id: string
  broadcaster_user_id: number
  event: string
  method: string
  version: number
  created_at: string
  updated_at: string
}

export async function getEventsSubscriptions(broadcasterId?: number) {
  const token = await getAppAccessToken()
  const url = new URL(`${KICK_API_BASE}/events/subscriptions`)
  if (broadcasterId) {
    url.searchParams.append("broadcaster_user_id", broadcasterId.toString())
  }

  const response = await serverFetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error(`[Kick-API] getEventsSubscriptions failed (${response.status}):`, errorBody)
    throw new Error(`Failed to get subscriptions: ${response.status} ${errorBody}`)
  }

  const data = await response.json()
  console.log(data)
  return data.data as KickSubscription[]
}

export async function subscribeToEvents(
  broadcasterId: number,
  events: { name: string; version: number }[]
) {
  const token = await getAppAccessToken()

  const response = await serverFetch(`${KICK_API_BASE}/events/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      broadcaster_user_id: broadcasterId,
      events,
      method: "webhook",
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error(`[Kick-API] subscribeToEvents failed (${response.status}):`, errorBody)
    throw new Error(`Failed to subscribe: ${response.status} ${errorBody}`)
  }

  return response.json()
}

export async function deleteEventsSubscriptions(ids: string[]) {
  const token = await getAppAccessToken()
  
  const url = new URL(`${KICK_API_BASE}/events/subscriptions`)
  ids.forEach(id => url.searchParams.append("id", id))

  const response = await serverFetch(url.toString(), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })

  if (!response.ok && response.status !== 204) {
    const error = await response.text()
    throw new Error(`Failed to delete subscriptions: ${error}`)
  }

  return true
}

export async function getChannelBySlug(slug: string) {
  const token = await getAppAccessToken()
  const response = await serverFetch(
    `${KICK_API_BASE}/channels?slug=${slug}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get channel: ${error}`)
  }

  const data = await response.json()
  return data.data?.[0]
}

const REQUIRED_EVENTS = [
  "chat.message.sent",
  "channel.followed",
  "channel.subscription.new",
  "channel.subscription.renewal",
  "livestream.status.updated"
]

export async function ensureKickSubscription() {
  const slugsRaw = process.env.NEXT_PUBLIC_KICK_CHANNEL_ID
  if (!slugsRaw) {
    console.error("[Kick-API] NEXT_PUBLIC_KICK_CHANNEL_ID not set")
    return false
  }

  const slugs = slugsRaw.split(",").map((s) => s.trim()).filter(Boolean)

  try {
    for (const slug of slugs) {
      const channel = await getChannelBySlug(slug)
      if (!channel?.broadcaster_user_id) {
        console.warn(`[Kick-API] channel '${slug}' not found`)
        continue
      }
      await subscribeToEvents(
        channel.broadcaster_user_id,
        REQUIRED_EVENTS.map((name) => ({ name, version: 1 }))
      )
      console.log(`[Kick-API] subscribed: ${slug} → ${channel.broadcaster_user_id}`)
    }
    return true
  } catch (error) {
    console.error("[Kick-API] Subscription error:", error)
    return false
  }
}

export async function getKickPublicKey() {
  const response = await serverFetch(`${KICK_API_BASE}/public-key`, {
    headers: {
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error(`[Kick-API] getKickPublicKey failed (${response.status}):`, errorBody)
    throw new Error(`Failed to get public key: ${response.status} ${errorBody}`)
  }

  const data = await response.json()
  return data.data?.public_key as string
}
