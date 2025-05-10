"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AlertTriangle, CheckCircle, Clock, ChevronRight } from "lucide-react"

interface Report {
  id: string
  createdAt: Date
  diagnosis: {
    primary: string
    confidence: string
    differential: string[]
  }
  urgency: string
  recommendations: string[]
  followUp: string
  domain?: string
}

export default function ReportsPage() {
  const { userData } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      if (!userData) return

      try {
        // Updated to use the top-level reports collection
        const reportsRef = collection(db, "reports")
        const q = query(reportsRef, where("userId", "==", userData.uid), orderBy("createdAt", "desc"))

        const querySnapshot = await getDocs(q)
        const reportsList: Report[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          reportsList.push({
            id: doc.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            diagnosis: data.diagnosis,
            urgency: data.urgency,
            recommendations: data.recommendations,
            followUp: data.followUp,
            domain: data.domain,
          })
        })

        setReports(reportsList)
      } catch (error) {
        console.error("Error fetching reports:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [userData])

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

  const getUrgencyVariant = (urgency: string) => {
    switch (urgency) {
      case "High":
        return "destructive"
      case "Medium":
        return "default"
      case "Low":
        return "outline"
      default:
        return "outline"
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-96" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Health Reports</h1>
        <p className="text-muted-foreground">View your AI-generated health reports and recommendations</p>
      </div>

      <div className="flex justify-between">
        <div></div>
        <Button asChild className="bg-teal-600 hover:bg-teal-700">
          <Link href="/patient/symptoms">New Symptom Check</Link>
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Reports Yet</CardTitle>
            <CardDescription>
              You haven't submitted any symptom checks yet. Start a new symptom check to get your first health report.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="bg-teal-600 hover:bg-teal-700">
              <Link href="/patient/symptoms">Start Symptom Check</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="mb-4">
              <CardContent className="p-0">
                <div className="flex flex-col justify-between gap-2 border-b p-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-semibold">{report.diagnosis?.primary || "Diagnosis pending"}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={getUrgencyVariant(report.urgency)}>{report.urgency} Urgency</Badge>
                      {report.domain && <Badge variant="outline">{report.domain}</Badge>}
                      <span className="text-xs text-muted-foreground">{formatDate(report.createdAt)}</span>
                    </div>
                  </div>
                  <Button variant="ghost" asChild className="mt-2 gap-1 sm:mt-0">
                    <Link href={`/patient/reports/${report.id}`}>
                      <span>View Details</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
