import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth/session"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getCurrentSession()

  if (!session || (!session.isAdmin && !session.isDeveloper)) {
    redirect("/")
  }

  return (
    <div className="w-full flex-1 p-4 md:p-8">
      {children}
    </div>
  )
}
