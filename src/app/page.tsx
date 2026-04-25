"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useStreamStatus } from "@/hooks/use-stream-status"
import { useGlobalStats } from "@/hooks/use-global-stats"

import {
  Gift,
  ShoppingBag,
  Trophy,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Target,
  Rocket,
  Play,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Copy,
  Coins,
  Users,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { QuickActionsCarousel } from "@/components/home/quick-actions-carousel"
import { InstructionsPreview } from "@/components/home/instructions-preview"
import { useLanguage } from "@/lib/language-context"
import { toast } from "sonner"
import { CornerNotification } from "@/components/ui/corner-notification"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/layout/logo"

export default function HomePage() {
  const { t, isHydrated } = useLanguage()
  const [showNotification, setShowNotification] = useState(false)
  const [activeStatIndex, setActiveStatIndex] = useState(0)

  const { isLive, viewers, isLoading: isStatusLoading } = useStreamStatus()

  // Determine the precise state to avoid flickering
  const showLoading = isStatusLoading && isLive === undefined

  const { pointsInCirculation, totalUsers } = useGlobalStats()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Rotate through stats for animation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStatIndex((prev) => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const quickLinks = [
    {
      icon: Gift,
      title: t("quick.bonuses"),
      description: t("quick.bonuses.desc"),
      href: "/partners",
      color: "from-amber-500/20 to-amber-600/5",
      iconColor: "text-amber-400",
    },
    {
      icon: BookOpen,
      title: t("quick.instructions"),
      description: t("quick.instructions.desc"),
      href: "/instructions",
      color: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-400",
    },
    {
      icon: ShoppingBag,
      title: t("quick.shop"),
      description: t("quick.shop.desc"),
      href: "/shop",
      color: "from-emerald-500/20 to-emerald-600/5",
      iconColor: "text-emerald-400",
    },
    {
      icon: TrendingUp,
      title: t("quick.predictions"),
      description: t("quick.predictions.desc"),
      href: "/predictions",
      color: "from-purple-500/20 to-purple-600/5",
      iconColor: "text-purple-400",
    },
    {
      icon: Rocket,
      title: t("quick.leaderboard"),
      description: t("quick.leaderboard.desc"),
      href: "/leaderboard",
      color: "from-rose-500/20 to-rose-600/5",
      iconColor: "text-rose-400",
    },
    {
      icon: HelpCircle,
      title: t("quick.help"),
      description: t("quick.help.desc"),
      href: "/instructions",
      color: "from-cyan-500/20 to-cyan-600/5",
      iconColor: "text-cyan-400",
    },
  ]

  const formatPoints = (points?: number) => {
    if (!points) return "0"
    if (points >= 1000000) return (points / 1000000).toFixed(1) + "M"
    if (points >= 1000) return (points / 1000).toFixed(1) + "K"
    return points.toLocaleString()
  }

  const liveStats = [
    { label: t("hero.stats.activeViewers"), value: isLive ? (viewers?.toLocaleString() || "0") : "0", icon: Users },
    { label: t("hero.stats.pointsInCirculation"), value: formatPoints(pointsInCirculation), icon: Coins },
    { label: t("hero.stats.registeredPlayers"), value: totalUsers?.toLocaleString() || "0", icon: Users },
  ]

  const copyCode = () => {
    navigator.clipboard.writeText("DONKASJO")
    toast.success(t("common.copied"))
  }

  return (
    <div className="relative flex flex-col">
      {/* Deep Dark Base Background */}
      <div className="fixed inset-0 -z-20 bg-[#050505]" />
      <div
        className="fixed inset-0 -z-10 opacity-60 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, oklch(0.68 0.22 150 / 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, oklch(0.68 0.22 150 / 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black, transparent 95%)'
        }}
      />

      {/* Corner Notification */}
      <div className="hidden lg:block">
        {isHydrated && showNotification && (
          <CornerNotification
            position="bottom-right"
            title={t("notification.newReward.title")}
            message={t("notification.newReward.message")}
            icon="gift"
            dismissible
          />
        )}
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-14 lg:px-12 lg:py-20">
        {/* Subtly brighter background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent" />

        {/* Subtle decorative corner elements */}
        <div className="absolute left-6 top-6 h-16 w-16 border-l-2 border-t-2 border-primary/30" />
        <div className="absolute bottom-6 right-6 h-16 w-16 border-b-2 border-r-2 border-primary/30" />

        <div className="relative mx-auto max-w-4xl">
          {/* Live indicator badge */}
          <div className={`mb-6 inline-flex items-center gap-3 rounded-full border px-4 py-2 transition-all duration-500 min-h-[42px] ${showLoading ? "border-muted-foreground/20 bg-muted/5 animate-pulse" :
            isLive ? "border-green-500/30 bg-green-500/10" :
              "border-red-500/10 bg-red-500/5 opacity-80"
            }`}>
            <span className="relative flex h-2.5 w-2.5">
              {showLoading ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-muted-foreground/30" />
              ) : isLive && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
              )}
              <span className={`relative inline-flex h-2.5 w-2.5 rounded-full transition-colors duration-500 ${showLoading ? "bg-muted-foreground/40" :
                isLive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" :
                  "bg-red-500/60"
                }`} />
            </span>
            <span className={`text-sm font-bold uppercase tracking-wider transition-colors duration-500 ${showLoading ? "text-muted-foreground/60" :
              isLive ? "text-green-500" :
                "text-red-500/70"
              }`}>
              {showLoading ? t("live.status.checking") : isLive ? t("live.status.live") : t("live.status.offline")}
            </span>
            <span className={`h-4 w-px ${showLoading ? "bg-muted-foreground/10" :
              isLive ? "bg-green-500/30" :
                "bg-red-500/20"
              }`} />
            <span className="text-sm text-muted-foreground/80">{t("hero.badge")}</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-7xl text-white uppercase italic">
            {t("hero.title")}
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {t("hero.subtitle")}
          </p>

          {/* Live Stats Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-5 min-h-[28px]">
            {liveStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className={`flex items-center gap-2 transition-colors ${activeStatIndex === index ? "text-primary" : "text-muted-foreground"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-display text-lg font-black italic">{stat.value}</span>
                  <span className="text-sm font-bold uppercase tracking-wider opacity-80">{stat.label}</span>
                </div>
              )
            })}
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              asChild
              size="lg"
              className="group h-12 bg-primary px-8 font-display font-bold hover:bg-primary/90 glow-green"
            >
              <Link href="/api/auth/kick" className="flex items-center">
                <Image
                  src="/65897-kick.gif"
                  width={32}
                  height={32}
                  className="-mt-1 h-8 w-0 object-contain opacity-0 -translate-x-4 transition-all duration-300 ease-out group-hover:width-8 group-hover:opacity-100 group-hover:translate-x-0 group-hover:mr-3"
                  alt="Kick"
                />
                <span className="transition-transform duration-300 group-hover:translate-x-1">{t("hero.cta")}</span>
              </Link>
            </Button>
            <a
              href={`https://kick.com/${process.env.NEXT_PUBLIC_KICK_CHANNEL_ID || "donkasjo"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-full border border-white/10 bg-card/40 backdrop-blur-md px-5 py-2.5 text-sm text-white transition-all hover:border-primary/50 hover:bg-card/60"
            >
              <Play className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-black italic uppercase tracking-wider">{t("footer.stream")}</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-50" />
            </a>
          </div>
        </div>
      </section>

      {/* Quick Links Grid */}
      <section className="relative border-y border-border bg-card/30 px-6 py-12 lg:px-12">
        {/* Top Divider Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-center gap-4">
            <div className="h-10 w-2 bg-primary rounded-full shadow-[0_0_15px_rgba(22,163,74,0.5)]" />
            <h2 className="font-display text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{t("quick.title")}</h2>
          </div>
          <div className="flex flex-col sm:flex-row h-auto sm:h-[400px] w-full gap-3 sm:gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.title}
                  href={link.href}
                  className={`
                    relative overflow-hidden rounded-[2.5rem] border border-white/10 
                    bg-gradient-to-br ${link.color} 
                    transition-[flex,transform,shadow,border-color] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
                    will-change-[flex] transform-gpu
                    flex flex-col
                    w-full h-24 sm:h-full
                    sm:flex-1 sm:hover:!flex-[4]
                    group/card
                    hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/15
                    before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
                  `}
                >
                  {/* Huge Background Watermark Icon */}
                  <Icon className="
                    absolute -right-8 -bottom-8 h-64 w-64 opacity-0 
                    mix-blend-overlay rotate-12
                    transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] transform-gpu
                    group-hover/card:scale-125 group-hover/card:opacity-20 group-hover/card:-translate-y-4 group-hover/card:-translate-x-4 group-hover/card:-rotate-6
                  " />

                  {/* Stable Icon Anchored to Top-Left */}
                  <div className="
                    absolute top-5 left-5 sm:top-6 sm:left-6
                    flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl 
                    border border-border/50 bg-background/90 shadow-lg backdrop-blur-sm
                    transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] transform-gpu group-hover/card:scale-110 group-hover/card:bg-card
                    z-10
                  ">
                    <Icon className={`h-6 w-6 ${link.iconColor} transition-transform duration-500`} />
                  </div>

                  {/* Desktop Text Layer */}
                  <div className="
                    hidden sm:block absolute bottom-10 left-10 w-[320px]
                    transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] transform-gpu
                    z-10
                  ">
                    <span className="block font-display text-4xl font-black text-white italic drop-shadow-lg mb-2 truncate uppercase">{link.title}</span>
                    <span className="block text-sm font-medium text-white/70 whitespace-normal line-clamp-2 leading-relaxed">{link.description}</span>
                  </div>

                  {/* Mobile Text Layer */}
                  <div className="sm:hidden absolute top-0 left-24 right-5 bottom-0 flex flex-col justify-center z-10 w-[calc(100%-120px)]">
                    <span className="font-display text-lg font-black text-foreground truncate">{link.title}</span>
                    <span className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{link.description}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Sections Wrapper with Continuous Gradient Effect */}
      <div className="relative">
        {/* Continuous background glow/gradient spanning several sections */}
        <div className="absolute inset-x-0 top-0 h-full -z-10 bg-gradient-to-b from-transparent to-transparent" />
        
        {/* Bonus Section - Re-enhanced for impact */}
        <section className="relative px-6 py-24 lg:px-12 overflow-hidden">
          {/* Top Divider Line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <div className="mx-auto max-w-5xl relative z-10">
            <Card className="relative overflow-hidden border-white/5 bg-[#0a0a0a]/40 backdrop-blur-3xl group shadow-[0_0_100px_rgba(0,0,0,0.6)]">
              {/* Animated glass shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transform transition-transform duration-1000 ease-in-out" />
              
              <CardContent className="flex flex-col items-center text-center gap-12 p-10 lg:p-20">
                <div className="space-y-8 w-full">
                  <div className="flex flex-col items-center gap-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary badge-shine">
                      <Gift className="h-4 w-4" />
                      {t("bonus.badge")}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-2 bg-primary rounded-full shadow-[0_0_15px_rgba(22,163,74,0.5)]" />
                      <h2 className="font-display text-5xl font-black text-white italic lg:text-7xl uppercase tracking-tighter leading-none">
                        {t("bonus.title")}
                      </h2>
                    </div>
                  </div>
                  
                  <p className="mx-auto max-w-xl text-white/40 italic text-lg leading-relaxed">
                    Nie przegap swojej szansy! Dołącz do tysięcy graczy, którzy codziennie zgarniają nagrody u naszych partnerów.
                  </p>
                </div>

                {/* Impactful Benefits Grid to fill the space */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                  {[
                    { icon: Trophy, label: "WIELKIE WYGRANE", desc: "Zwiększone mnożniki", color: "text-accent" },
                    { icon: Sparkles, label: "DAILY GIVEAWAY", desc: "Codzienne nagrody", color: "text-primary" },
                    { icon: Zap, label: "BONUSY STAKE", desc: "Darmowe środki", color: "text-primary" },
                  ].map((benefit, i) => (
                    <div key={i} className="relative group/tile p-6 rounded-2xl bg-white/[0.03] border border-white/5 transition-all hover:bg-white/[0.07] hover:border-primary/20 hover:-translate-y-1">
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/40 border border-white/5 shadow-inner">
                          <benefit.icon className={cn("h-6 w-6 transition-transform group-hover/tile:scale-110", benefit.color)} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-display text-sm font-black italic uppercase tracking-widest text-white">{benefit.label}</h4>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-white/20">{benefit.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-col items-center">
                  <Button asChild size="lg" className="h-20 px-16 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black italic uppercase tracking-widest text-lg glow-green transition-all transform hover:scale-105 active:scale-95 group/btn">
                    <Link href="/partners" className="flex items-center gap-4">
                      {t("bonus.cta")}
                      <ArrowRight className="h-6 w-6 transition-transform group-hover/btn:translate-x-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>


        {/* CTA Section */}
        <section className="relative px-6 py-32 lg:px-12 overflow-hidden">
          {/* Top Divider Line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-50" />
          
          {/* Background Decorative Text */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
            <span className="font-display text-[20vw] font-black italic uppercase tracking-tighter">DONKASJO</span>
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-8 flex flex-col items-center gap-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                <Rocket className="h-4 w-4" />
                {t("cta.badge")}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="h-12 w-2 bg-primary rounded-full shadow-[0_0_15px_rgba(22,163,74,0.5)]" />
                <h2 className="font-display text-4xl font-black text-white sm:text-5xl lg:text-7xl italic uppercase tracking-tighter leading-none">
                  {t("cta.title")}
                </h2>
              </div>
            </div>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground italic border-l-2 border-primary/20 pl-6 leading-relaxed mb-12">
              {t("cta.subtitle")}
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                className="h-16 rounded-2xl bg-primary px-10 text-black font-black italic uppercase tracking-widest text-sm glow-green transition-all transform hover:scale-105 active:scale-95 group/kick"
              >
                <Link href="/api/auth/kick" className="flex items-center">
                  <Image
                    src="/65897-kick.gif"
                    width={32}
                    height={32}
                    className="-mt-1 h-8 w-8 object-contain mr-3 transition-transform group-hover/kick:scale-125"
                    alt="Kick"
                  />
                  {t("hero.cta")}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-16 rounded-2xl border-white/10 bg-white/5 px-10 font-black italic uppercase tracking-widest text-sm text-white hover:bg-white/10 transition-all transform hover:scale-105 active:scale-95"
              >
                <Link href="/leaderboard" className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-accent" />
                  {t("cta.leaderboard")}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Instructions Preview Section */}
        <section className="relative px-6 py-20 lg:px-12">
          {/* Top Divider Line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-primary/30 to-transparent scale-x-75" />
          
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-2 bg-primary rounded-full shadow-[0_0_15px_rgba(22,163,74,0.5)]" />
                  <h2 className="font-display text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{t("nav.instructions")}</h2>
                </div>
                <p className="text-muted-foreground italic border-l-2 border-white/10 pl-4">{t("instructions.subtitle")}</p>
              </div>
              <Button asChild variant="ghost" className="h-12 rounded-full border border-white/10 bg-white/5 hover:bg-primary hover:text-black transition-all group font-black italic uppercase tracking-widest text-xs">
                <Link href="/instructions" className="flex items-center gap-3">
                  {t("instructions.all")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <InstructionsPreview />
          </div>
        </section>
      </div>

      {/* Premium Footer */}
      <footer className="relative border-t border-white/5 bg-[#050505] px-6 py-20 lg:px-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-12 pb-16 border-b border-white/5">
            <div className="flex justify-center md:justify-start">
              <Link href="/" className="block transition-transform hover:scale-105">
                <Logo width={180} height={60} />
              </Link>
            </div>

            <div className="flex justify-center">
              <a
                href={`https://kick.com/${process.env.NEXT_PUBLIC_KICK_CHANNEL_ID || "donkasjo"}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group flex items-center gap-3 rounded-2xl border px-6 py-3 transition-all duration-500",
                  isLive
                    ? "border-green-500/20 bg-green-500/5 hover:border-green-500/50 hover:bg-green-500/10 text-green-500"
                    : "border-red-500/20 bg-red-500/5 hover:border-red-500/50 hover:bg-red-500/10 text-red-500"
                )}
              >
                <span className="relative flex h-3 w-3">
                  {isLive && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />}
                  <span className={cn("relative inline-flex h-3 w-3 rounded-full", isLive ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500")} />
                </span>
                <span className="text-sm font-black italic uppercase tracking-[0.2em]">{t("footer.stream")}</span>
                <ExternalLink className="h-4 w-4 opacity-40 transition-opacity group-hover:opacity-100" />
              </a>
            </div>

            <div className="text-center md:text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">&copy; {new Date().getFullYear()} DON KASJO</p>
              <p className="mt-1 text-sm font-bold italic text-white/40">{t("footer.rights")}</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="mx-auto max-w-4xl text-[10px] leading-loose font-medium text-white/30 uppercase tracking-widest">
              {t("footer.disclaimer")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
