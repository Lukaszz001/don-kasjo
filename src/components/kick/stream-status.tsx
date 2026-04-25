"use client"

import { ExternalLink, Radio, Users, Clock } from "lucide-react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useStreamStatus } from "@/hooks/use-stream-status"

export function StreamStatus() {
  const { isLive, title, viewers, startedAt, thumbnail } = useStreamStatus()

  return (
    <Card className="w-full max-w-md overflow-hidden border-border bg-card">
      {/* Stream Preview */}
      <div className="relative aspect-video bg-muted">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt="Stream preview"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Radio className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                {isLive ? "Ladowanie..." : "Offline"}
              </p>
            </div>
          </div>
        )}

        {/* Live Badge */}
        <div className="absolute left-3 top-3">
          <Badge
            variant={isLive ? "default" : "secondary"}
            className={
              isLive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }
          >
            <span
              className={`mr-1.5 h-2 w-2 rounded-full ${
                isLive ? "animate-pulse bg-white" : "bg-muted-foreground"
              }`}
            />
            {isLive ? "NA ZYWO" : "OFFLINE"}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="line-clamp-2 font-semibold text-foreground">
          {title || "Don Kasjo"}
        </h3>

        {isLive && (
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            {viewers !== undefined && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {viewers.toLocaleString()} widzow
              </div>
            )}
            {startedAt && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {getStreamDuration(startedAt)}
              </div>
            )}
          </div>
        )}

        <Button
          asChild
          className="mt-4 w-full bg-primary hover:bg-primary/90"
          size="sm"
        >
          <a
            href={`https://kick.com/${process.env.NEXT_PUBLIC_KICK_CHANNEL_ID || "donkasjo"}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {isLive ? "Ogladaj teraz" : "Odwiedz kanal"}
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}

function getStreamDuration(startedAt: string): string {
  const start = new Date(startedAt)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}
