"use client"

import Link from "next/link"
import { Home, ArrowLeft, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"

export default function NotFound() {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center animate-in fade-in zoom-in duration-500">
      {/* 404 Large Text */}
      <div className="relative mb-8">
        <h1 className="font-display text-[150px] font-black leading-none text-primary/10 lg:text-[250px] select-none">
          {t("404.title")}
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <ShieldAlert className="h-24 w-24 text-primary animate-bounce-subtle lg:h-32 lg:w-32 glow-green" />
        </div>
      </div>

      {/* Message */}
      <div className="max-w-md space-y-4">
        <h2 className="font-display text-3xl font-black text-foreground lg:text-4xl">
          {t("404.subtitle")}
        </h2>
        <p className="text-lg text-muted-foreground">
          {t("404.desc")}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 h-12 px-8 font-bold gap-2 btn-interactive glow-green">
          <Link href="/">
            <Home className="h-5 w-5" />
            {t("404.backHome")}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-12 px-8 border-primary/30 text-primary hover:bg-primary/10">
          <Link href="/instructions" className="gap-2">
            <ArrowLeft className="h-5 w-5" />
            {t("nav.instructions")}
          </Link>
        </Button>
      </div>

      {/* Decorative dots background for 404 only */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,var(--primary)/0.05_0%,transparent_70%)]" />
    </div>
  )
}
