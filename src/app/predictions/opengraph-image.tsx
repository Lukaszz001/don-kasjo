import { generateOGImage, OG_SIZE } from "@/lib/og-image"

export const runtime = "edge"
export const alt = "Predykcje - Don Kasjo"
export const size = OG_SIZE
export const contentType = "image/png"

export default async function Image() {
  return generateOGImage({
    emoji: "🎯",
    badge: "TYPUJ I WYGRYWAJ",
    title: "PREDYKCJE",
    subtitle: "Obstaw swoje typy, zdobywaj punkty i walcz o najwyższe miejsce w rankingu",
    accentColor: "#22c55e",
  })
}
