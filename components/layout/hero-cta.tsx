'use client'

import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-context'
import { roleHomePath } from '@/lib/auth-utils'

export function HeroCta() {
  const { user, loading } = useAuth()

  if (loading) return null

  if (user) {
    return (
      <div className="flex flex-wrap gap-3">
        <Link
          href={roleHomePath(user.role)}
          className="inline-flex items-center gap-2 bg-white text-primary rounded-xl px-8 py-3 text-label-caps font-bold hover:opacity-90 transition-all shadow-card"
        >
          Go to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/signup"
        className="inline-flex items-center gap-2 bg-white text-primary rounded-xl px-8 py-3 text-label-caps font-bold hover:opacity-90 transition-all shadow-card"
      >
        List a Project
      </Link>
      <Link
        href="/signup"
        className="inline-flex items-center border-2 border-primary-fixed text-white rounded-xl px-8 py-3 text-label-caps hover:bg-primary-container transition-all"
      >
        Browse Assets
      </Link>
    </div>
  )
}

export function CtaBannerLink() {
  const { user, loading } = useAuth()

  if (loading) return null

  const href = user ? roleHomePath(user.role) : '/signup'
  const label = user ? 'Go to Dashboard' : 'Join LIUM Energy'

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 bg-white text-secondary rounded-xl px-10 py-3 text-label-caps font-bold hover:opacity-90 transition-all shadow-card"
    >
      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      {label}
    </Link>
  )
}
