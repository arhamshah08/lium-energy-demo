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
  const [done, setDone] = useState<'finance' | 'sa' | null>(null)
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
        setDone(target)
        setTimeout(() => router.refresh(), 1200)
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

  return (
    <div className="flex flex-col items-end gap-2 shrink-0">
      {showPublishForFinance && (
        <button
          onClick={() => publish('finance')}
          disabled={loading || done === 'finance'}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-caps font-bold transition-all shadow-sm ${
            done === 'finance'
              ? 'bg-secondary/20 text-secondary border border-secondary/40'
              : 'bg-secondary text-on-secondary hover:opacity-90 disabled:opacity-50'
          }`}
        >
          {loading ? (
            <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>Publishing…</>
          ) : done === 'finance' ? (
            <><span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>Submitted for Financing</>
          ) : (
            <><span className="material-symbols-outlined text-[16px]">publish</span>Find Financing</>
          )}
        </button>
      )}
      {status === 'PUBLISHED_FOR_FINANCE' && (
        <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/30 text-secondary px-5 py-2.5 rounded-lg text-label-caps font-bold">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shrink-0" />
          Submitted for Financing
        </div>
      )}
      {status === 'OFFER_RECEIVED' && (
        <div className="inline-flex items-center gap-2 bg-tertiary/10 border border-tertiary/30 text-tertiary px-5 py-2.5 rounded-lg text-label-caps font-bold">
          <span className="material-symbols-outlined text-[16px]">mark_email_read</span>
          Offer Received
        </div>
      )}
      {status === 'FINANCING_ACCEPTED' && !showPublishForSA && (
        <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/30 text-secondary px-5 py-2.5 rounded-lg text-label-caps font-bold">
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          Financing Closed
        </div>
      )}
      {status === 'PUBLISHED_FOR_SA' && (
        <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/30 text-secondary px-5 py-2.5 rounded-lg text-label-caps font-bold">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shrink-0" />
          Submitted for Securitisation
        </div>
      )}
      {status === 'TRANSACTING' && (
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-5 py-2.5 rounded-lg text-label-caps font-bold">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
          Passed to Portfolio Manager
        </div>
      )}
      {status === 'TOKENISED' && (
        <div className="inline-flex items-center gap-2 bg-tertiary/10 border border-tertiary/30 text-tertiary px-5 py-2.5 rounded-lg text-label-caps font-bold">
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          Tokenised
        </div>
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
