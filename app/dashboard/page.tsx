"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface Subscription {
  id: string
  is_active: boolean
  start_date: string
  end_date: string
  subject_count: number
  plan: {
    id: string
    name: string
    duration: number
    price: number
    features: string[]
  }
}

interface UserPlan {
  id: string
  subject: string
  exam_date: string
  total_weeks: number
  weekly_schedule: {
    week: number
    topics: string[]
    isUnlocked: boolean
  }[]
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [userPlans, setUserPlans] = useState<UserPlan[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Проверяем авторизацию
  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        router.push("/auth/login")
        return
      }
      setUser(data.user)
    }

    loadUser()
  }, [router])

  // Грузим подписку и планы
  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        // Подписка
        const { data: subData } = await supabase
          .from("subscriptions")
          .select(
            `
            id,
            is_active,
            start_date,
            end_date,
            subject_count,
            plan:subscription_plans (
              id,
              name,
              duration,
              price,
              features
            )
          `
          )
          .eq("user_id", user.id)
          .single()

        setSubscription(subData)

        // Планы
        const { data: plansData } = await supabase
          .from("user_plans")
          .select("*")
          .eq("user_id", user.id)

        setUserPlans(plansData || [])
      } catch (err) {
        console.error("Ошибка загрузки:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  // Разблокировка недели
  const unlockNextWeek = async (planId: string) => {
    const plan = userPlans.find((p) => p.id === planId)
    if (!plan) return

    const updatedSchedule = plan.weekly_schedule.map((week, index) =>
      index === plan.weekly_schedule.findIndex((w) => !w.isUnlocked)
        ? { ...week, isUnlocked: true }
        : week
    )

    const { error } = await supabase
      .from("user_plans")
      .update({ weekly_schedule: updatedSchedule })
      .eq("id", planId)

    if (error) {
      console.error("Ошибка обновления:", error)
      return
    }

    setUserPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, weekly_schedule: updatedSchedule } : p))
    )
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (loading) {
    return <div className="p-6">Загрузка...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Личный кабинет</h1>
        <Button onClick={logout} variant="outline">
          Выйти
        </Button>
      </div>

      {/* Подписка */}
      {subscription ? (
        <Card>
          <CardHeader>
            <CardTitle>Ваша подписка</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              План: <b>{subscription.plan.name}</b>
            </p>
            <p>
              Доступно предметов: <b>{subscription.subject_count}</b>
            </p>
            <p>
              Действует до: <b>{new Date(subscription.end_date).toLocaleDateString()}</b>
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Нет активной подписки</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/pricing")}>Оформить подписку</Button>
          </CardContent>
        </Card>
      )}

      {/* Учебные планы */}
      <div className="grid gap-4 md:grid-cols-2">
        {userPlans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.subject}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Экзамен: <b>{new Date(plan.exam_date).toLocaleDateString()}</b>
              </p>
              <div className="mt-4 space-y-2">
                {plan.weekly_schedule.map((week, idx) => (
                  <div
                    key={idx}
                    className={`p-2 border rounded ${
                      week.isUnlocked ? "bg-green-50" : "bg-gray-100"
                    }`}
                  >
                    Неделя {week.week}: {week.topics.join(", ")}
                  </div>
                ))}
              </div>
              <Button className="mt-4" onClick={() => unlockNextWeek(plan.id)}>
                Разблокировать следующую неделю
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
