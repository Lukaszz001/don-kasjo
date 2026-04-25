"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import useSWR from "swr"
import { Plus, ShoppingBag, Package, Trash2, Edit2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AdminModal } from "@/components/admin/admin-modal"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ShopItem {
  _id: string
  name: string
  description: string
  price: number
  imageUrl: string
  stock: number | null
  isActive: boolean
}

export default function AdminShopPage() {
  const { data, mutate } = useSWR<{ items: ShopItem[] }>(
    "/api/admin/shop",
    fetcher
  )
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [stock, setStock] = useState("")
  const [isUnlimited, setIsUnlimited] = useState(true)

  const items = data?.items || []

  const handleCreate = async () => {
    if (!name || !description || !price) {
      toast.error("Wypelnij wymagane pola")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: parseInt(price),
          imageUrl: imageUrl || "",
          stock: isUnlimited ? null : parseInt(stock) || 0,
        }),
      })

      if (!response.ok) throw new Error("Failed to create item")

      toast.success("Przedmiot dodany do sklepu")
      setIsCreateOpen(false)
      resetForm()
      mutate()
    } catch {
      toast.error("Nie udalo sie dodac przedmiotu")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (item: ShopItem) => {
    try {
      const response = await fetch(`/api/admin/shop/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      })

      if (!response.ok) throw new Error("Failed to update item")

      toast.success(item.isActive ? "Przedmiot ukryty" : "Przedmiot aktywowany")
      mutate()
    } catch {
      toast.error("Nie udalo sie zaktualizowac przedmiotu")
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm("Czy na pewno chcesz usunac ten przedmiot?")) return

    try {
      const response = await fetch(`/api/admin/shop/${itemId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete item")

      toast.success("Przedmiot usuniety")
      mutate()
    } catch {
      toast.error("Nie udalo sie usunac przedmiotu")
    }
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setPrice("")
    setImageUrl("")
    setStock("")
    setIsUnlimited(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sklep</h1>
          <p className="text-muted-foreground">Zarzadzaj przedmiotami w sklepie</p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="relative h-12 px-8 bg-primary rounded-xl font-display font-black shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:shadow-[0_0_30px_rgba(var(--primary),0.4)] transition-all active:scale-95 group"
        >
          <div className="absolute inset-0 bg-white/10 group-hover:opacity-100 opacity-0 transition-opacity rounded-xl" />
          <Plus className="mr-2 h-5 w-5" />
          Dodaj przedmiot
        </Button>
      <AdminModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false)
          resetForm()
        }}
        title="Nowy przedmiot"
        description="Dodaj nowy przedmiot do swojej oferty w sklepie punktowym."
        icon={Plus}
        isLoading={isSubmitting}
        submitLabel="Dodaj przedmiot"
        onSubmit={handleCreate}
      >
        <div className="grid gap-8 py-4">
          {/* Main Info Section */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-primary/70 ml-1">Nazwa przedmiotu</Label>
              <Input
                id="name"
                placeholder="np. VIP na Discord"
                value={name}
                className="h-12 border-white/5 bg-white/5 transition-all focus:bg-white/10 focus:ring-primary/20 rounded-xl px-4 text-base font-medium"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="price" className="text-xs font-black uppercase tracking-widest text-primary/70 ml-1">Cena (punkty)</Label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  placeholder="np. 1000"
                  value={price}
                  className="h-12 pl-12 border-white/5 bg-white/5 transition-all focus:bg-white/10 focus:ring-primary/20 rounded-xl text-base font-bold"
                  onChange={(e) => setPrice(e.target.value)}
                />
                <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/50" />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-3">
            <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-primary/70 ml-1">Opis przedmiotu</Label>
            <Textarea
              id="description"
              placeholder="Podaj szczegoly dotyczace przedmiotu..."
              value={description}
              className="min-h-[120px] resize-none border-white/5 bg-white/5 transition-all focus:bg-white/10 focus:ring-primary/20 rounded-xl p-4 text-sm leading-relaxed"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Additional Info Section */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="imageUrl" className="text-xs font-black uppercase tracking-widest text-primary/70 ml-1">URL obrazka</Label>
              <Input
                id="imageUrl"
                placeholder="https://..."
                value={imageUrl}
                className="h-12 border-white/5 bg-white/5 transition-all focus:bg-white/10 focus:ring-primary/20 rounded-xl px-4"
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="stock" className="text-xs font-black uppercase tracking-widest text-primary/70 ml-1">Logika zapasu</Label>
              <div className="flex flex-col gap-4">
                <Input
                  id="stock"
                  type="number"
                  placeholder="Ilosc sztuk"
                  value={stock}
                  className="h-12 border-white/5 bg-white/5 transition-all focus:bg-white/10 focus:ring-primary/20 rounded-xl px-4 font-bold"
                  onChange={(e) => setStock(e.target.value)}
                  disabled={isUnlimited}
                />
                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-2.5">
                   <div className="space-y-0.5">
                     <span className="text-xs font-bold text-foreground">Nieograniczony</span>
                     <p className="text-[10px] text-muted-foreground leading-none">Przedmiot zawsze dostepny</p>
                   </div>
                   <Switch
                    checked={isUnlimited}
                    onCheckedChange={setIsUnlimited}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminModal>
      </div>

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Przedmioty ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover h-full w-full"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{item.name}</h3>
                      {!item.isActive && (
                        <Badge variant="secondary">Ukryty</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.price.toLocaleString()} pkt |{" "}
                      {item.stock === null
                        ? "Nieograniczony"
                        : `${item.stock} dostepnych`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.isActive}
                    onCheckedChange={() => handleToggleActive(item)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item._id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Brak przedmiotow w sklepie
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
