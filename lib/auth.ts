// Заглушки для работы с аутентификацией

export interface User {
  id: string
  email: string
  name: string
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export function getUserData(): User | null {
  if (typeof window === "undefined") return null
  const userData = localStorage.getItem("user_data")
  return userData ? JSON.parse(userData) : null
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null
}

export function logout(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("auth_token")
  localStorage.removeItem("user_data")
}

// Заглушка для проверки доступа по подписке
export function hasActiveSubscription(): boolean {
  // В реальном приложении здесь будет проверка подписки
  return true
}

export function getSubscriptionType(): "monthly" | "yearly" | null {
  // Заглушка - в реальном приложении данные будут из БД
  return "monthly"
}

export function getSubscriptionEndDate(): Date | null {
  // Заглушка - возвращаем дату через месяц
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 1)
  return endDate
}
