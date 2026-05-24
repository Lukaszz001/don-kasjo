"use client"

import { useState, useEffect } from "react"
import { 
  Clock, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Zap, 
  Flame,
  Trophy,
  Coins,
  Timer,
  Sparkles,
  ArrowRight,
  History,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PredictionBetDialog } from "@/components/predictions/bet-dialog"
import { isPast, differenceInSeconds } from "date-fns"
import { useLanguage } from "@/lib/language-context"
import { cn } from "@/lib/utils"
import useSWR from "swr"
import { apiFetcher } from "@/lib/api-client"

function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return "0"
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

interface Prediction {
  _id: string
  question: string
  option1: string
  option2: string
  status: "open" | "closed" | "resolved" | "refunded"
  winningOption: 1 | 2 | null
  totalPointsOption1: number
  totalPointsOption2: number
  totalBetsOption1: number
  totalBetsOption2: number
  closesAt: string
  createdAt: string
}

export function PredictionsContent({ initialPredictions }: { initialPredictions: Prediction[] }) {
  const { t } = useLanguage()
  const { data: response, mutate: mutatePredictions } = useSWR<{ predictions: Prediction[] }>("/api/predictions", apiFetcher, { 
    fallbackData: { predictions: initialPredictions },
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: () => document.visibilityState === "visible" ? 10000 : 0,
  })
  
  const { data: userData, mutate: mutateUser } = useSWR("/api/auth/me", apiFetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: () => document.visibilityState === "visible" ? 10000 : 0,
  })
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null)

  const user = userData?.user

  // Ensure predictions is always an array
  const predictionsList = response?.predictions || initialPredictions

  const openPredictions = predictionsList.filter((p) => p.status === "open" && !isPast(new Date(p.closesAt)))
  const closedPredictions = predictionsList.filter(
    (p) => p.status === "closed" || p.status === "resolved" || p.status === "refunded" || isPast(new Date(p.closesAt))
  )

  const totalPool = predictionsList.reduce((acc, p) => acc + p.totalPointsOption1 + p.totalPointsOption2, 0)
  const totalBets = predictionsList.reduce((acc, p) => acc + p.totalBetsOption1 + p.totalBetsOption2, 0)

  const handleRefresh = () => {
    mutatePredictions()
    mutateUser()
  }

  return (
    <div className="relative min-h-screen px-4 py-12 lg:px-8">
      
      {/* Ambient background glows */}
      <div className="absolute top-0 left-0 -z-10 h-[500px] w-[500px] bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-0 right-0 -z-10 h-[500px] w-[500px] bg-accent/5 blur-[120px]" />

      <div className="mx-auto max-w-6xl space-y-12">
        {/* Header Section */}
        <div className="text-center lg:text-left">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-primary badge-shine">
            <TrendingUp className="h-4 w-4" />
            {t("nav.predictions")}
          </div>
          <h1 className="font-display text-4xl font-black text-white lg:text-7xl uppercase italic tracking-tighter leading-none mb-4">
            {t("predictions.live")} <span className="text-primary">{t("predictions.title")}</span>
          </h1>
          <p className="mx-auto lg:mx-0 max-w-2xl text-muted-foreground border-l-4 border-primary/50 pl-6 leading-relaxed">
            {t("predictions.subtitle")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatSummaryCard 
            icon={<Flame className="h-6 w-6 text-primary" />} 
            value={openPredictions.length.toString()} 
            label={t("predictions.stats.active")} 
            color="primary"
          />
          <StatSummaryCard 
            icon={<Coins className="h-6 w-6 text-accent" />} 
            value={`${(totalPool / 1000).toFixed(0)}k`} 
            label={t("predictions.stats.pool")} 
            color="accent"
          />
          <StatSummaryCard 
            icon={<Users className="h-6 w-6 text-purple-400" />} 
            value={formatNumber(totalBets)} 
            label={t("predictions.stats.bets")} 
            color="purple"
          />
          <StatSummaryCard 
            icon={<Trophy className="h-6 w-6 text-emerald-400" />} 
            value={closedPredictions.filter(p => p.status === "resolved").length.toString()} 
            label={t("predictions.stats.resolved")} 
            color="emerald"
          />
        </div>

        <Tabs defaultValue="open" className="w-full">
          <TabsList className="mb-8 flex h-16 w-full items-center justify-start rounded-2xl border border-white/10 bg-[#0a0a0a]/60 p-1.5 backdrop-blur-xl">
            <TabsTrigger 
              value="open" 
              className="relative h-full flex-1 gap-2 rounded-xl font-black italic uppercase tracking-widest text-[10px] transition-all data-[state=active]:bg-primary data-[state=active]:text-black glow-green"
            >
              <Flame className="h-4 w-4" />
              {t("predictions.tabs.active")}
              <Badge className="ml-2 bg-black/20 text-current border-none font-black">{openPredictions.length}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="closed" 
              className="relative h-full flex-1 gap-2 rounded-xl font-black italic uppercase tracking-widest text-[10px] transition-all data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              <History className="h-4 w-4" />
              {t("predictions.tabs.closed")}
              <Badge className="ml-2 bg-white/5 text-current border-none font-black">{closedPredictions.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {openPredictions.length === 0 ? (
              <Card className="border-dashed border-2 py-24 text-center bg-white/5 border-white/10">
                  <TrendingUp className="mx-auto h-20 w-20 text-muted-foreground/20 mb-6" />
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white/40">{t("predictions.empty.active.title")}</h3>
                  <p className="text-muted-foreground italic">"{t("predictions.empty.active.desc")}"</p>
              </Card>
            ) : (
              openPredictions.map((prediction, index) => (
                <PredictionCard
                  key={prediction._id}
                  prediction={prediction}
                  user={user}
                  onBet={() => setSelectedPrediction(prediction)}
                  index={index}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="closed" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {closedPredictions.map((prediction, index) => (
              <PredictionCard
                key={prediction._id}
                prediction={prediction}
                user={user}
                onBet={() => {}}
                index={index}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {selectedPrediction && (
        <PredictionBetDialog
          prediction={selectedPrediction}
          userPoints={user?.points || 0}
          open={!!selectedPrediction}
          onOpenChange={(open) => !open && setSelectedPrediction(null)}
          onSuccess={() => {
            setSelectedPrediction(null)
            handleRefresh()
          }}
        />
      )}
    </div>
  )
}

function PredictionCard({ prediction, user, onBet, index }: { prediction: Prediction, user: any, onBet: () => void, index: number }) {
  const { t } = useLanguage()
  const [timeLeft, setTimeLeft] = useState("")

  const totalPoints = prediction.totalPointsOption1 + prediction.totalPointsOption2
  const option1Percent = totalPoints > 0 ? Math.round((prediction.totalPointsOption1 / totalPoints) * 100) : 50
  const option2Percent = 100 - option1Percent

  const isExpired = isPast(new Date(prediction.closesAt))
  const isOpen = prediction.status === "open" && !isExpired

  useEffect(() => {
    if (!isOpen) return
    const updateTimer = () => {
      const seconds = differenceInSeconds(new Date(prediction.closesAt), new Date())
      if (seconds <= 0) {
        setTimeLeft(t("predictions.status.ended"))
        return
      }
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      setTimeLeft(hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${secs}s`)
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [prediction.closesAt, isOpen])

  return (
    <Card className={cn(
      "relative overflow-hidden border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl transition-all duration-500 group",
      isOpen ? "hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5" : ""
    )}>
      {/* Rim light top */}
      <div className={cn(
        "absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-500",
        isOpen ? "group-hover:via-primary/50" : ""
      )} />

      {/* Inner glows */}
      <div className={cn(
        "absolute -top-12 -right-12 h-24 w-24 blur-[30px] opacity-0 transition-opacity duration-500",
        isOpen ? "bg-primary/10 group-hover:opacity-100" : ""
      )} />

      <CardHeader className="p-8 pb-4 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            <h3 className="font-display text-2xl font-black italic uppercase tracking-tighter text-white group-hover:text-primary transition-colors lg:text-3xl leading-none">
              {prediction.question}
            </h3>
            
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <Users className="h-4 w-4 text-white/40" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                  {prediction.totalBetsOption1 + prediction.totalBetsOption2} {t("predictions.stats.bets")}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Coins className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  {formatNumber(totalPoints)} {t("predictions.stats.pointsInPool")}
                </span>
              </div>
              {isOpen && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 animate-pulse">
                  <Clock className="h-4 w-4 text-accent" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent">
                    {timeLeft}
                  </span>
                </div>
              )}
            </div>
          </div>
          <PredictionStatusBadge status={prediction.status} isExpired={isExpired} />
        </div>
      </CardHeader>
      
      <CardContent className="p-8 pt-0 space-y-8 relative z-10">
        <div className="grid gap-6 sm:grid-cols-2">
            <PredictionOptionBar 
              label={prediction.option1} 
              percent={option1Percent} 
              points={prediction.totalPointsOption1} 
              isWinner={prediction.winningOption === 1} 
              isOpen={isOpen} 
              color="primary"
            />
            <PredictionOptionBar 
              label={prediction.option2} 
              percent={option2Percent} 
              points={prediction.totalPointsOption2} 
              isWinner={prediction.winningOption === 2} 
              isOpen={isOpen} 
              color="accent"
            />
        </div>

        {isOpen && (
          <Button 
            onClick={onBet} 
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black italic uppercase tracking-widest text-sm glow-green transition-all duration-300 transform active:scale-95 group/btn"
          >
            <Zap className="h-5 w-5 mr-3 transition-transform group-hover/btn:scale-125" />
            {t("predictions.btn.betNow")}
            <ArrowRight className="ml-3 h-5 w-5 opacity-50 transition-transform group-hover/btn:translate-x-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function PredictionOptionBar({ label, percent, points, isWinner, isOpen, color }: { label: string, percent: number, points: number, isWinner: boolean, isOpen: boolean, color: "primary" | "accent" }) {
  const { t } = useLanguage()
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-700",
      isWinner 
        ? "border-green-500/50 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.1)]" 
        : "border-white/5 bg-white/5 hover:border-white/10"
    )}>
      {/* Percentage bar background */}
      <div 
        className={cn(
          "absolute inset-y-0 left-0 transition-all duration-1000 opacity-20",
          isWinner ? "bg-green-500" : (color === "primary" ? "bg-primary" : "bg-accent")
        )} 
        style={{ width: `${percent}%` }} 
      />
      
      <div className="relative flex items-center justify-between mb-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">OPCJA</span>
          <h4 className="text-xl font-black text-white italic uppercase tracking-tighter truncate leading-none">{label}</h4>
        </div>
        <div className="text-right">
          <span className="block font-display text-3xl font-black italic text-white leading-none">{percent}%</span>
        </div>
      </div>

      <div className="relative flex items-center justify-between mt-6">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <Coins className="h-3 w-3 text-white/40" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{formatNumber(points)} PKT</span>
        </div>
        {isWinner && (
          <div className="flex items-center gap-2 text-green-400">
            <Trophy className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{t("predictions.winner")}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function PredictionStatusBadge({ status, isExpired }: { status: string, isExpired: boolean }) {
  const { t } = useLanguage()
  if (status === "resolved") return (
    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 font-black italic uppercase tracking-widest text-[10px] rounded-xl flex items-center gap-2">
      <CheckCircle2 className="h-3.5 w-3.5" />
      {t("predictions.status.resolvedLabel")}
    </Badge>
  )
  if (status === "closed" || isExpired) return (
    <Badge variant="secondary" className="bg-white/5 text-white/40 border border-white/10 px-4 py-2 font-black italic uppercase tracking-widest text-[10px] rounded-xl flex items-center gap-2">
      <Clock className="h-3.5 w-3.5" />
      {t("predictions.status.closedLabel")}
    </Badge>
  )
  return (
    <Badge className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 font-black italic uppercase tracking-widest text-[10px] rounded-xl animate-pulse flex items-center gap-2">
      <Flame className="h-3.5 w-3.5" />
      {t("predictions.status.activeLabel")}
    </Badge>
  )
}

function StatSummaryCard({ icon, value, label, color }: { icon: any, value: string, label: string, color: string }) {
  const bgStyles: Record<string, string> = {
    primary: "bg-primary/10 border-primary/20 group-hover:border-primary/50",
    accent: "bg-accent/10 border-accent/20 group-hover:border-accent/50",
    purple: "bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/50",
    emerald: "bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/50",
  }

  const glowStyles: Record<string, string> = {
    primary: "bg-primary/5 group-hover:opacity-100",
    accent: "bg-accent/5 group-hover:opacity-100",
    purple: "bg-purple-500/5 group-hover:opacity-100",
    emerald: "bg-emerald-500/5 group-hover:opacity-100",
  }

  return (
    <Card className="relative overflow-hidden border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl group transition-all duration-300">
      <div className={cn("absolute inset-0 blur-2xl opacity-0 transition-opacity duration-300", glowStyles[color])} />
      <CardContent className="relative z-10 flex items-center gap-5 p-8">
        <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-300", bgStyles[color])}>
          {icon}
        </div>
        <div className="space-y-1">
          <p className="font-display text-3xl font-black italic uppercase leading-none tracking-tighter text-white">{value}</p>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
