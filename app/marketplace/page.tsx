import Link from 'next/link'
import { listPools } from '@/lib/token-store'
import type { Tranche } from '@/types'

export const dynamic = 'force-dynamic'

const TRANCHE_COLORS: Record<string, string> = {
  SENIOR:    'bg-secondary text-white',
  MEZZANINE: 'bg-primary text-white',
  JUNIOR:    'bg-tertiary text-white',
}

const INVESTOR_TARGET: Record<string, string> = {
  SENIOR:    'Pension Funds · Insurance · DFIs',
  MEZZANINE: 'Credit Funds · DFIs · Sovereign Wealth',
  JUNIOR:    'Alt Asset Managers · High Yield',
}

const RISK_LABEL: Record<string, string> = {
  SENIOR:    'Low Risk',
  MEZZANINE: 'Moderate Risk',
  JUNIOR:    'Higher Risk / Higher Return',
}

interface ListedTranche extends Tranche {
  poolName: string
  poolId: string
  poolDSCR: number
  poolLQ: number
}

export default async function MarketplacePage() {
  const pools = (await listPools()).filter(p => p.status === 'LISTED')

  const listed: ListedTranche[] = pools.flatMap(p =>
    p.tranches
      .filter(t => t.status !== 'REDEEMED')
      .map(t => ({
        ...t,
        poolName: p.name,
        poolId: p.id,
        poolDSCR: p.overallDSCR,
        poolLQ: p.overallLQ,
      })),
  )

  const totalListedMn = listed.reduce((s, t) => s + t.sizeINR, 0)
  const avgYield = listed.length ? (listed.reduce((s, t) => s + t.coupon, 0) / listed.length) : 0
  const subscribed = listed.filter(t => t.status === 'SUBSCRIBED').length

  return (
    <div className="py-gutter space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-display-lg text-on-surface">Marketplace</h1>
          <p className="text-body-base text-on-surface-variant mt-1">
            Institutional-grade structured energy finance — browse rated tranches
          </p>
        </div>
        <Link
          href="/securities"
          className="inline-flex items-center gap-2 border border-outline-variant bg-surface-container-lowest text-on-surface px-5 py-3 rounded-lg text-label-caps font-bold hover:bg-surface-container-high transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">hub</span>
          Pool Structuring
        </Link>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Listed AUM',    value: `₹${totalListedMn.toLocaleString()} Mn`, icon: 'payments',       accent: 'text-secondary' },
          { label: 'Instruments',   value: listed.length,                             icon: 'description',    accent: '' },
          { label: 'Avg Yield',     value: `${avgYield.toFixed(1)}%`,                icon: 'trending_up',    accent: 'text-tertiary' },
          { label: 'Subscribed',    value: `${subscribed}/${listed.length}`,         icon: 'check_circle',   accent: 'text-secondary' },
        ].map(({ label, value, icon, accent }) => (
          <div key={label} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-5 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined text-[18px] ${accent || 'text-on-surface-variant'}`}>{icon}</span>
              <p className="text-label-caps text-on-surface-variant">{label}</p>
            </div>
            <p className={`text-data-point font-bold ${accent || 'text-on-surface'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 rounded-xl p-4">
        <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">info</span>
        <p className="text-caption text-on-surface-variant">
          All instruments are backed by IEEE 2030.5-verified energy assets.
          Rating methodologies follow CRISIL/India Ratings structured finance criteria.
          Past LQ data available via UNITS oracle. This is a demo — not financial advice.
        </p>
      </div>

      {/* Listing grid */}
      {listed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[40px] text-outline">storefront</span>
          </div>
          <h2 className="text-headline-md text-on-surface mb-2">No listings available</h2>
          <p className="text-body-base text-on-surface-variant max-w-sm mb-8">
            Securitisation agents structure pools and list tranches here for investor subscription.
          </p>
          <Link href="/securities" className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all">
            Structure a Pool
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {listed.map(t => {
            const remaining = t.sizeINR - t.subscribedINR
            const pct = t.sizeINR > 0 ? (t.subscribedINR / t.sizeINR) * 100 : 0

            return (
              <div
                key={t.id}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
              >
                {/* Tranche class header */}
                <div className={`${TRANCHE_COLORS[t.class] ?? 'bg-outline text-white'} px-5 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="text-label-caps font-bold">{t.class}</span>
                    <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full">{t.rating}</span>
                  </div>
                  <span className="text-[11px] font-bold">{t.coupon}% p.a.</span>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 space-y-4">
                  <div>
                    <Link href={`/securities/${t.poolId}`} className="text-caption font-bold text-on-surface hover:text-primary transition-colors">
                      {t.poolName}
                    </Link>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">{RISK_LABEL[t.class]}</p>
                  </div>

                  {/* Key numbers */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Size',      value: `₹${t.sizeINR.toLocaleString()} Mn` },
                      { label: 'Tenor',     value: `${t.tenorYears} years` },
                      { label: 'Pool DSCR', value: `${t.poolDSCR.toFixed(2)}x` },
                      { label: 'Pool LQ',   value: t.poolLQ.toFixed(3) },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-surface-container-low rounded-lg p-2.5">
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">{label}</p>
                        <p className="text-caption font-bold text-on-surface mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Subscription progress */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-on-surface-variant">Subscription</span>
                      <span className="text-[11px] font-bold text-on-surface">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${TRANCHE_COLORS[t.class]?.split(' ')[0] ?? 'bg-outline'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-on-surface-variant mt-1">
                      ₹{remaining.toLocaleString()} Mn remaining
                    </p>
                  </div>

                  {/* Investor target */}
                  <p className="text-[11px] text-on-surface-variant border-t border-outline-variant/20 pt-3">
                    Target: {INVESTOR_TARGET[t.class]}
                  </p>
                </div>

                {/* CTA */}
                {t.status !== 'SUBSCRIBED' && (
                  <div className="px-5 pb-5">
                    <Link
                      href={`/securities/${t.poolId}`}
                      className="flex w-full items-center justify-center gap-2 bg-primary text-on-primary py-3 rounded-xl text-label-caps font-bold hover:opacity-90 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_circle</span>
                      Subscribe
                    </Link>
                  </div>
                )}
                {t.status === 'SUBSCRIBED' && (
                  <div className="px-5 pb-5">
                    <div className="flex w-full items-center justify-center gap-2 bg-secondary-container/40 border border-secondary/20 py-3 rounded-xl text-label-caps font-bold text-secondary">
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Fully Subscribed
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
