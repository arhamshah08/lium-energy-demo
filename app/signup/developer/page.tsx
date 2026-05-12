'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TopNav } from '@/components/layout/top-nav'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function DeveloperSignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fullName: '', email: '', password: '',
    companyName: '', jobTitle: '', country: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'developer' }),
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
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/signup" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
              ← Back
            </Link>
            <h1 className="text-3xl font-bold text-on-surface mt-4 mb-1">Project Developer</h1>
            <p className="text-on-surface-variant">Create your account to get started</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Full Name" value={form.fullName} onChange={set('fullName')} required placeholder="Jane Smith" />
            <Input label="Email" type="email" value={form.email} onChange={set('email')} required placeholder="jane@company.com" />
            <Input label="Password" type="password" value={form.password} onChange={set('password')} required placeholder="Min. 8 characters" minLength={8} />
            <Input label="Company Name" value={form.companyName} onChange={set('companyName')} placeholder="Acme Energy Ltd." />
            <Input label="Job Title" value={form.jobTitle} onChange={set('jobTitle')} placeholder="Head of Development" />
            <Input label="Country" value={form.country} onChange={set('country')} placeholder="United Kingdom" />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
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
