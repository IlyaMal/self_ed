import { type NextRequest, NextResponse } from "next/server"

// Заглушка для Telegram webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Логируем входящие сообщения (в реальном приложении здесь будет обработка)
    console.log("[Telegram Webhook] Received:", body)

    // Заглушка для обработки команд
    if (body.message) {
      const chatId = body.message.chat.id
      const text = body.message.text

      if (text === "/start") {
        // Отправляем приветственное сообщение (заглушка)
        console.log(`[Telegram Bot] Sending welcome message to chat ${chatId}`)
        return NextResponse.json({ status: "ok", action: "welcome_sent" })
      }

      if (text === "/materials") {
        // Отправляем материалы (заглушка)
        console.log(`[Telegram Bot] Sending materials to chat ${chatId}`)
        return NextResponse.json({ status: "ok", action: "materials_sent" })
      }

      if (text === "/progress") {
        // Отправляем прогресс (заглушка)
        console.log(`[Telegram Bot] Sending progress to chat ${chatId}`)
        return NextResponse.json({ status: "ok", action: "progress_sent" })
      }
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("[Telegram Webhook] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: "Telegram webhook endpoint is active" })
}
