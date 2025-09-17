"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Calendar, Clock, ArrowRight } from "lucide-react"
import { getTasks, updateTaskStatus, getAppointments } from "@/lib/api-client"
import { TaskDetailDialog } from "./task-detail-dialog"
import type { Task } from "@/types/task"
import type { Appointment } from "@/types/appointment"

export function TasksList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [view, setView] = useState<"list" | "calendar">("list")

  useEffect(() => {
    const fetchData = async () => {
      const tasksData = await getTasks()
      const appointmentsData = await getAppointments()

      // Convertir les rendez-vous en tâches
      const appointmentTasks = appointmentsData.map((appointment) => ({
        id: appointment.id + 1000, // Pour éviter les conflits d'ID
        title: `RV: ${appointment.clientName}`,
        description: appointment.serviceName,
        completed: false,
        dueDate: new Date(appointment.startTime).toISOString().split("T")[0],
        location: appointment.clientId
          ? tasks.find((t) => t.clientId === appointment.clientId)?.location || null
          : null,
        clientId: appointment.clientId,
        appointmentId: appointment.id,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      }))

      setTasks([...tasksData, ...appointmentTasks])
      setAppointments(appointmentsData)
    }

    fetchData()
  }, [])

  const handleTaskStatusChange = async (taskId: number, completed: boolean) => {
    // Ne pas mettre à jour le statut des tâches générées à partir des rendez-vous
    if (taskId > 1000) return

    await updateTaskStatus(taskId, completed)

    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed } : task)))
  }

  const openMap = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank")
  }

  const callClient = (clientId: number | undefined) => {
    if (!clientId) return

    const client = tasks.find((t) => t.clientId === clientId)
    if (!client) return

    // Simuler un appel téléphonique
    alert(`Appel du client ${client.title.replace("RV: ", "")}`)
  }

  const openTaskDetails = (task: Task) => {
    setSelectedTask(task)
    setIsDetailDialogOpen(true)
  }

  const getDirections = (location: string | null) => {
    if (!location) return

    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`, "_blank")
  }

  // Trier les tâches par date
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  // Grouper les tâches par date
  const groupedTasks: Record<string, Task[]> = {}
  sortedTasks.forEach((task) => {
    if (!task.dueDate) {
      if (!groupedTasks["Sans date"]) {
        groupedTasks["Sans date"] = []
      }
      groupedTasks["Sans date"].push(task)
    } else {
      const date = new Date(task.dueDate).toLocaleDateString("fr-FR")
      if (!groupedTasks[date]) {
        groupedTasks[date] = []
      }
      groupedTasks[date].push(task)
    }
  })

  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).map(([date, dateTasks]) => (
        <Card key={date}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
              {date === "Sans date" ? "Sans date" : date}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dateTasks.map((task) => (
                <div key={task.id} className="flex flex-col border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={(checked) => handleTaskStatusChange(task.id, Boolean(checked))}
                      className="mt-1 mr-4"
                      disabled={task.id > 1000} // Désactiver pour les tâches de rendez-vous
                    />
                    <div className="flex-1">
                      <h4 className="text-base font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>

                      {task.startTime && (
                        <div className="mt-2 flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>
                            {new Date(task.startTime).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {task.endTime && (
                              <>
                                <span className="mx-1">-</span>
                                {new Date(task.endTime).toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </>
                            )}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mt-3">
                        {task.location && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 cursor-pointer hover:bg-muted"
                            onClick={() => openMap(task.location || "")}
                          >
                            <MapPin className="h-3 w-3" />
                            <span>{task.location}</span>
                          </Badge>
                        )}

                        {task.clientId && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 cursor-pointer hover:bg-muted bg-blue-50"
                            onClick={() => callClient(task.clientId)}
                          >
                            <Phone className="h-3 w-3" />
                            <span>Appeler</span>
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {task.location && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => getDirections(task.location)}
                          className="flex items-center gap-1"
                        >
                          <ArrowRight className="h-3 w-3" />
                          <span>Itinéraire</span>
                        </Button>
                      )}

                      <Button variant="ghost" size="sm" onClick={() => openTaskDetails(task)}>
                        Détails
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {dateTasks.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">Aucune tâche pour cette date</div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {tasks.length === 0 && <div className="text-center py-12 text-muted-foreground">Aucune tâche à afficher</div>}

      {selectedTask && (
        <TaskDetailDialog
          isOpen={isDetailDialogOpen}
          onClose={() => setIsDetailDialogOpen(false)}
          task={selectedTask}
        />
      )}
    </div>
  )
}
