// Система контроля доступа и подписок

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

// Заглушка для получения подписки пользователя
export function getUserSubscription(userId: string): Subscription {
  // В реальном приложении данные будут из базы данных
  return {
    id: "sub_123",
    userId: userId,
    type: "monthly",
    accessLevel: "premium",
    subjectCount: 4 as SubjectCount,
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-02-15"),
    isActive: true,
    materialsAccess: {
      currentMonth: true,
      fullYear: false,
      previousMonths: true,
    },
  }
}

// Проверка доступа к материалам
export function checkMaterialAccess(subscription: Subscription, materialDate: Date): boolean {
  if (!subscription.isActive) return false

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const materialMonth = materialDate.getMonth()
  const materialYear = materialDate.getFullYear()

  // Проверяем доступ к текущему месяцу
  if (materialYear === currentYear && materialMonth === currentMonth) {
    return subscription.materialsAccess.currentMonth
  }

  // Проверяем доступ к предыдущим месяцам
  if (materialDate < now) {
    return subscription.materialsAccess.previousMonths
  }

  // Проверяем доступ к материалам на весь год
  if (materialYear === currentYear) {
    return subscription.materialsAccess.fullYear
  }

  return false
}

// Проверка доступа к функциям
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

// Получение доступных тарифов
export function getAvailablePlans() {
  return [
    {
      id: "free",
      name: "Бесплатный",
      price: 0,
      duration: "Навсегда",
      subjectCount: 1 as SubjectCount,
      features: ["1 предмет", "Базовый план подготовки", "Ограниченный доступ к материалам"],
      accessLevel: "basic" as AccessLevel,
      materialsAccess: {
        currentMonth: true,
        fullYear: false,
        previousMonths: false,
      },
    },
    {
      id: "monthly-1",
      name: "1 предмет",
      price: 990,
      duration: "1 месяц",
      subjectCount: 1 as SubjectCount,
      features: [
        "1 предмет ЕГЭ",
        "Персональный план подготовки",
        "Telegram бот с материалами",
        "Отслеживание прогресса",
        "Доступ к материалам текущего месяца",
      ],
      accessLevel: "premium" as AccessLevel,
      materialsAccess: {
        currentMonth: true,
        fullYear: false,
        previousMonths: true,
      },
    },
    {
      id: "monthly-2",
      name: "2 предмета",
      price: 1690,
      duration: "1 месяц",
      subjectCount: 2 as SubjectCount,
      features: [
        "2 предмета ЕГЭ",
        "Персональные планы подготовки",
        "Telegram бот с материалами",
        "Отслеживание прогресса",
        "Доступ к материалам текущего месяца",
      ],
      accessLevel: "premium" as AccessLevel,
      materialsAccess: {
        currentMonth: true,
        fullYear: false,
        previousMonths: true,
      },
    },
    {
      id: "monthly-3",
      name: "3 предмета",
      price: 2290,
      duration: "1 месяц",
      subjectCount: 3 as SubjectCount,
      features: [
        "3 предмета ЕГЭ",
        "Персональные планы подготовки",
        "Telegram бот с материалами",
        "Отслеживание прогресса",
        "Доступ к материалам текущего месяца",
      ],
      accessLevel: "premium" as AccessLevel,
      materialsAccess: {
        currentMonth: true,
        fullYear: false,
        previousMonths: true,
      },
    },
    {
      id: "monthly-4",
      name: "4 предмета",
      price: 2790,
      duration: "1 месяц",
      subjectCount: 4 as SubjectCount,
      features: [
        "4 предмета ЕГЭ",
        "Персональные планы подготовки",
        "Telegram бот с материалами",
        "Отслеживание прогресса",
        "Доступ к материалам текущего месяца",
        "Скидка 20% за комплексную подготовку",
      ],
      accessLevel: "unlimited" as AccessLevel,
      materialsAccess: {
        currentMonth: true,
        fullYear: false,
        previousMonths: true,
      },
    },
  ]
}

// Проверка истечения подписки
export function isSubscriptionExpiring(subscription: Subscription, daysThreshold = 7): boolean {
  const now = new Date()
  const daysUntilExpiry = Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return daysUntilExpiry <= daysThreshold && daysUntilExpiry > 0
}

// Форматирование даты окончания подписки
export function formatSubscriptionEndDate(date: Date): string {
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function checkSubjectAccess(subscription: Subscription, requestedSubjects: number): boolean {
  if (!subscription.isActive) return false
  return requestedSubjects <= subscription.subjectCount
}

export function getPriceForSubjects(subjectCount: SubjectCount): number {
  const pricing = {
    1: 990,
    2: 1690,
    3: 2290,
    4: 2790,
  }
  return pricing[subjectCount]
}
