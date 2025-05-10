import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Stethoscope, FileText } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Stethoscope className="h-6 w-6 text-teal-600" />
            <span>Latros</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-teal-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="rounded-full bg-teal-100 p-4">
                <FileText className="h-8 w-8 text-teal-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Terms & Conditions</h1>
                <p className="max-w-[800px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  The rules and guidelines for using our platform
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl space-y-8">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">1. Acceptance of Terms</h2>
                  <p className="text-gray-500">
                    By accessing or using our platform, you agree to abide by these Terms and Conditions and our Privacy
                    Policy.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">2. User Eligibility</h2>
                  <p className="text-gray-500">
                    You must be at least 18 years old or have the consent of a parent/guardian to use the platform.
                    Doctors and healthcare professionals must provide verified credentials.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">3. Medical Disclaimer</h2>
                  <p className="text-gray-500">
                    Our platform provides AI-generated recommendations, not definitive diagnoses. All medical decisions
                    are finalized only by licensed healthcare professionals. We are not liable for self-treatment
                    decisions made without doctor consultation.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">4. Account Responsibility</h2>
                  <p className="text-gray-500">
                    Users are responsible for maintaining the confidentiality of their account credentials. Any activity
                    under your account is your responsibility.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">5. Use of the Platform</h2>
                  <p className="text-gray-500">
                    You agree to use the platform only for lawful medical-related purposes. Misuse, data tampering, or
                    uploading false health records is strictly prohibited.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">6. Appointment Scheduling & Teleconsultation</h2>
                  <p className="text-gray-500">
                    Our platform enables appointment scheduling and call integration with doctors. We are not liable for
                    missed appointments, call failures, or delays caused by third-party tools.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">7. Platform Limitations</h2>
                  <p className="text-gray-500">
                    We do not replace emergency medical services. If you are experiencing a medical emergency, please
                    contact your local emergency service immediately.
                  </p>
                </CardContent>
              </Card>

              <div className="text-center">
                <p className="text-gray-500 mb-4">Last updated: May 2, 2025</p>
                <Link href="/contact">
                  <Button className="bg-teal-600 hover:bg-teal-700">Contact Us With Questions</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-gray-100">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12 px-4 md:px-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 font-bold text-xl">
              <Stethoscope className="h-6 w-6 text-teal-600" />
              <span>Latros</span>
            </div>
            <p className="text-sm text-gray-500">Connecting patients with doctors through AI-powered healthcare.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            <div className="space-y-2">
              <h4 className="font-medium">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:underline">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="hover:underline">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:underline">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/faq" className="hover:underline">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:underline">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="hover:underline">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:underline">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t py-6 text-center text-sm">
          <p>© {new Date().getFullYear()} Latros. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
