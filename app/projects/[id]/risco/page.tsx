import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getProjectById } from '@/lib/store'
import { RiskProviderPanel } from '@/components/projects/risk-provider-panel'
import type { DocumentRecord, Project, ProjectFinancials, RiskProfile } from '@/types'

export const dynamic = 'force-dynamic'

type GateStatus = 'PASS' | 'REVIEW' | 'FAIL' | 'PENDING'

interface Gate {
  id: string
  label: string
  category: string
  status: GateStatus
  metric: string
  icon: string
}

function deriveGates(project: Project): Gate[] {
  const docs = project.documents ?? []
  const hasDoc = (type: DocumentRecord['type']) => docs.some(d => d.type === type)
  const fin: ProjectFinancials = project.financials ?? {}
  const tel = project.telemetry

  let dscrStatus: GateStatus = 'PENDING'
  let dscrMetric = 'No financial data provided'
  if (fin.annualRevenueM != null && fin.annualOpexM != null && fin.annualDebtServiceM != null && fin.annualDebtServiceM > 0) {
    const dscr = (fin.annualRevenueM - fin.annualOpexM) / fin.annualDebtServiceM
    dscrMetric = `DSCR ${dscr.toFixed(2)}x — Revenue $${fin.annualRevenueM}M / OPEX $${fin.annualOpexM}M / Debt Service $${fin.annualDebtServiceM}M`
    dscrStatus = dscr >= 1.25 ? 'PASS' : dscr >= 1.0 ? 'REVIEW' : 'FAIL'
  } else if (fin.annualRevenueM != null) {
    dscrMetric = `Revenue $${fin.annualRevenueM}M — debt service data incomplete`
    dscrStatus = 'REVIEW'
  }

  const ptoS = project.ptoStatus ?? 'PRE_PROCESSING'
  const regStatus: GateStatus =
    ptoS === 'APPROVED' ? 'PASS' : ptoS === 'PROCESSING' ? 'REVIEW' : ptoS === 'REJECTED' ? 'FAIL' : 'PENDING'
  const regMetric =
    ptoS === 'APPROVED' ? 'Permit to Operate granted' :
    ptoS === 'PROCESSING' ? 'PTO application under regulatory review' :
    ptoS === 'REJECTED' ? 'PTO application rejected' :
    'PTO application not yet submitted'

  return [
    {
      id: 'G1',
      label: 'Physical Asset Gate',
      category: 'CAT1',
      icon: 'factory',
      status: fin.capacityMW != null && fin.capacityMW > 0 ? 'PASS' : 'PENDING',
      metric: fin.capacityMW != null
        ? `${fin.capacityMW}MW${fin.capacityMWh != null ? ` / ${fin.capacityMWh}MWh` : ''} · ${project.assetType.replace(/_/g, ' ')} · ${project.location}`
        : 'Capacity not specified',
    },
    {
      id: 'G2',
      label: 'Revenue Contract Gate',
      category: 'CAT2',
      icon: 'receipt_long',
      status: fin.ppaCounterparty && fin.annualRevenueM != null ? 'PASS' : fin.annualRevenueM != null ? 'REVIEW' : 'PENDING',
      metric: fin.ppaCounterparty
        ? `PPA with ${fin.ppaCounterparty}${fin.ppaTariffMwh != null ? ` @ $${fin.ppaTariffMwh}/MWh/month` : ''} · $${fin.annualRevenueM ?? '—'}M/yr contracted`
        : fin.annualRevenueM != null
          ? `$${fin.annualRevenueM}M annual revenue — PPA counterparty not specified`
          : 'No revenue contract data',
    },
    {
      id: 'G3',
      label: 'Cash Flow / DSCR Gate',
      category: 'CAT3',
      icon: 'waterfall_chart',
      status: dscrStatus,
      metric: dscrMetric,
    },
    {
      id: 'G4',
      label: 'Legal & Title Gate',
      category: 'CAT4',
      icon: 'gavel',
      status: hasDoc('LEGAL_TITLE') ? 'PASS' : hasDoc('PPA_AGREEMENT') ? 'REVIEW' : 'PENDING',
      metric: hasDoc('LEGAL_TITLE')
        ? 'Legal title / deed uploaded and verified'
        : hasDoc('PPA_AGREEMENT')
          ? 'PPA uploaded — legal title pending'
          : 'No legal documents uploaded',
    },
    {
      id: 'G5',
      label: 'Credit Enhancement Gate',
      category: 'CAT5',
      icon: 'verified_user',
      status: hasDoc('INSURANCE_CERTIFICATE') ? 'PASS' : 'PENDING',
      metric: hasDoc('INSURANCE_CERTIFICATE')
        ? `Insurance certificate uploaded${fin.gapFundingEligible ? ` · Gap funding: ${fin.gapFundingProgram ?? 'eligible'}` : ''}`
        : 'Insurance certificate not uploaded',
    },
    {
      id: 'G6',
      label: 'Technology & Telemetry Gate',
      category: 'CAT6',
      icon: 'sensors',
      status: tel?.verified ? 'PASS' : tel ? 'REVIEW' : 'PENDING',
      metric: tel?.verified
        ? `${tel.connectionMethod.replace(/_/g, ' ')} · Verified · ${tel.apiEndpoint}`
        : tel
          ? 'Telemetry configured — verification pending'
          : 'No telemetry connection',
    },
    {
      id: 'G7',
      label: 'Regulatory Gate',
      category: 'CAT7',
      icon: 'account_balance',
      status: regStatus,
      metric: regMetric,
    },
  ]
}

function gateColor(status: GateStatus) {
  if (status === 'PASS')    return { text: 'text-secondary',          bg: 'bg-secondary/10',          icon: 'check_circle' }
  if (status === 'REVIEW')  return { text: 'text-tertiary',           bg: 'bg-tertiary/10',           icon: 'pending' }
  if (status === 'FAIL')    return { text: 'text-error',              bg: 'bg-error/10',              icon: 'cancel' }
  return                           { text: 'text-on-surface-variant', bg: 'bg-outline-variant/20',   icon: 'radio_button_unchecked' }
}

function overallVerdict(gates: Gate[]): GateStatus {
  if (gates.some(g => g.status === 'FAIL'))    return 'FAIL'
  if (gates.some(g => g.status === 'PENDING')) return 'PENDING'
  if (gates.some(g => g.status === 'REVIEW'))  return 'REVIEW'
  return 'PASS'
}

function LqRing({ rp }: { rp: RiskProfile }) {
  const ringColor = rp.gate === 'PASS' ? '#006a65' : rp.gate === 'REVIEW' ? '#7b5800' : '#ba1a1a'
  const circumference = 2 * Math.PI * 48
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
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
        {[
          { label: 'Availability A(t)', value: rp.availability, weight: '40%', color: 'bg-secondary' },
          { label: 'DSCR Score D(t)',   value: rp.dscrScore,    weight: '35%', color: 'bg-primary'   },
          { label: 'Verification V(t)', value: rp.verification, weight: '25%', color: 'bg-tertiary'  },
        ].map(({ label, value, weight, color }) => (
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
        <p className="text-[10px] text-on-surface-variant/60">
          Assessed {new Date(rp.assessedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
      </div>
    </div>
  )
}

export default async function RiscoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProjectById(id)
  if (!project) redirect('/projects')

  const gates = deriveGates(project)
  const verdict = overallVerdict(gates)
  const verdictCfg = gateColor(verdict)
  const rp = project.telemetry?.riskProfile

  const passes = gates.filter(g => g.status === 'PASS').length
  const reviews = gates.filter(g => g.status === 'REVIEW').length
  const fails = gates.filter(g => g.status === 'FAIL').length

  return (
    <div className="py-gutter space-y-8 max-w-4xl">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-caption text-on-surface-variant">
        <Link href="/projects" className="hover:text-on-surface transition-colors">Asset Registry</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link href={`/projects/${id}`} className="hover:text-on-surface transition-colors truncate">{project.name}</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">RISCO</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-display-lg text-on-surface">Risk Score Output</h1>
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide ${verdictCfg.bg} ${verdictCfg.text}`}>
              {verdict}
            </span>
          </div>
          <p className="text-body-base text-on-surface-variant">{project.name} · {project.assetType.replace(/_/g, ' ')} · {project.jurisdiction}</p>
        </div>
        <Link
          href={`/projects/${id}`}
          className="inline-flex items-center gap-2 bg-surface-container border border-outline-variant/60 text-on-surface-variant px-5 py-2.5 rounded-lg text-label-caps font-bold hover:bg-surface-container-high transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Project
        </Link>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Gates Passed',   value: passes,  color: 'text-secondary', bg: 'border-l-secondary' },
          { label: 'Under Review',   value: reviews, color: 'text-tertiary',  bg: 'border-l-tertiary'  },
          { label: 'Failing',        value: fails,   color: 'text-error',     bg: 'border-l-error'     },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`bg-surface-container-lowest rounded-xl border border-outline-variant/60 border-l-4 ${bg} p-5 shadow-card`}>
            <p className="text-label-caps text-on-surface-variant mb-1">{label}</p>
            <p className={`text-data-point font-bold ${color}`}>{value}<span className="text-caption font-normal text-on-surface-variant"> / 7</span></p>
          </div>
        ))}
      </div>

      {/* 7 gates */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[20px]">checklist</span>
          <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Qualification Gates</h2>
        </div>
        <div className="divide-y divide-outline-variant/30">
          {gates.map((gate) => {
            const cfg = gateColor(gate.status)
            return (
              <div key={gate.id} className="flex items-start gap-4 px-6 py-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                  <span className={`material-symbols-outlined text-[16px] ${cfg.text}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {cfg.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-caption font-bold text-on-surface">{gate.label}</p>
                    <span className="text-[9px] font-bold text-on-surface-variant/50 uppercase">{gate.category}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">{gate.metric}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`material-symbols-outlined text-[18px] ${cfg.text}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {cfg.icon}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* LQ Score */}
      {rp ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-[20px]">monitoring</span>
              <h2 className="text-label-caps font-bold text-on-surface tracking-widest">LQ Composite Score</h2>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
              rp.gate === 'PASS' ? 'bg-secondary/10 text-secondary' :
              rp.gate === 'REVIEW' ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'
            }`}>
              {rp.gate}
            </span>
          </div>
          <div className="p-6">
            <LqRing rp={rp} />
          </div>
          <div className="px-6 pb-6">
            <div className="bg-surface-container rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Formula</p>
              <p className="text-caption font-mono text-on-surface">
                LQ = [A(t)×0.40 + D(t)×0.35 + V(t)×0.25] × (1−δ)
              </p>
              <p className="text-[10px] text-on-surface-variant mt-1">
                Gate thresholds: PASS ≥ 0.80 · REVIEW ≥ 0.60 · FAIL &lt; 0.60
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card p-8 text-center">
          <span className="material-symbols-outlined text-[36px] text-outline mb-3 block">monitoring</span>
          <p className="text-caption font-bold text-on-surface mb-1">LQ Score not yet assessed</p>
          <p className="text-[11px] text-on-surface-variant">Complete the Credit Pack step during onboarding to generate an LQ risk score.</p>
          <Link href={`/onboard/credit-pack?id=${id}`} className="inline-flex items-center gap-1.5 mt-4 text-label-caps text-primary hover:underline">
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            Go to Credit Pack
          </Link>
        </div>
      )}

      {/* Financials summary */}
      {project.financials && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-[20px]">payments</span>
            <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Financial Inputs</h2>
          </div>
          <dl className="divide-y divide-outline-variant/30">
            {(
              [
                ['Capacity',          project.financials.capacityMW != null ? `${project.financials.capacityMW}MW${project.financials.capacityMWh != null ? ` / ${project.financials.capacityMWh}MWh` : ''}` : null,  'bolt'],
                ['Total CAPEX',       project.financials.totalCapexM != null ? `$${project.financials.totalCapexM}M` : null,                    'account_balance'],
                ['Annual Revenue',    project.financials.annualRevenueM != null ? `$${project.financials.annualRevenueM}M` : null,              'trending_up'],
                ['Annual OPEX',       project.financials.annualOpexM != null ? `$${project.financials.annualOpexM}M` : null,                    'build'],
                ['Annual Debt Svc',   project.financials.annualDebtServiceM != null ? `$${project.financials.annualDebtServiceM}M` : null,      'credit_card'],
                ['PPA Counterparty',  project.financials.ppaCounterparty ?? null,                                                               'handshake'],
                ['PPA Tariff',        project.financials.ppaTariffMwh != null ? `$${project.financials.ppaTariffMwh}/MWh/month` : null,  'receipt_long'],
                ['Gap Funding',       project.financials.gapFundingEligible ? (project.financials.gapFundingProgram ?? 'Eligible') : null,      'savings'],
              ] as [string, string | null, string][]
            )
              .filter(([, v]) => v !== null)
              .map(([label, value, icon]) => (
                <div key={label} className="flex items-center gap-4 px-6 py-3.5">
                  <span className="material-symbols-outlined text-outline text-[16px] shrink-0">{icon}</span>
                  <dt className="text-caption text-on-surface-variant w-36 shrink-0">{label}</dt>
                  <dd className="text-caption text-on-surface font-medium">{value}</dd>
                </div>
              ))}
          </dl>
        </div>
      )}

      {/* External risk assessment */}
      <RiskProviderPanel
        projectId={id}
        existingRequest={project.telemetry?.externalRiskRequest}
        hasInternalScore={!!rp}
      />

      {/* Generated at */}
      <p className="text-[10px] text-on-surface-variant/50 text-center">
        Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · LIUM Risk Assessment Engine v1.0
      </p>
    </div>
  )
}
