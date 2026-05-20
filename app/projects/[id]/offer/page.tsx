'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-context'
import type { CreateOfferBody, InterestRateType, Project } from '@/types'

const ASSET_LABELS: Record<string, string> = {
  BESS:              'Battery Energy Storage System',
  MICROGRID:         'Microgrid',
  DER_CLUSTER:       'DER Cluster',
  SOLAR_PV:          'Solar PV',
  WIND:              'Wind',
  SOLAR_BESS_HYBRID: 'Solar+BESS Hybrid',
}

function tomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

function computeDscr(project: Project): string | null {
  const f = project.financials
  if (!f) return null
  if (
    f.annualRevenueM !== undefined &&
    f.annualOpexM !== undefined &&
    f.annualDebtServiceM !== undefined &&
    f.annualDebtServiceM !== 0
  ) {
    return `${((f.annualRevenueM - f.annualOpexM) / f.annualDebtServiceM).toFixed(2)}x`
  }
  return null
}

export default function OfferPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const { user, token, loading: authLoading } = useAuth()

  const [project, setProject] = useState<Project | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [loanAmountM, setLoanAmountM] = useState('')
  const [rateType, setRateType] = useState<InterestRateType>('FIXED')
  const [ratePct, setRatePct] = useState('')
  const [sofrSpreadPct, setSofrSpreadPct] = useState('')
  const [tenorYears, setTenorYears] = useState('')
  const [dscrCovenant, setDscrCovenant] = useState('')
  const [securityRequirements, setSecurityRequirements] = useState('')
  const [conditionsPrecedent, setConditionsPrecedent] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace(`/projects/${id}`); return }
    if (user.role !== 'financier') { router.replace(`/projects/${id}`); return }

    async function load() {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const json = await res.json()
        if (json.ok) setProject(json.data)
        else setFetchError(json.error?.message ?? 'Failed to load project.')
      } catch {
        setFetchError('Network error.')
      }
    }
    load()
  }, [authLoading, user, token, id, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)

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
      const res = await fetch(`/api/projects/${id}/offers`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.ok) {
        setSuccess(true)
        setTimeout(() => router.push(`/projects/${id}`), 1500)
      } else {
        setFormError(json.error?.message ?? 'Failed to submit offer.')
      }
    } catch {
      setFormError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || (!project && !fetchError)) {
    return (
      <div className="py-gutter flex items-center justify-center min-h-64">
        <span className="text-caption text-on-surface-variant">Loading…</span>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="py-gutter">
        <p className="text-caption text-error">{fetchError}</p>
      </div>
    )
  }

  if (!project) return null

  const f = project.financials
  const dscrStr = computeDscr(project)
  const capacityParts: string[] = []
  if (f?.capacityMW !== undefined) capacityParts.push(`${f.capacityMW}MW`)
  if (f?.capacityMWh !== undefined) capacityParts.push(`${f.capacityMWh}MWh`)
  const capacityStr = capacityParts.length > 0 ? capacityParts.join(' / ') : null

  const highlights: Array<{ label: string; value: string; icon: string; highlight?: boolean }> = []
  if (capacityStr) highlights.push({ label: 'Capacity', value: capacityStr, icon: 'bolt' })
  if (f?.totalCapexM !== undefined) highlights.push({ label: 'Total CAPEX', value: `$${f.totalCapexM}M`, icon: 'account_balance' })
  if (f?.annualRevenueM !== undefined) highlights.push({ label: 'Annual Revenue', value: `$${f.annualRevenueM}M`, icon: 'trending_up' })
  if (f?.quarterlyFundingAskM !== undefined) highlights.push({ label: 'Quarterly Funding Ask', value: `$${f.quarterlyFundingAskM}M/quarter`, icon: 'request_quote', highlight: true })
  if (dscrStr) highlights.push({ label: 'DSCR', value: dscrStr, icon: 'analytics' })
  if (f?.ppaCounterparty) highlights.push({ label: 'PPA Counterparty', value: f.ppaCounterparty, icon: 'handshake' })

  if (success) {
    return (
      <div className="py-gutter flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-4 text-center">
          <span
            className="material-symbols-outlined text-secondary text-[48px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <p className="font-bold text-on-surface text-headline-sm">Term sheet submitted</p>
          <p className="text-caption text-on-surface-variant">Redirecting to project…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-gutter max-w-5xl">
      <nav className="flex items-center gap-2 text-caption text-on-surface-variant mb-8">
        <a href="/projects" className="hover:text-on-surface transition-colors">Asset Registry</a>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <a href={`/projects/${id}`} className="hover:text-on-surface transition-colors">{project.name}</a>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">Submit Term Sheet</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-2 lg:sticky lg:top-8 space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40">
              <p className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-widest mb-1">Project</p>
              <h1 className="text-headline-sm font-bold text-on-surface">{project.name}</h1>
              <p className="text-caption text-on-surface-variant mt-1">
                {ASSET_LABELS[project.assetType] ?? project.assetType} · {project.jurisdiction}
              </p>
              {project.location && (
                <p className="text-caption text-on-surface-variant mt-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">location_on</span>
                  {project.location}
                </p>
              )}
            </div>
            {highlights.length > 0 && (
              <dl className="divide-y divide-outline-variant/30">
                <p className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-widest px-6 pt-4 pb-1">Financial Highlights</p>
                {highlights.map(({ label, value, icon, highlight }) => (
                  <div key={label} className="flex items-center gap-3 px-6 py-3">
                    <span className="material-symbols-outlined text-outline text-[15px] shrink-0">{icon}</span>
                    <dt className="text-[11px] text-on-surface-variant w-32 shrink-0">{label}</dt>
                    <dd className={`text-[11px] font-medium ${highlight ? 'text-secondary font-bold' : 'text-on-surface'}`}>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card">
            <div className="px-6 py-5 border-b border-outline-variant/60">
              <p className="text-label-caps font-bold text-on-surface tracking-widest">TERM SHEET</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5">Fill in your financing terms below</p>
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

              {formError && (
                <div className="bg-error/10 border border-error/20 rounded-xl px-4 py-3">
                  <p className="text-[11px] text-error">{formError}</p>
                </div>
              )}

              <div className="space-y-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-on-primary py-3 rounded-xl text-label-caps font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Submitting…' : 'Submit Term Sheet'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full text-on-surface-variant text-label-caps hover:text-on-surface transition-colors py-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
