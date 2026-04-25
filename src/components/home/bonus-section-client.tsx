"use client"

import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useLanguage } from "@/lib/language-context"

export function BonusCodeClient() {
  const { t } = useLanguage()

  const copyCode = () => {
    navigator.clipboard.writeText("DONKASJO")
    toast.success(t("common.copied") || "Skopiowano!")
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-black/40 backdrop-blur-md px-8 py-5 text-center group hover:border-primary/50 transition-all">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">Użyj kodu</span>
      <div className="mt-2 flex items-center justify-center gap-3">
        <span className="font-display text-4xl font-black tracking-[0.1em] text-primary glow-green italic">DONKASJO</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl text-primary hover:bg-primary/20 hover:scale-110 transition-all"
          onClick={copyCode}
        >
          <Copy className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
