import { ImageResponse } from "next/og"

export const OG_SIZE = { width: 1200, height: 630 }

export async function getArchivoBlack() {
  return fetch(
    "https://fonts.gstatic.com/s/archivoblack/v22/HTxqL289NzCGg4MzN6KJ7eW6OYuP_x7yx3A.woff2"
  ).then((res) => res.arrayBuffer())
}

interface OGConfig {
  title: string
  subtitle: string
  badge: string
  emoji: string
  accentColor?: string
}

export async function generateOGImage(config: OGConfig) {
  const { title, subtitle, badge, emoji, accentColor = "#22c55e" } = config
  const font = await getArchivoBlack()

  const accentAlpha18 = `${accentColor}2e`
  const accentAlpha30 = `${accentColor}4d`

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
          fontFamily: "'Archivo Black', sans-serif",
        }}
      >
        {/* Grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(34,197,94,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.05) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 350,
            background: `radial-gradient(ellipse, ${accentAlpha18} 0%, transparent 70%)`,
            borderRadius: "50%",
          }}
        />

        {/* Top line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: 2,
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          }}
        />

        {/* Left accent bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "15%",
            bottom: "15%",
            width: 4,
            background: `linear-gradient(180deg, transparent, ${accentColor}, transparent)`,
          }}
        />

        {/* Emoji big */}
        <div style={{ fontSize: 72, marginBottom: 8, lineHeight: 1 }}>{emoji}</div>

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: `rgba(34,197,94,0.1)`,
            border: `1px solid rgba(34,197,94,0.25)`,
            borderRadius: 100,
            padding: "7px 20px",
            marginBottom: 28,
          }}
        >
          <span style={{ color: "#22c55e", fontSize: 14, letterSpacing: 4, fontWeight: 900 }}>
            {badge}
          </span>
        </div>

        {/* Site name */}
        <div
          style={{
            fontSize: 26,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: 8,
            marginBottom: 12,
          }}
        >
          DON KASJO
        </div>

        {/* Page title */}
        <div
          style={{
            fontSize: 86,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: -2,
            lineHeight: 1,
            textAlign: "center",
            textShadow: `0 0 50px ${accentAlpha30}`,
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            marginTop: 20,
            fontSize: 24,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: 3,
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          {subtitle}
        </div>

        {/* Bottom line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "15%",
            right: "15%",
            height: 2,
            background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)`,
          }}
        />

        {/* Corner */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 40,
            fontSize: 15,
            color: "rgba(255,255,255,0.18)",
            letterSpacing: 2,
          }}
        >
          don-kasjo.com
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "Archivo Black", data: font, style: "normal", weight: 900 }],
    }
  )
}
