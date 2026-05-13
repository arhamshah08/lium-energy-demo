import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getProjectById } from '@/lib/store'
import { StatusBadge } from '@/components/ui/badge'
import type { AssetType, DocumentRecord, ProjectStatus } from '@/types'

export const dynamic = 'force-dynamic'

const ASSET_META: Record<AssetType, { label: string; icon: string }> = {
  BESS:        { label: 'Battery Energy Storage System', icon: 'battery_charging_full' },
  MICROGRID:   { label: 'Microgrid',                     icon: 'grid_view' },
  DER_CLUSTER: { label: 'DER Cluster',                   icon: 'hub' },
}

const DOC_LABELS: Record<DocumentRecord['type'], string> = {
  TECHNICAL_AUDIT:        'Technical Audit Report',
  PPA_AGREEMENT:          'PPA Agreement',
  INTERCONNECTION_STUDY:  'Interconnection Study',
  INSURANCE_CERTIFICATE:  'Insurance Certificate',
}

function nextOnboardHref(status: ProjectStatus, id: string): string | null {
  if (status === 'DRAFT')              return `/onboard/document-vault?id=${id}`
  if (status === 'DOCUMENTS_PENDING')  return `/onboard/telemetry?id=${id}`
  if (status === 'TELEMETRY_PENDING')  return `/onboard/telemetry?id=${id}`
  return null
}

function nextOnboardLabel(status: ProjectStatus): string {
  if (status === 'DRAFT')             return 'Upload Documents'
  if (status === 'DOCUMENTS_PENDING') return 'Connect Telemetry'
  return 'Verify Telemetry'
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ new?: string }>
}) {
  const { id } = await params
  const { new: isNew } = await searchParams
  const project = await getProjectById(id)

  if (!project) redirect('/projects')

  const { label: assetLabel, icon: assetIcon } = ASSET_META[project.assetType]
  const continueHref = nextOnboardHref(project.status, id)
  const isSubmitted = project.status === 'SUBMITTED'

  return (
    <div className="py-gutter space-y-8 max-w-5xl">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-caption text-on-surface-variant">
        <Link href="/projects" className="hover:text-on-surface transition-colors">Asset Registry</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium truncate">{project.name}</span>
      </nav>

      {/* Success banner */}
      {isNew && (
        <div className="flex items-start gap-4 p-5 bg-secondary-container/30 border border-secondary/20 rounded-xl">
          <span
            className="material-symbols-outlined text-secondary text-[28px] shrink-0 mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <div className="flex-1">
            <p className="font-bold text-on-surface mb-0.5">Asset successfully onboarded</p>
            <p className="text-caption text-on-surface-variant">
              Your project is now live on the LIUM network. Telemetry data will be ingested within the next few minutes.
            </p>
          </div>
          <Link
            href="/projects"
            className="text-label-caps text-secondary hover:underline shrink-0 mt-0.5"
          >
            View all
          </Link>
        </div>
      )}

      {/* Hero header */}
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-xl bg-secondary-container/40 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[32px] text-secondary">{assetIcon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-headline-md text-on-surface font-bold">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-body-base text-on-surface-variant">{assetLabel} · {project.jurisdiction}</p>
        </div>
        {continueHref && (
          <Link
            href={continueHref}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm shrink-0"
          >
            {nextOnboardLabel(project.status)}
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left column ── */}
        <div className="space-y-6">

          {/* Project overview */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card">
            <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-[20px]">info</span>
              <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Project Overview</h2>
            </div>
            <dl className="divide-y divide-outline-variant/30">
              {[
                { label: 'Asset Type',    value: assetLabel,         icon: assetIcon },
                { label: 'Jurisdiction',  value: project.jurisdiction, icon: 'lan' },
                { label: 'Location',      value: project.location || '—', icon: 'location_on' },
                {
                  label: 'Created',
                  value: new Date(project.createdAt).toLocaleDateString('en-US', {
                    weekday: 'short', year: 'numeric', month: 'long', day: 'numeric',
                  }),
                  icon: 'calendar_today',
                },
                {
                  label: 'Last Updated',
                  value: new Date(project.updatedAt).toLocaleDateString('en-US', {
                    weekday: 'short', year: 'numeric', month: 'long', day: 'numeric',
                  }),
                  icon: 'update',
                },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-center gap-4 px-6 py-3.5">
                  <span className="material-symbols-outlined text-outline text-[16px] shrink-0">{icon}</span>
                  <dt className="text-caption text-on-surface-variant w-32 shrink-0">{label}</dt>
                  <dd className="text-caption text-on-surface font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Telemetry */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card">
            <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-[20px]">sensors</span>
              <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Telemetry</h2>
            </div>
            {project.telemetry ? (
              <div className="p-6 space-y-4">
                <dl className="space-y-3">
                  {[
                    { label: 'Method',   value: project.telemetry.connectionMethod.replace(/_/g, ' ') },
                    { label: 'Endpoint', value: project.telemetry.apiEndpoint },
                    { label: 'Asset ID', value: project.telemetry.assetIdMapping || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <dt className="text-caption text-on-surface-variant w-20 shrink-0 pt-0.5">{label}</dt>
                      <dd className="text-caption text-on-surface font-medium break-all">{value}</dd>
                    </div>
                  ))}
                </dl>
                {project.telemetry.verified && (
                  <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/30">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-60" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
                    </span>
                    <span className="text-label-caps text-secondary font-bold">Live · Connected</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 flex flex-col items-center text-center py-10">
                <span className="material-symbols-outlined text-[32px] text-outline mb-3">sensors_off</span>
                <p className="text-caption text-on-surface-variant mb-4">No telemetry configured yet</p>
                {continueHref && (
                  <Link
                    href={`/onboard/telemetry?id=${id}`}
                    className="text-label-caps text-primary hover:underline"
                  >
                    Configure now →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-6">

          {/* Documents */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card">
            <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">shield_lock</span>
                <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Documents</h2>
              </div>
              <span className="text-caption text-on-surface-variant">
                {project.documents.length} uploaded
              </span>
            </div>
            {project.documents.length > 0 ? (
              <ul className="divide-y divide-outline-variant/30">
                {project.documents.map((doc, i) => (
                  <li key={i} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-9 h-9 rounded-lg bg-primary-fixed/50 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-white-fixed-variant">description</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-caption font-bold text-on-surface truncate">
                        {DOC_LABELS[doc.type] ?? doc.type}
                      </p>
                      <p className="text-[11px] text-on-surface-variant truncate">{doc.filename}</p>
                    </div>
                    <span
                      className="material-symbols-outlined text-secondary text-[18px] shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 flex flex-col items-center text-center py-10">
                <span className="material-symbols-outlined text-[32px] text-outline mb-3">upload_file</span>
                <p className="text-caption text-on-surface-variant mb-4">No documents uploaded yet</p>
                {project.status === 'DRAFT' && (
                  <Link
                    href={`/onboard/document-vault?id=${id}`}
                    className="text-label-caps text-primary hover:underline"
                  >
                    Upload documents →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Submitted state */}
          {isSubmitted && (
            <div className="bg-secondary-container/20 rounded-xl border border-secondary/20 p-6 flex flex-col items-center text-center">
              <span
                className="material-symbols-outlined text-secondary text-[48px] mb-3"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              <p className="font-bold text-on-surface mb-1">Live on LIUM Network</p>
              <p className="text-caption text-on-surface-variant">
                This asset is fully onboarded and active. Telemetry data is being ingested in real time.
              </p>
            </div>
          )}

          {/* Onboarding progress (non-submitted) */}
          {!isSubmitted && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card">
              <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">linear_scale</span>
                <h2 className="text-label-caps font-bold text-on-surface tracking-widest">Onboarding Progress</h2>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { step: 1, label: 'Project Details',   done: true },
                  { step: 2, label: 'Document Vault',    done: project.status !== 'DRAFT' },
                  { step: 3, label: 'Telemetry Link',    done: project.status === 'SUBMITTED' },
                ].map(({ step, label, done }) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      done ? 'bg-secondary text-white' : 'bg-outline-variant/40 text-on-surface-variant'
                    }`}>
                      {done
                        ? <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                        : <span className="text-[11px] font-bold">{step}</span>
                      }
                    </div>
                    <span className={`text-caption font-medium ${done ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              {continueHref && (
                <div className="px-6 pb-6">
                  <Link
                    href={continueHref}
                    className="flex w-full items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all"
                  >
                    Continue: {nextOnboardLabel(project.status)}
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
