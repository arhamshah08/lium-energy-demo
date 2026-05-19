'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-context'
import type { FinancierOffer, ApiResponse, CreateOfferBody, InterestRateType } from '@/types'

type OfferWithProject = FinancierOffer & { projectName: string; projectLocation: string }

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
  const cfg: Record<string, { label: string; cls: string }> = {
    PENDING:            { label: 'Pending',            cls: 'bg-primary/10 text-primary' },
    ACCEPTED:           { label: 'Accepted',           cls: 'bg-secondary/10 text-secondary' },
    REJECTED:           { label: 'Rejected',           cls: 'bg-error/10 text-error' },
    REVISION_REQUESTED: { label: 'Revision Requested', cls: 'bg-tertiary/10 text-tertiary' },
    EXPIRED:            { label: 'Expired',            cls: 'bg-outline-variant/30 text-on-surface-variant' },
    WITHDRAWN:          { label: 'Withdrawn',          cls: 'bg-outline-variant/30 text-on-surface-variant' },
  }
  const { label, cls } = cfg[status] ?? { label: status, cls: '' }
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${cls}`}>
      {label}
    </span>
  )
}

function tomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

function ResubmitForm({
  offer,
  token,
  onDone,
  onCancel,
}: {
  offer: OfferWithProject
  token: string
  onDone: () => void
  onCancel: () => void
}) {
  const [loanAmountM, setLoanAmountM] = useState(String(offer.loanAmountM))
  const [rateType, setRateType] = useState<InterestRateType>(offer.rateType)
  const [ratePct, setRatePct] = useState(offer.ratePct != null ? String(offer.ratePct) : '')
  const [sofrSpreadPct, setSofrSpreadPct] = useState(offer.sofrSpreadPct != null ? String(offer.sofrSpreadPct) : '')
  const [tenorYears, setTenorYears] = useState(String(offer.tenorYears))
  const [dscrCovenant, setDscrCovenant] = useState(String(offer.dscrCovenant))
  const [securityRequirements, setSecurityRequirements] = useState(offer.securityRequirements ?? '')
  const [conditionsPrecedent, setConditionsPrecedent] = useState(offer.conditionsPrecedent ?? '')
  const [expiresAt, setExpiresAt] = useState(offer.expiresAt.split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const updatedTerms: Partial<CreateOfferBody> = {
      loanAmountM: parseFloat(loanAmountM),
      rateType,
      tenorYears: parseInt(tenorYears, 10),
      dscrCovenant: parseFloat(dscrCovenant),
      expiresAt: new Date(expiresAt).toISOString(),
      ...(securityRequirements.trim() && { securityRequirements: securityRequirements.trim() }),
      ...(conditionsPrecedent.trim() && { conditionsPrecedent: conditionsPrecedent.trim() }),
      ...(rateType === 'FIXED' && ratePct ? { ratePct: parseFloat(ratePct) } : {}),
      ...(rateType === 'FLOATING' && sofrSpreadPct ? { sofrSpreadPct: parseFloat(sofrSpreadPct) } : {}),
    }

    try {
      const res = await fetch(`/api/projects/${offer.projectId}/offers/${offer.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'resubmit', updatedTerms }),
      })
      const json = await res.json()
      if (json.ok) {
        onDone()
      } else {
        setError(json.error?.message ?? 'Failed to resubmit.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t border-outline-variant/40 pt-4 space-y-4">
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">Update Terms</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">
            Loan Amount ($M)
          </label>
          <input
            type="number"
            required
            min={0}
            step="0.1"
            value={loanAmountM}
            onChange={e => setLoanAmountM(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-caption text-on-surface focus:outline-none focus:border-primary/60 transition-colors"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">
            Tenor (years)
          </label>
          <input
            type="number"
            required
            min={1}
            step={1}
            value={tenorYears}
            onChange={e => setTenorYears(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-caption text-on-surface focus:outline-none focus:border-primary/60 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">
          Interest Rate Type
        </label>
        <div className="flex gap-2">
          {(['FIXED', 'FLOATING'] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setRateType(type)}
              className={`flex-1 py-2 rounded-xl text-label-caps font-bold border transition-all ${
                rateType === type
                  ? 'bg-primary/10 border-primary/40 text-primary'
                  : 'border-outline-variant/60 text-on-surface-variant hover:border-primary/30'
              }`}
            >
              {type === 'FIXED' ? 'Fixed Rate' : 'Floating (SOFR + Spread)'}
            </button>
          ))}
        </div>
      </div>

      {rateType === 'FIXED' && (
        <div>
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">
            Rate %
          </label>
          <input
            type="number"
            min={0}
            step={0.01}
            placeholder="e.g. 7.5"
            value={ratePct}
            onChange={e => setRatePct(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-caption text-on-surface focus:outline-none focus:border-primary/60 transition-colors"
          />
        </div>
      )}

      {rateType === 'FLOATING' && (
        <div>
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">
            SOFR Spread %
          </label>
          <input
            type="number"
            min={0}
            step={0.01}
            placeholder="e.g. 2.5"
            value={sofrSpreadPct}
            onChange={e => setSofrSpreadPct(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-caption text-on-surface focus:outline-none focus:border-primary/60 transition-colors"
          />
        </div>
      )}

      <div>
        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">
          DSCR Covenant
        </label>
        <input
          type="number"
          required
          min={0}
          step={0.01}
          placeholder="e.g. 1.25"
          value={dscrCovenant}
          onChange={e => setDscrCovenant(e.target.value)}
          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-caption text-on-surface focus:outline-none focus:border-primary/60 transition-colors"
        />
      </div>

      <div>
        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">
          Security Requirements
        </label>
        <textarea
          rows={2}
          placeholder="e.g. First lien on asset, revenue assignment"
          value={securityRequirements}
          onChange={e => setSecurityRequirements(e.target.value)}
          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-caption text-on-surface placeholder:text-on-surface-variant/50 resize-none focus:outline-none focus:border-primary/60 transition-colors"
        />
      </div>

      <div>
        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">
          Conditions Precedent
        </label>
        <textarea
          rows={2}
          placeholder="e.g. PTO confirmation, insurance in place"
          value={conditionsPrecedent}
          onChange={e => setConditionsPrecedent(e.target.value)}
          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-caption text-on-surface placeholder:text-on-surface-variant/50 resize-none focus:outline-none focus:border-primary/60 transition-colors"
        />
      </div>

      <div>
        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">
          Offer Expiry Date
        </label>
        <input
          type="date"
          required
          min={tomorrow()}
          value={expiresAt}
          onChange={e => setExpiresAt(e.target.value)}
          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-caption text-on-surface focus:outline-none focus:border-primary/60 transition-colors"
        />
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-xl px-4 py-3">
          <p className="text-[11px] text-error">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-label-caps font-bold hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? 'Resubmitting…' : 'Resubmit Offer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-label-caps text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function StatCard({ label, value, cls }: { label: string; value: number; cls: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 px-5 py-4">
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${cls}`}>{value}</p>
    </div>
  )
}

function OfferCard({
  offer,
  token,
  onResubmitted,
}: {
  offer: OfferWithProject
  token: string
  onResubmitted: () => void
}) {
  const [revising, setRevising] = useState(false)
  const isExpiringSoon = offer.status === 'PENDING' && new Date(offer.expiresAt).getTime() - Date.now() < 86400000

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-outline-variant/30 flex items-start justify-between gap-3">
        <div>
          <Link
            href={`/projects/${offer.projectId}`}
            className="text-caption font-bold text-on-surface hover:text-primary transition-colors"
          >
            {offer.projectName}
          </Link>
          <p className="text-[10px] text-on-surface-variant mt-0.5">{offer.projectLocation}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {statusBadge(offer.status)}
        </div>
      </div>

      <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-outline-variant/20">
        {[
          { label: 'Loan Amount', value: `$${offer.loanAmountM}M` },
          {
            label: 'Rate',
            value: offer.rateType === 'FIXED'
              ? `${offer.ratePct ?? '—'}% fixed`
              : `SOFR + ${offer.sofrSpreadPct ?? '—'}%`,
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

      {offer.status === 'PENDING' && (
        <div className="px-5 py-3 border-b border-outline-variant/20 flex items-center gap-2">
          <span className={`material-symbols-outlined text-[14px] ${isExpiringSoon ? 'text-error' : 'text-on-surface-variant'}`}>
            schedule
          </span>
          <span className={`text-[11px] font-medium ${isExpiringSoon ? 'text-error' : 'text-on-surface-variant'}`}>
            {countdown(offer.expiresAt)}
          </span>
        </div>
      )}

      {offer.status === 'REVISION_REQUESTED' && offer.revisionNotes && (
        <div className="px-5 py-4 bg-tertiary/5 border-b border-outline-variant/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-tertiary text-[16px]">edit_note</span>
            <p className="text-[10px] font-bold text-tertiary uppercase tracking-wide">Revision Requested</p>
          </div>
          <p className="text-[11px] text-on-surface mb-3">{offer.revisionNotes}</p>
          {!revising && (
            <button
              onClick={() => setRevising(true)}
              className="flex items-center gap-1.5 bg-tertiary/10 text-tertiary border border-tertiary/20 px-4 py-2 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
              Revise &amp; Resubmit
            </button>
          )}
        </div>
      )}

      {revising && (
        <div className="px-5 pb-5">
          <ResubmitForm
            offer={offer}
            token={token}
            onDone={() => { setRevising(false); onResubmitted() }}
            onCancel={() => setRevising(false)}
          />
        </div>
      )}
    </div>
  )
}

export default function OffersPage() {
  const { user, token } = useAuth()
  const [offers, setOffers] = useState<OfferWithProject[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  async function loadOffers() {
    if (!token) return
    setFetchError(null)
    try {
      const res = await fetch('/api/offers', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json: ApiResponse<OfferWithProject[]> = await res.json()
      if (json.ok) {
        setOffers(json.data)
      } else {
        setFetchError(json.error?.message ?? 'Failed to load offers.')
      }
    } catch {
      setFetchError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOffers()
  }, [token])

  if (user && user.role !== 'financier') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <span className="material-symbols-outlined text-[40px] text-error block">lock</span>
          <p className="text-on-surface font-bold">Access denied</p>
          <p className="text-[12px] text-on-surface-variant">This page is only available to financiers.</p>
        </div>
      </div>
    )
  }

  const active = offers.filter(o => ['PENDING', 'REVISION_REQUESTED'].includes(o.status))
  const history = offers.filter(o => !['PENDING', 'REVISION_REQUESTED'].includes(o.status))

  const totalOffers = offers.length
  const pending = offers.filter(o => o.status === 'PENDING').length
  const accepted = offers.filter(o => o.status === 'ACCEPTED').length
  const revisionRequested = offers.filter(o => o.status === 'REVISION_REQUESTED').length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">My Offers</h1>
        <p className="text-[13px] text-on-surface-variant mt-1">Track all term sheets you have submitted</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Offers" value={totalOffers} cls="text-on-surface" />
        <StatCard label="Pending" value={pending} cls="text-primary" />
        <StatCard label="Accepted" value={accepted} cls="text-secondary" />
        <StatCard label="Revision Requested" value={revisionRequested} cls="text-tertiary" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 h-40 animate-pulse" />
          ))}
        </div>
      ) : fetchError ? (
        <div className="bg-error/10 border border-error/20 rounded-xl px-5 py-4">
          <p className="text-[12px] text-error">{fetchError}</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-12 text-center">
          <span className="material-symbols-outlined text-[40px] text-outline mb-3 block">description</span>
          <p className="text-on-surface font-bold mb-1">No offers yet</p>
          <p className="text-[12px] text-on-surface-variant">Submit term sheets on projects to see them here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide px-1">
                Active ({active.length})
              </p>
              {active.map(offer => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  token={token ?? ''}
                  onResubmitted={loadOffers}
                />
              ))}
            </div>
          )}

          {history.length > 0 && (
            <div className="space-y-3 opacity-70">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide px-1">
                History ({history.length})
              </p>
              {history.map(offer => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  token={token ?? ''}
                  onResubmitted={loadOffers}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
