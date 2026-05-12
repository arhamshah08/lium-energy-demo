'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-context'

export function Protected({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user === null && !localStorage.getItem('token')) {
      router.replace('/signin')
    }
  }, [user, router])

  if (!user) return null
  return <>{children}</>
}
