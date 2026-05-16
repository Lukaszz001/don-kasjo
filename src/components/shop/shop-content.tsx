"use client"

import { useState } from "react"
import Image from "next/image"
import useSWR from "swr"
import { 
  ShoppingBag, 
  Coins, 
  Package, 
  Check, 
  Sparkles, 
  Star, 
  Zap,
  Gift,
  TrendingUp,
  Clock,
  Filter,
  Grid3X3,
  List,
  Search,
  Tag,
  Crown,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/lib/language-context"
import { cn } from "@/lib/utils"
import { PusherRefresh } from "@/components/common/pusher-refresh"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ShopItem {
  _id: string
  name: string
  description: string
  price: number
  imageUrl: string
  stock: number | null
  category?: string
  featured?: boolean
}

export function ShopContent({ initialItems }: { initialItems: ShopItem[] }) {
  const { t } = useLanguage()
  const { data: userData, mutate: mutateUser } = useSWR("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  const [items, setItems] = useState<ShopItem[]>(initialItems)
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "stock">("featured")

  const user = userData?.user


  // Filter and sort items
  const filteredItems = items
    .filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "stock":
          return (b.stock ?? 999) - (a.stock ?? 999)
        case "featured":
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
      }
    })

  const handlePurchase = async () => {
    if (!selectedItem) return

    setIsPurchasing(true)

    try {
      const response = await fetch(`/api/shop/${selectedItem._id}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const apiError: string | undefined = data?.error
        const errorKey = apiError ? `shop.error.${apiError}` : "shop.error.generic"
        const translated = t(errorKey)
        // Fall back to a generic message if the specific key is missing
        const description =
          translated === errorKey ? t("shop.error.generic") : translated

        toast.error(t("shop.error.title"), { description })
        return
      }

      toast.success(t("shop.purchaseSuccess.title"), {
        description: t("shop.purchaseSuccess.desc")
          .replace("{name}", selectedItem.name)
          .replace("{points}", selectedItem.price.toLocaleString()),
      })

      // Optimistically update local stock so UI reflects the purchase immediately.
      setItems((prev) =>
        prev.map((it) =>
          it._id === selectedItem._id && it.stock !== null && it.stock !== undefined
            ? { ...it, stock: Math.max(0, it.stock - 1) }
            : it
        )
      )

      // Refresh user data so the new points balance from the API is shown.
      if (typeof data?.newBalance === "number") {
        await mutateUser(
          (current: { user?: { points: number } } | undefined) =>
            current?.user
              ? { ...current, user: { ...current.user, points: data.newBalance } }
              : current,
          { revalidate: true }
        )
      } else {
        await mutateUser()
      }

      setSelectedItem(null)
    } catch (error) {
      console.error("Purchase failed:", error)
      toast.error(t("shop.error.title"), {
        description: t("shop.error.generic"),
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  // Calculate progress to next tier
  const nextTierPoints = 50000
  const progressPercent = user ? Math.min((user.points / nextTierPoints) * 100, 100) : 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 relative">
      <PusherRefresh channelName="platform-updates" eventName="shop-updated" />
      
      {/* Ambient background glows for the whole page */}
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] bg-accent/5 blur-[120px]" />

      {/* Header Section */}
      <div className="mb-12 text-center lg:text-left">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 space-y-4">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-primary badge-shine">
              <ShoppingBag className="h-4 w-4" />
              {t("shop.badge")}
            </div>
            <h1 className="font-display text-4xl font-black text-white lg:text-7xl uppercase italic tracking-tighter leading-none mb-4">
              {t("shop.loyalty")} <span className="text-primary">{t("shop.loyaltySubtitle")}</span>
            </h1>
            <p className="mx-auto lg:mx-0 max-w-2xl text-muted-foreground border-l-4 border-primary/50 pl-6 leading-relaxed">
              {t("shop.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-2">
        <div className="flex-1 max-w-md">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder={t("search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-xl font-bold italic text-xs uppercase tracking-tight"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          
          <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-lg transition-all",
                viewMode === "grid" ? "bg-primary text-black shadow-lg" : "text-white/40 hover:text-white"
              )}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-lg transition-all",
                viewMode === "list" ? "bg-primary text-black shadow-lg" : "text-white/40 hover:text-white"
              )}
              onClick={() => setViewMode("list")}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Items Grid/List */}
      {filteredItems.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="rounded-full bg-muted/50 p-6 mb-6">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground">
              {t("shop.empty.title")}
            </h3>
            <p className="mt-2 text-center text-muted-foreground max-w-md">
              {searchQuery ? t("shop.empty.search") : t("shop.empty.default")}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => setSearchQuery("")}
              >
                {t("shop.clearSearch")}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === "grid"
            ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "flex flex-col gap-4"
        }>
          {filteredItems.map((item, index) => (
            <ShopItemCard
              key={item._id}
              item={item}
              userPoints={user?.points || 0}
              isLoggedIn={!!user}
              onPurchase={() => setSelectedItem(item)}
              viewMode={viewMode}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Purchase Confirmation Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{t("shop.dialog.title")}</DialogTitle>
            <DialogDescription>
              {t("shop.dialog.desc")}
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6 py-4">
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-muted">
                  {selectedItem.imageUrl ? (
                    <Image
                      src={selectedItem.imageUrl}
                      alt={selectedItem.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  {selectedItem.featured && (
                    <div className="absolute top-1 right-1">
                      <Star className="h-4 w-4 text-accent fill-accent" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-display font-bold text-lg">{selectedItem.name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {selectedItem.description}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("shop.dialog.cost")}</span>
                  <span className="flex items-center gap-2 font-display text-lg font-bold text-primary">
                    <Coins className="h-5 w-5" />
                    {selectedItem.price.toLocaleString()} {t("points")}
                  </span>
                </div>
                {user && (
                  <>
                    <div className="h-px bg-border" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("shop.yourPoints")}</span>
                      <span className="font-semibold">{user.points.toLocaleString()} {t("points")}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("shop.dialog.after")}</span>
                      <span className={`font-semibold ${user.points - selectedItem.price < 0 ? "text-destructive" : "text-green-500"}`}>
                        {(user.points - selectedItem.price).toLocaleString()} {t("points")}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedItem(null)}>
              {t("shop.dialog.cancel")}
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={
                isPurchasing ||
                !user ||
                (user && user.points < (selectedItem?.price || 0))
              }
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              {isPurchasing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  {t("shop.dialog.purchasing")}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  {t("shop.dialog.buyNow")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ShopItemCard({
  item,
  userPoints,
  isLoggedIn,
  onPurchase,
  viewMode,
  index,
}: {
  item: ShopItem
  userPoints: number
  isLoggedIn: boolean
  onPurchase: () => void
  viewMode: "grid" | "list"
  index: number
}) {
  const { t } = useLanguage()
  const canAfford = userPoints >= item.price
  const isOutOfStock = item.stock !== null && item.stock <= 0
  const isLowStock = item.stock !== null && item.stock > 0 && item.stock <= 5

  if (viewMode === "list") {
    return (
      <Card className={`overflow-hidden transition-all hover:border-primary/30 animate-slide-up group border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl`} style={{ animationDelay: `${index * 0.05}s` }}>
        <div className="flex items-center gap-6 p-4 sm:p-6">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-white/5 border border-white/10">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-10 w-10 text-white/5" />
              </div>
            )}
            {item.featured && (
              <Badge className="absolute top-2 left-2 bg-primary text-black text-[8px] font-black italic tracking-tighter uppercase p-1">
                TOP
              </Badge>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl font-black text-white italic uppercase tracking-tighter group-hover:text-primary transition-colors truncate">{item.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1 leading-relaxed italic">{item.description}</p>
            <div className="flex items-center gap-4 mt-4">
              {item.stock !== null && (
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isLowStock ? "bg-orange-500 animate-pulse" : "bg-green-500"}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isLowStock ? "text-orange-400" : "text-muted-foreground/60"}`}>
                    {item.stock} {t("shop.item.pcs")}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
             <div className="text-right">
              <div className="flex items-center gap-2 text-primary">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <Coins className="h-4 w-4" />
                </div>
                <span className="font-display text-3xl font-black italic tracking-tighter">{item.price.toLocaleString()}</span>
              </div>
            </div>
            
            {!isLoggedIn ? (
              <Button asChild variant="outline" size="sm" className="font-black italic uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl border-white/10 hover:bg-white/5">
                <a href="/api/auth/kick">{t("shop.item.login")}</a>
              </Button>
            ) : isOutOfStock ? (
              <Button variant="secondary" size="sm" disabled className="font-black italic uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl opacity-50">{t("shop.item.soldOut")}</Button>
            ) : !canAfford ? (
              <Button variant="secondary" size="sm" disabled className="font-black italic uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl opacity-50">{t("shop.item.noPoints")}</Button>
            ) : (
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-black font-black italic uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl glow-green" onClick={onPurchase}>
                {t("shop.item.buy")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`group relative flex flex-col overflow-hidden transition-all hover:border-primary/50 border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl animate-scale-in shadow-2xl`} style={{ animationDelay: `${index * 0.05}s` }}>
      {/* Dynamic Glow background */}
      <div className="absolute -top-12 -right-12 h-24 w-24 bg-primary/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -bottom-12 -left-12 h-24 w-24 bg-accent/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-12 w-12 text-white/5 transition-colors group-hover:text-primary/20" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {item.featured && (
            <Badge className="bg-primary text-black font-black italic tracking-tighter py-1 px-4 shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] animate-pulse-glow uppercase text-[10px]">
              <Star className="h-3 w-3 mr-2" />
              HOT ITEM
            </Badge>
          )}
          {isLowStock && (
            <Badge className="bg-destructive text-white font-black italic tracking-tighter py-1 px-4 animate-pulse uppercase text-[10px]">
              <Clock className="h-3 w-3 mr-2" />
              OSTATNIE SZTUKI
            </Badge>
          )}
        </div>
        
        {/* Stock overlay bottom right */}
        {item.stock !== null && (
          <div className="absolute right-3 bottom-3 rounded-lg bg-black/60 backdrop-blur-md px-2 py-1 border border-white/10">
            <span className="text-[9px] font-black italic uppercase tracking-widest text-white/60">
              {item.stock} SZT.
            </span>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
      </div>

      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="font-display text-xl font-black italic uppercase tracking-tighter text-white group-hover:text-primary transition-colors line-clamp-1">
          {item.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 pb-6 relative z-10">
        <p className="line-clamp-2 text-sm italic font-medium text-white/50 leading-relaxed italic">
          "{item.description}"
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 border-t border-white/5 bg-white/[0.02] p-6 relative z-10 transition-colors group-hover:bg-primary/[0.04]">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2 group-hover:scale-110 transition-transform duration-500">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Coins className="h-5 w-5 text-primary drop-shadow-[0_0_8px_var(--primary)]" />
            </div>
            <span className="font-display text-3xl font-black text-white italic tracking-tighter line-height-none">
              {item.price.toLocaleString()}
            </span>
          </div>
          
          <p className="text-[10px] text-white/20 uppercase font-black italic tracking-widest">PUNKTY</p>
        </div>

        {!isLoggedIn ? (
          <Button asChild variant="outline" className="w-full h-11 rounded-xl font-black italic uppercase tracking-widest text-[10px] border-white/10 hover:bg-white/5">
            <a href="/api/auth/kick">{t("shop.item.login")}</a>
          </Button>
        ) : isOutOfStock ? (
          <Button variant="secondary" className="w-full h-11 rounded-xl font-black italic uppercase tracking-widest text-[10px] opacity-50" disabled>
            {t("shop.item.soldOut")}
          </Button>
        ) : !canAfford ? (
          <Button variant="secondary" className="w-full h-11 rounded-xl font-black italic uppercase tracking-widest text-[10px] opacity-50" disabled>
            {t("shop.item.noPoints")}
          </Button>
        ) : (
          <Button
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-black font-black italic uppercase tracking-widest text-[10px] glow-green group/btn"
            onClick={onPurchase}
          >
            {t("shop.item.buy")}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
