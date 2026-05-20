'use client'

import Link from 'next/link'
import type { Project, AssetType, ProjectStatus } from '@/types'

const STATUS_LABEL: Partial<Record<ProjectStatus, { label: string; cls: string }>> = {
  PUBLISHED_FOR_FINANCE: { label: 'Open for Offers',   cls: 'bg-secondary/10 text-secondary' },
  OFFER_RECEIVED:        { label: 'Offer Sent',        cls: 'bg-tertiary/10 text-tertiary'   },
  FINANCING_ACCEPTED:    { label: 'Financing Closed',  cls: 'bg-secondary/10 text-secondary' },
}

const ASSET_META: Record<AssetType, { label: string; icon: string }> = {
  BESS:              { label: 'Battery Storage',   icon: 'battery_charging_full' },
  MICROGRID:         { label: 'Microgrid',         icon: 'grid_view' },
  DER_CLUSTER:       { label: 'DER Cluster',       icon: 'hub' },
  SOLAR_PV:          { label: 'Solar PV',          icon: 'solar_power' },
  WIND:              { label: 'Wind',              icon: 'air' },
  SOLAR_BESS_HYBRID: { label: 'Solar+BESS Hybrid', icon: 'energy_program_saving' },
}

function fmt(v: number | undefined, prefix = '$', suffix = 'M') {
  if (v == null) return null
  return `${prefix}${v}${suffix}`
}

function fmtDate(d: string | undefined) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function FinancierProjectScorecard({ project }: { project: Project }) {
  const meta = ASSET_META[project.assetType] ?? { label: project.assetType, icon: 'energy_program_saving' }
  const f = project.financials

  const dscr = (f?.annualRevenueM != null && f?.annualOpexM != null && f?.annualDebtServiceM)
    ? ((f.annualRevenueM - f.annualOpexM) / f.annualDebtServiceM).toFixed(2) + 'x'
    : null

  const capacityStr = [
    f?.capacityMW != null ? `${f.capacityMW}MW` : null,
    f?.capacityMWh != null ? `${f.capacityMWh}MWh` : null,
  ].filter(Boolean).join(' / ') || null

  const kpis = [
    { label: 'Total CAPEX',      value: fmt(f?.totalCapexM),                    icon: 'account_balance', highlight: false },
    { label: 'COD',              value: fmtDate(f?.codDate),                    icon: 'event_available', highlight: false },
    { label: 'Asset Life',       value: f?.assetLifeYears != null ? `${f.assetLifeYears} yrs` : null, icon: 'schedule', highlight: false },
    { label: 'Quarterly Ask',    value: fmt(f?.quarterlyFundingAskM, '$', 'M/qtr'), icon: 'payments',  highlight: true  },
  ].filter(k => k.value !== null)

  const details = [
    f?.annualRevenueM != null       ? { label: 'Annual Revenue', value: `$${f.annualRevenueM}M` } : null,
    dscr                            ? { label: 'DSCR',           value: dscr }                   : null,
    capacityStr                     ? { label: 'Capacity',       value: capacityStr }             : null,
    f?.ppaCounterparty              ? { label: 'PPA',            value: f.ppaCounterparty }       : null,
    f?.ppaTariffMwh != null         ? { label: 'Tariff',         value: `$${f.ppaTariffMwh}/MWh/mo` } : null,
    f?.debtPct != null              ? { label: 'Debt / Equity',  value: `${f.debtPct}% / ${f.equityPct ?? (100 - f.debtPct)}%` } : null,
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <Link href={`/projects/${project.id}`} className="block group">
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card group-hover:shadow-card-hover group-hover:-translate-y-px transition-all duration-200 overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-start gap-4 border-b border-outline-variant/20">
          <div className="w-10 h-10 rounded-lg bg-secondary-container/40 flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-secondary text-[20px]">{meta.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-bold text-on-surface text-[15px] leading-snug break-words pr-2">{project.name}</h3>
              {STATUS_LABEL[project.status] && (
                <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shrink-0 ${STATUS_LABEL[project.status]!.cls}`}>
                  {STATUS_LABEL[project.status]!.label}
                </span>
              )}
            </div>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              {meta.label} · {project.location} · {project.jurisdiction}
            </p>
          </div>
        </div>

        {/* KPI strip */}
        {kpis.length > 0 && (
          <div className={`grid gap-0 border-b border-outline-variant/20`} style={{ gridTemplateColumns: `repeat(${kpis.length}, 1fr)` }}>
            {kpis.map(({ label, value, icon, highlight }) => (
              <div key={label} className={`px-4 py-3 ${highlight ? 'bg-secondary/5' : ''} ${kpis.indexOf({ label, value, icon, highlight }) < kpis.length - 1 ? 'border-r border-outline-variant/20' : ''}`}>
                <div className="flex items-center gap-1 mb-0.5">
                  <span className={`material-symbols-outlined text-[12px] ${highlight ? 'text-secondary' : 'text-outline'}`}>{icon}</span>
                  <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">{label}</p>
                </div>
                <p className={`text-[14px] font-bold ${highlight ? 'text-secondary' : 'text-on-surface'}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Detail chips */}
        {details.length > 0 && (
          <div className="px-6 py-3 flex flex-wrap gap-x-4 gap-y-1.5 border-b border-outline-variant/20">
            {details.map(({ label, value }) => (
              <span key={label} className="text-[11px] text-on-surface-variant">
                <span className="font-semibold text-on-surface">{value}</span>
                {' '}{label}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="px-6 py-3 flex items-center justify-between">
          <p className="text-[10px] text-on-surface-variant">
            Listed {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-secondary uppercase tracking-wide">
            View details & submit term sheet
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
