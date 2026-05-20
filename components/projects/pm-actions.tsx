'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-context'
import type { ProjectStatus } from '@/types'

export function PMActions({
  projectId,
  projectStatus,
  onAction,
}: {
  projectId: string
  projectStatus: ProjectStatus
  onAction?: () => void
}) {
  const { user, token } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (user?.role !== 'portfolio_manager') return null

  if (projectStatus === 'TOKENISED') {
    return (
      <div className="inline-flex items-center gap-1.5 bg-tertiary/10 text-tertiary px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0">
        <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
        Listed
      </div>
    )
  }

  if (projectStatus !== 'TRANSACTING') return null

  async function handleList() {
    if (!token) return
    setSubmitting(true)
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'TOKENISED' }),
    })
    const json = await res.json()
    if (json.ok) {
      setSubmitted(true)
      setTimeout(() => { onAction?.() }, 800)
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-tertiary/10 text-tertiary px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0">
        <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        Listed
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={handleList}
        disabled={submitting}
        className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2 rounded-lg text-[11px] font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[14px]">publish</span>
        {submitting ? 'Listing…' : 'List Asset'}
      </button>
      <Link
        href="/securities/new"
        className="inline-flex items-center gap-1.5 border border-outline-variant text-on-surface-variant px-3 py-2 rounded-lg text-[11px] font-bold hover:bg-surface-container hover:text-on-surface transition-all"
      >
        <span className="material-symbols-outlined text-[14px]">workspaces</span>
        Pool
      </Link>
    </div>
  )
}
