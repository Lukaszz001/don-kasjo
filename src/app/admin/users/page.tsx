"use client"

import { useState } from "react"
import useSWR from "swr"
import { Search, Shield, ShieldOff, Coins, Clock, Users } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AdminModal } from "@/components/admin/admin-modal"
import { Label } from "@/components/ui/label"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface User {
  _id: string
  kickId: string
  kickUsername: string
  kickAvatar: string
  points: number
  watchTimeMinutes: number
  isAdmin: boolean
  createdAt: string
}

export default function AdminUsersPage() {
  const { data, mutate } = useSWR<{ users: User[] }>("/api/admin/users", fetcher)
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [pointsToAdd, setPointsToAdd] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const users = data?.users || []
  const filteredUsers = users.filter((user) =>
    user.kickUsername.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggleAdmin = async (user: User) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin: !user.isAdmin }),
      })

      if (!response.ok) throw new Error("Failed to update user")

      toast.success(
        user.isAdmin ? "Usunieto uprawnienia admina" : "Nadano uprawnienia admina"
      )
      mutate()
    } catch {
      toast.error("Nie udalo sie zaktualizowac uzytkownika")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddPoints = async () => {
    if (!selectedUser || !pointsToAdd) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pointsToAdd: parseInt(pointsToAdd) }),
      })

      if (!response.ok) throw new Error("Failed to add points")

      toast.success(`Dodano ${pointsToAdd} punktow dla ${selectedUser.kickUsername}`)
      setSelectedUser(null)
      setPointsToAdd("")
      mutate()
    } catch {
      toast.error("Nie udalo sie dodac punktow")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Uzytkownicy</h1>
        <p className="text-muted-foreground">Zarzadzaj uzytkownikami platformy</p>
      </div>

      {/* Search */}
      <div className="relative group/search max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-0 group-hover/search:opacity-100 transition-opacity" />
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/50" />
          <Input
            placeholder="Szukaj uzytkownika..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 pl-12 border-white/5 bg-white/5 transition-all focus:bg-white/10 focus:ring-primary/20 rounded-2xl text-base"
          />
        </div>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Lista uzytkownikow ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.kickAvatar} alt={user.kickUsername} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.kickUsername.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {user.kickUsername}
                      </p>
                      {user.isAdmin && (
                        <Badge className="bg-primary text-primary-foreground">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Kick ID: {user.kickId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden text-right sm:block">
                    <div className="flex items-center gap-1 text-foreground">
                      <Coins className="h-4 w-4 text-primary" />
                      {user.points.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {Math.floor(user.watchTimeMinutes / 60)}h{" "}
                      {user.watchTimeMinutes % 60}m
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Coins className="mr-1 h-4 w-4" />
                      Punkty
                    </Button>
                    <Button
                      variant={user.isAdmin ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => handleToggleAdmin(user)}
                      disabled={isUpdating}
                    >
                      {user.isAdmin ? (
                        <>
                          <ShieldOff className="mr-1 h-4 w-4" />
                          Usun admin
                        </>
                      ) : (
                        <>
                          <Shield className="mr-1 h-4 w-4" />
                          Nadaj admin
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Nie znaleziono uzytkownikow
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AdminModal
        isOpen={!!selectedUser}
        onClose={() => {
          setSelectedUser(null)
          setPointsToAdd("")
        }}
        title="Dodaj punkty"
        description={`Zwieksz saldo punktowe uzytkownika ${selectedUser?.kickUsername}.`}
        icon={Coins}
        isLoading={isUpdating}
        submitLabel="Zasili konto"
        onSubmit={handleAddPoints}
      >
        <div className="space-y-8 py-4">
          <div className="relative overflow-hidden flex items-center gap-6 rounded-[2rem] border border-white/5 bg-white/5 p-8 transition-all hover:bg-white/10 group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all" />
            
            <Avatar className="h-20 w-20 border-4 border-white/5 shadow-2xl relative z-10 transition-transform group-hover:scale-105">
              <AvatarImage src={selectedUser?.kickAvatar} alt={selectedUser?.kickUsername} />
              <AvatarFallback className="bg-primary text-primary-foreground font-black text-2xl">
                {selectedUser?.kickUsername.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="relative z-10 flex-1">
              <p className="font-display text-3xl font-black text-foreground mb-1 leading-none tracking-tight">{selectedUser?.kickUsername}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 border border-primary/20">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="text-sm font-black text-primary">{selectedUser?.points.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 border border-white/5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-bold text-muted-foreground">
                    {Math.floor((selectedUser?.watchTimeMinutes || 0) / 60)}h {(selectedUser?.watchTimeMinutes || 0) % 60}m
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="points" className="text-xs font-black uppercase tracking-widest text-primary/70 ml-2">Kwota zasilenia portfela</Label>
            <div className="relative group/points">
              <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur-lg opacity-0 group-hover/points:opacity-100 transition-opacity" />
              <div className="relative">
                <Coins className="absolute left-5 top-1/2 h-7 w-7 -translate-y-1/2 text-primary opacity-50" />
                <Input
                  id="points"
                  type="number"
                  placeholder="0"
                  value={pointsToAdd}
                  className="h-16 pl-16 border-white/10 bg-white/5 transition-all focus:bg-white/10 focus:ring-primary/20 rounded-2xl text-3xl font-black font-display tracking-tight"
                  onChange={(e) => setPointsToAdd(e.target.value)}
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 font-display font-black text-primary/30 text-xl pointer-events-none">PKT</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2">
              <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Wartosc zostanie natychmiast zaktualizowana w bazie danych</p>
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
