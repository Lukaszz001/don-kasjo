"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Handshake, 
  ExternalLink, 
  RefreshCw, 
  GripVertical,
  Link as LinkIcon,
  Image as ImageIcon,
  Tag,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Partner {
  _id: string
  name: string
  imageUrl: string
  bonus: string
  description: string
  code: string | null
  link: string
  isActive: boolean
  order: number
  color?: string
  htmlContent?: string
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    bonus: "",
    description: "",
    imageUrl: "",
    code: "",
    link: "",
    isActive: true,
    order: 0,
    color: "blue",
    htmlContent: ""
  })

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/partners")
      const data = await res.json()
      setPartners(data.partners || [])
    } catch (error) {
      toast.error("Błąd podczas pobierania partnerów")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (partner: Partner | null = null) => {
    if (partner) {
      setEditingPartner(partner)
      setFormData({
        name: partner.name,
        bonus: partner.bonus,
        description: partner.description,
        imageUrl: partner.imageUrl,
        code: partner.code || "",
        link: partner.link,
        isActive: partner.isActive,
        order: partner.order || 0,
        color: partner.color || "blue",
        htmlContent: partner.htmlContent || ""
      })
    } else {
      setEditingPartner(null)
      setFormData({
        name: "",
        bonus: "",
        description: "",
        imageUrl: "",
        code: "",
        link: "",
        isActive: true,
        order: partners.length,
        color: "blue",
        htmlContent: ""
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.bonus || !formData.link) {
      toast.error("Wypełnij wymagane pola")
      return
    }

    try {
      const method = editingPartner ? "PUT" : "POST"
      const body = editingPartner 
        ? { ...formData, _id: editingPartner._id } 
        : formData

      const res = await fetch("/api/admin/partners", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      toast.success(editingPartner ? "Partner zaktualizowany" : "Partner dodany")
      setIsDialogOpen(false)
      fetchPartners()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tego partnera?")) return

    try {
      const res = await fetch(`/api/admin/partners?id=${id}`, {
        method: "DELETE"
      })
      
      if (res.ok) {
        toast.success("Partner usunięty")
        fetchPartners()
      }
    } catch (error) {
      toast.error("Błąd podczas usuwania")
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Partnerzy</h1>
          <p className="text-muted-foreground mt-1">Zarządzaj ofertami partnerów i bonusami dla społeczności</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2 bg-primary hover:bg-primary/90 glow-green">
          <Plus className="h-4 w-4" />
          Dodaj partnera
        </Button>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Lista Partnerów
            <Button variant="ghost" size="icon" onClick={fetchPartners} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))
            ) : partners.length > 0 ? (
              partners.map((partner) => (
                <div 
                  key={partner._id}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-background/30 hover:bg-muted/30 transition-all card-lift"
                >
                  <div className="hidden sm:flex text-muted-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {partner.imageUrl ? (
                      <Image src={partner.imageUrl} alt={partner.name} width={48} height={48} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Handshake className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground">{partner.name}</h3>
                      <Badge variant={partner.isActive ? "default" : "outline"} className={partner.isActive ? "bg-primary/20 text-primary border-primary/30" : "text-muted-foreground"}>
                        {partner.isActive ? "Aktywny" : "Nieaktywny"}
                      </Badge>
                      {partner.code && (
                        <Badge variant="outline" className="gap-1 border-primary/20">
                          <Tag className="h-3 w-3" />
                          {partner.code}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-primary font-medium truncate">{partner.bonus}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" asChild>
                      <a href={partner.link} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(partner)}>
                      <Edit2 className="h-4 w-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(partner._id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
                <p>Nie odnaleziono żadnych partnerów</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Editor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {editingPartner ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingPartner ? "Edytuj partnera" : "Dodaj nowego partnera"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nazwa partnera*</label>
              <Input 
                placeholder="np. Stake, GGBet" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-background/50"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Bonus (krótki tekst)*</label>
              <Input 
                placeholder="np. 200% Bonus do depozytu" 
                value={formData.bonus}
                onChange={(e) => setFormData(prev => ({ ...prev, bonus: e.target.value }))}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Link partnerski*</label>
              <div className="flex gap-2">
                <LinkIcon className="h-4 w-4 mt-3 text-muted-foreground shrink-0" />
                <Input 
                  placeholder="https://..." 
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  className="bg-background/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Kod bonusowy</label>
                <Input 
                  placeholder="NP. KASJO" 
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  className="bg-background/50 uppercase"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kolejność</label>
                <Input 
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                  className="bg-background/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">URL logo (np. /Kasyno1.png)</label>
              <Input 
                placeholder="https://... lub /Kasyno1.png" 
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Motyw kolorystyczny</label>
              <Select value={formData.color} onValueChange={(v) => setFormData(prev => ({ ...prev, color: v }))}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Wybierz kolor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Niebieski (Kasyno 1)</SelectItem>
                  <SelectItem value="purple-blue">Fioletowo-Niebieski (Kasyno 2)</SelectItem>
                  <SelectItem value="amber">Złoty/Pomarańczowy (Kasyno 3)</SelectItem>
                  <SelectItem value="lime">Limonkowy/Zielony (Kasyno 4)</SelectItem>
                  <SelectItem value="red">Czerwony (Kasyno 5)</SelectItem>
                  <SelectItem value="purple">Fioletowy (Kasyno 6)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Opis HTML (opcjonalny)</label>
              <Textarea 
                placeholder="<p>Custom HTML...</p>" 
                value={formData.htmlContent}
                onChange={(e) => setFormData(prev => ({ ...prev, htmlContent: e.target.value }))}
                className="bg-background/50 min-h-[100px] font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Partner aktywny</p>
                <p className="text-xs text-muted-foreground">Czy oferta ma być widoczna?</p>
              </div>
              <Switch 
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Anuluj</Button>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 glow-green">
              {editingPartner ? "Zapisz zmiany" : "Stwórz profil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
