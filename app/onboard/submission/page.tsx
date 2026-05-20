'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Stepper } from '@/components/onboard/stepper'
import { useAuth } from '@/components/auth/auth-context'
import type { Project } from '@/types'

export default function SubmissionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { token: authToken } = useAuth()
  const id = searchParams.get('id') ?? ''

  const [project, setProject] = useState<Project | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !authToken) return
    fetch(`/api/projects/${id}`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(r => r.json())
      .then(json => { if (json.ok) setProject(json.data) })
      .catch(() => {})
  }, [id, authToken])

  async function handleSubmit() {
    if (!id || !authToken) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ status: 'SUBMITTED' }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error?.message ?? 'Submission failed')
      router.push(`/projects/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setSubmitting(false)
    }
  }

  const fmt = (d: string | undefined) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null

  const summaryRows = project
    ? [
        { label: 'Asset',               value: project.name,                                   icon: 'battery_charging_full' },
        { label: 'Project Type',        value: project.assetType?.replace(/_/g, ' ') ?? '—',  icon: 'bolt' },
        { label: 'Location',            value: project.location,                               icon: 'location_on' },
        { label: 'Grid Network',        value: project.jurisdiction ?? '—',                    icon: 'hub' },
        ...(project.financials?.assetMake
          ? [{ label: 'Manufacturer',   value: `${project.financials.assetMake}${project.financials.assetModel ? ' · ' + project.financials.assetModel : ''}`, icon: 'factory' }]
          : []),
        ...(project.financials?.assetUnitCount != null
          ? [{ label: 'No. of Units',   value: String(project.financials.assetUnitCount),      icon: 'stacks' }]
          : []),
        ...(project.financials?.constructionStartDate
          ? [{ label: 'Construction Start', value: fmt(project.financials.constructionStartDate)!, icon: 'construction' }]
          : []),
        ...(project.financials?.codDate
          ? [{ label: 'Commissioning Date', value: fmt(project.financials.codDate)!,           icon: 'event_available' }]
          : []),
        ...(project.financials?.totalCapexM != null
          ? [{ label: 'Total CAPEX',    value: `$${project.financials.totalCapexM}M`,          icon: 'payments' }]
          : []),
        ...(project.financials?.quarterlyFundingAskM != null
          ? [{ label: 'Quarterly Ask',  value: `$${project.financials.quarterlyFundingAskM}M/qtr`, icon: 'request_quote' }]
          : []),
        ...(project.financials?.annualRevenueM != null
          ? [{ label: 'Annual Revenue', value: `$${project.financials.annualRevenueM}M/yr`,    icon: 'trending_up' }]
          : []),
        { label: 'Telemetry', value: project.telemetry?.verified ? `${project.telemetry.connectionMethod} · Verified` : 'Pre-commissioning · Available at COD', icon: 'sensors' },
      ]
    : [{ label: 'Asset', value: 'Loading…', icon: 'battery_charging_full' }]

  return (
    <div className="py-gutter space-y-8 max-w-3xl">
      <Stepper currentStep={5} projectId={id} skippedSteps={project && !project.telemetry?.apiEndpoint ? [3] : []} />

      <div>
        <h1 className="text-display-lg text-on-surface">Review & Submit</h1>
        <p className="text-body-base text-on-surface-variant mt-1">
          Confirm your asset details. Once submitted you can publish to financiers from your project page.
        </p>
      </div>

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
              <dt className="text-caption text-on-surface-variant w-36 shrink-0">{label}</dt>
              <dd className="text-caption text-on-surface font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* What happens next */}
      <div className="bg-secondary/5 border border-secondary/20 rounded-xl px-5 py-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[18px]">info</span>
          <p className="text-caption font-bold text-on-surface">What happens after submission</p>
        </div>
        <ol className="space-y-2 ml-6">
          {[
            'Your project status moves to Submitted',
            'From your project page, click "Find Financing" to publish to financiers',
            'Financiers review your asset and submit loan offers',
            'You review and accept the best offer',
            'Once PTO is approved, publish for securitisation',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-caption text-on-surface-variant">
              <span className="text-secondary font-bold shrink-0">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-error/5 border border-error/20 rounded-lg">
          <span className="material-symbols-outlined text-error text-[16px]">error</span>
          <p className="text-caption text-error">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30">
        <Link
          href={`/onboard/credit-pack${id ? `?id=${id}` : ''}`}
          className="flex items-center gap-2 text-label-caps text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Credit Pack
        </Link>

        <button
          onClick={handleSubmit}
          disabled={submitting || !authToken || !project}
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
        >
          {submitting ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              Submitting…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Submit Project
            </>
          )}
        </button>
      </div>
    </div>
  )
}
