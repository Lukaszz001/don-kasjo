"use client"

import { Card, CardContent } from "@/components/ui/card"

export function InstructionContent({ htmlContent }: { htmlContent: string }) {
  return (
    <Card className="border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl shadow-2xl">
      <CardContent className="prose prose-slate prose-invert max-w-none p-8 md:p-12">
        <div 
          className="transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
          dangerouslySetInnerHTML={{ __html: htmlContent }} 
        />
      </CardContent>
    </Card>
  )
}
