import { NextResponse } from "next/server"
import { getEventsSubscriptions, deleteEventsSubscriptions } from "@/lib/kick-api"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const subs = await getEventsSubscriptions()
    return NextResponse.json({ count: subs.length, subscriptions: subs })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const subs = await getEventsSubscriptions()
    if (subs.length === 0) {
      return NextResponse.json({ deleted: 0 })
    }
    await deleteEventsSubscriptions(subs.map((s) => s.id))
    return NextResponse.json({ deleted: subs.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
