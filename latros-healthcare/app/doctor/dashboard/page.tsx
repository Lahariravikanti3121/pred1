"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { collection, query, where, orderBy, getDocs, doc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader2, Users, Calendar, FileText, Clock, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AppointmentRequest {
  id: string
  patientId: string
  patientName: string
  patientEmail: string
  reason: string
  status: "pending" | "accepted" | "rejected" | "completed"
  createdAt: any
  domain: string
  reportId: string
}

interface UpcomingAppointment {
  id: string
  patientId: string
  patientName: string
  patientEmail: string
  reason: string
  status: "accepted"
  scheduledDate: any
  scheduledTime: string
  createdAt: any
  domain: string
}

interface Report {
  id: string
  symptoms: string
  diagnosis: string
  recommendations: string[]
  domain: string
  createdAt: any
}

export default function DoctorDashboard() {
  const { userData } = useAuth()
  const router = useRouter()
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([])
  const [patientCount, setPatientCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [doctorSpecialization, setDoctorSpecialization] = useState<string>("")

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (!userData) return

      try {
        const doctorRef = doc(db, "users", userData.uid)
        const doctorSnap = await getDocs(query(collection(db, "doctors"), where("userId", "==", userData.uid)))

        if (!doctorSnap.empty) {
          const doctorData = doctorSnap.docs[0].data()
          setDoctorSpecialization(doctorData.specialization || "general")
        }
      } catch (error) {
        console.error("Error fetching doctor profile:", error)
      }
    }

    fetchDoctorProfile()
  }, [userData])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userData || !doctorSpecialization) return

      try {
        // Fetch appointment requests - both assigned to this doctor and matching specialization
        const requestsRef = collection(db, "appointments")

        // Get requests specifically assigned to this doctor
        const assignedRequestsQuery = query(
          requestsRef,
          where("doctorId", "==", userData.uid),
          where("status", "==", "pending"),
          orderBy("createdAt", "desc"),
        )

        // Get requests matching doctor's specialization but not yet assigned
        const specializationRequestsQuery = query(
          requestsRef,
          where("domain", "==", doctorSpecialization),
          where("status", "==", "pending"),
          orderBy("createdAt", "desc"),
        )

        const [assignedRequestsSnapshot, specializationRequestsSnapshot] = await Promise.all([
          getDocs(assignedRequestsQuery),
          getDocs(specializationRequestsQuery),
        ])

        const requests: AppointmentRequest[] = []

        // Add assigned requests
        assignedRequestsSnapshot.forEach((doc) => {
          requests.push({ id: doc.id, ...doc.data() } as AppointmentRequest)
        })

        // Add specialization requests (avoiding duplicates)
        specializationRequestsSnapshot.forEach((doc) => {
          const data = doc.data()
          // Only add if not already assigned to this doctor
          if (data.doctorId !== userData.uid) {
            requests.push({ id: doc.id, ...data } as AppointmentRequest)
          }
        })

        setAppointmentRequests(requests)

        // Fetch upcoming appointments
        const upcomingRef = collection(db, "appointments")
        const upcomingQuery = query(
          upcomingRef,
          where("doctorId", "==", userData.uid),
          where("status", "==", "accepted"),
          orderBy("scheduledDate", "asc"),
        )
        const upcomingSnapshot = await getDocs(upcomingQuery)

        const upcoming: UpcomingAppointment[] = []
        upcomingSnapshot.forEach((doc) => {
          upcoming.push({ id: doc.id, ...doc.data() } as UpcomingAppointment)
        })
        setUpcomingAppointments(upcoming)

        // Count unique patients
        const allAppointmentsRef = collection(db, "appointments")
        const allAppointmentsQuery = query(allAppointmentsRef, where("doctorId", "==", userData.uid))
        const allAppointmentsSnapshot = await getDocs(allAppointmentsQuery)

        const patientIds = new Set<string>()
        allAppointmentsSnapshot.forEach((doc) => {
          const data = doc.data()
          if (data.patientId) {
            patientIds.add(data.patientId)
          }
        })
        setPatientCount(patientIds.size)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [userData, doctorSpecialization])

  const handleViewReport = async (reportId: string) => {
    try {
      // Fetch the report from Firestore
      const reportRef = doc(db, "reports", reportId)
      const reportSnap = await getDocs(query(collection(db, "reports"), where("id", "==", reportId)))

      if (!reportSnap.empty) {
        const reportData = reportSnap.docs[0].data() as Report
        setSelectedReport({
          id: reportSnap.docs[0].id,
          ...reportData,
        })
        setIsReportDialogOpen(true)
      } else {
        toast({
          title: "Report not found",
          description: "The requested report could not be found.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching report:", error)
      toast({
        title: "Error",
        description: "Failed to load the report. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    if (!userData) return

    try {
      // Update appointment status in Firestore
      const appointmentRef = doc(db, "appointments", requestId)
      await updateDoc(appointmentRef, {
        status: "accepted",
        doctorId: userData.uid, // Assign to this doctor if not already
        scheduledDate: serverTimestamp(), // This would normally be a future date
        scheduledTime: "10:00 AM", // This would normally be selected by the doctor
        updatedAt: serverTimestamp(),
      })

      // Add to calendar queue for scheduling
      await addDoc(collection(db, "calendarQueue"), {
        appointmentId: requestId,
        doctorId: userData.uid,
        patientId: appointmentRequests.find((req) => req.id === requestId)?.patientId,
        domain: appointmentRequests.find((req) => req.id === requestId)?.domain,
        status: "pending",
        createdAt: serverTimestamp(),
      })

      toast({
        title: "Appointment accepted",
        description: "The patient will be notified of your acceptance.",
      })

      // Update local state
      setAppointmentRequests((prev) => prev.filter((req) => req.id !== requestId))

      // Refresh the dashboard data
      router.refresh()
    } catch (error) {
      console.error("Error accepting appointment:", error)
      toast({
        title: "Error",
        description: "Failed to accept appointment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeclineRequest = async (requestId: string) => {
    if (!userData) return

    try {
      // Update appointment status in Firestore
      const appointmentRef = doc(db, "appointments", requestId)
      await updateDoc(appointmentRef, {
        status: "rejected",
        updatedAt: serverTimestamp(),
      })

      toast({
        title: "Appointment declined",
        description: "The patient will be notified of your decision.",
      })

      // Update local state
      setAppointmentRequests((prev) => prev.filter((req) => req.id !== requestId))
    } catch (error) {
      console.error("Error declining appointment:", error)
      toast({
        title: "Error",
        description: "Failed to decline appointment. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Get today's appointments
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayAppointments = upcomingAppointments.filter((apt) => {
    if (!apt.scheduledDate?.toDate) return false
    const aptDate = apt.scheduledDate.toDate()
    aptDate.setHours(0, 0, 0, 0)
    return aptDate.getTime() === today.getTime()
  })

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, Dr. {userData?.displayName?.split(" ")[0]} |
              <span className="ml-2 font-medium text-teal-600">{doctorSpecialization}</span>
            </p>
          </div>
          <Link href="/doctor/schedule">
            <Button className="bg-teal-600 hover:bg-teal-700">Manage Schedule</Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointment Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointmentRequests.length}</div>
              <p className="text-xs text-muted-foreground">
                {appointmentRequests.length === 0
                  ? "No pending requests"
                  : `${appointmentRequests.length} pending requests`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments.length}</div>
              <p className="text-xs text-muted-foreground">
                {todayAppointments.length === 0
                  ? "No appointments today"
                  : `${todayAppointments.length} appointments today`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patientCount}</div>
              <p className="text-xs text-muted-foreground">
                {patientCount === 0
                  ? "No patients yet"
                  : patientCount === 1
                    ? "1 patient in your care"
                    : `${patientCount} patients in your care`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointmentRequests.length}</div>
              <p className="text-xs text-muted-foreground">
                {appointmentRequests.length === 0
                  ? "No reports to review"
                  : `${appointmentRequests.length} reports to review`}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Appointment Requests</CardTitle>
              <CardDescription>Patients waiting for your approval in {doctorSpecialization}</CardDescription>
            </CardHeader>
            <CardContent>
              {appointmentRequests.length > 0 ? (
                <div className="space-y-4">
                  {appointmentRequests.map((request) => (
                    <div key={request.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {request.patientName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{request.patientName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {request.reason ? `Reason: ${request.reason}` : "No reason provided"}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="outline">{request.domain}</Badge>
                              <Badge className="bg-yellow-500">Pending</Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Requested:{" "}
                              {request.createdAt?.toDate
                                ? new Date(request.createdAt.toDate()).toLocaleDateString()
                                : "Recently"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleViewReport(request.reportId)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Report
                        </Button>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          className="flex-1 bg-teal-600 hover:bg-teal-700"
                          onClick={() => handleAcceptRequest(request.id)}
                        >
                          Accept
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={() => handleDeclineRequest(request.id)}>
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="mb-2 h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No appointment requests</h3>
                  <p className="text-sm text-muted-foreground">
                    You don't have any pending appointment requests in {doctorSpecialization}.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {appointment.patientName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{appointment.patientName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {appointment.reason || "General consultation"}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="outline">{appointment.domain}</Badge>
                              <Badge className="bg-green-500">Confirmed</Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {appointment.scheduledDate?.toDate
                                ? new Date(appointment.scheduledDate.toDate()).toLocaleDateString()
                                : "Date not set"}{" "}
                              at {appointment.scheduledTime || "Time not set"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Link href={`/doctor/patients/${appointment.patientId}`} className="flex-1">
                          <Button className="w-full bg-teal-600 hover:bg-teal-700">View Patient</Button>
                        </Link>
                        <Button variant="outline" className="flex-1">
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="mb-2 h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No upcoming appointments</h3>
                  <p className="text-sm text-muted-foreground">You don't have any upcoming appointments.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Patient Report</DialogTitle>
            <DialogDescription>AI-generated diagnosis and recommendations</DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-teal-600">Medical Domain</h3>
                <Badge variant="outline" className="mt-1">
                  {selectedReport.domain}
                </Badge>
              </div>

              <div>
                <h3 className="font-medium text-teal-600">Symptoms</h3>
                <p className="mt-1 text-sm">{selectedReport.symptoms}</p>
              </div>

              <div>
                <h3 className="font-medium text-teal-600">Diagnosis</h3>
                <p className="mt-1 text-sm">{selectedReport.diagnosis}</p>
              </div>

              <div>
                <h3 className="font-medium text-teal-600">Recommendations</h3>
                <ul className="mt-1 list-inside list-disc text-sm">
                  {selectedReport.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="text-right text-xs text-muted-foreground">
                Generated on:{" "}
                {selectedReport.createdAt?.toDate
                  ? new Date(selectedReport.createdAt.toDate()).toLocaleString()
                  : "Unknown date"}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
