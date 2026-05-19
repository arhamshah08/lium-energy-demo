'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function VerifyButton({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleVerify() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    await fetch(`/api/projects/${projectId}/quick-verify`, { method: 'POST' })
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleVerify}
      disabled={loading}
      className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm shrink-0 disabled:opacity-70"
    >
      {loading ? (
        <>
          <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
          Verifying…
        </>
      ) : (
        <>
          Verify Telemetry
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </>
      )}
    </button>
  )
}
