"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, ArrowLeft, Target, Calendar, Loader2, CheckSquare } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"

const AVAILABLE_SUBJECTS = [
  { id: "math", name: "Математика (профиль)", enabled: true },
  { id: "russian", name: "Русский язык", enabled: true },
  { id: "physics", name: "Физика", enabled: true },
  { id: "chemistry", name: "Химия", enabled: true },
  { id: "biology", name: "Биология", enabled: false },
  { id: "history", name: "История", enabled: true },
  { id: "social", name: "Обществознание", enabled: true },
  { id: "english", name: "Английский язык", enabled: false },
]

const EGE_TASKS_FROM_ADMIN = {
  math: [
    {
      id: 1,
      name: "Простейшие текстовые задачи",
      theory: ["https://example.com/math/task1/theory1", "https://example.com/math/task1/theory2"],
      practice: ["https://example.com/math/task1/practice1", "https://example.com/math/task1/practice2"],
    },
    {
      id: 2,
      name: "Чтение графиков и диаграмм",
      theory: ["https://example.com/math/task2/theory"],
      practice: ["https://example.com/math/task2/practice"],
    },
    {
      id: 3,
      name: "Простейшие уравнения",
      theory: [],
      practice: [],
    },
    {
      id: 4,
      name: "Преобразования выражений",
      theory: ["https://example.com/math/task4/theory"],
      practice: [],
    },
    {
      id: 5,
      name: "Простейшие текстовые задачи",
      theory: [],
      practice: ["https://example.com/math/task5/practice"],
    },
    { id: 6, name: "Планиметрия", theory: [], practice: [] },
    { id: 7, name: "Производная и первообразная", theory: [], practice: [] },
    { id: 8, name: "Стереометрия", theory: [], practice: [] },
    { id: 9, name: "Вычисления и преобразования", theory: [], practice: [] },
    { id: 10, name: "Задачи с прикладным содержанием", theory: [], practice: [] },
    { id: 11, name: "Текстовые задачи", theory: [], practice: [] },
    { id: 12, name: "Наибольшее и наименьшее значение функций", theory: [], practice: [] },
  ],
  russian: [
    {
      id: 1,
      name: "Информационная обработка текстов",
      theory: ["https://example.com/russian/task1/theory"],
      practice: ["https://example.com/russian/task1/practice"],
    },
    {
      id: 2,
      name: "Средства связи предложений в тексте",
      theory: [],
      practice: ["https://example.com/russian/task2/practice"],
    },
    {
      id: 3,
      name: "Лексическое значение слова",
      theory: ["https://example.com/russian/task3/theory"],
      practice: [],
    },
    { id: 4, name: "Орфоэпические нормы", theory: [], practice: [] },
    { id: 5, name: "Лексические нормы", theory: [], practice: [] },
    { id: 6, name: "Лексические нормы", theory: [], practice: [] },
    { id: 7, name: "Морфологические нормы", theory: [], practice: [] },
    { id: 8, name: "Синтаксические нормы", theory: [], practice: [] },
    { id: 9, name: "Правописание корней", theory: [], practice: [] },
    { id: 10, name: "Правописание приставок", theory: [], practice: [] },
    { id: 11, name: "Правописание суффиксов", theory: [], practice: [] },
    {
      id: 12,
      name: "Правописание личных окончаний глаголов и суффиксов причастий",
      theory: [],
      practice: [],
    },
  ],
  physics: [
    {
      id: 1,
      name: "Равномерное прямолинейное движение",
      theory: ["https://example.com/physics/task1/theory"],
      practice: ["https://example.com/physics/task1/practice"],
    },
    { id: 2, name: "Законы Ньютона", theory: [], practice: [] },
    {
      id: 3,
      name: "Закон сохранения импульса",
      theory: ["https://example.com/physics/task3/theory"],
      practice: ["https://example.com/physics/task3/practice"],
    },
    { id: 4, name: "Закон сохранения энергии", theory: [], practice: [] },
    { id: 5, name: "Механические колебания и волны", theory: [], practice: [] },
    { id: 6, name: "Молекулярная физика", theory: [], practice: [] },
    { id: 7, name: "Термодинамика", theory: [], practice: [] },
    { id: 8, name: "Электростатика", theory: [], practice: [] },
    { id: 9, name: "Законы постоянного тока", theory: [], practice: [] },
    { id: 10, name: "Магнитное поле", theory: [], practice: [] },
    { id: 11, name: "Электромагнитная индукция", theory: [], practice: [] },
    { id: 12, name: "Элементы СТО", theory: [], practice: [] },
  ],
}

export default function CreatePlanPage() {
  const [formData, setFormData] = useState({
    subject: "",
    targetScore: [75],
    duration: "",
    studyHours: [2],
    goals: "",
    notes: "",
    knownTasks: [] as number[],
    unknownTasks: [] as number[],
    taskSelectionType: "both" as "known" | "unknown" | "both",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login")
    }
  }, [router])

  const getTasksForSubject = () => {
    return EGE_TASKS_FROM_ADMIN[formData.subject as keyof typeof EGE_TASKS_FROM_ADMIN] || []
  }

  const getAvailableSubjects = () => {
    return AVAILABLE_SUBJECTS.filter((subject) => subject.enabled)
  }

  const handleTaskToggle = (taskId: number, type: "known" | "unknown") => {
    if (type === "known") {
      setFormData((prev) => ({
        ...prev,
        knownTasks: prev.knownTasks.includes(taskId)
          ? prev.knownTasks.filter((id) => id !== taskId)
          : [...prev.knownTasks, taskId],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        unknownTasks: prev.unknownTasks.includes(taskId)
          ? prev.unknownTasks.filter((id) => id !== taskId)
          : [...prev.unknownTasks, taskId],
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newPlan = {
        id: Date.now().toString(),
        subject: formData.subject,
        targetScore: formData.targetScore[0],
        duration: formData.duration,
        studyHours: formData.studyHours[0],
        goals: formData.goals,
        notes: formData.notes,
        knownTasks: formData.knownTasks,
        unknownTasks: formData.unknownTasks,
        taskSelectionType: formData.taskSelectionType,
        createdAt: new Date().toISOString(),
        progress: 0,
        weeklySchedule: generateWeeklySchedule(formData), // Заглушка алгоритма
      }

      const existingPlans = JSON.parse(localStorage.getItem("user_plans") || "[]")
      existingPlans.push(newPlan)
      localStorage.setItem("user_plans", JSON.stringify(existingPlans))

      router.push("/dashboard")
    } catch (err) {
      setError("Произошла ошибка при создании плана")
    } finally {
      setIsLoading(false)
    }
  }

  const generateWeeklySchedule = (data: any) => {
    const weeks = []
    const totalWeeks =
      data.duration === "1month" ? 4 : data.duration === "3months" ? 12 : data.duration === "6months" ? 24 : 48

    const subjectTasks = getTasksForSubject()
    const focusTasks = data.unknownTasks.length > 0 ? data.unknownTasks : data.knownTasks

    for (let i = 1; i <= totalWeeks; i++) {
      const weekTasks = focusTasks.slice((i - 1) * 2, i * 2) // По 2 задания на неделю
      const taskDetails = weekTasks.map((taskId) => subjectTasks.find((t) => t.id === taskId)).filter(Boolean)

      const theoryLinks = []
      const practiceLinks = []

      taskDetails.forEach((task) => {
        task.theory.forEach((link, index) => {
          if (link) {
            theoryLinks.push({
              name: `Теория: ${task.name} (часть ${index + 1})`,
              url: link,
            })
          }
        })

        task.practice.forEach((link, index) => {
          if (link) {
            practiceLinks.push({
              name: `Практика: ${task.name} (часть ${index + 1})`,
              url: link,
            })
          }
        })
      })

      weeks.push({
        week: i,
        unlocked: i === 1, // Только первая неделя открыта
        theory: theoryLinks,
        practice: practiceLinks,
        tasks: weekTasks,
        taskNames: taskDetails.map((t) => t.name),
      })
    }
    return weeks
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
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к кабинету
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Создание плана подготовки к ЕГЭ</h1>
          <p className="text-muted-foreground">
            Заполните информацию о ваших целях и знаниях для создания персонального плана подготовки
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Основная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Предмет ЕГЭ</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subject: value, knownTasks: [], unknownTasks: [] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите предмет" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableSubjects().map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Целевой балл ЕГЭ: {formData.targetScore[0]}</Label>
                <Slider
                  value={formData.targetScore}
                  onValueChange={(value) => setFormData({ ...formData, targetScore: value })}
                  max={100}
                  min={40}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>40 (мин. балл)</span>
                  <span>70 (хороший)</span>
                  <span>100 (максимум)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Время до ЕГЭ</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) => setFormData({ ...formData, duration: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите срок" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">1 месяц</SelectItem>
                    <SelectItem value="3months">3 месяца</SelectItem>
                    <SelectItem value="6months">6 месяцев</SelectItem>
                    <SelectItem value="1year">1 год</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Часов в день для подготовки: {formData.studyHours[0]}</Label>
                <Slider
                  value={formData.studyHours}
                  onValueChange={(value) => setFormData({ ...formData, studyHours: value })}
                  max={8}
                  min={1}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 час</span>
                  <span>4 часа</span>
                  <span>8 часов</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {formData.subject && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  Выбор заданий ЕГЭ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Что вы хотите указать?</Label>
                  <Select
                    value={formData.taskSelectionType}
                    onValueChange={(value: "known" | "unknown" | "both") =>
                      setFormData({ ...formData, taskSelectionType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="known">Задания, которые я знаю хорошо</SelectItem>
                      <SelectItem value="unknown">Задания, которые не знаю</SelectItem>
                      <SelectItem value="both">И то, и другое</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(formData.taskSelectionType === "known" || formData.taskSelectionType === "both") && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-green-700">Задания, которые вы знаете хорошо:</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {getTasksForSubject().map((task) => (
                        <div key={`known-${task.id}`} className="flex items-center space-x-2">
                          <Checkbox
                            id={`known-${task.id}`}
                            checked={formData.knownTasks.includes(task.id)}
                            onCheckedChange={() => handleTaskToggle(task.id, "known")}
                          />
                          <Label htmlFor={`known-${task.id}`} className="text-sm">
                            {task.id}. {task.name}
                            {(task.theory.length > 0 || task.practice.length > 0) && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                {task.theory.length > 0 &&
                                  `📖${task.theory.length > 1 ? `(${task.theory.length})` : ""}`}
                                {task.practice.length > 0 &&
                                  `📝${task.practice.length > 1 ? `(${task.practice.length})` : ""}`}
                              </span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(formData.taskSelectionType === "unknown" || formData.taskSelectionType === "both") && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-red-700">Задания, которые вызывают трудности:</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {getTasksForSubject().map((task) => (
                        <div key={`unknown-${task.id}`} className="flex items-center space-x-2">
                          <Checkbox
                            id={`unknown-${task.id}`}
                            checked={formData.unknownTasks.includes(task.id)}
                            onCheckedChange={() => handleTaskToggle(task.id, "unknown")}
                          />
                          <Label htmlFor={`unknown-${task.id}`} className="text-sm">
                            {task.id}. {task.name}
                            {(task.theory.length > 0 || task.practice.length > 0) && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                {task.theory.length > 0 &&
                                  `📖${task.theory.length > 1 ? `(${task.theory.length})` : ""}`}
                                {task.practice.length > 0 &&
                                  `📝${task.practice.length > 1 ? `(${task.practice.length})` : ""}`}
                              </span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Alert>
                  <AlertDescription className="text-sm">
                    📖 - доступна теория, 📝 - доступна практика. Материалы будут включены в ваш еженедельный план.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Дополнительная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goals">Цели подготовки</Label>
                <Textarea
                  id="goals"
                  placeholder="Например: поступить в МГУ на бюджет, получить 90+ баллов..."
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Примечания</Label>
                <Textarea
                  id="notes"
                  placeholder="Дополнительные пожелания, особенности подготовки..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button type="button" variant="outline" className="flex-1 bg-transparent" asChild>
              <Link href="/dashboard">Отмена</Link>
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Создание плана...
                </>
              ) : (
                "Создать план подготовки"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
