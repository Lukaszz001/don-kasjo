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
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    dedupingInterval: 300000, // 5 minutes — Pusher handles updates
  })

  useEffect(() => {
    const pusher = getPusherClient()
    const channel = pusher.subscribe("platform-updates")

    channel.bind("stream-status-changed", (streamData: any) => {
      console.log("[Pusher] Stream status changed via WebSocket:", streamData)
      // Update SWR cache directly with the data from Pusher — no API call needed
      mutate(streamData, false)
    })

    return () => {
      channel.unbind("stream-status-changed")
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
