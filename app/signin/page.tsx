'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TopNav } from '@/components/layout/top-nav'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/auth-context'

export default function SignInPage() {
  const router = useRouter()
  const { signIn } = useAuth()
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
      signIn(data.token)
      router.push('/projects')
    } catch {
      setError('Cannot connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-low">
      <TopNav />

      {/* Brand strip */}
      <div className="bg-primary py-10 px-4 text-center">
        <p className="text-label-caps text-primary-fixed mb-2">LIUM Energy Network</p>
        <h1 className="text-headline-md text-white">Welcome back</h1>
        <p className="text-caption text-primary-fixed mt-1">Sign in to your account</p>
      </div>

      {/* Form card */}
      <div className="flex justify-center px-4 py-10 flex-1">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-card-hover p-8 border border-outline-variant/20">
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
