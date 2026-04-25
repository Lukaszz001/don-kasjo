"use client"

import type { ReactNode } from "react"
import { LucideIcon, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AdminModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  icon?: LucideIcon
  children: ReactNode
  footer?: ReactNode
  className?: string
  isLoading?: boolean
  submitLabel?: string
  onSubmit?: () => void
}

export function AdminModal({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  children,
  footer,
  className,
  isLoading = false,
  submitLabel = "Zapisz",
  onSubmit,
}: AdminModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(
        "max-h-[85vh] overflow-hidden flex flex-col gap-0 p-0 sm:max-w-2xl border-primary/20 shadow-[0_0_40px_-12px] shadow-primary/30 bg-background/95 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%]",
        className
      )}>
        {/* Branding Glowing Top Border */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_15px] shadow-primary/50" />
        
        {/* Subtle Brand Tint Overlay */}
        <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none" />

        <DialogHeader className="relative p-8 pb-4">
          <div className="flex items-center gap-5">
            {Icon && (
              <div className="relative group">
                <div className="absolute -inset-2 bg-primary/20 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[inset_0_0_20px] shadow-primary/10">
                  <Icon className="h-7 w-7" />
                </div>
              </div>
            )}
            <div className="flex-1 space-y-1.5">
              <DialogTitle className="font-display text-3xl font-black tracking-tight text-foreground">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-muted-foreground font-medium text-sm leading-relaxed max-w-[90%]">
                  {description}
                </DialogDescription>
              )}
            </div>
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="relative flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            {children}
          </div>
        </div>

        <DialogFooter className="relative p-8 pt-4 bg-primary/[0.03] border-t border-primary/10">
          {footer ? (
            footer
          ) : (
            <div className="flex w-full items-center justify-end gap-4">
              <Button
                variant="ghost"
                onClick={onClose}
                className="font-bold hover:bg-primary/10 px-8 h-12 rounded-xl text-muted-foreground hover:text-primary transition-all"
                disabled={isLoading}
              >
                Anuluj
              </Button>
              <Button
                onClick={onSubmit}
                className={cn(
                  "relative h-12 px-10 rounded-xl font-display font-black text-sm uppercase tracking-wider transition-all duration-300",
                  "bg-primary text-primary-foreground shadow-[0_0_20px] shadow-primary/30 hover:shadow-[0_0_35px] hover:shadow-primary/50 hover:-translate-y-0.5 active:translate-y-0",
                  isLoading && "opacity-80 scale-[0.98]"
                )}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Przetwarzanie</span>
                  </div>
                ) : (
                  <>
                    <span className="relative z-10">{submitLabel}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none group-hover:animate-shine" />
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
