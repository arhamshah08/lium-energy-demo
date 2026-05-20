import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getProjectById } from '@/lib/store'
import { StatusBadge } from '@/components/ui/badge'
import { VerifyButton } from '@/components/projects/verify-button'
import { PtoUpdater } from '@/components/projects/pto-updater'
import { PublishActions } from '@/components/projects/publish-actions'
import { OfferInbox } from '@/components/projects/offer-inbox'
import { FinancierActions } from '@/components/projects/financier-actions'
import { SAActions } from '@/components/projects/sa-actions'
import { PMActions } from '@/components/projects/pm-actions'
import type { AssetType, DocumentRecord, ProjectFinancials, ProjectStatus, PtoStatus, RiskProfile } from '@/types'

export const dynamic = 'force-dynamic'

function RiskProfileCard({ rp }: { rp: RiskProfile }) {
  const ringColor = rp.gate === 'PASS' ? '#006a65' : rp.gate === 'REVIEW' ? '#7b5800' : '#ba1a1a'
  const gateColor = rp.gate === 'PASS' ? 'text-secondary' : rp.gate === 'REVIEW' ? 'text-tertiary' : 'text-error'
  const gateBg    = rp.gate === 'PASS' ? 'bg-secondary/10' : rp.gate === 'REVIEW' ? 'bg-tertiary/10' : 'bg-error/10'
  const components = [
    { label: 'Availability A(t)', value: rp.availability, weight: '40%', color: 'bg-secondary' },
    { label: 'DSCR Score D(t)',   value: rp.dscrScore,    weight: '35%', color: 'bg-primary'   },
    { label: 'Verification V(t)', value: rp.verification, weight: '25%', color: 'bg-tertiary'  },
  ]
  const circumference = 2 * Math.PI * 48
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[20px]">monitoring</span>
          <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Risk Profile · LQ Score</h2>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${gateBg} ${gateColor}`}>
          {rp.gate}
        </span>
      </div>
      <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative flex items-center justify-center shrink-0">
          <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
            <circle cx="60" cy="60" r="48" fill="none" stroke="#e7eeff" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="48"
              fill="none"
              stroke={ringColor}
              strokeWidth="10"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${circumference * (1 - rp.lqComposite)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-[24px] font-bold text-on-surface leading-none">{rp.lqComposite.toFixed(3)}</p>
            <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wide mt-0.5">LQ Score</p>
          </div>
        </div>
        <div className="flex-1 space-y-3 w-full">
          {components.map(({ label, value, weight, color }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] text-on-surface-variant">{label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-on-surface-variant/60">{weight}</span>
                  <span className="text-caption font-bold text-on-surface">{value.toFixed(3)}</span>
                </div>
              </div>
              <div className="h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${value * 100}%` }} />
              </div>
            </div>
          ))}
          {rp.penalty > 0 && (
            <p className="text-[10px] text-error">Penalty δ={rp.penalty.toFixed(3)} applied</p>
          )}
          <p className="text-[10px] text-on-surface-variant/60 pt-1">
            Assessed {new Date(rp.assessedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  )
}

function PtoStatusCard({ projectId, ptoStatus }: { projectId: string; ptoStatus: PtoStatus }) {
  const badgeConfig: Record<PtoStatus, { label: string; color: string; bg: string }> = {
    PRE_PROCESSING: { label: 'Pre-Processing', color: 'text-on-surface-variant', bg: 'bg-outline-variant/30' },
    PROCESSING:     { label: 'Processing',     color: 'text-primary',            bg: 'bg-primary/10'         },
    APPROVED:       { label: 'Approved',        color: 'text-secondary',          bg: 'bg-secondary/10'       },
    REJECTED:       { label: 'Rejected',        color: 'text-error',              bg: 'bg-error/10'           },
  }
  const descriptionMap: Record<PtoStatus, string> = {
    PRE_PROCESSING: 'Application not yet submitted',
    PROCESSING:     'Under regulatory review',
    APPROVED:       'Permit granted — securitisation unlocked',
    REJECTED:       'Permit denied',
  }
  const { label, color, bg } = badgeConfig[ptoStatus]
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center gap-3">
        <span className="material-symbols-outlined text-secondary text-[20px]">verified_user</span>
        <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Permit to Operate (PTO)</h2>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide ${bg} ${color}`}>
            {label}
          </span>
        </div>
        <p className="text-caption text-on-surface-variant">{descriptionMap[ptoStatus]}</p>
        <PtoUpdater projectId={projectId} currentStatus={ptoStatus} />
      </div>
    </div>
  )
}

function FinancialsSummaryCard({ financials }: { financials: ProjectFinancials }) {
  const hasAny = Object.values(financials).some((v) => v !== undefined && v !== null)
  if (!hasAny) return null

  const capacityParts: string[] = []
  if (financials.capacityMW !== undefined) capacityParts.push(`${financials.capacityMW}MW`)
  if (financials.capacityMWh !== undefined) capacityParts.push(`${financials.capacityMWh}MWh`)
  const capacityStr = capacityParts.length > 0 ? capacityParts.join(' / ') : null

  let dscrStr: string | null = null
  if (
    financials.annualRevenueM !== undefined &&
    financials.annualOpexM !== undefined &&
    financials.annualDebtServiceM !== undefined &&
    financials.annualDebtServiceM !== 0
  ) {
    const dscr = (financials.annualRevenueM - financials.annualOpexM) / financials.annualDebtServiceM
    dscrStr = `${dscr.toFixed(2)}x`
  }

  const hasHardware = financials.assetMake || financials.assetModel || financials.assetUnitCount !== undefined
  const hasCapacityTimeline = capacityStr || financials.codDate || financials.assetLifeYears !== undefined
  const hasRevenueContract = financials.ppaCounterparty || financials.ppaTariffMwh !== undefined || financials.ppaContractEndDate
  const hasFundingSchedule = (financials.fundingSchedule?.length ?? 0) > 0
  const hasCapitalStructure = financials.totalCapexM !== undefined || financials.debtPct !== undefined || financials.equityPct !== undefined || financials.quarterlyFundingAskM !== undefined || hasFundingSchedule
  const hasCashFlow = financials.annualRevenueM !== undefined || financials.annualOpexM !== undefined || financials.annualDebtServiceM !== undefined
  const hasGapFunding = financials.gapFundingEligible === true

  if (!hasHardware && !hasCapacityTimeline && !hasRevenueContract && !hasCapitalStructure && !hasCashFlow && !hasGapFunding) return null

  const Row = ({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: boolean }) => (
    <div className="flex items-center gap-4 px-6 py-3.5">
      <span className="material-symbols-outlined text-outline text-[16px] shrink-0">{icon}</span>
      <dt className="text-caption text-on-surface-variant w-36 shrink-0">{label}</dt>
      <dd className={`text-caption font-medium ${highlight ? 'text-secondary font-bold' : 'text-on-surface'}`}>{value}</dd>
    </div>
  )

  const SectionHeader = ({ title }: { title: string }) => (
    <p className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-widest px-6 pt-4 pb-1">{title}</p>
  )

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card">
      <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center gap-3">
        <span className="material-symbols-outlined text-secondary text-[20px]">payments</span>
        <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Financials</h2>
      </div>
      <dl className="divide-y divide-outline-variant/30">
        {hasHardware && (
          <>
            <SectionHeader title="Asset Hardware" />
            {financials.assetMake && <Row icon="factory" label="Manufacturer" value={financials.assetMake} />}
            {financials.assetModel && <Row icon="deployed_code" label="Model" value={financials.assetModel} />}
            {financials.assetUnitCount !== undefined && (
              <Row icon="stacks" label="No. of Units" value={String(financials.assetUnitCount)} />
            )}
          </>
        )}
        {hasCapacityTimeline && (
          <>
            <SectionHeader title="Capacity & Timeline" />
            {capacityStr && <Row icon="bolt" label="Capacity" value={capacityStr} />}
            {financials.codDate && (
              <Row icon="event_available" label="COD" value={new Date(financials.codDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} />
            )}
            {financials.assetLifeYears !== undefined && (
              <Row icon="hourglass_bottom" label="Asset Life" value={`${financials.assetLifeYears} years`} />
            )}
          </>
        )}
        {hasRevenueContract && (
          <>
            <SectionHeader title="Revenue Contract" />
            {financials.ppaCounterparty && <Row icon="handshake" label="PPA Counterparty" value={financials.ppaCounterparty} />}
            {financials.ppaTariffMwh !== undefined && (
              <Row icon="attach_money" label="PPA Tariff" value={`$${financials.ppaTariffMwh}/MWh/month`} />
            )}
            {financials.ppaContractEndDate && (
              <Row icon="calendar_month" label="PPA Contract End" value={new Date(financials.ppaContractEndDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} />
            )}
          </>
        )}
        {hasCapitalStructure && (
          <>
            <SectionHeader title="Capital Structure" />
            {financials.totalCapexM !== undefined && (
              <Row icon="account_balance" label="Total CAPEX" value={`$${financials.totalCapexM}M`} />
            )}
            {financials.debtPct !== undefined && (
              <Row icon="percent" label="Debt" value={`${financials.debtPct}%`} />
            )}
            {financials.equityPct !== undefined && (
              <Row icon="percent" label="Equity" value={`${financials.equityPct}%`} />
            )}
            {financials.quarterlyFundingAskM !== undefined && (
              <Row icon="request_quote" label="Avg Quarterly Ask" value={`$${financials.quarterlyFundingAskM}M/quarter`} highlight />
            )}
            {hasFundingSchedule && (
              <div className="px-6 py-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-outline text-[16px] shrink-0">calendar_month</span>
                  <p className="text-caption text-on-surface-variant w-36 shrink-0">Drawdown Schedule</p>
                </div>
                <div className="ml-9 space-y-1">
                  {financials.fundingSchedule!.map(({ quarter, amountM }) => (
                    <div key={quarter} className="flex items-center justify-between">
                      <span className="text-[11px] text-on-surface-variant">{quarter}</span>
                      <span className="text-[11px] font-semibold text-secondary">${amountM}M</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-1 border-t border-outline-variant/30 mt-1">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">Total</span>
                    <span className="text-[11px] font-bold text-on-surface">
                      ${financials.fundingSchedule!.reduce((s, r) => s + r.amountM, 0).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {hasCashFlow && (
          <>
            <SectionHeader title="Cash Flow" />
            {financials.annualRevenueM !== undefined && (
              <Row icon="trending_up" label="Annual Revenue" value={`$${financials.annualRevenueM}M`} />
            )}
            {financials.annualOpexM !== undefined && (
              <Row icon="receipt_long" label="Annual OPEX" value={`$${financials.annualOpexM}M`} />
            )}
            {financials.annualDebtServiceM !== undefined && (
              <Row icon="payments" label="Annual Debt Service" value={`$${financials.annualDebtServiceM}M`} />
            )}
            {dscrStr && (
              <Row icon="analytics" label="DSCR" value={dscrStr} />
            )}
          </>
        )}
        {hasGapFunding && (
          <>
            <SectionHeader title="Gap Funding" />
            <div className="flex items-center gap-4 px-6 py-3.5">
              <span className="material-symbols-outlined text-outline text-[16px] shrink-0">volunteer_activism</span>
              <dt className="text-caption text-on-surface-variant w-36 shrink-0">Eligible</dt>
              <dd className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-secondary/10 text-secondary">Eligible</span>
                {financials.gapFundingProgram && (
                  <span className="text-caption text-on-surface font-medium">{financials.gapFundingProgram}</span>
                )}
              </dd>
            </div>
          </>
        )}
      </dl>
    </div>
  )
}

const ASSET_META: Record<AssetType, { label: string; icon: string }> = {
  BESS:              { label: 'Battery Energy Storage System', icon: 'battery_charging_full' },
  MICROGRID:         { label: 'Microgrid',                     icon: 'grid_view' },
  DER_CLUSTER:       { label: 'DER Cluster',                   icon: 'hub' },
  SOLAR_PV:          { label: 'Solar PV',                      icon: 'solar_power' },
  WIND:              { label: 'Wind',                          icon: 'air' },
  SOLAR_BESS_HYBRID: { label: 'Solar+BESS Hybrid',             icon: 'energy_program_saving' },
}

const DOC_LABELS: Record<DocumentRecord['type'], string> = {
  TECHNICAL_AUDIT:        'Technical Audit Report',
  PPA_AGREEMENT:          'PPA Agreement',
  INTERCONNECTION_STUDY:  'Interconnection Study',
  INSURANCE_CERTIFICATE:  'Insurance Certificate',
  BESPA_AGREEMENT:        'BESPA Agreement',
  LEGAL_TITLE:            'Legal Title / Lease Deed',
}

function nextOnboardHref(status: ProjectStatus, id: string): string | null {
  if (status === 'DRAFT')             return `/onboard/document-vault?id=${id}`
  if (status === 'DOCUMENTS_PENDING') return `/onboard/telemetry?id=${id}`
  if (status === 'TELEMETRY_PENDING') return `/onboard/telemetry?id=${id}`
  return null
}

function nextOnboardLabel(status: ProjectStatus): string {
  if (status === 'DRAFT')             return 'Upload Documents'
  if (status === 'DOCUMENTS_PENDING') return 'Connect Telemetry'
  return 'Verify Telemetry'
}

const OFFER_INBOX_STATUSES: ProjectStatus[] = [
  'PUBLISHED_FOR_FINANCE',
  'OFFER_RECEIVED',
  'FINANCING_ACCEPTED',
]

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ new?: string }>
}) {
  const { id } = await params
  const { new: isNew } = await searchParams
  const project = await getProjectById(id)

  if (!project) redirect('/projects')

  const { label: assetLabel, icon: assetIcon } = ASSET_META[project.assetType]
  const continueHref = nextOnboardHref(project.status, id)
  const isSubmitted = project.status === 'SUBMITTED'
  const showOfferInbox = OFFER_INBOX_STATUSES.includes(project.status)
  const ptoStatus: PtoStatus = project.ptoStatus ?? 'PRE_PROCESSING'

  return (
    <div className="py-gutter space-y-8 max-w-5xl">

      <nav className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-caption text-on-surface-variant">
          <Link href="/projects" className="hover:text-on-surface transition-colors">Asset Registry</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-medium truncate">{project.name}</span>
        </div>
        <Link
          href={`/projects/${id}/risco`}
          className="inline-flex items-center gap-1.5 text-label-caps text-secondary border border-secondary/30 bg-secondary/5 px-3 py-1.5 rounded-lg hover:bg-secondary/10 transition-all text-[10px] font-bold uppercase tracking-wide shrink-0"
        >
          <span className="material-symbols-outlined text-[14px]">monitoring</span>
          View RISCO
        </Link>
      </nav>

      {isNew && (
        <div className="flex items-start gap-4 p-5 bg-secondary-container/30 border border-secondary/20 rounded-xl">
          <span
            className="material-symbols-outlined text-secondary text-[28px] shrink-0 mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <div className="flex-1">
            <p className="font-bold text-on-surface mb-0.5">Asset successfully onboarded</p>
            <p className="text-caption text-on-surface-variant">
              Your project is now live on the LIUM network. Telemetry data will be ingested within the next few minutes.
            </p>
          </div>
          <Link
            href="/projects"
            className="text-label-caps text-secondary hover:underline shrink-0 mt-0.5"
          >
            View all
          </Link>
        </div>
      )}

      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-xl bg-secondary-container/40 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[32px] text-secondary">{assetIcon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-headline-md text-on-surface font-bold">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-body-base text-on-surface-variant">{assetLabel} · {project.jurisdiction}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
          {project.status === 'TELEMETRY_PENDING' ? (
            <VerifyButton projectId={id} />
          ) : continueHref ? (
            <Link
              href={continueHref}
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm"
            >
              {nextOnboardLabel(project.status)}
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          ) : null}
          <PublishActions projectId={id} status={project.status} ptoStatus={ptoStatus} />
          <FinancierActions projectId={id} projectStatus={project.status} />
          <SAActions projectId={id} projectStatus={project.status} />
          <PMActions projectId={id} projectStatus={project.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="space-y-6">

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card">
            <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-[20px]">info</span>
              <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Project Overview</h2>
            </div>
            <dl className="divide-y divide-outline-variant/30">
              {[
                { label: 'Asset Type',    value: assetLabel,              icon: assetIcon         },
                { label: 'Jurisdiction',  value: project.jurisdiction,    icon: 'lan'             },
                { label: 'Location',      value: project.location || '—', icon: 'location_on'     },
                {
                  label: 'Created',
                  value: new Date(project.createdAt).toLocaleDateString('en-US', {
                    weekday: 'short', year: 'numeric', month: 'long', day: 'numeric',
                  }),
                  icon: 'calendar_today',
                },
                {
                  label: 'Last Updated',
                  value: new Date(project.updatedAt).toLocaleDateString('en-US', {
                    weekday: 'short', year: 'numeric', month: 'long', day: 'numeric',
                  }),
                  icon: 'update',
                },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-center gap-4 px-6 py-3.5">
                  <span className="material-symbols-outlined text-outline text-[16px] shrink-0">{icon}</span>
                  <dt className="text-caption text-on-surface-variant w-32 shrink-0">{label}</dt>
                  <dd className="text-caption text-on-surface font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {project.financials && (
            <FinancialsSummaryCard financials={project.financials} />
          )}

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card">
            <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-[20px]">sensors</span>
              <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Telemetry</h2>
            </div>
            {project.telemetry ? (
              <div className="p-6 space-y-4">
                <dl className="space-y-3">
                  {[
                    { label: 'Method',   value: project.telemetry.connectionMethod.replace(/_/g, ' ') },
                    { label: 'Endpoint', value: project.telemetry.apiEndpoint },
                    { label: 'Asset ID', value: project.telemetry.assetIdMapping || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <dt className="text-caption text-on-surface-variant w-20 shrink-0 pt-0.5">{label}</dt>
                      <dd className="text-caption text-on-surface font-medium break-all">{value}</dd>
                    </div>
                  ))}
                </dl>
                {project.telemetry.verified && (
                  <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/30">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-60" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
                    </span>
                    <span className="text-label-caps text-secondary font-bold">Live · Connected</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 flex flex-col items-center text-center py-10">
                <span className="material-symbols-outlined text-[32px] text-outline mb-3">construction</span>
                <p className="text-caption font-semibold text-on-surface mb-1">Pre-commissioning</p>
                <p className="text-caption text-on-surface-variant">Telemetry will be available after the project reaches commercial operation date (COD).</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card">
            <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">shield_lock</span>
                <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Documents</h2>
              </div>
              <span className="text-caption text-on-surface-variant">
                {project.documents.length} uploaded
              </span>
            </div>
            {project.documents.length > 0 ? (
              <ul className="divide-y divide-outline-variant/30">
                {project.documents.map((doc, i) => (
                  <li key={i} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-9 h-9 rounded-lg bg-primary-fixed/50 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-white-fixed-variant">description</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-caption font-bold text-on-surface truncate">
                        {DOC_LABELS[doc.type] ?? doc.type}
                      </p>
                      <p className="text-[11px] text-on-surface-variant truncate">{doc.filename}</p>
                    </div>
                    <span
                      className="material-symbols-outlined text-secondary text-[18px] shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 flex flex-col items-center text-center py-10">
                <span className="material-symbols-outlined text-[32px] text-outline mb-3">upload_file</span>
                <p className="text-caption text-on-surface-variant mb-4">No documents uploaded yet</p>
                {project.status === 'DRAFT' && (
                  <Link
                    href={`/onboard/document-vault?id=${id}`}
                    className="text-label-caps text-primary hover:underline"
                  >
                    Upload documents →
                  </Link>
                )}
              </div>
            )}
          </div>

          {project.telemetry?.riskProfile && (
            <RiskProfileCard rp={project.telemetry.riskProfile} />
          )}

          <PtoStatusCard projectId={id} ptoStatus={ptoStatus} />

          {isSubmitted && (
            <div className="bg-secondary-container/20 rounded-xl border border-secondary/20 p-6 flex flex-col items-center text-center">
              <span
                className="material-symbols-outlined text-secondary text-[48px] mb-3"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              <p className="font-bold text-on-surface mb-1">Live on LIUM Network</p>
              <p className="text-caption text-on-surface-variant">
                This asset is fully onboarded and active. Telemetry data is being ingested in real time.
              </p>
            </div>
          )}

          {!isSubmitted && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card">
              <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">linear_scale</span>
                <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Onboarding Progress</h2>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { step: 1, label: 'Project Details', done: true },
                  { step: 2, label: 'Document Vault',  done: project.status !== 'DRAFT' },
                  { step: 3, label: 'Telemetry Link',  done: project.status === 'SUBMITTED' },
                ].map(({ step, label, done }) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      done ? 'bg-secondary text-white' : 'bg-outline-variant/40 text-on-surface-variant'
                    }`}>
                      {done
                        ? <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                        : <span className="text-[11px] font-bold">{step}</span>
                      }
                    </div>
                    <span className={`text-caption font-medium ${done ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              {project.status === 'TELEMETRY_PENDING' ? (
                <div className="px-6 pb-6">
                  <div className="flex w-full items-center justify-center">
                    <VerifyButton projectId={id} />
                  </div>
                </div>
              ) : continueHref ? (
                <div className="px-6 pb-6">
                  <Link
                    href={continueHref}
                    className="flex w-full items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all"
                  >
                    Continue: {nextOnboardLabel(project.status)}
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {showOfferInbox && (
        <OfferInbox projectId={id} projectStatus={project.status} />
      )}
    </div>
  )
}
