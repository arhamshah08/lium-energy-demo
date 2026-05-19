'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-context'
import { ProjectCard } from '@/components/projects/project-card'
import { SubmitOfferPanel } from '@/components/projects/submit-offer-panel'
import { QuickPublishButton } from '@/components/projects/quick-publish-button'
import { roleHomePath } from '@/lib/auth-utils'
import type { Project } from '@/types'

const PUBLISHED_STATUSES = ['PUBLISHED_FOR_FINANCE', 'OFFER_RECEIVED', 'FINANCING_ACCEPTED', 'PUBLISHED_FOR_SA', 'TRANSACTING', 'TOKENISED']

function SubmitOfferButton({ project }: { project: Project }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-3 w-full bg-primary text-on-primary py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm"
      >
        Submit Offer
      </button>
      {open && (
        <SubmitOfferPanel
          projectId={project.id}
          projectName={project.name}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  )
}

export default function ProjectsPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [fetching, setFetching] = useState(true)
  const tokenRef = useRef(token)
  const userRef = useRef(user)
  tokenRef.current = token
  userRef.current = user

  const isDiscovery = user?.role === 'securitisation_agent' || user?.role === 'financier'

  const loadProjects = useCallback(() => {
    const t = tokenRef.current
    const u = userRef.current
    if (!t || !u) return
    fetch('/api/projects', { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json())
      .then(d => {
        let data: Project[] = d.data ?? []
        if (u.role === 'financier') {
          data = data.filter(p => ['PUBLISHED_FOR_FINANCE', 'OFFER_RECEIVED', 'FINANCING_ACCEPTED'].includes(p.status))
        }
        setProjects(data)
      })
      .finally(() => setFetching(false))
  }, [])

  useEffect(() => {
    if (loading) return
    if (!user) return

    if (user.role === 'investor' || user.role === 'portfolio_manager') {
      router.replace(roleHomePath(user.role))
      return
    }

    loadProjects()
  }, [user, token, loading, router, loadProjects])

  // Auto-poll for financier/SA so newly published projects appear immediately
  useEffect(() => {
    if (!user || !token) return
    if (user.role !== 'financier' && user.role !== 'securitisation_agent') return

    const interval = setInterval(loadProjects, 5000)
    return () => clearInterval(interval)
  }, [user, token, loadProjects])

  if (loading || fetching) {
    return (
      <div className="py-gutter space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-10 w-56 bg-surface-container-high rounded-lg animate-pulse" />
            <div className="h-5 w-80 bg-surface-container rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-surface-container-high rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-5">
              <div className="h-4 w-24 bg-surface-container-high rounded animate-pulse mb-3" />
              <div className="h-7 w-16 bg-surface-container-high rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-6 space-y-4">
              <div className="h-5 w-3/4 bg-surface-container-high rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-surface-container rounded animate-pulse" />
              <div className="h-20 w-full bg-surface-container rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const active          = projects.filter(p => ['SUBMITTED', 'ACTIVE'].includes(p.status)).length
  const comingSoon      = projects.filter(p => p.status === 'COMING_SOON').length
  const transacting     = projects.filter(p => p.status === 'TRANSACTING').length
  const inProgress      = projects.filter(p => ['DRAFT', 'DOCUMENTS_PENDING', 'TELEMETRY_PENDING'].includes(p.status)).length
  const allDraft        = projects.length > 0 && projects.every(p => p.status === 'DRAFT')
  const openForFinance  = projects.filter(p => ['PUBLISHED_FOR_FINANCE', 'OFFER_RECEIVED'].includes(p.status)).length
  const offerReceived   = projects.filter(p => p.status === 'OFFER_RECEIVED').length
  const financingAccepted = projects.filter(p => p.status === 'FINANCING_ACCEPTED').length

  return (
    <div className="py-gutter space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-display-lg text-on-surface">
            {isDiscovery ? 'Project Discovery' : 'My Projects'}
          </h1>
          <p className="text-body-base text-on-surface-variant mt-1">
            {isDiscovery
              ? 'Commissioned assets available for financing and securitisation'
              : 'Manage your energy assets — publish to connect with capital partners instantly'}
          </p>
        </div>
        {user?.role === 'developer' && (
          <Link
            href="/onboard/project-details"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Asset
          </Link>
        )}
        {user?.role === 'securitisation_agent' && (
          <Link
            href="/securities/new"
            className="inline-flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">hub</span>
            Structure Pool
          </Link>
        )}
      </div>

      {/* Credential hint */}
      {user?.role === 'developer' && allDraft && (
        <div className="flex items-center gap-4 bg-secondary/5 border border-secondary/20 rounded-xl px-5 py-4">
          <span className="material-symbols-outlined text-secondary text-[22px] shrink-0">rocket_launch</span>
          <div className="flex-1 min-w-0">
            <p className="text-caption font-bold text-on-surface">Ready to find financing? Click "Find Financing" on any project card.</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">No onboarding steps required — publish instantly and financiers will see your project within seconds.</p>
          </div>
        </div>
      )}

      {/* Live indicator for discovery roles */}
      {isDiscovery && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <p className="text-[11px] text-on-surface-variant">Live — refreshes automatically as developers publish</p>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(user?.role === 'financier' ? [
          { label: 'Open for Finance',    value: openForFinance,    icon: 'payments',        border: 'border-l-secondary',       iconColor: 'text-secondary' },
          { label: 'Offer Received',      value: offerReceived,     icon: 'mark_email_read', border: 'border-l-tertiary',        iconColor: 'text-tertiary' },
          { label: 'Financing Accepted',  value: financingAccepted, icon: 'check_circle',    border: 'border-l-primary',         iconColor: 'text-primary' },
          { label: 'Transacting',         value: transacting,       icon: 'pending_actions', border: 'border-l-outline-variant', iconColor: 'text-on-surface-variant' },
        ] : isDiscovery ? [
          { label: 'Total Assets', value: projects.length, icon: 'category',        border: 'border-l-outline-variant', iconColor: 'text-on-surface-variant' },
          { label: 'PTO · Active', value: active,          icon: 'check_circle',    border: 'border-l-secondary',       iconColor: 'text-secondary' },
          { label: 'Coming Soon',  value: comingSoon,      icon: 'schedule',        border: 'border-l-tertiary',        iconColor: 'text-tertiary' },
          { label: 'Transacting',  value: transacting,     icon: 'pending_actions', border: 'border-l-primary',         iconColor: 'text-primary' },
        ] : [
          { label: 'Total Assets', value: projects.length, icon: 'category',        border: 'border-l-outline-variant', iconColor: 'text-on-surface-variant' },
          { label: 'PTO · Active', value: active,          icon: 'check_circle',    border: 'border-l-secondary',       iconColor: 'text-secondary' },
          { label: 'Coming Soon',  value: comingSoon,      icon: 'schedule',        border: 'border-l-tertiary',        iconColor: 'text-tertiary' },
          { label: 'In Progress',  value: inProgress,      icon: 'edit',            border: 'border-l-primary',         iconColor: 'text-primary' },
        ]).map(({ label, value, icon, border, iconColor }) => (
          <div key={label} className={`bg-surface-container-lowest rounded-xl border border-outline-variant/60 border-l-4 ${border} p-5 shadow-card`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined text-[18px] ${iconColor}`}>{icon}</span>
              <p className="text-label-caps text-on-surface-variant">{label}</p>
            </div>
            <p className="text-data-point font-bold text-on-surface">{value}</p>
          </div>
        ))}
      </div>

      {/* Grid or empty state */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[40px] text-outline">energy_program_saving</span>
          </div>
          {user?.role === 'financier' ? (
            <>
              <h2 className="text-headline-md text-on-surface mb-2">No projects open for financing yet</h2>
              <p className="text-body-base text-on-surface-variant max-w-sm">
                This page refreshes automatically. Projects will appear the moment a developer publishes.
              </p>
            </>
          ) : isDiscovery ? (
            <>
              <h2 className="text-headline-md text-on-surface mb-2">No submitted projects yet</h2>
              <p className="text-body-base text-on-surface-variant max-w-sm">
                Projects appear here the moment a developer publishes for financing.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-headline-md text-on-surface mb-2">No assets yet</h2>
              <p className="text-body-base text-on-surface-variant max-w-sm mb-8">
                Register your first energy asset and publish it to connect with financiers instantly.
              </p>
              <Link
                href="/onboard/project-details"
                className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Register First Asset
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="relative group">
              <ProjectCard project={project} />
              {user?.role === 'developer' && !PUBLISHED_STATUSES.includes(project.status) && (
                <QuickPublishButton projectId={project.id} onPublished={loadProjects} />
              )}
              {user?.role === 'financier' && ['PUBLISHED_FOR_FINANCE', 'OFFER_RECEIVED'].includes(project.status) && (
                <SubmitOfferButton project={project} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
