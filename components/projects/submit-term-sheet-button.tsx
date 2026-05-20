'use client'
import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-context'
import type { ProjectStatus } from '@/types'

export function SubmitTermSheetButton({ projectId, status }: { projectId: string; status: ProjectStatus }) {
  const { user } = useAuth()
  if (user?.role !== 'financier') return null
  if (!['PUBLISHED_FOR_FINANCE', 'OFFER_RECEIVED'].includes(status)) return null
  return (
    <Link
      href={`/projects/${projectId}/offer`}
      className="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm"
    >
      <span className="material-symbols-outlined text-[16px]">edit_document</span>
      Submit Term Sheet
    </Link>
  )
}
