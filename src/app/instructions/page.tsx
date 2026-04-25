import { getInstructions } from "@/lib/db/data"
import { InstructionsList } from "@/components/instructions/instructions-list"

export default async function InstructionsPage() {
  const instructions = await getInstructions()

  return <InstructionsList initialInstructions={instructions} />
}

export const dynamic = "force-dynamic"
export const revalidate = 0
