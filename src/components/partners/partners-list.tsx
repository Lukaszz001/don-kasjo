"use client"

import { useState } from "react"
import Image from "next/image"
import { Handshake, ExternalLink, Copy, Check, Gift } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"
import { PusherRefresh } from "@/components/common/pusher-refresh"

interface Partner {
  _id: string
  name: string
  imageUrl: string
  bonus: string
  description: string
  code: string | null
  link: string
  color?: string
  htmlContent?: string
}

export function PartnersList({ initialPartners }: { initialPartners: any[] }) {
  const { t } = useLanguage()
  const partners = initialPartners

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-12 space-y-12">
      <PusherRefresh channelName="platform-updates" eventName="partners-updated" />
      <div className="text-center lg:text-left space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[10px] font-black text-primary tracking-[0.2em] animate-pulse-glow uppercase">
          <Gift className="h-4 w-4" />
          {t("partners.badge")}
        </div>
        <h1 className="font-display text-4xl font-black text-white lg:text-7xl uppercase italic tracking-tighter leading-none">
          {t("nav.bonuses")} <span className="text-primary tracking-normal font-archivo">{t("partners.deals")}</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground border-l-4 border-primary/50 pl-6 max-w-2xl leading-relaxed">
          {t("partners.subtitle")}
        </p>
      </div>

      {partners.length === 0 ? (
        <Card className="border-dashed border-white/10 bg-white/5 backdrop-blur-md">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Handshake className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">
              {t("partners.empty.title")}
            </h3>
            <p className="mt-2 max-w-sm text-muted-foreground font-medium">
              {t("partners.empty.desc")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-12">
          {partners.map((partner) => (
            <PartnerCard key={partner._id} partner={partner} />
          ))}
        </div>
      )}
    </div>
  )
}

function PartnerCard({ partner }: { partner: Partner }) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    if (partner.code) {
      await navigator.clipboard.writeText(partner.code)
      setCopied(true)
      toast.success(t("partners.codeCopied"))
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Dynamic Styles Based on Color
  const theme = {
    blue: "from-blue-600/20 via-blue-600/5 to-transparent border-blue-500/30 text-blue-400 glow-blue shadow-blue-500/10 hover:border-blue-500/60",
    "purple-blue": "from-indigo-600/20 via-indigo-600/5 to-transparent border-indigo-500/30 text-indigo-400 glow-indigo shadow-indigo-500/10 hover:border-indigo-500/60",
    amber: "from-amber-600/20 via-amber-600/5 to-transparent border-amber-500/30 text-amber-400 glow-amber shadow-amber-500/10 hover:border-amber-500/60",
    lime: "from-lime-600/20 via-lime-600/5 to-transparent border-lime-500/30 text-lime-400 glow-lime shadow-lime-500/10 hover:border-lime-500/60",
    red: "from-red-600/20 via-red-600/5 to-transparent border-red-500/30 text-red-400 glow-red shadow-red-500/10 hover:border-red-500/60",
    purple: "from-purple-600/20 via-purple-600/5 to-transparent border-purple-500/30 text-purple-400 glow-purple shadow-purple-500/10 hover:border-purple-500/60",
  }[partner.color || "blue"] || "from-primary/20 via-primary/5 to-transparent border-white/10 text-primary shadow-primary/5 hover:border-primary/50"

  const btnTheme = {
    blue: "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20 text-white",
    "purple-blue": "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 text-white",
    amber: "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20 text-white font-black",
    lime: "bg-lime-600 hover:bg-lime-500 shadow-lime-600/20 text-black font-black",
    red: "bg-red-600 hover:bg-red-500 shadow-red-600/20 text-white",
    purple: "bg-purple-600 hover:bg-purple-500 shadow-purple-600/20 text-white",
  }[partner.color || "blue"] || "bg-primary text-primary-foreground"

  const badgeTheme = {
    blue: "bg-blue-600 text-white",
    "purple-blue": "bg-indigo-600 text-white",
    amber: "bg-amber-600 text-white font-black",
    lime: "bg-lime-600 text-black font-black",
    red: "bg-red-600 text-white font-black",
    purple: "bg-purple-600 text-white",
  }[partner.color || "blue"] || "bg-primary text-primary-foreground"

  return (
    <Card className={`flex flex-col overflow-hidden bg-card/40 backdrop-blur-xl group transition-all duration-500 hover:shadow-2xl relative border-2 p-0 gap-0 ${theme.split(" ")[2]} ${theme.split(" ")[5]}`}>
      {/* Dynamic Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.split(" ")[0]} ${theme.split(" ")[1]} ${theme.split(" ")[2]} opacity-50 group-hover:opacity-80 transition-opacity`} />
      
      {/* Rim light top */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-white/40 transition-all duration-500" />
      
      {/* Image Section - Clean, no overlay covering logo */}
      <div className="relative aspect-[16/9] md:aspect-[18/6] overflow-hidden bg-black/40">
        {partner.imageUrl ? (
          <Image
            src={partner.imageUrl}
            alt={partner.name}
            fill
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority={true}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Handshake className="h-16 w-16 text-white/5 transition-colors group-hover:text-primary/20" />
          </div>
        )}
        
        {/* Subtle bottom edge fade only - keeps the logo visible */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        
        <Badge className={`absolute right-6 top-6 font-black italic tracking-tight py-2 px-6 text-sm shadow-2xl animate-glow-pulse border-none ${badgeTheme}`}>
          <Gift className="mr-2 h-4 w-4" />
          {partner.bonus}
        </Badge>
      </div>

      {/* Content Section - Below the image */}
      <div className="relative z-10 p-6 md:p-8 flex flex-col gap-6">
        {/* Title & Description */}
        <div className="space-y-3">
          <CardTitle className={`text-3xl md:text-5xl font-black italic truncate uppercase tracking-tighter transition-colors ${theme.split(" ")[3]} group-hover:text-white`}>
            {partner.name}
          </CardTitle>
          
          <div className="max-w-3xl">
            {partner.htmlContent ? (
              <div 
                className="text-sm md:text-base font-medium text-white/80 leading-relaxed italic line-clamp-3 prose-strong:text-white prose-strong:not-italic"
                dangerouslySetInnerHTML={{ __html: partner.htmlContent }} 
              />
            ) : partner.description && (
              <p className="text-sm md:text-base font-medium text-white/70 leading-relaxed italic line-clamp-3">
                &quot;{partner.description}&quot;
              </p>
            )}
          </div>
        </div>

        {/* Code & Visit Button - Side by side on desktop */}
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          {partner.code && (
            <div className="space-y-1 flex-1 max-w-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/60 transition-colors">{t("partners.code")}</span>
              <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 p-1.5 shadow-inner transition-colors group-hover:border-white/20 group-hover:bg-white/[0.07]">
                <code className="flex-1 pl-3 font-mono text-xl font-black text-white italic tracking-[0.2em] uppercase">
                  {partner.code}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-10 w-10 rounded-lg text-white/40 hover:bg-white/10 transition-all ${theme.split(" ")[3]}`}
                  onClick={copyCode}
                >
                  {copied ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <Button 
            asChild 
            className={`w-full md:w-auto md:min-w-[280px] h-14 text-sm font-black italic uppercase tracking-widest transition-all duration-300 shadow-xl py-6 ${btnTheme}`}
          >
            <a href={partner.link} target="_blank" rel="noopener noreferrer">
              {t("partners.visit")}
              <ExternalLink className="ml-3 h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </Card>
  )
}
