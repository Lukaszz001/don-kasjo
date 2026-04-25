import Pusher from "pusher"

// These should be in your .env
export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || "eb1d5f20e29713f1d21e",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "sa1",
  useTLS: true,
})

export async function triggerUpdate(channel: string, event: string, data: any = {}) {
  try {
    // Only trigger if we have the secret
    if (process.env.PUSHER_SECRET) {
      await pusher.trigger(channel, event, data)
    } else {
      console.log(`[Pusher-Mock] Triggered ${event} on ${channel} (No PUSHER_SECRET)`)
    }
  } catch (error) {
    console.error("Pusher trigger error:", error)
  }
}
