"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function DashboardRedirect() {
  const { userData, loading } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!userData) {
        // Not logged in, redirect to login
        router.push("/login")
        return
      }

      setRedirecting(true)

      // Redirect based on role
      if (userData.role === "patient") {
        router.push("/patient/dashboard")
      } else if (userData.role === "doctor") {
        router.push("/doctor/dashboard")
      } else if (userData.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        // Unknown role
        toast({
          title: "Unknown user role",
          description: "Your account type is not recognized. Please contact support.",
          variant: "destructive",
        })
        router.push("/")
      }
    }
  }, [userData, loading, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="text-lg">{redirecting ? "Redirecting to your dashboard..." : "Loading..."}</p>
      </div>
    </div>
  )
}
