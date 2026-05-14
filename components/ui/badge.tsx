import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/types'

const STATUS_CONFIG: Record<ProjectStatus, { label: string; classes: string }> = {
  DRAFT:              { label: 'Draft',               classes: 'bg-surface-container-high text-on-surface-variant' },
  DOCUMENTS_PENDING:  { label: 'Docs Pending',        classes: 'bg-tertiary-fixed text-on-tertiary-fixed-variant' },
  TELEMETRY_PENDING:  { label: 'Telemetry Pending',   classes: 'bg-primary-fixed text-on-primary-fixed-variant' },
  SUBMITTED:          { label: 'Submitted',           classes: 'bg-secondary-container text-on-secondary-container' },
  TOKENISED:          { label: 'Tokenised',           classes: 'bg-primary-container text-on-primary-container' },
}

const FALLBACK_CONFIG = {
  label: 'Unknown Status',
  classes: 'bg-outline text-on-surface-variant',
}

function toTitleCase(value: string): string {
  return value
    .split('_')
    .filter(Boolean)
    .map((segment) => segment[0] + segment.slice(1).toLowerCase())
    .join(' ')
}

export function StatusBadge({ status }: { status?: ProjectStatus | null }) {
  const config = status ? STATUS_CONFIG[status as ProjectStatus] : undefined
  const { label, classes } = config ?? {
    label: status ? toTitleCase(status) : FALLBACK_CONFIG.label,
    classes: FALLBACK_CONFIG.classes,
  }

  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-label-caps font-bold', classes)}>
      {label}
    </span>
  )
}
