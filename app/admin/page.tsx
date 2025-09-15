"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, BookOpen, Settings, Search, Crown, Clock, FileText, LinkIcon, Plus, Trash2, Edit } from "lucide-react"
import Link from "next/link"

const MOCK_USERS = [
  {
    id: "1",
    name: "Анна Петрова",
    email: "anna@example.com",
    subscription: {
      type: "monthly",
      status: "active",
      expiresAt: "2024-02-15",
      subjects: ["math", "physics"],
    },
    plan: {
      subject: "math",
      targetScore: 85,
      progress: 45,
    },
  },
  {
    id: "2",
    name: "Михаил Иванов",
    email: "mikhail@example.com",
    subscription: {
      type: "yearly",
      status: "active",
      expiresAt: "2024-12-31",
      subjects: ["russian", "history", "social"],
    },
    plan: {
      subject: "russian",
      targetScore: 92,
      progress: 78,
    },
  },
  {
    id: "3",
    name: "Елена Сидорова",
    email: "elena@example.com",
    subscription: {
      type: "monthly",
      status: "expired",
      expiresAt: "2024-01-10",
      subjects: ["chemistry", "biology"],
    },
    plan: {
      subject: "chemistry",
      targetScore: 75,
      progress: 23,
    },
  },
]

const AVAILABLE_SUBJECTS = [
  { id: "math", name: "Математика", enabled: true },
  { id: "russian", name: "Русский язык", enabled: true },
  { id: "physics", name: "Физика", enabled: true },
  { id: "chemistry", name: "Химия", enabled: true },
  { id: "biology", name: "Биология", enabled: false },
  { id: "history", name: "История", enabled: true },
  { id: "social", name: "Обществознание", enabled: true },
  { id: "english", name: "Английский язык", enabled: false },
]

const MOCK_EGE_TASKS = {
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
  ],
  physics: [
    {
      id: 1,
      name: "Равномерное прямолинейное движение",
      theory: ["https://example.com/physics/task1/theory"],
      practice: ["https://example.com/physics/task1/practice"],
    },
    {
      id: 2,
      name: "Законы Ньютона",
      theory: [],
      practice: [],
    },
    {
      id: 3,
      name: "Закон сохранения импульса",
      theory: ["https://example.com/physics/task3/theory"],
      practice: ["https://example.com/physics/task3/practice"],
    },
  ],
}

export default function AdminPage() {
  const [users, setUsers] = useState(MOCK_USERS)
  const [subjects, setSubjects] = useState(AVAILABLE_SUBJECTS)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [egeTasks, setEgeTasks] = useState(MOCK_EGE_TASKS)
  const [selectedSubject, setSelectedSubject] = useState("math")
  const [editingTask, setEditingTask] = useState<{
    id: number
    field: "theory" | "practice" | "name"
    value: string
    linkIndex?: number
  } | null>(null)
  const [newTaskName, setNewTaskName] = useState("")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || user.subscription.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleExtendSubscription = (userId: string, months: number) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          const currentDate = new Date(user.subscription.expiresAt)
          const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + months))
          return {
            ...user,
            subscription: {
              ...user.subscription,
              status: "active",
              expiresAt: newDate.toISOString().split("T")[0],
            },
          }
        }
        return user
      }),
    )
  }

  const handleToggleSubject = (subjectId: string) => {
    setSubjects((prev) =>
      prev.map((subject) => (subject.id === subjectId ? { ...subject, enabled: !subject.enabled } : subject)),
    )
  }

  const handleUpdateTaskMaterial = (
    subjectId: string,
    taskId: number,
    field: "theory" | "practice" | "name",
    value: string,
    linkIndex?: number,
  ) => {
    setEgeTasks((prev) => ({
      ...prev,
      [subjectId]:
        prev[subjectId as keyof typeof prev]?.map((task) => {
          if (task.id === taskId) {
            if (field === "name") {
              return { ...task, name: value }
            } else if (linkIndex !== undefined) {
              const updatedLinks = [...task[field]]
              updatedLinks[linkIndex] = value
              return { ...task, [field]: updatedLinks }
            }
          }
          return task
        }) || [],
    }))
    setEditingTask(null)
  }

  const handleStartEditing = (
    taskId: number,
    field: "theory" | "practice" | "name",
    currentValue: string,
    linkIndex?: number,
  ) => {
    setEditingTask({ id: taskId, field, value: currentValue, linkIndex })
  }

  const handleCancelEditing = () => {
    setEditingTask(null)
  }

  const handleAddTask = () => {
    if (!newTaskName.trim()) return

    const currentTasks = egeTasks[selectedSubject as keyof typeof egeTasks] || []
    const newId = Math.max(...currentTasks.map((t) => t.id), 0) + 1

    setEgeTasks((prev) => ({
      ...prev,
      [selectedSubject]: [
        ...currentTasks,
        {
          id: newId,
          name: newTaskName.trim(),
          theory: [],
          practice: [],
        },
      ],
    }))
    setNewTaskName("")
  }

  const handleDeleteTask = (taskId: number) => {
    setEgeTasks((prev) => ({
      ...prev,
      [selectedSubject]: prev[selectedSubject as keyof typeof prev]?.filter((task) => task.id !== taskId) || [],
    }))
  }

  const handleAddLink = (taskId: number, field: "theory" | "practice") => {
    setEgeTasks((prev) => ({
      ...prev,
      [selectedSubject]:
        prev[selectedSubject as keyof typeof prev]?.map((task) => {
          if (task.id === taskId) {
            return { ...task, [field]: [...task[field], ""] }
          }
          return task
        }) || [],
    }))
  }

  const handleDeleteLink = (taskId: number, field: "theory" | "practice", linkIndex: number) => {
    setEgeTasks((prev) => ({
      ...prev,
      [selectedSubject]:
        prev[selectedSubject as keyof typeof prev]?.map((task) => {
          if (task.id === taskId) {
            const updatedLinks = task[field].filter((_, index) => index !== linkIndex)
            return { ...task, [field]: updatedLinks }
          }
          return task
        }) || [],
    }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Активна</Badge>
      case "expired":
        return <Badge variant="destructive">Истекла</Badge>
      default:
        return <Badge variant="secondary">Неизвестно</Badge>
    }
  }

  const getSubscriptionTypeBadge = (type: string) => {
    switch (type) {
      case "monthly":
        return <Badge variant="outline">Месячная</Badge>
      case "yearly":
        return (
          <Badge className="bg-primary text-primary-foreground">
            <Crown className="w-3 h-3 mr-1" />
            Годовая
          </Badge>
        )
      default:
        return <Badge variant="secondary">Неизвестно</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Админ-панель EGE Prep</h1>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">К платформе</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">+2 за последний месяц</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные подписки</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter((u) => u.subscription.status === "active").length}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((users.filter((u) => u.subscription.status === "active").length / users.length) * 100)}% от
                общего числа
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Доступные предметы</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjects.filter((s) => s.enabled).length}</div>
              <p className="text-xs text-muted-foreground">из {subjects.length} всего</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Истекающие подписки</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {
                  users.filter((u) => {
                    const expiresAt = new Date(u.subscription.expiresAt)
                    const inWeek = new Date()
                    inWeek.setDate(inWeek.getDate() + 7)
                    return expiresAt <= inWeek && u.subscription.status === "active"
                  }).length
                }
              </div>
              <p className="text-xs text-muted-foreground">в течение недели</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Предметы
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Задания ЕГЭ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Управление пользователями
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Поиск по имени или email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="active">Активные</SelectItem>
                      <SelectItem value="expired">Истекшие</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Пользователь</TableHead>
                        <TableHead>Подписка</TableHead>
                        <TableHead>Предметы</TableHead>
                        <TableHead>Прогресс</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {getStatusBadge(user.subscription.status)}
                              {getSubscriptionTypeBadge(user.subscription.type)}
                              <div className="text-xs text-muted-foreground">до {user.subscription.expiresAt}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.subscription.subjects.map((subject) => (
                                <Badge key={subject} variant="outline" className="text-xs">
                                  {subjects.find((s) => s.id === subject)?.name || subject}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">{user.plan.subject}</div>
                              <div className="text-xs text-muted-foreground">
                                {user.plan.progress}% • цель: {user.plan.targetScore}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleExtendSubscription(user.id, 1)}>
                                +1 мес
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleExtendSubscription(user.id, 12)}>
                                +1 год
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Управление предметами
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{subject.name}</div>
                        <div className="text-sm text-muted-foreground">{subject.enabled ? "Доступен" : "Отключен"}</div>
                      </div>
                      <Switch checked={subject.enabled} onCheckedChange={() => handleToggleSubject(subject.id)} />
                    </div>
                  ))}
                </div>

                <Alert className="mt-4">
                  <AlertDescription>
                    Отключенные предметы не будут доступны для выбора при создании новых планов.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Управление заданиями ЕГЭ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Выберите предмет:</label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects
                          .filter((s) => s.enabled)
                          .map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 p-4 bg-muted rounded-lg">
                    <Input
                      placeholder="Название нового задания..."
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleAddTask} disabled={!newTaskName.trim()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить задание
                    </Button>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>№</TableHead>
                          <TableHead>Название задания</TableHead>
                          <TableHead>Теория</TableHead>
                          <TableHead>Практика</TableHead>
                          <TableHead>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(egeTasks[selectedSubject as keyof typeof egeTasks] || []).map((task) => (
                          <TableRow key={task.id}>
                            <TableCell className="font-medium">{task.id}</TableCell>
                            <TableCell>
                              {editingTask?.id === task.id && editingTask.field === "name" ? (
                                <div className="flex gap-2">
                                  <Input
                                    value={editingTask.value}
                                    onChange={(e) => setEditingTask({ ...editingTask, value: e.target.value })}
                                    className="flex-1"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateTaskMaterial(selectedSubject, task.id, "name", editingTask.value)
                                    }
                                  >
                                    ✓
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={handleCancelEditing}>
                                    ✕
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span>{task.name}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleStartEditing(task.id, "name", task.name)}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                {task.theory.map((link, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    {editingTask?.id === task.id &&
                                    editingTask.field === "theory" &&
                                    editingTask.linkIndex === index ? (
                                      <div className="flex gap-2 flex-1">
                                        <Input
                                          value={editingTask.value}
                                          onChange={(e) => setEditingTask({ ...editingTask, value: e.target.value })}
                                          placeholder="Ссылка на теорию"
                                          className="flex-1"
                                        />
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            handleUpdateTaskMaterial(
                                              selectedSubject,
                                              task.id,
                                              "theory",
                                              editingTask.value,
                                              index,
                                            )
                                          }
                                        >
                                          ✓
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={handleCancelEditing}>
                                          ✕
                                        </Button>
                                      </div>
                                    ) : (
                                      <>
                                        <Badge variant="outline" className="text-green-700 bg-green-50">
                                          <LinkIcon className="w-3 h-3 mr-1" />
                                          Теория {index + 1}
                                        </Badge>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleStartEditing(task.id, "theory", link, index)}
                                        >
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleDeleteLink(task.id, "theory", index)}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                ))}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAddLink(task.id, "theory")}
                                  className="w-full"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Добавить ссылку на теорию
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                {task.practice.map((link, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    {editingTask?.id === task.id &&
                                    editingTask.field === "practice" &&
                                    editingTask.linkIndex === index ? (
                                      <div className="flex gap-2 flex-1">
                                        <Input
                                          value={editingTask.value}
                                          onChange={(e) => setEditingTask({ ...editingTask, value: e.target.value })}
                                          placeholder="Ссылка на практику"
                                          className="flex-1"
                                        />
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            handleUpdateTaskMaterial(
                                              selectedSubject,
                                              task.id,
                                              "practice",
                                              editingTask.value,
                                              index,
                                            )
                                          }
                                        >
                                          ✓
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={handleCancelEditing}>
                                          ✕
                                        </Button>
                                      </div>
                                    ) : (
                                      <>
                                        <Badge variant="outline" className="text-blue-700 bg-blue-50">
                                          <LinkIcon className="w-3 h-3 mr-1" />
                                          Практика {index + 1}
                                        </Badge>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleStartEditing(task.id, "practice", link, index)}
                                        >
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleDeleteLink(task.id, "practice", index)}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                ))}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAddLink(task.id, "practice")}
                                  className="w-full"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Добавить ссылку на практику
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteTask(task.id)}>
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Удалить
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <Alert>
                    <AlertDescription>
                      Здесь вы можете управлять заданиями ЕГЭ: добавлять новые задания, редактировать их названия,
                      добавлять множественные ссылки на теоретические и практические материалы. Эти задания будут
                      доступны для выбора при создании планов подготовки.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
