"use client"

import useSWR from "swr"
import { useEffect, useState } from "react"
import { 
  Settings, 
  CheckCircle2, 
  ShieldAlert, 
  Info, 
  Save, 
  Server, 
  Globe, 
  Bot,
  Hash,
  Key,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Zap,
  DollarSign
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { apiFetcher, apiRequest } from "@/lib/api-client"

export default function AdminSettingsPage() {
  const router = useRouter()
  const { data: userData } = useSWR("/api/auth/me", apiFetcher)
  const { data: configData, mutate: mutateConfig, isLoading } = useSWR("/api/admin/config", apiFetcher)
  const [isSaving, setIsSaving] = useState<string | null>(null)

  const user = userData?.user
  
  useEffect(() => {
    if (!isLoading && user && !user.isDeveloper) {
      router.push("/admin")
    }
  }, [isLoading, router, user])

  const handleSaveConfig = async (key: string, value: string) => {
    setIsSaving(key)
    try {
      const response = await apiRequest("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      })

      if (!response.ok) throw new Error("Błąd podczas zapisywania")
      toast.success(`Ustawienie ${key} zostało zapisane`)
      mutateConfig()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSaving(null)
    }
  }

  if (!isLoading && user && !user.isDeveloper) {
    return null
  }

  const CONFIG_FIELDS = [
    { 
      group: "Główne (Platforma)", 
      icon: Globe,
      items: [
        { key: "NEXT_PUBLIC_KICK_CHANNEL_ID", label: "Kick Channel ID", desc: "Slug kanału Kick (z adresu URL). Przykładowo: 'donkasjo'", icon: Hash },
        { key: "NEXT_PUBLIC_APP_URL", label: "App URL", desc: "Podstawowy adres strony (np. https://donkasjo.pl)", icon: Globe },
      ]
    },
    { 
      group: "Integracja Stake", 
      icon: DollarSign,
      items: [
        { key: "STAKE_API_KEY", label: "Stake API Key", desc: "Klucz API do autoryzacji z platformą Stake", icon: Key, isSecret: true },
      ]
    },
    { 
      group: "Auth Kick (OAuth)", 
      icon: ShieldCheck,
      items: [
        { key: "KICK_CLIENT_ID", label: "Kick Client ID", desc: "Pobierany z dashboardu deweloperskiego Kick", icon: ShieldAlert },
        { key: "KICK_CLIENT_SECRET", label: "Kick Client Secret", desc: "Sekretny klucz klienta (nigdy go nie podawaj publicznie)", icon: Key, isSecret: true },
        { key: "KICK_REDIRECT_URI", label: "Redirect URI", desc: "Zwykle: {APP_URL}/api/auth/kick/callback", icon: Server },
      ]
    },
    { 
      group: "Integracja bota", 
      icon: Bot,
      items: [
        { key: "KICK_BOT_NAME", label: "Bot Name", desc: "Nick bota który będzie pisał na czacie", icon: Bot },
        { key: "KICK_BOT_CHANNEL", label: "Bot Channel ID", desc: "ID kanału na którym bot ma uprawnienia moderatora", icon: Hash },
      ]
    }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="grid gap-6">
          <div className="h-40 rounded-xl bg-muted animate-pulse" />
          <div className="h-40 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary border border-primary/30 glow-green">
            <Settings className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-black text-white italic uppercase tracking-tighter">
              Developer Control Center
            </h1>
            <p className="text-muted-foreground font-medium">Zaawansowana konfiguracja zmiennych środowiskowych i integracji zewnętrznych.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        {/* Help & Documentation Section */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-primary/20 bg-primary/5 sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg uppercase italic font-black">
                <BookOpen className="h-5 w-5 text-primary" />
                Instrukcja Konfiguracji
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm text-muted-foreground leading-relaxed">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">1</div>
                  <p><span className="text-white font-bold">Kick Channel ID:</span> To jest końcówka Twojego adresu URL na Kick (np. donkasjo). Jest on kluczowy do pobierania statusu live.</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">2</div>
                  <p><span className="text-white font-bold">Integracja Stake:</span> Wymaga <span className="text-primary italic">STAKE_API_KEY</span>. Służy do automatycznej weryfikacji kont i sprawdzania depozytów.</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">3</div>
                  <p><span className="text-white font-bold">OAuth Kick:</span> Musisz zarejestrować aplikację w deweloperskim panelu Kick. Redirect URI musi być identyczny z tym, który podasz tutaj.</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">4</div>
                  <p><span className="text-white font-bold">Zapisywanie:</span> Po wpisaniu wartości kliknij poza pole tekstowe (Blur), aby automatycznie zapisać zmianę w bazie. Aktywne pola zostaną oznaczone zieloną etykietą.</p>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 flex gap-3 text-amber-200/80">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p className="text-[11px] font-bold uppercase tracking-wider">Uwaga: Te ustawienia działają natychmiast i nadpisują plik .env bez restartu serwera!</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Fields */}
        <div className="lg:col-span-2 space-y-10">
          {CONFIG_FIELDS.map((group) => (
            <div key={group.group} className="space-y-6">
              <div className="flex items-center gap-3 px-2 border-l-2 border-primary/50">
                <group.icon className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-white uppercase tracking-tight italic">{group.group}</h2>
              </div>

              <div className="grid gap-4">
                {group.items.map((cfg) => (
                  <Card key={cfg.key} className="border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl group hover:border-white/10 transition-all">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/40 transition-colors">
                              <cfg.icon className={configData?.config?.[cfg.key] ? "h-6 w-6 text-primary" : "h-6 w-6 text-muted-foreground"} />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white uppercase tracking-tight">{cfg.label}</h4>
                                {configData?.config?.[cfg.key] && (
                                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] py-0 px-1.5 uppercase italic">Active</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{cfg.desc}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="relative flex-1">
                            <Input 
                              type={cfg.isSecret ? "password" : "text"}
                              placeholder={`Wprowadź ${cfg.label}...`}
                              defaultValue={configData?.config?.[cfg.key] || ""}
                              className="bg-white/5 border-white/10 h-12 pr-12 focus:border-primary/50 text-white font-mono"
                              onBlur={(e) => {
                                const newValue = e.target.value
                                const oldValue = configData?.config?.[cfg.key] || ""
                                if (newValue !== oldValue) {
                                  handleSaveConfig(cfg.key, newValue)
                                }
                              }}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              {isSaving === cfg.key ? (
                                <Zap className="h-4 w-4 animate-pulse text-primary" />
                              ) : configData?.config?.[cfg.key] ? (
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              ) : null}
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground/30 font-mono uppercase tracking-widest px-1">
                          Key ID: {cfg.key}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
