'use client'

import Link from 'next/link'
import type { Project, AssetType } from '@/types'
import { PMActions } from './pm-actions'

const ASSET_ICON: Record<AssetType, string> = {
  BESS:              'battery_charging_full',
  MICROGRID:         'grid_view',
  DER_CLUSTER:       'hub',
  SOLAR_PV:          'solar_power',
  WIND:              'air',
  SOLAR_BESS_HYBRID: 'energy_program_saving',
}

export function PMProjectScorecard({ project, onAction }: { project: Project; onAction?: () => void }) {
  const icon = ASSET_ICON[project.assetType] ?? 'energy_program_saving'
  const f = project.financials

  const meta = [
    project.assetType?.replace(/_/g, ' '),
    project.location,
    f?.totalCapexM != null ? `$${f.totalCapexM}M CAPEX` : null,
    f?.codDate ? `COD ${new Date(f.codDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : null,
  ].filter(Boolean).join(' · ')

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card">
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="w-9 h-9 rounded-lg bg-primary-container/40 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-[18px]">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={`/projects/${project.id}`}
            className="font-semibold text-[14px] text-on-surface hover:text-primary transition-colors"
          >
            {project.name}
          </Link>
          <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">{meta}</p>
        </div>
        <PMActions projectId={project.id} projectStatus={project.status} onAction={onAction} />
      </div>
    </div>
  )
}
