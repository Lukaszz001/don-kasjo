import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { Setting, setSetting } from "@/lib/db/models/settings"
import { connectToDatabase } from "@/lib/db/mongodb"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isDeveloper) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    
    // We only expose keys starting with 'env:' for security
    const settings = await Setting.find({ key: { $regex: /^env:/ } })
    
    // Transform to simple key-value object
    const config: Record<string, any> = {}
    settings.forEach(s => {
      config[s.key.replace("env:", "")] = s.value
    })

    return NextResponse.json({ config })
  } catch (error) {
    console.error("[Config API] GET error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isDeveloper) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { key, value } = await req.json()
    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 })
    }

    await connectToDatabase()
    
    // Only allow specific keys or keys with 'env:' prefix
    const safeKey = key.startsWith("env:") ? key : `env:${key}`
    
    await setSetting(safeKey, value)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Config API] POST error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
