"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center animate-in fade-in zoom-in duration-500">
      {/* Icon with Error styling */}
      <div className="relative mb-8">
        <div className="h-32 w-32 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-16 w-16 text-destructive animate-pulse" />
        </div>
        <div className="absolute -bottom-2 -right-2 rounded-full bg-background border-4 border-destructive/20 p-3">
          <RefreshCw className="h-6 w-6 text-destructive" />
        </div>
      </div>

      {/* Message */}
      <div className="max-w-md space-y-4">
        <h2 className="font-display text-3xl font-black text-foreground lg:text-4xl uppercase tracking-tight">
          Coś poszło nie tak...
        </h2>
        <p className="text-lg text-muted-foreground">
          Wystąpił nieoczekiwany błąd. Możliwe, że serwer otrzymał lewy sierpowy. Spróbuj odświeżyć stronę.
        </p>
        <div className="bg-muted p-3 rounded-lg border border-border mt-4 flex items-center justify-center">
          <code className="text-sm text-muted-foreground whitespace-pre-wrap break-all">
            {error.message || "Unknown Application Error"}
          </code>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
        <Button 
          onClick={() => reset()}
          size="lg" 
          className="bg-primary hover:bg-primary/90 h-12 px-8 font-bold gap-2 btn-interactive glow-green"
        >
          <RefreshCw className="h-5 w-5" />
          Spróbuj ponownie
        </Button>
        <Button asChild variant="outline" size="lg" className="h-12 px-8 border-border text-muted-foreground hover:bg-muted">
          <a href="/" className="gap-2">
            <Home className="h-5 w-5" />
            Wróć do bazy
          </a>
        </Button>
      </div>
    </div>
  )
}
