'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/auth-context'
import type { FinancierOffer, ProjectStatus } from '@/types'

function countdown(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  if (days > 0) return `${days}d ${hours}h remaining`
  const mins = Math.floor((diff % 3600000) / 60000)
  return `${hours}h ${mins}m remaining`
}

function statusBadge(status: FinancierOffer['status']) {
  const cfg = {
    PENDING:            { label: 'Pending',           cls: 'bg-primary/10 text-primary' },
    ACCEPTED:           { label: 'Accepted',           cls: 'bg-secondary/10 text-secondary' },
    REJECTED:           { label: 'Rejected',           cls: 'bg-error/10 text-error' },
    REVISION_REQUESTED: { label: 'Revision Requested', cls: 'bg-tertiary/10 text-tertiary' },
    EXPIRED:            { label: 'Expired',            cls: 'bg-outline-variant/30 text-on-surface-variant' },
    WITHDRAWN:          { label: 'Withdrawn',          cls: 'bg-outline-variant/30 text-on-surface-variant' },
  }
  const { label, cls } = cfg[status] ?? { label: status, cls: '' }
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${cls}`}>{label}</span>
}

function RevisionModal({
  offerId,
  projectId,
  onClose,
  onDone,
  token,
}: {
  offerId: string
  projectId: string
  onClose: () => void
  onDone: () => void
  token: string
}) {
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_revision', revisionNotes: notes }),
      })
      const json = await res.json()
      if (json.ok) { onDone(); onClose() }
      else setError(json.error?.message ?? 'Failed')
    } catch { setError('Network error') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-label-caps font-bold text-on-surface tracking-widest">REQUEST REVISION</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <p className="text-caption text-on-surface-variant">Tell the financier what needs to change. They will see this note and can resubmit.</p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. Please lower the interest rate to 6.5% and extend tenor to 15 years..."
          rows={4}
          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-4 py-3 text-caption text-on-surface placeholder:text-on-surface-variant/50 resize-none focus:outline-none focus:border-primary/60"
        />
        {error && <p className="text-[11px] text-error">{error}</p>}
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-label-caps text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container transition-all">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving || !notes.trim()}
            className="px-5 py-2 rounded-lg text-label-caps bg-tertiary text-on-tertiary font-bold hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {saving ? 'Sending…' : 'Send to Financier'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function OfferInbox({ projectId, projectStatus }: { projectId: string; projectStatus: ProjectStatus }) {
  const { user, token } = useAuth()
  const [offers, setOffers] = useState<FinancierOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)
  const [revisionOfferId, setRevisionOfferId] = useState<string | null>(null)

  const isFinancier = user?.role === 'financier'
  const isDeveloper = user?.role === 'developer'

  async function loadOffers() {
    if (!token) return
    const res = await fetch(`/api/projects/${projectId}/offers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json()
    if (json.ok) setOffers(json.data)
    setLoading(false)
  }

  useEffect(() => { loadOffers() }, [projectId, token])

  async function act(offerId: string, action: 'accept' | 'reject') {
    setActing(offerId)
    try {
      const res = await fetch(`/api/projects/${projectId}/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const json = await res.json()
      if (json.ok) await loadOffers()
    } finally { setActing(null) }
  }

  const active = offers.filter(o => ['PENDING', 'REVISION_REQUESTED'].includes(o.status))
  const history = offers.filter(o => !['PENDING', 'REVISION_REQUESTED'].includes(o.status))

  if (!isDeveloper && !isFinancier) return null

  return (
    <div className="space-y-4">
      {revisionOfferId && (
        <RevisionModal
          offerId={revisionOfferId}
          projectId={projectId}
          token={token ?? ''}
          onClose={() => setRevisionOfferId(null)}
          onDone={loadOffers}
        />
      )}

      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-secondary text-[20px]">inbox</span>
        <h2 className="text-label-caps font-bold text-on-surface tracking-widest">FINANCING OFFERS</h2>
        {!loading && <span className="text-caption text-on-surface-variant">{active.length} active</span>}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-5 animate-pulse h-36" />
          ))}
        </div>
      ) : active.length === 0 && history.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-8 text-center">
          <span className="material-symbols-outlined text-[36px] text-outline mb-3 block">inbox</span>
          <p className="text-caption text-on-surface-variant">
            {projectStatus === 'PUBLISHED_FOR_FINANCE'
              ? 'No offers yet. Financiers can now see your project and submit term sheets.'
              : 'No offers on this project.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {active.map(offer => (
            <div key={offer.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-outline-variant/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[18px]">account_balance</span>
                  </div>
                  <div>
                    <p className="text-caption font-bold text-on-surface">
                      {offer.financierName ?? offer.financierId}
                      {offer.financierCompany && <span className="font-normal text-on-surface-variant"> · {offer.financierCompany}</span>}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      {new Date(offer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {statusBadge(offer.status)}
                  <span className={`text-[10px] font-bold ${new Date(offer.expiresAt).getTime() - Date.now() < 86400000 ? 'text-error' : 'text-on-surface-variant'}`}>
                    {countdown(offer.expiresAt)}
                  </span>
                </div>
              </div>

              <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-outline-variant/20">
                {[
                  { label: 'Loan Amount', value: `$${offer.loanAmountM}M` },
                  {
                    label: 'Interest Rate',
                    value: offer.rateType === 'FIXED'
                      ? `${offer.ratePct}% fixed`
                      : `SOFR + ${offer.sofrSpreadPct}%`,
                  },
                  { label: 'Tenor', value: `${offer.tenorYears} yrs` },
                  { label: 'DSCR Covenant', value: `${offer.dscrCovenant}x min` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wide mb-0.5">{label}</p>
                    <p className="text-caption font-bold text-on-surface">{value}</p>
                  </div>
                ))}
              </div>

              {(offer.securityRequirements || offer.conditionsPrecedent) && (
                <div className="px-5 py-3 grid grid-cols-1 md:grid-cols-2 gap-3 border-b border-outline-variant/20">
                  {offer.securityRequirements && (
                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wide mb-0.5">Security</p>
                      <p className="text-[11px] text-on-surface">{offer.securityRequirements}</p>
                    </div>
                  )}
                  {offer.conditionsPrecedent && (
                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wide mb-0.5">Conditions Precedent</p>
                      <p className="text-[11px] text-on-surface">{offer.conditionsPrecedent}</p>
                    </div>
                  )}
                </div>
              )}

              {offer.status === 'REVISION_REQUESTED' && offer.revisionNotes && (
                <div className="px-5 py-3 bg-tertiary/5 border-b border-outline-variant/20">
                  <p className="text-[10px] text-tertiary font-bold uppercase tracking-wide mb-1">Revision Requested</p>
                  <p className="text-[11px] text-on-surface">{offer.revisionNotes}</p>
                </div>
              )}

              {isDeveloper && offer.status === 'PENDING' && projectStatus !== 'FINANCING_ACCEPTED' && (
                <div className="px-5 py-3 flex items-center gap-3">
                  <button
                    onClick={() => act(offer.id, 'accept')}
                    disabled={acting === offer.id}
                    className="flex items-center gap-1.5 bg-secondary text-on-secondary px-4 py-2 rounded-lg text-label-caps font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Accept
                  </button>
                  <button
                    onClick={() => setRevisionOfferId(offer.id)}
                    disabled={acting === offer.id}
                    className="flex items-center gap-1.5 bg-tertiary/10 text-tertiary border border-tertiary/20 px-4 py-2 rounded-lg text-label-caps font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    Request Revision
                  </button>
                  <button
                    onClick={() => act(offer.id, 'reject')}
                    disabled={acting === offer.id}
                    className="flex items-center gap-1.5 text-error border border-error/20 px-4 py-2 rounded-lg text-label-caps font-bold hover:bg-error/5 disabled:opacity-50 transition-all"
                  >
                    <span className="material-symbols-outlined text-[14px]">cancel</span>
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}

          {history.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide px-1">History</p>
              {history.map(offer => (
                <div key={offer.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 px-5 py-3 flex items-center gap-4 opacity-70">
                  <p className="text-caption font-medium text-on-surface flex-1">
                    {offer.financierName ?? offer.financierId} — ${offer.loanAmountM}M @ {offer.rateType === 'FIXED' ? `${offer.ratePct}%` : `SOFR+${offer.sofrSpreadPct}%`}, {offer.tenorYears}yr
                  </p>
                  {statusBadge(offer.status)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
