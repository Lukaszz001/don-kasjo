import { NextResponse } from "next/server"
import { ensureKickSubscription } from "@/lib/kick-api"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const success = await ensureKickSubscription()
  return NextResponse.json({ success })
}
