"use client"

import { useState } from "react"
import { Coins, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Prediction {
  _id: string
  question: string
  option1: string
  option2: string
  totalPointsOption1: number
  totalPointsOption2: number
}

interface PredictionBetDialogProps {
  prediction: Prediction
  userPoints: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PredictionBetDialog({
  prediction,
  userPoints,
  open,
  onOpenChange,
  onSuccess,
}: PredictionBetDialogProps) {
  const [selectedOption, setSelectedOption] = useState<"1" | "2">("1")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const totalPool = prediction.totalPointsOption1 + prediction.totalPointsOption2
  const betAmount = parseInt(amount) || 0

  // Calculate potential winnings
  const currentOptionPool =
    selectedOption === "1"
      ? prediction.totalPointsOption1
      : prediction.totalPointsOption2
  const newTotalPool = totalPool + betAmount
  const newOptionPool = currentOptionPool + betAmount
  const potentialWinnings =
    newOptionPool > 0
      ? Math.floor((betAmount / newOptionPool) * newTotalPool)
      : betAmount

  const handleSubmit = async () => {
    if (betAmount < 1) {
      toast.error("Minimalna stawka to 1 punkt")
      return
    }
    if (betAmount > userPoints) {
      toast.error("Nie masz wystarczajacej ilosci punktow")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/predictions/${prediction._id}/bet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          option: parseInt(selectedOption),
          amount: betAmount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to place bet")
      }

      toast.success("Zaklad przyjety!", {
        description: `Postawiles ${betAmount} pkt na "${
          selectedOption === "1" ? prediction.option1 : prediction.option2
        }"`,
      })
      onSuccess()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Nie udalo sie postawic zakladu"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const quickAmounts = [10, 50, 100, 500, 1000]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Obstaw predykcje</DialogTitle>
          <DialogDescription>{prediction.question}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Option Selection */}
          <div className="space-y-3">
            <Label>Wybierz opcje</Label>
            <RadioGroup
              value={selectedOption}
              onValueChange={(value) => setSelectedOption(value as "1" | "2")}
              className="grid grid-cols-2 gap-3"
            >
              <Label
                htmlFor="option1"
                className={`flex cursor-pointer items-center justify-center rounded-lg border-2 p-4 text-center transition-colors ${
                  selectedOption === "1"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="1" id="option1" className="sr-only" />
                <span className="font-medium">{prediction.option1}</span>
              </Label>
              <Label
                htmlFor="option2"
                className={`flex cursor-pointer items-center justify-center rounded-lg border-2 p-4 text-center transition-colors ${
                  selectedOption === "2"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="2" id="option2" className="sr-only" />
                <span className="font-medium">{prediction.option2}</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Stawka</Label>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Coins className="h-4 w-4" />
                {userPoints.toLocaleString()} dostepnych
              </span>
            </div>
            <Input
              id="amount"
              type="number"
              placeholder="Wpisz kwote..."
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={1}
              max={userPoints}
            />
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((qa) => (
                <Button
                  key={qa}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={qa > userPoints}
                  onClick={() => setAmount(qa.toString())}
                >
                  {qa}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(userPoints.toString())}
              >
                MAX
              </Button>
            </div>
          </div>

          {/* Potential Winnings */}
          {betAmount > 0 && (
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Potencjalna wygrana
                </span>
                <span className="flex items-center gap-1 text-lg font-bold text-primary">
                  <TrendingUp className="h-5 w-5" />
                  {potentialWinnings.toLocaleString()} pkt
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Kurs moze sie zmienic w zaleznosci od innych zakladow
              </p>
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isLoading || betAmount < 1 || betAmount > userPoints}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isLoading ? "Przetwarzanie..." : `Obstaw ${betAmount || 0} pkt`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
