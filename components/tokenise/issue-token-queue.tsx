'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-context'
import type { Project } from '@/types'

function IssueForm({
  project,
  onCancel,
}: {
  project: Project
  onCancel: () => void
}) {
  const { token: authToken, user } = useAuth()
  const router = useRouter()
  const [nominalValue, setNominalValue] = useState(project.financials?.totalCapexM?.toString() ?? '')
  const [issuedTo, setIssuedTo] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!authToken || !nominalValue || !issuedTo) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          nominalValueINR: parseFloat(nominalValue),
          issuedTo,
        }),
      })
      const json = await res.json()
      if (json.ok) {
        router.refresh()
      } else {
        setError(json.error?.message ?? 'Failed to issue token')
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-3 bg-surface-container rounded-xl border border-outline-variant/40 p-4 space-y-3">
      <p className="text-[11px] font-bold text-on-surface">Issue UNITS Token — {project.name}</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-on-surface-variant uppercase tracking-wide block mb-1">Nominal Value ($M)</label>
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={nominalValue}
            onChange={e => setNominalValue(e.target.value)}
            placeholder="e.g. 12.5"
            className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 text-caption text-on-surface focus:outline-none focus:border-primary/60"
          />
        </div>
        <div>
          <label className="text-[10px] text-on-surface-variant uppercase tracking-wide block mb-1">Issued To (entity)</label>
          <input
            type="text"
            value={issuedTo}
            onChange={e => setIssuedTo(e.target.value)}
            placeholder="e.g. Riverstone Capital SPV I"
            className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 text-caption text-on-surface focus:outline-none focus:border-primary/60"
          />
        </div>
      </div>
      {error && <p className="text-[11px] text-error">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={saving || !nominalValue || !issuedTo}
          className="px-4 py-2 rounded-lg text-label-caps bg-primary text-on-primary font-bold hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {saving ? 'Issuing…' : 'Issue Token'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-label-caps text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export function IssueTokenQueue({ projects }: { projects: Project[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-secondary/20 border-l-4 border-l-secondary shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center gap-3">
        <span className="material-symbols-outlined text-secondary text-[20px]">pending_actions</span>
        <h2 className="text-label-caps font-bold text-on-surface tracking-widest">READY FOR TOKENISATION</h2>
        <span className="text-caption text-on-surface-variant">{projects.length} project{projects.length !== 1 ? 's' : ''} approved by developer</span>
      </div>
      <div className="divide-y divide-outline-variant/20">
        {projects.map(p => {
          const fin = p.financials
          return (
            <div key={p.id} className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-secondary text-[18px]">energy_program_saving</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-caption font-bold text-on-surface">{p.name}</p>
                  <p className="text-[11px] text-on-surface-variant">
                    {p.location} · {p.assetType.replace(/_/g, ' ')}
                    {fin?.capacityMW && ` · ${fin.capacityMW}MW`}
                    {fin?.totalCapexM && ` · $${fin.totalCapexM}M CAPEX`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full uppercase tracking-wide">PTO Approved</span>
                  <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wide">Financed</span>
                  <button
                    onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                    className="ml-2 inline-flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all"
                  >
                    <span className="material-symbols-outlined text-[14px]">token</span>
                    {expanded === p.id ? 'Cancel' : 'Issue Token'}
                  </button>
                </div>
              </div>
              {expanded === p.id && (
                <IssueForm project={p} onCancel={() => setExpanded(null)} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
