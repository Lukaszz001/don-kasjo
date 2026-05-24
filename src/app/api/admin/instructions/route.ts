import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/mongodb"
import { Instruction } from "@/lib/db/models"
import { getCurrentSession } from "@/lib/auth/session"

export async function GET() {
  await connectToDatabase()
  const instructions = await Instruction.find().sort({ createdAt: -1 })
  return NextResponse.json({ instructions })
}

export async function POST(req: Request) {
  const session = await getCurrentSession()
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, slug, shortDescription, imageUrl, htmlContent, isPublished } = await req.json()
  
  if (!title || !slug || !shortDescription) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  await connectToDatabase()
  
  try {
    const instruction = await Instruction.create({
      title,
      slug,
      shortDescription,
      imageUrl,
      htmlContent,
      isPublished
    })

    return NextResponse.json({ instruction })
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Slug must be unique" }, { status: 400 })
    }
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
  const instruction = await Instruction.findByIdAndUpdate(_id, updateData, { new: true })
  
  if (!instruction) {
    return NextResponse.json({ error: "Instruction not found" }, { status: 404 })
  }

  return NextResponse.json({ instruction })
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
  await Instruction.findByIdAndDelete(id)

  return NextResponse.json({ success: true })
}
