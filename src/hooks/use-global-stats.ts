"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

/**
 * Shared hook for global platform stats.
 * Fetches from API and polls every 15 seconds.
 */
export function useGlobalStats() {
  const { data, isLoading } = useSWR("/api/stats", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 15000,
  })

  return {
    pointsInCirculation: data?.pointsInCirculation ?? 0,
    totalUsers: data?.totalUsers ?? 0,
    kickSubscribers: data?.kickSubscribers ?? 0,
    isLoading,
  }
}
