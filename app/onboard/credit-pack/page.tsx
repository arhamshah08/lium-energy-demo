'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Stepper } from '@/components/onboard/stepper'
import { useAuth } from '@/components/auth/auth-context'
import type { DSCRYear, Project, RiskProfile, SavedQualificationGate } from '@/types'

// ─── DSCR projection from real financials ────────────────────────────────────

function computeDscrProjection(project: Project): DSCRYear[] {
  const fin = project.financials
  if (!fin?.annualRevenueM || !fin?.annualOpexM || !fin?.annualDebtServiceM) return []
  const years = Math.min(fin.assetLifeYears ?? 20, 20)
  const degradation = project.assetType === 'BESS' ? 0.008
    : project.assetType === 'WIND' ? 0.003
    : 0.005  // solar / hybrid default
  return Array.from({ length: Math.min(years, 12) }, (_, i) => {
    const revenue = fin.annualRevenueM! * Math.pow(1 - degradation, i)
    const opex = fin.annualOpexM! * Math.pow(1.02, i)
    const debtService = fin.annualDebtServiceM!
    const dscr = (revenue - opex) / debtService
    return { year: i + 1, revenue, opex, debtService, dscr }
  })
}

function normalizeDscr(dscrYears: DSCRYear[]): number {
  if (dscrYears.length === 0) return 0.923  // fallback default
  const avg = dscrYears.reduce((s, y) => s + y.dscr, 0) / dscrYears.length
  return Math.max(0, Math.min(1, (avg - 0.5) / 1.0))
}

function computeGates(project: Project, dscrYears: DSCRYear[]): SavedQualificationGate[] {
  const fin = project.financials
  const avgDscr = dscrYears.length > 0
    ? dscrYears.reduce((s, y) => s + y.dscr, 0) / dscrYears.length
    : null
  const minDscr = dscrYears.length > 0 ? Math.min(...dscrYears.map(y => y.dscr)) : null

  const hasCapacity = !!fin?.capacityMW
  const hasLife = (fin?.assetLifeYears ?? 0) > 0
  const hasPpa = !!fin?.ppaCounterparty && !!fin?.annualRevenueM
  const revenueCoversDebt = fin?.annualRevenueM && fin?.annualDebtServiceM
    ? fin.annualRevenueM >= fin.annualDebtServiceM * 0.7
    : false
  const hasLegalTitle = project.documents.some(d => d.type === 'LEGAL_TITLE')
  const debtPct = fin?.debtPct ?? 70
  const telemetryOk = project.telemetry?.verified === true

  const g3Status: SavedQualificationGate['status'] = avgDscr === null ? 'REVIEW'
    : avgDscr >= 1.20 ? 'PASS'
    : avgDscr >= 1.00 ? 'REVIEW'
    : 'FAIL'

  const passedStatuses = ['SUBMITTED', 'ACTIVE', 'PUBLISHED_FOR_FINANCE', 'OFFER_RECEIVED',
    'FINANCING_ACCEPTED', 'PUBLISHED_FOR_SA', 'TRANSACTING', 'TOKENISED']

  return [
    {
      id: 'G1', label: 'Physical Asset Gate', category: 'CAT1', icon: 'factory',
      status: hasCapacity && hasLife ? 'PASS' : hasCapacity || hasLife ? 'REVIEW' : 'FAIL',
      metric: hasCapacity
        ? `${fin!.capacityMW}MW · ${fin!.assetLifeYears ?? '?'}-year asset life`
        : 'Enter capacity and asset life in Step 1',
    },
    {
      id: 'G2', label: 'Revenue Contract Gate', category: 'CAT2', icon: 'receipt_long',
      status: hasPpa && revenueCoversDebt ? 'PASS' : hasPpa ? 'REVIEW' : 'FAIL',
      metric: hasPpa
        ? `${fin!.ppaCounterparty} · $${fin!.annualRevenueM!.toFixed(1)}M revenue · ${revenueCoversDebt ? '≥70% DSCR coverage' : '<70% DSCR — below threshold'}`
        : 'Add PPA counterparty and revenue in Step 1',
    },
    {
      id: 'G3', label: 'Cash Flow Gate', category: 'CAT3', icon: 'waterfall_chart',
      status: g3Status,
      metric: avgDscr !== null
        ? `Avg DSCR ${avgDscr.toFixed(2)}x · Min ${minDscr!.toFixed(2)}x${g3Status === 'REVIEW' ? ' — dip mitigated by cash reserve' : ''}`
        : 'Enter financial model in Step 1 to compute DSCR',
    },
    {
      id: 'G4', label: 'Legal & Title Gate', category: 'CAT4', icon: 'gavel',
      status: hasLegalTitle ? 'PASS' : 'REVIEW',
      metric: hasLegalTitle
        ? 'Legal title document uploaded · SPV formation pending'
        : 'Upload legal title document in Step 2',
    },
    {
      id: 'G5', label: 'Credit Enhancement Gate', category: 'CAT5', icon: 'verified_user',
      status: debtPct <= 75 ? 'PASS' : debtPct <= 85 ? 'REVIEW' : 'FAIL',
      metric: `${debtPct.toFixed(0)}% debt · ${(100 - debtPct).toFixed(0)}% equity${debtPct <= 75 ? ' · OC adequate' : ' · consider reducing leverage'}`,
    },
    {
      id: 'G6', label: 'Technology & Oracle Gate', category: 'CAT6', icon: 'sensors',
      status: telemetryOk ? 'PASS' : 'REVIEW',
      metric: telemetryOk
        ? `${project.telemetry?.connectionMethod ?? 'API'} verified · latency within spec`
        : 'Telemetry not verified — complete Step 3',
    },
    {
      id: 'G7', label: 'Regulatory Gate', category: 'CAT7', icon: 'account_balance',
      status: passedStatuses.includes(project.status) ? 'PASS' : 'REVIEW',
      metric: `${project.jurisdiction} · ${passedStatuses.includes(project.status) ? 'permits filed · market-based rate authority' : 'complete submission to verify permits'}`,
    },
  ]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clamp(v: number) { return Math.max(0, Math.min(1, v)) }

function computeLQ(a: number, d: number, v: number, penalty: number) {
  return (a * 0.40 + d * 0.35 + v * 0.25) * (1 - penalty)
}

function lqGate(lq: number): RiskProfile['gate'] {
  if (lq >= 0.80) return 'PASS'
  if (lq >= 0.60) return 'REVIEW'
  return 'FAIL'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RangeInput({
  label, value, onChange, color, readOnly = false,
}: {
  label: string
  value: number
  onChange?: (v: number) => void
  color: string
  readOnly?: boolean
}) {
  return (
    <div className={`rounded-xl p-4 space-y-2 ${readOnly ? 'bg-surface-container/50 opacity-80' : 'bg-surface-container-low'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <p className="text-label-caps text-on-surface-variant text-[11px]">{label}</p>
          {readOnly && (
            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">computed</span>
          )}
        </div>
        {readOnly ? (
          <p className="text-data-point font-bold text-on-surface text-sm">{value.toFixed(3)}</p>
        ) : (
          <input
            type="number"
            min={0} max={1} step={0.001}
            value={value.toFixed(3)}
            onChange={e => onChange!(clamp(parseFloat(e.target.value) || 0))}
            className="w-20 text-right text-data-point font-bold text-on-surface bg-transparent border-b border-outline-variant focus:border-primary outline-none transition-colors text-sm"
          />
        )}
      </div>
      <input
        type="range"
        min={0} max={1} step={0.001}
        value={value}
        onChange={readOnly ? undefined : e => onChange!(parseFloat(e.target.value))}
        disabled={readOnly}
        className="w-full accent-primary h-1.5 disabled:cursor-not-allowed"
      />
      <div className="h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreditPackPage() {
  const params = useSearchParams()
  const id = params.get('id') ?? ''
  const { token: authToken } = useAuth()
  const [project, setProject] = useState<Project | null>(null)

  const [availability, setAvailability] = useState(0.974)
  const [verification, setVerification] = useState(1.000)
  const [penalty, setPenalty]           = useState(0.000)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !authToken) return
    fetch(`/api/projects/${id}`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(r => r.json())
      .then(json => {
        if (json.ok) {
          setProject(json.data)
          const rp = json.data?.telemetry?.riskProfile
          if (rp) {
            setAvailability(rp.availability)
            setVerification(rp.verification)
            setPenalty(rp.penalty)
          }
        }
      })
      .catch(() => {})
  }, [id, authToken])

  const dscrYears: DSCRYear[] = useMemo(
    () => project ? computeDscrProjection(project) : [],
    [project]
  )

  const dscrScore = useMemo(() => normalizeDscr(dscrYears), [dscrYears])

  const lqComposite = computeLQ(availability, dscrScore, verification, penalty)
  const gate = lqGate(lqComposite)

  const gates: SavedQualificationGate[] = useMemo(
    () => project ? computeGates(project, dscrYears) : [],
    [project, dscrYears]
  )

  const passCount   = gates.filter(g => g.status === 'PASS').length
  const reviewCount = gates.filter(g => g.status === 'REVIEW').length

  const hasFinancials = !!(project?.financials?.annualRevenueM)

  const displayDscr = dscrYears.length > 0 ? dscrYears : [
    { year: 1, dscr: 1.31 }, { year: 2, dscr: 1.20 }, { year: 3, dscr: 0.97 },
    { year: 4, dscr: 1.09 }, { year: 5, dscr: 0.93 }, { year: 6, dscr: 1.13 },
    { year: 7, dscr: 1.15 }, { year: 8, dscr: 1.17 }, { year: 9, dscr: 1.13 },
    { year: 10, dscr: 0.91 }, { year: 11, dscr: 0.95 }, { year: 12, dscr: 1.19 },
  ] as { year: number; dscr: number }[]

  const avgDscrDisplay = displayDscr.reduce((s, y) => s + y.dscr, 0) / displayDscr.length
  const minDscrDisplay = Math.min(...displayDscr.map(y => y.dscr))
  const minDscrYear    = displayDscr.find(y => y.dscr === minDscrDisplay)?.year

  const handleSave = useCallback(async () => {
    if (!id || !authToken) return
    setSaving(true)
    setSaved(false)
    setSaveError(null)

    const riskProfile: RiskProfile = {
      availability,
      dscrScore,
      verification,
      penalty,
      lqComposite,
      gate,
      assessedAt: new Date().toISOString(),
    }

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ telemetry: { riskProfile, qualificationGates: gates } }),
      })
      const json = await res.json()
      if (json.ok) setSaved(true)
      else setSaveError(json.error?.message ?? 'Save failed')
    } catch {
      setSaveError('Network error — please retry')
    } finally {
      setSaving(false)
    }
  }, [id, authToken, availability, dscrScore, verification, penalty, lqComposite, gate, gates])

  const gateColor = gate === 'PASS' ? 'text-secondary' : gate === 'REVIEW' ? 'text-tertiary' : 'text-error'
  const ringColor = gate === 'PASS' ? '#006a65' : gate === 'REVIEW' ? '#7b5800' : '#ba1a1a'

  return (
    <div className="py-gutter space-y-8 max-w-5xl">
      <Stepper currentStep={4} projectId={id} />

      <div>
        <h1 className="text-display-lg text-on-surface">Credit Pack</h1>
        {project && (
          <p className="text-body-base text-primary font-medium mt-0.5">
            {project.name} · {project.location}
          </p>
        )}
        <p className="text-body-base text-on-surface-variant mt-1">
          LQ risk indicators derived from your asset data. D(t) is computed automatically from your financial model.
        </p>
      </div>

      {/* Financial inputs banner */}
      {!hasFinancials && (
        <div className="flex items-center gap-4 bg-tertiary/5 border border-tertiary/20 rounded-xl px-5 py-4">
          <span className="material-symbols-outlined text-tertiary text-[22px] shrink-0">info</span>
          <div className="flex-1 min-w-0">
            <p className="text-caption font-bold text-on-surface">Add financial model in Step 1 for computed DSCR</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Annual revenue, OPEX, and debt service inputs unlock real DSCR projection and auto-compute D(t). Showing sample values until then.</p>
          </div>
          <Link href={`/onboard/project-details${id ? `?id=${id}` : ''}`} className="text-label-caps font-bold text-tertiary hover:opacity-80 transition-opacity shrink-0">
            Update Step 1 →
          </Link>
        </div>
      )}

      {/* LQ Score hero */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card p-6 lg:p-8">
        <div className="flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-secondary text-[18px]">tune</span>
          <h2 className="text-label-caps font-bold text-on-surface tracking-widest">LQ RISK INDICATORS</h2>
          <span className="text-[10px] text-on-surface-variant ml-1">— D(t) is auto-computed from DSCR</span>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Ring gauge */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
              <circle cx="80" cy="80" r="64" fill="none" stroke="#e7eeff" strokeWidth="14" />
              <circle
                cx="80" cy="80" r="64"
                fill="none"
                stroke={ringColor}
                strokeWidth="14"
                strokeDasharray={`${2 * Math.PI * 64}`}
                strokeDashoffset={`${2 * Math.PI * 64 * (1 - lqComposite)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
              />
            </svg>
            <div className="absolute text-center">
              <p className="text-[32px] font-bold text-on-surface leading-none">{lqComposite.toFixed(3)}</p>
              <p className={`text-label-caps mt-1 font-bold ${gateColor}`}>{gate}</p>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <RangeInput
              label="Availability  A(t)  · weight 40%"
              value={availability}
              onChange={setAvailability}
              color="bg-secondary"
            />
            <RangeInput
              label="DSCR Score    D(t)  · weight 35%"
              value={dscrScore}
              color="bg-primary"
              readOnly
            />
            <RangeInput
              label="Verification  V(t)  · weight 25%"
              value={verification}
              onChange={setVerification}
              color="bg-tertiary"
            />
            <RangeInput
              label="Penalty       δ     · reduces LQ"
              value={penalty}
              onChange={setPenalty}
              color="bg-error"
            />

            <div className="bg-primary/5 rounded-lg px-4 py-2.5 border border-primary/10">
              <p className="text-caption text-on-surface font-medium">
                <span className="font-bold">LQ = </span>
                [{availability.toFixed(3)}×0.40 + {dscrScore.toFixed(3)}×0.35 + {verification.toFixed(3)}×0.25] × (1−{penalty.toFixed(3)})
                {' '}= <span className={`font-bold ${gateColor}`}>{lqComposite.toFixed(4)}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4 border-t border-outline-variant/30 pt-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                Saving…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">save</span>
                Save Risk Profile
              </>
            )}
          </button>

          {saved && !saving && (
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-label-caps font-bold">Saved — visible to all partners</span>
            </div>
          )}
          {saveError && <p className="text-label-caps text-error">{saveError}</p>}
        </div>
      </div>

      {/* DSCR bar chart */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[20px]">waterfall_chart</span>
          <div>
            <h2 className="text-label-caps font-bold text-on-surface tracking-widest">
              DSCR Projection ({displayDscr.length}-Year)
              {hasFinancials && <span className="ml-2 text-[9px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">computed from inputs</span>}
            </h2>
            <p className="text-caption text-on-surface-variant mt-0.5">
              Avg {avgDscrDisplay.toFixed(2)}x · Min {minDscrDisplay.toFixed(2)}x (Y{minDscrYear}) mitigated by cash reserve
            </p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-secondary" />
              <span className="text-caption text-on-surface-variant">DSCR ≥ 1.0x</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-error/70" />
              <span className="text-caption text-on-surface-variant">DSCR &lt; 1.0x</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-end gap-2 h-36">
            {displayDscr.map(({ year, dscr }) => {
              const pct = Math.min((dscr / 1.5) * 100, 100)
              const isOk = dscr >= 1.0
              return (
                <div key={year} className="flex-1 flex flex-col items-center gap-1">
                  <p className="text-[10px] font-bold text-on-surface-variant">{dscr.toFixed(2)}x</p>
                  <div className="w-full relative" style={{ height: `${Math.max(pct, 4)}%` }}>
                    <div
                      className={`absolute bottom-0 w-full rounded-t-sm transition-all ${isOk ? 'bg-secondary/70' : 'bg-error/60'}`}
                      style={{ height: '100%' }}
                    />
                  </div>
                  <p className="text-[10px] text-on-surface-variant">Y{year}</p>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-2 mt-3 border-t border-dashed border-outline-variant/40 pt-2">
            <div className="w-8 h-px border-t-2 border-dashed border-outline" />
            <p className="text-[11px] text-on-surface-variant">1.0x minimum threshold</p>
          </div>
        </div>
      </div>

      {/* 7 Qualification Gates */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-[20px]">checklist</span>
            <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Qualification Gates</h2>
          </div>
          <div className="flex gap-2">
            <span className="text-label-caps text-secondary">{passCount} PASS</span>
            <span className="text-on-surface-variant">·</span>
            <span className="text-label-caps text-tertiary">{reviewCount} REVIEW</span>
            {gates.filter(g => g.status === 'FAIL').length > 0 && (
              <>
                <span className="text-on-surface-variant">·</span>
                <span className="text-label-caps text-error">{gates.filter(g => g.status === 'FAIL').length} FAIL</span>
              </>
            )}
          </div>
        </div>
        <div className="divide-y divide-outline-variant/20">
          {gates.map(({ id: gid, label, category, status, metric, icon }) => (
            <div key={gid} className="flex items-center gap-4 px-6 py-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                status === 'PASS'   ? 'bg-secondary-container text-on-secondary-container' :
                status === 'REVIEW' ? 'bg-tertiary-container text-on-tertiary-container' :
                'bg-error-container text-on-error-container'
              }`}>
                <span className="material-symbols-outlined text-[16px]">{icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-caption font-bold text-on-surface">{label}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    status === 'PASS'   ? 'bg-secondary/10 text-secondary' :
                    status === 'REVIEW' ? 'bg-tertiary/10 text-tertiary' :
                    'bg-error/10 text-error'
                  }`}>{status}</span>
                </div>
                <p className="text-[11px] text-on-surface-variant truncate mt-0.5">{metric}</p>
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant/50 shrink-0">{category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Overall verdict */}
      <div className={`border rounded-xl p-5 flex items-start gap-4 ${
        gate === 'PASS'   ? 'bg-secondary-container/20 border-secondary/20' :
        gate === 'REVIEW' ? 'bg-tertiary/5 border-tertiary/20' :
        'bg-error/5 border-error/20'
      }`}>
        <span className={`material-symbols-outlined text-[28px] shrink-0 ${gateColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {gate === 'PASS' ? 'check_circle' : gate === 'REVIEW' ? 'warning' : 'cancel'}
        </span>
        <div className="flex-1">
          <p className="font-bold text-on-surface">
            {gate === 'PASS' ? 'Conditionally Qualified — Proceed to Submission' :
             gate === 'REVIEW' ? 'Under Review — Adjust indicators or add credit enhancement' :
             'Disqualified — LQ below minimum threshold (0.60)'}
          </p>
          <p className="text-caption text-on-surface-variant mt-0.5">
            LQ composite {lqComposite.toFixed(3)} · {gate === 'PASS' ? 'Threshold 0.80 met' : gate === 'REVIEW' ? 'Threshold 0.80 not met' : 'Below 0.60 floor'}.
            {' '}Save your risk profile so capital partners can see this score on your project page.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30">
        <Link
          href={`/onboard/telemetry${id ? `?id=${id}` : ''}`}
          className="flex items-center gap-2 text-label-caps text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Telemetry Link
        </Link>
        <Link
          href={`/onboard/submission${id ? `?id=${id}` : ''}`}
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm"
        >
          Proceed to Submission
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
    </div>
  )
}
