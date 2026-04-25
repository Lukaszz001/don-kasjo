"use client"

import { useState, useEffect } from "react"
import { X, Bell, Trophy, Gift, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface CornerNotificationProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  title: string
  message: string
  icon?: "bell" | "trophy" | "gift" | "zap"
  dismissible?: boolean
  autoHide?: boolean
  autoHideDelay?: number
  className?: string
}

const icons = {
  bell: Bell,
  trophy: Trophy,
  gift: Gift,
  zap: Zap,
}

const positionClasses = {
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
}

export function CornerNotification({
  position = "bottom-right",
  title,
  message,
  icon = "bell",
  dismissible = true,
  autoHide = false,
  autoHideDelay = 5000,
  className,
}: CornerNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    setIsAnimating(true)
    
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, autoHideDelay)
      return () => clearTimeout(timer)
    }
  }, [autoHide, autoHideDelay])

  if (!isVisible) return null

  const Icon = icons[icon]

  return (
    <div
      className={cn(
        "fixed z-50 max-w-xs",
        positionClasses[position],
        isAnimating ? "animate-in slide-in-from-bottom-5 fade-in duration-300" : "",
        className
      )}
    >
      <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/20 via-primary/10 to-background shadow-xl shadow-primary/10 backdrop-blur-sm">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-primary/20 to-transparent" />
        <div className="absolute bottom-0 left-0 h-12 w-12 bg-gradient-to-tr from-primary/15 to-transparent" />
        
        {/* Content */}
        <div className="relative p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            
            {/* Text */}
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-bold text-foreground text-sm">
                {title}
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {message}
              </p>
            </div>

            {/* Dismiss button */}
            {dismissible && (
              <button
                onClick={() => setIsVisible(false)}
                className="shrink-0 rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom accent bar */}
        <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
      </div>
    </div>
  )
}

// Multi-notification container for corner alerts
interface NotificationItem {
  id: string
  title: string
  message: string
  icon?: "bell" | "trophy" | "gift" | "zap"
}

interface CornerNotificationsProps {
  notifications: NotificationItem[]
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  onDismiss?: (id: string) => void
}

export function CornerNotifications({
  notifications,
  position = "bottom-right",
  onDismiss,
}: CornerNotificationsProps) {
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set(notifications.map(n => n.id)))

  const handleDismiss = (id: string) => {
    setVisibleIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    onDismiss?.(id)
  }

  const isVerticalStart = position.includes("top")
  const isHorizontalStart = position.includes("left")

  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col gap-3 max-w-xs",
        isVerticalStart ? "top-4" : "bottom-4",
        isHorizontalStart ? "left-4" : "right-4"
      )}
    >
      {notifications
        .filter(n => visibleIds.has(n.id))
        .map((notification) => (
          <CornerNotificationItem
            key={notification.id}
            {...notification}
            onDismiss={() => handleDismiss(notification.id)}
          />
        ))}
    </div>
  )
}

function CornerNotificationItem({
  title,
  message,
  icon = "bell",
  onDismiss,
}: NotificationItem & { onDismiss: () => void }) {
  const Icon = icons[icon]

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/20 via-primary/10 to-background shadow-xl shadow-primary/10 backdrop-blur-sm animate-in slide-in-from-bottom-5 fade-in duration-300">
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-0 h-12 w-12 bg-gradient-to-tr from-primary/15 to-transparent" />
      
      {/* Content */}
      <div className="relative p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          
          {/* Text */}
          <div className="flex-1 min-w-0">
            <h4 className="font-display font-bold text-foreground text-sm">
              {title}
            </h4>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {message}
            </p>
          </div>

          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className="shrink-0 rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
    </div>
  )
}
