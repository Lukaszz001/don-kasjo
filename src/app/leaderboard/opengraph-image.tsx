import { generateOGImage, OG_SIZE } from "@/lib/og-image"

export const runtime = "edge"
export const alt = "Ranking - Don Kasjo"
export const size = OG_SIZE
export const contentType = "image/png"

export default async function Image() {
  return generateOGImage({
    emoji: "🏆",
    badge: "TOP WIDZOWIE",
    title: "RANKING",
    subtitle: "Sprawdź kto dominuje w społeczności Don Kasjo i walcz o najwyższe miejsce",
    accentColor: "#f59e0b",
  })
}
