"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Calendar, Clock, Loader2, Video, X } from "lucide-react"

interface Appointment {
  id: string
  createdAt: any
  doctorId: string
  doctorName: string
  doctorSpecialty: string
  status: "pending" | "accepted" | "rejected" | "completed"
  scheduledDate?: any
  scheduledTime?: string
  reason?: string
}

export default function PatientAppointments() {
  const { userData } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("upcoming")

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userData) return

      try {
        const appointmentsRef = collection(db, "appointments")
        const q = query(appointmentsRef, where("patientId", "==", userData.uid), orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)

        const fetchedAppointments: Appointment[] = []
        querySnapshot.forEach((doc) => {
          fetchedAppointments.push({
            id: doc.id,
            ...doc.data(),
          } as Appointment)
        })

        setAppointments(fetchedAppointments)
      } catch (error) {
        console.error("Error fetching appointments:", error)
        toast({
          title: "Error",
          description: "Failed to load your appointments. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [userData])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "accepted":
        return <Badge className="bg-green-500">Accepted</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Declined</Badge>
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const upcomingAppointments = appointments.filter((apt) => apt.status === "accepted" && apt.scheduledDate)

  const pendingAppointments = appointments.filter((apt) => apt.status === "pending")

  const pastAppointments = appointments.filter((apt) => apt.status === "completed" || apt.status === "rejected")

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-lg">Loading your appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
          <p className="text-muted-foreground">Manage your appointments with healthcare providers</p>
        </div>
        <Link href="/patient/appointments/new">
          <Button className="bg-teal-600 hover:bg-teal-700">Find a Doctor</Button>
        </Link>
      </div>

      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">
            Upcoming
            {upcomingAppointments.length > 0 && (
              <span className="ml-2 rounded-full bg-teal-600 px-2 py-0.5 text-xs text-white">
                {upcomingAppointments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {pendingAppointments.length > 0 && (
              <span className="ml-2 rounded-full bg-yellow-500 px-2 py-0.5 text-xs text-white">
                {pendingAppointments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 pt-4">
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-xl font-medium">No upcoming appointments</h3>
                <p className="mb-6 text-muted-foreground">You don't have any scheduled appointments.</p>
                <Link href="/patient/appointments/new">
                  <Button className="bg-teal-600 hover:bg-teal-700">Find a Doctor</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h4 className="font-semibold">{appointment.doctorName}</h4>
                        <p className="text-sm text-muted-foreground">{appointment.doctorSpecialty}</p>
                        <div className="mt-2 flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {appointment.scheduledDate?.toDate
                              ? new Date(appointment.scheduledDate.toDate()).toLocaleDateString()
                              : "Date not set"}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{appointment.scheduledTime || "Time not set"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(appointment.status)}
                        <Button className="bg-teal-600 hover:bg-teal-700">
                          <Video className="mr-2 h-4 w-4" />
                          Join Video Call
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 pt-4">
          {pendingAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-xl font-medium">No pending requests</h3>
                <p className="mb-6 text-muted-foreground">You don't have any pending appointment requests.</p>
                <Link href="/patient/appointments/new">
                  <Button className="bg-teal-600 hover:bg-teal-700">Find a Doctor</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h4 className="font-semibold">{appointment.doctorName}</h4>
                        <p className="text-sm text-muted-foreground">{appointment.doctorSpecialty}</p>
                        <div className="mt-2 flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Requested on{" "}
                            {appointment.createdAt?.toDate
                              ? new Date(appointment.createdAt.toDate()).toLocaleDateString()
                              : "Recently"}
                          </span>
                        </div>
                        {appointment.reason && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Reason:</p>
                            <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(appointment.status)}
                        <Button variant="outline" className="text-red-500">
                          <X className="mr-2 h-4 w-4" />
                          Cancel Request
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 pt-4">
          {pastAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-xl font-medium">No past appointments</h3>
                <p className="mb-6 text-muted-foreground">You don't have any past appointments.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h4 className="font-semibold">{appointment.doctorName}</h4>
                        <p className="text-sm text-muted-foreground">{appointment.doctorSpecialty}</p>
                        <div className="mt-2 flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {appointment.scheduledDate?.toDate
                              ? new Date(appointment.scheduledDate.toDate()).toLocaleDateString()
                              : appointment.createdAt?.toDate
                                ? new Date(appointment.createdAt.toDate()).toLocaleDateString()
                                : "Date not available"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(appointment.status)}
                        {appointment.status === "completed" && <Button variant="outline">View Summary</Button>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
