"use client"

import Link from "next/link"
import { ShoppingBag, TrendingUp, Trophy, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { useLanguage } from "@/lib/language-context"

export function QuickActionsCarousel() {
  const { t } = useLanguage()

  const actions = [
    {
      id: 1,
      title: t("carousel.shop.title"),
      description: t("carousel.shop.desc"),
      icon: ShoppingBag,
      href: "/shop",
      cta: t("carousel.shop.cta"),
      gradient: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-400",
    },
    {
      id: 2,
      title: t("carousel.predictions.title"),
      description: t("carousel.predictions.desc"),
      icon: TrendingUp,
      href: "/predictions",
      cta: t("carousel.predictions.cta"),
      gradient: "from-purple-500/20 to-purple-500/5",
      iconColor: "text-purple-400",
    },
    {
      id: 3,
      title: t("carousel.leaderboard.title"),
      description: t("carousel.leaderboard.desc"),
      icon: Trophy,
      href: "/leaderboard",
      cta: t("carousel.leaderboard.cta"),
      gradient: "from-amber-500/20 to-amber-500/5",
      iconColor: "text-amber-400",
    },
  ]

  // Double the actions for seamless loop
  const doubledActions = [...actions, ...actions]

  return (
    <div className="relative overflow-hidden">
      <div className="flex animate-marquee gap-4">
        {doubledActions.map((action, index) => {
          const Icon = action.icon
          return (
            <Card
              key={`${action.id}-${index}`}
              className={`min-w-[320px] max-w-[320px] shrink-0 border-border bg-gradient-to-br ${action.gradient} backdrop-blur transition-all hover:border-primary/30`}
            >
              <CardContent className="flex h-full flex-col p-6">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${action.iconColor}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-display text-lg font-bold text-foreground">{action.title}</h3>
                <p className="mb-4 flex-1 text-sm text-muted-foreground leading-relaxed">
                  {action.description}
                </p>
                <Button asChild variant="ghost" className="w-fit gap-2 p-0 text-primary hover:bg-transparent hover:text-primary/80">
                  <Link href={action.href}>
                    {action.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
