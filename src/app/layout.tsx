import type { Metadata, Viewport } from "next"
import { cookies } from "next/headers"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { LanguageProvider } from "@/lib/language-context"
import { getCurrentUser } from "@/lib/auth/session"
import "./globals.css"

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Don Kasjo - Platforma Streamingowa",
    template: "%s | Don Kasjo",
  },
  description:
    "Oficjalna platforma streamingowa z systemem punktow, predykcjami i nagrodami. Ogladaj transmisje, zbieraj punkty i wymieniaj je na nagrody!",
  icons: {
    icon: "/kasyno8.png",
    apple: "/kasyno8.png",
  },
  openGraph: {
    type: "website",
    siteName: "Don Kasjo",
    locale: "pl_PL",
  },
  twitter: {
    card: "summary_large_image",
    site: "@donkasjo",
  },
}

export const viewport: Viewport = {
  themeColor: "#0d261d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const locale = (cookieStore.get("NEXT_LOCALE")?.value as "pl" | "en") || "pl"
  
  // Fetch user on server to prevent UI jumping on refresh
  const userDoc = await getCurrentUser()
  const initialUser = userDoc ? {
    id: userDoc._id.toString(),
    kickUsername: userDoc.kickUsername,
    kickAvatar: userDoc.kickAvatar,
    points: userDoc.points,
    isAdmin: userDoc.isAdmin,
  } : null

  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="font-sans antialiased min-h-dvh" suppressHydrationWarning>
        <div className="ambient-glow-1" />
        <div className="ambient-glow-2" />

        <LanguageProvider initialLanguage={locale}>
          <div className="relative flex min-h-dvh">
            {/* Decorative background pattern */}
            <div className="pointer-events-none fixed inset-0 doodle-dots" />

            {/* Sidebar Navigation */}
            <SidebarNav initialUser={initialUser} />

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 w-full">
              <div className="relative min-h-dvh pt-16 lg:pt-0 pb-12 lg:pb-0">
                {children}
              </div>
            </main>
          </div>
          <Toaster position="top-center" richColors />
        </LanguageProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
