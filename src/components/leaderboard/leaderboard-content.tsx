"use client"

import { useState, useEffect } from "react"
import { 
  Trophy, 
  Medal, 
  Clock, 
  Coins, 
  Crown,
  Flame,
  Star,
  Zap,
  Award,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/lib/language-context"
import { useRouter } from "next/navigation"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface LeaderboardEntry {
  rank: number
  kickUsername: string
  kickAvatar: string
  points: number
  watchTimeMinutes: number
}

type SortMode = "points" | "time"

export function LeaderboardContent({ initialLeaderboard }: { initialLeaderboard: LeaderboardEntry[] }) {
  const { t } = useLanguage()
  const { data: userData } = useSWR("/api/auth/me", fetcher)
  const user = userData?.user
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 60000)
    return () => clearInterval(interval)
  }, [router])

  // Pre-sort rankings
  const pointsRanking = [...initialLeaderboard]
    .sort((a, b) => b.points - a.points)
    .map((e, i) => ({ ...e, rank: i + 1 }))

  const timeRanking = [...initialLeaderboard]
    .sort((a, b) => b.watchTimeMinutes - a.watchTimeMinutes)
    .map((e, i) => ({ ...e, rank: i + 1 }))

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400"
    if (rank === 2) return "text-slate-300"
    if (rank === 3) return "text-amber-600"
    return "text-muted-foreground/50"
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-400" />
    if (rank === 2) return <Medal className="h-4 w-4 text-slate-300" />
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />
    return null
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      
      {/* Header Section */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-primary badge-shine">
          <Trophy className="h-4 w-4" />
          {t("nav.leaderboard")}
        </div>
        <h1 className="font-display text-4xl font-black text-white lg:text-7xl uppercase italic tracking-tighter mb-4">
          RANKING <span className="text-primary">WIDZÓW</span>
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Najaktywniejsi widzowie na kanale. Zbieraj punkty i czas oglądania, aby piąć się w górę rankingu!
        </p>
      </div>

      {/* User Status Card */}
      {user && (
        <div className="mb-12">
          <Card className="relative overflow-hidden border-primary/20 bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-2xl">
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -left-24 h-48 w-48 bg-primary/20 blur-[80px]" />
            <div className="absolute -bottom-24 -right-24 h-48 w-48 bg-accent/20 blur-[80px]" />
            
            <CardContent className="relative z-10 p-6 sm:p-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
                    <Avatar className="h-20 w-20 border-2 border-white/10 ring-4 ring-primary/20">
                      <AvatarImage src={user.kickAvatar} alt={user.kickUsername} />
                      <AvatarFallback className="bg-muted text-2xl font-black">{user.kickUsername.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">TWOJA <span className="text-primary text-3xl">TOPKA</span></h3>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{user.kickUsername}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                  <div className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-3">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div className="font-display text-2xl font-black italic text-white line-height-none">
                      #{pointsRanking.find(p => p.kickUsername === user.kickUsername)?.rank || "?"}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/70 mt-1">Ranking Punktów</p>
                  </div>

                  <div className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 mb-3">
                      <Clock className="h-5 w-5 text-accent" />
                    </div>
                    <div className="font-display text-2xl font-black italic text-white line-height-none">
                      #{timeRanking.find(p => p.kickUsername === user.kickUsername)?.rank || "?"}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-accent/70 mt-1">Ranking Czasu</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* POINTS LEADERBOARD (LEFT) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="flex items-center gap-3 font-display text-2xl font-black italic uppercase text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              {t("leaderboard.filter.points")}
            </h2>
          </div>

          <Card className="overflow-hidden border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl">
            <div className="divide-y divide-white/5">
              {pointsRanking.map((entry) => (
                <div 
                  key={`points-${entry.kickUsername}`} 
                  className={`group flex items-center gap-4 px-4 py-4 transition-all hover:bg-white/[0.03] ${entry.kickUsername === user?.kickUsername ? "bg-primary/10 border-l-4 border-primary" : ""}`}
                >
                  <div className={`w-10 shrink-0 text-center font-display text-lg font-black italic ${getRankColor(entry.rank)}`}>
                    {entry.rank}
                  </div>
                  <div className="relative">
                    <Avatar className="h-10 w-10 border border-white/10 group-hover:scale-105 transition-transform">
                      <AvatarImage src={entry.kickAvatar} alt={entry.kickUsername} />
                      <AvatarFallback className="bg-muted text-xs font-bold">{entry.kickUsername.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -left-1">
                      {getRankBadge(entry.rank)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`truncate font-display font-bold text-sm ${entry.kickUsername === user?.kickUsername ? "text-primary" : "text-white"}`}>
                        {entry.kickUsername}
                      </p>
                      {entry.kickUsername === user?.kickUsername && (
                        <Badge className="h-4 px-1 text-[8px] bg-primary text-black font-black uppercase">TY</Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mt-1 group-hover:text-primary/70 transition-colors">
                      {formatWatchTime(entry.watchTimeMinutes)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-base font-black italic text-primary">
                      {entry.points.toLocaleString()}
                    </div>
                    <p className="text-[9px] text-white/20 uppercase font-black tracking-tighter italic">PUNKTY</p>
                  </div>
                </div>
              ))}
              {pointsRanking.length === 0 && (
                <div className="py-20 text-center opacity-20 italic">Brak danych</div>
              )}
            </div>
          </Card>
        </div>

        {/* WATCH TIME LEADERBOARD (RIGHT) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="flex items-center gap-3 font-display text-2xl font-black italic uppercase text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 border border-accent/30">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              {t("leaderboard.filter.time")}
            </h2>
          </div>

          <Card className="overflow-hidden border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl">
            <div className="divide-y divide-white/5">
              {timeRanking.map((entry) => (
                <div 
                  key={`time-${entry.kickUsername}`} 
                  className={`group flex items-center gap-4 px-4 py-4 transition-all hover:bg-white/[0.03] ${entry.kickUsername === user?.kickUsername ? "bg-accent/10 border-l-4 border-accent" : ""}`}
                >
                  <div className={`w-10 shrink-0 text-center font-display text-lg font-black italic ${getRankColor(entry.rank)}`}>
                    {entry.rank}
                  </div>
                  <div className="relative">
                    <Avatar className="h-10 w-10 border border-white/10 group-hover:scale-105 transition-transform">
                      <AvatarImage src={entry.kickAvatar} alt={entry.kickUsername} />
                      <AvatarFallback className="bg-muted text-xs font-bold">{entry.kickUsername.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -left-1">
                      {getRankBadge(entry.rank)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`truncate font-display font-bold text-sm ${entry.kickUsername === user?.kickUsername ? "text-accent" : "text-white"}`}>
                        {entry.kickUsername}
                      </p>
                      {entry.kickUsername === user?.kickUsername && (
                        <Badge className="h-4 px-1 text-[8px] bg-accent text-black font-black uppercase">TY</Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mt-1 group-hover:text-accent/70 transition-colors">
                      {entry.points.toLocaleString()} pkt
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-base font-black italic text-accent">
                      {formatWatchTime(entry.watchTimeMinutes)}
                    </div>
                    <p className="text-[9px] text-white/20 uppercase font-black tracking-tighter italic">CZAS</p>
                  </div>
                </div>
              ))}
              {timeRanking.length === 0 && (
                <div className="py-20 text-center opacity-20 italic">Brak danych</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function formatWatchTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}
