'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-context'
import type { ProjectStatus, PtoStatus } from '@/types'

export function PublishActions({
  projectId,
  status,
  ptoStatus,
}: {
  projectId: string
  status: ProjectStatus
  ptoStatus: PtoStatus
}) {
  const { user, token } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (user?.role !== 'developer') return null

  async function publish(target: 'finance' | 'sa') {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/publish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      })
      const json = await res.json()
      if (json.ok) {
        router.refresh()
      } else {
        setError(json.error?.message ?? 'Failed to publish')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const alreadyPublished = ['PUBLISHED_FOR_FINANCE', 'OFFER_RECEIVED', 'FINANCING_ACCEPTED', 'PUBLISHED_FOR_SA', 'TRANSACTING', 'TOKENISED']
  const showPublishForFinance = !alreadyPublished.includes(status)
  const showPublishForSA = status === 'FINANCING_ACCEPTED'
  const ptoApproved = ptoStatus === 'APPROVED'

  if (!showPublishForFinance && !showPublishForSA) return null

  return (
    <div className="flex flex-col items-end gap-2 shrink-0">
      {showPublishForFinance && (
        <button
          onClick={() => publish('finance')}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-secondary text-on-secondary px-5 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px]">publish</span>
          Find Financing
        </button>
      )}
      {showPublishForSA && (
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={() => publish('sa')}
            disabled={loading || !ptoApproved}
            title={!ptoApproved ? 'Awaiting PTO approval' : undefined}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-caps font-bold transition-all shadow-sm ${
              ptoApproved
                ? 'bg-primary text-on-primary hover:opacity-90'
                : 'bg-surface-container text-on-surface-variant cursor-not-allowed border border-outline-variant/60'
            } disabled:opacity-70`}
          >
            <span className="material-symbols-outlined text-[16px]">hub</span>
            {ptoApproved ? 'Publish to SA' : 'Awaiting PTO'}
          </button>
          {!ptoApproved && (
            <p className="text-[10px] text-on-surface-variant">PTO must be approved first</p>
          )}
        </div>
      )}
      {error && <p className="text-[10px] text-error mt-1">{error}</p>}
    </div>
  )
}
