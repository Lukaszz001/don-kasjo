"use client"

import Link from "next/link"
import Image from "next/image"
import { ExternalLink, Mail, Clock } from "lucide-react"
import { useStreamStatus } from "@/hooks/use-stream-status"

import { useLanguage } from "@/lib/language-context"

export function Footer() {
  const { t } = useLanguage()
  const { isLive } = useStreamStatus()

  const footerLinks = {
    quickLinks: [
      { name: t("nav.bonuses"), href: "/partners" },
      { name: t("nav.shop"), href: "/shop" },
      { name: t("nav.predictions"), href: "/predictions" },
      { name: t("nav.leaderboard"), href: "/leaderboard" },
      { name: t("nav.instructions"), href: "/instructions" },
      { name: t("nav.discord"), href: "/discord" },
    ],
    instructions: [
      { name: "Omijanie blokad internetowych", href: "/instructions/omijanie-blokad" },
      { name: "Przewodnik po kryptowalutach", href: "/instructions/przewodnik-krypto" },
      { name: "Bezpieczne wyplacanie wygranych", href: "/instructions/wyplacanie-wygranych" },
      { name: "Odpowiedzialna gra", href: "/instructions" },
      { name: "Bonusy i wymogi obrotu", href: "/instructions" },
      { name: "Bezpieczenstwo konta", href: "/instructions" },
    ],
    legal: [
      { name: "Polityka prywatnosci", href: "/privacy" },
      { name: "Warunki uslugi", href: "/terms" },
      { name: "Skontaktuj sie", href: "/contact" },
      { name: "Polityka cookies", href: "/cookies" },
    ],
  }

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/70 transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("footer.instructions")}
            </h3>
            <ul className="space-y-3">
              {footerLinks.instructions.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/70 transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("footer.legal")}
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/70 transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("footer.social")}
            </h3>
            
            <a
              href={`https://kick.com/${process.env.NEXT_PUBLIC_KICK_CHANNEL_ID || "donkasjo"}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`mb-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                isLive 
                  ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" 
                  : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
              }`}
            >
              <span className="relative flex h-2 w-2">
                {isLive && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${isLive ? "bg-green-500" : "bg-red-500"}`} />
              </span>
              {t("footer.stream")}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href="mailto:kontakt@donkasjo.pl" className="hover:text-foreground">
                kontakt@donkasjo.pl
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-xs text-muted-foreground leading-relaxed text-center max-w-4xl mx-auto">
            {t("footer.disclaimer")}
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <Link href="/" className="block w-[100px]">
            <Image src="/logo.png" alt="Don Kasjo Logo" width={100} height={33} className="w-full h-auto" />
          </Link>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Don Kasjo. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  )
}
