"use client"

import { useEffect, useState, useMemo } from "react"
import { 
  Target, 
  TrendingUp, 
  Coins, 
  Gamepad2, 
  BarChart3, 
  CheckCircle2, 
  Timer,
  Plus,
  Trash2,
  RefreshCw,
  Share2,
  Save,
  Play,
  Pencil
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { useLanguage } from "@/lib/language-context"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Game {
  id: string
  name: string
  bet: number
  win: number
  isOpened: boolean
}

function createClientId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function BonusHuntPage() {
  const { t } = useLanguage()
  const [isHydrated, setIsHydrated] = useState(false)
  const [startBalance, setStartBalance] = useState<number>(1000)
  const [games, setGames] = useState<Game[]>([])
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newGameName, setNewGameName] = useState("")
  const [newGameBet, setNewGameBet] = useState<string>("2")
  
  // Edit Win states
  const [editingGameId, setEditingGameId] = useState<string | null>(null)
  const [editWinValue, setEditWinValue] = useState<string>("0")

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem("donkasjo:bonus-hunt")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setGames(parsed.games || [])
        setStartBalance(parsed.startBalance || 1000)
      } catch (e) {
        console.error("Failed to load bonus hunt from storage", e)
      }
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("donkasjo:bonus-hunt", JSON.stringify({ games, startBalance }))
    }
  }, [games, startBalance, isHydrated])

  // Calculations
  const stats = useMemo(() => {
    const totalCost = games.reduce((acc, g) => acc + g.bet, 0)
    const totalWin = games.reduce((acc, g) => acc + g.win, 0)
    const openedGames = games.filter(g => g.isOpened).length
    const avgBet = games.length > 0 ? totalCost / games.length : 0
    const multiplier = totalCost > 0 ? (totalWin / totalCost).toFixed(2) : "0.00"
    const profit = totalWin - totalCost
    const profitPercentage = totalCost > 0 ? (((totalWin - totalCost) / totalCost) * 100).toFixed(1) : "0.0"

    return { totalCost, totalWin, openedGames, avgBet, multiplier, profit, profitPercentage }
  }, [games])

  // Handlers
  const addGame = () => {
    if (!newGameName.trim()) return
    const newGame: Game = {
      id: createClientId(),
      name: newGameName,
      bet: parseFloat(newGameBet) || 0,
      win: 0,
      isOpened: false
    }
    setGames([...games, newGame])
    setNewGameName("")
    setNewGameBet("2")
    setIsAddOpen(false)
    toast.success(t("bonusHunt.toast.added"))
  }

  const deleteGame = (id: string) => {
    setGames(games.filter(g => g.id !== id))
    toast.info(t("bonusHunt.toast.removed"))
  }

  const openEditWin = (game: Game) => {
    setEditingGameId(game.id)
    setEditWinValue(game.win.toString())
  }

  const saveWinValue = () => {
    if (!editingGameId) return
    const win = parseFloat(editWinValue) || 0
    setGames(games.map(g => g.id === editingGameId ? { ...g, win, isOpened: true } : g))
    setEditingGameId(null)
    toast.success(t("bonusHunt.toast.saved"))
  }

  const toggleOpened = (id: string) => {
    setGames(games.map(g => g.id === id ? { ...g, isOpened: !g.isOpened, win: !g.isOpened ? g.win : 0 } : g))
  }

  const resetHunt = () => {
    if (confirm(t("bonusHunt.confirmReset"))) {
      setGames([])
      setStartBalance(1000)
      toast.info(t("bonusHunt.toast.reset"))
    }
  }

  const shareHunt = () => {
    const text = `DON KASJO BONUS HUNT\nStart: $${startBalance}\nGames: ${games.length}\nTotal Win: $${stats.totalWin}\nProfit: $${stats.profit}\nJoin: kick.com/don-kasjo`
    navigator.clipboard.writeText(text)
    toast.success(t("bonusHunt.toast.shared"))
  }

  if (!isHydrated) return null

  return (
    <div className="relative min-h-screen">
      {/* Deep Dark Base Background */}
      <div className="fixed inset-0 -z-20 bg-[#050505]" />
      <div
        className="fixed inset-0 -z-10 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, oklch(0.68 0.22 150 / 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, oklch(0.68 0.22 150 / 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(circle at 50% 50%, black, transparent 95%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, black, transparent 95%)",
        }}
      />

      <div className="container mx-auto max-w-6xl px-4 py-16 space-y-12 mb-20">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-[10px] font-black text-primary tracking-[0.2em] uppercase badge-shine">
              <Target className="h-4 w-4" />
              {t("bonusHunt.personalTracker")}
            </div>
            <h1 className="text-6xl font-black tracking-tighter text-white sm:text-8xl font-display uppercase italic leading-[0.8]">
              {t("bonusHunt.title")} <span className="text-primary italic">HUNT</span>
            </h1>
            <p className="text-lg text-white/40 italic border-l-2 border-primary/30 pl-8 max-w-2xl leading-relaxed">
              {t("bonusHunt.trackerDesc")}
            </p>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 lg:overflow-visible no-scrollbar">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="h-14 lg:h-16 px-6 lg:px-8 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black italic uppercase tracking-widest text-[10px] lg:text-sm glow-green transition-all transform hover:scale-105 active:scale-95 group shrink-0">
                  <Plus className="h-4 w-4 lg:h-5 lg:w-5 transition-transform group-hover:rotate-90" /> {t("bonusHunt.addGame")}
                </Button>
              </DialogTrigger>
              <DialogContent className="border-white/10 bg-[#0a0a0a]/95 backdrop-blur-2xl">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">{t("bonusHunt.addNewBonus")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-6 font-display">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40">{t("bonusHunt.gameName")}</Label>
                    <Input
                      placeholder="e.g. Sugar Rush"
                      value={newGameName}
                      onChange={(e) => setNewGameName(e.target.value)}
                      className="h-14 bg-white/5 border-white/10 rounded-xl font-bold text-white placeholder:text-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40">{t("bonusHunt.betAmount")}</Label>
                    <Input
                      type="number"
                      value={newGameBet}
                      onChange={(e) => setNewGameBet(e.target.value)}
                      className="h-14 bg-white/5 border-white/10 rounded-xl font-bold text-white"
                    />
                  </div>
                </div>
                <DialogFooter className="gap-3">
                  <Button variant="ghost" className="h-12 rounded-xl text-white/40 hover:text-white" onClick={() => setIsAddOpen(false)}>
                    {t("common.cancel") || "Cancel"}
                  </Button>
                  <Button onClick={addGame} className="h-12 rounded-xl bg-primary text-black font-black italic px-8">
                    {t("bonusHunt.addToHunt")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={shareHunt} className="h-14 lg:h-16 px-6 lg:px-8 rounded-2xl border-white/10 bg-white/5 text-white font-black italic uppercase tracking-widest text-[10px] lg:text-sm hover:bg-white/10 hover:border-white/20 transition-all shrink-0">
              <Share2 className="h-4 w-4 lg:h-5 lg:w-5 mr-1 lg:mr-2" /> {t("bonusHunt.share")}
            </Button>

            <Button variant="outline" onClick={resetHunt} className="h-14 lg:h-16 px-6 lg:px-8 rounded-2xl border-destructive/20 bg-destructive/5 text-destructive font-black italic uppercase tracking-widest text-[10px] lg:text-sm hover:bg-destructive/10 hover:border-destructive/40 transition-all shrink-0">
              <RefreshCw className="h-4 w-4 lg:h-5 lg:w-5 mr-1 lg:mr-2" /> {t("bonusHunt.reset")}
            </Button>
          </div>
        </div>

        {/* Start Balance Bar - Refined */}
        <Card className="relative overflow-hidden border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <CardContent className="p-8 sm:p-10">
            <div className="flex flex-col lg:flex-row items-center gap-10">
              <div className="flex items-center gap-6 shrink-0 bg-white/5 border border-white/5 p-6 rounded-[2.5rem]">
                <div className="h-16 w-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-black shadow-[0_0_30px_rgba(22,163,74,0.3)]">
                  <Coins className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em]">{t("bonusHunt.startBalance")}</p>
                  <p className="text-4xl font-black italic text-white tracking-tighter">${startBalance.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex-1 w-full flex items-center gap-8">
                <input
                  type="range"
                  min="10"
                  max="100000"
                  step="10"
                  value={startBalance}
                  onChange={(e) => setStartBalance(parseInt(e.target.value))}
                  className="flex-1 h-3 bg-white/5 rounded-full appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-all"
                />
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black italic text-white/20 select-none">$</span>
                  <Input
                    type="number"
                    value={startBalance}
                    onChange={(e) => setStartBalance(parseInt(e.target.value) || 0)}
                    className="w-32 h-16 pl-8 bg-white/5 border-white/10 rounded-2xl text-center text-xl font-black italic text-white focus:border-primary/50 transition-all"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid - High Contrast */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatMiniCard label={t("bonusHunt.totalCost")} value={`$${stats.totalCost.toLocaleString()}`} icon={<Save className="h-5 w-5" />} />
          <StatMiniCard
            label={t("bonusHunt.totalWin")}
            value={`$${stats.totalWin.toLocaleString()}`}
            icon={<TrendingUp className="h-5 w-5" />}
            highlight={stats.totalWin > 0}
            status={stats.profit > 0 ? "positive" : stats.profit < 0 ? "negative" : undefined}
          />
          <StatMiniCard label={t("bonusHunt.multiplier")} value={`${stats.multiplier}x`} icon={<BarChart3 className="h-5 w-5" />} />
          <StatMiniCard label={t("bonusHunt.games")} value={`${stats.openedGames} / ${games.length}`} icon={<Gamepad2 className="h-5 w-5" />} />
        </div>

        {/* Main List */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-10 w-2 bg-primary rounded-full shadow-[0_0_15px_var(--primary)]" />
            <h2 className="font-display text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{t("bonusHunt.list")}</h2>
          </div>

          {games.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02] text-center space-y-6">
              <div className="h-24 w-24 rounded-[2rem] bg-white/5 flex items-center justify-center text-white/10 border border-white/5">
                <Gamepad2 className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <p className="text-white text-xl font-black italic uppercase tracking-widest">{t("bonusHunt.empty")}</p>
                <p className="text-white/20 font-medium italic">{t("bonusHunt.emptyDesc")}</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {games.map((game, idx) => (
                <Card
                  key={game.id}
                  className={cn(
                    "group relative overflow-hidden border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl transition-all duration-300 hover:border-white/20",
                    game.isOpened && "border-primary/20 bg-primary/[0.03]"
                  )}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row items-stretch">
                      {/* Left: ID & Info */}
                      <div className="flex items-center gap-6 p-6 flex-1">
                        <span className="text-white/10 font-black italic text-xl w-8 select-none">#{idx + 1}</span>
                        <div className="space-y-2">
                          <p className="font-display text-2xl font-black italic text-white group-hover:text-primary transition-colors tracking-tight uppercase">
                            {game.name}
                          </p>
                          <div className="flex items-center gap-6 text-[10px] font-black italic text-white/30 uppercase tracking-[0.2em]">
                            <span className="flex items-center gap-2">
                              BET: <span className="text-white">${game.bet}</span>
                            </span>
                            {game.isOpened && (
                              <span className="flex items-center gap-2">
                                MULT: <span className="text-primary tracking-tighter">{(game.win / (game.bet || 1)).toFixed(1)}x</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Results & Actions */}
                      <div className="flex items-center border-t sm:border-t-0 sm:border-l border-white/5 bg-white/[0.02]">
                        <div className="flex flex-col sm:flex-row items-center gap-8 p-6">
                          <div className="flex flex-col items-center sm:items-end text-center sm:text-right min-w-[140px]">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">{t("bonusHunt.result")}</p>
                            <div className="flex items-center gap-3">
                              {game.isOpened ? (
                                <span className="text-4xl font-black italic text-primary tracking-tighter">
                                  ${game.win?.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-3xl font-black italic text-white/5 select-none">{t("bonusHunt.locked")}</span>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openEditWin(game)}
                                className="h-10 w-10 rounded-xl text-white/20 hover:text-white hover:bg-white/10 transition-all"
                              >
                                <Pencil className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Button
                              onClick={() => toggleOpened(game.id)}
                              className={cn(
                                "h-12 px-6 rounded-xl font-black uppercase italic tracking-[0.2em] text-[10px] gap-3 transition-all",
                                game.isOpened
                                  ? "bg-primary text-black hover:bg-primary/90 glow-green"
                                  : "bg-white/5 text-white/30 border border-white/10 hover:bg-white/10 hover:text-white"
                              )}
                            >
                              {game.isOpened ? <CheckCircle2 className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              {game.isOpened ? t("bonusHunt.opened") : t("bonusHunt.open")}
                            </Button>

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteGame(game.id)}
                              className="h-12 w-12 rounded-xl text-destructive/30 hover:text-destructive hover:bg-destructive/10 transition-all"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Win Dialog - Redesigned */}
      <Dialog open={!!editingGameId} onOpenChange={(open) => !open && setEditingGameId(null)}>
        <DialogContent className="border-white/10 bg-[#0a0a0a]/95 backdrop-blur-3xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">{t("bonusHunt.setResult")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-8 text-center font-display">
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/30">{t("bonusHunt.totalWin")}</Label>
              <div className="relative">
                <span className="absolute left-8 top-1/2 -translate-y-1/2 text-4xl font-black italic text-primary/30">$</span>
                <Input
                  type="number"
                  autoFocus
                  value={editWinValue}
                  onChange={(e) => setEditWinValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveWinValue()}
                  className="bg-primary/5 border-primary/20 text-6xl font-black italic text-center h-32 text-primary rounded-2xl focus:border-primary/50 transition-all pr-12"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="ghost" className="h-14 rounded-xl text-white/40 hover:text-white" onClick={() => setEditingGameId(null)}>
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button onClick={saveWinValue} className="h-14 rounded-xl bg-primary text-black font-black italic px-10 glow-green">
              {t("bonusHunt.saveResult")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatMiniCard({
  label,
  value,
  icon,
  highlight = false,
  status,
}: {
  label: string
  value: string
  icon: any
  highlight?: boolean
  status?: "positive" | "negative"
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:translate-y-[-4px] group",
        highlight && "border-primary/20 bg-primary/[0.02]"
      )}
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <CardContent className="p-6 sm:p-8 flex flex-col gap-4">
        <div
          className={cn(
            "h-12 w-12 rounded-[1rem] flex items-center justify-center transition-all duration-500 bg-white/5 group-hover:scale-110",
            status === "positive" ? "text-green-500 bg-green-500/10" : status === "negative" ? "text-red-500 bg-red-500/10" : highlight ? "text-primary bg-primary/10" : "text-white/40"
          )}
        >
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] font-display">{label}</p>
          <p
            className={cn(
              "text-3xl font-black italic text-white tracking-tighter font-display leading-none",
              status === "positive" ? "text-green-500" : status === "negative" ? "text-red-500" : highlight && "text-primary"
            )}
          >
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
