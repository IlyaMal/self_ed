"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Lock, Clock } from "lucide-react"
import { getUserData } from "@/lib/auth"
import { getUserSubscription, checkMaterialAccess, type Subscription } from "@/lib/subscription"
import Link from "next/link"

interface MaterialAccessCheckProps {
  materialDate: Date
  materialTitle: string
  children: React.ReactNode
}

export function MaterialAccessCheck({ materialDate, materialTitle, children }: MaterialAccessCheckProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getUserData()
    if (user) {
      const userSub = getUserSubscription(user.id)
      setSubscription(userSub)
      setHasAccess(checkMaterialAccess(userSub, materialDate))
    }
    setLoading(false)
  }, [materialDate])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (hasAccess) {
    return <>{children}</>
  }

  const isCurrentMonth = () => {
    const now = new Date()
    return materialDate.getMonth() === now.getMonth() && materialDate.getFullYear() === now.getFullYear()
  }

  const isFutureMonth = () => {
    const now = new Date()
    return materialDate > now
  }

  return (
    <Card className="text-center">
      <CardHeader>
        <div className="flex items-center justify-center mb-4">
          <Lock className="h-12 w-12 text-muted-foreground" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          {materialTitle}
        </CardTitle>
        <CardDescription>
          Материал от {materialDate.toLocaleDateString("ru-RU")}
          {isFutureMonth() && " (будущий месяц)"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {isCurrentMonth()
                ? "Материал текущего месяца"
                : isFutureMonth()
                  ? "Материал будущего месяца"
                  : "Материал прошлого месяца"}
            </span>
          </div>
          {subscription && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Ваш тариф:</span>
              <Badge variant={subscription.isActive ? "secondary" : "destructive"}>
                {subscription.type === "monthly"
                  ? "Месячная"
                  : subscription.type === "yearly"
                    ? "Годовая"
                    : "Бесплатная"}
              </Badge>
            </div>
          )}
        </div>

        <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
          {isFutureMonth() ? (
            <p>Материалы будущих месяцев доступны только с годовой подпиской</p>
          ) : isCurrentMonth() ? (
            <p>Для доступа к материалам текущего месяца нужна активная подписка</p>
          ) : (
            <p>Для доступа к материалам прошлых месяцев нужна премиум подписка</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button asChild>
            <Link href="/dashboard/subscription">
              {subscription?.type === "monthly" ? "Обновить до годовой" : "Оформить подписку"}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Вернуться в кабинет</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
