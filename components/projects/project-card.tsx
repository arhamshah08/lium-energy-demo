import Link from 'next/link'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/badge'
import type { Project, AssetType, ProjectStatus } from '@/types'

const ASSET_META: Record<AssetType, { label: string; icon: string }> = {
  BESS:             { label: 'Battery Storage',  icon: 'battery_charging_full' },
  MICROGRID:        { label: 'Microgrid',        icon: 'grid_view' },
  DER_CLUSTER:      { label: 'DER Cluster',      icon: 'hub' },
  SOLAR_PV:         { label: 'Solar PV',         icon: 'solar_power' },
  WIND:             { label: 'Wind',             icon: 'air' },
  SOLAR_BESS_HYBRID:{ label: 'Solar+BESS Hybrid',icon: 'energy_program_saving' },
}

const STEP_MAP: Record<string, number> = {
  DRAFT:               1,
  COMING_SOON:         2,
  DOCUMENTS_PENDING:   2,
  TELEMETRY_PENDING:   3,
  SUBMITTED:           3,
  ACTIVE:              3,
  TRANSACTING:         3,
  TOKENISED:           3,
}

const TOTAL_STEPS = 3

export function ProjectCard({ project }: { project: Project }) {
  const assetMeta = (ASSET_META as Record<string, typeof ASSET_META[AssetType]>)[project.assetType]
    ?? { label: project.assetType, icon: 'energy_program_saving' }
  const { label: assetLabel, icon: assetIcon } = assetMeta
  const completedSteps = STEP_MAP[project.status] ?? 0
  const isSubmitted = project.status === 'SUBMITTED' || project.status === 'ACTIVE'
  const isComingSoon = project.status === 'COMING_SOON'
  const isTransacting = project.status === 'TRANSACTING'

  return (
    <Link href={`/projects/${project.id}`} className="block group">
      <div className={cn(
        'bg-surface-container-lowest rounded-xl border border-outline-variant/60',
        'shadow-card group-hover:shadow-card-hover group-hover:-translate-y-px transition-all duration-200',
        'flex flex-col h-full',
      )}>
        {/* Card header */}
        <div className="p-6 pb-4 flex items-start gap-4">
          <div className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
            isSubmitted ? 'bg-secondary-container text-secondary' : 'bg-surface-container-high text-on-surface-variant',
          )}>
            <span className="material-symbols-outlined text-[24px]">{assetIcon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-label-caps text-on-surface-variant mb-1">{assetLabel}</p>
            <h3 className="font-bold text-on-surface truncate leading-tight">{project.name}</h3>
          </div>
          <StatusBadge status={project.status} />
        </div>

        {/* Details */}
        <div className="px-6 pb-4 flex-1 space-y-2">
          {project.location && (
            <div className="flex items-center gap-2 text-caption text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px] shrink-0">location_on</span>
              <span className="truncate">{project.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-caption text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px] shrink-0">lan</span>
            <span>{project.jurisdiction}</span>
          </div>
          <div className="flex items-center gap-2 text-caption text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px] shrink-0">calendar_today</span>
            <span>{new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-6 pb-6 pt-2 border-t border-outline-variant/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">
              {isSubmitted ? 'PTO Achieved · Ready' : isComingSoon ? 'Coming Soon · Pre-PTO' : isTransacting ? 'Deal in Progress' : `Step ${completedSteps} of ${TOTAL_STEPS}`}
            </span>
            {(isSubmitted || isTransacting) && (
              <span
                className={`material-symbols-outlined text-[16px] ${isTransacting ? 'text-primary' : 'text-secondary'}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isTransacting ? 'pending_actions' : 'check_circle'}
              </span>
            )}
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-all',
                  i < completedSteps
                    ? isSubmitted ? 'bg-secondary' : 'bg-primary'
                    : 'bg-outline-variant/50',
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}
