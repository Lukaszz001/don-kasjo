"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getPusherClient } from "@/lib/pusher-client"

interface PusherRefreshProps {
  channelName: string
  eventName: string
  /** Optional callback when event is received. If provided, called instead of router.refresh() */
  onEvent?: () => void
}

export function PusherRefresh({ channelName, eventName, onEvent }: PusherRefreshProps) {
  const router = useRouter()

  useEffect(() => {
    const pusher = getPusherClient()
    const channel = pusher.subscribe(channelName)

    const handler = () => {
      console.log(`[Pusher] Event ${eventName} received on ${channelName}, refreshing...`)
      if (onEvent) {
        onEvent()
      } else {
        router.refresh()
      }
    }

    channel.bind(eventName, handler)

    return () => {
      // Unbind only this handler — do NOT unsubscribe the channel,
      // other components (useStreamStatus, useGlobalStats, sibling PusherRefreshes)
      // share the same channel and would lose their bindings.
      channel.unbind(eventName, handler)
    }
  }, [channelName, eventName, router, onEvent])

  return null
}
