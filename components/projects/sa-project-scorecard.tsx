'use client'

import Link from 'next/link'
import type { Project, AssetType, ProjectStatus } from '@/types'

const DEAL_STAGE: Partial<Record<ProjectStatus, { label: string; cls: string; pulse?: boolean }>> = {
  PUBLISHED_FOR_FINANCE: { label: 'Seeking Finance',     cls: 'bg-primary/10 text-primary' },
  OFFER_RECEIVED:        { label: 'Offer in Review',     cls: 'bg-tertiary/10 text-tertiary' },
  FINANCING_ACCEPTED:    { label: 'Financed',            cls: 'bg-secondary/10 text-secondary' },
  PUBLISHED_FOR_SA:      { label: 'Ready to Securitise', cls: 'bg-secondary/10 text-secondary', pulse: true },
  TRANSACTING:           { label: 'Securitising',        cls: 'bg-primary/10 text-primary' },
  TOKENISED:             { label: 'Tokenised',           cls: 'bg-tertiary/10 text-tertiary' },
}

const ASSET_META: Record<AssetType, { label: string; icon: string }> = {
  BESS:              { label: 'Battery Storage',   icon: 'battery_charging_full' },
  MICROGRID:         { label: 'Microgrid',         icon: 'grid_view' },
  DER_CLUSTER:       { label: 'DER Cluster',       icon: 'hub' },
  SOLAR_PV:          { label: 'Solar PV',          icon: 'solar_power' },
  WIND:              { label: 'Wind',              icon: 'air' },
  SOLAR_BESS_HYBRID: { label: 'Solar+BESS Hybrid', icon: 'energy_program_saving' },
}

function fmtDate(d: string | undefined) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function SAProjectScorecard({ project }: { project: Project }) {
  const meta = ASSET_META[project.assetType] ?? { label: project.assetType, icon: 'energy_program_saving' }
  const f = project.financials
  const isOperational = project.telemetry?.verified === true
  const dealStage = DEAL_STAGE[project.status]
  const isActionable = project.status === 'PUBLISHED_FOR_SA'

  const dscr = (f?.annualRevenueM != null && f?.annualOpexM != null && f?.annualDebtServiceM)
    ? ((f.annualRevenueM - f.annualOpexM) / f.annualDebtServiceM).toFixed(2) + 'x'
    : null

  const capacityStr = [
    f?.capacityMW != null ? `${f.capacityMW}MW` : null,
    f?.capacityMWh != null ? `${f.capacityMWh}MWh` : null,
  ].filter(Boolean).join(' / ') || null

  const chips = [
    f?.totalCapexM != null ? { val: `$${f.totalCapexM}M`, lbl: 'CAPEX' } : null,
    capacityStr            ? { val: capacityStr,           lbl: 'Capacity' } : null,
    f?.codDate             ? { val: fmtDate(f.codDate)!,   lbl: 'COD' } : null,
    dscr                   ? { val: dscr,                  lbl: 'DSCR' } : null,
  ].filter(Boolean) as { val: string; lbl: string }[]

  return (
    <Link href={`/projects/${project.id}`} className="block group">
      <div className={`bg-surface-container-lowest rounded-xl border ${isActionable ? 'border-secondary/40' : 'border-outline-variant/60'} shadow-card group-hover:shadow-card-hover group-hover:-translate-y-px transition-all duration-200 overflow-hidden`}>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-start gap-4 border-b border-outline-variant/20">
          <div className="w-10 h-10 rounded-lg bg-secondary-container/40 flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-secondary text-[20px]">{meta.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-on-surface text-[15px] leading-snug break-words">{project.name}</h3>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              {meta.label} · {project.location} · {project.jurisdiction}
            </p>
          </div>
        </div>

        {/* Two tags */}
        <div className="px-6 py-3 flex items-center gap-2 flex-wrap border-b border-outline-variant/20">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${isOperational ? 'bg-secondary/10 text-secondary' : 'bg-outline-variant/30 text-on-surface-variant'}`}>
            <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: isOperational ? "'FILL' 1" : "'FILL' 0" }}>
              {isOperational ? 'check_circle' : 'construction'}
            </span>
            {isOperational ? 'Operational' : 'Pre-commissioning'}
          </span>

          {dealStage && (
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${dealStage.cls}`}>
              {dealStage.pulse && <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse shrink-0" />}
              {dealStage.label}
            </span>
          )}
        </div>

        {/* Key financial chips */}
        {chips.length > 0 && (
          <div className="px-6 py-3 flex flex-wrap gap-x-5 gap-y-1.5 border-b border-outline-variant/20">
            {chips.map(({ val, lbl }) => (
              <span key={lbl} className="text-[11px] text-on-surface-variant">
                <span className="font-semibold text-on-surface">{val}</span> {lbl}
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
            {isActionable ? 'Review & submit' : 'View details'}
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
