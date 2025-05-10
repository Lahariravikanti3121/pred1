import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Stethoscope, Lock } from "lucide-react"

export default function PrivacyPage() {
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
                <Lock className="h-8 w-8 text-teal-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Privacy Policy</h1>
                <p className="max-w-[800px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  How we protect your data and respect your privacy
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
                  <h2 className="text-xl font-bold mb-4">1. Personal Information Collection</h2>
                  <p className="text-gray-500">
                    We collect personal details such as name, age, gender, contact information, symptoms, health
                    history, and optionally, genetic profile — only when provided by the user.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">2. Medical Data Handling</h2>
                  <p className="text-gray-500">
                    All health-related inputs, diagnostic results, treatment suggestions, and consultation records are
                    encrypted and securely stored. We do not share this data without user consent.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">3. AI Decision-Making Transparency</h2>
                  <p className="text-gray-500">
                    Our AI models generate recommendations based on approved medical datasets. Final decisions (like
                    prescriptions or treatment) are always reviewed and approved by certified doctors.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">4. Use of Cookies & Analytics</h2>
                  <p className="text-gray-500">
                    We use cookies to enhance your browsing experience and analytics to improve platform performance.
                    Users can opt out through browser settings.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">5. Data Sharing with Healthcare Providers</h2>
                  <p className="text-gray-500">
                    Information is shared only with the doctors or hospitals selected by the patient, strictly for
                    medical consultation purposes.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">6. Third-Party Services</h2>
                  <p className="text-gray-500">
                    We may use secure third-party services (e.g., payment gateways, video call platforms, scheduling
                    tools) — all compliant with relevant privacy laws.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">7. User Access & Control</h2>
                  <p className="text-gray-500">
                    Users can view, update, or delete their profile and medical history at any time. They also have the
                    right to request a full export of their data.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">8. Children's Privacy</h2>
                  <p className="text-gray-500">
                    Users under the age of 18 must be represented by a parent or guardian. We do not knowingly collect
                    data from children without proper consent.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">9. Compliance with Laws</h2>
                  <p className="text-gray-500">
                    We strictly adhere to data protection laws such as GDPR (Europe), HIPAA (US), and local regulations
                    based on operating regions.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">10. Security Practices</h2>
                  <p className="text-gray-500">
                    End-to-end encryption, two-factor authentication, access control, and regular security audits are
                    implemented to protect your data.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">11. Changes to the Privacy Policy</h2>
                  <p className="text-gray-500">
                    We will notify users about any significant updates to our privacy practices via email or dashboard
                    alerts.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">12. Contact for Privacy Concerns</h2>
                  <p className="text-gray-500">
                    Users can contact our Data Protection Officer at privacy@latros.com for questions or complaints
                    related to data handling.
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
