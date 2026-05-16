"use client"

import { useEffect } from "react"
import useSWR from "swr"
import { getPusherClient } from "@/lib/pusher-client"

const fetcher = (url: string) =>
  fetch(url, {
    credentials: "include",
  }).then((res) => res.json())

/**
 * Shared hook for global platform stats.
 * Fetches once from API, then updates via Pusher WebSocket.
 */
export function useGlobalStats() {
  const { data, mutate, isLoading } = useSWR("/api/stats", fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateIfStale: false,
    dedupingInterval: 30000,
  })

  useEffect(() => {
    const pusher = getPusherClient()
    const channel = pusher.subscribe("platform-updates")

    const handler = (statsData: any) => {
      console.log("[Pusher] Global stats updated via WebSocket")
      mutate(statsData, false)
    }

    channel.bind("stats-updated", handler)

    return () => {
      channel.unbind("stats-updated", handler)
    }
  }, [mutate])

  return {
    pointsInCirculation: data?.pointsInCirculation ?? 0,
    totalUsers: data?.totalUsers ?? 0,
    kickSubscribers: data?.kickSubscribers ?? 0,
    isLoading,
  }
}
