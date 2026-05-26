"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import useSWR from "swr"
import {
  User,
  Coins,
  Clock,
  TrendingUp,
  Trophy,
  Zap,
  Calendar,
  History,
  Sparkles,
  Play,
  ArrowRight,
  Shield,
  Activity,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Target,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/lib/language-context"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Consistent number formatting to avoid hydration mismatches
function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return "0"
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export default function ProfilePage() {
  const { data: userData, isLoading, mutate } = useSWR("/api/auth/me", fetcher)
  const { data: activitiesData } = useSWR("/api/user/activities", fetcher)
  const { t } = useLanguage()
  const user = userData?.user
  
  const [stakeUsername, setStakeUsername] = useState(user?.stakeUsername || "")
  const [isVerifying, setIsVerifying] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "activity">("overview")

  const handleStakeVerify = async () => {
    if (!stakeUsername || stakeUsername.length < 3) {
      toast.error("Wprowadź prawidłową nazwę użytkownika Stake")
      return
    }

    setIsVerifying(true)
    try {
      const response = await fetch("/api/user/verify-stake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stakeUsername }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Wystąpił błąd podczas weryfikacji")
      }

      toast.success("Konto Stake zostało pomyślnie zweryfikowane!")
      mutate() // Refresh user data
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsVerifying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-12">
        <div className="animate-pulse space-y-12">
          <div className="flex flex-col items-center">
            <div className="h-32 w-32 rounded-full bg-muted skeleton-shimmer" />
            <div className="mt-6 h-8 w-48 rounded-lg bg-muted skeleton-shimmer" />
            <div className="mt-3 h-5 w-32 rounded bg-muted skeleton-shimmer" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="h-32 rounded-2xl bg-muted skeleton-shimmer" />
            <div className="h-32 rounded-2xl bg-muted skeleton-shimmer" />
            <div className="h-32 rounded-2xl bg-muted skeleton-shimmer" />
            <div className="h-32 rounded-2xl bg-muted skeleton-shimmer" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12 lg:px-12">
        <Card className="border-dashed border-2 border-border/50 bg-gradient-to-br from-muted/20 to-transparent">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="relative">
              <div className="rounded-full bg-muted/50 p-8 animate-pulse">
                <User className="h-16 w-16 text-muted-foreground/50" />
              </div>
              <div className="absolute -bottom-2 -right-2 rounded-full bg-primary/20 p-2">
                <Zap className="h-5 w-5 text-primary" />
              </div>
            </div>
            <h3 className="mt-8 font-display text-2xl font-bold text-foreground">
              {t("profile.notLoggedIn.title")}
            </h3>
            <p className="mt-3 text-muted-foreground max-w-md">
              {t("profile.notLoggedIn.desc")}
            </p>
            <Button asChild size="lg" className="mt-8 bg-primary hover:bg-primary/90 px-8 h-12 text-base gap-2 btn-interactive">
              <a href="/api/auth/kick">
                <Zap className="h-5 w-5" />
                {t("profile.loginWithKick")}
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const watchHours = Math.floor(user.watchTimeMinutes / 60)
  const watchMins = user.watchTimeMinutes % 60
  
  const canVerify = !user.lastStakeVerificationDate || (
    Math.abs(new Date().getTime() - new Date(user.lastStakeVerificationDate).getTime()) / (1000 * 60 * 60 * 24) >= 7
  )

  const daysLeft = user.lastStakeVerificationDate ? Math.ceil(7 - (Math.abs(new Date().getTime() - new Date(user.lastStakeVerificationDate).getTime()) / (1000 * 60 * 60 * 24))) : 0

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-12">
      {/* Profile Header */}
      <div className="relative mb-16 flex flex-col items-center text-center">
        <div className="absolute -top-24 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
        
        <div className="group relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 blur-2xl scale-125 opacity-50 transition-all group-hover:scale-150 group-hover:opacity-70" />
          <Avatar className="relative h-36 w-36 border-4 border-background shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)] ring-1 ring-white/10">
            <AvatarImage 
              src={user.kickAvatar || "/kasyno8.png"} 
              alt={user.kickUsername} 
            />
            <AvatarFallback className="bg-muted text-foreground text-4xl font-display font-black">
              {user.kickUsername.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-4 border-background shadow-lg" title="Online" />
        </div>
        
        <h1 className="mt-8 font-display text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          {user.kickUsername}
        </h1>
        
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-muted-foreground/80">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-muted/30 rounded-full ring-1 ring-white/5">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Kick ID: {user.kickId}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-muted/30 rounded-full ring-1 ring-white/5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            {t("profile.memberSince")} 2024
          </span>
        </div>
        
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {user.isAdmin && (
            <Badge className="bg-primary/20 text-primary border border-primary/30 px-3 py-1.5 gap-1.5 hover:bg-primary/30 transition-colors">
              <Shield className="h-3.5 w-3.5" />
              {t("profile.badges.admin")}
            </Badge>
          )}
          {user.isDeveloper && (
            <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1.5 gap-1.5 hover:bg-purple-500/30 transition-colors">
              <Zap className="h-3.5 w-3.5" />
              {t("profile.badges.developer")}
            </Badge>
          )}
          <Badge variant="outline" className="bg-muted/10 border-white/5 text-muted-foreground/80 px-3 py-1.5 gap-1.5">
            <Play className="h-3.5 w-3.5 text-primary" />
            {t("profile.badges.activeViewer")}
          </Badge>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => setActiveTab("overview")}
          className={`font-display text-xl font-bold flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === "overview" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-white"}`}
        >
          <Activity className="h-5 w-5" />
          {t("profile.tabs.overview")}
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => setActiveTab("activity")}
          className={`font-display text-xl font-bold flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === "activity" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-white"}`}
        >
          <History className="h-5 w-5" />
          {t("profile.tabs.activity")}
        </Button>
        <div className="h-px flex-1 ml-2 bg-gradient-to-r from-border/50 to-transparent" />
      </div>

      {activeTab === "overview" && (
        <>
          {/* Stats Grid */}
          <div className="mb-16 grid gap-6 sm:grid-cols-3">
            <Card className="relative overflow-hidden border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <p className="font-display text-4xl font-black tracking-tight text-white">{formatNumber(user.points)}</p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground/60">{t("points")}</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/20">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <p className="font-display text-4xl font-black tracking-tight text-white">
                  {watchHours > 0 ? `${watchHours}h ${watchMins}m` : `${watchMins}m`}
                </p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground/60">{t("watchTime")}</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 ring-1 ring-purple-500/20">
                  <Trophy className="h-6 w-6 text-purple-400" />
                </div>
                <p className="font-display text-4xl font-black tracking-tight text-white">#{user.rank || "---"}</p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground/60">{t("profile.stats.ranking")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Stake Connection Section */}
          <div className="mb-16 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-primary" />
                {t("profile.stake.title")}
              </h2>
              <div className="h-px flex-1 ml-6 bg-gradient-to-r from-border/50 to-transparent" />
            </div>

            <Card className="overflow-hidden border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl">
              <CardContent className="p-6 sm:p-10">
                <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ff2745]/10 ring-1 ring-[#ff2745]/30">
                        <Image src="/stake-icon.webp" alt="Stake" width={32} height={32} className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">{t("profile.stake.title")}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {user.isStakeVerified ? (
                            <Badge className="bg-green-500/20 text-green-500 border border-green-500/30 gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {t("profile.stake.verified")}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-white/5 text-muted-foreground border-white/5 uppercase text-[10px] tracking-widest font-black italic">
                              {t("profile.stake.notVerified")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{t("profile.stake.desc")}</p>
                  </div>

                  <div className="w-full lg:w-96 space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                        {t("profile.stake.username")}
                      </label>
                      <Input 
                        placeholder={t("profile.stake.username")}
                        value={stakeUsername}
                        onChange={(e) => setStakeUsername(e.target.value)}
                        disabled={isVerifying || !canVerify}
                        className="bg-white/5 border-white/10 h-12"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleStakeVerify}
                      disabled={isVerifying || !canVerify || !stakeUsername}
                      className="w-full h-12 bg-primary hover:bg-primary/90 glow-green font-bold text-sm uppercase tracking-widest italic"
                    >
                      {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t("profile.stake.verify")}
                    </Button>

                    {!canVerify && (
                      <p className="text-center text-[10px] font-bold text-destructive/80 uppercase tracking-widest">
                        {t("profile.stake.cooldown")} (Za {daysLeft} dni)
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === "activity" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              {t("profile.activity.title")}
            </h2>
            <div className="h-px flex-1 ml-6 bg-gradient-to-r from-border/50 to-transparent" />
          </div>

          <Card className="border-white/5 bg-[#0a0a0a]/40 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              {activitiesData?.activities && activitiesData.activities.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {activitiesData.activities.map((activity: any) => (
                    <div key={activity._id} className="p-4 sm:p-6 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
                      <div className="mt-1 h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                        {activity.type === "giveaway_entry" && <Trophy className="h-5 w-5 text-primary" />}
                        {activity.type === "bonus_guess" && <Target className="h-5 w-5 text-primary" />}
                        {activity.type === "prediction_bet" && <Zap className="h-5 w-5 text-primary" />}
                        {activity.type === "stake_verify" && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        {activity.type === "shop_purchase" && <History className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-white truncate">{activity.title}</h4>
                          <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground whitespace-nowrap">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 px-4 text-center">
                  <div className="mb-6 rounded-full bg-muted/10 p-6 inline-block">
                    <History className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                  <p className="text-xl font-display font-bold text-foreground/80">{t("profile.activity.empty")}</p>
                  <p className="mt-3 text-sm text-muted-foreground/50 max-w-sm mx-auto">{t("profile.activity.info")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer Return Button */}
      <div className="mt-20 text-center">
        <Button asChild variant="ghost" className="text-muted-foreground hover:text-primary transition-all gap-2 px-6 rounded-full">
          <Link href="/">
            <ArrowRight className="h-4 w-4 rotate-180" />
            {t("returnToSite")}
          </Link>
        </Button>
      </div>
    </div>
  )
}
