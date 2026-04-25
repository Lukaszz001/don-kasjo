import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getInstructionBySlug } from "@/lib/db/data"
import { InstructionContent } from "@/components/instructions/instruction-content"

export default async function InstructionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const instruction = await getInstructionBySlug(slug)

  if (!instruction) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 lg:px-12">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/instructions">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-foreground">{instruction.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {instruction.shortDescription}
        </p>
      </div>

      {/* Featured Image */}
      {instruction.imageUrl && (
        <div className="mb-8 overflow-hidden rounded-xl">
          <Image
            src={instruction.imageUrl}
            alt={instruction.title}
            width={800}
            height={450}
            className="w-full h-auto"
          />
        </div>
      )}

      {/* Content Component with translations */}
      <InstructionContent htmlContent={instruction.htmlContent} />
    </div>
  )
}

export const dynamic = "force-dynamic"
export const revalidate = 0
