"use client"

import { useEffect } from "react"
import useSWR from "swr"
import { getPusherClient } from "@/lib/pusher-client"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

/**
 * Shared hook for stream status. Uses SWR with a single shared cache key.
 * First call fetches from API, subsequent calls use cache.
 * Pusher WebSocket updates the cache when stream status changes.
 */
export function useStreamStatus() {
  const { data, mutate, isLoading } = useSWR("/api/kick/stream-status", fetcher, {
    // Mobile browsers aggressively kill WebSockets in background — when the
    // tab regains focus or the network reconnects, refetch so the user does
    // not see stale data while Pusher is reconnecting.
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateIfStale: false,
    dedupingInterval: 30000,
  })

  useEffect(() => {
    const pusher = getPusherClient()
    const channel = pusher.subscribe("platform-updates")

    const handler = (streamData: any) => {
      console.log("[Pusher] Stream status changed via WebSocket:", streamData)
      mutate(streamData, false)
    }

    channel.bind("stream-status-changed", handler)

    return () => {
      // Unbind only this handler — channel is shared with other hooks.
      channel.unbind("stream-status-changed", handler)
    }
  }, [mutate])

  return {
    isLive: data?.isLive ?? false,
    title: data?.title,
    viewers: data?.viewers,
    startedAt: data?.startedAt,
    thumbnail: data?.thumbnail,
    chatroomId: data?.chatroomId,
    broadcaster_id: data?.broadcaster_id,
    isLoading,
  }
}
