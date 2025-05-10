"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ArrowLeft, Calendar, AlertTriangle, CheckCircle, Clock, Printer, UserRound } from "lucide-react"

interface Report {
  id: string
  createdAt: Date
  diagnosis: {
    primary: string
    confidence: string
    differential: string[]
    domain?: string
  }
  urgency: string
  recommendations: string[]
  followUp: string
  domain?: string
}

export default function ReportDetailPage() {
  const { userData } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const reportId = params.id as string

  useEffect(() => {
    const fetchReport = async () => {
      if (!userData || !params.id) return

      try {
        // Updated to use the top-level reports collection
        const reportRef = doc(db, "reports", params.id as string)
        const reportDoc = await getDoc(reportRef)

        if (reportDoc.exists()) {
          const data = reportDoc.data()

          // Verify this report belongs to the current user
          if (data.userId !== userData.uid) {
            router.push("/patient/reports")
            return
          }

          setReport({
            id: reportDoc.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            diagnosis: data.diagnosis,
            urgency: data.urgency,
            recommendations: data.recommendations,
            followUp: data.followUp,
            domain: data.domain,
          })
        } else {
          router.push("/patient/reports")
        }
      } catch (error) {
        console.error("Error fetching report:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [userData, params.id, router])

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "High":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            High
          </Badge>
        )
      case "Medium":
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-amber-500">
            <Clock className="h-3 w-3" />
            Medium
          </Badge>
        )
      case "Low":
        return (
          <Badge variant="outline" className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-3 w-3" />
            Low
          </Badge>
        )
      default:
        return <Badge variant="outline">{urgency}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report Not Found</h1>
          <p className="text-muted-foreground">The report you're looking for doesn't exist or you don't have access.</p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/patient/reports">
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link href="/patient/reports">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Health Report</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{report.diagnosis.primary}</CardTitle>
            {getUrgencyBadge(report.urgency)}
          </div>
          <CardDescription className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {report.createdAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-2 font-semibold">Diagnosis</h3>
            <p>
              Based on your symptoms, our AI system has identified <strong>{report.diagnosis.primary}</strong> as the
              most likely diagnosis with <strong>{report.diagnosis.confidence}</strong> confidence.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Differential Diagnosis</h3>
            <p className="mb-2">Other conditions that could explain your symptoms include:</p>
            <ul className="ml-6 list-disc">
              {report.diagnosis.differential.map((diagnosis, index) => (
                <li key={index}>{diagnosis}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Recommendations</h3>
            <ul className="ml-6 list-disc">
              {report.recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Follow-up</h3>
            <p>{report.followUp}</p>
          </div>

          <div className="rounded-md bg-amber-50 p-4 text-amber-800">
            <p className="text-sm">
              <strong>Disclaimer:</strong> This is an AI-generated report and should not replace professional medical
              advice. Please consult with a healthcare provider for proper diagnosis and treatment.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Back to Reports
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-teal-600 text-teal-600 hover:bg-teal-50 hover:text-teal-700"
                onClick={() => window.print()}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Report
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700"
                onClick={() =>
                  router.push(
                    `/patient/appointments/new?reportId=${reportId}&domain=${encodeURIComponent(report?.domain || "Primary Care")}`,
                  )
                }
              >
                <UserRound className="mr-2 h-4 w-4" />
                Find Specialist
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
