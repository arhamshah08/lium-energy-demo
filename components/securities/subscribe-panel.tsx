'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { InvestorType } from '@/types'

const INVESTOR_TYPES: InvestorType[] = ['PENSION_FUND', 'INSURANCE', 'CREDIT_FUND', 'DFI', 'RETAIL', 'HEDGE_FUND']

export function SubscribePanel({
  poolId,
  trancheId,
  remaining,
}: {
  poolId: string
  trancheId: string
  remaining: number
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [investorType, setInvestorType] = useState<InvestorType>('PENSION_FUND')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubscribe() {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0 || amt > remaining) {
      setError(`Amount must be between 1 and ${remaining} Mn`)
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/pools/${poolId}/tranches/${trancheId}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investorType, amountINR: amt }),
      })
      const json = await res.json()
      if (json.ok) {
        setDone(true)
        router.refresh()
      } else {
        setError(json.error?.message ?? 'Subscription failed')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 bg-secondary-container/30 border border-secondary/20 rounded-lg px-3 py-2">
        <span className="material-symbols-outlined text-secondary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        <span className="text-caption text-secondary font-medium">Subscription confirmed</span>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all"
      >
        <span className="material-symbols-outlined text-[16px]">add_circle</span>
        Subscribe
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-label-caps font-bold text-on-surface tracking-widest">SUBSCRIBE — TRANCHE</h3>
              <button onClick={() => setOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-caption text-on-surface-variant">
              Remaining available: <strong>₹{remaining.toLocaleString()} Mn</strong>
            </p>

            <div>
              <label className="text-label-caps text-on-surface-variant block mb-1.5">Investor Type</label>
              <select
                value={investorType}
                onChange={e => setInvestorType(e.target.value as InvestorType)}
                className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container text-on-surface text-caption focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {INVESTOR_TYPES.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-label-caps text-on-surface-variant block mb-1.5">Subscription Amount (₹ Mn)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={`Max ₹${remaining} Mn`}
                className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container text-on-surface text-caption focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {error && (
              <p className="text-caption text-error">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-3 rounded-xl border border-outline-variant text-on-surface text-label-caps font-bold hover:bg-surface-container transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-primary text-on-primary text-label-caps font-bold hover:opacity-90 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    Confirming…
                  </>
                ) : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
