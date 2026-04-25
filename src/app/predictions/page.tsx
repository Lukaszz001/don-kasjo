import type { Metadata } from "next"
import { getPredictions } from "@/lib/db/data"
import { PredictionsContent } from "@/components/predictions/predictions-content"

export const metadata: Metadata = {
  title: "Predykcje",
  description: "Obstaw swoje typy, zdobywaj punkty i walcz o najwyższe miejsce w rankingu Don Kasjo.",
}

export default async function PredictionsPage() {
  const predictions = await getPredictions()

  return <PredictionsContent initialPredictions={predictions} />
}

export const revalidate = 30
