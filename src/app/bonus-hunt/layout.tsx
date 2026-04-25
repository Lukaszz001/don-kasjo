import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bonus Hunt",
  description: "Śledź bonus hunty Don Kasjo na żywo i typuj wyniki — wygraj punkty za najlepsze trafienie.",
}

export default function BonusHuntLayout({ children }: { children: React.ReactNode }) {
  return children
}
