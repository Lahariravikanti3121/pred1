import type { ReactNode } from "react"
import ProtectedRoute from "@/components/auth/protected-route"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <DashboardLayout role="patient">{children}</DashboardLayout>
    </ProtectedRoute>
  )
}
