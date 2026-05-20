'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-context'
import { ProjectCard } from '@/components/projects/project-card'
import { FinancierProjectScorecard } from '@/components/projects/financier-project-scorecard'
import { SAProjectScorecard } from '@/components/projects/sa-project-scorecard'
import { PMProjectScorecard } from '@/components/projects/pm-project-scorecard'
import { QuickPublishButton } from '@/components/projects/quick-publish-button'
import { DevOfferCard } from '@/components/projects/dev-offer-card'
import type { OfferWithProject } from '@/components/projects/dev-offer-card'
import { roleHomePath } from '@/lib/auth-utils'
import { cn } from '@/lib/utils'
import type { Project, FinancierOffer } from '@/types'

const PUBLISHED_STATUSES = ['PUBLISHED_FOR_FINANCE', 'OFFER_RECEIVED', 'FINANCING_ACCEPTED', 'PUBLISHED_FOR_SA', 'TRANSACTING', 'TOKENISED']

type Tab = { id: string; label: string; badge?: number }

function TabStrip({ tabs, active, onSelect }: { tabs: Tab[]; active: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex border-b border-outline-variant/30">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          className={cn(
            'flex items-center gap-2 px-5 py-3 text-label-caps font-bold border-b-2 -mb-px transition-all',
            active === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface',
          )}
        >
          {tab.label}
          {tab.badge != null && tab.badge > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-on-primary text-[10px] font-bold leading-none">
              {tab.badge > 99 ? '99+' : tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

function EmptyTab({ icon, title, body, cta }: { icon: string; title: string; body: string; cta?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-[32px] text-outline">{icon}</span>
      </div>
      <h2 className="text-headline-md text-on-surface mb-2">{title}</h2>
      <p className="text-body-base text-on-surface-variant max-w-sm mb-6">{body}</p>
      {cta}
    </div>
  )
}

// Simplified offer card for the financier "My Offers" tab (no resubmit form)
function FinOfferRow({ offer }: { offer: OfferWithProject }) {
  const STATUS_CFG: Record<string, { label: string; cls: string }> = {
    PENDING:            { label: 'Pending',            cls: 'bg-primary/10 text-primary' },
    ACCEPTED:           { label: 'Accepted',           cls: 'bg-secondary/10 text-secondary' },
    REJECTED:           { label: 'Rejected',           cls: 'bg-error/10 text-error' },
    REVISION_REQUESTED: { label: 'Revision Requested', cls: 'bg-tertiary/10 text-tertiary' },
    EXPIRED:            { label: 'Expired',            cls: 'bg-outline-variant/30 text-on-surface-variant' },
    WITHDRAWN:          { label: 'Withdrawn',          cls: 'bg-outline-variant/30 text-on-surface-variant' },
  }
  const cfg = STATUS_CFG[offer.status] ?? { label: offer.status, cls: '' }
  const rateStr = offer.rateType === 'FIXED' ? `${offer.ratePct ?? '—'}% fixed` : `SOFR +${offer.sofrSpreadPct ?? '—'}%`

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card">
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="flex-1 min-w-0">
          <Link href={`/projects/${offer.projectId}`} className="text-caption font-bold text-on-surface hover:text-primary transition-colors">
            {offer.projectName}
          </Link>
          <p className="text-[10px] text-on-surface-variant mt-0.5">{offer.projectLocation}</p>
        </div>
        <div className="hidden md:flex items-center gap-5 text-[11px] shrink-0">
          <span className="text-on-surface font-semibold">${offer.loanAmountM}M</span>
          <span className="text-on-surface-variant">{rateStr}</span>
          <span className="text-on-surface-variant">{offer.tenorYears} yrs</span>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide shrink-0 ${cfg.cls}`}>
          {cfg.label}
        </span>
        {offer.status === 'ACCEPTED' && (
          <Link href={`/projects/${offer.projectId}`}
            className="inline-flex items-center gap-1 text-[10px] font-bold text-secondary hover:opacity-80 transition-opacity shrink-0">
            <span className="material-symbols-outlined text-[13px]">open_in_new</span>
            View
          </Link>
        )}
        {offer.status === 'REVISION_REQUESTED' && (
          <Link href="/offers"
            className="inline-flex items-center gap-1 text-[10px] font-bold text-tertiary hover:opacity-80 transition-opacity shrink-0">
            <span className="material-symbols-outlined text-[13px]">edit_note</span>
            Revise
          </Link>
        )}
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>('')
  const [projects, setProjects] = useState<Project[]>([])
  const [devOffers, setDevOffers] = useState<OfferWithProject[]>([])
  const [finOffers, setFinOffers] = useState<OfferWithProject[]>([])
  const [fetching, setFetching] = useState(true)
  const tokenRef = useRef(token)
  const userRef = useRef(user)
  tokenRef.current = token
  userRef.current = user

  const loadAll = useCallback(async () => {
    const t = tokenRef.current
    const u = userRef.current
    if (!t || !u) return

    const offersUrl = u.role === 'developer' ? '/api/offers/developer'
      : u.role === 'financier' ? '/api/offers'
      : null

    const [projRes, offersRes] = await Promise.all([
      fetch('/api/projects', { headers: { Authorization: `Bearer ${t}` } }),
      offersUrl ? fetch(offersUrl, { headers: { Authorization: `Bearer ${t}` } }) : Promise.resolve(null),
    ])

    const projJson = await projRes.json()
    let data: Project[] = projJson.data ?? []

    if (u.role === 'financier') {
      data = data.filter(p => ['PUBLISHED_FOR_FINANCE', 'OFFER_RECEIVED', 'FINANCING_ACCEPTED'].includes(p.status))
    } else if (u.role === 'securitisation_agent') {
      data = data.filter(p => ['PUBLISHED_FOR_SA', 'TRANSACTING', 'TOKENISED'].includes(p.status))
    } else if (u.role === 'portfolio_manager') {
      data = data.filter(p => ['TRANSACTING', 'TOKENISED'].includes(p.status))
    }
    setProjects(data)

    if (offersRes) {
      const offJson = await offersRes.json()
      if (offJson.ok) {
        if (u.role === 'developer') setDevOffers(offJson.data)
        else if (u.role === 'financier') setFinOffers(offJson.data)
      }
    }

    setFetching(false)
  }, [])

  useEffect(() => {
    if (loading) return
    if (!user) return
    if (user.role === 'investor') {
      router.replace(roleHomePath(user.role))
      return
    }
    loadAll()
  }, [user, token, loading, router, loadAll])

  useEffect(() => {
    if (!user || !token) return
    if (!['financier', 'securitisation_agent', 'portfolio_manager'].includes(user.role)) return
    const interval = setInterval(loadAll, 5000)
    return () => clearInterval(interval)
  }, [user, token, loadAll])

  if (loading || fetching) {
    return (
      <div className="py-gutter space-y-6">
        <div className="h-9 w-48 bg-surface-container-high rounded-lg animate-pulse" />
        <div className="h-11 w-full bg-surface-container rounded-xl animate-pulse" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 w-full bg-surface-container-lowest rounded-xl border border-outline-variant/60 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // ── Tab definitions ──────────────────────────────────────
  const tabs: Tab[] = (() => {
    if (!user) return []
    switch (user.role) {
      case 'developer': {
        const pending = devOffers.filter(o => ['PENDING', 'REVISION_REQUESTED'].includes(o.status)).length
        return [
          { id: 'assets', label: 'My Assets' },
          { id: 'offers', label: 'Offers', badge: pending || undefined },
        ]
      }
      case 'financier': {
        const actionable = finOffers.filter(o => ['ACCEPTED', 'REVISION_REQUESTED'].includes(o.status)).length
        return [
          { id: 'available', label: 'Available' },
          { id: 'my-offers', label: 'My Offers', badge: actionable || undefined },
        ]
      }
      case 'securitisation_agent': {
        const ready = projects.filter(p => p.status === 'PUBLISHED_FOR_SA').length
        return [
          { id: 'available', label: 'Available', badge: ready || undefined },
          { id: 'progress', label: 'In Progress' },
        ]
      }
      case 'portfolio_manager': {
        const passed = projects.filter(p => p.status === 'TRANSACTING').length
        return [
          { id: 'passed', label: 'Passed to Me', badge: passed || undefined },
          { id: 'listed', label: 'Listed' },
        ]
      }
      default: return [{ id: 'assets', label: 'My Assets' }]
    }
  })()

  const effectiveTab = tabs.some(t => t.id === activeTab) ? activeTab : (tabs[0]?.id ?? 'assets')

  // ── Header CTA ───────────────────────────────────────────
  const headerCta = user?.role === 'developer' ? (
    <Link href="/onboard/project-details"
      className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm shrink-0">
      <span className="material-symbols-outlined text-[18px]">add</span>New Asset
    </Link>
  ) : user?.role === 'securitisation_agent' ? (
    <Link href="/securities/new"
      className="inline-flex items-center gap-2 bg-secondary text-on-secondary px-6 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm shrink-0">
      <span className="material-symbols-outlined text-[18px]">hub</span>Structure Pool
    </Link>
  ) : user?.role === 'portfolio_manager' ? (
    <Link href="/securities/new"
      className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm shrink-0">
      <span className="material-symbols-outlined text-[18px]">workspaces</span>New Pool
    </Link>
  ) : null

  // ── Page title ───────────────────────────────────────────
  const pageTitle =
    user?.role === 'developer' ? 'My Projects' :
    user?.role === 'financier' ? 'Project Discovery' :
    user?.role === 'securitisation_agent' ? 'Asset Pipeline' :
    user?.role === 'portfolio_manager' ? 'Asset Management' :
    'Projects'

  // ── Tab content ──────────────────────────────────────────
  const renderContent = () => {
    if (!user) return null

    // DEVELOPER
    if (user.role === 'developer') {
      if (effectiveTab === 'assets') {
        if (projects.length === 0) return (
          <EmptyTab icon="bolt" title="No assets yet"
            body="Register your first energy asset and publish it to connect with financiers instantly."
            cta={
              <Link href="/onboard/project-details"
                className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm">
                <span className="material-symbols-outlined text-[18px]">add</span>Register First Asset
              </Link>
            }
          />
        )
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map(p => (
              <div key={p.id} className="relative group">
                <ProjectCard project={p} />
                {!PUBLISHED_STATUSES.includes(p.status) && (
                  <QuickPublishButton projectId={p.id} onPublished={loadAll} />
                )}
              </div>
            ))}
          </div>
        )
      }
      if (effectiveTab === 'offers') {
        const active = devOffers.filter(o => ['PENDING', 'REVISION_REQUESTED'].includes(o.status))
        const history = devOffers.filter(o => !['PENDING', 'REVISION_REQUESTED'].includes(o.status))
        if (devOffers.length === 0) return (
          <EmptyTab icon="payments" title="No offers yet"
            body="Publish a project for financing and financiers will submit term sheets here." />
        )
        return (
          <div className="space-y-8">
            {active.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">
                  Needs Action · {active.length}
                </p>
                {active.map(o => <DevOfferCard key={o.id} offer={o} onAction={loadAll} />)}
              </div>
            )}
            {history.length > 0 && (
              <div className="space-y-3 opacity-60">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">
                  History · {history.length}
                </p>
                {history.map(o => <DevOfferCard key={o.id} offer={o} onAction={loadAll} />)}
              </div>
            )}
          </div>
        )
      }
    }

    // FINANCIER
    if (user.role === 'financier') {
      if (effectiveTab === 'available') {
        if (projects.length === 0) return (
          <EmptyTab icon="payments" title="No projects open for financing"
            body="This refreshes automatically. Projects appear the moment a developer publishes." />
        )
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {projects.map(p => <FinancierProjectScorecard key={p.id} project={p} />)}
          </div>
        )
      }
      if (effectiveTab === 'my-offers') {
        const active = finOffers.filter(o => ['PENDING', 'REVISION_REQUESTED'].includes(o.status))
        const history = finOffers.filter(o => !['PENDING', 'REVISION_REQUESTED'].includes(o.status))
        if (finOffers.length === 0) return (
          <EmptyTab icon="description" title="No offers submitted yet"
            body="Submit term sheets on available projects and track them here." />
        )
        return (
          <div className="space-y-8">
            {active.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Active · {active.length}</p>
                {active.map(o => <FinOfferRow key={o.id} offer={o} />)}
              </div>
            )}
            {history.length > 0 && (
              <div className="space-y-2 opacity-60">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">History · {history.length}</p>
                {history.map(o => <FinOfferRow key={o.id} offer={o} />)}
              </div>
            )}
            <div className="pt-2">
              <Link href="/offers" className="inline-flex items-center gap-1.5 text-[11px] text-primary font-bold hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                Full offer management
              </Link>
            </div>
          </div>
        )
      }
    }

    // SECURITISATION AGENT
    if (user.role === 'securitisation_agent') {
      const available  = projects.filter(p => p.status === 'PUBLISHED_FOR_SA')
      const inProgress = projects.filter(p => ['TRANSACTING', 'TOKENISED'].includes(p.status))
      const list = effectiveTab === 'available' ? available : inProgress
      if (list.length === 0) return (
        <EmptyTab
          icon={effectiveTab === 'available' ? 'hub' : 'pending_actions'}
          title={effectiveTab === 'available' ? 'No assets ready for securitisation' : 'Nothing in progress'}
          body={effectiveTab === 'available'
            ? 'Assets appear here once a developer has closed financing and published for securitisation.'
            : 'Submitted assets will appear here as they move through the securitisation process.'}
        />
      )
      return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {list.map(p => <SAProjectScorecard key={p.id} project={p} />)}
        </div>
      )
    }

    // PORTFOLIO MANAGER
    if (user.role === 'portfolio_manager') {
      const passed = projects.filter(p => p.status === 'TRANSACTING')
      const listed  = projects.filter(p => p.status === 'TOKENISED')
      const list = effectiveTab === 'passed' ? passed : listed
      if (list.length === 0) return (
        <EmptyTab
          icon={effectiveTab === 'passed' ? 'pending_actions' : 'verified'}
          title={effectiveTab === 'passed' ? 'Nothing passed to you yet' : 'No listed assets yet'}
          body={effectiveTab === 'passed'
            ? 'Assets appear here once a securitisation agent submits them.'
            : 'Listed assets appear here after you list them individually or via a pool.'}
        />
      )
      return (
        <div className="space-y-2">
          {list.map(p => <PMProjectScorecard key={p.id} project={p} onAction={loadAll} />)}
        </div>
      )
    }

    return null
  }

  const isDiscovery = ['financier', 'securitisation_agent', 'portfolio_manager'].includes(user?.role ?? '')

  return (
    <div className="py-gutter space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-display-lg text-on-surface">{pageTitle}</h1>
          {isDiscovery && (
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <p className="text-[11px] text-on-surface-variant">Live</p>
            </div>
          )}
        </div>
        {headerCta}
      </div>

      {/* Developer hint when all drafts */}
      {user?.role === 'developer' && projects.length > 0 && projects.every(p => p.status === 'DRAFT') && (
        <div className="flex items-center gap-4 bg-secondary/5 border border-secondary/20 rounded-xl px-5 py-4">
          <span className="material-symbols-outlined text-secondary text-[22px] shrink-0">rocket_launch</span>
          <p className="text-caption text-on-surface">
            <span className="font-bold">Ready to find financing?</span>
            {' '}Click <span className="font-bold">Find Financing</span> on any project card to publish it to financiers.
          </p>
        </div>
      )}

      {/* Tab strip */}
      <TabStrip tabs={tabs} active={effectiveTab} onSelect={setActiveTab} />

      {/* Tab content */}
      <div>
        {renderContent()}
      </div>
    </div>
  )
}
