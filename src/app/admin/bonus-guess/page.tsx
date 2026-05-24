"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Dices, Lock, CheckCircle2, Plus, ChevronDown, ChevronUp, Clock, Target, Trash2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AdminModal } from "@/components/admin/admin-modal"
import Pusher from "pusher-js"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type Currency = "USD" | "PLN" | "EUR"

interface BonusRound {
  _id: string
  slotName: string
  currency: Currency
  status: "collecting" | "locked" | "resolved"
  result: number | null
  winnerUsername: string | null
  winnerGuess: number | null
  winnerDifference: number | null
  createdBy: string
  resolvedAt: string | null
  createdAt: string
}

interface Entry {
  _id: string
  username: string
  guess: number
  difference: number | null
  rank: number | null
  createdAt: string
}

function formatAmount(amount: number, currency: Currency) {
  if (currency === "USD") return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount)
  if (currency === "EUR") return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount)
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount)
}

const MEDAL: Record<number, { icon: string; ring: string; bg: string; text: string }> = {
  1: { icon: "🥇", ring: "ring-yellow-400/40", bg: "bg-yellow-400/10", text: "text-yellow-300" },
  2: { icon: "🥈", ring: "ring-slate-400/40",  bg: "bg-slate-400/10",  text: "text-slate-300"  },
  3: { icon: "🥉", ring: "ring-orange-400/40", bg: "bg-orange-400/10", text: "text-orange-300" },
}

// ─── Entries panel (leaderboard) ──────────────────────────────────────────────
function EntriesPanel({ roundId, currency, result }: { roundId: string; currency: Currency; result: number | null }) {
  const { data } = useSWR<{ round: BonusRound; entries: Entry[] }>(
    `/api/admin/bonus-guess/${roundId}`, fetcher, { refreshInterval: 3000 }
  )
  const entries = data?.entries || []
  const isResolved = result !== null

  // Max difference for bar width normalisation
  const maxDiff = isResolved && entries.length > 0
    ? Math.max(...entries.map((e) => e.difference ?? 0), 1)
    : 1

  if (entries.length === 0) return (
    <div className="mt-3 flex flex-col items-center gap-2 py-6 text-center text-muted-foreground rounded-xl border border-border bg-muted/10">
      <Target className="h-7 w-7 opacity-30" />
      <p className="text-sm">Brak typowań</p>
    </div>
  )

  return (
    <div className="mt-3 rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border text-xs font-black uppercase tracking-widest text-muted-foreground">
        <span>Uczestnik</span>
        <div className="flex items-center gap-6">
          <span>Typowanie</span>
          {isResolved && <span className="w-20 text-right">Różnica</span>}
        </div>
      </div>

      <div className="divide-y divide-border max-h-72 overflow-y-auto">
        {entries.map((e, i) => {
          const rank = e.rank ?? (i + 1)
          const medal = MEDAL[rank]
          const barPct = isResolved && e.difference !== null
            ? Math.max(4, 100 - (e.difference / maxDiff) * 96)
            : 0
          const isWinner = rank === 1 && isResolved

          return (
            <div key={e._id} className={`px-4 py-2.5 transition-colors ${isWinner ? "bg-yellow-500/5" : "hover:bg-muted/20"}`}>
              <div className="flex items-center gap-3">
                {/* Rank */}
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-black ring-1 ${medal ? `${medal.ring} ${medal.bg} ${medal.text}` : "ring-border bg-muted/30 text-muted-foreground"}`}>
                  {medal ? medal.icon : rank}
                </div>

                {/* Username */}
                <span className={`flex-1 text-sm font-semibold truncate ${isWinner ? "text-yellow-300" : rank <= 3 && isResolved ? "text-foreground" : "text-muted-foreground"}`}>
                  {e.username}
                </span>

                {/* Guess */}
                <span className={`font-mono text-sm font-bold ${isWinner ? "text-yellow-300" : "text-foreground"}`}>
                  {formatAmount(e.guess, currency)}
                </span>

                {/* Difference */}
                {isResolved && e.difference !== null && (
                  <div className="flex items-center gap-2 w-28">
                    <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${rank === 1 ? "bg-yellow-400" : rank === 2 ? "bg-slate-400" : rank === 3 ? "bg-orange-400" : "bg-primary/40"}`}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-14 text-right shrink-0">
                      ±{formatAmount(e.difference, currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {isResolved && entries.length > 0 && (
        <div className="px-4 py-2 bg-muted/10 border-t border-border text-xs text-muted-foreground">
          {entries.length} typowań
        </div>
      )}
    </div>
  )
}

// ─── Live entries count (for active round) ────────────────────────────────────
function LiveCount({ roundId }: { roundId: string }) {
  const { data } = useSWR<{ entries: Entry[] }>(
    `/api/admin/bonus-guess/${roundId}`, fetcher, { refreshInterval: 5000 }
  )
  const count = data?.entries?.length ?? 0
  return (
    <span className="flex items-center gap-1.5 text-sm font-bold text-primary">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      {count} typowań
    </span>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminBonusGuessPage() {
  const { data, mutate } = useSWR<{ rounds: BonusRound[] }>("/api/admin/bonus-guess", fetcher)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [resolveDialog, setResolveDialog] = useState<BonusRound | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [slotName, setSlotName] = useState("")
  const [currency, setCurrency] = useState<Currency>("USD")
  const [resultInput, setResultInput] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const rounds = data?.rounds || []
  const active = rounds.find((r) => r.status === "collecting" || r.status === "locked")

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY
    if (!pusherKey) return
    const pusher = new Pusher(pusherKey, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "sa1" })
    const ch = pusher.subscribe("platform-updates")
    ch.bind("bonus-guess-updated", () => mutate())
    return () => { ch.unbind_all(); pusher.unsubscribe("platform-updates") }
  }, [mutate])

  const handleCreate = async () => {
    if (!slotName.trim()) { toast.error("Wpisz nazwę slota"); return }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/bonus-guess", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slotName: slotName.trim(), currency }) })
      if (!res.ok) throw new Error()
      toast.success("Runda uruchomiona! Widzowie mogą teraz typować.")
      setIsCreateOpen(false); setSlotName(""); setCurrency("USD"); mutate()
    } catch { toast.error("Nie udało się uruchomić rundy") }
    finally { setIsSubmitting(false) }
  }

  const handleLock = async (id: string) => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/bonus-guess/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "lock" }) })
      if (!res.ok) throw new Error()
      toast.success("Typowania zablokowane"); mutate()
    } catch { toast.error("Błąd blokowania") }
    finally { setIsSubmitting(false) }
  }

  const handleResolve = async () => {
    if (!resolveDialog) return
    const num = parseFloat(resultInput.replace(",", "."))
    if (isNaN(num) || num <= 0) { toast.error("Wpisz prawidłowy wynik"); return }
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/bonus-guess/${resolveDialog._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "resolve", result: num }) })
      if (!res.ok) throw new Error()
      toast.success("Runda rozwiązana!")
      setResolveDialog(null); setResultInput(""); mutate()
    } catch { toast.error("Błąd rozwiązywania rundy") }
    finally { setIsSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę rundę?")) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/bonus-guess/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Runda usunięta")
      mutate()
    } catch { toast.error("Błąd usuwania") }
    finally { setIsSubmitting(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Zgadnij Wynik Bonusu</h1>
          <p className="text-muted-foreground">Widzowie typują kwotę wygranej — wygrywa najbliższy</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} disabled={!!active}
          className="relative h-12 px-8 bg-primary rounded-xl font-display font-black shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:shadow-[0_0_30px_rgba(var(--primary),0.4)] transition-all active:scale-95 leading-none">
          <Plus className="mr-2 h-5 w-5" />Nowa runda
        </Button>
      </div>

      {/* Active round */}
      {active && (
        <Card className="border-primary/40 bg-primary/5 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary/10">
              <div className="flex items-center gap-3">
                {active.status === "collecting" ? (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                  </span>
                ) : (
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                )}
                <div>
                  <p className={`text-xs font-black uppercase tracking-widest ${active.status === "collecting" ? "text-primary" : "text-yellow-500"}`}>
                    {active.status === "collecting" ? "Zbieranie typowań" : "Typowania zablokowane"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-base font-bold text-foreground">Slot: <span className="text-primary">{active.slotName}</span></p>
                    <CurrencyBadge currency={active.currency} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <LiveCount roundId={active._id} />
                {active.status === "collecting" && (
                  <Button variant="outline" size="sm" onClick={() => handleLock(active._id)} disabled={isSubmitting}>
                    <Lock className="mr-1.5 h-3.5 w-3.5" />Zablokuj
                  </Button>
                )}
                <Button size="sm" onClick={() => setResolveDialog(active)} disabled={isSubmitting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />Rozwiąż
                </Button>
              </div>
            </div>
            <div className="p-4">
              <EntriesPanel roundId={active._id} currency={active.currency} result={null} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dices className="h-5 w-5 text-primary" />
            Historia rund ({rounds.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {rounds.map((r) => (
              <div key={r._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{r.slotName}</span>
                      <CurrencyBadge currency={r.currency} />
                      <BonusBadge status={r.status} />
                    </div>

                    {r.status === "resolved" && r.result != null && (
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5">
                          <Target className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs text-muted-foreground">Wynik:</span>
                          <span className="text-sm font-black text-primary">{formatAmount(r.result, r.currency)}</span>
                        </div>
                        {r.winnerUsername && (
                          <div className="flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-3 py-1.5">
                            <span className="text-sm">🥇</span>
                            <span className="text-sm font-bold text-yellow-300">{r.winnerUsername}</span>
                            <span className="text-xs text-yellow-500/60">{r.winnerGuess != null ? formatAmount(r.winnerGuess, r.currency) : ""}</span>
                            {r.winnerDifference != null && (
                              <span className="text-xs text-muted-foreground">±{formatAmount(r.winnerDifference, r.currency)}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />{r.createdBy} · {new Date(r.createdAt).toLocaleString("pl-PL")}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 items-end shrink-0">
                    <button onClick={() => setExpandedId(expandedId === r._id ? null : r._id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0">
                      Typowania
                      {expandedId === r._id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    {r.status === "resolved" && (
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(r._id)} disabled={isSubmitting}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {expandedId === r._id && (
                  <EntriesPanel roundId={r._id} currency={r.currency} result={r.result} />
                )}
              </div>
            ))}
            {rounds.length === 0 && (
              <div className="p-10 text-center text-muted-foreground">Brak rund</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create modal */}
      <AdminModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nowa runda"
        description="Po uruchomieniu widzowie wpisują kwotę na chacie — system zbierze typowania i wyłoni najbliższego."
        icon={Dices} isLoading={isSubmitting} submitLabel="Uruchom rundę" onSubmit={handleCreate}>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-primary/70 ml-1">Nazwa slota / bonusu</Label>
            <Input placeholder="np. Sweet Bonanza" value={slotName} onChange={(e) => setSlotName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="h-12 border-white/5 bg-white/5 transition-all focus:bg-white/10 focus:ring-primary/20 rounded-xl px-4 font-bold text-base" autoFocus />
          </div>
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-primary/70 ml-1">Waluta typowania</Label>
            <div className="grid grid-cols-3 gap-3">
              {([
                { code: "USD", flag: "https://flagcdn.com/h20/us.png", label: "USD — Dolar" },
                { code: "PLN", flag: "https://flagcdn.com/h20/pl.png", label: "PLN — Złoty" },
                { code: "EUR", flag: "https://flagcdn.com/h20/eu.png", label: "EUR — Euro" },
              ] as const).map(({ code, flag, label }) => (
                <button key={code} type="button" onClick={() => setCurrency(code)}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-black transition-all ${currency === code ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px] shadow-primary/20" : "border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:text-white/70"}`}>
                  <Image src={flag} width={24} height={16} className="h-4 w-auto rounded-[2px] shadow-sm" alt={code} />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground px-1">
            Widzowie wpisują samą kwotę (np. <span className="font-mono">450</span>, <span className="font-mono">$450</span>, <span className="font-mono">450 PLN</span>). Każdy widz może wpisać tylko jeden typ.
          </p>
        </div>
      </AdminModal>

      {/* Resolve modal */}
      <AdminModal isOpen={!!resolveDialog} onClose={() => { setResolveDialog(null); setResultInput("") }}
        title="Rozwiąż rundę" description="Wpisz faktyczną kwotę wygranej. System automatycznie wyłoni najlepsze typowanie."
        icon={CheckCircle2} isLoading={isSubmitting} submitLabel="Rozwiąż i pokaż wyniki" onSubmit={handleResolve}>
        <div className="space-y-4 py-4">
          <div className="rounded-xl border border-border bg-card/30 p-4 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Slot</p>
            <h4 className="text-xl font-display font-black text-foreground">{resolveDialog?.slotName}</h4>
            {resolveDialog && <div className="mt-2 flex justify-center"><CurrencyBadge currency={resolveDialog.currency} /></div>}
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-primary/70 ml-1">
              Faktyczna kwota wygranej ({resolveDialog?.currency === "USD" ? "dolary" : resolveDialog?.currency === "EUR" ? "euro" : "złote"})
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold pointer-events-none select-none">
                {resolveDialog?.currency === "USD" ? "$" : resolveDialog?.currency === "EUR" ? "€" : "zł"}
              </span>
              <Input placeholder="np. 450" value={resultInput} onChange={(e) => setResultInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleResolve()}
                className="h-12 border-white/5 bg-white/5 transition-all focus:bg-white/10 focus:ring-primary/20 rounded-xl pl-9 pr-4 font-bold text-base"
                autoFocus type="number" min="0" step="0.01" />
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}

const CURRENCY_META: Record<Currency, { flag: string; className: string }> = {
  USD: { flag: "https://flagcdn.com/h20/us.png", className: "bg-green-100 text-green-800" },
  PLN: { flag: "https://flagcdn.com/h20/pl.png", className: "bg-red-100 text-red-800" },
  EUR: { flag: "https://flagcdn.com/h20/eu.png", className: "bg-blue-100 text-blue-800" },
}

function CurrencyBadge({ currency }: { currency: Currency }) {
  const meta = CURRENCY_META[currency] ?? CURRENCY_META.USD
  return (
    <Badge className={`inline-flex items-center gap-1.5 font-bold ${meta.className}`}>
      <Image src={meta.flag} width={18} height={12} className="h-3 w-auto rounded-[2px]" alt={currency} />
      {currency}
    </Badge>
  )
}

function BonusBadge({ status }: { status: string }) {
  const v: Record<string, { color: string; label: string }> = {
    collecting: { color: "bg-green-100 text-green-700", label: "Zbieranie" },
    locked: { color: "bg-yellow-100 text-yellow-700", label: "Zablokowane" },
    resolved: { color: "bg-blue-100 text-blue-700", label: "Rozwiązane" },
  }
  const s = v[status] || v.collecting
  return <Badge className={s.color}>{s.label}</Badge>
}
