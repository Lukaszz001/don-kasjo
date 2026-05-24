"use client"

import useSWR from "swr"
import { apiFetcher } from "@/lib/api-client"

/**
 * Shared hook for global platform stats.
 * Fetches from API and polls every 15 seconds.
 */
export function useGlobalStats() {
  const { data, isLoading } = useSWR("/api/stats", apiFetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: () => document.visibilityState === "visible" ? 15000 : 0,
  })

  return {
    pointsInCirculation: data?.pointsInCirculation ?? 0,
    totalUsers: data?.totalUsers ?? 0,
    kickSubscribers: data?.kickSubscribers ?? 0,
    isLoading,
  }
}
