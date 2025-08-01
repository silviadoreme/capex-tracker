import { Inter } from "next/font/google"
import type { Metadata } from 'next'
import "./globals.css"
import AuthProvider from "@/components/auth/AuthProvider"
import { Header } from "@/components/Header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CAPEX Tracker - Project Effort Management",
  description: "Track CAPEX-eligible projects and monthly effort reporting for Finance and Product teams",
  generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}