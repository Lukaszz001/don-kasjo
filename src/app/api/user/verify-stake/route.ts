import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { User, Activity } from "@/lib/db/models"
import { connectToDatabase } from "@/lib/db/mongodb"
import { rateLimit } from "@/lib/db/redis"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rl = await rateLimit(`verify-stake:${user._id}`, 5, 60)
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const { stakeUsername } = await req.json()
    if (!stakeUsername || stakeUsername.length < 3) {
      return NextResponse.json({ error: "Invalid Stake username" }, { status: 400 })
    }

    // Check 7-day cooldown
    if (user.lastStakeVerificationDate) {
      const lastDate = new Date(user.lastStakeVerificationDate)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - lastDate.getTime())
      const diffDays = diffTime / (1000 * 60 * 60 * 24)
      
      if (diffDays < 7) {
        const remainingDays = Math.ceil(7 - diffDays)
        return NextResponse.json({ 
          error: `Możesz spróbować ponownie za ${remainingDays} dni.` 
        }, { status: 429 })
      }
    }

    await connectToDatabase()

    // Mock verification - In a real app, this would call Stake API or check a list
    // For now, we'll assume it works if the username is provided
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        stakeUsername,
        isStakeVerified: true,
        lastStakeVerificationDate: new Date(),
      },
      { new: true }
    )

    if (updatedUser) {
      await Activity.create({
        kickId: updatedUser.kickId,
        type: "stake_verify",
        title: "Weryfikacja Stake",
        description: `Zweryfikowano konto Stake: ${stakeUsername}`,
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        stakeUsername: updatedUser?.stakeUsername,
        isStakeVerified: updatedUser?.isStakeVerified,
        lastStakeVerificationDate: updatedUser?.lastStakeVerificationDate,
      }
    })
  } catch (error) {
    console.error("Stake verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
