'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Stepper } from '@/components/onboard/stepper'

const GATES = [
  { id: 'G1', label: 'Physical Asset Gate',      category: 'CAT1', status: 'PASS',   metric: 'Asset commissioned · remaining life > tenor', icon: 'factory' },
  { id: 'G2', label: 'Revenue Contract Gate',    category: 'CAT2', status: 'PASS',   metric: 'Contracted revenue ≥ 70% DSCR coverage',        icon: 'receipt_long' },
  { id: 'G3', label: 'Cash Flow Gate',           category: 'CAT3', status: 'REVIEW', metric: 'Avg DSCR 1.04x · LQ 0.944 — minor dip Y3/Y5',  icon: 'waterfall_chart' },
  { id: 'G4', label: 'Legal & Title Gate',       category: 'CAT4', status: 'PASS',   metric: 'Clear title · SPV formed · true sale obtained', icon: 'gavel' },
  { id: 'G5', label: 'Credit Enhancement Gate',  category: 'CAT5', status: 'PASS',   metric: 'OC 25% · Cash reserve ₹50 Mn · AAA tranche',   icon: 'verified_user' },
  { id: 'G6', label: 'Technology & Oracle Gate', category: 'CAT6', status: 'PASS',   metric: 'IEEE 2030.5 · DER client certified · 8ms latency', icon: 'sensors' },
  { id: 'G7', label: 'Regulatory Gate',          category: 'CAT7', status: 'PASS',   metric: 'All permits current · SEBI AIF registered',     icon: 'account_balance' },
]

const LQ_COMPONENTS = [
  { label: 'Availability A(t)',  value: 0.974, weight: 0.40, color: 'bg-secondary' },
  { label: 'DSCR Score D(t)',    value: 0.923, weight: 0.35, color: 'bg-primary' },
  { label: 'Verification V(t)', value: 1.000, weight: 0.25, color: 'bg-tertiary' },
]

const DSCR_YEARS = [
  { year: 'Y1',  v: 1.31 }, { year: 'Y2',  v: 1.20 }, { year: 'Y3',  v: 0.97 },
  { year: 'Y4',  v: 1.09 }, { year: 'Y5',  v: 0.93 }, { year: 'Y6',  v: 1.13 },
  { year: 'Y7',  v: 1.15 }, { year: 'Y8',  v: 1.17 }, { year: 'Y9',  v: 1.13 },
  { year: 'Y10', v: 0.91 }, { year: 'Y11', v: 0.95 }, { year: 'Y12', v: 1.19 },
]

const COMPOSITE_LQ = 0.944

export default function CreditPackPage() {
  const params = useSearchParams()
  const id = params.get('id') ?? ''

  const passCount = GATES.filter(g => g.status === 'PASS').length
  const reviewCount = GATES.filter(g => g.status === 'REVIEW').length

  return (
    <div className="py-gutter space-y-8 max-w-5xl">
      <Stepper currentStep={4} projectId={id} />

      {/* Header */}
      <div>
        <h1 className="text-display-lg text-on-surface">Credit Pack</h1>
        <p className="text-body-base text-on-surface-variant mt-1">
          Asset qualification assessment — 7 gates across physical, financial, legal, and technology dimensions
        </p>
      </div>

      {/* LQ Score hero */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          {/* Ring gauge */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
              <circle cx="80" cy="80" r="64" fill="none" stroke="#e7eeff" strokeWidth="14" />
              <circle
                cx="80" cy="80" r="64"
                fill="none"
                stroke={COMPOSITE_LQ >= 0.80 ? '#006a65' : '#ba1a1a'}
                strokeWidth="14"
                strokeDasharray={`${2 * Math.PI * 64}`}
                strokeDashoffset={`${2 * Math.PI * 64 * (1 - COMPOSITE_LQ)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <p className="text-[32px] font-bold text-on-surface leading-none">{COMPOSITE_LQ.toFixed(3)}</p>
              <p className="text-label-caps text-secondary mt-1">LQ SCORE</p>
            </div>
          </div>

          {/* Components */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <div>
                <p className="font-bold text-on-surface">Gate G3 — PASS</p>
                <p className="text-caption text-on-surface-variant">LQ ≥ 0.80 · 6 consecutive months confirmed</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {LQ_COMPONENTS.map(({ label, value, weight, color }) => (
                <div key={label} className="bg-surface-container-low rounded-xl p-4">
                  <p className="text-label-caps text-on-surface-variant mb-2">{label}</p>
                  <p className="text-data-point font-bold text-on-surface mb-2">{value.toFixed(3)}</p>
                  <div className="h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value * 100}%` }} />
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1.5">Weight: {(weight * 100).toFixed(0)}%</p>
                </div>
              ))}
            </div>
            <div className="bg-primary/5 rounded-lg px-4 py-2.5 border border-primary/10">
              <p className="text-caption text-on-surface font-medium">
                <span className="font-bold">Formula: </span>
                LQ = [A(t)×0.40 + D(t)×0.35 + V(t)×0.25] × (1−δ) = [{' '}
                {(0.974 * 0.40).toFixed(3)} + {(0.923 * 0.35).toFixed(3)} + {(1.000 * 0.25).toFixed(3)}
                ] × 1.0 = <span className="font-bold text-primary">{COMPOSITE_LQ}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DSCR bar chart */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[20px]">waterfall_chart</span>
          <div>
            <h2 className="text-label-caps font-bold text-on-surface tracking-widest">DSCR Projection (12-Year)</h2>
            <p className="text-caption text-on-surface-variant mt-0.5">Avg 1.04x · Minimum 0.91x (Y10) mitigated by cash reserve</p>
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
            {DSCR_YEARS.map(({ year, v }) => {
              const pct = Math.min((v / 1.5) * 100, 100)
              const isOk = v >= 1.0
              return (
                <div key={year} className="flex-1 flex flex-col items-center gap-1">
                  <p className="text-[10px] font-bold text-on-surface-variant">{v.toFixed(2)}x</p>
                  <div className="w-full relative" style={{ height: `${pct}%` }}>
                    <div
                      className={`absolute bottom-0 w-full rounded-t-sm transition-all ${isOk ? 'bg-secondary/70' : 'bg-error/60'}`}
                      style={{ height: '100%' }}
                    />
                    {/* 1.0x threshold line */}
                  </div>
                  <p className="text-[10px] text-on-surface-variant">{year}</p>
                </div>
              )
            })}
          </div>
          {/* 1.0x line overlay label */}
          <div className="flex items-center gap-2 mt-3 border-t border-dashed border-outline-variant/40 pt-2">
            <div className="w-8 h-px border-t-2 border-dashed border-outline" />
            <p className="text-[11px] text-on-surface-variant">1.0x minimum threshold</p>
          </div>
        </div>
      </div>

      {/* 7 Gates */}
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
          </div>
        </div>
        <div className="divide-y divide-outline-variant/20">
          {GATES.map(({ id: gid, label, category, status, metric, icon }) => (
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

      {/* Overall status */}
      <div className="bg-secondary-container/20 border border-secondary/20 rounded-xl p-5 flex items-start gap-4">
        <span className="material-symbols-outlined text-secondary text-[28px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
        <div className="flex-1">
          <p className="font-bold text-on-surface">Conditionally Qualified — Proceed to Submission</p>
          <p className="text-caption text-on-surface-variant mt-0.5">
            6 of 7 gates fully passed. Gate G3 flagged for review (DSCR dips in Y3/Y5/Y10 mitigated by ₹50 Mn cash reserve).
            Asset is eligible for token issuance and pool structuring.
          </p>
        </div>
      </div>

      {/* Navigation */}
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
