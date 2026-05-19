'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Stepper } from '@/components/onboard/stepper'
import { useAuth } from '@/components/auth/auth-context'
import type { Token, Project } from '@/types'

const TRANCHE_PREVIEW = [
  { class: 'SENIOR',     rating: 'AAA',  pct: 45,  coupon: 8.5,  tenor: 12, color: 'bg-secondary' },
  { class: 'MEZZANINE',  rating: 'BBB',  pct: 33,  coupon: 11.0, tenor: 10, color: 'bg-primary' },
  { class: 'JUNIOR',     rating: 'BB',   pct: 22,  coupon: 14.0, tenor: 8,  color: 'bg-tertiary' },
]

export default function SubmissionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { token: authToken } = useAuth()
  const id = searchParams.get('id') ?? ''

  const [project, setProject] = useState<Project | null>(null)
  const [issuing, setIssuing] = useState(false)
  const [issued, setIssued] = useState(false)
  const [issuedToken, setIssuedToken] = useState<Token | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !authToken) return
    fetch(`/api/projects/${id}`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    })
      .then(r => r.json())
      .then(json => { if (json.ok) setProject(json.data) })
      .catch(() => {})
  }, [id, authToken])

  const nominalValue = 45

  const summaryRows = project
    ? [
        { label: 'Asset',    value: project.name,                        icon: 'battery_charging_full' },
        { label: 'Location', value: project.location,                    icon: 'location_on' },
        { label: 'Type',     value: project.assetType?.replace(/_/g, ' ') ?? '—', icon: 'bolt' },
        { label: 'Network',  value: project.jurisdiction ?? '—',         icon: 'hub' },
        { label: 'Telemetry',value: project.telemetry?.verified ? `${project.telemetry.connectionMethod} · Verified` : 'Not verified', icon: 'sensors' },
        { label: 'Token Nominal', value: `$${nominalValue}M (75% LTV)`, icon: 'token' },
        { label: 'LQ Score', value: '0.944 (Gate: PASS)',                icon: 'monitoring' },
      ]
    : [
        { label: 'Asset',         value: 'Loading…', icon: 'battery_charging_full' },
        { label: 'Token Nominal', value: `$${nominalValue}M (75% LTV)`, icon: 'token' },
        { label: 'LQ Score',      value: '0.944 (Gate: PASS)', icon: 'monitoring' },
      ]

  async function handleIssue() {
    setIssuing(true)
    setError(null)
    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          projectId: id || 'dev-proj-menlo-001',
          nominalValueINR: nominalValue,
          issuedTo: project?.name ?? 'LIUM Pool',
        }),
      })

      const json = await res.json()
      if (!json.ok) throw new Error(json.error?.message ?? 'Token issuance failed')

      const token: Token = json.data
      setIssuedToken(token)

      if (id) {
        await fetch(`/api/projects/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
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
              { label: 'Nominal Value', value: `$${issuedToken.nominalValueINR.toLocaleString()}M` },
              { label: 'Issued To',     value: issuedToken.issuedTo },
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

  const totalSize = nominalValue
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
            {summaryRows.map(({ label, value, icon }) => (
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
            <div className="px-6 py-4">
              <div className="flex h-8 rounded-lg overflow-hidden mb-4">
                {TRANCHE_PREVIEW.map(t => (
                  <div
                    key={t.class}
                    className={`${t.color} flex items-center justify-center`}
                    style={{ width: `${t.pct}%` }}
                    title={`${t.class} ${t.pct}%`}
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
                        <span className="text-caption font-bold text-on-surface">
                          ${Math.round((t.pct / 100) * totalSize)}M
                        </span>
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
                ['Asset',      project?.name ?? 'Loading…'],
                ['Operation',  'ISSUE'],
                ['Amount',     `$${nominalValue}M (USD)`],
                ['Recipient',  project?.name ?? 'LIUM Pool'],
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
              disabled={issuing || !authToken}
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
