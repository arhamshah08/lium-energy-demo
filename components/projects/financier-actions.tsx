'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-context'
import type { FinancierOffer, ProjectStatus } from '@/types'

const SUBMITTABLE: ProjectStatus[] = ['PUBLISHED_FOR_FINANCE', 'OFFER_RECEIVED']

export function FinancierActions({ projectId, projectStatus }: { projectId: string; projectStatus: ProjectStatus }) {
  const { user, token } = useAuth()
  const [myOffer, setMyOffer] = useState<FinancierOffer | null | undefined>(undefined)
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawn, setWithdrawn] = useState(false)

  useEffect(() => {
    if (!token || user?.role !== 'financier') return
    fetch(`/api/projects/${projectId}/offers`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(json => {
        if (!json.ok) { setMyOffer(null); return }
        const mine = (json.data as FinancierOffer[]).find(o => o.financierId === user.id)
        setMyOffer(mine ?? null)
      })
      .catch(() => setMyOffer(null))
  }, [projectId, token, user])

  if (user?.role !== 'financier') return null
  if (!SUBMITTABLE.includes(projectStatus)) return null
  if (myOffer === undefined) return null

  async function handleWithdraw() {
    if (!myOffer || !token) return
    setWithdrawing(true)
    const res = await fetch(`/api/projects/${projectId}/offers/${myOffer.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'withdraw' }),
    })
    const json = await res.json()
    if (json.ok) { setWithdrawn(true); setMyOffer({ ...myOffer, status: 'WITHDRAWN' }) }
    setWithdrawing(false)
  }

  if (!myOffer || withdrawn || myOffer.status === 'WITHDRAWN') {
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

  if (myOffer.status === 'ACCEPTED') {
    return (
      <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/30 text-secondary px-5 py-2.5 rounded-lg text-label-caps font-bold">
        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        Term Sheet Accepted
      </div>
    )
  }

  if (myOffer.status === 'PENDING' || myOffer.status === 'REVISION_REQUESTED') {
    return (
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/30 text-secondary px-4 py-2.5 rounded-lg text-label-caps font-bold">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shrink-0" />
          {myOffer.status === 'REVISION_REQUESTED' ? 'Revision Requested' : 'Term Sheet Submitted'}
        </div>
        <button
          onClick={handleWithdraw}
          disabled={withdrawing}
          className="inline-flex items-center gap-2 bg-error text-white px-4 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[15px]">undo</span>
          {withdrawing ? 'Withdrawing…' : 'Withdraw Offer'}
        </button>
      </div>
    )
  }

  if (myOffer.status === 'REJECTED' || myOffer.status === 'EXPIRED') {
    return (
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <div className="inline-flex items-center gap-2 bg-error/10 border border-error/20 text-error px-4 py-2.5 rounded-lg text-label-caps font-bold">
          <span className="material-symbols-outlined text-[15px]">cancel</span>
          {myOffer.status === 'EXPIRED' ? 'Offer Expired' : 'Offer Not Accepted'}
        </div>
        <Link
          href={`/projects/${projectId}/offer`}
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm"
        >
          Submit New Offer
        </Link>
      </div>
    )
  }

  return null
}
