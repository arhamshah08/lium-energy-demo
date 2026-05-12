'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TopNav } from '@/components/layout/top-nav'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Invalid email or password'); return }
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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-on-surface mb-1">Welcome back</h1>
            <p className="text-on-surface-variant">Sign in to your LIUM Energy account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email" type="email" value={form.email} onChange={set('email')} required placeholder="you@company.com" />
            <Input label="Password" type="password" value={form.password} onChange={set('password')} required placeholder="Your password" />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
              Sign In
            </Button>
          </form>
          <p className="text-center text-sm text-on-surface-variant mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
