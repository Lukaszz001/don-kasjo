"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import useSWR from "swr"
import { Gift, Play, Square, Shuffle, RotateCcw, Trophy, Users, X, Clock, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AdminModal } from "@/components/admin/admin-modal"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Participant {
  kickId: string
  username: string
  enteredAt: string
}

interface Giveaway {
  _id: string
  phrase: string
  status: "collecting" | "stopped" | "drawn"
  participantCount: number
  participants: Participant[]
  winner: { kickId: string; username: string } | null
  drawnAt: string | null
  createdBy: string
  createdAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-emerald-500","bg-sky-500","bg-violet-500","bg-rose-500",
  "bg-amber-500","bg-teal-500","bg-indigo-500","bg-pink-500",
  "bg-orange-500","bg-cyan-500","bg-lime-500","bg-fuchsia-500",
]
function avatarColor(username: string) {
  let h = 0
  for (let i = 0; i < username.length; i++) h = (h * 31 + username.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

function Avatar({ username, size = "md" }: { username: string; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs"
  return (
    <div className={`${sz} ${avatarColor(username)} flex shrink-0 items-center justify-center rounded-full font-black text-white uppercase shadow-sm`}>
      {username.slice(0, 2)}
    </div>
  )
}

// ─── Participant Grid (live) ───────────────────────────────────────────────────
function ParticipantGrid({ participants }: { participants: Participant[] }) {
  if (participants.length === 0) return (
    <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
      <Users className="h-8 w-8 opacity-30" />
      <p className="text-sm">Czekam na uczestników…</p>
      <p className="text-xs opacity-60">Widzowie wpisują frazę na chacie Kick</p>
    </div>
  )

  const SHOW = 30
  const visible = participants.slice(-SHOW).reverse()
  const extra = Math.max(0, participants.length - SHOW)

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {visible.map((p) => (
          <div
            key={p.kickId}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 text-xs font-medium text-white/80 hover:bg-white/10 transition-colors"
          >
            <Avatar username={p.username} size="sm" />
            {p.username}
          </div>
        ))}
        {extra > 0 && (
          <div className="flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/40">
            +{extra} więcej
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sparkle particles ────────────────────────────────────────────────────────
const PARTICLE_COUNT = 28
const COLORS = ["#22c55e","#a3e635","#fbbf24","#f97316","#38bdf8","#e879f9"]

function Particles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden>
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const angle = (i / PARTICLE_COUNT) * 360
        const dist = 120 + Math.random() * 100
        const size = 4 + Math.random() * 6
        const color = COLORS[i % COLORS.length]
        const delay = Math.random() * 0.4
        const dur = 0.8 + Math.random() * 0.6
        const x = Math.cos((angle * Math.PI) / 180) * dist
        const y = Math.sin((angle * Math.PI) / 180) * dist
        return (
          <div key={i} className="absolute left-1/2 top-1/2 rounded-full"
            style={{ width: size, height: size, backgroundColor: color,
              transform: "translate(-50%,-50%)",
              animation: `particle-burst ${dur}s ${delay}s ease-out both`,
              ["--tx" as any]: `${x}px`, ["--ty" as any]: `${y}px` }} />
        )
      })}
      <style>{`@keyframes particle-burst{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(0);opacity:0}}`}</style>
    </div>
  )
}

// ─── Draw Modal ───────────────────────────────────────────────────────────────
type DrawPhase = "ready" | "spinning" | "winner"

function DrawModal({ giveaway, onClose, onDrawn }: { giveaway: Giveaway; onClose: () => void; onDrawn: () => void }) {
  const [phase, setPhase] = useState<DrawPhase>("ready")
  const [displayName, setDisplayName] = useState("")
  const [winner, setWinner] = useState<{ username: string } | null>(null)
  const [showParticles, setShowParticles] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const names = giveaway.participants.map((p) => p.username)

  const clearTimer = () => { if (timerRef.current) clearTimeout(timerRef.current) }

  const revealWinner = useCallback((username: string) => {
    setDisplayName(username)
    setWinner({ username })
    setPhase("winner")
    setShowParticles(true)
    setTimeout(() => setShowParticles(false), 1500)
  }, [])

  const startDraw = useCallback(async () => {
    if (names.length === 0) return
    setPhase("spinning")
    const apiPromise = fetch(`/api/admin/giveaway/${giveaway._id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "draw" }),
    }).then((r) => r.json())

    let delay = 60
    const startAt = Date.now()
    const totalMs = 3800
    const tick = () => {
      const elapsed = Date.now() - startAt
      const progress = Math.min(elapsed / totalMs, 1)
      const eased = progress < 1 ? 1 - Math.pow(1 - progress, 4) : 1
      delay = 60 + eased * 540
      setDisplayName(names[Math.floor(Math.random() * names.length)])
      if (progress < 1) { timerRef.current = setTimeout(tick, delay) }
      else {
        apiPromise
          .then((data) => { revealWinner(data?.giveaway?.winner?.username ?? names[Math.floor(Math.random() * names.length)]); onDrawn() })
          .catch(() => { revealWinner(names[Math.floor(Math.random() * names.length)]); toast.error("Błąd API") })
      }
    }
    timerRef.current = setTimeout(tick, delay)
  }, [names, giveaway._id, revealWinner, onDrawn])

  useEffect(() => () => clearTimer(), [])

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={phase !== "spinning" ? onClose : undefined} />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-primary/30 bg-[#0a0a0a] shadow-[0_0_80px_-10px] shadow-primary/40 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <button onClick={onClose} className="absolute right-4 top-4 z-20 rounded-full p-2 text-white/30 hover:bg-white/10 hover:text-white transition-all">
          <X className="h-4 w-4" />
        </button>

        {phase === "ready" && (
          <div className="flex flex-col items-center gap-5 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/30 text-primary">
              <Shuffle className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">Losowanie</h2>
              <p className="mt-1 text-sm text-white/50">„{giveaway.phrase}"</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-bold text-white">{names.length} uczestników</span>
            </div>

            {/* Participant grid preview */}
            <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-3 max-h-48 overflow-y-auto">
              <div className="flex flex-wrap gap-1.5">
                {names.map((n, i) => (
                  <div key={i} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-2.5 text-xs text-white/70">
                    <Avatar username={n} size="sm" />
                    {n}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={startDraw} disabled={names.length === 0}
              className="group relative h-13 w-full overflow-hidden rounded-2xl bg-primary py-3.5 font-black text-base uppercase tracking-widest text-black shadow-[0_0_30px] shadow-primary/40 transition-all hover:shadow-[0_0_50px] hover:shadow-primary/60 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none">
              <span className="relative z-10 flex items-center justify-center gap-2"><Shuffle className="h-5 w-5" />Losuj!</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>
        )}

        {phase === "spinning" && (
          <div className="flex flex-col items-center gap-8 p-10 text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary/70 animate-pulse">Losowanie w toku...</p>
            <div className="relative w-full rounded-2xl border border-primary/20 bg-primary/5 py-8 px-4 overflow-hidden">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.15)_2px,rgba(0,0,0,0.15)_4px)] pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#0a0a0a] to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
              <p key={displayName} className="relative text-4xl font-black text-white tracking-tight"
                style={{ animation: "drum-tick 0.06s ease-out", textShadow: "0 0 30px rgba(34,197,94,0.5)" }}>
                {displayName || "..."}
              </p>
            </div>
            <div className="flex gap-2">
              {[0,1,2,3].map((i) => (
                <div key={i} className="h-2 w-2 rounded-full bg-primary"
                  style={{ animation: `dot-bounce 0.8s ${i*0.15}s infinite` }} />
              ))}
            </div>
            <style>{`
              @keyframes drum-tick{0%{transform:translateY(-6px);opacity:.4}100%{transform:translateY(0);opacity:1}}
              @keyframes dot-bounce{0%,80%,100%{transform:scaleY(1)}40%{transform:scaleY(1.6)}}
            `}</style>
          </div>
        )}

        {phase === "winner" && winner && (
          <div className="relative flex flex-col items-center gap-6 p-10 text-center">
            {showParticles && <Particles />}
            <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-400">Zwycięzca!</p>
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-yellow-400/40 bg-yellow-400/10"
              style={{ animation: "trophy-pop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both" }}>
              <Trophy className="h-12 w-12 text-yellow-400" />
            </div>
            <div style={{ animation: "winner-slide 0.5s 0.15s ease-out both" }} className="space-y-1">
              <p className="text-5xl font-black tracking-tight text-white"
                style={{ textShadow: "0 0 40px rgba(34,197,94,0.8),0 0 80px rgba(34,197,94,0.4)" }}>
                {winner.username}
              </p>
              <p className="text-sm text-white/40">wygrał/a konkurs „{giveaway.phrase}"</p>
            </div>
            <div className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ boxShadow: "inset 0 0 60px rgba(34,197,94,0.08)", animation: "glow-pulse 2s ease-in-out infinite" }} />
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1 h-12 rounded-xl border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white" onClick={onClose}>Zamknij</Button>
              <Button className="flex-1 h-12 rounded-xl bg-primary font-black text-black hover:bg-primary/90"
                onClick={() => { setPhase("ready"); setWinner(null); setDisplayName("") }}>
                <RotateCcw className="mr-2 h-4 w-4" />Losuj ponownie
              </Button>
            </div>
            <style>{`
              @keyframes trophy-pop{0%{transform:scale(0) rotate(-15deg);opacity:0}100%{transform:scale(1) rotate(0);opacity:1}}
              @keyframes winner-slide{0%{transform:translateY(16px);opacity:0}100%{transform:translateY(0);opacity:1}}
              @keyframes glow-pulse{0%,100%{opacity:.5}50%{opacity:1}}
            `}</style>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminGiveawayPage() {
  const { data, mutate } = useSWR<{ giveaways: Giveaway[] }>("/api/admin/giveaway", fetcher, {
    refreshInterval: 5000
  })
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [drawTargetId, setDrawTargetId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [phrase, setPhrase] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const giveaways = data?.giveaways || []
  const active = giveaways.find((g) => g.status === "collecting")
  // Derive drawTarget from SWR data so it always has the latest participants
  const drawTarget = drawTargetId ? giveaways.find((g) => g._id === drawTargetId) || null : null

  const handleCreate = async () => {
    if (!phrase.trim()) { toast.error("Wpisz frazę"); return }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/giveaway", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phrase: phrase.trim() }) })
      if (!res.ok) throw new Error()
      toast.success("Konkurs uruchomiony!")
      setIsCreateOpen(false); setPhrase(""); mutate()
    } catch { toast.error("Nie udało się uruchomić konkursu") }
    finally { setIsSubmitting(false) }
  }

  const handleSimpleAction = async (id: string, action: "stop" | "reset") => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/giveaway/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      toast.success(action === "stop" ? "Zatrzymano" : "Zresetowano"); mutate()
    } catch (e: any) { toast.error(e.message || "Błąd") }
    finally { setIsSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten konkurs?")) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/giveaway/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Konkurs usunięty")
      mutate()
    } catch { toast.error("Błąd usuwania") }
    finally { setIsSubmitting(false) }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Giveaway / Konkurs</h1>
          <p className="text-muted-foreground">Losuj zwycięzców spośród widzów na chacie Kick</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} disabled={!!active}
          className="relative h-12 px-8 bg-primary rounded-xl font-display font-black shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:shadow-[0_0_30px_rgba(var(--primary),0.4)] transition-all active:scale-95 leading-none">
          <Play className="mr-2 h-5 w-5" />Nowy konkurs
        </Button>
      </div>

      {/* Active giveaway */}
      {active && (
        <Card className="border-primary/40 bg-primary/5 overflow-hidden">
          <CardContent className="p-0">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary/10">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-primary">Konkurs aktywny</p>
                  <p className="text-base font-bold text-foreground mt-0.5">
                    Fraza: <span className="text-primary font-black">„{active.phrase}"</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-black text-primary">{active.participants?.length ?? active.participantCount}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleSimpleAction(active._id, "stop")} disabled={isSubmitting}>
                  <Square className="mr-1.5 h-3.5 w-3.5" />Zatrzymaj
                </Button>
                <Button size="sm" onClick={() => setDrawTargetId(active._id)} disabled={(active.participants?.length ?? active.participantCount) === 0}
                  className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Shuffle className="mr-1.5 h-3.5 w-3.5" />Losuj!
                </Button>
              </div>
            </div>
            {/* Participants */}
            <div className="p-5">
              <ParticipantGrid participants={active.participants ?? []} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Historia konkursów ({giveaways.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {giveaways.map((g) => (
              <div key={g._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">„{g.phrase}"</span>
                      <GiveawayBadge status={g.status} />
                    </div>

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-3">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />{g.participantCount} uczestników
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />{new Date(g.createdAt).toLocaleString("pl-PL")}
                      </span>
                    </div>

                    {/* Winner highlight */}
                    {g.winner && (
                      <div className="flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 w-fit">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-bold text-yellow-400">{g.winner.username}</span>
                        <span className="text-xs text-yellow-500/60">wygrał/a</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    {g.participants?.length > 0 && (
                      <button onClick={() => setExpandedId(expandedId === g._id ? null : g._id)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
                        {expandedId === g._id ? "Ukryj" : "Pokaż"} uczestników
                      </button>
                    )}
                    <div className="flex gap-2">
                      {g.status === "stopped" && (
                        <Button size="sm" onClick={() => setDrawTargetId(g._id)} disabled={g.participantCount === 0}
                          className="bg-primary text-primary-foreground hover:bg-primary/90">
                          <Shuffle className="mr-1 h-3.5 w-3.5" />Losuj
                        </Button>
                      )}
                      {(g.status === "stopped" || g.status === "drawn") && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleSimpleAction(g._id, "reset")} disabled={isSubmitting}>
                            <RotateCcw className="mr-1 h-3.5 w-3.5" />Reset
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(g._id)} disabled={isSubmitting}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded participants */}
                {expandedId === g._id && g.participants?.length > 0 && (
                  <div className="rounded-xl border border-border bg-muted/20 p-3">
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                      {g.participants.map((p) => (
                        <div key={p.kickId} className={`flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-xs font-medium transition-colors ${g.winner?.kickId === p.kickId ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400" : "border-border bg-background text-muted-foreground"}`}>
                          <Avatar username={p.username} size="sm" />
                          {p.username}
                          {g.winner?.kickId === p.kickId && <Trophy className="h-3 w-3 text-yellow-500" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {giveaways.length === 0 && (
              <div className="p-10 text-center text-muted-foreground">Brak konkursów</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create modal */}
      <AdminModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nowy konkurs"
        description="Widzowie muszą wpisać dokładnie tę frazę na chacie Kick żeby wziąć udział."
        icon={Gift} isLoading={isSubmitting} submitLabel="Uruchom konkurs" onSubmit={handleCreate}>
        <div className="space-y-3 py-4">
          <Label className="text-xs font-black uppercase tracking-widest text-primary/70 ml-1">Fraza do wpisania na chacie</Label>
          <Input placeholder="np. !konkurs" value={phrase} onChange={(e) => setPhrase(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="h-12 border-white/5 bg-white/5 transition-all focus:bg-white/10 focus:ring-primary/20 rounded-xl px-4 font-bold text-base" autoFocus />
          <p className="text-xs text-muted-foreground px-1">Wielkość liter nie ma znaczenia. Każdy widz może wpisać frazę tylko raz.</p>
        </div>
      </AdminModal>

      {drawTarget && <DrawModal giveaway={drawTarget} onClose={() => setDrawTargetId(null)} onDrawn={() => mutate()} />}
    </div>
  )
}

function GiveawayBadge({ status }: { status: string }) {
  const v: Record<string, { color: string; label: string }> = {
    collecting: { color: "bg-green-100 text-green-700", label: "Aktywny" },
    stopped: { color: "bg-yellow-100 text-yellow-700", label: "Zatrzymany" },
    drawn: { color: "bg-blue-100 text-blue-700", label: "Wylosowany" },
  }
  const s = v[status] || v.collecting
  return <Badge className={s.color}>{s.label}</Badge>
}
