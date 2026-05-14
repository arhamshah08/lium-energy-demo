'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TokenOperationType, Token } from '@/types'

const OPERATIONS: Array<{
  op: TokenOperationType
  label: string
  description: string
  icon: string
  allowedFrom: Token['status'][]
  style: string
}> = [
  {
    op: 'LOCK',
    label: 'Lock',
    description: 'Restrict transfers — pledge to pool',
    icon: 'lock',
    allowedFrom: ['ACTIVE'],
    style: 'bg-primary/5 border-primary/20 text-primary hover:bg-primary/10',
  },
  {
    op: 'UNLOCK',
    label: 'Unlock',
    description: 'Remove lock restriction',
    icon: 'lock_open',
    allowedFrom: ['LOCKED'],
    style: 'bg-secondary/5 border-secondary/20 text-secondary hover:bg-secondary/10',
  },
  {
    op: 'PLEDGE',
    label: 'Pledge',
    description: 'Pledge as collateral',
    icon: 'handshake',
    allowedFrom: ['ACTIVE', 'LOCKED'],
    style: 'bg-tertiary/5 border-tertiary/20 text-tertiary hover:bg-tertiary/10',
  },
  {
    op: 'TRANSFER',
    label: 'Transfer',
    description: 'Transfer ownership',
    icon: 'swap_horiz',
    allowedFrom: ['ACTIVE'],
    style: 'bg-surface-container border-outline-variant text-on-surface hover:bg-surface-container-high',
  },
  {
    op: 'REDEEM',
    label: 'Redeem',
    description: 'Mature and settle obligations',
    icon: 'paid',
    allowedFrom: ['ACTIVE', 'LOCKED'],
    style: 'bg-surface-container border-outline-variant text-on-surface hover:bg-surface-container-high',
  },
  {
    op: 'BURN',
    label: 'Burn',
    description: 'Permanently destroy token',
    icon: 'local_fire_department',
    allowedFrom: ['ACTIVE', 'REDEEMED'],
    style: 'bg-error/5 border-error/20 text-error hover:bg-error/10',
  },
]

export function TokenOpsPanel({
  tokenId,
  currentStatus,
}: {
  tokenId: string
  currentStatus: Token['status']
}) {
  const router = useRouter()
  const [pending, setPending] = useState<TokenOperationType | null>(null)
  const [modal, setModal] = useState<TokenOperationType | null>(null)
  const [notes, setNotes] = useState('')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const available = OPERATIONS.filter(o => o.allowedFrom.includes(currentStatus))

  async function execute(op: TokenOperationType) {
    setPending(op)
    setResult(null)
    try {
      const res = await fetch(`/api/tokens/${tokenId}/operations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: op,
          notes: notes || undefined,
          recipient: recipient || undefined,
          amount: amount ? parseFloat(amount) : undefined,
        }),
      })
      const json = await res.json()
      if (json.ok) {
        setResult({ success: true, message: `${op} operation confirmed — tx recorded on-chain` })
        setModal(null)
        setNotes('')
        setRecipient('')
        setAmount('')
        router.refresh()
      } else {
        setResult({ success: false, message: json.error?.message ?? 'Operation failed' })
      }
    } catch {
      setResult({ success: false, message: 'Network error' })
    } finally {
      setPending(null)
    }
  }

  return (
    <>
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="material-symbols-outlined text-secondary text-[20px]">smart_button</span>
          <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Token Operations</h2>
          <span className="ml-auto text-caption text-on-surface-variant">UNITS protocol</span>
        </div>

        {result && (
          <div className={`flex items-start gap-3 p-3 rounded-xl mb-4 ${result.success ? 'bg-secondary-container/30 border border-secondary/20' : 'bg-error-container/30 border border-error/20'}`}>
            <span className={`material-symbols-outlined text-[18px] shrink-0 ${result.success ? 'text-secondary' : 'text-error'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {result.success ? 'check_circle' : 'error'}
            </span>
            <p className="text-caption text-on-surface">{result.message}</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {OPERATIONS.map(({ op, label, description, icon, allowedFrom, style }) => {
            const enabled = allowedFrom.includes(currentStatus)
            return (
              <button
                key={op}
                disabled={!enabled || pending !== null}
                onClick={() => { setModal(op); setResult(null) }}
                className={`flex flex-col items-start gap-2 p-4 rounded-xl border transition-all ${
                  enabled
                    ? `${style} cursor-pointer`
                    : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant/30 cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
                <div>
                  <p className="text-label-caps font-bold">{label}</p>
                  <p className="text-[10px] leading-tight opacity-70">{description}</p>
                </div>
              </button>
            )
          })}
        </div>

        <p className="text-[11px] text-on-surface-variant mt-4">
          Available operations depend on current token status ({currentStatus}).
          All operations are permanently recorded on the UNITS ledger.
        </p>
      </div>

      {/* Operation modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">token</span>
                <h3 className="text-label-caps font-bold text-on-surface tracking-widest">CONFIRM — {modal}</h3>
              </div>
              <button onClick={() => setModal(null)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-caption text-on-surface-variant">
              This operation will be permanently recorded on the UNITS ledger. Confirm the details below.
            </p>

            {(modal === 'TRANSFER') && (
              <div>
                <label className="text-label-caps text-on-surface-variant block mb-1.5">Recipient Address</label>
                <input
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="LIUM-wallet-address or entity name"
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container text-on-surface text-caption focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            {(['LOCK', 'PLEDGE', 'REDEEM'].includes(modal)) && (
              <div>
                <label className="text-label-caps text-on-surface-variant block mb-1.5">Amount (₹ Mn)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Optional — leave blank for full token"
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container text-on-surface text-caption focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            <div>
              <label className="text-label-caps text-on-surface-variant block mb-1.5">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Internal memo for this operation"
                className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container text-on-surface text-caption focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-3 rounded-xl border border-outline-variant text-on-surface text-label-caps font-bold hover:bg-surface-container transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => execute(modal)}
                disabled={pending !== null}
                className="flex-1 py-3 rounded-xl bg-primary text-on-primary text-label-caps font-bold hover:opacity-90 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {pending === modal ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    Confirming…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    Confirm {modal}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
