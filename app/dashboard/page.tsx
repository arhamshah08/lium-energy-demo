import Link from 'next/link'
import { listTokens, listPools } from '@/lib/token-store'
import { listProjects } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const tokens   = await listTokens()
  const pools    = await listPools()

  const token = tokens[0]
  const pool  = pools[0]

  const totalAUM     = tokens.reduce((s, t) => s + t.nominalValueINR, 0)
  const listedPools  = pools.filter(p => p.status === 'LISTED').length
  const totalSubscribed = pools.flatMap(p => p.tranches).reduce((s, t) => s + t.subscribedINR, 0)

  return (
    <div className="py-gutter space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-display-lg text-on-surface">Command Center</h1>
        <p className="text-body-base text-on-surface-variant mt-1">
          LIUM Finternet platform — real-time overview of tokenised energy assets
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total AUM',         value: `$${totalAUM.toLocaleString()}M`, icon: 'payments',        accent: 'text-secondary', href: '/tokenise' },
          { label: 'Tokens Issued',     value: tokens.length,                    icon: 'token',           accent: '',               href: '/tokenise' },
          { label: 'Securities Listed', value: listedPools,                      icon: 'storefront',      accent: 'text-primary',   href: '/marketplace' },
          { label: 'Subscribed',        value: `$${totalSubscribed.toLocaleString()}M`, icon: 'account_balance', accent: 'text-secondary', href: '/marketplace' },
        ].map(({ label, value, icon, accent, href }) => (
          <Link key={label} href={href} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-5 shadow-card hover:shadow-card-hover transition-all">
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined text-[18px] ${accent || 'text-on-surface-variant'}`}>{icon}</span>
              <p className="text-label-caps text-on-surface-variant">{label}</p>
            </div>
            <p className={`text-data-point font-bold ${accent || 'text-on-surface'}`}>{value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Featured token ── */}
        {token && (
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">token</span>
                <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Active Token</h2>
              </div>
              <Link href={`/tokenise/${token.id}`} className="text-label-caps text-primary hover:underline">View →</Link>
            </div>
            <div className="p-6 flex items-start gap-6">
              {/* LQ Ring */}
              <div className="relative shrink-0">
                <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e7eeff" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke="#006a65"
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - token.lqScore.composite)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xl font-bold text-on-surface">{token.lqScore.composite.toFixed(2)}</p>
                  <p className="text-[9px] font-bold text-secondary">LQ</p>
                </div>
              </div>
              <div className="flex-1">
                <p className="font-bold text-on-surface font-mono">{token.tokenId}</p>
                <p className="text-caption text-on-surface-variant mb-3">{token.issuedTo}</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Nominal',  value: `$${token.nominalValueINR.toLocaleString()}M` },
                    { label: 'Status',   value: token.status },
                    { label: 'ITC Out',  value: `$${token.vgfMilestones.filter(v => v.status === 'RELEASED').reduce((s, v) => s + v.amountINR, 0)}M` },
                    { label: 'Ops',      value: token.operations.length },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-surface-container-low rounded-lg p-2.5">
                      <p className="text-[10px] text-on-surface-variant uppercase">{label}</p>
                      <p className="text-caption font-bold text-on-surface">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Operation history mini */}
            <div className="border-t border-outline-variant/20 px-6 py-4">
              <p className="text-label-caps text-on-surface-variant mb-3">Recent Operations</p>
              <div className="flex flex-wrap gap-2">
                {token.operations.slice(0, 5).map((op, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-surface-container rounded-lg px-3 py-1.5">
                    <span className="text-[10px] font-bold text-on-surface">{op.operation}</span>
                    <span className="text-[10px] text-on-surface-variant">
                      {new Date(op.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Quick actions ── */}
        <div className="space-y-4">
          <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Quick Actions</h2>
          {[
            { icon: 'add',          label: 'Onboard New Asset',        href: '/onboard/project-details', desc: 'Register and tokenise an energy asset' },
            { icon: 'token',        label: 'Token Registry',           href: '/tokenise',                desc: `${tokens.length} token${tokens.length !== 1 ? 's' : ''} active` },
            { icon: 'hub',          label: 'Securities Pools',         href: '/securities',              desc: `${pools.length} pool${pools.length !== 1 ? 's' : ''} structured` },
            { icon: 'storefront',   label: 'Investor Marketplace',     href: '/marketplace',             desc: `${listedPools} pool${listedPools !== 1 ? 's' : ''} listed` },
            { icon: 'account_balance', label: 'Asset Registry',        href: '/projects',                desc: 'Manage registered assets' },
          ].map(({ icon, label, href, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary-container/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary text-[20px]">{icon}</span>
              </div>
              <div>
                <p className="text-caption font-bold text-on-surface">{label}</p>
                <p className="text-[11px] text-on-surface-variant">{desc}</p>
              </div>
              <span className="material-symbols-outlined text-outline text-[16px] ml-auto">chevron_right</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Pool summary */}
      {pool && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-[20px]">hub</span>
              <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Latest Pool — {pool.name}</h2>
            </div>
            <Link href={`/securities/${pool.id}`} className="text-label-caps text-primary hover:underline">View pool →</Link>
          </div>
          <div className="p-6">
            {/* Stacked bar */}
            <div className="flex h-8 rounded-xl overflow-hidden mb-4">
              {pool.tranches.map(t => {
                const clr = { SENIOR: 'bg-secondary', MEZZANINE: 'bg-primary', JUNIOR: 'bg-tertiary', EQUITY: 'bg-outline' }[t.class] ?? 'bg-outline'
                return (
                  <div
                    key={t.id}
                    className={`${clr} flex items-center justify-center`}
                    style={{ width: `${(t.sizeINR / pool.totalSizeINR) * 100}%` }}
                  >
                    <span className="text-[10px] font-bold text-white">{t.rating}</span>
                  </div>
                )
              })}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {pool.tranches.map(t => {
                const pct = t.sizeINR > 0 ? (t.subscribedINR / t.sizeINR) * 100 : 0
                return (
                  <div key={t.id} className="bg-surface-container-low rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase">{t.class}</span>
                      <span className="text-[10px] font-bold text-on-surface">{t.rating}</span>
                    </div>
                    <p className="text-caption font-bold text-on-surface">${t.sizeINR.toLocaleString()}M</p>
                    <p className="text-[10px] text-on-surface-variant">{t.coupon}% · {t.tenorYears}yr</p>
                    <div className="h-1 bg-outline-variant/30 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${({ SENIOR: 'bg-secondary', MEZZANINE: 'bg-primary', JUNIOR: 'bg-tertiary', EQUITY: 'bg-outline' }[t.class] ?? 'bg-outline')}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">{pct.toFixed(0)}% subscribed</p>
                  </div>
                )
              })}
              <div className="bg-surface-container-low rounded-xl p-3 flex flex-col justify-center">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Pool DSCR</p>
                <p className="text-data-point font-bold text-primary">{pool.overallDSCR.toFixed(2)}x</p>
                <p className="text-[10px] text-on-surface-variant">LQ {pool.overallLQ.toFixed(3)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
