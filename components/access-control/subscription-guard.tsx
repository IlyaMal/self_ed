"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Lock, Crown, AlertTriangle } from "lucide-react"
import { getUserData } from "@/lib/auth"
import { getUserSubscription, checkFeatureAccess, type Subscription } from "@/lib/subscription"
import Link from "next/link"

interface SubscriptionGuardProps {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function SubscriptionGuard({ feature, children, fallback }: SubscriptionGuardProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getUserData()
    if (user) {
      const userSub = getUserSubscription(user.id)
      setSubscription(userSub)
      setHasAccess(checkFeatureAccess(userSub, feature))
    }
    setLoading(false)
  }, [feature])

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

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <Card className="text-center">
      <CardHeader>
        <div className="flex items-center justify-center mb-4">
          <Lock className="h-12 w-12 text-muted-foreground" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Премиум функция
        </CardTitle>
        <CardDescription>Для доступа к этой функции необходима подписка</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription && (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Текущий тариф:</span>
              <Badge variant={subscription.isActive ? "secondary" : "destructive"}>
                {subscription.type === "monthly"
                  ? "Месячная"
                  : subscription.type === "yearly"
                    ? "Годовая"
                    : "Бесплатная"}
              </Badge>
            </div>
            {!subscription.isActive && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Ваша подписка истекла</AlertDescription>
              </Alert>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button asChild>
            <Link href="/dashboard/subscription">Обновить подписку</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Вернуться в кабинет</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
