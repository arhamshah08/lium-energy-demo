import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getToken } from '@/lib/token-store'
import { TokenOpsPanel } from '@/components/tokenise/token-ops-panel'
import type { Token, VGFMilestone, DSCRYear } from '@/types'

export const dynamic = 'force-dynamic'

function statusColor(s: Token['status']) {
  return { ACTIVE: 'bg-secondary/10 text-secondary', LOCKED: 'bg-primary/10 text-primary', PLEDGED: 'bg-tertiary/10 text-tertiary', REDEEMED: 'bg-outline/10 text-outline', BURNED: 'bg-error/10 text-error' }[s] ?? ''
}

function opBadgeColor(op: string) {
  return { ISSUE: 'bg-secondary/10 text-secondary', LOCK: 'bg-primary/10 text-primary', UNLOCK: 'bg-secondary/10 text-secondary', PLEDGE: 'bg-tertiary/10 text-tertiary', REDEEM: 'bg-outline/10 text-outline', BURN: 'bg-error/10 text-error', TRANSFER: 'bg-primary/10 text-primary', SPLIT: 'bg-surface-container text-on-surface', MERGE: 'bg-surface-container text-on-surface' }[op] ?? 'bg-surface-container text-on-surface'
}

function VGFCard({ milestone }: { milestone: VGFMilestone }) {
  const colors = {
    RELEASED: { bar: 'bg-secondary', badge: 'bg-secondary/10 text-secondary', icon: 'check_circle' },
    LOCKED:   { bar: 'bg-primary',   badge: 'bg-primary/10 text-primary',     icon: 'lock' },
    PENDING:  { bar: 'bg-outline/30',badge: 'bg-outline/10 text-outline',      icon: 'pending' },
  }[milestone.status]

  return (
    <div className="bg-surface-container-low rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-label-caps font-bold text-on-surface">{milestone.label}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>{milestone.status}</span>
      </div>
      <p className="text-caption font-medium text-on-surface">{milestone.description}</p>
      <p className="text-[11px] text-on-surface-variant">{milestone.condition}</p>
      <div className="flex items-center justify-between pt-1">
        <span className="text-caption font-bold text-on-surface">₹{milestone.amountINR} Mn</span>
        {milestone.releasedAt && (
          <span className="text-[10px] text-on-surface-variant">
            {new Date(milestone.releasedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
      </div>
      <div className="h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
        <div className={`h-full ${colors.bar} rounded-full`} style={{ width: milestone.status === 'RELEASED' ? '100%' : milestone.status === 'LOCKED' ? '45%' : '0%' }} />
      </div>
    </div>
  )
}

function DSCRMiniChart({ projection }: { projection: DSCRYear[] }) {
  const max = 1.5
  return (
    <div className="flex items-end gap-1 h-20">
      {projection.map(({ year, dscr }) => {
        const pct = Math.min((dscr / max) * 100, 100)
        const ok = dscr >= 1.0
        return (
          <div key={year} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full relative" style={{ height: `${pct}%` }}>
              <div className={`absolute bottom-0 w-full rounded-t-sm ${ok ? 'bg-secondary/60' : 'bg-error/50'}`} style={{ height: '100%' }} />
            </div>
            <p className="text-[9px] text-on-surface-variant leading-none">Y{year}</p>
          </div>
        )
      })}
    </div>
  )
}

export default async function TokenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const token = await getToken(id)
  if (!token) redirect('/tokenise')

  const vgfReleased = token.vgfMilestones.filter(v => v.status === 'RELEASED').reduce((s, v) => s + v.amountINR, 0)
  const vgfTotal    = token.vgfMilestones.reduce((s, v) => s + v.amountINR, 0)

  return (
    <div className="py-gutter space-y-8 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-caption text-on-surface-variant">
        <Link href="/tokenise" className="hover:text-on-surface transition-colors">Token Registry</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium font-mono">{token.tokenId}</span>
      </nav>

      {/* Hero */}
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>token</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-headline-md text-on-surface font-bold font-mono">{token.tokenId}</h1>
            <span className={`text-label-caps px-2.5 py-1 rounded-full font-bold ${statusColor(token.status)}`}>{token.status}</span>
          </div>
          <p className="text-body-base text-on-surface-variant">
            Issued to {token.issuedTo} · {new Date(token.issuedAt).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link
          href="/securities"
          className="inline-flex items-center gap-2 bg-surface-container border border-outline-variant text-on-surface px-5 py-2.5 rounded-lg text-label-caps font-bold hover:bg-surface-container-high transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">hub</span>
          Securities Pool
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Col 1+2: Main dashboard ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* LQ Score card */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-secondary text-[20px]">monitoring</span>
              <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Liveliness Quotient (LQ)</h2>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                </span>
                <span className="text-label-caps text-secondary">LIVE · IEEE 2030.5</span>
              </div>
            </div>
            <div className="flex items-center gap-8">
              {/* Ring */}
              <div className="relative shrink-0">
                <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#e7eeff" strokeWidth="12" />
                  <circle cx="60" cy="60" r="48" fill="none"
                    stroke={token.lqScore.composite >= 0.80 ? '#006a65' : '#ba1a1a'}
                    strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 48}`}
                    strokeDashoffset={`${2 * Math.PI * 48 * (1 - token.lqScore.composite)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-on-surface">{token.lqScore.composite.toFixed(3)}</p>
                  <p className={`text-[10px] font-bold ${token.lqScore.gate === 'PASS' ? 'text-secondary' : 'text-error'}`}>{token.lqScore.gate}</p>
                </div>
              </div>
              {/* Components */}
              <div className="flex-1 space-y-3">
                {[
                  { label: 'Availability A(t)',  value: token.lqScore.availability,  w: 0.40 },
                  { label: 'DSCR Score D(t)',    value: token.lqScore.dscr,          w: 0.35 },
                  { label: 'Verification V(t)', value: token.lqScore.verification,  w: 0.25 },
                ].map(({ label, value, w }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-on-surface-variant">{label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-caption font-bold text-on-surface">{value.toFixed(3)}</span>
                        <span className="text-[10px] text-on-surface-variant">×{w}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: `${value * 100}%` }} />
                    </div>
                  </div>
                ))}
                <p className="text-[11px] text-on-surface-variant pt-1">
                  Gate threshold: 0.80 · Consecutive months: {token.lqScore.consecutiveMonths} / 3 required
                </p>
              </div>
            </div>
          </div>

          {/* DSCR chart */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-secondary text-[20px]">waterfall_chart</span>
              <h2 className="text-label-caps font-bold text-on-surface tracking-widest">DSCR Projection</h2>
              <div className="ml-auto flex gap-4">
                <div className="text-right">
                  <p className="text-caption font-bold text-on-surface">1.04x</p>
                  <p className="text-[10px] text-on-surface-variant">Avg DSCR</p>
                </div>
                <div className="text-right">
                  <p className="text-caption font-bold text-error">0.91x</p>
                  <p className="text-[10px] text-on-surface-variant">Min (Y10)</p>
                </div>
              </div>
            </div>
            <DSCRMiniChart projection={token.dscrProjection} />
          </div>

          {/* Token Operations Panel */}
          <TokenOpsPanel tokenId={token.id} currentStatus={token.status} />

          {/* Operation history */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">history</span>
                <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Operation Ledger</h2>
              </div>
              <span className="text-caption text-on-surface-variant">{token.operations.length} transactions</span>
            </div>
            <div className="divide-y divide-outline-variant/20">
              {token.operations.map(op => (
                <div key={op.id} className="flex items-start gap-4 px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${opBadgeColor(op.operation)} shrink-0 mt-0.5`}>{op.operation}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-medium text-on-surface">{op.notes ?? '—'}</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 font-mono break-all">{op.txHash}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {op.amount && <p className="text-caption font-bold text-on-surface">₹{op.amount} Mn</p>}
                    <p className="text-[11px] text-on-surface-variant">
                      {new Date(op.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <span className={`text-[10px] font-bold ${op.status === 'CONFIRMED' ? 'text-secondary' : op.status === 'PENDING' ? 'text-tertiary' : 'text-error'}`}>
                      {op.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Col 3: VGF + Financials ── */}
        <div className="space-y-6">

          {/* Financials */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary text-[20px]">payments</span>
              <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Financials</h2>
            </div>
            <dl className="space-y-3">
              {[
                { label: 'Total CAPEX',      value: `₹${token.totalCapexINR.toLocaleString()} Mn` },
                { label: 'Pool Debt',        value: `₹${token.debtINR.toLocaleString()} Mn` },
                { label: 'Equity',           value: `₹${token.equityINR.toLocaleString()} Mn` },
                { label: 'Annual Revenue',   value: `₹${token.annualRevenueINR.toFixed(2)} Mn` },
                { label: 'Annual Opex',      value: `₹${token.annualOpexINR.toFixed(0)} Mn` },
                { label: 'Debt Service/yr',  value: `₹${token.annualDebtServiceINR.toFixed(0)} Mn` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-caption text-on-surface-variant">{label}</dt>
                  <dd className="text-caption font-bold text-on-surface">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* VGF Milestones */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-outline-variant/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">military_tech</span>
                <h2 className="text-label-caps font-bold text-on-surface tracking-widest">VGF Milestones</h2>
              </div>
              <div className="text-right">
                <p className="text-caption font-bold text-on-surface">₹{vgfReleased}/{vgfTotal} Mn</p>
                <p className="text-[10px] text-on-surface-variant">released</p>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {token.vgfMilestones.map(m => <VGFCard key={m.id} milestone={m} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
