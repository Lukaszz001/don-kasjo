"use client"

import { useLanguage } from "@/lib/language-context"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, Gift, Users, MessageSquare, Zap, ExternalLink, Sparkles, ArrowRight } from "lucide-react"

// Custom Discord Icon SVG for premium look
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 127.14 96.36"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.87,56.6.35,80.1a105.77,105.77,0,0,0,32.59,16.26,77.7,77.7,0,0,0,7.12-11.59A67,67,0,0,1,28.68,78.2c1,0.72,2.06,1.41,3.08,2.07a76.48,76.48,0,0,0,63.7,0c1.06-.66,2.1-1.35,3.08-2.07a67,67,0,0,1-11.38,6.57,77.34,77.34,0,0,0,7.12,11.59,105.09,105.09,0,0,0,32.59-16.26C129.7,51.87,125,28.15,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.07-12.71,11.41-12.71,11.54,5.74,11.41,12.71S48.74,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.07-12.71,11.41-12.71,11.54,5.74,11.41,12.71S91,65.69,84.69,65.69Z" />
  </svg>
)

export default function DiscordPage() {
  const { t } = useLanguage()

  // Change this to the actual Discord invite link if known
  const discordInvite = "https://discord.gg/turbofamilia"

  return (
    <div className="relative min-h-screen px-4 py-12 lg:px-8">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] bg-[#5865F2]/10 blur-[140px]" />
      <div className="absolute bottom-0 left-0 -z-10 h-[600px] w-[600px] bg-primary/5 blur-[140px]" />

      <div className="mx-auto max-w-6xl space-y-16">
        {/* Header Section */}
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#5865F2]/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#7289da] badge-shine">
            <DiscordIcon className="h-4 w-4" />
            COMMUNITY HUB
          </div>
          <h1 className="font-display text-5xl font-black text-white lg:text-8xl uppercase italic tracking-tighter leading-none mb-6">
            DOŁĄCZ DO <span className="text-[#5865F2] italic">NASZEGO DISCORDA</span>
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground border-l-4 border-[#5865F2]/50 pl-6 text-center leading-relaxed italic">
            Zostań częścią armii Don Kasjo. Najszybsze informacje o streamach, ekskluzywne kody bonusowe i największa społeczność.
          </p>
        </div>

        {/* Main CTA Card */}
        <Card className="relative overflow-hidden border-white/5 bg-[#0a0a0a]/60 backdrop-blur-3xl shadow-2xl">
          {/* Animated Glows */}
          <div className="absolute -top-24 -right-24 h-48 w-48 bg-[#5865F2]/20 blur-[80px] animate-pulse" />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-primary/10 blur-[80px]" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#5865F2]/40 to-transparent" />

          <CardContent className="relative z-10 p-8 lg:p-16">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
              <div className="flex-1 text-center lg:text-left space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter leading-none">
                    TWOJE Centrum <span className="text-[#5865F2]">Informacji</span>
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                    Dołącz do tysięcy widzów, bierz udział w dedykowanych giveawayach i bądź zawsze na bieżąco z Don Kasjo.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <Button
                    asChild
                    className="h-16 px-12 text-xl font-black italic bg-[#5865F2] hover:bg-[#4752C4] shadow-[0_0_30px_rgba(88,101,242,0.3)] transition-all duration-500 hover:scale-105 active:scale-95 gap-3 uppercase tracking-wider rounded-2xl group/btn"
                  >
                    <a href={discordInvite} target="_blank" rel="noopener noreferrer">
                      <DiscordIcon className="h-7 w-7" />
                      WCHODZĘ NA KANAŁ
                      <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-2" />
                    </a>
                  </Button>
                  
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-glow-pulse shadow-[0_0_10px_#22c55e]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">2,410 ONLINE</span>
                  </div>
                </div>
              </div>

              {/* Visual Logo Container */}
              <div className="relative group/logo">
                <div className="absolute inset-0 bg-[#5865F2]/20 blur-[100px] opacity-0 group-hover/logo:opacity-100 transition-opacity duration-700" />
                <div className="relative h-64 w-64 lg:h-80 lg:w-80 rounded-[3rem] overflow-hidden border-2 border-white/10 group-hover/logo:border-[#5865F2]/50 transition-all duration-700 shadow-2xl group-hover/logo:-rotate-3 group-hover/logo:scale-105">
                  <Image
                    src="https://pbs.twimg.com/media/Gxy86hmWwAApnxQ.jpg"
                    alt="Don Kasjo Discord"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#5865F2]/60 via-transparent to-transparent opacity-60 group-hover/logo:opacity-20 transition-opacity" />
                  
                  {/* Premium Shine */}
                  <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-100%] left-[-100%] w-[300%] h-[300%] bg-gradient-to-br from-transparent via-white/20 to-transparent rotate-[35deg] transition-transform duration-1000 group-hover/logo:translate-x-[50%] group-hover/logo:translate-y-[50%]" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Bell className="h-7 w-7 text-[#5865F2]" />}
            title="POWIADOMIENIA"
            desc="Otrzymuj alerty o każdym streamie, nowym filmie i ważnym ogłoszeniu natychmiastowo."
          />
          <FeatureCard
            icon={<Gift className="h-7 w-7 text-primary" />}
            title="GIVEAWAYE"
            desc="Dedykowane konkursy tylko dla członków Discorda. Gry, sprzęt i punkty lojalnościowe."
          />
          <FeatureCard
            icon={<MessageSquare className="h-7 w-7 text-green-400" />}
            title="DYREKTYWY"
            desc="Miejsce do dyskusji, wymiany opinii i bezpośredniego kontaktu z ekipą Don Kasjo."
          />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <Card className="group relative overflow-hidden border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl transition-all duration-300 hover:border-[#5865F2]/40 hover:-translate-y-2">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute -bottom-10 -right-10 h-24 w-24 bg-[#5865F2]/5 blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardContent className="flex flex-col items-center text-center p-10 relative z-10">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:bg-[#5865F2]/10 group-hover:border-[#5865F2]/30">
          {icon}
        </div>
        <h3 className="mb-3 text-xl font-display font-black text-white italic uppercase tracking-tighter transition-colors group-hover:text-primary">
          {title}
        </h3>
        <p className="text-sm italic font-medium text-white/40 leading-relaxed">
          "{desc}"
        </p>
      </CardContent>
    </Card>
  )
}
