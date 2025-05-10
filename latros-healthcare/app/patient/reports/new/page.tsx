"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { FileText, MapPin, Calendar, AlertCircle } from "lucide-react"

// Mock data for the AI-generated report
const mockReport = {
  id: "report-123",
  createdAt: new Date().toISOString(),
  symptoms: {
    main: "Persistent headache on the right side of my head for the past week",
    duration: "1 week",
    additional: "Sensitivity to light, mild nausea in the mornings",
  },
  diagnosis: {
    primary: "Tension Headache",
    confidence: "High",
    differential: ["Migraine", "Cluster Headache", "Sinus Headache"],
  },
  recommendations: [
    "Over-the-counter pain relievers such as ibuprofen or acetaminophen",
    "Apply a warm or cool compress to your head for 10-15 minutes at a time",
    "Practice stress-reduction techniques such as deep breathing or meditation",
    "Ensure adequate hydration and regular meals",
    "Maintain a consistent sleep schedule",
  ],
  urgency: "Low",
  followUp: "Consult with a healthcare provider if symptoms persist beyond 2 weeks or worsen",
}

// Mock data for nearby specialists
const mockSpecialists = [
  {
    id: "doc-1",
    name: "Dr. Sarah Johnson",
    specialty: "Neurologist",
    distance: "2.3 miles",
    address: "123 Medical Center Dr, Suite 101",
    availability: "Next available: Tomorrow at 2:00 PM",
  },
  {
    id: "doc-2",
    name: "Dr. Michael Chen",
    specialty: "Primary Care Physician",
    distance: "1.5 miles",
    address: "456 Health Parkway, Building B",
    availability: "Next available: Today at 4:30 PM",
  },
  {
    id: "doc-3",
    name: "Dr. Emily Rodriguez",
    specialty: "Headache Specialist",
    distance: "3.8 miles",
    address: "789 Wellness Blvd, Suite 205",
    availability: "Next available: Thursday at 10:15 AM",
  },
]

export default function NewReport() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("diagnosis")
  const [report, setReport] = useState(mockReport)
  const [specialists, setSpecialists] = useState(mockSpecialists)

  const handleRequestAppointment = (doctorId: string) => {
    toast({
      title: "Appointment request sent",
      description: "The doctor will be notified of your request.",
    })
  }

  return (
    <DashboardLayout role="patient">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Health Report</h1>
            <p className="text-muted-foreground">AI-generated diagnosis based on your symptoms</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/patient/dashboard")}>
              Back to Dashboard
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700">Save Report</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-2xl">Diagnosis Report</CardTitle>
                <CardDescription>Generated on {new Date(report.createdAt).toLocaleDateString()}</CardDescription>
              </div>
              <Badge className="w-fit bg-yellow-500 hover:bg-yellow-600">{report.urgency} Urgency</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="diagnosis" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="specialists">Find Specialists</TabsTrigger>
              </TabsList>
              <TabsContent value="diagnosis" className="space-y-4 pt-4">
                <div>
                  <h3 className="text-lg font-medium">Reported Symptoms</h3>
                  <div className="mt-2 rounded-lg border p-4">
                    <p className="font-medium">Main Concern:</p>
                    <p className="text-muted-foreground">{report.symptoms.main}</p>
                    <p className="mt-2 font-medium">Duration:</p>
                    <p className="text-muted-foreground">{report.symptoms.duration}</p>
                    <p className="mt-2 font-medium">Additional Symptoms:</p>
                    <p className="text-muted-foreground">{report.symptoms.additional || "None reported"}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Primary Diagnosis</h3>
                  <div className="mt-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-semibold">{report.diagnosis.primary}</p>
                      <Badge variant="outline">{report.diagnosis.confidence} Confidence</Badge>
                    </div>
                    <p className="mt-4 font-medium">Differential Diagnoses:</p>
                    <ul className="ml-6 list-disc text-muted-foreground">
                      {report.diagnosis.differential.map((diagnosis, index) => (
                        <li key={index}>{diagnosis}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">Important Note</p>
                      <p className="text-sm text-yellow-700">
                        This AI-generated diagnosis is not a substitute for professional medical advice. Please consult
                        with a healthcare provider for a proper evaluation.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="recommendations" className="space-y-4 pt-4">
                <div>
                  <h3 className="text-lg font-medium">Recommended Actions</h3>
                  <div className="mt-2 rounded-lg border p-4">
                    <ul className="space-y-2">
                      {report.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="mt-1 h-2 w-2 rounded-full bg-teal-600"></div>
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Follow-up Guidance</h3>
                  <div className="mt-2 rounded-lg border p-4">
                    <p>{report.followUp}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setActiveTab("specialists")}>
                    Find a Specialist
                  </Button>
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="specialists" className="space-y-4 pt-4">
                <div>
                  <h3 className="text-lg font-medium">Nearby Specialists</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on your diagnosis, we recommend the following healthcare providers
                  </p>
                  <div className="mt-4 space-y-4">
                    {specialists.map((doctor) => (
                      <Card key={doctor.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <h4 className="font-semibold">{doctor.name}</h4>
                              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                              <div className="mt-2 flex items-center gap-1 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {doctor.distance} • {doctor.address}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center gap-1 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{doctor.availability}</span>
                              </div>
                            </div>
                            <Button
                              className="mt-2 bg-teal-600 hover:bg-teal-700 md:mt-0"
                              onClick={() => handleRequestAppointment(doctor.id)}
                            >
                              Request Appointment
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2">
            <p className="text-sm text-muted-foreground">
              This report is based on the symptoms you provided and is generated using AI technology. It is not a
              substitute for professional medical advice, diagnosis, or treatment.
            </p>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  )
}
