"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className, width = 300, height = 100 }: LogoProps) {
  return (
    <div className={cn("relative flex flex-col items-center justify-center transition-all duration-300 group", className)}>
      {/* Character Graphic - Lowered and integrated with the text */}
      <div className="hidden md:block relative w-full h-24 -mb-8 z-30 transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-110">
        <Image
          src="/kasyno7.png"
          alt="Don Kasjo Hero"
          fill
          className="object-contain filter brightness-115 contrast-110 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]"
          priority
        />
        {/* Glow effect that blends the character with the logo */}
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Primary Logo Text - Significantly Enlarged and Layered */}
      <div className="relative">
        <Image 
          src="/logo.png" 
          alt="Don Kasjo Logo" 
          width={width} 
          height={height} 
          priority 
          className="relative z-20 w-auto h-16 lg:h-28 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all duration-300"
        />
        
        {/* Deep under-glow to anchor the large logo */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[110%] h-4 bg-primary/40 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  )
}
