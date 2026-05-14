'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-context'
import { ProjectCard } from '@/components/projects/project-card'
import { roleHomePath } from '@/lib/auth-utils'
import type { Project } from '@/types'

export default function ProjectsPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [fetching, setFetching] = useState(true)

  const isDiscovery = user?.role === 'securitisation_agent' || user?.role === 'financier'

  useEffect(() => {
    if (loading) return
    if (!user) return

    if (user.role === 'investor' || user.role === 'portfolio_manager') {
      router.replace(roleHomePath(user.role))
      return
    }

    fetch('/api/projects', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setProjects(d.data ?? []))
      .finally(() => setFetching(false))
  }, [user, token, loading, router])

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

  const submitted  = projects.filter(p => p.status === 'SUBMITTED').length
  const inProgress = projects.length - submitted

  return (
    <div className="py-gutter space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-display-lg text-on-surface">
            {isDiscovery ? 'Project Discovery' : 'Asset Registry'}
          </h1>
          <p className="text-body-base text-on-surface-variant mt-1">
            {isDiscovery
              ? 'Submitted projects available for pool structuring'
              : 'Manage and monitor your registered energy assets'}
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

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Assets',  value: projects.length,  icon: 'category',        border: 'border-l-outline-variant', iconColor: 'text-on-surface-variant' },
          { label: 'Submitted',     value: submitted,         icon: 'check_circle',    border: 'border-l-secondary',       iconColor: 'text-secondary' },
          { label: 'In Progress',   value: inProgress,        icon: 'pending_actions', border: 'border-l-primary',         iconColor: 'text-primary' },
          { label: 'Jurisdictions', value: new Set(projects.map(p => p.jurisdiction)).size, icon: 'lan', border: 'border-l-tertiary', iconColor: 'text-tertiary' },
        ].map(({ label, value, icon, border, iconColor }) => (
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
          {isDiscovery ? (
            <>
              <h2 className="text-headline-md text-on-surface mb-2">No submitted projects yet</h2>
              <p className="text-body-base text-on-surface-variant max-w-sm">
                Projects will appear here once developers submit them for review.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-headline-md text-on-surface mb-2">No assets yet</h2>
              <p className="text-body-base text-on-surface-variant max-w-sm mb-8">
                Register your first energy asset to begin the onboarding process and connect to the LIUM network.
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
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
