import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return "0"
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export function formatPoints(points?: number) {
  if (!points) return "0"
  if (points >= 1000000) return (points / 1000000).toFixed(1) + "M"
  if (points >= 10000) return (points / 1000).toFixed(0) + "K"
  if (points >= 1000) return (points / 1000).toFixed(1) + "K"
  return points.toLocaleString()
}
export function maskUsername(username: string) {
  if (username.length <= 4) return username;
  return username.substring(0, 2) + "****" + username.substring(username.length - 2);
}