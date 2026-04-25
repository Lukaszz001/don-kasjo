import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Discord",
  description: "Dołącz do społeczności Don Kasjo na Discordzie — eventy, ogłoszenia i rozmowy z fanami.",
}

export default function DiscordLayout({ children }: { children: React.ReactNode }) {
  return children
}
