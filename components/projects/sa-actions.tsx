'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-context'
import type { ProjectStatus } from '@/types'

export function SAActions({ projectId, projectStatus }: { projectId: string; projectStatus: ProjectStatus }) {
  const { user, token } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (user?.role !== 'securitisation_agent') return null
  if (projectStatus !== 'PUBLISHED_FOR_SA') return null

  async function handleSubmit() {
    if (!token) return
    setSubmitting(true)
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'TRANSACTING' }),
    })
    const json = await res.json()
    if (json.ok) {
      setSubmitted(true)
      setTimeout(() => router.refresh(), 1200)
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/30 text-secondary px-5 py-2.5 rounded-lg text-label-caps font-bold">
        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        Submitted for Securitisation
      </div>
    )
  }

  return (
    <button
      onClick={handleSubmit}
      disabled={submitting}
      className="inline-flex items-center gap-2 bg-secondary text-on-secondary px-5 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-[16px]">hub</span>
      {submitting ? 'Submitting…' : 'Submit'}
    </button>
  )
}
