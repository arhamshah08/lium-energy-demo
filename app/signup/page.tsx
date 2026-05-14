'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopNav } from '@/components/layout/top-nav'
import { useAuth } from '@/components/auth/auth-context'
import { roleHomePath } from '@/lib/auth-utils'

const ROLES = [
  {
    href: '/signup/developer',
    title: 'Project Developer',
    icon: 'construction',
    tag: 'ASSET SIDE',
    description: 'Onboard energy assets for institutional financing.',
  },
  {
    href: '/signup/financier',
    title: 'Financier',
    icon: 'account_balance',
    tag: 'CAPITAL SIDE',
    description: 'Deploy structured debt or equity across jurisdictions.',
  },
  {
    href: '/signup/securitisation-agent',
    title: 'Securitisation Agent',
    icon: 'shield_lock',
    tag: 'STRUCTURING',
    description: 'Structure asset pools for capital market instruments.',
  },
  {
    href: '/signup/portfolio-manager',
    title: 'Portfolio Manager',
    icon: 'monitoring',
    tag: 'MANAGEMENT',
    description: 'Monitor energy portfolios with real-time telemetry.',
  },
  {
    href: '/signup/investor',
    title: 'Investor',
    icon: 'trending_up',
    tag: 'INVESTMENT',
    description: 'Access structured energy finance and yield instruments.',
  },
]

export default function SignUpPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) router.replace(roleHomePath(user.role))
  }, [user, loading, router])

  if (loading || user) return null

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="flex flex-col items-center min-h-[calc(100vh-64px)] px-4 py-16">
        <div className="w-full max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-on-surface mb-3">Join LIUM Energy</h1>
            <p className="text-on-surface-variant text-lg">Select your role on the network</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {ROLES.map(({ href, title, icon, tag, description }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col items-center text-center p-8 pt-12 border-2 border-outline-variant rounded-2xl hover:border-primary hover:bg-primary/5 transition-all min-h-[520px] justify-between"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-xl bg-surface-container-high flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-all">
                    <span
                      className="material-symbols-outlined text-[32px] text-on-surface-variant group-hover:text-primary transition-colors"
                      style={{ fontVariationSettings: "'FILL' 0" }}
                    >
                      {icon}
                    </span>
                  </div>
                  <p className="text-[9px] font-bold tracking-[0.15em] text-primary mb-3 uppercase">{tag}</p>
                  <h3 className="font-bold text-on-surface text-xl leading-snug mb-4">{title}</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{description}</p>
                </div>
                <span className="mt-8 text-xs text-primary font-semibold group-hover:underline">
                  Get started →
                </span>
              </Link>
            ))}
          </div>

          <p className="text-center text-sm text-on-surface-variant mt-10">
            Already have an account?{' '}
            <Link href="/signin" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
