'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        localStorage.setItem('customerName', user.email)
      } else {
        localStorage.removeItem('customerName')
      }
      setLoading(false)
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        localStorage.setItem('customerName', session.user.email)
      } else {
        localStorage.removeItem('customerName')
      }
    })

    getUser()
  }, [])

  return loading ? null : children
}