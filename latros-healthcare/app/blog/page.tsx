import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Stethoscope, Calendar, ArrowRight } from "lucide-react"

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "How AI is Transforming Healthcare in 2025",
      excerpt: "Overview of current AI applications in diagnosis, treatment, and patient care.",
      date: "May 2, 2025",
      category: "AI in Healthcare",
      image: "/placeholder.svg?height=200&width=400",
      slug: "how-ai-is-transforming-healthcare",
    },
    {
      id: 2,
      title: "From Symptoms to Solutions: Real Patient Journeys",
      excerpt:
        "Share anonymized user stories showing how the platform helped them with early diagnosis and access to care.",
      date: "April 28, 2025",
      category: "Patient Stories",
      image: "/placeholder.svg?height=200&width=400",
      slug: "from-symptoms-to-solutions",
    },
    {
      id: 3,
      title: "How We Keep Your Health Data Safe",
      excerpt: "Discuss encryption, compliance (HIPAA/GDPR), and your platform's commitment to user privacy.",
      date: "April 15, 2025",
      category: "Data Privacy",
      image: "/placeholder.svg?height=200&width=400",
      slug: "how-we-keep-your-health-data-safe",
    },
    {
      id: 4,
      title: "How to Use Our AI Health Platform in 5 Easy Steps",
      excerpt: "Walk users through symptom input, diagnosis, selecting doctors, and booking consultations.",
      date: "April 10, 2025",
      category: "Guides",
      image: "/placeholder.svg?height=200&width=400",
      slug: "how-to-use-our-ai-health-platform",
    },
    {
      id: 5,
      title: "Meet the Hospitals and Doctors Powering Our Platform",
      excerpt: "Highlight trusted medical partners and what they bring to patient care.",
      date: "April 5, 2025",
      category: "Partner Spotlights",
      image: "/placeholder.svg?height=200&width=400",
      slug: "meet-the-hospitals-and-doctors",
    },
  ]

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
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Our Blog</h1>
                <p className="max-w-[800px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Insights, stories, and guides from the intersection of healthcare and technology.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-48 object-cover" />
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium bg-teal-100 text-teal-800 px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {post.date}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                    <p className="text-gray-500">{post.excerpt}</p>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="ghost" className="text-teal-600 hover:text-teal-700 p-0 h-auto font-medium">
                        Read More <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
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
