"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import useSWR from "swr"
import {
  Home,
  Gift,
  TrendingUp,
  ShoppingBag,
  Trophy,
  BookOpen,
  User,
  LogOut,
  Crown,
  Coins,
  Menu,
  X,
  LayoutDashboard,
  Users as UsersIcon,
  Handshake,
  Settings,
  ArrowLeft,
  Target,
  Dices,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"
import { Logo } from "./logo"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const DiscordIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z" />
  </svg>
)

export function SidebarNav({ initialUser }: { initialUser?: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data, mutate } = useSWR("/api/auth/me", fetcher, {
    fallbackData: initialUser ? { user: initialUser } : undefined,
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Cache for 1 minute
  })
  const user = data?.user

  const isAdminRoute = pathname.startsWith("/admin")

  const mainNavigation = [
    { name: t("nav.home"), href: "/", icon: Home },
    { name: t("nav.bonuses"), href: "/partners", icon: Gift },
    { name: t("nav.predictions"), href: "/predictions", icon: TrendingUp },
    { name: t("nav.shop"), href: "/shop", icon: ShoppingBag },
    { name: t("nav.leaderboard"), href: "/leaderboard", icon: Trophy },
    { name: t("nav.instructions"), href: "/instructions", icon: BookOpen },
    { name: t("nav.bonusHunt"), href: "/bonus-hunt", icon: Target },
    { name: t("nav.discord"), href: "/discord", icon: DiscordIcon },
  ]

  const adminNavigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Uzytkownicy", href: "/admin/users", icon: UsersIcon },
    { name: "Predykcje", href: "/admin/predictions", icon: TrendingUp },
    { name: "Giveaway", href: "/admin/giveaway", icon: Gift },
    { name: "Zgadnij Wynik", href: "/admin/bonus-guess", icon: Dices },
    { name: "Sklep", href: "/admin/shop", icon: ShoppingBag },
    { name: "Instrukcje", href: "/admin/instructions", icon: BookOpen },
    { name: "Partnerzy", href: "/admin/partners", icon: Handshake },
    { name: "Logi Zakupów", href: "/admin/purchases", icon: ShoppingBag },
    ...(user?.isDeveloper ? [{ name: "Ustawienia", href: "/admin/settings", icon: Settings }] : []),
  ]

  const navigation = isAdminRoute ? adminNavigation : mainNavigation

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    mutate({ user: null })
    router.push("/")
  }

  const isActive = (href: string) => {
    if (href === "/" || href === "/admin") return pathname === href
    return pathname === href || pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <>
      <div className="mb-8 hidden lg:block">
        <Link href="/" className="block w-full max-w-[180px]">
          <Logo width={180} height={60} />
        </Link>
      </div>

      {/* Language Switcher */}
      <div className="mb-8">
        <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
          <button
            onClick={() => setLanguage("pl")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-black italic transition-all group tracking-widest",
              language === "pl"
                ? "bg-primary text-primary-foreground shadow-lg glow-green"
                : "text-white/40 hover:bg-white/5 hover:text-white"
            )}
          >
            <svg className="h-3.5 w-auto aspect-[3/2] rounded-[2px] opacity-90 transition-opacity group-hover:opacity-100" viewBox="0 0 20 15" aria-label="Polski">
              <rect width="20" height="15" fill="#fff"/>
              <rect y="7.5" width="20" height="7.5" fill="#dc143c"/>
            </svg>
            <span>PL</span>
          </button>
          <button
            onClick={() => setLanguage("en")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-black italic transition-all group tracking-widest",
              language === "en"
                ? "bg-primary text-primary-foreground shadow-lg glow-green"
                : "text-white/40 hover:bg-white/5 hover:text-white"
            )}
          >
            <svg className="h-3.5 w-auto aspect-[3/2] rounded-[2px] opacity-90 transition-opacity group-hover:opacity-100" viewBox="0 0 60 30" aria-label="English">
              <rect width="60" height="30" fill="#012169"/>
              <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
              <path d="M0,0 L60,30 M60,0 L0,30" stroke="#c8102e" strokeWidth="4"/>
              <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10"/>
              <path d="M30,0 V30 M0,15 H60" stroke="#c8102e" strokeWidth="6"/>
            </svg>
            <span>EN</span>
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto space-y-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
        {navigation.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const isBonuses = item.href === "/partners"

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-black italic uppercase tracking-widest transition-all overflow-hidden",
                active
                  ? "bg-primary/10 text-primary"
                  : isBonuses
                    ? "bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20"
                    : "text-white/40 hover:bg-white/5 hover:text-white"
              )}
            >
              {/* Active indicator line & Rim light */}
              {active && (
                <>
                  <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_10px_var(--primary)]" />
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                </>
              )}

              {/* Special Glow for Bonuses */}
              {isBonuses && !active && (
                <div className="absolute inset-0 bg-accent/5 animate-pulse-glow pointer-events-none" />
              )}

              <Icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", active && "text-primary", isBonuses && !active && "text-accent")} />
              <span>{item.name}</span>

              {/* Special Badge for Bonuses - Only show when NOT active */}
              {isBonuses && !active && (
                <span className="ml-auto flex h-5 items-center rounded-full bg-accent px-2 text-[8px] font-black italic text-black animate-bounce-subtle shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                  HOT
                </span>
              )}
            </Link>
          )
        })}
      </nav>



      {/* User Section - Min-height for stability */}
      <div className="mt-auto border-t border-white/10 pt-6">
        {user ? (
          <div className="space-y-4">
            {/* Points Display */}
            <div className="group flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 shadow-lg shadow-primary/5 transition-all hover:bg-primary/20">
              <Coins className="h-5 w-5 text-primary animate-bounce-subtle" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-70">{t("nav.balance")}</span>
                <span className="text-sm font-black italic text-primary">
                  {user.points.toLocaleString()}
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-2.5 backdrop-blur-sm">
              <Avatar className="h-10 w-10 border-2 border-primary/40 shadow-lg">
                <AvatarImage src={user.kickAvatar} alt={user.kickUsername} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.kickUsername.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {user.kickUsername}
                </p>
              </div>
            </div>

            {/* User Actions */}
            <div className="space-y-1">
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                <User className="h-4 w-4" />
                {t("nav.profile")}
              </Link>
              {(user.isAdmin || user.isDeveloper) && !isAdminRoute && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                  <Crown className="h-4 w-4" />
                  {t("nav.admin")}
                </Link>
              )}
              {isAdminRoute && (
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{t("returnToSite")}</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                {t("nav.logout")}
              </button>
            </div>
          </div>
        ) : (
          <Button
            asChild
            className="group w-full bg-primary font-semibold hover:bg-primary/90 glow-green"
          >
            <Link href="/api/auth/kick" className="flex w-full items-center justify-center">
              <Image
                src="/65897-kick.gif"
                width={28}
                height={28}
                className="-mt-1 h-7 w-0 object-contain opacity-0 -translate-x-4 transition-all duration-300 ease-out group-hover:w-7 group-hover:opacity-100 group-hover:translate-x-0 group-hover:mr-2"
                alt="Kick"
              />
              <span className="transition-transform duration-300 group-hover:translate-x-1">{t("hero.cta")}</span>
            </Link>
          </Button>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Top Bar Header - Requested Layout */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-between border-b border-border bg-[#0a0a0a]/90 px-6 backdrop-blur-xl lg:hidden">
        {/* Toggle Button - Left */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-12 w-12 items-center justify-start transition-transform active:scale-95"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6 text-primary" /> : <Menu className="h-6 w-6 text-white" />}
        </button>

        {/* Center Logo */}
        <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Logo width={160} height={54} className="h-14 w-auto" />
        </Link>

        {/* Right - Profile Avatar / Login Icon */}
        <div className="flex items-center justify-end w-12">
          {user ? (
            <Link href="/profile" onClick={() => setMobileOpen(false)}>
              <Avatar className="h-9 w-9 border border-primary/40 ring-1 ring-primary/20 transition-transform hover:scale-105 active:scale-95">
                <AvatarImage src={user.kickAvatar} alt={user.kickUsername} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs uppercase">
                  {user.kickUsername.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white/70 hover:text-white"
            >
              <Link href="/api/auth/kick">
                <User className="h-6 w-6" />
              </Link>
            </Button>
          )}
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-md lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-border bg-sidebar p-6 lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar - Drawer style */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-[70] flex h-screen w-72 flex-col border-r border-border bg-[#0a0a0a] p-6 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:hidden",
          mobileOpen ? "translate-x-0 overflow-y-auto" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
