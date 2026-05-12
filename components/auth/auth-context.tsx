'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface AuthUser {
  id: string
  email: string
  role: 'developer' | 'financier'
  fullName: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue>({ user: null, token: null, signOut: () => {} })

function parseToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return { id: payload.id, email: payload.email, role: payload.role, fullName: payload.fullName ?? '' }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('token')
    if (stored) {
      const parsed = parseToken(stored)
      if (parsed) { setToken(stored); setUser(parsed) }
      else localStorage.removeItem('token')
    }
  }, [])

  function signOut() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    window.location.href = '/'
  }

  return <AuthContext.Provider value={{ user, token, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
