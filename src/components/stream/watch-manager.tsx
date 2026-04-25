"use client"

import { useEffect } from "react"
import Pusher from "pusher-js"
import { useStreamStatus } from "@/hooks/use-stream-status"

export function WatchManager() {
  const { chatroomId } = useStreamStatus()

  useEffect(() => {
    if (!chatroomId) return

    const pusher = new Pusher("eb1d5f20e29713f1d21e", {
      cluster: "sa1",
      forceTLS: true
    })

    const channel = pusher.subscribe(`chatrooms.${chatroomId}.v2`)

    channel.bind("App\\Events\\ChatMessageEvent", (_data: any) => {
      // Points are handled by webhooks server-side
    })

    return () => {
      pusher.unsubscribe(`chatrooms.${chatroomId}.v2`)
      pusher.disconnect()
    }
  }, [chatroomId])

  return null // No UI needed anymore as points are handled by webhooks
}
