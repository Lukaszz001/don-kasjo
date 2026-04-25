"use client"

import { useState, useEffect } from "react"
import { Users, Coins } from "lucide-react"
import { useStreamStatus } from "@/hooks/use-stream-status"
import { useLanguage } from "@/lib/language-context"
import { formatPoints } from "@/lib/utils"

interface HeroClientProps {
  initialPoints: number
  initialUsers: number
}

export function HeroClient({ initialPoints, initialUsers }: HeroClientProps) {
  const { t } = useLanguage()
  const { isLive, viewers, isLoading: isStatusLoading } = useStreamStatus()
  const [activeStatIndex, setActiveStatIndex] = useState(0)

  const showLoading = isStatusLoading && isLive === undefined

  const liveStats = [
    { label: t("hero.stats.activeViewers"), value: isLive ? (viewers?.toLocaleString() || "0") : "0", icon: Users },
    { label: t("hero.stats.pointsInCirculation"), value: formatPoints(initialPoints), icon: Coins },
    { label: t("hero.stats.registeredPlayers"), value: initialUsers?.toLocaleString() || "0", icon: Users },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStatIndex((prev) => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Live indicator badge */}
      <div className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 transition-all duration-500 min-h-[42px] ${showLoading ? "border-muted-foreground/20 bg-muted/5 animate-pulse" :
          isLive ? "border-green-500/30 bg-green-500/10" :
            "border-red-500/10 bg-red-500/5 opacity-80"
        }`}>
        <span className="relative flex h-2.5 w-2.5">
          {showLoading ? (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-muted-foreground/30" />
          ) : isLive && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
          )}
          <span className={`relative inline-flex h-2.5 w-2.5 rounded-full transition-colors duration-500 ${showLoading ? "bg-muted-foreground/40" :
              isLive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" :
                "bg-red-500/60"
            }`} />
        </span>
        <span className={`text-sm font-bold uppercase tracking-wider transition-colors duration-500 ${showLoading ? "text-muted-foreground/60" :
            isLive ? "text-green-500" :
              "text-red-500/70"
          }`}>
          {showLoading ? t("live.status.checking") : isLive ? t("live.status.live") : t("live.status.offline")}
        </span>
        <span className={`h-4 w-px ${showLoading ? "bg-muted-foreground/10" :
            isLive ? "bg-green-500/30" :
              "bg-red-500/20"
          }`} />
        <span className="text-sm text-muted-foreground/80">{t("hero.badge")}</span>
      </div>

      {/* Live Stats Bar */}
      <div className="flex flex-wrap items-center gap-5 min-h-[28px]">
        {liveStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={`flex items-center gap-2 transition-all duration-500 ${activeStatIndex === index ? "text-white scale-105" : "text-muted-foreground opacity-50"
                }`}
            >
              <Icon className={`h-4 w-4 ${activeStatIndex === index ? "text-primary" : ""}`} />
              <span className="font-display text-lg font-black italic">{stat.value}</span>
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">{stat.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
