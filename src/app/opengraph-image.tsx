import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Don Kasjo - Platforma Streamingowa"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#080f0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Arial Black', Impact, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(34,197,94,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.06) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 400,
            background: "radial-gradient(ellipse, rgba(34,197,94,0.18) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            left: "20%",
            right: "20%",
            height: 2,
            background: "linear-gradient(90deg, transparent, #22c55e, transparent)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "20%",
            right: "20%",
            height: 2,
            background: "linear-gradient(90deg, transparent, #22c55e80, transparent)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: 100,
            padding: "8px 22px",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 8px #22c55e",
            }}
          />
          <span style={{ color: "#22c55e", fontSize: 16, letterSpacing: 4, fontWeight: 900 }}>
            NA ŻYWO • PLATFORMA STREAMINGOWA
          </span>
        </div>

        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: -2,
            lineHeight: 1,
            textAlign: "center",
            textShadow: "0 0 60px rgba(34,197,94,0.3)",
          }}
        >
          DON KASJO
        </div>

        <div
          style={{
            marginTop: 20,
            fontSize: 28,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          Zbieraj punkty • Predykcje • Sklep • Giveaway
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 52,
          }}
        >
          {["🏆 Leaderboard", "🎯 Predykcje", "🛍️ Sklep", "🎁 Bonusy"].map((item) => (
            <div
              key={item}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: "10px 22px",
                color: "rgba(255,255,255,0.6)",
                fontSize: 18,
                letterSpacing: 1,
              }}
            >
              {item}
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 40,
            fontSize: 15,
            color: "rgba(255,255,255,0.2)",
            letterSpacing: 2,
          }}
        >
          don-kasjo.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
