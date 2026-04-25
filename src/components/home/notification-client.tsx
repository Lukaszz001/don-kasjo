"use client"

import { useState, useEffect } from "react"
import { CornerNotification } from "@/components/ui/corner-notification"
import { useLanguage } from "@/lib/language-context"

export function NotificationClient() {
  const { t, isHydrated } = useLanguage()
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  if (!isHydrated || !showNotification) return null

  return (
    <div className="hidden lg:block">
      <CornerNotification
        position="bottom-right"
        title={t("notification.newReward.title")}
        message={t("notification.newReward.message")}
        icon="gift"
        dismissible
      />
    </div>
  )
}
