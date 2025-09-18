"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { BookOpen, ArrowLeft, Crown, Check, AlertTriangle, Shield, MessageSquare, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

import {
  getUserSubscription,
  getAvailablePlans,
  isSubscriptionExpiring,
  formatSubscriptionEndDate,
  type Subscription,
} from "@/lib/subscription"

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

 useEffect(() => {
    async function fetchData() {
      // Получаем текущего пользователя из Supabase
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Получаем подписку пользователя
      const { data: subData, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (subError) {
        console.error("Ошибка получения подписки:", subError)
      } else {
        setSubscription(subData as Subscription)
      }

      // Получаем все тарифные планы
      const { data: plansData, error: plansError } = await supabase
        .from("plans")
        .select("*")
        .order("subject_count", { ascending: true })

      if (plansError) {
        console.error("Ошибка получения планов:", plansError)
      } else {
        setPlans(plansData as Subscription[])
      }

      setLoading(false)
    }

    fetchData()
  }, [router, supabase])



  const plans = getAvailablePlans()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const daysUntilExpiry = subscription
    ? Math.ceil((subscription.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">EduPrep</h1>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к кабинету
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Выберите количество предметов</h1>
          <p className="text-muted-foreground">Чем больше предметов, тем выгоднее цена за каждый</p>
        </div>

        {/* Current Subscription Status */}
        {subscription && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Текущая подписка
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {subscription.subjectCount}{" "}
                    {subscription.subjectCount === 1
                      ? "предмет"
                      : subscription.subjectCount < 5
                        ? "предмета"
                        : "предметов"}{" "}
                    - Месячная подписка
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {subscription.isActive
                      ? `Активна до ${formatSubscriptionEndDate(subscription.endDate)}`
                      : "Подписка неактивна"}
                  </p>
                </div>
                <Badge variant={subscription.isActive ? "secondary" : "destructive"}>
                  {subscription.isActive ? "Активна" : "Неактивна"}
                </Badge>
              </div>

              {subscription.isActive && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Дней до окончания</span>
                    <span>{daysUntilExpiry}</span>
                  </div>
                  <Progress value={Math.max(0, (30 - daysUntilExpiry) / 30) * 100} className="h-2" />
                </div>
              )}

              {subscription.isActive && isSubscriptionExpiring(subscription) && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Ваша подписка истекает через {daysUntilExpiry} дней. Продлите подписку, чтобы не потерять доступ к
                    материалам.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Available Plans */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${plan.id === "monthly-2" ? "border-primary shadow-lg scale-105" : ""}`}
            >
              {plan.id === "monthly-2" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Популярный</Badge>
                </div>
              )}

              {plan.id === "monthly-4" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-600 text-white">Выгодно</Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  {plan.id === "free" && <Shield className="h-5 w-5" />}
                  {plan.id.includes("monthly") && <Users className="h-5 w-5" />}
                  {plan.name}
                </CardTitle>
                <CardDescription>{plan.duration}</CardDescription>
                <div className="py-4">
                  <div className="text-3xl font-bold">
                    {plan.price === 0 ? "Бесплатно" : `${plan.price.toLocaleString("ru-RU")} ₽`}
                  </div>
                  {plan.price > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {Math.round(plan.price / plan.subjectCount)} ₽ за предмет
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  {subscription?.subjectCount === plan.subjectCount && subscription.isActive ? (
                    <Button className="w-full" disabled>
                      Текущий тариф
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.id === "free" ? "outline" : "default"}
                      onClick={() => {
                        // Заглушка для оплаты
                        alert(`Переход к оплате тарифа "${plan.name}" за ${plan.price} ₽`)
                      }}
                    >
                      {plan.id === "free" ? "Перейти на бесплатный" : "Выбрать тариф"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Comparison */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Сравнение тарифов</CardTitle>
            <CardDescription>Экономьте больше при выборе нескольких предметов</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <div className="font-semibold">1 предмет</div>
                <div className="text-2xl font-bold">990 ₽</div>
                <div className="text-sm text-muted-foreground">990 ₽/предмет</div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold">2 предмета</div>
                <div className="text-2xl font-bold">1690 ₽</div>
                <div className="text-sm text-green-600">845 ₽/предмет</div>
                <Badge variant="secondary" className="text-xs">
                  -15%
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="font-semibold">3 предмета</div>
                <div className="text-2xl font-bold">2290 ₽</div>
                <div className="text-sm text-green-600">763 ₽/предмет</div>
                <Badge variant="secondary" className="text-xs">
                  -23%
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="font-semibold">4 предмета</div>
                <div className="text-2xl font-bold">2790 ₽</div>
                <div className="text-sm text-green-600">698 ₽/предмет</div>
                <Badge className="text-xs bg-green-600">-30%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Часто задаваемые вопросы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Как работает доступ к материалам?</h4>
              <p className="text-sm text-muted-foreground">
                Месячная подписка дает доступ к материалам текущего и предыдущих месяцев. Годовая подписка открывает
                доступ ко всем материалам года.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Можно ли отменить подписку?</h4>
              <p className="text-sm text-muted-foreground">
                Да, вы можете отменить подписку в любое время. Доступ к материалам сохранится до окончания оплаченного
                периода.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Как работает Telegram бот?</h4>
              <p className="text-sm text-muted-foreground">
                После оформления подписки вы получите инструкции по подключению Telegram бота, который будет присылать
                материалы и напоминания.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
