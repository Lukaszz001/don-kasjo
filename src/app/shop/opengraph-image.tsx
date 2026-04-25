import { generateOGImage, OG_SIZE } from "@/lib/og-image"

export const runtime = "edge"
export const alt = "Sklep - Don Kasjo"
export const size = OG_SIZE
export const contentType = "image/png"

export default async function Image() {
  return generateOGImage({
    emoji: "🛍️",
    badge: "WYDAJ SWOJE PUNKTY",
    title: "SKLEP",
    subtitle: "Wymieniaj zebrane punkty na nagrody, kody i ekskluzywne przedmioty",
    accentColor: "#a855f7",
  })
}
