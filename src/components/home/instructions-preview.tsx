"use client"

import Link from "next/link"
import { BookOpen, ArrowRight, Sparkles, Zap, Trophy, HelpCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import useSWR from "swr"
import { cn } from "@/lib/utils"
import { apiFetcher } from "@/lib/api-client"

const DEFAULT_ICONS = [BookOpen, Zap, Trophy, Sparkles, HelpCircle]

export function InstructionsPreview() {
  const { t } = useLanguage()
  const { data, isLoading } = useSWR("/api/instructions", apiFetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: () => document.visibilityState === "visible" ? 60000 : 0,
  })

  const instructions = data?.instructions?.slice(0, 3) || []

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
        ))}
      </div>
    )
  }

  if (instructions.length === 0) {
    return (
      <div className="py-12 text-center border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
        <HelpCircle className="mx-auto h-12 w-12 text-white/20 mb-4" />
        <p className="text-white/40 font-black italic uppercase tracking-widest">{t("instructions.empty.title")}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {instructions.map((instruction: any, index: number) => {
        const Icon = DEFAULT_ICONS[index % DEFAULT_ICONS.length]
        return (
          <Link key={instruction.slug} href={`/instructions/${instruction.slug}`} className="group h-full">
            <Card className="relative h-full overflow-hidden border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5">
              {/* Inner Glow */}
              <div className="absolute -top-12 -right-12 h-24 w-24 bg-primary/10 blur-[30px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              
              <CardContent className="flex h-full flex-col gap-6 p-8 relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                
                <div className="flex-1 space-y-3">
                  <h3 className="font-display text-xl font-black text-white italic uppercase tracking-tighter group-hover:text-primary transition-colors leading-tight">
                    {instruction.title}
                  </h3>
                  <p className="text-sm font-medium text-white/40 leading-relaxed line-clamp-3 italic">
                    {instruction.shortDescription}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-black italic uppercase tracking-[0.2em] text-primary translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {t("instructions.readMore")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
