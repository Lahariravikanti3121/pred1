"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ArrowRight, Loader2 } from "lucide-react"

interface SymptomFormData {
  mainSymptom: string
  duration: string
  severity: "mild" | "moderate" | "severe"
  additionalSymptoms: string
  medicalHistory: string
  medications: string
  allergies: string
  consentToShare: boolean
}

export default function SymptomCheck() {
  const { userData } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [formData, setFormData] = useState<SymptomFormData>({
    mainSymptom: "",
    duration: "",
    severity: "moderate",
    additionalSymptoms: "",
    medicalHistory: "",
    medications: "",
    allergies: "",
    consentToShare: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSeverityChange = (value: "mild" | "moderate" | "severe") => {
    setFormData((prev) => ({ ...prev, severity: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, consentToShare: checked }))
  }

  const handleNextStep = () => {
    if (step === 1 && !formData.mainSymptom) {
      toast({
        title: "Required field",
        description: "Please describe your main symptom.",
        variant: "destructive",
      })
      return
    }
    setStep((prev) => prev + 1)
  }

  const handlePrevStep = () => {
    setStep((prev) => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.consentToShare) {
      toast({
        title: "Consent required",
        description: "Please provide consent to share your data for diagnosis.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (!userData) {
        throw new Error("User not authenticated")
      }

      // Generate the medical domain based on symptoms
      const medicalDomain = detectMedicalDomain(formData.mainSymptom, formData.additionalSymptoms)

      // Save symptom data to Firestore
      const symptomsRef = collection(db, "symptoms")
      const symptomDoc = await addDoc(symptomsRef, {
        ...formData,
        userId: userData.uid,
        userEmail: userData.email,
        userName: userData.displayName,
        createdAt: serverTimestamp(),
        status: "pending",
        patientId: userData.uid,
        domain: medicalDomain, // Add the detected domain
      })

      // Generate a report based on the symptoms
      setIsSubmitting(false)
      setIsGeneratingReport(true)

      // Create a report in Firestore
      // Using a top-level collection for reports as well
      const reportsRef = collection(db, "reports")
      const reportDoc = await addDoc(reportsRef, {
        symptomInputId: symptomDoc.id,
        userId: userData.uid,
        patientId: userData.uid,
        createdAt: serverTimestamp(),
        domain: medicalDomain, // Add the detected domain
        diagnosis: {
          primary: generateDiagnosis(formData.mainSymptom, formData.severity),
          confidence: "Medium",
          differential: generateDifferentialDiagnosis(formData.mainSymptom),
        },
        recommendations: generateRecommendations(formData.mainSymptom, formData.severity),
        urgency: formData.severity === "severe" ? "High" : formData.severity === "moderate" ? "Medium" : "Low",
        followUp:
          formData.severity === "severe"
            ? "Consult with a healthcare provider immediately"
            : "Consult with a healthcare provider within the next few days",
      })

      // Simulate AI processing time
      setTimeout(() => {
        setIsGeneratingReport(false)
        // Redirect to find doctors page with report ID and domain
        router.push(`/patient/appointments/new?reportId=${reportDoc.id}&domain=${encodeURIComponent(medicalDomain)}`)
      }, 3000)
    } catch (error) {
      console.error("Error submitting symptoms:", error)
      toast({
        title: "Submission failed",
        description: "There was an error submitting your symptoms. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      setIsGeneratingReport(false)
    }
  }

  // Simple placeholder functions to generate mock diagnosis data
  const generateDiagnosis = (symptom: string, severity: string): string => {
    const symptoms = symptom.toLowerCase()

    if (symptoms.includes("headache")) {
      return severity === "severe" ? "Migraine" : "Tension Headache"
    } else if (symptoms.includes("cough")) {
      return severity === "severe" ? "Bronchitis" : "Common Cold"
    } else if (symptoms.includes("stomach") || symptoms.includes("nausea")) {
      return "Gastroenteritis"
    } else if (symptoms.includes("fever")) {
      return "Viral Infection"
    } else if (symptoms.includes("pain")) {
      return "Musculoskeletal Pain"
    } else {
      return "General Malaise"
    }
  }

  const generateDifferentialDiagnosis = (symptom: string): string[] => {
    const symptoms = symptom.toLowerCase()

    if (symptoms.includes("headache")) {
      return ["Tension Headache", "Migraine", "Sinusitis", "Dehydration"]
    } else if (symptoms.includes("cough")) {
      return ["Common Cold", "Allergies", "Bronchitis", "COVID-19"]
    } else if (symptoms.includes("stomach") || symptoms.includes("nausea")) {
      return ["Gastroenteritis", "Food Poisoning", "Irritable Bowel Syndrome", "Acid Reflux"]
    } else if (symptoms.includes("fever")) {
      return ["Viral Infection", "Bacterial Infection", "COVID-19", "Influenza"]
    } else if (symptoms.includes("pain")) {
      return ["Muscle Strain", "Arthritis", "Fibromyalgia", "Nerve Compression"]
    } else {
      return ["Stress", "Fatigue", "Viral Infection", "Dehydration"]
    }
  }

  const generateRecommendations = (symptom: string, severity: string): string[] => {
    const symptoms = symptom.toLowerCase()
    const baseRecommendations = ["Ensure adequate hydration", "Get plenty of rest", "Monitor your symptoms"]

    if (symptoms.includes("headache")) {
      return [
        ...baseRecommendations,
        "Over-the-counter pain relievers such as ibuprofen or acetaminophen",
        "Apply a cool compress to your forehead",
        severity === "severe" ? "Consult with a neurologist" : "Reduce screen time and eye strain",
      ]
    } else if (symptoms.includes("cough")) {
      return [
        ...baseRecommendations,
        "Over-the-counter cough suppressants",
        "Honey and warm tea for sore throat",
        severity === "severe" ? "Consult with a pulmonologist" : "Use a humidifier",
      ]
    } else {
      return [
        ...baseRecommendations,
        "Over-the-counter pain relievers if needed",
        "Balanced diet to support recovery",
        severity === "severe"
          ? "Seek immediate medical attention"
          : "Follow up with your primary care physician if symptoms persist",
      ]
    }
  }

  // Function to detect medical domain from symptoms
  const detectMedicalDomain = (mainSymptom: string, additionalSymptoms = ""): string => {
    const combinedSymptoms = (mainSymptom + " " + additionalSymptoms).toLowerCase()

    // Cardiology related symptoms
    if (
      combinedSymptoms.includes("chest pain") ||
      combinedSymptoms.includes("heart") ||
      combinedSymptoms.includes("palpitation") ||
      combinedSymptoms.includes("shortness of breath") ||
      combinedSymptoms.includes("hypertension")
    ) {
      return "Cardiology"
    }

    // Dermatology related symptoms
    if (
      combinedSymptoms.includes("rash") ||
      combinedSymptoms.includes("skin") ||
      combinedSymptoms.includes("itching") ||
      combinedSymptoms.includes("acne") ||
      combinedSymptoms.includes("hair loss")
    ) {
      return "Dermatology"
    }

    // Neurology related symptoms
    if (
      combinedSymptoms.includes("headache") ||
      combinedSymptoms.includes("migraine") ||
      combinedSymptoms.includes("seizure") ||
      combinedSymptoms.includes("dizziness") ||
      combinedSymptoms.includes("stroke")
    ) {
      return "Neurology"
    }

    // Gastroenterology related symptoms
    if (
      combinedSymptoms.includes("stomach") ||
      combinedSymptoms.includes("nausea") ||
      combinedSymptoms.includes("vomiting") ||
      combinedSymptoms.includes("diarrhea") ||
      combinedSymptoms.includes("constipation") ||
      combinedSymptoms.includes("abdominal pain")
    ) {
      return "Gastroenterology"
    }

    // Orthopedics related symptoms
    if (
      combinedSymptoms.includes("bone") ||
      combinedSymptoms.includes("joint pain") ||
      combinedSymptoms.includes("fracture") ||
      combinedSymptoms.includes("back pain") ||
      combinedSymptoms.includes("knee pain") ||
      combinedSymptoms.includes("arthritis")
    ) {
      return "Orthopedics"
    }

    // Psychology related symptoms
    if (
      combinedSymptoms.includes("anxiety") ||
      combinedSymptoms.includes("depression") ||
      combinedSymptoms.includes("stress") ||
      combinedSymptoms.includes("insomnia") ||
      combinedSymptoms.includes("mental health")
    ) {
      return "Psychology"
    }

    // Return general practice as a fallback
    return "Primary Care"
  }

  if (isGeneratingReport) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
          <h2 className="text-2xl font-bold">Generating your health report</h2>
          <p className="max-w-md text-muted-foreground">
            Our AI is analyzing your symptoms and generating a comprehensive health report. This may take a moment.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Symptom Check</h1>
        <p className="text-muted-foreground">Tell us about your symptoms for an AI-powered diagnosis</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "Describe Your Symptoms"}
            {step === 2 && "Medical History"}
            {step === 3 && "Review & Submit"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Please provide details about what you're experiencing"}
            {step === 2 && "Information about your medical background"}
            {step === 3 && "Review your information before submission"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mainSymptom" className="required">
                    What is your main symptom or concern?
                  </Label>
                  <Textarea
                    id="mainSymptom"
                    name="mainSymptom"
                    placeholder="Describe your main symptom in detail"
                    value={formData.mainSymptom}
                    onChange={handleInputChange}
                    className="min-h-[100px]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">How long have you been experiencing this?</Label>
                  <Input
                    id="duration"
                    name="duration"
                    placeholder="e.g., 3 days, 2 weeks, etc."
                    value={formData.duration}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <RadioGroup
                    value={formData.severity}
                    onValueChange={(value) => handleSeverityChange(value as "mild" | "moderate" | "severe")}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mild" id="mild" />
                      <Label htmlFor="mild">Mild</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="moderate" id="moderate" />
                      <Label htmlFor="moderate">Moderate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="severe" id="severe" />
                      <Label htmlFor="severe">Severe</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additionalSymptoms">Any additional symptoms?</Label>
                  <Textarea
                    id="additionalSymptoms"
                    name="additionalSymptoms"
                    placeholder="List any other symptoms you're experiencing"
                    value={formData.additionalSymptoms}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="medicalHistory">Do you have any relevant medical history?</Label>
                  <Textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    placeholder="List any chronic conditions, previous surgeries, etc."
                    value={formData.medicalHistory}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medications">Are you currently taking any medications?</Label>
                  <Textarea
                    id="medications"
                    name="medications"
                    placeholder="List medications and dosages"
                    value={formData.medications}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Do you have any allergies?</Label>
                  <Textarea
                    id="allergies"
                    name="allergies"
                    placeholder="List any allergies to medications, foods, etc."
                    value={formData.allergies}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Main Symptom</h3>
                    <p className="text-sm text-muted-foreground">{formData.mainSymptom || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Duration</h3>
                    <p className="text-sm text-muted-foreground">{formData.duration || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Severity</h3>
                    <p className="text-sm text-muted-foreground">{formData.severity}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Additional Symptoms</h3>
                    <p className="text-sm text-muted-foreground">{formData.additionalSymptoms || "None"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Medical History</h3>
                    <p className="text-sm text-muted-foreground">{formData.medicalHistory || "None"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Medications</h3>
                    <p className="text-sm text-muted-foreground">{formData.medications || "None"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Allergies</h3>
                    <p className="text-sm text-muted-foreground">{formData.allergies || "None"}</p>
                  </div>
                  <div className="flex items-start space-x-2 pt-4">
                    <Checkbox
                      id="consentToShare"
                      checked={formData.consentToShare}
                      onCheckedChange={handleCheckboxChange}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="consentToShare"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I consent to share my health data for diagnosis
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Your data is encrypted and protected in accordance with HIPAA regulations.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={handlePrevStep}>
                Back
              </Button>
            ) : (
              <div></div>
            )}
            {step < 3 ? (
              <Button type="button" onClick={handleNextStep} className="bg-teal-600 hover:bg-teal-700">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit for Diagnosis"
                )}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
