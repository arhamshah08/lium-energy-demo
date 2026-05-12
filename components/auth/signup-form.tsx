'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TopNav } from '@/components/layout/top-nav'
import { Input, Select } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const FINANCIER_TYPES = [
  { value: '', label: 'Select type...' },
  { value: 'institutional', label: 'Institutional Investor' },
  { value: 'private_equity', label: 'Private Equity' },
  { value: 'family_office', label: 'Family Office' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'other', label: 'Other' },
]

export interface SignupFormConfig {
  role: string
  title: string
  designationLabel: string
  designationPlaceholder: string
  showFinancierType?: boolean
}

export function SignupForm({ config }: { config: SignupFormConfig }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    companyName: '',
    website: '',
    country: '',
    fullName: '',
    email: '',
    designation: '',
    password: '',
    financierType: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: config.role,
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          companyName: form.companyName,
          website: form.website,
          country: form.country,
          jobTitle: form.designation,
          financierType: form.financierType || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); return }
      localStorage.setItem('token', data.token)
      router.push('/projects')
    } catch {
      setError('Cannot connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12">
        <div className="w-full max-w-lg">

          <div className="mb-8">
            <Link href="/signup" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
              ← Back
            </Link>
            <h1 className="text-3xl font-bold text-on-surface mt-4 mb-1">{config.title}</h1>
            <p className="text-on-surface-variant">Create your account to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Organisation section */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[10px] font-bold tracking-[0.15em] text-on-surface-variant uppercase">
                  Organisation
                </span>
                <div className="flex-1 h-px bg-outline-variant" />
              </div>
              <div className="space-y-4">
                <Input
                  label="Company Name"
                  value={form.companyName}
                  onChange={set('companyName')}
                  placeholder="Acme Energy Ltd."
                />
                <Input
                  label="Website"
                  type="url"
                  value={form.website}
                  onChange={set('website')}
                  placeholder="https://example.com"
                />
                <Input
                  label="Country"
                  value={form.country}
                  onChange={set('country')}
                  placeholder="United Kingdom"
                />
                {config.showFinancierType && (
                  <Select
                    label="Financier Type"
                    value={form.financierType}
                    onChange={set('financierType')}
                    options={FINANCIER_TYPES}
                  />
                )}
              </div>
            </div>

            {/* Contact Person section */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[10px] font-bold tracking-[0.15em] text-on-surface-variant uppercase">
                  Contact Person
                </span>
                <div className="flex-1 h-px bg-outline-variant" />
              </div>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={form.fullName}
                  onChange={set('fullName')}
                  required
                  placeholder="Jane Smith"
                />
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  required
                  placeholder="jane@company.com"
                />
                <Input
                  label={config.designationLabel}
                  value={form.designation}
                  onChange={set('designation')}
                  placeholder={config.designationPlaceholder}
                />
                <Input
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  required
                  placeholder="Min. 8 characters"
                  minLength={8}
                />
              </div>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Already have an account?{' '}
            <Link href="/signin" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
