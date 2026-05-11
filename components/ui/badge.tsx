import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/types'

const STATUS_CONFIG: Record<ProjectStatus, { label: string; classes: string }> = {
  DRAFT:              { label: 'Draft',               classes: 'bg-surface-container-high text-on-surface-variant' },
  DOCUMENTS_PENDING:  { label: 'Docs Pending',        classes: 'bg-tertiary-fixed text-on-tertiary-fixed-variant' },
  TELEMETRY_PENDING:  { label: 'Telemetry Pending',   classes: 'bg-primary-fixed text-on-primary-fixed-variant' },
  SUBMITTED:          { label: 'Submitted',           classes: 'bg-secondary-container text-on-secondary-container' },
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { label, classes } = STATUS_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-label-caps font-bold', classes)}>
      {label}
    </span>
  )
}
