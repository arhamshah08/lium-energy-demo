'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { projectsApi } from '@/lib/api'
import { ProjectCard } from '@/components/projects/project-card'
import type { Project } from '@/types'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    projectsApi.list().then((res) => {
      if (res.ok) setProjects(res.data)
      setLoading(false)
    })
  }, [])

  const submitted = projects.filter(p => p.status === 'SUBMITTED').length
  const inProgress = projects.length - submitted

  return (
    <div className="py-gutter space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-display-lg text-on-surface">Asset Registry</h1>
          <p className="text-body-base text-on-surface-variant mt-1">
            Manage and monitor your registered energy assets
          </p>
        </div>
        <Link
          href="/onboard/project-details"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Asset
        </Link>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Assets',   value: projects.length, icon: 'category' },
          { label: 'Submitted',      value: submitted,        icon: 'check_circle',    accent: 'text-secondary' },
          { label: 'In Progress',    value: inProgress,       icon: 'pending_actions', accent: 'text-primary' },
          { label: 'Jurisdictions',  value: new Set(projects.map(p => p.jurisdiction)).size, icon: 'lan' },
        ].map(({ label, value, icon, accent }) => (
          <div
            key={label}
            className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-5 shadow-card"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined text-[18px] ${accent ?? 'text-on-surface-variant'}`}>{icon}</span>
              <p className="text-label-caps text-on-surface-variant">{label}</p>
            </div>
            <p className={`text-data-point font-bold ${accent ?? 'text-on-surface'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Grid or empty/loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[40px] text-outline">energy_program_saving</span>
          </div>
          <h2 className="text-headline-md text-on-surface mb-2">No assets yet</h2>
          <p className="text-body-base text-on-surface-variant max-w-sm mb-8">
            Register your first energy asset to begin the onboarding process and connect to the LIUM network.
          </p>
          <Link
            href="/onboard/project-details"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Register First Asset
          </Link>
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
