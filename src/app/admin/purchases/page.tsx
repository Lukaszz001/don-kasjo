"use client"

import { useState } from "react"
import useSWR from "swr"
import { 
  ShoppingBag, 
  Search, 
  User, 
  Calendar, 
  Coins, 
  Clock,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { apiFetcher } from "@/lib/api-client"

interface PurchaseLog {
  _id: string
  itemName: string
  pointsSpent: number
  status: string
  createdAt: string
  userId: {
    kickUsername: string
    kickAvatar: string
    email?: string
  }
}

export default function AdminPurchasesPage() {
  const { data, isLoading } = useSWR("/api/admin/purchases", apiFetcher)
  const [searchQuery, setSearchQuery] = useState("")

  const purchases: PurchaseLog[] = data?.purchases || []

  const filteredPurchases = purchases.filter(p => 
    p.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.userId.kickUsername.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-4xl font-black italic uppercase tracking-tighter text-white">
            Logi <span className="text-primary">Zakupów</span>
          </h1>
          <p className="text-muted-foreground italic">Historia wszystkich transakcji w sklepie punktowym.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
          <Input
            placeholder="Szukaj użytkownika lub przedmiotu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#0a0a0a]/60 border-white/10 rounded-xl"
          />
        </div>
      </div>

      {/* Main Content */}
      <Card className="border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Użytkownik</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Przedmiot</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Koszt</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Data</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-10 w-32 bg-white/5 rounded-lg" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-40 bg-white/5 rounded-lg" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-20 bg-white/5 rounded-lg" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-24 bg-white/5 rounded-lg" /></td>
                      <td className="px-6 py-4"><div className="ml-auto h-6 w-24 bg-white/5 rounded-lg" /></td>
                    </tr>
                  ))
                ) : filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <ShoppingBag className="mx-auto h-12 w-12 text-white/10 mb-4" />
                      <p className="text-white/40 font-bold italic uppercase tracking-widest">Nie znaleziono zakupów</p>
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <tr key={purchase._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-white/10">
                            <AvatarImage src={purchase.userId?.kickAvatar} />
                            <AvatarFallback className="bg-muted font-black uppercase">{purchase.userId?.kickUsername?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white italic">{purchase.userId?.kickUsername}</span>
                            <span className="text-[10px] text-white/40 font-medium">{purchase.userId?.email || "Brak email"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{purchase.itemName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Coins className="h-3.5 w-3.5 text-primary" />
                          <span className="text-sm font-black italic text-primary">{purchase.pointsSpent.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-white/60 font-medium">{new Date(purchase.createdAt).toLocaleDateString()}</span>
                          <span className="text-[10px] text-white/30">{new Date(purchase.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <StatusBadge status={purchase.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1 font-black italic uppercase text-[10px] px-3">
          <CheckCircle2 className="h-3 w-3" />
          Zrealizowane
        </Badge>
      )
    case "pending":
      return (
        <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 gap-1 font-black italic uppercase text-[10px] px-3">
          <Clock className="h-3 w-3" />
          Oczekiwanie
        </Badge>
      )
    case "cancelled":
      return (
        <Badge className="bg-red-500/20 text-red-500 border-red-500/30 gap-1 font-black italic uppercase text-[10px] px-3">
          <XCircle className="h-3 w-3" />
          Anulowane
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
