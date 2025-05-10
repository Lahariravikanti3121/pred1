import Link from "next/link"
import { Stethoscope } from "lucide-react"

export default function Footer() {
  return (
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
  )
}
