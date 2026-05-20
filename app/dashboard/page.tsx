'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-context'
import { cn } from '@/lib/utils'
import type { Project, Token, Pool } from '@/types'

// ─── Shared helpers ───────────────────────────────────────────────────────────

function KpiCard({ label, value, icon, accent, href }: {
  label: string; value: string | number; icon: string; accent: string; href?: string
}) {
  const cls = `bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all`
  const inner = (
    <>
      <div className="flex items-center gap-2 mb-2">
        <span className={`material-symbols-outlined text-[18px] ${accent}`}>{icon}</span>
        <p className="text-label-caps text-on-surface-variant">{label}</p>
      </div>
      <p className={`text-data-point font-bold ${accent}`}>{value}</p>
    </>
  )
  return href ? <Link href={href} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>
}

function SectionHeader({ icon, title, count, accent }: {
  icon: string; title: string; count?: number; accent?: string
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className={`material-symbols-outlined text-[18px] ${accent ?? 'text-on-surface-variant'}`}>{icon}</span>
      <h2 className="text-label-caps font-bold text-on-surface tracking-widest">{title}</h2>
      {count != null && count > 0 && (
        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-on-primary text-[10px] font-bold">{count}</span>
      )}
    </div>
  )
}

function EmptyCard({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 bg-surface-container rounded-xl border border-outline-variant/40">
      <span className="material-symbols-outlined text-outline text-[20px]">{icon}</span>
      <p className="text-caption text-on-surface-variant">{text}</p>
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-outline-variant/40 text-on-surface-variant',
  SUBMITTED: 'bg-primary/10 text-primary',
  ACTIVE: 'bg-secondary/10 text-secondary',
  PUBLISHED_FOR_FINANCE: 'bg-tertiary/10 text-tertiary',
  OFFER_RECEIVED: 'bg-tertiary/20 text-tertiary',
  FINANCING_ACCEPTED: 'bg-secondary/20 text-secondary',
  PUBLISHED_FOR_SA: 'bg-primary/20 text-primary',
  TRANSACTING: 'bg-secondary/30 text-secondary',
  TOKENISED: 'bg-secondary/10 text-secondary',
  REQUESTED: 'bg-tertiary/10 text-tertiary',
  PM_APPROVED: 'bg-secondary/10 text-secondary',
  LISTED: 'bg-secondary/20 text-secondary',
  STRUCTURING: 'bg-primary/10 text-primary',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider', STATUS_COLORS[status] ?? 'bg-outline-variant/30 text-on-surface-variant')}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

// ─── SA Dashboard ─────────────────────────────────────────────────────────────

function SADashboard({ token, projects, pools }: { token: string; projects: Project[]; pools: Pool[] }) {
  const readyForSA = projects.filter(p => p.status === 'PUBLISHED_FOR_SA')
  const pendingRequests = pools.filter(p => p.status === 'REQUESTED')
  const myPools = pools.filter(p => !['REQUESTED'].includes(p.status))
  const tokens = pools.flatMap(p => p.tokenIds)

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Ready to Tokenise" value={readyForSA.length} icon="pending_actions" accent="text-primary" href="/projects" />
        <KpiCard label="Pool Requests" value={pendingRequests.length} icon="swap_horiz" accent="text-tertiary" href="/pool-requests" />
        <KpiCard label="Tokens Issued" value={tokens.length} icon="token" accent="text-secondary" href="/tokenise" />
        <KpiCard label="Active Pools" value={myPools.filter(p => p.status === 'LISTED').length} icon="hub" accent="text-secondary" href="/securities" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets waiting to tokenise */}
        <div>
          <SectionHeader icon="pending_actions" title="AWAITING TOKENISATION" count={readyForSA.length} accent="text-primary" />
          {readyForSA.length === 0 ? (
            <EmptyCard icon="hourglass_empty" text="No projects published for you yet — developers publish after financing closes." />
          ) : (
            <div className="space-y-2">
              {readyForSA.slice(0, 5).map(p => (
                <div key={p.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 flex items-center gap-4 px-5 py-3 shadow-card">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[16px]">bolt</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-bold text-on-surface truncate">{p.name}</p>
                    <p className="text-[10px] text-on-surface-variant">{p.location} · {p.assetType}</p>
                  </div>
                  <Link href="/tokenise" className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:opacity-80 transition-opacity shrink-0">
                    <span className="material-symbols-outlined text-[13px]">token</span>
                    Tokenise
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pool requests from PM */}
        <div>
          <SectionHeader icon="swap_horiz" title="POOL REQUESTS FROM PM" count={pendingRequests.length} accent="text-tertiary" />
          {pendingRequests.length === 0 ? (
            <EmptyCard icon="inbox" text="Portfolio managers will send pool composition requests here." />
          ) : (
            <div className="space-y-2">
              {pendingRequests.slice(0, 5).map(pool => (
                <div key={pool.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 flex items-center gap-4 px-5 py-3 shadow-card">
                  <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-tertiary text-[16px]">workspaces</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-bold text-on-surface truncate">{pool.name}</p>
                    <p className="text-[10px] text-on-surface-variant">{pool.pmAllocations?.length ?? 0} assets · {new Date(pool.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Link href="/pool-requests" className="inline-flex items-center gap-1 text-[10px] font-bold text-tertiary hover:opacity-80 transition-opacity shrink-0">
                    <span className="material-symbols-outlined text-[13px]">rate_review</span>
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My pools pipeline */}
      {myPools.length > 0 && (
        <div>
          <SectionHeader icon="hub" title="MY POOL PIPELINE" accent="text-secondary" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {myPools.slice(0, 6).map(pool => (
              <Link key={pool.id} href={`/securities/${pool.id}`}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-4 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-caption font-bold text-on-surface truncate flex-1 mr-2">{pool.name}</p>
                  <StatusBadge status={pool.status} />
                </div>
                <p className="text-[10px] text-on-surface-variant">{pool.tranches.length} tranches · ${pool.totalSizeINR.toLocaleString()}M</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PM Dashboard ─────────────────────────────────────────────────────────────

function PMDashboard({ userId, authToken, pools, availableTokens }: {
  userId: string; authToken: string; pools: Pool[]; availableTokens: Token[]
}) {
  const myPools = pools.filter(p => p.requestedByPmId === userId)
  const pendingRequests = myPools.filter(p => p.status === 'REQUESTED')
  const approvedPools = myPools.filter(p => p.status === 'PM_APPROVED')
  const listedPools = myPools.filter(p => p.status === 'LISTED')
  const [publishing, setPublishing] = useState<string | null>(null)

  async function publishPool(poolId: string) {
    setPublishing(poolId)
    await fetch(`/api/pools/${poolId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'LISTED', listedAt: new Date().toISOString() }),
    })
    setPublishing(null)
    window.location.reload()
  }

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Available Assets" value={availableTokens.length} icon="token" accent="text-primary" href="/pool-requests" />
        <KpiCard label="Pending Requests" value={pendingRequests.length} icon="hourglass_empty" accent="text-tertiary" href="/pool-requests" />
        <KpiCard label="Ready to Publish" value={approvedPools.length} icon="check_circle" accent="text-secondary" href="/pool-requests" />
        <KpiCard label="Live Offerings" value={listedPools.length} icon="deployed_code" accent="text-secondary" href="/offerings" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approved pools — ready to publish */}
        <div>
          <SectionHeader icon="check_circle" title="APPROVED — READY TO PUBLISH" count={approvedPools.length} accent="text-secondary" />
          {approvedPools.length === 0 ? (
            <EmptyCard icon="hourglass_empty" text="Approved pools from the SA will appear here — ready for you to publish to investors." />
          ) : (
            <div className="space-y-2">
              {approvedPools.map(pool => (
                <div key={pool.id} className="bg-surface-container-lowest rounded-xl border border-secondary/30 flex items-center gap-4 px-5 py-3 shadow-card">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-secondary text-[16px]">workspaces</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-bold text-on-surface truncate">{pool.name}</p>
                    <p className="text-[10px] text-on-surface-variant">{pool.tranches.length} tranches · ${pool.totalSizeINR.toLocaleString()}M</p>
                  </div>
                  <button
                    onClick={() => publishPool(pool.id)}
                    disabled={publishing === pool.id}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-on-secondary bg-secondary px-3 py-1.5 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 shrink-0"
                  >
                    {publishing === pool.id ? 'Publishing…' : 'Publish to Investors'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending requests */}
        <div>
          <SectionHeader icon="swap_horiz" title="WAITING FOR SA" count={pendingRequests.length} accent="text-tertiary" />
          {pendingRequests.length === 0 ? (
            <EmptyCard icon="inbox" text="Your pool requests will appear here while SA reviews them." />
          ) : (
            <div className="space-y-2">
              {pendingRequests.map(pool => (
                <div key={pool.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 flex items-center gap-4 px-5 py-3">
                  <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-tertiary text-[16px]">pending</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-bold text-on-surface truncate">{pool.name}</p>
                    <p className="text-[10px] text-on-surface-variant">{pool.pmAllocations?.length ?? 0} assets requested · {new Date(pool.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status="REQUESTED" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Available assets from SA */}
      <div>
        <SectionHeader icon="token" title="AVAILABLE ASSETS FROM SA" count={availableTokens.length} accent="text-primary" />
        {availableTokens.length === 0 ? (
          <EmptyCard icon="hourglass_empty" text="Tokenised assets from the SA will appear here — select them to request a pool." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {availableTokens.slice(0, 6).map(tok => (
              <div key={tok.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-4 shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold font-mono text-primary truncate">{tok.tokenId}</p>
                  <StatusBadge status={tok.status} />
                </div>
                <p className="text-caption font-bold text-on-surface">${tok.nominalValueINR.toLocaleString()}M</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">LQ {tok.lqScore.composite.toFixed(3)} · {tok.issuedTo}</p>
              </div>
            ))}
          </div>
        )}
        {availableTokens.length > 0 && (
          <div className="mt-4">
            <Link href="/pool-requests"
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm">
              <span className="material-symbols-outlined text-[16px]">add</span>
              Request a Pool
            </Link>
          </div>
        )}
      </div>

      {/* Live offerings */}
      {listedPools.length > 0 && (
        <div>
          <SectionHeader icon="deployed_code" title="MY LIVE OFFERINGS" accent="text-secondary" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {listedPools.map(pool => {
              const totalSubscribed = pool.tranches.reduce((s, t) => s + t.subscribedINR, 0)
              const fillPct = pool.totalSizeINR > 0 ? (totalSubscribed / pool.totalSizeINR) * 100 : 0
              return (
                <Link key={pool.id} href={`/securities/${pool.id}`}
                  className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-4 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-caption font-bold text-on-surface truncate flex-1 mr-2">{pool.name}</p>
                    <StatusBadge status="LISTED" />
                  </div>
                  <p className="text-[10px] text-on-surface-variant mb-3">{pool.tranches.length} tranches · ${pool.totalSizeINR.toLocaleString()}M</p>
                  <div className="h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: `${Math.max(fillPct, 2)}%` }} />
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-1">{fillPct.toFixed(0)}% subscribed</p>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Investor Dashboard ───────────────────────────────────────────────────────

function InvestorDashboard({ userId, pools }: { userId: string; pools: Pool[] }) {
  const listedPools = pools.filter(p => p.status === 'LISTED')

  const myPositions = pools.flatMap(pool =>
    pool.tranches.flatMap(tranche =>
      tranche.subscribers
        .filter(s => s.investorId === userId)
        .map(s => ({ pool, tranche, subscription: s }))
    )
  )

  const totalInvested = myPositions.reduce((s, p) => s + p.subscription.amountINR, 0)
  const avgYield = myPositions.length > 0
    ? myPositions.reduce((s, p) => s + p.tranche.coupon * p.subscription.amountINR, 0) / totalInvested
    : 0

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Available Offerings" value={listedPools.length} icon="storefront" accent="text-primary" href="/marketplace" />
        <KpiCard label="My Positions" value={myPositions.length} icon="savings" accent="text-secondary" href="/investments" />
        <KpiCard label="Total Invested" value={`$${totalInvested.toLocaleString()}M`} icon="payments" accent="text-secondary" />
        <KpiCard label="Avg Yield" value={myPositions.length > 0 ? `${avgYield.toFixed(1)}%` : '—'} icon="trending_up" accent="text-tertiary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available offerings */}
        <div>
          <SectionHeader icon="storefront" title="AVAILABLE TO INVEST" count={listedPools.length} accent="text-primary" />
          {listedPools.length === 0 ? (
            <EmptyCard icon="hourglass_empty" text="Portfolio managers will publish offerings here. Check back soon." />
          ) : (
            <div className="space-y-2">
              {listedPools.slice(0, 5).map(pool => {
                const minCoupon = pool.tranches.length > 0 ? Math.min(...pool.tranches.map(t => t.coupon)) : 0
                const maxCoupon = pool.tranches.length > 0 ? Math.max(...pool.tranches.map(t => t.coupon)) : 0
                return (
                  <Link key={pool.id} href={`/securities/${pool.id}`}
                    className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 flex items-center gap-4 px-5 py-3 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-[16px]">workspaces</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-caption font-bold text-on-surface truncate">{pool.name}</p>
                      <p className="text-[10px] text-on-surface-variant">${pool.totalSizeINR.toLocaleString()}M · {minCoupon === maxCoupon ? `${minCoupon}%` : `${minCoupon}–${maxCoupon}%`} yield</p>
                    </div>
                    <span className="material-symbols-outlined text-outline text-[16px] shrink-0">chevron_right</span>
                  </Link>
                )
              })}
              {listedPools.length > 5 && (
                <Link href="/marketplace" className="text-[11px] font-bold text-primary hover:opacity-80 transition-opacity px-1">
                  View all {listedPools.length} offerings →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* My positions */}
        <div>
          <SectionHeader icon="savings" title="MY PORTFOLIO" count={myPositions.length} accent="text-secondary" />
          {myPositions.length === 0 ? (
            <EmptyCard icon="savings" text="Subscribe to tranches on the marketplace to start building your portfolio." />
          ) : (
            <div className="space-y-2">
              {myPositions.slice(0, 5).map(({ pool, tranche, subscription }) => (
                <Link key={subscription.id} href={`/securities/${pool.id}`}
                  className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 flex items-center gap-4 px-5 py-3 shadow-card hover:shadow-card-hover transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-bold text-on-surface truncate">{pool.name}</p>
                    <p className="text-[10px] text-on-surface-variant">{tranche.class} tranche · {tranche.coupon}% yield</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-caption font-bold text-secondary">${subscription.amountINR.toLocaleString()}M</p>
                  </div>
                </Link>
              ))}
              {myPositions.length > 5 && (
                <Link href="/investments" className="text-[11px] font-bold text-primary hover:opacity-80 transition-opacity px-1">
                  View all positions →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/marketplace"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm">
          <span className="material-symbols-outlined text-[16px]">storefront</span>
          Browse Marketplace
        </Link>
        {myPositions.length > 0 && (
          <Link href="/investments"
            className="inline-flex items-center gap-2 border border-outline-variant text-on-surface px-6 py-2.5 rounded-lg text-label-caps font-bold hover:bg-surface-container transition-all">
            My Investments
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── Developer Dashboard ──────────────────────────────────────────────────────

function DeveloperDashboard({ projects, offers }: { projects: Project[]; offers: unknown[] }) {
  const myProjects = projects
  const drafts = myProjects.filter(p => p.status === 'DRAFT').length
  const published = myProjects.filter(p => ['PUBLISHED_FOR_FINANCE', 'OFFER_RECEIVED'].includes(p.status)).length
  const active = myProjects.filter(p => ['FINANCING_ACCEPTED', 'PUBLISHED_FOR_SA', 'TRANSACTING', 'TOKENISED'].includes(p.status)).length
  const pendingOffers = (offers as { status: string }[]).filter(o => ['PENDING', 'REVISION_REQUESTED'].includes(o.status)).length

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Projects" value={myProjects.length} icon="account_balance" accent="text-primary" href="/projects" />
        <KpiCard label="Drafts" value={drafts} icon="edit_document" accent="text-on-surface-variant" href="/projects" />
        <KpiCard label="Seeking Finance" value={published} icon="search" accent="text-tertiary" href="/projects" />
        <KpiCard label="Incoming Offers" value={pendingOffers} icon="payments" accent={pendingOffers > 0 ? 'text-secondary' : 'text-on-surface-variant'} href="/projects" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionHeader icon="account_balance" title="MY PROJECTS" count={myProjects.length} accent="text-primary" />
          {myProjects.length === 0 ? (
            <EmptyCard icon="add" text="No projects yet — register your first energy asset." />
          ) : (
            <div className="space-y-2">
              {myProjects.slice(0, 6).map(p => (
                <Link key={p.id} href={`/projects/${p.id}`}
                  className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 flex items-center gap-4 px-5 py-3 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-bold text-on-surface truncate">{p.name}</p>
                    <p className="text-[10px] text-on-surface-variant">{p.location} · {p.assetType}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <SectionHeader icon="payments" title="RECENT ACTIVITY" accent="text-secondary" />
          <div className="space-y-3">
            {active > 0 && (
              <div className="bg-secondary/5 border border-secondary/20 rounded-xl px-5 py-4">
                <p className="text-caption font-bold text-on-surface">{active} project{active !== 1 ? 's' : ''} past financing</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">These are in the securitisation pipeline or tokenised.</p>
              </div>
            )}
            {pendingOffers > 0 && (
              <Link href="/projects" className="block bg-tertiary/5 border border-tertiary/20 rounded-xl px-5 py-4 hover:bg-tertiary/10 transition-colors">
                <p className="text-caption font-bold text-on-surface">{pendingOffers} offer{pendingOffers !== 1 ? 's' : ''} need your attention</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Review and accept, reject, or request revisions.</p>
              </Link>
            )}
            {pendingOffers === 0 && active === 0 && (
              <EmptyCard icon="inbox" text="Publish a project to start receiving offers from financiers." />
            )}
          </div>
        </div>
      </div>

      <Link href="/onboard/project-details"
        className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm">
        <span className="material-symbols-outlined text-[16px]">add</span>
        Register New Asset
      </Link>
    </div>
  )
}

// ─── Financier Dashboard ──────────────────────────────────────────────────────

function FinancierDashboard({ projects, offers }: { projects: Project[]; offers: unknown[] }) {
  const router = useRouter()
  const available = projects.filter(p => ['PUBLISHED_FOR_FINANCE', 'OFFER_RECEIVED'].includes(p.status))
  const myOffers = offers as { status: string; projectId: string }[]
  const pendingOffers = myOffers.filter(o => ['PENDING', 'REVISION_REQUESTED'].includes(o.status))

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Open Projects" value={available.length} icon="search" accent="text-primary" href="/projects" />
        <KpiCard label="My Offers" value={myOffers.length} icon="payments" accent="text-secondary" href="/offers" />
        <KpiCard label="Pending Response" value={pendingOffers.length} icon="hourglass_empty" accent={pendingOffers.length > 0 ? 'text-tertiary' : 'text-on-surface-variant'} href="/offers" />
        <KpiCard label="Accepted" value={myOffers.filter(o => o.status === 'ACCEPTED').length} icon="check_circle" accent="text-secondary" href="/offers" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionHeader icon="search" title="OPEN FOR FINANCING" count={available.length} accent="text-primary" />
          {available.length === 0 ? (
            <EmptyCard icon="hourglass_empty" text="No projects are currently seeking financing." />
          ) : (
            <div className="space-y-2">
              {available.slice(0, 5).map(p => (
                <div key={p.id} onClick={() => router.push(`/projects/${p.id}`)} role="link" tabIndex={0}
                  className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 flex items-center gap-4 px-5 py-3 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-bold text-on-surface truncate">{p.name}</p>
                    <p className="text-[10px] text-on-surface-variant">{p.location} · {p.financials?.totalCapexM ? `$${p.financials.totalCapexM}M CAPEX` : p.assetType}</p>
                  </div>
                  <Link href={`/projects/${p.id}/offer`} onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:opacity-80 transition-opacity shrink-0">
                    <span className="material-symbols-outlined text-[13px]">add</span>
                    Offer
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <SectionHeader icon="payments" title="MY ACTIVE OFFERS" count={pendingOffers.length} accent="text-secondary" />
          {pendingOffers.length === 0 ? (
            <EmptyCard icon="inbox" text="Submit offers on open projects and track them here." />
          ) : (
            <div className="space-y-2">
              {pendingOffers.slice(0, 5).map((o, i) => (
                <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 flex items-center gap-4 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-bold text-on-surface">Offer submitted</p>
                    <p className="text-[10px] text-on-surface-variant">Awaiting developer response</p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, token, loading } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [pools, setPools] = useState<Pool[]>([])
  const [tokens, setTokens] = useState<Token[]>([])
  const [offers, setOffers] = useState<unknown[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (loading || !user || !token) return

    const headers = { Authorization: `Bearer ${token}` }
    const role = user.role

    const fetches: Promise<unknown>[] = [
      fetch('/api/projects', { headers }).then(r => r.json()).then(j => { if (j.ok) setProjects(j.data) }),
      fetch('/api/pools', { headers }).then(r => r.json()).then(j => { if (j.ok) setPools(j.data) }),
    ]

    if (role === 'securitisation_agent' || role === 'portfolio_manager') {
      fetches.push(
        fetch('/api/tokens', { headers }).then(r => r.json()).then(j => { if (j.ok) setTokens(j.data) })
      )
    }

    if (role === 'developer') {
      fetches.push(
        fetch('/api/offers/developer', { headers }).then(r => r.json()).then(j => { if (j.ok) setOffers(j.data) })
      )
    }

    if (role === 'financier') {
      fetches.push(
        fetch('/api/offers', { headers }).then(r => r.json()).then(j => { if (j.ok) setOffers(j.data) })
      )
    }

    Promise.all(fetches).finally(() => setFetching(false))
  }, [user, token, loading])

  if (loading || fetching) {
    return (
      <div className="py-gutter space-y-6">
        <div className="h-9 w-56 bg-surface-container-high rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-surface-container-lowest rounded-xl border border-outline-variant/60 animate-pulse" />)}
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-surface-container-lowest rounded-xl border border-outline-variant/60 animate-pulse" />)}
        </div>
      </div>
    )
  }

  const roleLabels: Record<string, string> = {
    developer: 'Project Developer',
    financier: 'Financier',
    securitisation_agent: 'Securitisation Agent',
    portfolio_manager: 'Portfolio Manager',
    investor: 'Investor',
  }

  const role = user?.role ?? 'developer'
  const myProjects = role === 'developer'
    ? projects
    : role === 'financier'
      ? projects.filter(p => ['PUBLISHED_FOR_FINANCE', 'OFFER_RECEIVED', 'FINANCING_ACCEPTED'].includes(p.status))
      : role === 'securitisation_agent'
        ? projects.filter(p => ['PUBLISHED_FOR_SA', 'TRANSACTING', 'TOKENISED'].includes(p.status))
        : []

  return (
    <div className="py-gutter space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{roleLabels[role] ?? role}</p>
          <h1 className="text-display-lg text-on-surface">Command Center</h1>
          {user?.fullName && (
            <p className="text-body-base text-on-surface-variant mt-1">Welcome back, {user.fullName.split(' ')[0]}</p>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          <p className="text-[11px] text-on-surface-variant">Live</p>
        </div>
      </div>

      {/* Role-specific content */}
      {role === 'securitisation_agent' && (
        <SADashboard token={token ?? ''} projects={myProjects} pools={pools} />
      )}
      {role === 'portfolio_manager' && (
        <PMDashboard
          userId={user?.id ?? ''}
          authToken={token ?? ''}
          pools={pools}
          availableTokens={tokens.filter(t => t.status === 'ACTIVE')}
        />
      )}
      {role === 'investor' && (
        <InvestorDashboard userId={user?.id ?? ''} pools={pools} />
      )}
      {role === 'developer' && (
        <DeveloperDashboard projects={myProjects} offers={offers} />
      )}
      {role === 'financier' && (
        <FinancierDashboard projects={myProjects} offers={offers} />
      )}
    </div>
  )
}
