'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Stepper } from '@/components/onboard/stepper'
import type { Token } from '@/types'

const SUMMARY_ROWS = [
  { label: 'Asset',            value: 'GUVNL BESS — Bhuj Substation', icon: 'battery_charging_full' },
  { label: 'Capacity',         value: '100 MW / 200 MWh (2-hour duration)', icon: 'bolt' },
  { label: 'Location',         value: 'Kutch, Gujarat, India', icon: 'location_on' },
  { label: 'Telemetry',        value: 'IEEE 2030.5 · Latency 8ms · Verified', icon: 'sensors' },
  { label: 'BESPA Revenue',    value: '₹271.18 Mn/year (GUVNL AA+)', icon: 'receipt_long' },
  { label: 'Token Nominal',    value: '₹1,799 Mn (75% LTV)',          icon: 'token' },
  { label: 'Token ID',         value: 'UNITS-IN-BESS-2026-001',       icon: 'tag' },
  { label: 'LQ Score',         value: '0.944 (Gate: PASS)',            icon: 'monitoring' },
  { label: 'Pool',             value: 'LIUM Pool 2026-01',            icon: 'hub' },
]

const TRANCHE_PREVIEW = [
  { class: 'SENIOR',     rating: 'AAA',  size: 816,  coupon: 8.5,  tenor: 12, color: 'bg-secondary' },
  { class: 'MEZZANINE',  rating: 'BBB',  size: 594,  coupon: 11.0, tenor: 10, color: 'bg-primary' },
  { class: 'JUNIOR',     rating: 'BB',   size: 389,  coupon: 14.0, tenor: 8,  color: 'bg-tertiary' },
]

export default function SubmissionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get('id') ?? ''

  const [issuing, setIssuing] = useState(false)
  const [issued, setIssued] = useState(false)
  const [issuedToken, setIssuedToken] = useState<Token | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleIssue() {
    setIssuing(true)
    setError(null)

    try {
      // Issue the UNITS token
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: id || 'project-guvnl-bess-001',
          nominalValueINR: 1799,
          issuedTo: 'LIUM Pool 2026-01',
        }),
      })

      const json = await res.json()
      if (!json.ok) throw new Error(json.error?.message ?? 'Token issuance failed')

      const token: Token = json.data
      setIssuedToken(token)

      // Update project status to TOKENISED if we have a project ID
      if (id) {
        await fetch(`/api/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'TOKENISED' }),
        })
      }

      setIssued(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIssuing(false)
    }
  }

  if (issued && issuedToken) {
    return (
      <div className="py-gutter max-w-3xl mx-auto">
        <div className="flex flex-col items-center text-center py-16 space-y-6">
          <div className="w-24 h-24 rounded-2xl bg-secondary-container/40 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-[48px] text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >verified</span>
          </div>
          <div>
            <h1 className="text-display-lg text-on-surface">Token Issued</h1>
            <p className="text-body-base text-on-surface-variant mt-2">
              {issuedToken.tokenId} has been minted on the LIUM Finternet network
            </p>
          </div>

          <div className="w-full bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card divide-y divide-outline-variant/20 text-left">
            {[
              { label: 'Token ID',      value: issuedToken.tokenId },
              { label: 'Tx Hash',       value: issuedToken.operations[0]?.txHash ?? '—' },
              { label: 'Operation',     value: 'ISSUE' },
              { label: 'Nominal Value', value: `₹${issuedToken.nominalValueINR.toLocaleString()} Mn` },
              { label: 'Pool',          value: issuedToken.issuedTo },
              { label: 'Status',        value: 'CONFIRMED' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-3.5">
                <dt className="text-caption text-on-surface-variant w-36 shrink-0">{label}</dt>
                <dd className="text-caption text-on-surface font-medium font-mono break-all">{value}</dd>
              </div>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            <Link
              href={`/tokenise/${issuedToken.id}`}
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">token</span>
              View Token
            </Link>
            <Link
              href="/tokenise"
              className="inline-flex items-center gap-2 bg-surface-container border border-outline-variant text-on-surface px-8 py-3 rounded-lg text-label-caps font-bold hover:bg-surface-container-high transition-all"
            >
              Token Registry
            </Link>
            <Link
              href="/securities"
              className="inline-flex items-center gap-2 bg-surface-container border border-outline-variant text-on-surface px-8 py-3 rounded-lg text-label-caps font-bold hover:bg-surface-container-high transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">hub</span>
              Securities Pools
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-gutter space-y-8 max-w-5xl">
      <Stepper currentStep={5} projectId={id} />

      <div>
        <h1 className="text-display-lg text-on-surface">Submission Review</h1>
        <p className="text-body-base text-on-surface-variant mt-1">
          Review all onboarded data before issuing the UNITS security token
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset summary */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-[20px]">summarize</span>
            <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Asset Summary</h2>
          </div>
          <dl className="divide-y divide-outline-variant/20">
            {SUMMARY_ROWS.map(({ label, value, icon }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-3">
                <span className="material-symbols-outlined text-outline text-[16px] shrink-0">{icon}</span>
                <dt className="text-caption text-on-surface-variant w-32 shrink-0">{label}</dt>
                <dd className="text-caption text-on-surface font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-6">
          {/* Tranche preview */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-[20px]">stacked_bar_chart</span>
              <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Tranche Structure</h2>
            </div>
            {/* Stacked bar */}
            <div className="px-6 py-4">
              <div className="flex h-8 rounded-lg overflow-hidden mb-4">
                {TRANCHE_PREVIEW.map(t => (
                  <div
                    key={t.class}
                    className={`${t.color} flex items-center justify-center`}
                    style={{ width: `${(t.size / 1799) * 100}%` }}
                    title={`${t.class} ₹${t.size} Mn`}
                  >
                    <span className="text-[10px] font-bold text-white">{t.rating}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {TRANCHE_PREVIEW.map(t => (
                  <div key={t.class} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-sm ${t.color} shrink-0`} />
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <span className="text-caption font-bold text-on-surface">{t.class}</span>
                        <span className="text-caption text-on-surface-variant ml-2">{t.rating}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-caption font-bold text-on-surface">₹{t.size} Mn</span>
                        <span className="text-caption text-on-surface-variant ml-2">{t.coupon}% / {t.tenor}yr</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Token issuance card */}
          <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>token</span>
              <div>
                <p className="font-bold text-on-surface">UNITS Token Issuance</p>
                <p className="text-caption text-on-surface-variant mt-0.5">
                  Executing the ISSUE operation mints a UNITS security token on the Finternet network.
                  Token ID will be permanently recorded on-chain.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl divide-y divide-outline-variant/20 text-sm">
              {[
                ['Token ID',   'UNITS-IN-BESS-2026-001'],
                ['Operation',  'ISSUE'],
                ['Amount',     '₹1,799 Mn (INR)'],
                ['Recipient',  'LIUM Pool 2026-01'],
                ['Network',    'LIUM Finternet v1'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-on-surface-variant w-20 shrink-0 text-caption">{k}</span>
                  <span className="text-on-surface font-medium text-caption">{v}</span>
                </div>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-error/5 border border-error/20 rounded-lg">
                <span className="material-symbols-outlined text-error text-[16px]">error</span>
                <p className="text-caption text-error">{error}</p>
              </div>
            )}

            <button
              onClick={handleIssue}
              disabled={issuing}
              className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-3.5 rounded-xl text-label-caps font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-70"
            >
              {issuing ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Issuing token on-chain…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">token</span>
                  Issue UNITS Token
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30">
        <Link
          href={`/onboard/credit-pack${id ? `?id=${id}` : ''}`}
          className="flex items-center gap-2 text-label-caps text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Credit Pack
        </Link>
      </div>
    </div>
  )
}
