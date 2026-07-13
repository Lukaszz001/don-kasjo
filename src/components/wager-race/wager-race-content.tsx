"use client"

import { Card, CardContent } from "@/components/ui/card"
import { wagerRaceData } from "@/lib/race-data"
import { maskUsername } from "@/lib/utils"
import { Flag } from "lucide-react"

const rewards: { [key: string]: string } = {
  "1": "3500 PLN", "2": "1500 PLN", "3": "1000 PLN", "4": "500 PLN",
  "5": "400 PLN", "6": "300 PLN", "7": "200 PLN", "8": "150 PLN",
  "9": "100 PLN", "10": "100 PLN"
}

export function WagerRaceContent() {
  return (
    <div className="mx-auto max-w-4xl py-6 md:py-12 px-2 md:px-6">
      <h1 className="text-3xl md:text-4xl font-black text-white italic mb-8 uppercase flex items-center gap-3">
        <Flag className="w-8 h-8 text-green-500" />
        <span><span style={{ color: "#22c55e" }}>STAKE</span> WAGER RACE (13.07.2026)</span>
      </h1>
      <Card className="bg-[#0a0a0a]/40 border-white/10 backdrop-blur-md">
        <CardContent className="p-2 md:p-6">
          {/* Nagłówki - dodano w-16 dla dopasowania */}
          <div className="grid grid-cols-[60px_1fr_1fr_1fr] gap-2 md:gap-4 text-white/50 mb-4 font-bold uppercase text-[10px] md:text-sm px-2">
            <div>#</div>
            <div>GRACZ</div>
            <div className="text-right">WAGER</div>
            <div className="text-right">NAGRODA</div>
          </div>
          
          <div className="space-y-1">
            {wagerRaceData.map((row: any, i: number) => {
              const pos = Number(row.position);
              
              let bgColor = "transparent";
              if (pos == 1) bgColor = "rgba(234, 179, 8, 0.2)";
              else if (pos == 2) bgColor = "rgba(148, 163, 184, 0.2)";
              else if (pos == 3) bgColor = "rgba(194, 65, 12, 0.2)";
              else if (pos > 3 && pos <= 10) bgColor = "rgba(255, 255, 255, 0.05)";

              return (
                <div 
                  key={i} 
                  style={{ backgroundColor: bgColor }}
                  className="grid grid-cols-[60px_1fr_1fr_1fr] gap-2 md:gap-4 py-3 px-2 border-t border-white/5 text-white items-center rounded-md text-xs md:text-sm"
                >
                  <div className="font-bold pl-1">{row.position}</div>
                  <div className="font-mono truncate">{maskUsername(row.username)}</div>
                  <div className="font-bold text-right">{row.wager}</div>
                  <div className="text-amber-400 font-bold text-right">{rewards[pos] || "-"}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
