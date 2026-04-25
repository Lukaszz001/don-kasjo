import { generateOGImage, OG_SIZE } from "@/lib/og-image"

export const runtime = "edge"
export const alt = "Discord - Don Kasjo"
export const size = OG_SIZE
export const contentType = "image/png"

export default async function Image() {
  return generateOGImage({
    emoji: "💬",
    badge: "DOŁĄCZ DO SPOŁECZNOŚCI",
    title: "DISCORD",
    subtitle: "Bądź na bieżąco, bierz udział w eventach i rozmawiaj z innymi fanami Don Kasjo",
    accentColor: "#5865f2",
  })
}
