"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, ArrowLeft, Play, CheckCircle, Clock, FileText, Video, PenTool } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { MaterialAccessCheck } from "@/components/access-control/material-access-check"
import type { Material } from "@/lib/database"

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login")
      return
    }

    // Заглушка для загрузки материалов
    const loadMaterials = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockMaterials: Material[] = [
        {
          id: "mat_1",
          planId: "plan_1",
          title: "Основы алгебры",
          description: "Повторение базовых алгебраических операций и уравнений",
          content: "Содержимое урока...",
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
          description: "Изучение производных и их практическое применение",
          content: "Содержимое урока...",
          type: "lesson",
          difficulty: "medium",
          estimatedTime: 60,
          availableDate: new Date("2024-01-20"),
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
          availableDate: new Date("2024-01-22"),
          isCompleted: false,
        },
        {
          id: "mat_4",
          planId: "plan_1",
          title: "Видеоурок: Геометрия",
          description: "Видеоматериал по основам планиметрии",
          content: "Ссылка на видео...",
          type: "video",
          difficulty: "medium",
          estimatedTime: 40,
          availableDate: new Date("2024-02-01"),
          isCompleted: false,
        },
      ]

      setMaterials(mockMaterials)
      setLoading(false)
    }

    loadMaterials()
  }, [router])

  const getTypeIcon = (type: Material["type"]) => {
    switch (type) {
      case "lesson":
        return <BookOpen className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "test":
        return <PenTool className="h-4 w-4" />
      case "exercise":
        return <FileText className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: Material["type"]) => {
    switch (type) {
      case "lesson":
        return "Урок"
      case "video":
        return "Видео"
      case "test":
        return "Тест"
      case "exercise":
        return "Упражнение"
      default:
        return "Материал"
    }
  }

  const getDifficultyColor = (difficulty: Material["difficulty"]) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyLabel = (difficulty: Material["difficulty"]) => {
    switch (difficulty) {
      case "easy":
        return "Легкий"
      case "medium":
        return "Средний"
      case "hard":
        return "Сложный"
      default:
        return "Неизвестно"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const completedCount = materials.filter((m) => m.isCompleted).length
  const progressPercentage = materials.length > 0 ? (completedCount / materials.length) * 100 : 0

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
          <h1 className="text-3xl font-bold mb-2">Материалы для изучения</h1>
          <p className="text-muted-foreground">Ваши учебные материалы и задания</p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Общий прогресс</CardTitle>
            <CardDescription>
              Завершено {completedCount} из {materials.length} материалов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>0%</span>
              <span>{Math.round(progressPercentage)}%</span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>

        {/* Materials List */}
        <div className="space-y-4">
          {materials.map((material) => (
            <MaterialAccessCheck key={material.id} materialDate={material.availableDate} materialTitle={material.title}>
              <Card className={`transition-all hover:shadow-md ${material.isCompleted ? "bg-green-50" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        {getTypeIcon(material.type)}
                        {material.title}
                        {material.isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                      </CardTitle>
                      <CardDescription>{material.description}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant="outline">{getTypeLabel(material.type)}</Badge>
                      <Badge className={getDifficultyColor(material.difficulty)}>
                        {getDifficultyLabel(material.difficulty)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{material.estimatedTime} мин</span>
                      </div>
                      <div>Доступен с {material.availableDate.toLocaleDateString("ru-RU")}</div>
                      {material.completedAt && <div>Завершен {material.completedAt.toLocaleDateString("ru-RU")}</div>}
                    </div>
                    <div className="flex gap-2">
                      {material.isCompleted ? (
                        <Button variant="outline" size="sm">
                          Повторить
                        </Button>
                      ) : (
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          {material.type === "test" ? "Пройти тест" : "Начать изучение"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </MaterialAccessCheck>
          ))}
        </div>

        {materials.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Материалы не найдены</h3>
              <p className="text-muted-foreground mb-4">
                Создайте план подготовки, чтобы получить доступ к учебным материалам
              </p>
              <Button asChild>
                <Link href="/dashboard/create-plan">Создать план</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
