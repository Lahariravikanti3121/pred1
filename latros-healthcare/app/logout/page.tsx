"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Loader2 } from "lucide-react"

export default function Logout() {
  const { logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout()
        router.push("/")
      } catch (error) {
        console.error("Error during logout:", error)
        router.push("/")
      }
    }

    performLogout()
  }, [logout, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="text-lg">Logging out...</p>
      </div>
    </div>
  )
}
