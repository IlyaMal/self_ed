// Заглушки для работы с базой данных

export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  subscription?: Subscription
}

export interface StudyPlan {
  id: string
  userId: string
  subject: string
  targetScore: number
  duration: string
  currentLevel: string
  studyHours: number
  goals: string
  weakAreas: string
  progress: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Material {
  id: string
  planId: string
  title: string
  description: string
  content: string
  type: "lesson" | "exercise" | "test" | "video"
  difficulty: "easy" | "medium" | "hard"
  estimatedTime: number // в минутах
  availableDate: Date
  isCompleted: boolean
  completedAt?: Date
}

export interface Progress {
  id: string
  userId: string
  planId: string
  materialId: string
  status: "not_started" | "in_progress" | "completed"
  score?: number
  timeSpent: number // в минутах
  completedAt?: Date
}

export interface TelegramIntegration {
  id: string
  userId: string
  telegramUserId: string
  chatId: string
  isActive: boolean
  notificationSettings: {
    dailyReminders: boolean
    weeklyProgress: boolean
    newMaterials: boolean
  }
  connectedAt: Date
}

export interface Subscription {
  id: string
  userId: string
  type: "free" | "monthly" | "yearly"
  status: "active" | "expired" | "cancelled"
  startDate: Date
  endDate: Date
  paymentId?: string
}

// Заглушки для пользователей
const mockUsers: User[] = [
  {
    id: "1",
    email: "test@example.com",
    name: "Тестовый пользователь",
    createdAt: new Date("2024-01-15"),
  },
]

// Заглушки для планов обучения
const mockPlans: StudyPlan[] = [
  {
    id: "plan_1",
    userId: "1",
    subject: "Математика ЕГЭ",
    targetScore: 85,
    duration: "6 месяцев",
    currentLevel: "intermediate",
    studyHours: 2,
    goals: "Поступить в технический вуз",
    weakAreas: "Геометрия, производные",
    progress: 35,
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
  },
]

// Заглушки для материалов
const mockMaterials: Material[] = [
  {
    id: "mat_1",
    planId: "plan_1",
    title: "Основы алгебры",
    description: "Повторение базовых алгебраических операций",
    content: "Содержимое урока по алгебре...",
    type: "lesson",
    difficulty: "easy",
    estimatedTime: 45,
    availableDate: new Date("2024-01-16"),
    isCompleted: true,
    completedAt: new Date("2024-01-17"),
  },
  {
    id: "mat_2",
    planId: "plan_1",
    title: "Производные функций",
    description: "Изучение производных и их применение",
    content: "Содержимое урока по производным...",
    type: "lesson",
    difficulty: "medium",
    estimatedTime: 60,
    availableDate: new Date("2024-01-18"),
    isCompleted: false,
  },
  {
    id: "mat_3",
    planId: "plan_1",
    title: "Тест по алгебре",
    description: "Проверочный тест по пройденному материалу",
    content: "Вопросы теста...",
    type: "test",
    difficulty: "medium",
    estimatedTime: 30,
    availableDate: new Date("2024-01-20"),
    isCompleted: false,
  },
]

// Заглушки для прогресса
const mockProgress: Progress[] = [
  {
    id: "prog_1",
    userId: "1",
    planId: "plan_1",
    materialId: "mat_1",
    status: "completed",
    score: 85,
    timeSpent: 50,
    completedAt: new Date("2024-01-17"),
  },
  {
    id: "prog_2",
    userId: "1",
    planId: "plan_1",
    materialId: "mat_2",
    status: "in_progress",
    timeSpent: 25,
  },
]

// API функции для работы с пользователями
export async function getUserById(id: string): Promise<User | null> {
  // Имитация задержки сети
  await new Promise((resolve) => setTimeout(resolve, 100))
  return mockUsers.find((user) => user.id === id) || null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return mockUsers.find((user) => user.email === email) || null
}

export async function createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const newUser: User = {
    ...userData,
    id: `user_${Date.now()}`,
    createdAt: new Date(),
  }
  mockUsers.push(newUser)
  return newUser
}

// API функции для работы с планами обучения
export async function getUserPlans(userId: string): Promise<StudyPlan[]> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  return mockPlans.filter((plan) => plan.userId === userId)
}

export async function getPlanById(id: string): Promise<StudyPlan | null> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return mockPlans.find((plan) => plan.id === id) || null
}

export async function createPlan(planData: Omit<StudyPlan, "id" | "createdAt" | "updatedAt">): Promise<StudyPlan> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const newPlan: StudyPlan = {
    ...planData,
    id: `plan_${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  mockPlans.push(newPlan)
  return newPlan
}

export async function updatePlan(id: string, updates: Partial<StudyPlan>): Promise<StudyPlan | null> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const planIndex = mockPlans.findIndex((plan) => plan.id === id)
  if (planIndex === -1) return null

  mockPlans[planIndex] = {
    ...mockPlans[planIndex],
    ...updates,
    updatedAt: new Date(),
  }
  return mockPlans[planIndex]
}

// API функции для работы с материалами
export async function getPlanMaterials(planId: string): Promise<Material[]> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  return mockMaterials.filter((material) => material.planId === planId)
}

export async function getMaterialById(id: string): Promise<Material | null> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return mockMaterials.find((material) => material.id === id) || null
}

export async function getAvailableMaterials(planId: string, userSubscription: Subscription): Promise<Material[]> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  const materials = mockMaterials.filter((material) => material.planId === planId)

  // Фильтруем материалы по подписке
  return materials.filter((material) => {
    const now = new Date()
    const materialMonth = material.availableDate.getMonth()
    const currentMonth = now.getMonth()

    if (userSubscription.type === "yearly") return true
    if (userSubscription.type === "monthly") {
      return materialMonth <= currentMonth
    }
    return materialMonth === currentMonth // free tier
  })
}

export async function markMaterialCompleted(
  userId: string,
  materialId: string,
  score?: number,
): Promise<Progress | null> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const material = mockMaterials.find((m) => m.id === materialId)
  if (!material) return null

  // Обновляем материал
  material.isCompleted = true
  material.completedAt = new Date()

  // Создаем или обновляем прогресс
  const existingProgress = mockProgress.find((p) => p.materialId === materialId && p.userId === userId)

  if (existingProgress) {
    existingProgress.status = "completed"
    existingProgress.score = score
    existingProgress.completedAt = new Date()
    return existingProgress
  } else {
    const newProgress: Progress = {
      id: `prog_${Date.now()}`,
      userId,
      planId: material.planId,
      materialId,
      status: "completed",
      score,
      timeSpent: material.estimatedTime,
      completedAt: new Date(),
    }
    mockProgress.push(newProgress)
    return newProgress
  }
}

// API функции для работы с прогрессом
export async function getUserProgress(userId: string, planId: string): Promise<Progress[]> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  return mockProgress.filter((progress) => progress.userId === userId && progress.planId === planId)
}

export async function updateProgress(
  userId: string,
  materialId: string,
  updates: Partial<Progress>,
): Promise<Progress | null> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  const progressIndex = mockProgress.findIndex((p) => p.userId === userId && p.materialId === materialId)

  if (progressIndex === -1) {
    // Создаем новый прогресс
    const material = mockMaterials.find((m) => m.id === materialId)
    if (!material) return null

    const newProgress: Progress = {
      id: `prog_${Date.now()}`,
      userId,
      planId: material.planId,
      materialId,
      status: "not_started",
      timeSpent: 0,
      ...updates,
    }
    mockProgress.push(newProgress)
    return newProgress
  } else {
    mockProgress[progressIndex] = {
      ...mockProgress[progressIndex],
      ...updates,
    }
    return mockProgress[progressIndex]
  }
}

// API функции для Telegram интеграции
export async function getTelegramIntegration(userId: string): Promise<TelegramIntegration | null> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  // Заглушка - возвращаем null (не подключен)
  return null
}

export async function createTelegramIntegration(
  integrationData: Omit<TelegramIntegration, "id" | "connectedAt">,
): Promise<TelegramIntegration> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return {
    ...integrationData,
    id: `tg_${Date.now()}`,
    connectedAt: new Date(),
  }
}

// API функции для подписок
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  // Заглушка для активной месячной подписки
  return {
    id: `sub_${userId}`,
    userId,
    type: "monthly",
    status: "active",
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-02-15"),
  }
}

export async function createSubscription(subscriptionData: Omit<Subscription, "id">): Promise<Subscription> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return {
    ...subscriptionData,
    id: `sub_${Date.now()}`,
  }
}

export async function updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | null> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  // Заглушка - возвращаем обновленную подписку
  const subscription = await getUserSubscription(updates.userId || "")
  if (!subscription) return null

  return {
    ...subscription,
    ...updates,
  }
}

// Функции для статистики и аналитики
export async function getUserStats(userId: string): Promise<{
  totalPlans: number
  activePlans: number
  completedMaterials: number
  totalTimeSpent: number
  averageScore: number
}> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const userPlans = await getUserPlans(userId)
  const userProgress = mockProgress.filter((p) => p.userId === userId)

  const completedMaterials = userProgress.filter((p) => p.status === "completed").length
  const totalTimeSpent = userProgress.reduce((sum, p) => sum + p.timeSpent, 0)
  const completedWithScores = userProgress.filter((p) => p.status === "completed" && p.score !== undefined)
  const averageScore =
    completedWithScores.length > 0
      ? completedWithScores.reduce((sum, p) => sum + (p.score || 0), 0) / completedWithScores.length
      : 0

  return {
    totalPlans: userPlans.length,
    activePlans: userPlans.filter((p) => p.isActive).length,
    completedMaterials,
    totalTimeSpent,
    averageScore: Math.round(averageScore),
  }
}

// Функция для генерации материалов на основе плана (заглушка для ИИ)
export async function generatePlanMaterials(plan: StudyPlan): Promise<Material[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Имитация работы ИИ

  const subjects: Record<string, string[]> = {
    math: ["Алгебра", "Геометрия", "Тригонометрия", "Производные", "Интегралы"],
    russian: ["Орфография", "Пунктуация", "Синтаксис", "Стилистика", "Литература"],
    physics: ["Механика", "Термодинамика", "Электричество", "Оптика", "Атомная физика"],
  }

  const topics = subjects[plan.subject.toLowerCase()] || subjects.math
  const materials: Material[] = []

  topics.forEach((topic, index) => {
    // Урок
    materials.push({
      id: `mat_${plan.id}_${index * 2 + 1}`,
      planId: plan.id,
      title: `Урок: ${topic}`,
      description: `Изучение основ темы "${topic}"`,
      content: `Подробное содержание урока по теме ${topic}...`,
      type: "lesson",
      difficulty: index < 2 ? "easy" : index < 4 ? "medium" : "hard",
      estimatedTime: 45 + index * 15,
      availableDate: new Date(Date.now() + index * 7 * 24 * 60 * 60 * 1000), // каждую неделю
      isCompleted: false,
    })

    // Тест
    materials.push({
      id: `mat_${plan.id}_${index * 2 + 2}`,
      planId: plan.id,
      title: `Тест: ${topic}`,
      description: `Проверочный тест по теме "${topic}"`,
      content: `Вопросы теста по теме ${topic}...`,
      type: "test",
      difficulty: index < 2 ? "easy" : index < 4 ? "medium" : "hard",
      estimatedTime: 30,
      availableDate: new Date(Date.now() + (index * 7 + 3) * 24 * 60 * 60 * 1000), // через 3 дня после урока
      isCompleted: false,
    })
  })

  return materials
}
