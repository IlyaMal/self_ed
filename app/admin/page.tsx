"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  BookOpen,
  Settings,
  Search,
  Crown,
  Clock,
  FileText,
  LinkIcon,
  Plus,
  Trash2,
  Edit,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

// Создаем Supabase клиент
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Типы данных
type Subscription = {
  type: string
  status: string
  expires_at: string
  subjects: string[]
}

type Plan = {
  subject_id: string
  target_score: number
  progress: number
}

type User = {
  id: string
  name: string
  email: string
  subscriptions: Subscription[]  // массив
  user_plans: Plan[]             // массив
}


type Subject = {
  id: string
  name: string
  enabled: boolean
}

type Task = {
  id: number
  subject_id: string
  name: string
  theory_links: string[]
  practice_links: string[]
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [egeTasks, setEgeTasks] = useState<Record<string, Task[]>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [editingTask, setEditingTask] = useState<{
    id: number
    field: "theory" | "practice" | "name"
    value: string
    linkIndex?: number
  } | null>(null)
  const [newTaskName, setNewTaskName] = useState("")

  // Загружаем данные из базы при старте
useEffect(() => {
  const fetchData = async () => {
    try {
      console.log("⚡ fetchData started")

      // --- Users
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select(`
          id,
          email,
          subscriptions (
            id,
            is_active,
            start_date,
            end_date,
            subject_count,
            plan:subscription_plans (
              id,
              name,
              duration,
              price,
              subject_count,
              features
            )
          ),
          user_plans (
            id,
            subject_id,
            target_score,
            duration,
            study_hours,
            goals,
            notes,
            known_tasks,
            unknown_tasks,
            task_selection_type,
            weekly_schedule
          )
        `)

      console.log("📌 usersError:", usersError)
      console.log("📌 usersData length:", usersData?.length ?? 0)
      if (!usersError && usersData) setUsers(usersData as User[])

      // --- Subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("*")

      console.log("📌 subjectsError:", subjectsError)
      console.log("📌 subjectsData:", subjectsData)
      if (!subjectsError && subjectsData) {
        setSubjects(subjectsData as Subject[])
        if (!selectedSubject && subjectsData.length > 0) {
          setSelectedSubject(subjectsData[0].id)
        }
      }

      // --- Tasks
      const { data: tasksData, error: tasksError } = await supabase.from("tasks").select("*")
      console.log("📌 tasksError:", tasksError)
      console.log("📌 tasksData length:", tasksData?.length ?? 0)

      if (!tasksError && tasksData) {
        const tasksBySubject: Record<string, Task[]> = {}
        ;(tasksData as Task[]).forEach((task) => {
          if (!tasksBySubject[task.subject_id]) tasksBySubject[task.subject_id] = []
          tasksBySubject[task.subject_id].push(task)
        })
        console.log("📌 Grouped tasksBySubject keys:", Object.keys(tasksBySubject))
        setEgeTasks(tasksBySubject)
      }

      console.log("✅ fetchData finished")
    } catch (err) {
      console.error("❌ fetchData threw:", err)
    }
  }

  fetchData()
}, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || user.subscriptions.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Управление подписками
  const handleExtendSubscription = async (userId: string, months: number) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    const currentDate = new Date(user.subscriptions.expires_at)
    currentDate.setMonth(currentDate.getMonth() + months)

    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "active", expires_at: currentDate.toISOString().split("T")[0] })
      .eq("user_id", userId)

    if (!error) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                subscriptions: { ...u.subscriptions, status: "active", expires_at: currentDate.toISOString().split("T")[0] },
              }
            : u,
        ),
      )
    }
  }

  // Управление предметами
  const handleToggleSubject = async (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId)
    if (!subject) return

    const { error } = await supabase.from("subjects").update({ enabled: !subject.enabled }).eq("id", subjectId)

    if (!error) {
      setSubjects((prev) =>
        prev.map((s) => (s.id === subjectId ? { ...s, enabled: !s.enabled } : s)),
      )
    }
  }

  // Управление заданиями
  const handleAddTask = async () => {
    if (!newTaskName.trim()) return
    const { data, error } = await supabase
      .from("tasks")
      .insert({ subject_id: selectedSubject, name: newTaskName.trim(), theory_links: [], practice_links: [] })
      .select()
      .single()

    if (!error && data) {
      setEgeTasks((prev) => ({
        ...prev,
        [selectedSubject]: [...(prev[selectedSubject] || []), data],
      }))
      setNewTaskName("")
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId)
    if (!error) {
      setEgeTasks((prev) => ({
        ...prev,
        [selectedSubject]: prev[selectedSubject].filter((t) => t.id !== taskId),
      }))
    }
  }

  const handleUpdateTaskMaterial = async (
    subjectId: string,
    taskId: number,
    field: "theory" | "practice" | "name",
    value: string,
    linkIndex?: number,
  ) => {
    const task = egeTasks[subjectId]?.find((t) => t.id === taskId)
    if (!task) return

    let updateData: any = {}
    if (field === "name") updateData.name = value
    else {
      const links = [...task[field === "theory" ? "theory_links" : "practice_links"]]
      if (linkIndex !== undefined) links[linkIndex] = value
      updateData[field === "theory" ? "theory_links" : "practice_links"] = links
    }

    const { data, error } = await supabase.from("tasks").update(updateData).eq("id", taskId).select().single()
    if (!error && data) {
      setEgeTasks((prev) => ({
        ...prev,
        [subjectId]: prev[subjectId].map((t) => (t.id === taskId ? data : t)),
      }))
      setEditingTask(null)
    }
  }

  const handleStartEditing = (
    taskId: number,
    field: "theory" | "practice" | "name",
    currentValue: string,
    linkIndex?: number,
  ) => {
    setEditingTask({ id: taskId, field, value: currentValue, linkIndex })
  }

  const handleCancelEditing = () => setEditingTask(null)

  const handleAddLink = (taskId: number, field: "theory" | "practice") => {
    const task = egeTasks[selectedSubject]?.find((t) => t.id === taskId)
    if (!task) return

    const updatedLinks = [...task[field === "theory" ? "theory_links" : "practice_links"], ""]
    handleUpdateTaskMaterial(selectedSubject, taskId, field, updatedLinks[updatedLinks.length - 1])
  }

  const handleDeleteLink = (taskId: number, field: "theory" | "practice", linkIndex: number) => {
    const task = egeTasks[selectedSubject]?.find((t) => t.id === taskId)
    if (!task) return

    const updatedLinks = task[field === "theory" ? "theory_links" : "practice_links"].filter(
      (_, i) => i !== linkIndex,
    )
    handleUpdateTaskMaterial(selectedSubject, taskId, field, updatedLinks[0] || "")
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
        {/* Выбор предмета */}
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

        {/* Добавление нового задания */}
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
        <pre>{JSON.stringify(egeTasks[selectedSubject] || [], null, 2)}</pre>

        {/* Таблица заданий */}
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
                  {/* ID */}
                  <TableCell className="font-medium">{task.id}</TableCell>

                  {/* Название */}
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

                  {/* Теория */}
<TableCell>
  <div className="space-y-2">
    {task.theory_links?.map((link, index) => (
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Если это новая пустая ссылка и нажали ✕ — убираем её из локального массива
                if (!link) {
                  setEgeTasks((prev) => ({
                    ...prev,
                    [selectedSubject]: prev[selectedSubject].map((t) =>
                      t.id === task.id
                        ? {
                            ...t,
                            theory_links: t.theory_links.filter((_, i) => i !== index),
                          }
                        : t
                    ),
                  }))
                }
                handleCancelEditing()
              }}
            >
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
      onClick={() => {
        // Добавляем пустую ссылку только в state
        setEgeTasks((prev) => ({
          ...prev,
          [selectedSubject]: prev[selectedSubject].map((t) =>
            t.id === task.id
              ? { ...t, theory_links: [...t.theory_links, ""] }
              : t
          ),
        }))
        // Открываем режим редактирования сразу для новой ссылки
        setEditingTask({
          id: task.id,
          field: "theory",
          value: "",
          linkIndex: task.theory_links.length,
        })
      }}
      className="w-full"
    >
      <Plus className="w-3 h-3 mr-1" />
      Добавить ссылку на теорию
    </Button>
  </div>
</TableCell>

{/* Практика */}
<TableCell>
  <div className="space-y-2">
    {task.practice_links?.map((link, index) => (
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (!link) {
                  setEgeTasks((prev) => ({
                    ...prev,
                    [selectedSubject]: prev[selectedSubject].map((t) =>
                      t.id === task.id
                        ? {
                            ...t,
                            practice_links: t.practice_links.filter((_, i) => i !== index),
                          }
                        : t
                    ),
                  }))
                }
                handleCancelEditing()
              }}
            >
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
      onClick={() => {
        setEgeTasks((prev) => ({
          ...prev,
          [selectedSubject]: prev[selectedSubject].map((t) =>
            t.id === task.id
              ? { ...t, practice_links: [...t.practice_links, ""] }
              : t
          ),
        }))
        setEditingTask({
          id: task.id,
          field: "practice",
          value: "",
          linkIndex: task.practice_links.length,
        })
      }}
      className="w-full"
    >
      <Plus className="w-3 h-3 mr-1" />
      Добавить ссылку на практику
    </Button>
  </div>
</TableCell>


                  {/* Действия */}
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
