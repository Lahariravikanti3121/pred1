import Link from "next/link"
import type { ReactNode } from "react"
import { Stethoscope, Menu, X, Home, Calendar, FileText, Users, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar"

interface DashboardLayoutProps {
  children: ReactNode
  role: "patient" | "doctor"
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const patientNavItems = [
    { name: "Dashboard", href: "/patient/dashboard", icon: Home },
    { name: "Symptoms", href: "/patient/symptoms", icon: FileText },
    { name: "Appointments", href: "/patient/appointments", icon: Calendar },
    { name: "Doctors", href: "/patient/doctors", icon: Users },
    { name: "Reports", href: "/patient/reports", icon: FileText },
    { name: "Settings", href: "/patient/settings", icon: Settings },
  ]

  const doctorNavItems = [
    { name: "Dashboard", href: "/doctor/dashboard", icon: Home },
    { name: "Patients", href: "/doctor/patients", icon: Users },
    { name: "Appointments", href: "/doctor/appointments", icon: Calendar },
    { name: "Reports", href: "/doctor/reports", icon: FileText },
    { name: "Settings", href: "/doctor/settings", icon: Settings },
  ]

  const navItems = role === "patient" ? patientNavItems : doctorNavItems

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static md:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 sm:max-w-none">
              <div className="flex h-14 items-center border-b px-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                  <Stethoscope className="h-6 w-6 text-teal-600" />
                  <span>Latros</span>
                </Link>
                <div className="ml-auto">
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetTrigger>
                </div>
              </div>
              <nav className="grid gap-2 p-4 text-lg font-medium">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
                <Link
                  href="/logout"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-red-500 hover:bg-accent"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2 font-bold text-xl md:hidden">
            <Stethoscope className="h-6 w-6 text-teal-600" />
            <span>Latros</span>
          </Link>
        </header>
        <div className="flex flex-1">
          {/* Desktop sidebar */}
          <Sidebar className="hidden md:flex">
            <SidebarHeader className="border-b p-4">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                <Stethoscope className="h-6 w-6 text-teal-600" />
                <span>Latros</span>
              </Link>
            </SidebarHeader>
            <SidebarContent className="p-2">
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild>
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/logout" className="flex items-center gap-3 text-red-500">
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
          {/* Main content */}
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
