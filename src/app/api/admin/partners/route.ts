import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/mongodb"
import { PartnerSite } from "@/lib/db/models"
import { getCurrentSession } from "@/lib/auth/session"
import { triggerUpdate } from "@/lib/pusher-server"

export async function GET() {
  await connectToDatabase()
  const partners = await PartnerSite.find().sort({ order: 1 })
  return NextResponse.json({ partners })
}

export async function POST(req: Request) {
  const session = await getCurrentSession()
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, bonus, description, imageUrl, code, link, isActive, order, color, htmlContent } = await req.json()
  
  if (!name || !bonus || !link) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  await connectToDatabase()
  
  try {
    const partner = await PartnerSite.create({
      name,
      bonus,
      description,
      imageUrl,
      code,
      link,
      isActive,
      order: order || 0,
      color: color || "primary",
      htmlContent: htmlContent || ""
    })

    await triggerUpdate("platform-updates", "partners-updated")
    return NextResponse.json({ partner })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await getCurrentSession()
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { _id, ...updateData } = await req.json()
  
  await connectToDatabase()
  const partner = await PartnerSite.findByIdAndUpdate(_id, updateData, { new: true })
  
  if (!partner) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 })
  }

  await triggerUpdate("platform-updates", "partners-updated")
  return NextResponse.json({ partner })
}

export async function DELETE(req: Request) {
  const session = await getCurrentSession()
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 })
  }

  await connectToDatabase()
  await PartnerSite.findByIdAndDelete(id)

  await triggerUpdate("platform-updates", "partners-updated")
  return NextResponse.json({ success: true })
}
