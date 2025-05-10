import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Stethoscope, Brain, Hospital, Calendar, Shield, ArrowRight } from "lucide-react"

export default function AboutPage() {
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
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">About Latros</h1>
                <p className="max-w-[800px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  A cutting-edge AI-driven healthcare platform designed to revolutionize the way individuals access,
                  understand, and act on their health data.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl gap-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter mb-4">Our Mission</h2>
                <p className="text-gray-500 md:text-xl/relaxed">
                  Our mission is to bridge the gap between patients and quality medical care using advanced artificial
                  intelligence, secure data integration, and seamless digital communication.
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="rounded-full bg-teal-100 p-3">
                      <Brain className="h-6 w-6 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold">Personalized Treatment Recommendations</h3>
                    <p className="text-gray-500">
                      Latros delivers clear, data-driven suggestions tailored to your unique health profile — whether
                      that means self-care, tests, medications, or a visit to a medical specialist.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="rounded-full bg-teal-100 p-3">
                      <Hospital className="h-6 w-6 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold">Smart Doctor & Hospital Matching</h3>
                    <p className="text-gray-500">
                      We help you locate nearby hospitals and connect you with top-rated, condition-specific specialists
                      based on your diagnostic results.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="rounded-full bg-teal-100 p-3">
                      <Calendar className="h-6 w-6 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold">Integrated Scheduling & Follow-Up</h3>
                    <p className="text-gray-500">
                      Patients and doctors enjoy frictionless appointment scheduling, reminders, and access to shared
                      case documentation — all synced into their dashboards.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="rounded-full bg-teal-100 p-3">
                      <Stethoscope className="h-6 w-6 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold">Seamless Teleconsultation Experience</h3>
                    <p className="text-gray-500">
                      Once a doctor is selected, patients can instantly request a consultation. Upon the doctor's
                      acceptance, an appointment is automatically scheduled and linked to the doctor's ClickUp portal
                      for a smooth experience.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="rounded-full bg-teal-100 p-3">
                      <Shield className="h-6 w-6 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold">Privacy-First Design</h3>
                    <p className="text-gray-500">
                      Latros is built with patient safety and confidentiality in mind, fully compliant with HIPAA, GDPR,
                      and other global health data standards.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-500 md:text-xl/relaxed mb-6">
                  Latros stands at the intersection of AI, telemedicine, and personalized care — building a future where
                  healthcare is smarter, faster, and more accessible to all.
                </p>
                <Link href="/features">
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    Explore Our Features
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
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
