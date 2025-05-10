import type { ReactNode } from "react"
import ProtectedRoute from "@/components/auth/protected-route"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function DoctorLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <DashboardLayout role="doctor">{children}</DashboardLayout>
    </ProtectedRoute>
  )
}
