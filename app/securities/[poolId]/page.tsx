import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPool } from '@/lib/token-store'
import { SubscribePanel } from '@/components/securities/subscribe-panel'
import type { Pool, Tranche, QualificationGate } from '@/types'

export const dynamic = 'force-dynamic'

const TRANCHE_COLORS: Record<string, { bg: string; text: string; light: string }> = {
  SENIOR:    { bg: 'bg-secondary',   text: 'text-secondary',   light: 'bg-secondary-container/30' },
  MEZZANINE: { bg: 'bg-primary',     text: 'text-primary',     light: 'bg-primary/5' },
  JUNIOR:    { bg: 'bg-tertiary',    text: 'text-tertiary',    light: 'bg-tertiary/5' },
  EQUITY:    { bg: 'bg-outline',     text: 'text-outline',     light: 'bg-outline/5' },
}

const TRANCHE_INVESTOR: Record<string, string> = {
  SENIOR:    'Pension funds · Insurance mandates · DFIs',
  MEZZANINE: 'Credit funds · Development finance · Sovereign wealth',
  JUNIOR:    'Alternative asset managers · High-yield credit',
  EQUITY:    'Sponsor equity · Impact investors',
}

function TrancheCard({ tranche, poolId }: { tranche: Tranche; poolId: string }) {
  const colors = TRANCHE_COLORS[tranche.class] ?? TRANCHE_COLORS.EQUITY
  const pct = tranche.sizeINR > 0 ? Math.min((tranche.subscribedINR / tranche.sizeINR) * 100, 100) : 0

  return (
    <div className={`rounded-2xl border border-outline-variant/60 shadow-card overflow-hidden`}>
      <div className={`${colors.light} px-6 pt-5 pb-4`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-sm ${colors.bg}`} />
            <span className="text-label-caps font-bold text-on-surface">{tranche.class}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-label-caps font-bold px-2.5 py-1 rounded-full ${colors.light} ${colors.text} border border-current/20`}>
              {tranche.rating}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              tranche.status === 'SUBSCRIBED' ? 'bg-secondary/10 text-secondary' :
              tranche.status === 'OPEN' ? 'bg-primary/10 text-primary' :
              'bg-outline/10 text-outline'
            }`}>{tranche.status}</span>
          </div>
        </div>
        <p className="text-data-point font-bold text-on-surface">${tranche.sizeINR.toLocaleString()}M</p>
        <p className="text-caption text-on-surface-variant">{tranche.coupon}% p.a. · {tranche.tenorYears}-year tenor</p>
      </div>
      <div className="bg-surface-container-lowest px-6 py-4 space-y-4">
        {tranche.isin && (
          <div className="flex items-center justify-between">
            <span className="text-caption text-on-surface-variant">ISIN</span>
            <span className="text-caption font-bold text-on-surface font-mono">{tranche.isin}</span>
          </div>
        )}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-caption text-on-surface-variant">Subscribed</span>
            <span className="text-caption font-bold text-on-surface">${tranche.subscribedINR.toLocaleString()} / ${tranche.sizeINR.toLocaleString()}M ({pct.toFixed(0)}%)</span>
          </div>
          <div className="h-2 bg-outline-variant/30 rounded-full overflow-hidden">
            <div className={`h-full ${colors.bg} rounded-full transition-all`} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <p className="text-[11px] text-on-surface-variant">{TRANCHE_INVESTOR[tranche.class]}</p>
        {tranche.notes && (
          <p className="text-[11px] text-on-surface-variant border-t border-outline-variant/20 pt-3">{tranche.notes}</p>
        )}
        {/* Subscribers */}
        {tranche.subscribers.length > 0 && (
          <div className="border-t border-outline-variant/20 pt-3 space-y-2">
            {tranche.subscribers.map(s => (
              <div key={s.id} className="flex items-center justify-between">
                <span className="text-[11px] text-on-surface-variant">{s.investorType.replace(/_/g, ' ')}</span>
                <span className="text-[11px] font-bold text-on-surface">${s.amountINR.toLocaleString()}M</span>
              </div>
            ))}
          </div>
        )}
        {tranche.status !== 'SUBSCRIBED' && tranche.status !== 'REDEEMED' && (
          <SubscribePanel poolId={poolId} trancheId={tranche.id} remaining={tranche.sizeINR - tranche.subscribedINR} />
        )}
      </div>
    </div>
  )
}

function GateRow({ gate }: { gate: QualificationGate }) {
  const colors = {
    PASS:   { badge: 'bg-secondary/10 text-secondary', icon: 'check_circle' },
    FAIL:   { badge: 'bg-error/10 text-error',         icon: 'cancel' },
    REVIEW: { badge: 'bg-tertiary/10 text-tertiary',   icon: 'pending' },
  }[gate.status]

  return (
    <div className="flex items-center gap-4 px-6 py-3.5">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-caption font-bold text-on-surface">{gate.label}</p>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors.badge}`}>{gate.status}</span>
        </div>
        <p className="text-[11px] text-on-surface-variant mt-0.5">{gate.metric}</p>
      </div>
    </div>
  )
}

export default async function PoolDetailPage({
  params,
}: {
  params: Promise<{ poolId: string }>
}) {
  const { poolId } = await params
  const pool = await getPool(poolId)
  if (!pool) redirect('/securities')

  const totalSubscribed = pool.tranches.reduce((s, t) => s + t.subscribedINR, 0)
  const subscriptionPct = pool.totalSizeINR > 0 ? (totalSubscribed / pool.totalSizeINR) * 100 : 0

  return (
    <div className="py-gutter space-y-8 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-caption text-on-surface-variant">
        <Link href="/securities" className="hover:text-on-surface transition-colors">Securities Pools</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">{pool.name}</span>
      </nav>

      {/* Hero */}
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[32px] text-secondary">hub</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-headline-md text-on-surface font-bold">{pool.name}</h1>
            <span className={`text-label-caps px-2.5 py-1 rounded-full font-bold ${
              pool.status === 'LISTED' ? 'bg-secondary/10 text-secondary' :
              pool.status === 'STRUCTURING' ? 'bg-outline/10 text-outline' :
              'bg-primary/10 text-primary'
            }`}>{pool.status}</span>
          </div>
          <p className="text-body-base text-on-surface-variant">
            {pool.arranger}
            {pool.ratingAgency && ` · Rated by ${pool.ratingAgency}`}
            {pool.listedAt && ` · Listed ${new Date(pool.listedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
          </p>
        </div>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">storefront</span>
          Marketplace
        </Link>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Pool Size',      value: `$${pool.totalSizeINR.toLocaleString()}M`,  accent: '' },
          { label: 'Subscribed',     value: `${subscriptionPct.toFixed(0)}%`,            accent: 'text-secondary' },
          { label: 'DSCR (avg)',     value: `${pool.overallDSCR.toFixed(2)}x`,           accent: 'text-primary' },
          { label: 'LQ Score',       value: pool.overallLQ.toFixed(3),                   accent: 'text-secondary' },
          { label: 'Cash Reserve',   value: `$${pool.cashReserveINR}M`,                accent: '' },
        ].map(({ label, value, accent }) => (
          <div key={label} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-4 shadow-card">
            <p className="text-label-caps text-on-surface-variant mb-1">{label}</p>
            <p className={`text-data-point font-bold ${accent || 'text-on-surface'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Pool waterfall bar */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="material-symbols-outlined text-secondary text-[20px]">stacked_bar_chart</span>
          <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Waterfall Structure</h2>
          <span className="ml-auto text-caption text-on-surface-variant">OC: {pool.oc}% overcollateralisation</span>
        </div>
        {/* Stacked bar */}
        <div className="flex h-10 rounded-xl overflow-hidden mb-6">
          {pool.tranches.map(t => (
            <div
              key={t.id}
              className={`${TRANCHE_COLORS[t.class]?.bg ?? 'bg-outline'} flex items-center justify-center relative group`}
              style={{ width: `${(t.sizeINR / pool.totalSizeINR) * 100}%` }}
            >
              <span className="text-[10px] font-bold text-white z-10">{t.class.slice(0, 3)}</span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                ${t.sizeINR}M @ {t.coupon}% — {t.rating}
              </div>
            </div>
          ))}
        </div>
        {/* Waterfall priority */}
        <div className="space-y-2">
          {['1st — Senior (AAA): Priority claim on all cashflows', '2nd — Mezzanine (BBB): After Senior is fully serviced', '3rd — Junior (BB): Residual cashflows after senior & mezz', '4th — Excess Spread: Returned to pool arranger'].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-on-surface-variant">{i + 1}</span>
              </div>
              <p className="text-caption text-on-surface-variant">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tranches */}
      <div>
        <h2 className="text-label-caps font-bold text-on-surface tracking-widest mb-4">Tranche Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pool.tranches.map(t => (
            <TrancheCard key={t.id} tranche={t} poolId={pool.id} />
          ))}
        </div>
      </div>

      {/* Qualification Gates */}
      {pool.qualificationGates.length > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-[20px]">checklist</span>
            <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Qualification Gates</h2>
            <span className="ml-auto text-caption text-on-surface-variant">
              {pool.qualificationGates.filter(g => g.status === 'PASS').length}/{pool.qualificationGates.length} passed
            </span>
          </div>
          <div className="divide-y divide-outline-variant/20">
            {pool.qualificationGates.map(g => <GateRow key={g.id} gate={g} />)}
          </div>
        </div>
      )}
    </div>
  )
}
