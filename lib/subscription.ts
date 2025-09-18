// lib/subscriptions.ts
import { supabase } from "@/lib/supabase"

export type SubscriptionType = "monthly" | "yearly" | "free"
export type AccessLevel = "basic" | "premium" | "unlimited"
export type SubjectCount = 1 | 2 | 3 | 4

export interface Subscription {
  id: string
  userId: string
  type: SubscriptionType
  accessLevel: AccessLevel
  subjectCount: SubjectCount
  startDate: Date
  endDate: Date
  isActive: boolean
  materialsAccess: {
    currentMonth: boolean
    fullYear: boolean
    previousMonths: boolean
  }
}

export interface SubscriptionPlan {
  id: string
  name: string
  duration: string
  price: number
  subjectCount: SubjectCount
  features: string[]
  accessLevel: AccessLevel
  materialsAccess: {
    currentMonth: boolean
    fullYear: boolean
    previousMonths: boolean
  }
}

/**
 * Получение подписки пользователя из БД
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle()

  if (error) {
    console.error("Ошибка получения подписки:", error.message)
    return null
  }
  if (!data) return null

  return {
    id: data.id,
    userId: data.user_id,
    type: data.type,
    accessLevel: data.access_level,
    subjectCount: data.subject_count,
    startDate: new Date(data.start_date),
    endDate: new Date(data.end_date),
    isActive: data.is_active,
    materialsAccess: data.materials_access,
  }
}

/**
 * Получение доступных тарифов из БД
 */
export async function getAvailablePlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase.from("subscription_plans").select("*")

  if (error) {
    console.error("Ошибка получения тарифов:", error.message)
    return []
  }

  return data.map((plan) => ({
    id: plan.id,
    name: plan.name,
    duration: plan.duration,
    price: plan.price,
    subjectCount: plan.subject_count,
    features: plan.features,
    accessLevel: plan.access_level,
    materialsAccess: plan.materials_access,
  }))
}

/**
 * Проверка доступа к материалам
 */
export function checkMaterialAccess(subscription: Subscription, materialDate: Date): boolean {
  if (!subscription.isActive) return false

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const materialMonth = materialDate.getMonth()
  const materialYear = materialDate.getFullYear()

  if (materialYear === currentYear && materialMonth === currentMonth) {
    return subscription.materialsAccess.currentMonth
  }

  if (materialDate < now) {
    return subscription.materialsAccess.previousMonths
  }

  if (materialYear === currentYear) {
    return subscription.materialsAccess.fullYear
  }

  return false
}

/**
 * Проверка доступа к функциям
 */
export function checkFeatureAccess(subscription: Subscription, feature: string): boolean {
  if (!subscription.isActive) return false

  const featureAccess: Record<AccessLevel, string[]> = {
    basic: ["view_materials", "basic_plan"],
    premium: ["view_materials", "basic_plan", "advanced_plan", "telegram_bot", "progress_tracking"],
    unlimited: [
      "view_materials",
      "basic_plan",
      "advanced_plan",
      "telegram_bot",
      "progress_tracking",
      "unlimited_plans",
      "priority_support",
    ],
  }

  return featureAccess[subscription.accessLevel].includes(feature)
}

/**
 * Проверка истечения подписки
 */
export function isSubscriptionExpiring(subscription: Subscription, daysThreshold = 7): boolean {
  const now = new Date()
  const daysUntilExpiry = Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return daysUntilExpiry <= daysThreshold && daysUntilExpiry > 0
}

/**
 * Форматирование даты окончания подписки
 */
export function formatSubscriptionEndDate(date: Date): string {
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Проверка доступа к предметам
 */
export function checkSubjectAccess(subscription: Subscription, requestedSubjects: number): boolean {
  if (!subscription.isActive) return false
  return requestedSubjects <= subscription.subjectCount
}

/**
 * Получение цены за количество предметов (fallback на случай отсутствия в БД)
 */
export function getPriceForSubjects(subjectCount: SubjectCount): number {
  const pricing = {
    1: 990,
    2: 1690,
    3: 2290,
    4: 2790,
  }
  return pricing[subjectCount]
}
