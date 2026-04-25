import { generateOGImage, OG_SIZE } from "@/lib/og-image"

export const runtime = "edge"
export const alt = "Bonus Hunt - Don Kasjo"
export const size = OG_SIZE
export const contentType = "image/png"

export default async function Image() {
  return generateOGImage({
    emoji: "🎰",
    badge: "TYPUJ WYNIKI",
    title: "BONUS HUNT",
    subtitle: "Śledź bonus hunty na żywo i typuj wyniki — wygraj punkty za najlepsze trafienie",
    accentColor: "#ef4444",
  })
}
