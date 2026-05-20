'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/auth-context'

export function QuickPublishButton({
  projectId,
  onPublished,
}: {
  projectId: string
  onPublished: () => void
}) {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function publish() {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: 'finance' }),
      })
      const json = await res.json()
      if (json.ok) {
        setDone(true)
        setTimeout(() => onPublished(), 1200)
      } else {
        setError(json.error?.message ?? 'Failed')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={e => { e.preventDefault(); publish() }}
        disabled={loading || done}
        className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-label-caps font-bold transition-all shadow-sm disabled:opacity-90 ${
          done
            ? 'bg-secondary/20 text-secondary border border-secondary/40'
            : 'bg-secondary text-on-secondary hover:opacity-90'
        }`}
      >
        {loading ? (
          <>
            <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
            Publishing…
          </>
        ) : done ? (
          <>
            <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Submitted for Financing
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[15px]">publish</span>
            Find Financing
          </>
        )}
      </button>
      {error && <p className="text-[10px] text-error mt-1 text-center">{error}</p>}
    </div>
  )
}
