"use client"

import { Card, CardContent } from "@/components/ui/card"
import { wagerRaceData } from "@/lib/race-data"
import { maskUsername } from "@/lib/utils"
import { Flag } from "lucide-react"

const rewards: { [key: string]: string } = {
  "1": "4150 USD",
  "2": "1100 USD",
  "3": "600 USD",
  "4": "400 USD",
  "5": "250 USD",
  "6": "150 USD",
  "7": "100 USD",
  "8": "100 USD",
  "9": "100 USD",
  "10": "101 USD",
  "11": "70 USD",
  "12": "70 USD",
  "13": "70 USD",
  "14": "50 USD",
  "15": "50 USD",
  "16": "50 USD",
  "17": "50 USD",
  "18": "30 USD",
  "19": "30 USD",
  "20": "30 USD",
  "21": "101 USD",
};

export function WagerRaceContent() {
  return (
    <div className="mx-auto max-w-4xl py-6 md:py-12 px-2 md:px-6">
      <h1 className="text-3xl md:text-4xl font-black text-white italic mb-8 uppercase flex items-center gap-3">
        <Flag className="w-8 h-8 text-green-500" />
        <span>
          <span style={{ color: "#22c55e" }}>STAKE</span> WAGER RACE LISTOPAD (05.11.2026 23:59)
        </span>
      </h1>

      <Card className="bg-[#0a0a0a]/40 border-white/10 backdrop-blur-md">
        <CardContent className="p-2 md:p-6">
          <div className="grid grid-cols-[60px_1fr_1fr_1fr] gap-2 md:gap-4 text-white/50 mb-4 font-bold uppercase text-[10px] md:text-sm px-2">
            <div>#</div>
            <div>GRACZ</div>
            <div className="text-right">WAGER</div>
            <div className="text-right">NAGRODA</div>
          </div>

          <div className="space-y-1">
            {wagerRaceData.map((row: any, i: number) => {
              const pos = Number(row.position)

              let bgColor = "transparent"

              if (pos === 1) {
                bgColor = "rgba(234, 179, 8, 0.2)"
              } else if (pos === 2) {
                bgColor = "rgba(148, 163, 184, 0.2)"
              } else if (pos === 3) {
                bgColor = "rgba(194, 65, 12, 0.2)"
              } else if (pos > 3 && pos <= 20) {
                bgColor = "rgba(255, 255, 255, 0.05)"
              }

              return (
                <div
                  key={i}
                  style={{ backgroundColor: bgColor }}
                  className="grid grid-cols-[60px_1fr_1fr_1fr] gap-2 md:gap-4 py-3 px-2 border-t border-white/5 text-white items-center rounded-md text-xs md:text-sm"
                >
                  <div className="font-bold pl-1">{row.position}</div>
                  <div className="font-mono truncate">{maskUsername(row.username)}</div>
                  <div className="font-bold text-right">{row.wager}</div>
                  <div className="text-amber-400 font-bold text-right">
                    {rewards[pos] || "-"}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
