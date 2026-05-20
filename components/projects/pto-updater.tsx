'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-context'
import type { PtoStatus } from '@/types'

const PTO_OPTIONS: { value: PtoStatus; label: string }[] = [
  { value: 'PRE_PROCESSING', label: 'Pre-Processing' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
]

export function PtoUpdater({ projectId, currentStatus }: { projectId: string; currentStatus: PtoStatus }) {
  const { user, token } = useAuth()
  const router = useRouter()
  const [status, setStatus] = useState<PtoStatus>(currentStatus)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (user?.role !== 'developer') return null

  async function handleUpdate(next: PtoStatus) {
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/pto`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ptoStatus: next }),
      })
      const json = await res.json()
      if (json.ok) { setStatus(next); setSaved(true); router.refresh() }
      else setError(json.error?.message ?? 'Failed to update')
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3 pt-2 border-t border-outline-variant/30">
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">Update PTO Status</p>
      <div className="grid grid-cols-2 gap-2">
        {PTO_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleUpdate(opt.value)}
            disabled={saving || status === opt.value}
            className={`py-2 px-3 rounded-lg text-[11px] font-bold border transition-all ${
              status === opt.value
                ? 'bg-primary/10 border-primary/30 text-primary cursor-default'
                : 'bg-surface-container border-outline-variant/40 text-on-surface-variant hover:border-primary/40 hover:text-on-surface disabled:opacity-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {saved && <p className="text-[10px] text-secondary font-bold">Status updated</p>}
      {error && <p className="text-[10px] text-error">{error}</p>}
    </div>
  )
}
