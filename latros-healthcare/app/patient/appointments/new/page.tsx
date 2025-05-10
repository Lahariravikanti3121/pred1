"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Search, MapPin, Star, Calendar, Stethoscope, Loader2 } from "lucide-react"

// Updated mock data for doctors with specializations
const mockDoctors = [
  {
    id: "doc-1",
    name: "Dr. Sarah Johnson",
    specialty: "Neurology",
    specialization: "Neurology",
    distance: "2.3 miles",
    address: "123 Medical Center Dr, Suite 101",
    availability: "Next available: Tomorrow at 2:00 PM",
    rating: 4.8,
    reviews: 124,
    image: "/placeholder.svg?height=100&width=100",
    years_experience: 12,
  },
  {
    id: "doc-2",
    name: "Dr. Michael Chen",
    specialty: "Primary Care",
    specialization: "Primary Care",
    distance: "1.5 miles",
    address: "456 Health Parkway, Building B",
    availability: "Next available: Today at 4:30 PM",
    rating: 4.9,
    reviews: 89,
    image: "/placeholder.svg?height=100&width=100",
    years_experience: 8,
  },
  {
    id: "doc-3",
    name: "Dr. Emily Rodriguez",
    specialty: "Neurology",
    specialization: "Neurology",
    distance: "3.8 miles",
    address: "789 Wellness Blvd, Suite 205",
    availability: "Next available: Thursday at 10:15 AM",
    rating: 4.7,
    reviews: 56,
    image: "/placeholder.svg?height=100&width=100",
    years_experience: 15,
  },
  {
    id: "doc-4",
    name: "Dr. James Wilson",
    specialty: "Cardiology",
    specialization: "Cardiology",
    distance: "4.2 miles",
    address: "321 Heart Center Lane",
    availability: "Next available: Friday at 9:00 AM",
    rating: 4.9,
    reviews: 112,
    image: "/placeholder.svg?height=100&width=100",
    years_experience: 20,
  },
  {
    id: "doc-5",
    name: "Dr. Lisa Patel",
    specialty: "Dermatology",
    specialization: "Dermatology",
    distance: "2.7 miles",
    address: "567 Skin Health Drive",
    availability: "Next available: Wednesday at 1:15 PM",
    rating: 4.6,
    reviews: 78,
    image: "/placeholder.svg?height=100&width=100",
    years_experience: 10,
  },
  {
    id: "doc-6",
    name: "Dr. Robert Johnson",
    specialty: "Gastroenterology",
    specialization: "Gastroenterology",
    distance: "3.1 miles",
    address: "123 Digestive Wellness Ave",
    availability: "Next available: Monday at 11:30 AM",
    rating: 4.7,
    reviews: 93,
    image: "/placeholder.svg?height=100&width=100",
    years_experience: 14,
  },
  {
    id: "doc-7",
    name: "Dr. Amanda Lee",
    specialty: "Orthopedics",
    specialization: "Orthopedics",
    distance: "5.0 miles",
    address: "789 Joint & Spine Center",
    availability: "Next available: Tuesday at 3:45 PM",
    rating: 4.8,
    reviews: 105,
    image: "/placeholder.svg?height=100&width=100",
    years_experience: 16,
  },
  {
    id: "doc-8",
    name: "Dr. Daniel Martinez",
    specialty: "Psychology",
    specialization: "Psychology",
    distance: "2.4 miles",
    address: "456 Mental Wellness Center",
    availability: "Next available: Wednesday at 9:15 AM",
    rating: 4.9,
    reviews: 87,
    image: "/placeholder.svg?height=100&width=100",
    years_experience: 12,
  },
]

interface Doctor {
  id: string
  name: string
  specialty: string
  specialization: string
  distance: string
  address: string
  availability: string
  rating: number
  reviews: number
  image: string
  years_experience: number
}

export default function FindDoctor() {
  const { userData } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [reportId, setReportId] = useState<string | null>(null)
  const [domain, setDomain] = useState<string | null>(null)
  const [showEmptyState, setShowEmptyState] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors)
  const [loading, setLoading] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [appointmentReason, setAppointmentReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const reportIdParam = searchParams.get("reportId")
    const domainParam = searchParams.get("domain")

    setReportId(reportIdParam)
    setDomain(domainParam)

    // Check if we have the required parameters
    if (!reportIdParam || !domainParam) {
      setShowEmptyState(true)
      return
    }

    // Filter doctors by domain/specialization
    const filteredDocs = mockDoctors.filter(
      (doc) =>
        doc.specialization === domainParam ||
        doc.specialty === domainParam ||
        (domainParam === "Primary Care" && doc.specialty === "Primary Care"),
    )

    setDoctors(filteredDocs)

    // Update specialties for filter buttons
    const availableSpecialties = Array.from(new Set(filteredDocs.map((doc) => doc.specialty)))

    // Show empty state if no matching doctors
    if (filteredDocs.length === 0) {
      setShowEmptyState(true)
    }
  }, [searchParams])

  const specialties = Array.from(new Set(mockDoctors.map((doc) => doc.specialty)))

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      searchTerm === "" ||
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSpecialty = selectedSpecialty === null || doctor.specialty === selectedSpecialty

    return matchesSearch && matchesSpecialty
  })

  const handleRequestAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setDialogOpen(true)
  }

  const handleSubmitRequest = async () => {
    if (!userData || !selectedDoctor || !reportId || !domain) return

    setIsSubmitting(true)

    try {
      // Create appointment request in Firestore
      await addDoc(collection(db, "appointments"), {
        patientId: userData.uid,
        patientName: userData.displayName,
        patientEmail: userData.email,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorSpecialty: selectedDoctor.specialty,
        reason: appointmentReason,
        status: "pending",
        createdAt: serverTimestamp(),
        reportId: reportId,
        domain: domain,
      })

      toast({
        title: "Appointment request sent",
        description: `Your request has been sent to ${selectedDoctor.name}.`,
      })

      setDialogOpen(false)
      setAppointmentReason("")

      // Redirect to appointments page
      router.push("/patient/appointments")
    } catch (error) {
      console.error("Error creating appointment request:", error)
      toast({
        title: "Error",
        description: "Failed to send appointment request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find a Doctor</h1>
        <p className="text-muted-foreground">Search for specialists and request appointments</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedSpecialty === null ? "default" : "outline"}
            className={selectedSpecialty === null ? "bg-teal-600 hover:bg-teal-700" : ""}
            onClick={() => setSelectedSpecialty(null)}
          >
            All
          </Button>
          {specialties.map((specialty) => (
            <Button
              key={specialty}
              variant={selectedSpecialty === specialty ? "default" : "outline"}
              className={selectedSpecialty === specialty ? "bg-teal-600 hover:bg-teal-700" : ""}
              onClick={() => setSelectedSpecialty(specialty)}
            >
              {specialty}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <p className="text-lg">Loading doctors...</p>
          </div>
        </div>
      ) : showEmptyState ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Stethoscope className="mb-4 h-12 w-12 text-muted-foreground" />
            {!reportId || !domain ? (
              <>
                <h3 className="text-xl font-medium">Submit symptoms first</h3>
                <p className="mb-6 text-muted-foreground">
                  You need to submit your symptoms before looking for a doctor. This helps us match you with specialists
                  in the right field.
                </p>
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => router.push("/patient/symptoms")}>
                  Go to Symptom Check
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-medium">No doctors found</h3>
                <p className="mb-6 text-muted-foreground">
                  We couldn't find specialists in {domain} available right now. Try adjusting your search or contact
                  support for assistance.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : filteredDoctors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Stethoscope className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-medium">No doctors found</h3>
            <p className="mb-6 text-muted-foreground">Try adjusting your search or filters to find more doctors.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 border-b p-4">
                  <img
                    src={doctor.image || "/placeholder.svg"}
                    alt={doctor.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{doctor.name}</h3>
                    <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{doctor.rating}</span>
                      <span className="text-xs text-muted-foreground">({doctor.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <span>
                      {doctor.distance} • {doctor.address}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <span>{doctor.availability}</span>
                  </div>
                  <Button
                    className="mt-2 w-full bg-teal-600 hover:bg-teal-700"
                    onClick={() => handleRequestAppointment(doctor)}
                  >
                    Request Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Appointment</DialogTitle>
            <DialogDescription>
              {selectedDoctor && `Send an appointment request to ${selectedDoctor.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedDoctor && (
              <div className="flex items-center gap-4">
                <img
                  src={selectedDoctor.image || "/placeholder.svg"}
                  alt={selectedDoctor.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">{selectedDoctor.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedDoctor.specialty}</p>
                  <Badge className="mt-1">{selectedDoctor.availability.replace("Next available: ", "")}</Badge>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for appointment</Label>
              <Textarea
                id="reason"
                placeholder="Briefly describe your symptoms or reason for the appointment"
                value={appointmentReason}
                onChange={(e) => setAppointmentReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSubmitRequest} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
