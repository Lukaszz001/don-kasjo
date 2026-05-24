"use client"

import { useState } from "react"
import useSWR from "swr"
import { Plus, TrendingUp, CheckCircle2, XCircle, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AdminModal } from "@/components/admin/admin-modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiFetcher, apiRequest } from "@/lib/api-client"

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
  createdBy: string
}

export default function AdminPredictionsPage() {
  const { data, mutate } = useSWR<{ predictions: Prediction[] }>(
    "/api/predictions",
    apiFetcher
  )
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [resolveDialog, setResolveDialog] = useState<Prediction | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const todayDate = new Date().toISOString().slice(0, 10)

  // Create form state
  const [question, setQuestion] = useState("")
  const [option1, setOption1] = useState("")
  const [option2, setOption2] = useState("")
  const [closesDate, setClosesDate] = useState(todayDate)
  const [closesTime, setClosesTime] = useState("")

  const predictions = data?.predictions || []

  const handleCreate = async () => {
    if (!question || !option1 || !option2 || !closesDate || !closesTime) {
      toast.error("Wypelnij wszystkie pola")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await apiRequest("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          option1,
          option2,
          closesAt: new Date(`${closesDate}T${closesTime}`).toISOString(),
        }),
      })

      if (!response.ok) throw new Error("Failed to create prediction")

      toast.success("Predykcja utworzona")
      setIsCreateOpen(false)
      setQuestion("")
      setOption1("")
      setOption2("")
      setClosesDate(todayDate)
      setClosesTime("")
      mutate()
    } catch {
      toast.error("Nie udalo sie utworzyc predykcji")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResolve = async (predictionId: string, winningOption: 1 | 2) => {
    setIsSubmitting(true)
    try {
      const response = await apiRequest(`/api/predictions/${predictionId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winningOption }),
      })

      if (!response.ok) throw new Error("Failed to resolve prediction")

      toast.success("Predykcja rozstrzygnieta")
      setResolveDialog(null)
      mutate()
    } catch {
      toast.error("Nie udalo sie rozstrzygnac predykcji")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRefund = async (predictionId: string) => {
    setIsSubmitting(true)
    try {
      const response = await apiRequest(`/api/predictions/${predictionId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refund" }),
      })

      if (!response.ok) throw new Error("Failed to refund prediction")

      toast.success("Predykcja zwrocona")
      setResolveDialog(null)
      mutate()
    } catch {
      toast.error("Nie udalo sie zwrocic predykcji")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Predykcje</h1>
          <p className="text-muted-foreground">Tworz i zarzadzaj predykcjami</p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="relative h-12 px-8 bg-primary rounded-xl font-display font-black shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:shadow-[0_0_30px_rgba(var(--primary),0.4)] transition-all active:scale-95 group leading-none"
        >
          <div className="absolute inset-0 bg-white/10 group-hover:opacity-100 opacity-0 transition-opacity rounded-xl" />
          <Plus className="mr-2 h-5 w-5" />
          Nowa predykcja
        </Button>

        <AdminModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Nowa predykcja"
          description="Zdefiniuj wydarzenie i daj swojej spolecznosci powód do rywalizacji."
          icon={TrendingUp}
          isLoading={isSubmitting}
          submitLabel="Utworz wydarzenie"
          onSubmit={handleCreate}
        >
          <div className="grid gap-8 py-4">
            <div className="space-y-3">
              <Label htmlFor="question" className="text-xs font-black uppercase tracking-widest text-primary/70 ml-1">Pytanie przewodnie</Label>
              <Textarea
                id="question"
                placeholder="np. Kto wygra nadchodzace starcie?"
                value={question}
                className="min-h-[100px] resize-none border-white/5 bg-white/5 transition-all focus:bg-white/10 focus:ring-primary/20 rounded-xl p-4 text-base font-medium leading-relaxed"
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="option1" className="text-xs font-black uppercase tracking-widest text-primary/70 ml-1">Opcja sukcesu A</Label>
                <div className="relative">
                  <Input
                    id="option1"
                    placeholder="np. TAK"
                    value={option1}
                    className="h-12 border-white/5 bg-white/5 transition-all focus:bg-white/10 focus:ring-primary/20 rounded-xl px-4 font-bold"
                    onChange={(e) => setOption1(e.target.value)}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black text-primary border border-primary/20">1</div>
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="option2" className="text-xs font-black uppercase tracking-widest text-primary/70 ml-1">Opcja sukcesu B</Label>
                <div className="relative">
                  <Input
                    id="option2"
                    placeholder="np. NIE"
                    value={option2}
                    className="h-12 border-white/5 bg-white/5 transition-all focus:bg-white/10 focus:ring-primary/20 rounded-xl px-4 font-bold"
                    onChange={(e) => setOption2(e.target.value)}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black text-primary border border-primary/20">2</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-primary/70 ml-1">Deadline przyjmowania zakładów</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="closesTime" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Godzina</Label>
                  <Input
                    id="closesTime"
                    type="time"
                    value={closesTime}
                    className="h-12 border-white/5 bg-white/5 transition-all focus:bg-white/10 focus:ring-primary/20 rounded-xl px-4 font-medium"
                    onChange={(e) => setClosesTime(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="closesDate" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Data</Label>
                  <Input
                    id="closesDate"
                    type="date"
                    value={closesDate}
                    className="h-12 border-white/5 bg-white/5 transition-all focus:bg-white/10 focus:ring-primary/20 rounded-xl px-4 font-medium"
                    onChange={(e) => setClosesDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 px-1">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">System automatycznie zablokuje typowanie po tej godzinie</p>
              </div>
            </div>
          </div>
        </AdminModal>
      </div>

      {/* Predictions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Wszystkie predykcje ({predictions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {predictions.map((prediction) => (
              <div key={prediction._id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">
                        {prediction.question}
                      </h3>
                      <StatusBadge status={prediction.status} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>
                        {prediction.option1}:{" "}
                        {prediction.totalPointsOption1.toLocaleString()} pkt (
                        {prediction.totalBetsOption1} zakladow)
                      </span>
                      <span>
                        {prediction.option2}:{" "}
                        {prediction.totalPointsOption2.toLocaleString()} pkt (
                        {prediction.totalBetsOption2} zakladow)
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Utworzona przez: {prediction.createdBy} | Zamkniecie:{" "}
                      {new Date(prediction.closesAt).toLocaleString("pl-PL")}
                    </p>
                  </div>

                  {(prediction.status === "open" ||
                    prediction.status === "closed") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setResolveDialog(prediction)}
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Rozstrzygnij
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {predictions.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Brak predykcji
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resolve Dialog */}
      <AdminModal
        isOpen={!!resolveDialog}
        onClose={() => setResolveDialog(null)}
        title="Rozstrzygnij wynik"
        description="Wybierz zwycieska opcje lub zwroc punkty wszystkim uczestnikom."
        icon={CheckCircle2}
        isLoading={isSubmitting}
        footer={
          <div className="flex w-full items-center justify-between gap-4">
            <Button
              variant="secondary"
              className="font-bold hover:bg-secondary/80 h-11"
              onClick={() => resolveDialog && handleRefund(resolveDialog._id)}
              disabled={isSubmitting}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Anuluj i zwroc punkty
            </Button>
            <Button
              variant="ghost"
              onClick={() => setResolveDialog(null)}
              className="font-bold"
              disabled={isSubmitting}
            >
              Zamknij
            </Button>
          </div>
        }
      >
        <div className="space-y-6 py-4">
          <div className="rounded-xl border border-border bg-card/30 p-4 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Pytanie</p>
            <h4 className="text-xl font-display font-black text-foreground">{resolveDialog?.question}</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => resolveDialog && handleResolve(resolveDialog._id, 1)}
              disabled={isSubmitting}
              className="flex flex-col items-center gap-4 rounded-2xl border-2 border-border bg-card/50 p-6 transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="text-center">
                <span className="block text-sm font-medium text-muted-foreground mb-1">Opcja 1</span>
                <span className="block text-lg font-black text-foreground leading-tight">{resolveDialog?.option1}</span>
              </div>
              <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/20 border-none font-bold">Wygrywa</Badge>
            </button>

            <button
              onClick={() => resolveDialog && handleResolve(resolveDialog._id, 2)}
              disabled={isSubmitting}
              className="flex flex-col items-center gap-4 rounded-2xl border-2 border-border bg-card/50 p-6 transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="text-center">
                <span className="block text-sm font-medium text-muted-foreground mb-1">Opcja 2</span>
                <span className="block text-lg font-black text-foreground leading-tight">{resolveDialog?.option2}</span>
              </div>
              <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/20 border-none font-bold">Wygrywa</Badge>
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { color: string; label: string }> = {
    open: { color: "bg-green-100 text-green-700", label: "Otwarta" },
    closed: { color: "bg-yellow-100 text-yellow-700", label: "Zamknieta" },
    resolved: { color: "bg-blue-100 text-blue-700", label: "Rozstrzygnieta" },
    refunded: { color: "bg-gray-100 text-gray-700", label: "Zwrocona" },
  }

  const variant = variants[status] || variants.open

  return <Badge className={variant.color}>{variant.label}</Badge>
}
