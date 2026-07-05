"use client"

import { Card, CardContent } from "@/components/ui/card"
import { wagerRaceData } from "@/lib/race-data"
import { maskUsername } from "@/lib/utils"

const rewards: { [key: string]: string } = {
  "1": "3500 PLN", "2": "1500 PLN", "3": "1000 PLN", "4": "500 PLN",
  "5": "400 PLN", "6": "300 PLN", "7": "200 PLN", "8": "150 PLN",
  "9": "100 PLN", "10": "100 PLN"
}

export function WagerRaceContent() {
  return (
    <div className="mx-auto max-w-4xl py-12 px-6">
      <h1 className="text-4xl font-black text-white italic mb-8 uppercase">
        <span style={{ color: "#22c55e" }}>STAKE</span> WAGER RACE
      </h1>
      <Card className="bg-[#0a0a0a]/40 border-white/10 backdrop-blur-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-4 gap-4 text-white/50 mb-4 font-bold uppercase text-sm px-4">
            <div>MIEJSCE</div>
            <div>GRACZ</div>
            <div>WAGER</div>
            <div>NAGRODA</div>
          </div>
          <div className="space-y-1">
            {wagerRaceData.map((row: any, i: number) => {
              // Wymuszamy, żeby pozycja była liczbą
              const pos = Number(row.position);
              
              let bgColor = "transparent";
              if (pos == 1) bgColor = "rgba(234, 179, 8, 0.2)"; // Złoty
              else if (pos == 2) bgColor = "rgba(148, 163, 184, 0.2)"; // Srebrny
              else if (pos == 3) bgColor = "rgba(194, 65, 12, 0.2)"; // Brązowy
              else if (pos > 3 && pos <= 10) bgColor = "rgba(255, 255, 255, 0.05)"; // Szary

              return (
                <div 
                  key={i} 
                  style={{ backgroundColor: bgColor }}
                  className="grid grid-cols-4 gap-4 py-4 px-4 border-t border-white/5 text-white items-center rounded-md"
                >
                  <div className="font-bold">{row.position}</div>
                  <div className="font-mono">{maskUsername(row.username)}</div>
                  <div className="font-bold">{row.wager}</div>
                  <div className="text-amber-400 font-bold">{rewards[pos] || "-"}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}