import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Stethoscope,
  Brain,
  ClipboardList,
  Hospital,
  Phone,
  Calendar,
  Lock,
  LayoutDashboard,
  Globe,
  LineChart,
  Link2,
  Pill,
} from "lucide-react"

export default function FeaturesPage() {
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
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Our Features</h1>
                <p className="max-w-[800px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover how Latros is revolutionizing healthcare with cutting-edge AI technology and seamless user
                  experiences.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="p-6 flex flex-col items-start space-y-4">
                  <div className="rounded-full bg-teal-100 p-3">
                    <Brain className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">AI-Driven Diagnosis Engine</h3>
                    <p className="text-gray-500 mt-2">
                      Analyze symptoms, medical history, and optional genetic data using trained machine learning models
                      to generate accurate diagnostic reports.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex flex-col items-start space-y-4">
                  <div className="rounded-full bg-teal-100 p-3">
                    <ClipboardList className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Personalized Medical Reports</h3>
                    <p className="text-gray-500 mt-2">
                      Deliver user-specific health insights along with actionable next steps — self-care tips,
                      recommended tests, or treatments.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex flex-col items-start space-y-4">
                  <div className="rounded-full bg-teal-100 p-3">
                    <Hospital className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Intelligent Doctor & Hospital Suggestions</h3>
                    <p className="text-gray-500 mt-2">
                      Automatically match patients with nearby hospitals and the most suitable specialists based on the
                      diagnosis.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex flex-col items-start space-y-4">
                  <div className="rounded-full bg-teal-100 p-3">
                    <Phone className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">One-Click Teleconsultation</h3>
                    <p className="text-gray-500 mt-2">
                      Allow patients to instantly request a call with a specialist; appointment gets scheduled
                      automatically when accepted.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex flex-col items-start space-y-4">
                  <div className="rounded-full bg-teal-100 p-3">
                    <Calendar className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Integrated Scheduling System</h3>
                    <p className="text-gray-500 mt-2">
                      Sync confirmed appointments directly into the doctor's ClickUp or similar portals, with automated
                      reminders and rescheduling options.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex flex-col items-start space-y-4">
                  <div className="rounded-full bg-teal-100 p-3">
                    <Lock className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">End-to-End Data Privacy</h3>
                    <p className="text-gray-500 mt-2">
                      Ensure compliance with HIPAA, GDPR, and other healthcare data regulations, with encrypted storage
                      and secure access protocols.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex flex-col items-start space-y-4">
                  <div className="rounded-full bg-teal-100 p-3">
                    <LayoutDashboard className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Doctor Dashboard with AI Insights</h3>
                    <p className="text-gray-500 mt-2">
                      Provide healthcare professionals with an intuitive interface to view AI-generated case summaries
                      and treatment recommendations.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex flex-col items-start space-y-4">
                  <div className="rounded-full bg-teal-100 p-3">
                    <Globe className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Multilingual and User-Friendly Interface</h3>
                    <p className="text-gray-500 mt-2">
                      Accessible design supporting multiple languages and simple navigation for users from all
                      backgrounds.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex flex-col items-start space-y-4">
                  <div className="rounded-full bg-teal-100 p-3">
                    <LineChart className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Health Record Tracking & Updates</h3>
                    <p className="text-gray-500 mt-2">
                      Store and manage user health records securely, allowing periodic AI-based re-evaluation and
                      personalized health tracking over time.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex flex-col items-start space-y-4">
                  <div className="rounded-full bg-teal-100 p-3">
                    <Link2 className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Seamless EHR Integration</h3>
                    <p className="text-gray-500 mt-2">
                      Compatible with existing electronic health record systems, allowing smooth data exchange for
                      professionals and institutions.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex flex-col items-start space-y-4">
                  <div className="rounded-full bg-teal-100 p-3">
                    <Pill className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Smart Medicine Advice</h3>
                    <p className="text-gray-500 mt-2">
                      We provide AI-generated medication and pharmacy suggestions tailored to the patient's diagnosis
                      and history. These suggestions are visible only to the consulting doctor, who can review, approve,
                      or modify them.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-16 text-center">
              <Link href="/register">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                  Get Started Today
                </Button>
              </Link>
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
