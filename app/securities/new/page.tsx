'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { TrancheClass, TrancheRating } from '@/types'

const TRANCHE_DEFAULTS: Array<{
  class: TrancheClass
  rating: TrancheRating
  sizePct: number
  coupon: number
  tenor: number
  color: string
}> = [
  { class: 'SENIOR',    rating: 'AAA', sizePct: 45, coupon: 8.5,  tenor: 12, color: 'bg-secondary' },
  { class: 'MEZZANINE', rating: 'BBB', sizePct: 33, coupon: 11.0, tenor: 10, color: 'bg-primary' },
  { class: 'JUNIOR',    rating: 'BB',  sizePct: 22, coupon: 14.0, tenor: 8,  color: 'bg-tertiary' },
]

const RATINGS: TrancheRating[] = ['AAA', 'AA+', 'AA', 'A+', 'A', 'BBB', 'BB', 'B', 'NR']

export default function NewPoolPage() {
  const router = useRouter()
  const [poolName, setPoolName] = useState('LIUM Pool 2026-')
  const [totalSize, setTotalSize] = useState('1799')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [tranches, setTranches] = useState(
    TRANCHE_DEFAULTS.map(t => ({
      class: t.class,
      rating: t.rating,
      sizePct: t.sizePct,
      coupon: t.coupon,
      tenor: t.tenor,
      color: t.color,
    })),
  )

  function updateTranche(i: number, field: string, value: string | number) {
    setTranches(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t))
  }

  const total = parseFloat(totalSize) || 0
  const pctUsed = tranches.reduce((s, t) => s + t.sizePct, 0)

  async function handleCreate() {
    if (!poolName.trim()) { setError('Pool name is required'); return }
    if (total <= 0) { setError('Pool size must be > 0'); return }
    if (Math.abs(pctUsed - 100) > 1) { setError(`Tranche allocation must total 100% (currently ${pctUsed}%)`); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: poolName.trim(),
          tokenIds: [],
          tranches: tranches.map(t => ({
            class: t.class,
            rating: t.rating,
            sizeINR: Math.round((t.sizePct / 100) * total),
            coupon: t.coupon,
            tenorYears: t.tenor,
          })),
        }),
      })
      const json = await res.json()
      if (json.ok) {
        router.push(`/securities/${json.data.id}`)
      } else {
        setError(json.error?.message ?? 'Failed to create pool')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-gutter space-y-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-caption text-on-surface-variant">
        <Link href="/securities" className="hover:text-on-surface transition-colors">Securities Pools</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">New Pool</span>
      </nav>

      <div>
        <h1 className="text-display-lg text-on-surface">Structure Pool</h1>
        <p className="text-body-base text-on-surface-variant mt-1">
          Define pool name, total size, and tranche waterfall before listing to investors
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: form */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card p-6 space-y-5">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-[20px]">edit</span>
              <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Pool Details</h2>
            </div>

            <div>
              <label className="text-label-caps text-on-surface-variant block mb-1.5">Pool Name</label>
              <input
                value={poolName}
                onChange={e => setPoolName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container text-on-surface text-caption focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-label-caps text-on-surface-variant block mb-1.5">Total Pool Size (₹ Mn)</label>
              <input
                type="number"
                value={totalSize}
                onChange={e => setTotalSize(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container text-on-surface text-caption focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Tranches */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">stacked_bar_chart</span>
                <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Tranche Configuration</h2>
              </div>
              <span className={`text-label-caps font-bold ${Math.abs(pctUsed - 100) < 1 ? 'text-secondary' : 'text-error'}`}>
                {pctUsed}% allocated
              </span>
            </div>
            <div className="divide-y divide-outline-variant/20">
              {tranches.map((t, i) => (
                <div key={t.class} className="px-6 py-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm ${t.color}`} />
                    <span className="text-label-caps font-bold text-on-surface">{t.class}</span>
                    <span className="text-caption text-on-surface-variant ml-auto">
                      ₹{total > 0 ? Math.round((t.sizePct / 100) * total).toLocaleString() : '—'} Mn
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-on-surface-variant uppercase tracking-wide block mb-1">Rating</label>
                      <select
                        value={t.rating}
                        onChange={e => updateTranche(i, 'rating', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-outline-variant bg-surface-container text-on-surface text-caption focus:outline-none"
                      >
                        {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-on-surface-variant uppercase tracking-wide block mb-1">Allocation %</label>
                      <input
                        type="number"
                        value={t.sizePct}
                        onChange={e => updateTranche(i, 'sizePct', parseFloat(e.target.value) || 0)}
                        min={0} max={100}
                        className="w-full px-2 py-1.5 rounded-lg border border-outline-variant bg-surface-container text-on-surface text-caption focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-on-surface-variant uppercase tracking-wide block mb-1">Coupon %</label>
                      <input
                        type="number"
                        step="0.25"
                        value={t.coupon}
                        onChange={e => updateTranche(i, 'coupon', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 rounded-lg border border-outline-variant bg-surface-container text-on-surface text-caption focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-on-surface-variant uppercase tracking-wide block mb-1">Tenor (yr)</label>
                      <input
                        type="number"
                        value={t.tenor}
                        onChange={e => updateTranche(i, 'tenor', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 rounded-lg border border-outline-variant bg-surface-container text-on-surface text-caption focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: live preview */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-secondary text-[20px]">preview</span>
              <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Live Preview</h2>
            </div>

            {/* Stacked bar */}
            <div className="flex h-10 rounded-xl overflow-hidden mb-4">
              {tranches.map(t => (
                <div
                  key={t.class}
                  className={`${t.color} flex items-center justify-center transition-all`}
                  style={{ width: `${t.sizePct}%` }}
                >
                  <span className="text-[9px] font-bold text-white">{t.class.slice(0, 3)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {tranches.map(t => {
                const size = total > 0 ? Math.round((t.sizePct / 100) * total) : 0
                return (
                  <div key={t.class} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-sm ${t.color} shrink-0`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-caption font-bold text-on-surface">{t.class}</span>
                        <span className="text-caption text-on-surface-variant">{t.rating} · {t.coupon}% · {t.tenor}yr</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-on-surface-variant">{t.sizePct}% allocation</span>
                        <span className="text-[11px] font-bold text-on-surface">₹{size.toLocaleString()} Mn</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-outline-variant/20 mt-4 pt-4 flex items-center justify-between">
              <span className="text-caption text-on-surface-variant">Total Pool Size</span>
              <span className="text-data-point font-bold text-on-surface">₹{parseFloat(totalSize || '0').toLocaleString()} Mn</span>
            </div>
          </div>

          {error && (
            <div className="bg-error-container/30 border border-error/20 rounded-xl p-4">
              <p className="text-caption text-error">{error}</p>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-4 rounded-xl text-label-caps font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-70 text-base"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                Creating Pool…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">hub</span>
                Create Securitisation Pool
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
