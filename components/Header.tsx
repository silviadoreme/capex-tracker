'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Clock, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export function Header() {
  const pathname = usePathname()
  const supabase = createClient()
  const customerName = typeof window !== 'undefined' ? window.localStorage.getItem('customerName') : null

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">CAPEX Tracker</h1>
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              Live Data
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {customerName && (
              <>
                <span className="text-gray-600 text-sm mr-4">
                  {customerName}
                </span>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100 mr-2"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
            <Link href="/">
              <Button variant="ghost" className={pathname === "/" ? "bg-gray-100" : "text-gray-600"}>
                Dashboard
              </Button>
            </Link>
            <Link href="/timesheet">
              <Button 
                variant="outline" 
                className={`flex items-center space-x-2 ${
                  pathname === "/timesheet" 
                    ? "bg-blue-100 border-blue-300" 
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Timesheet</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}