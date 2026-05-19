'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/auth-context'
import type { CreateOfferBody, InterestRateType } from '@/types'

interface Props {
  projectId: string
  projectName: string
  onSuccess: () => void
  onCancel: () => void
}

function tomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export function SubmitOfferPanel({ projectId, projectName, onSuccess, onCancel }: Props) {
  const { token } = useAuth()

  const [loanAmountM, setLoanAmountM] = useState('')
  const [rateType, setRateType] = useState<InterestRateType>('FIXED')
  const [ratePct, setRatePct] = useState('')
  const [sofrSpreadPct, setSofrSpreadPct] = useState('')
  const [tenorYears, setTenorYears] = useState('')
  const [dscrCovenant, setDscrCovenant] = useState('')
  const [securityRequirements, setSecurityRequirements] = useState('')
  const [conditionsPrecedent, setConditionsPrecedent] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const body: CreateOfferBody = {
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
      const res = await fetch(`/api/projects/${projectId}/offers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.ok) {
        onSuccess()
      } else {
        setError(json.error?.message ?? 'Failed to submit offer.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/60 sticky top-0 bg-surface-container-lowest z-10">
          <div>
            <p className="text-label-caps font-bold text-on-surface tracking-widest">SUBMIT TERM SHEET</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">{projectName}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1.5">
              Loan Amount ($M) <span className="text-error">*</span>
            </label>
            <input
              type="number"
              required
              min={0}
              step="0.1"
              placeholder="e.g. 50"
              value={loanAmountM}
              onChange={e => setLoanAmountM(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-4 py-3 text-caption text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1.5">
              Interest Rate Type
            </label>
            <div className="flex gap-2">
              {(['FIXED', 'FLOATING'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRateType(type)}
                  className={`flex-1 py-2.5 rounded-xl text-label-caps font-bold border transition-all ${
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
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1.5">
                Rate %
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                placeholder="e.g. 7.5"
                value={ratePct}
                onChange={e => setRatePct(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-4 py-3 text-caption text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
          )}

          {rateType === 'FLOATING' && (
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1.5">
                SOFR Spread %
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                placeholder="e.g. 2.5"
                value={sofrSpreadPct}
                onChange={e => setSofrSpreadPct(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-4 py-3 text-caption text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1.5">
              Tenor (years) <span className="text-error">*</span>
            </label>
            <input
              type="number"
              required
              min={1}
              step={1}
              placeholder="e.g. 15"
              value={tenorYears}
              onChange={e => setTenorYears(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-4 py-3 text-caption text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1.5">
              DSCR Covenant <span className="text-error">*</span>
            </label>
            <input
              type="number"
              required
              min={0}
              step={0.01}
              placeholder="e.g. 1.25"
              value={dscrCovenant}
              onChange={e => setDscrCovenant(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-4 py-3 text-caption text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1.5">
              Security Requirements
            </label>
            <textarea
              rows={3}
              placeholder="e.g. First lien on asset, revenue assignment"
              value={securityRequirements}
              onChange={e => setSecurityRequirements(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-4 py-3 text-caption text-on-surface placeholder:text-on-surface-variant/50 resize-none focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1.5">
              Conditions Precedent
            </label>
            <textarea
              rows={3}
              placeholder="e.g. PTO confirmation, insurance in place"
              value={conditionsPrecedent}
              onChange={e => setConditionsPrecedent(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-4 py-3 text-caption text-on-surface placeholder:text-on-surface-variant/50 resize-none focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1.5">
              Offer Expiry Date <span className="text-error">*</span>
            </label>
            <input
              type="date"
              required
              min={tomorrow()}
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-4 py-3 text-caption text-on-surface focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-xl px-4 py-3">
              <p className="text-[11px] text-error">{error}</p>
            </div>
          )}

          <div className="space-y-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary py-3 rounded-xl text-label-caps font-bold hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? 'Submitting…' : 'Submit Term Sheet'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full text-on-surface-variant text-label-caps hover:text-on-surface transition-colors py-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
