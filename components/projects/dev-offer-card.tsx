'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-context'
import type { FinancierOffer } from '@/types'

export type OfferWithProject = FinancierOffer & { projectName: string; projectLocation: string }

function countdown(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  if (days > 0) return `${days}d ${hours}h remaining`
  return `${hours}h ${Math.floor((diff % 3600000) / 60000)}m remaining`
}

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  PENDING:            { label: 'Pending',            cls: 'bg-primary/10 text-primary' },
  ACCEPTED:           { label: 'Accepted',           cls: 'bg-secondary/10 text-secondary' },
  REJECTED:           { label: 'Rejected',           cls: 'bg-error/10 text-error' },
  REVISION_REQUESTED: { label: 'Revision Requested', cls: 'bg-tertiary/10 text-tertiary' },
  EXPIRED:            { label: 'Expired',            cls: 'bg-outline-variant/30 text-on-surface-variant' },
  WITHDRAWN:          { label: 'Withdrawn',          cls: 'bg-outline-variant/30 text-on-surface-variant' },
}

export function DevOfferCard({ offer, onAction }: { offer: OfferWithProject; onAction: () => void }) {
  const { token } = useAuth()
  const [busy, setBusy] = useState(false)
  const [showRevision, setShowRevision] = useState(false)
  const [revisionNotes, setRevisionNotes] = useState('')
  const isPending = offer.status === 'PENDING'
  const isExpiringSoon = isPending && new Date(offer.expiresAt).getTime() - Date.now() < 86400000
  const cfg = STATUS_CFG[offer.status] ?? { label: offer.status, cls: '' }

  async function act(action: string, extra?: Record<string, unknown>) {
    if (!token) return
    setBusy(true)
    try {
      await fetch(`/api/projects/${offer.projectId}/offers/${offer.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      })
      onAction()
    } finally {
      setBusy(false)
    }
  }

  const rateStr = offer.rateType === 'FIXED'
    ? `${offer.ratePct ?? '—'}% fixed`
    : `SOFR +${offer.sofrSpreadPct ?? '—'}%`

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-outline-variant/30 flex items-start justify-between gap-3">
        <div>
          <Link href={`/projects/${offer.projectId}`} className="text-caption font-bold text-on-surface hover:text-primary transition-colors">
            {offer.projectName}
          </Link>
          <p className="text-[10px] text-on-surface-variant mt-0.5">{offer.projectLocation}</p>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide shrink-0 ${cfg.cls}`}>
          {cfg.label}
        </span>
      </div>

      {/* Terms */}
      <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-outline-variant/20">
        {[
          { label: 'Loan Amount', value: `$${offer.loanAmountM}M` },
          { label: 'Rate',        value: rateStr },
          { label: 'Tenor',       value: `${offer.tenorYears} yrs` },
          { label: 'DSCR Min',    value: `${offer.dscrCovenant}x` },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wide mb-0.5">{label}</p>
            <p className="text-caption font-bold text-on-surface">{value}</p>
          </div>
        ))}
      </div>

      {/* Expiry */}
      {isPending && (
        <div className="px-5 py-3 border-b border-outline-variant/20 flex items-center gap-2">
          <span className={`material-symbols-outlined text-[14px] ${isExpiringSoon ? 'text-error' : 'text-on-surface-variant'}`}>schedule</span>
          <span className={`text-[11px] ${isExpiringSoon ? 'text-error font-medium' : 'text-on-surface-variant'}`}>{countdown(offer.expiresAt)}</span>
        </div>
      )}

      {/* Actions for pending offers */}
      {isPending && !showRevision && (
        <div className="px-5 py-3 flex items-center gap-2 flex-wrap">
          <button onClick={() => act('accept')} disabled={busy}
            className="inline-flex items-center gap-1.5 bg-secondary text-on-secondary px-4 py-2 rounded-lg text-[11px] font-bold hover:opacity-90 transition-all disabled:opacity-50">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            Accept
          </button>
          <button onClick={() => setShowRevision(true)} disabled={busy}
            className="inline-flex items-center gap-1.5 border border-tertiary/40 text-tertiary px-4 py-2 rounded-lg text-[11px] font-bold hover:bg-tertiary/5 transition-all disabled:opacity-50">
            <span className="material-symbols-outlined text-[14px]">edit_note</span>
            Request Revision
          </button>
          <button onClick={() => act('reject')} disabled={busy}
            className="inline-flex items-center gap-1.5 border border-outline-variant text-on-surface-variant px-4 py-2 rounded-lg text-[11px] font-bold hover:bg-surface-container transition-all disabled:opacity-50">
            Reject
          </button>
        </div>
      )}

      {/* Revision form */}
      {isPending && showRevision && (
        <div className="px-5 py-4 space-y-3 border-t border-outline-variant/20">
          <p className="text-[10px] font-bold text-tertiary uppercase tracking-wide">Revision Request</p>
          <textarea
            rows={2}
            placeholder="Describe what needs to change…"
            value={revisionNotes}
            onChange={e => setRevisionNotes(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-caption text-on-surface placeholder:text-on-surface-variant/50 resize-none focus:outline-none focus:border-primary/60 transition-colors"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { act('request_revision', { revisionNotes }); setShowRevision(false) }}
              disabled={busy || !revisionNotes.trim()}
              className="bg-tertiary text-on-tertiary px-4 py-2 rounded-lg text-[11px] font-bold hover:opacity-90 disabled:opacity-50 transition-all"
            >
              Send Request
            </button>
            <button onClick={() => setShowRevision(false)}
              className="px-4 py-2 rounded-lg text-[11px] text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Revision notes received (for revision_requested on financier's side, shown to dev as context) */}
      {offer.status === 'REVISION_REQUESTED' && offer.revisionNotes && (
        <div className="px-5 py-3 bg-tertiary/5 border-t border-outline-variant/20">
          <p className="text-[10px] font-bold text-tertiary uppercase tracking-wide mb-1">Revision Note Sent</p>
          <p className="text-[11px] text-on-surface">{offer.revisionNotes}</p>
        </div>
      )}
    </div>
  )
}
