import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Target, Users, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">EduPrep</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Возможности
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Тарифы
            </Link>
            <Link href="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Войти
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            Персональная подготовка
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Подготовьтесь к экзаменам с <span className="text-primary">персональным планом</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Создайте индивидуальный план подготовки, получайте материалы через Telegram бота и отслеживайте свой
            прогресс в личном кабинете.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="#demo-plan">
                Попробовать бесплатно
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent" asChild>
              <Link href="#features">Узнать больше</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Как работает платформа</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Простой и эффективный процесс подготовки к экзаменам
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Персональный план</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Создайте индивидуальный план подготовки на основе ваших целей и временных рамок
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Материалы</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Получайте необходимые материалы и задания через Telegram бота каждый день
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Контроль времени</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Доступ к материалам по месяцам или до конца учебного года</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Личный кабинет</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Отслеживайте прогресс и управляйте своим планом в удобном интерфейсе</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Plan Section */}
      <section id="demo-plan" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Пример плана подготовки</h2>
            <p className="text-xl text-muted-foreground">Посмотрите, как может выглядеть ваш персональный план</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                План подготовки к ЕГЭ по математике
              </CardTitle>
              <CardDescription>Срок подготовки: 6 месяцев | Целевой балл: 80+</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Неделя 1-2: Алгебра</h4>
                    <p className="text-muted-foreground">Повторение основ алгебры, решение уравнений</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Неделя 3-4: Геометрия</h4>
                    <p className="text-muted-foreground">Планиметрия, основные теоремы и формулы</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 border-2 border-muted rounded-full mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Неделя 5-6: Функции</h4>
                    <p className="text-muted-foreground">Исследование функций, производные</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 border-2 border-muted rounded-full mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Неделя 7-8: Стереометрия</h4>
                    <p className="text-muted-foreground">Объемы тел, площади поверхностей</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Это только часть плана. Хотите увидеть полное расписание и получить к нему доступ?
            </p>
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/auth/register">
                Составить полное расписание
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">EduPrep</span>
          </div>
          <p className="text-muted-foreground">Персональная подготовка к экзаменам с поддержкой ИИ</p>
        </div>
      </footer>
    </div>
  )
}
