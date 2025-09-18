"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import {
  BookOpen,
  Target,
  TrendingUp,
  LogOut,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Lock,
  ExternalLink,
  Calendar,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getUserData, logout, isAuthenticated } from "@/lib/auth"
import { getUserSubscription, checkSubjectAccess } from "@/lib/subscription"
import type { User } from "@/lib/auth"

interface EGEPlan {
  id: string
  subject: string
  targetScore: number
  duration: string
  progress: number
  createdAt: string
  weeklySchedule: Array<{
    week: number
    unlocked: boolean
    theory: string[]
    practice: string[]
    tasks: number[]
  }>
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [userPlans, setUserPlans] = useState<EGEPlan[]>([])
  const [subscription, setSubscription] = useState<any>(null)
  const router = useRouter()

 useEffect(() => {
  const fetchData = async () => {
    // 1. Проверяем авторизацию
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      router.push("/auth/login")
      return
    }
    setUser(user)

    // 2. Загружаем подписку пользователя
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("*, plan:subscription_plans(*)")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle()

    setSubscription(subs || null)

    // 3. Загружаем планы
    const { data: plans } = await supabase
      .from("user_plans")
      .select("*")
      .eq("user_id", user.id)

    setUserPlans(plans || [])
  }

  fetchData()
}, [])


  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getSubjectName = (subjectId: string) => {
    const subjects = {
      math: "Математика (профиль)",
      russian: "Русский язык",
      physics: "Физика",
      chemistry: "Химия",
      biology: "Биология",
      history: "История",
      social: "Обществознание",
      english: "Английский язык",
    }
    return subjects[subjectId as keyof typeof subjects] || subjectId
  }

  const unlockNextWeek = (planId: string) => {
    setUserPlans((prevPlans) => {
      const updatedPlans = prevPlans.map((plan) => {
        if (plan.id === planId) {
          const nextWeek = plan.weeklySchedule.find((week) => !week.unlocked)
          if (nextWeek) {
            nextWeek.unlocked = true
          }
          return { ...plan }
        }
        return plan
      })
      localStorage.setItem("user_plans", JSON.stringify(updatedPlans))
      return updatedPlans
    })
  }

  const canCreateNewPlan = () => {
    if (!subscription) return false
    return checkSubjectAccess(subscription, userPlans.length + 1)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">EGE Prep</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Привет, {user.name}!</span>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">Админ</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Личный кабинет</h1>
          <p className="text-muted-foreground">Управляйте своими планами подготовки к ЕГЭ и отслеживайте прогресс</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="plans">Мои планы</TabsTrigger>
            <TabsTrigger value="progress">Прогресс</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Активные планы</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userPlans.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {subscription ? `из ${subscription.subjectCount} доступных` : "планов"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Недель открыто</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userPlans.reduce(
                      (total, plan) => total + (plan.weeklySchedule?.filter((week) => week.unlocked).length || 0),
                      0,
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">всего по всем предметам</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Средний прогресс</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userPlans.length > 0
                      ? Math.round(userPlans.reduce((sum, plan) => sum + plan.progress, 0) / userPlans.length)
                      : 0}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">по всем предметам</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Подписка</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subscription?.subjectCount || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {subscription?.subjectCount === 1
                      ? "предмет"
                      : subscription?.subjectCount < 5
                        ? "предмета"
                        : "предметов"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Active Plans Overview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Активные планы подготовки</h2>
                {canCreateNewPlan() && (
                  <Button asChild>
                    <Link href="/dashboard/create-plan">
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить план
                    </Link>
                  </Button>
                )}
              </div>
{!subscription ? (
  <Card className="text-center py-12">
    <CardContent>
      <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">У вас нет активной подписки</h3>
      <p className="text-muted-foreground mb-4">Чтобы пользоваться планами подготовки, оформите подписку</p>
      <Button asChild>
        <Link href="/dashboard/subscription">Перейти к подпискам</Link>
      </Button>
    </CardContent>
  </Card>
) : (
              {userPlans.length > 0 ? (
                <div className="grid gap-4">
                  {userPlans.map((plan) => (
                    <Card key={plan.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <BookOpen className="h-5 w-5 text-primary" />
                              {getSubjectName(plan.subject)}
                            </CardTitle>
                            <CardDescription>
                              Целевой балл: {plan.targetScore} | Длительность: {plan.duration}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary">Активный</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Прогресс</span>
                            <span>{plan.progress}%</span>
                          </div>
                          <Progress value={plan.progress} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              Доступно недель: {plan.weeklySchedule?.filter((w) => w.unlocked).length}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => unlockNextWeek(plan.id)}>
                              Разблокировать неделю
                            </Button>
                            <Button size="sm" onClick={() => router.push(`/dashboard?tab=plans&plan=${plan.id}`)}>
                              Открыть план
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Нет активных планов</h3>
                    <p className="text-muted-foreground mb-4">Создайте план подготовки к ЕГЭ, чтобы начать обучение</p>
                    <Button asChild>
                      <Link href="/dashboard/create-plan">Создать первый план</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
               )}
            </div>
           

            {/* Subscription Status */}
            {subscription && (
              <Card>
                <CardHeader>
                  <CardTitle>Статус подписки</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {subscription.subjectCount}{" "}
                        {subscription.subjectCount === 1
                          ? "предмет"
                          : subscription.subjectCount < 5
                            ? "предмета"
                            : "предметов"}{" "}
                        - Месячная подписка
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Использовано: {userPlans.length} из {subscription.subjectCount}
                      </p>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/subscription">Управлять</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Мои планы подготовки к ЕГЭ</h2>
              {canCreateNewPlan() && (
                <Button asChild>
                  <Link href="/dashboard/create-plan">
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить план
                  </Link>
                </Button>
              )}
            </div>

            {userPlans.length > 0 ? (
              <div className="space-y-6">
                {userPlans.map((plan) => (
                  <Card key={plan.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          {getSubjectName(plan.subject)}
                        </CardTitle>
                        <Badge variant="outline">План #{plan.id}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {plan.weeklySchedule?.map((week) => (
                          <Card key={week.week} className={week.unlocked ? "" : "opacity-60"}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2 text-sm">
                                  {week.unlocked ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  Неделя {week.week}
                                </CardTitle>
                                <Badge variant={week.unlocked ? "default" : "secondary"} className="text-xs">
                                  {week.unlocked ? "Доступна" : "Заблокирована"}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              {week.unlocked ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                                      <BookOpen className="h-3 w-3 text-blue-500" />
                                      Теория
                                    </h4>
                                    <div className="space-y-1">
                                      {week.theory.map((item, index) => (
                                        <Button
                                          key={index}
                                          variant="ghost"
                                          size="sm"
                                          className="justify-start h-auto p-1 text-xs"
                                        >
                                          <ExternalLink className="h-3 w-3 mr-1" />
                                          {item}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                                      <Target className="h-3 w-3 text-green-500" />
                                      Практика
                                    </h4>
                                    <div className="space-y-1">
                                      {week.practice.map((item, index) => (
                                        <Button
                                          key={index}
                                          variant="ghost"
                                          size="sm"
                                          className="justify-start h-auto p-1 text-xs"
                                        >
                                          <ExternalLink className="h-3 w-3 mr-1" />
                                          {item}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-4">
                                  <Lock className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                                  <p className="text-sm text-muted-foreground">
                                    Неделя будет разблокирована автоматически
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Нет планов подготовки</h3>
                  <p className="text-muted-foreground mb-4">
                    Создайте план подготовки к ЕГЭ, чтобы получить доступ к материалам
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/create-plan">Создать план</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <h2 className="text-2xl font-bold">Прогресс подготовки к ЕГЭ</h2>

            {userPlans.length > 0 ? (
              <div className="space-y-6">
                {userPlans.map((plan) => (
                  <Card key={plan.id}>
                    <CardHeader>
                      <CardTitle>Статистика по {getSubjectName(plan.subject)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Прогресс</span>
                            <span>{plan.progress}%</span>
                          </div>
                          <Progress value={plan.progress} className="h-3" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {plan.weeklySchedule?.filter((w) => w.unlocked).length || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Недель открыто</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{plan.targetScore}</div>
                            <div className="text-sm text-muted-foreground">Целевой балл</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600">{plan.weeklySchedule?.length || 0}</div>
                            <div className="text-sm text-muted-foreground">Всего недель</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Нет данных о прогрессе</h3>
                  <p className="text-muted-foreground">Создайте план подготовки к ЕГЭ, чтобы отслеживать прогресс</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">Настройки</h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Профиль</CardTitle>
                  <CardDescription>Управление информацией профиля</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Имя</label>
                    <p className="text-muted-foreground">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  <Button variant="outline">Редактировать профиль</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Подписка</CardTitle>
                  <CardDescription>Управление подпиской и доступом к материалам ЕГЭ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {subscription?.subjectCount || 0}{" "}
                        {subscription?.subjectCount === 1
                          ? "предмет"
                          : subscription?.subjectCount < 5
                            ? "предмета"
                            : "предметов"}{" "}
                        - Месячная подписка
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Использовано: {userPlans.length} из {subscription?.subjectCount || 0}
                      </p>
                    </div>
                    <Badge variant={subscription?.isActive ? "secondary" : "destructive"}>
                      {subscription?.isActive ? "Активна" : "Неактивна"}
                    </Badge>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/subscription">Управлять подпиской</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Telegram интеграция</CardTitle>
                  <CardDescription>Настройка уведомлений и получение материалов через Telegram бота</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Telegram не подключен</span>
                  </div>
                  <Button variant="outline">Подключить Telegram</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
