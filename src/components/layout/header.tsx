"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import useSWR from "swr"
import {
  Menu,
  X,
  User,
  LogOut,
  Shield,
  Trophy,
  ShoppingBag,
  BookOpen,
  Handshake,
  TrendingUp,
  Coins,
  Gift,
  Zap,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data, mutate } = useSWR("/api/auth/me", fetcher)
  const user = data?.user

  const navigation = [
    { name: t("nav.bonuses"), href: "/partners", icon: Gift },
    { name: t("nav.predictions"), href: "/predictions", icon: TrendingUp },
    { name: t("nav.shop"), href: "/shop", icon: ShoppingBag },
    { name: t("nav.leaderboard"), href: "/leaderboard", icon: Trophy },
    { name: t("nav.instructions"), href: "/instructions", icon: BookOpen },
    { name: t("nav.discord"), href: "/discord", icon: DiscordIcon },
  ]

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    mutate({ user: null })
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link href="/" className="block w-[150px] lg:w-[180px]">
          <Logo width={180} height={60} />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            const isBonuses = item.href === "/partners"

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all group",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : isBonuses
                      ? "text-accent hover:bg-accent/10 hover:text-accent font-black shadow-[0_0_15px_rgba(251,191,36,0.1)] border border-accent/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isBonuses && !isActive && "text-accent animate-pulse-glow")} />
                {item.name}

                {isBonuses && !isActive && (
                  <span className="absolute -top-1 -right-1 flex h-4 items-center justify-center rounded-full bg-accent px-1.5 text-[7px] font-black italic text-black shadow-lg animate-bounce-subtle">
                    HOT
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* User Menu / Login */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Points Display */}
              <div className="hidden items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 sm:flex">
                <Coins className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {user.points.toLocaleString()}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-primary/20 hover:ring-primary/40">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.kickAvatar} alt={user.kickUsername} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.kickUsername.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.kickAvatar} alt={user.kickUsername} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.kickUsername.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.kickUsername}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.points.toLocaleString()} {t("points")}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t("nav.profile")}
                    </Link>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {t("nav.admin")}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild className="group bg-primary hover:bg-primary/90 glow-red">
              <Link href="/api/auth/kick" className="flex items-center">
                <Image
                  src="/65897-kick.gif"
                  width={24}
                  height={24}
                  className="-mt-1 h-6 w-0 object-contain opacity-0 -translate-x-4 transition-all duration-300 ease-out group-hover:w-6 group-hover:opacity-100 group-hover:translate-x-0 group-hover:mr-2"
                  alt="Kick"
                />
                <span className="transition-transform duration-300 group-hover:translate-x-1">{t("hero.cta")}</span>
              </Link>
            </Button>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-card lg:hidden">
          <div className="space-y-1 px-4 py-3">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              const isBonuses = item.href === "/partners"

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : isBonuses
                        ? "bg-accent/10 text-accent border border-accent/20 font-black shadow-[0_0_15px_rgba(251,191,36,0.1)]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-5 w-5", isBonuses && !isActive && "text-accent animate-pulse-glow")} />
                    {item.name}
                  </div>

                  {isBonuses && !isActive && (
                    <span className="flex h-5 items-center justify-center rounded-full bg-accent px-2 text-[8px] font-black italic text-black shadow-lg animate-bounce-subtle">
                      HOT DEALS
                    </span>
                  )}
                </Link>
              )
            })}
            {user && (
              <>
                <div className="my-2 border-t border-border" />
                <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2.5">
                  <Coins className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    {user.points.toLocaleString()} {t("points")}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
