"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  orderBy,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Calendar, Clock, FileText, User, AlertCircle, CheckCircle, XCircle } from "lucide-react"

interface Appointment {
  id: string
  patientId: string
  doctorId: string | null
  domain: string
  status: string
  reportId: string
  timestamp: Timestamp
  patientName?: string
  reportData?: any
}

export default function DoctorAppointments() {
  const { userData } = useAuth()
  const [loading, setLoading] = useState(true)
  const [doctorData, setDoctorData] = useState<any>(null)
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([])
  const [domainAppointments, setDomainAppointments] = useState<Appointment[]>([])
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!userData) return

      try {
        const doctorRef = doc(db, "doctors", userData.uid)
        const doctorSnap = await getDoc(doctorRef)

        if (doctorSnap.exists()) {
          setDoctorData(doctorSnap.data())
        }
      } catch (error) {
        console.error("Error fetching doctor data:", error)
      }
    }

    fetchDoctorData()
  }, [userData])

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userData || !doctorData) return

      try {
        // Fetch appointments assigned to this doctor
        const myQuery = query(
          collection(db, "appointments"),
          where("doctorId", "==", userData.uid),
          orderBy("timestamp", "desc"),
        )

        // Fetch appointments in doctor's specialization domain that are pending
        const domainQuery = query(
          collection(db, "appointments"),
          where("domain", "==", doctorData.specialty),
          where("status", "==", "pending"),
          where("doctorId", "==", null),
          orderBy("timestamp", "desc"),
        )

        const [mySnapshot, domainSnapshot] = await Promise.all([getDocs(myQuery), getDocs(domainQuery)])

        const myAppts: Appointment[] = []
        const domainAppts: Appointment[] = []

        // Process my appointments
        for (const doc of mySnapshot.docs) {
          const appt = { id: doc.id, ...doc.data() } as Appointment

          // Get patient name
          const patientDoc = await getDoc(doc(db, "users", appt.patientId))
          if (patientDoc.exists()) {
            appt.patientName = patientDoc.data().displayName
          }

          myAppts.push(appt)
        }

        // Process domain appointments
        for (const doc of domainSnapshot.docs) {
          const appt = { id: doc.id, ...doc.data() } as Appointment

          // Get patient name
          const patientDoc = await getDoc(doc(db, "users", appt.patientId))
          if (patientDoc.exists()) {
            appt.patientName = patientDoc.data().displayName
          }

          domainAppts.push(appt)
        }

        setMyAppointments(myAppts)
        setDomainAppointments(domainAppts)
      } catch (error) {
        console.error("Error fetching appointments:", error)
        toast({
          title: "Error",
          description: "Failed to load appointments.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [userData, doctorData])

  const viewReport = async (appointment: Appointment) => {
    try {
      // Get the report data
      const reportRef = doc(db, "users", appointment.patientId, "reports", appointment.reportId)
      const reportSnap = await getDoc(reportRef)

      if (reportSnap.exists()) {
        setSelectedReport({
          id: reportSnap.id,
          ...reportSnap.data(),
        })
        setIsReportOpen(true)
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
        description: "Failed to load the report.",
        variant: "destructive",
      })
    }
  }

  const handleAccept = async (appointment: Appointment) => {
    if (!userData) return

    setProcessingId(appointment.id)

    try {
      // Update the appointment status
      const appointmentRef = doc(db, "appointments", appointment.id)
      await updateDoc(appointmentRef, {
        status: "accepted",
        doctorId: userData.uid,
      })

      // Add to calendar queue for scheduling
      await addDoc(collection(db, "calendarQueue"), {
        appointmentId: appointment.id,
        doctorId: userData.uid,
        patientId: appointment.patientId,
        domain: appointment.domain,
        status: "pending",
        createdAt: Timestamp.now(),
      })

      // Update local state
      if (appointment.doctorId === null) {
        // This was from domain appointments
        setDomainAppointments((prev) => prev.filter((a) => a.id !== appointment.id))

        // Add to my appointments
        const updatedAppointment = {
          ...appointment,
          status: "accepted",
          doctorId: userData.uid,
        }
        setMyAppointments((prev) => [updatedAppointment, ...prev])
      } else {
        // This was already in my appointments
        setMyAppointments((prev) => prev.map((a) => (a.id === appointment.id ? { ...a, status: "accepted" } : a)))
      }

      toast({
        title: "Appointment accepted",
        description: "The appointment has been accepted and added to your schedule.",
      })
    } catch (error) {
      console.error("Error accepting appointment:", error)
      toast({
        title: "Error",
        description: "Failed to accept the appointment.",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (appointment: Appointment) => {
    setProcessingId(appointment.id)

    try {
      // Update the appointment status
      const appointmentRef = doc(db, "appointments", appointment.id)
      await updateDoc(appointmentRef, {
        status: "rejected",
      })

      // Update local state
      if (appointment.doctorId === null) {
        // This was from domain appointments
        setDomainAppointments((prev) => prev.filter((a) => a.id !== appointment.id))
      } else {
        // This was already in my appointments
        setMyAppointments((prev) => prev.map((a) => (a.id === appointment.id ? { ...a, status: "rejected" } : a)))
      }

      toast({
        title: "Appointment rejected",
        description: "The appointment has been rejected.",
      })
    } catch (error) {
      console.error("Error rejecting appointment:", error)
      toast({
        title: "Error",
        description: "Failed to reject the appointment.",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            Pending
          </Badge>
        )
      case "accepted":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Accepted
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700">
            Rejected
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDomainBadge = (domain: string) => {
    return (
      <Badge variant="outline" className="bg-purple-50 text-purple-700">
        {domain}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Manage your patient appointments</p>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground">Manage your patient appointments</p>
      </div>

      {!doctorData?.specialty && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              Specialization Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              Please set your medical specialization in your profile settings to receive relevant appointment requests.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="border-yellow-300 bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              asChild
            >
              <a href="/doctor/settings">Go to Settings</a>
            </Button>
          </CardFooter>
        </Card>
      )}

      <Tabs defaultValue="my-appointments">
        <TabsList>
          <TabsTrigger value="my-appointments">My Appointments</TabsTrigger>
          <TabsTrigger value="domain-appointments">
            {doctorData?.specialty || "Specialization"} Requests
            {domainAppointments.length > 0 && <Badge className="ml-2 bg-teal-500">{domainAppointments.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-appointments" className="space-y-4 pt-4">
          {myAppointments.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No appointments</CardTitle>
                <CardDescription>You don't have any appointments yet.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            myAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      {appointment.patientName || "Patient"}
                    </CardTitle>
                    <div className="flex gap-2">
                      {getStatusBadge(appointment.status)}
                      {getDomainBadge(appointment.domain)}
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {appointment.timestamp.toDate().toLocaleDateString()}
                    <Clock className="ml-2 h-4 w-4" />
                    {appointment.timestamp.toDate().toLocaleTimeString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="flex items-center gap-2" onClick={() => viewReport(appointment)}>
                    <FileText className="h-4 w-4" />
                    View Patient Report
                  </Button>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  {appointment.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                        onClick={() => handleReject(appointment)}
                        disabled={processingId === appointment.id}
                      >
                        {processingId === appointment.id ? (
                          <Skeleton className="h-5 w-5 rounded-full" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Reject
                      </Button>
                      <Button
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={() => handleAccept(appointment)}
                        disabled={processingId === appointment.id}
                      >
                        {processingId === appointment.id ? (
                          <Skeleton className="h-5 w-5 rounded-full" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Accept
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="domain-appointments" className="space-y-4 pt-4">
          {!doctorData?.specialty ? (
            <Card>
              <CardHeader>
                <CardTitle>Specialization Required</CardTitle>
                <CardDescription>
                  Please set your medical specialization in your profile settings to view relevant appointment requests.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild>
                  <a href="/doctor/settings">Go to Settings</a>
                </Button>
              </CardFooter>
            </Card>
          ) : domainAppointments.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No pending requests</CardTitle>
                <CardDescription>
                  There are no pending appointment requests in your specialization ({doctorData.specialty}).
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            domainAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      {appointment.patientName || "Patient"}
                    </CardTitle>
                    <div className="flex gap-2">
                      {getStatusBadge(appointment.status)}
                      {getDomainBadge(appointment.domain)}
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {appointment.timestamp.toDate().toLocaleDateString()}
                    <Clock className="ml-2 h-4 w-4" />
                    {appointment.timestamp.toDate().toLocaleTimeString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="flex items-center gap-2" onClick={() => viewReport(appointment)}>
                    <FileText className="h-4 w-4" />
                    View Patient Report
                  </Button>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    onClick={() => handleReject(appointment)}
                    disabled={processingId === appointment.id}
                  >
                    {processingId === appointment.id ? (
                      <Skeleton className="h-5 w-5 rounded-full" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Reject
                  </Button>
                  <Button
                    className="bg-teal-600 hover:bg-teal-700"
                    onClick={() => handleAccept(appointment)}
                    disabled={processingId === appointment.id}
                  >
                    {processingId === appointment.id ? (
                      <Skeleton className="h-5 w-5 rounded-full" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Accept
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Report</DialogTitle>
            <DialogDescription>AI-generated report based on patient symptoms</DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Medical Domain</h3>
                <Badge variant="outline" className="mt-1 bg-purple-50 text-purple-700">
                  {selectedReport.domain || "General"}
                </Badge>
              </div>

              <div>
                <h3 className="font-medium">Symptoms</h3>
                <p className="mt-1 text-sm">{selectedReport.symptoms}</p>
              </div>

              <div>
                <h3 className="font-medium">AI Diagnosis</h3>
                <div className="mt-1 rounded-md bg-slate-50 p-3 text-sm">{selectedReport.diagnosis}</div>
              </div>

              <div>
                <h3 className="font-medium">Recommendations</h3>
                <div className="mt-1 rounded-md bg-slate-50 p-3 text-sm">{selectedReport.recommendations}</div>
              </div>

              <div>
                <h3 className="font-medium">Report Date</h3>
                <p className="mt-1 text-sm">
                  {selectedReport.createdAt?.toDate().toLocaleDateString()} at{" "}
                  {selectedReport.createdAt?.toDate().toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
