import { type NextRequest, NextResponse } from "next/server"
import { getAvailableMaterials, getUserSubscription } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { planId: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Получаем подписку пользователя
    const subscription = await getUserSubscription(userId)
    if (!subscription) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 })
    }

    // Получаем доступные материалы с учетом подписки
    const materials = await getAvailableMaterials(params.planId, subscription)

    return NextResponse.json({ materials })
  } catch (error) {
    console.error("[Materials API] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
