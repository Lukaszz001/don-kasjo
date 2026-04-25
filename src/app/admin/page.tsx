import {
  Users,
  Coins,
  TrendingUp,
  ShoppingBag,
  Clock,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { connectToDatabase } from "@/lib/db/mongodb"
import { User, Prediction, ShopItem, Purchase } from "@/lib/db/models"

async function getStats() {
  await connectToDatabase()

  const [
    totalUsers,
    totalPoints,
    activePredictions,
    totalPurchases,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments(),
    User.aggregate([{ $group: { _id: null, total: { $sum: "$points" } } }]),
    Prediction.countDocuments({ status: "open" }),
    Purchase.countDocuments(),
    User.find().sort({ createdAt: -1 }).limit(5).lean(),
  ])

  return {
    totalUsers,
    totalPoints: totalPoints[0]?.total || 0,
    activePredictions,
    totalPurchases,
    recentUsers,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Przegląd statystyk platformy
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Uzytkownicy"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          description="Zarejestrowani uzytkownicy"
        />
        <StatsCard
          title="Punkty w obiegu"
          value={stats.totalPoints.toLocaleString()}
          icon={Coins}
          description="Lacznie wszystkich uzytkownikow"
        />
        <StatsCard
          title="Aktywne predykcje"
          value={stats.activePredictions.toString()}
          icon={TrendingUp}
          description="Otwarte do obstawiania"
        />
        <StatsCard
          title="Zakupy"
          value={stats.totalPurchases.toLocaleString()}
          icon={ShoppingBag}
          description="Realizacje w sklepie"
        />
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Ostatni uzytkownicy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentUsers.map((user) => (
              <div
                key={user._id.toString()}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                    {user.kickUsername.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {user.kickUsername}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("pl-PL")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    {user.points.toLocaleString()} pkt
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {Math.floor(user.watchTimeMinutes / 60)}h{" "}
                    {user.watchTimeMinutes % 60}m
                  </p>
                </div>
              </div>
            ))}
            {stats.recentUsers.length === 0 && (
              <p className="text-center text-muted-foreground">
                Brak uzytkownikow
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatsCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
