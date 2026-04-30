import Pusher from "pusher-js"
import { mutate } from "swr"

// Must match server-side (pusher-server.ts). The hardcoded fallbacks exist
// only for local dev without env vars — production MUST set these.
const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || "eb1d5f20e29713f1d21e"
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "sa1"

// Keys SWR uses for endpoints that depend on Pusher events. On reconnect we
// refetch these so any events missed while disconnected are caught up.
const REVALIDATE_ON_RECONNECT_KEYS = [
  "/api/kick/stream-status",
  "/api/stats",
]

// Disconnect Pusher after the tab has been hidden this long. Saves battery
// and a Pusher concurrent-connection slot. Channel/binding state is
// preserved by pusher-js across disconnect()/connect().
const HIDE_DISCONNECT_DELAY = 60_000

let pusherClient: Pusher | null = null
let visibilityWired = false
let hiddenTimer: ReturnType<typeof setTimeout> | null = null

export const getPusherClient = (): Pusher => {
  if (pusherClient) return pusherClient

  pusherClient = new Pusher(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER,
    forceTLS: true,
    enabledTransports: ["ws", "wss"],
    disabledTransports: ["xhr_streaming", "xhr_polling", "sockjs"],
    disableStats: true,
  })

  pusherClient.connection.bind("connected", () => {
    REVALIDATE_ON_RECONNECT_KEYS.forEach((key) => mutate(key))
  })

  if (typeof document !== "undefined" && !visibilityWired) {
    visibilityWired = true
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (hiddenTimer) clearTimeout(hiddenTimer)
        hiddenTimer = setTimeout(() => {
          pusherClient?.disconnect()
        }, HIDE_DISCONNECT_DELAY)
      } else {
        if (hiddenTimer) {
          clearTimeout(hiddenTimer)
          hiddenTimer = null
        }
        if (pusherClient && pusherClient.connection.state !== "connected") {
          pusherClient.connect()
        }
      }
    })
  }

  return pusherClient
}
