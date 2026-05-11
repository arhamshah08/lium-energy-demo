import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Project, OnboardStep } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function projectToStep(project: Project | undefined): OnboardStep {
  if (!project) return 1
  switch (project.status) {
    case 'DRAFT': return 2
    case 'DOCUMENTS_PENDING': return 3
    case 'TELEMETRY_PENDING': return 4
    default: return 5
  }
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
