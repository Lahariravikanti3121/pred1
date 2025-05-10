"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
  redirectTo?: string
}

export default function ProtectedRoute({ children, allowedRoles, redirectTo = "/login" }: ProtectedRouteProps) {
  const { userData, loading } = useAuth()
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!userData) {
        // Not logged in, redirect to login
        router.push(redirectTo)
        return
      }

      if (!allowedRoles.includes(userData.role)) {
        // Not authorized for this route
        toast({
          title: "Access denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        })

        // Redirect to appropriate dashboard based on role
        if (userData.role === "patient") {
          router.push("/patient/dashboard")
        } else if (userData.role === "doctor") {
          router.push("/doctor/dashboard")
        } else {
          router.push("/dashboard")
        }
        return
      }

      // User is authorized
      setAuthorized(true)
    }
  }, [userData, loading, allowedRoles, redirectTo, router])

  if (loading || !authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
