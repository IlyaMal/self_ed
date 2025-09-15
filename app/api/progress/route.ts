import { type NextRequest, NextResponse } from "next/server"
import { updateProgress, markMaterialCompleted } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, materialId, action, score, timeSpent } = body

    if (!userId || !materialId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (action === "complete") {
      const progress = await markMaterialCompleted(userId, materialId, score)
      return NextResponse.json({ progress })
    }

    if (action === "update") {
      const progress = await updateProgress(userId, materialId, {
        status: "in_progress",
        timeSpent: timeSpent || 0,
      })
      return NextResponse.json({ progress })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[Progress API] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
