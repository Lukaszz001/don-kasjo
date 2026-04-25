import Pusher from "pusher-js"

// Public key for Kick chat or platform-specific events
// In a real app, these would be in env variables
export const PUSHER_KEY = "eb1d5f20e29713f1d21e"
export const PUSHER_CLUSTER = "sa1"

let pusherClient: Pusher | null = null

export const getPusherClient = () => {
  if (!pusherClient) {
    pusherClient = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      forceTLS: true,
    })
  }
  return pusherClient
}
