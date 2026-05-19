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
        onPublished()
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
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-secondary text-on-secondary py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
            Publishing…
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
