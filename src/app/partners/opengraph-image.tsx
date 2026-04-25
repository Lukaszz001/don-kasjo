import { generateOGImage, OG_SIZE } from "@/lib/og-image"

export const runtime = "edge"
export const alt = "Bonusy i Partnerzy - Don Kasjo"
export const size = OG_SIZE
export const contentType = "image/png"

export default async function Image() {
  return generateOGImage({
    emoji: "🎁",
    badge: "EKSKLUZYWNE OFERTY",
    title: "BONUSY",
    subtitle: "Najlepsze bonusy od partnerów Don Kasjo — darmowe środki i kody promocyjne",
    accentColor: "#f59e0b",
  })
}
