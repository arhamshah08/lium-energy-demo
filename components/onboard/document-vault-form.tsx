'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-context'
import { projectsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DocumentRecord } from '@/types'

type DocSlot = {
  type: DocumentRecord['type']
  label: string
  icon: string
  hint: string
  required: boolean
}

const DOC_SLOTS: DocSlot[] = [
  { type: 'TECHNICAL_AUDIT',       label: 'TECHNICAL AUDIT',       icon: 'upload_file',  hint: 'PDF, MAX 50MB', required: true  },
  { type: 'PPA_AGREEMENT',         label: 'PPA AGREEMENT',         icon: 'contract',     hint: 'PDF, DOCX',     required: true  },
  { type: 'INTERCONNECTION_STUDY', label: 'INTERCONNECTION STUDY', icon: 'account_tree', hint: 'PDF',           required: false },
  { type: 'INSURANCE_CERTIFICATE', label: 'INSURANCE CERTIFICATE', icon: 'verified',     hint: 'PDF, PNG',      required: false },
]

const REGULATORY_LICENSES = [
  { id: 'ferc',    label: 'FERC Market Authorization' },
  { id: 'puc',     label: 'State PUC / Interconnection Approval' },
  { id: 'epc',     label: 'EPC Contractor License' },
  { id: 'nerc',    label: 'NERC Certification' },
  { id: 'iso_rto', label: 'ISO / RTO Membership' },
]

const ACCREDITATIONS = [
  { id: 'nabcep',      label: 'NABCEP Certified' },
  { id: 'ieee_2030_5', label: 'IEEE 2030.5 Compliance' },
  { id: 'ul_9540',     label: 'UL 9540 Certified (BESS Safety)' },
  { id: 'iec_62619',   label: 'IEC 62619 Compliance' },
  { id: 'iso_9001',    label: 'ISO 9001 Quality Management' },
]

const ISO_RTO_OPTIONS = ['CAISO', 'ERCOT', 'PJM', 'MISO', 'SPP', 'NYISO', 'ISO-NE']
const STATUS_OPTIONS = ['Operating', 'Under Construction', 'Developed & Sold', 'Permitted']

type PastProject = {
  name: string
  assetType: string
  capacityMW: string
  state: string
  status: string
  codYear: string
}

function CheckGroup({
  items,
  selected,
  onChange,
}: {
  items: { id: string; label: string }[]
  selected: string[]
  onChange: (id: string, checked: boolean) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map(({ id, label }) => (
        <label key={id} className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all',
          selected.includes(id)
            ? 'border-secondary bg-secondary-container/20 text-on-surface'
            : 'border-outline-variant bg-surface-container hover:border-secondary/40',
        )}>
          <input
            type="checkbox"
            className="sr-only"
            checked={selected.includes(id)}
            onChange={e => onChange(id, e.target.checked)}
          />
          <span className={cn(
            'material-symbols-outlined text-[18px]',
            selected.includes(id) ? 'text-secondary' : 'text-outline',
          )} style={{ fontVariationSettings: selected.includes(id) ? "'FILL' 1" : "'FILL' 0" }}>
            {selected.includes(id) ? 'check_box' : 'check_box_outline_blank'}
          </span>
          <span className="text-caption font-medium">{label}</span>
        </label>
      ))}
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-label-caps font-bold text-on-surface-variant tracking-widest mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container text-on-surface text-caption focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary'
const selectCls = inputCls

export function DocumentVaultForm({ projectId }: { projectId: string }) {
  const router = useRouter()
  const { token } = useAuth()

  const [files, setFiles] = useState<Record<string, File>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [licenses, setLicenses] = useState<string[]>([])
  const [accreditations, setAccreditations] = useState<string[]>([])
  const [isoRto, setIsoRto] = useState('')
  const [duns, setDuns] = useState('')
  const [ein, setEin] = useState('')
  const [yearsOps, setYearsOps] = useState('')
  const [annualRevenue, setAnnualRevenue] = useState('')
  const [ebitdaPct, setEbitdaPct] = useState('')
  const [totalProjectsMW, setTotalProjectsMW] = useState('')
  const [pastProjects, setPastProjects] = useState<PastProject[]>([
    { name: '', assetType: 'BESS', capacityMW: '', state: '', status: 'Operating', codYear: '' },
  ])

  function toggleCheck(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    return (id: string, checked: boolean) =>
      setter(prev => checked ? [...prev, id] : prev.filter(x => x !== id))
  }

  function handleFile(type: DocumentRecord['type'], fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) return
    setFiles(prev => ({ ...prev, [type]: file }))
  }

  function updatePastProject(i: number, field: keyof PastProject, value: string) {
    setPastProjects(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }

  function addPastProject() {
    setPastProjects(prev => [...prev, { name: '', assetType: 'BESS', capacityMW: '', state: '', status: 'Operating', codYear: '' }])
  }

  function removePastProject(i: number) {
    setPastProjects(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const missing = DOC_SLOTS.filter(s => s.required && !files[s.type])
    if (missing.length) { setError(`Required: ${missing.map(s => s.label).join(', ')}`); return }

    setSubmitting(true)
    const documents = Object.entries(files).map(([type, file]) => ({
      type: type as DocumentRecord['type'],
      filename: file.name,
    }))
    const res = await projectsApi.updateDocuments(projectId, { documents })
    setSubmitting(false)

    if (!res.ok) { setError(res.error.message); return }

    const projRes = await fetch(`/api/projects/${projectId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const projJson = await projRes.json()
    const isOperational = projJson.data?.financials?.assetDetails?.isOperational ?? true
    router.push(isOperational
      ? `/onboard/telemetry?id=${projectId}`
      : `/onboard/credit-pack?id=${projectId}`
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card>
        <CardBody className="space-y-8">

          {/* ── DOCUMENTS ── */}
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[26px]">shield_lock</span>
            <div>
              <h2 className="text-headline-md text-on-surface">Secure Document Vault</h2>
              <p className="text-caption text-on-surface-variant mt-0.5">Upload project documentation for due diligence review</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DOC_SLOTS.map(({ type, label, icon, hint, required }) => {
              const file = files[type]
              return (
                <div key={type} className="space-y-2">
                  <label className="block group cursor-pointer">
                    <p className="text-label-caps font-bold text-on-surface tracking-widest mb-2">
                      {label}
                      {required && <span className="text-error ml-1">*</span>}
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.docx,.png"
                      className="sr-only"
                      onChange={e => handleFile(type, e.target.files)}
                    />
                    <div className={cn(
                      'border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all min-h-[120px]',
                      file
                        ? 'border-secondary bg-secondary-container/10'
                        : 'border-outline-variant hover:border-secondary hover:bg-secondary-container/5',
                    )}>
                      {file ? (
                        <>
                          <span className="material-symbols-outlined text-secondary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          <p className="text-caption text-secondary font-bold truncate max-w-full px-2 text-center">{file.name}</p>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-outline group-hover:text-secondary mb-2">{icon}</span>
                          <p className="text-caption text-on-surface-variant text-center">
                            Drop file or <span className="text-secondary font-bold">browse</span>
                          </p>
                          <p className="text-caption text-outline mt-1">{hint}</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              )
            })}
          </div>

          {error && (
            <p className="text-caption text-error bg-error-container/30 px-4 py-3 rounded-lg">{error}</p>
          )}

          {/* ── CREDENTIALS DIVIDER ── */}
          <div className="border-t border-outline-variant/40 pt-2">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-[24px]">badge</span>
              <div>
                <h2 className="text-label-caps font-bold text-on-surface tracking-widest">CREDENTIALS</h2>
                <p className="text-caption text-on-surface-variant mt-0.5">Optional — helps capital partners assess developer track record</p>
              </div>
            </div>
          </div>

          {/* Regulatory Licenses */}
          <div className="rounded-xl bg-surface-container p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">gavel</span>
              <p className="text-label-caps font-bold text-on-surface tracking-widest">REGULATORY LICENSES</p>
            </div>
            <CheckGroup items={REGULATORY_LICENSES} selected={licenses} onChange={toggleCheck(setLicenses)} />
            {licenses.includes('iso_rto') && (
              <FieldRow label="ISO / RTO Membership">
                <select value={isoRto} onChange={e => setIsoRto(e.target.value)} className={selectCls}>
                  <option value="">Select market…</option>
                  {ISO_RTO_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </FieldRow>
            )}
          </div>

          {/* Developer Accreditations */}
          <div className="rounded-xl bg-surface-container p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
              <p className="text-label-caps font-bold text-on-surface tracking-widest">DEVELOPER ACCREDITATIONS</p>
            </div>
            <CheckGroup items={ACCREDITATIONS} selected={accreditations} onChange={toggleCheck(setAccreditations)} />
          </div>

          {/* Company Details */}
          <div className="rounded-xl bg-surface-container p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">corporate_fare</span>
              <p className="text-label-caps font-bold text-on-surface tracking-widest">COMPANY DETAILS</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FieldRow label="Years in Operation">
                <input type="number" min="0" value={yearsOps} onChange={e => setYearsOps(e.target.value)} placeholder="e.g. 12" className={inputCls} />
              </FieldRow>
              <FieldRow label="D-U-N-S Number">
                <input type="text" value={duns} onChange={e => setDuns(e.target.value)} placeholder="123456789" className={inputCls} />
              </FieldRow>
              <FieldRow label="EIN / Federal Tax ID">
                <input type="text" value={ein} onChange={e => setEin(e.target.value)} placeholder="XX-XXXXXXX" className={inputCls} />
              </FieldRow>
            </div>
          </div>

          {/* Financial Track Record */}
          <div className="rounded-xl bg-surface-container p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">bar_chart</span>
              <p className="text-label-caps font-bold text-on-surface tracking-widest">FINANCIAL TRACK RECORD</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FieldRow label="Annual Revenue ($M)">
                <input type="number" min="0" value={annualRevenue} onChange={e => setAnnualRevenue(e.target.value)} placeholder="e.g. 45" className={inputCls} />
              </FieldRow>
              <FieldRow label="EBITDA Margin (%)">
                <input type="number" min="0" max="100" value={ebitdaPct} onChange={e => setEbitdaPct(e.target.value)} placeholder="e.g. 38" className={inputCls} />
              </FieldRow>
              <FieldRow label="Total Capacity Developed (MW)">
                <input type="number" min="0" value={totalProjectsMW} onChange={e => setTotalProjectsMW(e.target.value)} placeholder="e.g. 420" className={inputCls} />
              </FieldRow>
            </div>
          </div>

          {/* Past Projects */}
          <div className="rounded-xl bg-surface-container p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">history_edu</span>
                <p className="text-label-caps font-bold text-on-surface tracking-widest">PAST PROJECTS</p>
              </div>
              <button type="button" onClick={addPastProject}
                className="flex items-center gap-1.5 text-caption font-bold text-secondary hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                Add Project
              </button>
            </div>

            <div className="space-y-4">
              {pastProjects.map((p, i) => (
                <div key={i} className="bg-surface-container-lowest rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Project {i + 1}</span>
                    {pastProjects.length > 1 && (
                      <button type="button" onClick={() => removePastProject(i)}
                        className="text-on-surface-variant hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="col-span-2 sm:col-span-3">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">Project Name</label>
                      <input type="text" value={p.name} onChange={e => updatePastProject(i, 'name', e.target.value)}
                        placeholder="Mojave BESS Phase II" className={inputCls} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">Asset Type</label>
                      <select value={p.assetType} onChange={e => updatePastProject(i, 'assetType', e.target.value)} className={selectCls}>
                        {['BESS', 'Solar PV', 'Wind', 'Solar+BESS', 'Microgrid', 'DER Cluster'].map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">Capacity (MW)</label>
                      <input type="number" min="0" value={p.capacityMW} onChange={e => updatePastProject(i, 'capacityMW', e.target.value)}
                        placeholder="150" className={inputCls} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">State</label>
                      <input type="text" value={p.state} onChange={e => updatePastProject(i, 'state', e.target.value)}
                        placeholder="California" className={inputCls} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">Status</label>
                      <select value={p.status} onChange={e => updatePastProject(i, 'status', e.target.value)} className={selectCls}>
                        {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">COD Year</label>
                      <input type="number" min="2000" max="2030" value={p.codYear} onChange={e => updatePastProject(i, 'codYear', e.target.value)}
                        placeholder="2023" className={inputCls} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </CardBody>

        <CardFooter>
          <Button type="button" variant="ghost" size="sm" className="gap-2"
            onClick={() => router.push(`/onboard/project-details?id=${projectId}`)}>
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            BACK TO DETAILS
          </Button>
          <Button type="submit" variant="secondary" loading={submitting} className="gap-2">
            NEXT: CONNECT TELEMETRY
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
