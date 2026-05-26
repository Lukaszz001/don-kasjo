"use client"

import Link from "next/link"
import Image from "next/image"
import { BookOpen, ArrowRight } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Instruction {
  _id: string
  slug: string
  title: string
  shortDescription: string
  imageUrl: string
}

export function InstructionsList({ initialInstructions }: { initialInstructions: any[] }) {
  const { t } = useLanguage()
  const { data } = useSWR("/api/instructions", fetcher, { 
    fallbackData: { instructions: initialInstructions },
    refreshInterval: 60000 
  })
  const instructions = data?.instructions || initialInstructions

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 relative">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-0 -z-10 h-[500px] w-[500px] bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-0 right-0 -z-10 h-[500px] w-[500px] bg-accent/5 blur-[120px]" />

      <div className="mb-16 text-center lg:text-left">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-primary badge-shine">
          <BookOpen className="h-4 w-4" />
          {t("instructions.guides")}
        </div>
        <h1 className="font-display text-4xl font-black text-white lg:text-7xl uppercase italic tracking-tighter leading-none mb-4">
          {t("instructions.knowledge")} <span className="text-primary">{t("instructions.base")}</span>
        </h1>
        <p className="mx-auto lg:mx-0 max-w-2xl text-muted-foreground border-l-4 border-primary/50 pl-6 leading-relaxed">
          {t("instructions.subtitle")}
        </p>
      </div>

      {instructions.length === 0 ? (
        <Card className="border-dashed border-white/10 bg-white/5 backdrop-blur-md">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <BookOpen className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">
              {t("instructions.empty.title")}
            </h3>
            <p className="mt-2 max-w-sm text-muted-foreground font-medium">
              {t("instructions.empty.desc")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {instructions.map((instruction) => (
            <InstructionCard key={instruction._id} instruction={instruction} />
          ))}
        </div>
      )}
    </div>
  )
}

function InstructionCard({ instruction }: { instruction: Instruction }) {
  const { t } = useLanguage()
  return (
    <Card className="flex flex-col overflow-hidden border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl group transition-all duration-500 hover:border-primary/50 relative shadow-2xl">
      {/* Rim light top */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-primary/50 transition-all duration-500" />
      
      {/* Inner glows */}
      <div className="absolute -top-12 -right-12 h-24 w-24 bg-primary/5 blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Image Container */}
      <div className="relative aspect-[16/9] overflow-hidden bg-black/40">
        {instruction.imageUrl ? (
          <Image
            src={instruction.imageUrl}
            alt={instruction.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-16 w-16 text-white/5 transition-colors group-hover:text-primary/20" />
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
      </div>

      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="text-2xl font-black text-white italic uppercase tracking-tighter group-hover:text-primary transition-colors truncate">
          {instruction.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 pb-6 relative z-10">
        <p className="line-clamp-3 text-sm italic font-medium text-white/40 leading-relaxed">
          "{instruction.shortDescription}"
        </p>
      </CardContent>

      <CardFooter className="pt-0 pb-6 px-6 relative z-10">
        <Button asChild variant="ghost" className="w-full h-12 rounded-xl border border-white/10 text-white font-black italic uppercase tracking-widest text-[10px] hover:bg-primary hover:text-black hover:border-primary transition-all duration-300 glow-green group/btn">
          <Link href={`/instructions/${instruction.slug}`}>
            {t("instructions.readMore")}
            <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
