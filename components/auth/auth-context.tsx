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
  loading: boolean
  signIn: (token: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue>({ user: null, token: null, loading: true, signIn: () => {}, signOut: () => {} })

function parseToken(token: string): AuthUser | null {
  try {
    // JWTs use base64url (- and _ instead of + and /). atob only handles standard base64.
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(b64))
    return { id: payload.id, email: payload.email, role: payload.role, fullName: payload.fullName ?? '' }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('token')
    if (stored) {
      const parsed = parseToken(stored)
      if (parsed) { setToken(stored); setUser(parsed) }
      else localStorage.removeItem('token')
    }
    setLoading(false)
  }, [])

  function signIn(newToken: string) {
    const parsed = parseToken(newToken)
    if (parsed) {
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(parsed)
    }
  }

  function signOut() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    window.location.href = '/'
  }

  return <AuthContext.Provider value={{ user, token, loading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
