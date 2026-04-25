"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Eye, 
  EyeOff, 
  Search, 
  FileText, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  ExternalLink
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
import { toast } from "sonner"

interface Instruction {
  _id: string
  title: string
  slug: string
  shortDescription: string
  imageUrl: string
  htmlContent: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminInstructionsPage() {
  const [instructions, setInstructions] = useState<Instruction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingInstruction, setEditingInstruction] = useState<Instruction | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    imageUrl: "",
    htmlContent: "",
    isPublished: false
  })

  useEffect(() => {
    fetchInstructions()
  }, [])

  const fetchInstructions = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/instructions")
      const data = await res.json()
      setInstructions(data.instructions || [])
    } catch (error) {
      toast.error("Błąd podczas pobierania instrukcji")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (instruction: Instruction | null = null) => {
    if (instruction) {
      setEditingInstruction(instruction)
      setFormData({
        title: instruction.title,
        slug: instruction.slug,
        shortDescription: instruction.shortDescription,
        imageUrl: instruction.imageUrl,
        htmlContent: instruction.htmlContent,
        isPublished: instruction.isPublished
      })
    } else {
      setEditingInstruction(null)
      setFormData({
        title: "",
        slug: "",
        shortDescription: "",
        imageUrl: "",
        htmlContent: "",
        isPublished: false
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.slug || !formData.shortDescription) {
      toast.error("Wypełnij wymagane pola")
      return
    }

    try {
      const method = editingInstruction ? "PUT" : "POST"
      const body = editingInstruction 
        ? { ...formData, _id: editingInstruction._id } 
        : formData

      const res = await fetch("/api/admin/instructions", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      toast.success(editingInstruction ? "Instrukcja zaktualizowana" : "Instrukcja utworzona")
      setIsDialogOpen(false)
      fetchInstructions()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę instrukcję?")) return

    try {
      const res = await fetch(`/api/admin/instructions?id=${id}`, {
        method: "DELETE"
      })
      
      if (res.ok) {
        toast.success("Instrukcja usunięta")
        fetchInstructions()
      }
    } catch (error) {
      toast.error("Błąd podczas usuwania")
    }
  }

  const [previewContent, setPreviewContent] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewContent(formData.htmlContent)
    }, 300)
    return () => clearTimeout(timer)
  }, [formData.htmlContent])

  const filteredInstructions = useMemo(() => {
    return instructions.filter(i => 
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.slug.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [instructions, searchQuery])

  const generateSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
    setFormData(prev => ({ ...prev, slug }))
  }

  const insertTag = (tag: string) => {
    const textarea = document.getElementById("html-content-editor") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formData.htmlContent
    const before = text.substring(0, start)
    const after = text.substring(end)
    const selected = text.substring(start, end)
    
    let newText = ""
    if (tag === "ul") {
      newText = `<ul>\n  <li>${selected || "Element listy"}</li>\n</ul>`
    } else if (tag === "a") {
      newText = `<a href="https://" target="_blank" class="text-primary hover:underline">${selected || "Link"}</a>`
    } else {
      const isSelfClosing = ["img", "hr", "br"].some(t => tag.startsWith(t))
      if (isSelfClosing) {
        newText = `<${tag} />`
      } else {
        newText = `<${tag}>${selected || ""}</${tag.split(" ")[0]}>`
      }
    }

    const updatedContent = before + newText + after
    setFormData(prev => ({ ...prev, htmlContent: updatedContent }))
    
    // Reset focus after state update
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + tag.length + 2, start + tag.length + 2 + (selected ? selected.length : 0))
    }, 0)
  }

  const insertList = () => insertTag("ul")
  const insertLink = () => insertTag("a")

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">Kreator Instrukcji</h1>
          <p className="text-muted-foreground mt-1 font-mono text-[10px] uppercase tracking-widest">Wdrażaj wiedzę DONKASJO z prędkością światła</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2 bg-primary hover:bg-primary/90 h-14 px-8 rounded-2xl font-black italic uppercase tracking-tighter text-xl glow-green">
          <Plus className="h-5 w-5" />
          Dodaj Poradnik
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="bg-[#0c0c0c] border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 h-20 w-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all"></div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                <FileText className="h-7 w-7" />
              </div>
              <div>
                <p className="text-3xl font-black italic uppercase tracking-tighter">{instructions.length}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Baza wiedzy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0c0c0c] border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 h-20 w-20 bg-green-500/5 rounded-full blur-2xl"></div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                <Eye className="h-7 w-7" />
              </div>
              <div>
                <p className="text-3xl font-black italic uppercase tracking-tighter">{instructions.filter(i => i.isPublished).length}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Aktywne live</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0c0c0c] border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 h-20 w-20 bg-yellow-500/5 rounded-full blur-2xl"></div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                <EyeOff className="h-7 w-7" />
              </div>
              <div>
                <p className="text-3xl font-black italic uppercase tracking-tighter">{instructions.filter(i => !i.isPublished).length}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Szkice w toku</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/5 bg-[#080808]/50 backdrop-blur-3xl shadow-3xl overflow-hidden rounded-[2rem]">
        <CardHeader className="bg-white/[0.02] border-b border-white/5 p-8">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                placeholder="Szukaj w instrukcjach..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/5 border-white/10 h-12 rounded-xl text-foreground font-medium placeholder:italic transition-all focus:bg-white/10 focus:border-primary/30"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={fetchInstructions} disabled={loading} className="h-12 w-12 rounded-xl hover:bg-white/5">
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid gap-6">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-3xl" />
              ))
            ) : filteredInstructions.length > 0 ? (
              filteredInstructions.map((instruction) => (
                <div 
                  key={instruction._id}
                  className="group flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all hover:scale-[1.005] hover:shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-1/2 left-0 w-1 h-0 group-hover:h-12 bg-primary -translate-y-1/2 rounded-r-full transition-all duration-500"></div>
                  
                  <div className="h-20 w-32 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border border-white/5 shadow-inner">
                    {instruction.imageUrl ? (
                      <Image src={instruction.imageUrl} alt={instruction.title} width={128} height={80} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-black italic uppercase tracking-tighter text-white truncate">{instruction.title}</h3>
                      <Badge variant={instruction.isPublished ? "default" : "outline"} className={instruction.isPublished ? "bg-primary/20 text-primary border-primary/30 font-black italic uppercase text-[9px] tracking-widest px-3 py-1" : "text-muted-foreground/50 border-white/10 italic text-[9px] px-3 py-1"}>
                        {instruction.isPublished ? "Opublikowany" : "Szkic"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground/60 mb-2">
                       <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-primary/40"></div> /{instruction.slug}</span>
                       <span className="hidden md:inline-block">/</span>
                       <span className="hidden md:inline-block italic">Zaktualizowano: {new Date(instruction.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 max-w-2xl">{instruction.shortDescription}</p>
                  </div>

                  <div className="flex items-center gap-3 ml-auto">
                    <Button variant="ghost" size="icon" asChild className="h-12 w-12 rounded-xl hover:bg-primary/10 hover:text-primary transition-all group-hover:scale-110">
                      <a href={`/instructions/${instruction.slug}`} target="_blank">
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(instruction)} className="h-12 w-12 rounded-xl hover:bg-primary/10 hover:text-primary transition-all group-hover:scale-110">
                      <Edit2 className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(instruction._id)} className="h-12 w-12 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <div className="h-24 w-24 rounded-full bg-white/[0.02] flex items-center justify-center mb-6">
                   <AlertCircle className="h-12 w-12 opacity-10" />
                </div>
                <p className="text-xl font-bold uppercase tracking-tighter opacity-30 italic">Brak odnalezionych poradników</p>
                <Button onClick={() => handleOpenDialog()} variant="link" className="mt-4 text-primary">Utwórz pierwszy poradnik</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Editor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="!max-w-[98vw] !w-[98vw] !h-[98vh] !max-h-[98vh] overflow-hidden flex flex-col p-0 bg-[#080808]/95 backdrop-blur-2xl border-primary/20 shadow-[0_0_100px_rgba(0,255,0,0.1)] rounded-3xl">
          <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5 bg-gradient-to-r from-primary/5 to-transparent">
            <div>
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(0,255,0,0.2)]">
                  {editingInstruction ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </div>
                {editingInstruction ? "Edycja Poradnika" : "Nowy Poradnik DONKASJO"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1 font-medium font-mono text-[10px] uppercase tracking-widest">
                Stwórz coś, co zachwyci widzów. Używaj klas Tailwind CSS dla efektu premium.
              </DialogDescription>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end mr-4">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Status publikacji</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold uppercase ${formData.isPublished ? "text-primary" : "text-yellow-500"}`}>
                    {formData.isPublished ? "Publiczny" : "Szkic"}
                  </span>
                  <Switch 
                     checked={formData.isPublished}
                     onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                     className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-8 scrollbar-hide">
            <div className="grid gap-6 lg:grid-cols-4 h-full">
              <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-4 scrollbar-hide">
                <div className="space-y-4">
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">Tytuł instrukcji</label>
                    <Input 
                      placeholder="np. Jak wpłacić przez BLIK?" 
                      value={formData.title}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, title: e.target.value }))
                        if (!editingInstruction) generateSlug(e.target.value)
                      }}
                      className="bg-white/5 border-white/10 h-14 rounded-xl focus-visible:ring-primary/30 focus-visible:border-primary/50 font-bold text-white transition-all text-lg"
                    />
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL Slug (automatyczny)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono opacity-50">/</span>
                      <Input 
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        className="bg-white/5 border-white/10 h-12 pl-6 rounded-xl text-sm font-mono text-muted-foreground focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL Obrazka (Cover)</label>
                    <Input 
                      placeholder="https://..." 
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className="bg-white/5 border-white/10 h-12 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Zajawka (Short Description)</label>
                  <Textarea 
                    placeholder="Krótki, chwytliwy opis..." 
                    value={formData.shortDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                    className="bg-white/5 border-white/10 min-h-[160px] rounded-xl text-sm leading-relaxed focus-visible:ring-primary/30"
                  />
                </div>

                <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 space-y-4">
                   <h4 className="text-xs font-black uppercase text-primary flex items-center gap-2">
                     <AlertCircle className="h-4 w-4" /> Wskazówka DONKASJO
                   </h4>
                   <div className="text-[11px] text-muted-foreground leading-relaxed italic space-y-2">
                     <p>Używaj sekcji &lt;div class="space-y-8"&gt; dla głównego kontenera.</p>
                     <p>Klasy takie jak <span className="text-white font-bold">rounded-3xl</span> oraz <span className="text-white font-bold">bg-white/5</span> nadają nowoczesny wygląd.</p>
                   </div>
                </div>
              </div>

              <div className="lg:col-span-3 space-y-4 flex flex-col h-full min-h-0">
                <div className="flex items-center justify-between bg-[#111] p-2 rounded-2xl border border-white/5 shadow-inner">
                  <div className="flex flex-wrap gap-2">
                    <EditorButton label="H2" title="Nagłówek 2" tag="h2" onClick={insertTag} />
                    <EditorButton label="H3" title="Nagłówek 3" tag="h3" onClick={insertTag} />
                    <EditorButton label="B" title="Bold" tag="b" onClick={insertTag} />
                    <div className="w-px h-8 bg-white/20 mx-2" />
                    <EditorButton label="SECTION" title="Sekcja" tag='div class="p-10 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md"' onClick={insertTag} />
                    <EditorButton label="GRID" title="Siatka 2 kolumny" tag='div class="grid gap-8 md:grid-cols-2"' onClick={insertTag} />
                    <EditorButton label="BADGE" title="Odznaka" tag='span class="px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest"' onClick={insertTag} />
                    <EditorButton label="LINK" title="Link" tag="a" onClick={insertLink} />
                    <EditorButton label="IMAGE" title="Grafika" tag="img" onClick={(tag) => {
                       const url = prompt("Podaj URL obrazka:");
                       if (url) {
                         const textarea = document.getElementById("html-content-editor") as HTMLTextAreaElement;
                         const start = textarea.selectionStart;
                         const end = textarea.selectionEnd;
                         const text = formData.htmlContent;
                         const before = text.substring(0, start);
                         const after = text.substring(end);
                         const newText = `<img src="${url}" class="w-full rounded-2xl border border-white/10" alt="Grafika" />`;
                         setFormData(prev => ({ ...prev, htmlContent: before + newText + after }));
                       }
                    }} />
                  </div>
                  <div className="flex items-center gap-3 pr-4">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    <div className="text-[10px] font-black uppercase text-primary tracking-widest">Real-time Rendering</div>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                  <div className="relative h-full overflow-hidden">
                    <textarea 
                      id="html-content-editor"
                      placeholder="Rozpocznij tworzenie poradnika używając HTML..." 
                      value={formData.htmlContent}
                      onChange={(e) => setFormData(prev => ({ ...prev, htmlContent: e.target.value }))}
                      className="w-full h-full p-8 bg-[#0a0a0a] border border-white/5 rounded-3xl font-mono text-[13px] leading-relaxed resize-none focus:outline-none focus:border-primary/20 transition-all shadow-2xl overflow-y-auto scrollbar-hide"
                    />
                  </div>

                  <div className="h-full overflow-y-auto bg-black/40 border border-white/5 rounded-3xl p-10 scrollbar-hide relative bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
                    <div className="absolute top-6 right-8 text-[10px] font-black uppercase text-muted-foreground/20 tracking-widest pointer-events-none">Visual Preview</div>
                    <div className="prose prose-slate prose-invert max-w-none text-foreground/90 transition-all">
                      {previewContent ? (
                        <div dangerouslySetInnerHTML={{ __html: previewContent }} />
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground/10 py-40 italic">
                          <EyeOff className="h-24 w-24 mb-6 opacity-5" />
                          <p className="text-xl font-black uppercase tracking-tighter opacity-20 italic">Twoja treść pojawi się tutaj</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-white/5 bg-[#080808] flex items-center justify-between shadow-2xl">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-muted-foreground hover:text-white hover:bg-white/5 rounded-2xl px-10 h-14 font-bold text-lg">
              Wyjdź bez zapisywania
            </Button>
            <div className="flex gap-4">
              <Button 
                onClick={handleSubmit} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-16 px-16 rounded-2xl font-black italic uppercase tracking-tighter text-xl transition-all hover:scale-[1.02] active:scale-[0.98] glow-green"
              >
                {editingInstruction ? "Zapisz zmiany" : "Opublikuj poradnik"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


function EditorButton({ label, title, tag, onClick }: { label: string, title: string, tag: any, onClick: (tag: string) => void }) {
  return (
    <button
      type="button"
      title={title}
      onClick={() => onClick(tag)}
      className="h-8 min-w-[40px] flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary/50 hover:shadow-[0_0_15px_rgba(0,255,0,0.2)]"
    >
      {label}
    </button>
  )
}

