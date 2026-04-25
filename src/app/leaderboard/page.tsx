import type { Metadata } from "next"
import { getLeaderboard } from "@/lib/db/data"
import { LeaderboardContent } from "@/components/leaderboard/leaderboard-content"

export const metadata: Metadata = {
  title: "Ranking",
  description: "Sprawdź kto dominuje w społeczności Don Kasjo i walcz o najwyższe miejsce w rankingu.",
}

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard()

  return <LeaderboardContent initialLeaderboard={leaderboard} />
}

export const revalidate = 30
