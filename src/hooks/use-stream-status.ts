"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

/**
 * Shared hook for stream status. Uses SWR with a single shared cache key.
 * First call fetches from API, subsequent calls use cache.
 * Polls every 30 seconds for updates.
 */
export function useStreamStatus() {
  const { data, isLoading } = useSWR("/api/kick/stream-status", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 30000,
  })

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
