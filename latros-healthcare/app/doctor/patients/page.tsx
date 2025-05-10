"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Search, Calendar, FileText, Loader2, User } from "lucide-react"

interface Patient {
  id: string
  name: string
  email: string
  lastAppointment?: any
  upcomingAppointment?: any
  reportsCount?: number
}

export default function DoctorPatients() {
  const { userData } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatients = async () => {
      if (!userData) return

      try {
        // Get all appointments for this doctor
        const appointmentsRef = collection(db, "appointments")
        const appointmentsQuery = query(
          appointmentsRef,
          where("doctorId", "==", userData.uid),
          where("status", "in", ["accepted", "completed"]),
        )
        const appointmentsSnapshot = await getDocs(appointmentsQuery)

        // Extract unique patient IDs
        const patientMap = new Map<string, Patient>()

        appointmentsSnapshot.forEach((doc) => {
          const data = doc.data()
          const patientId = data.patientId

          if (!patientId) return

          // Initialize patient if not already in map
          if (!patientMap.has(patientId)) {
            patientMap.set(patientId, {
              id: patientId,
              name: data.patientName || "Unknown Patient",
              email: data.patientEmail || "",
              reportsCount: 0,
            })
          }

          const patient = patientMap.get(patientId)!

          // Track appointment dates
          const appointmentDate = data.scheduledDate?.toDate ? new Date(data.scheduledDate.toDate()) : null

          if (appointmentDate) {
            const now = new Date()

            if (appointmentDate > now) {
              // Future appointment
              if (!patient.upcomingAppointment || appointmentDate < new Date(patient.upcomingAppointment)) {
                patient.upcomingAppointment = appointmentDate
              }
            } else {
              // Past appointment
              if (!patient.lastAppointment || appointmentDate > new Date(patient.lastAppointment)) {
                patient.lastAppointment = appointmentDate
              }
            }
          }
        })

        // Convert map to array
        const patientList = Array.from(patientMap.values())
        setPatients(patientList)
        setFilteredPatients(patientList)
      } catch (error) {
        console.error("Error fetching patients:", error)
        toast({
          title: "Error",
          description: "Failed to load patients. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [userData])

  useEffect(() => {
    // Filter patients based on search term
    if (searchTerm.trim() === "") {
      setFilteredPatients(patients)
    } else {
      const filtered = patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredPatients(filtered)
    }
  }, [searchTerm, patients])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-lg">Loading patients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Patients</h1>
          <p className="text-muted-foreground">Manage your patient records</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search patients by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredPatients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <User className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-medium">No patients found</h3>
            <p className="mb-6 text-muted-foreground">
              {searchTerm.trim() !== ""
                ? "No patients match your search criteria."
                : "You don't have any patients yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{patient.name}</h4>
                      <p className="text-sm text-muted-foreground">{patient.email}</p>
                      <div className="mt-2 flex flex-wrap gap-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {patient.lastAppointment
                              ? `Last visit: ${new Date(patient.lastAppointment).toLocaleDateString()}`
                              : "No previous visits"}
                          </span>
                        </div>
                        {patient.upcomingAppointment && (
                          <div className="flex items-center gap-1 text-sm">
                            <Badge className="bg-green-500">
                              Upcoming: {new Date(patient.upcomingAppointment).toLocaleDateString()}
                            </Badge>
                          </div>
                        )}
                        {patient.reportsCount > 0 && (
                          <div className="flex items-center gap-1 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{patient.reportsCount} reports</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/doctor/patients/${patient.id}`}>
                      <Button className="bg-teal-600 hover:bg-teal-700">View Patient</Button>
                    </Link>
                    <Link href={`/doctor/appointments/new?patient=${patient.id}`}>
                      <Button variant="outline">Schedule Appointment</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
