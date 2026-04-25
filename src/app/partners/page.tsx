import type { Metadata } from "next"
import { getPartners } from "@/lib/db/data"
import { PartnersList } from "@/components/partners/partners-list"

export const metadata: Metadata = {
  title: "Bonusy",
  description: "Najlepsze bonusy od partnerów Don Kasjo — darmowe środki i ekskluzywne kody promocyjne.",
}

// Standard Next.js page is a Server Component by default if "use client" is removed
export default async function PartnersPage() {
  const partners = await getPartners()

  return <PartnersList initialPartners={partners} />
}

// Enable dynamic rendering since we are fetching from DB
export const dynamic = "force-dynamic"
export const revalidate = 0
