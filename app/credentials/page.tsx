'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const LICENSES = [
  { id: 'ferc',    label: 'FERC Market Authorization',       icon: 'electric_meter',   desc: 'Wholesale market-based rate authority' },
  { id: 'puc',     label: 'State PUC / Interconnection',     icon: 'cell_tower',       desc: 'State operating & interconnection permit' },
  { id: 'epc',     label: 'EPC Contractor License',          icon: 'construction',     desc: 'Engineering, Procurement & Construction' },
  { id: 'nerc',    label: 'NERC Certification',              icon: 'verified_user',    desc: 'Bulk Electric System reliability' },
  { id: 'iso_rto', label: 'ISO / RTO Membership',            icon: 'hub',              desc: 'Registered market participant' },
]

const ACCREDITATIONS = [
  { id: 'nabcep',      label: 'NABCEP Certified',            icon: 'solar_power',         desc: 'North American Board of Certified Energy Practitioners' },
  { id: 'ieee_2030_5', label: 'IEEE 2030.5 Compliance',      icon: 'settings_remote',     desc: 'Smart Energy Profile compliant DER client' },
  { id: 'ul_9540',     label: 'UL 9540 Certified',           icon: 'battery_charging_full', desc: 'BESS safety standard certification' },
  { id: 'iec_62619',   label: 'IEC 62619 Compliance',        icon: 'shield',              desc: 'Secondary lithium cells safety' },
  { id: 'iso_9001',    label: 'ISO 9001 Quality',            icon: 'workspace_premium',   desc: 'Quality management systems' },
]

const ISO_OPTIONS   = ['CAISO', 'ERCOT', 'PJM', 'MISO', 'SPP', 'NYISO', 'ISO-NE']
const STATUS_OPTS   = ['Operating', 'Under Construction', 'Developed & Sold', 'Permitted']
const ASSET_TYPES   = ['BESS', 'Solar PV', 'Wind', 'Solar+BESS', 'Microgrid', 'DER Cluster']

type PastProject = { name: string; assetType: string; capacityMW: string; state: string; status: string; codYear: string }

const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container text-on-surface text-caption focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-colors'

function BadgeGrid({
  items,
  selected,
  onToggle,
}: {
  items: { id: string; label: string; icon: string; desc: string }[]
  selected: string[]
  onToggle: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map(({ id, label, icon, desc }) => {
        const active = selected.includes(id)
        return (
          <button
            key={id}
            type="button"
            onClick={() => onToggle(id)}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border text-left transition-all',
              active
                ? 'border-secondary bg-secondary-container/20 shadow-sm'
                : 'border-outline-variant/60 bg-surface-container hover:border-secondary/40 hover:bg-surface-container-low',
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors',
              active ? 'bg-secondary text-on-secondary' : 'bg-surface-container-high text-on-surface-variant',
            )}>
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn('text-caption font-bold transition-colors', active ? 'text-on-surface' : 'text-on-surface-variant')}>{label}</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">{desc}</p>
            </div>
            <span
              className={cn('material-symbols-outlined text-[18px] shrink-0 mt-0.5 transition-all', active ? 'text-secondary' : 'text-outline-variant/30')}
              style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
            >
              {active ? 'verified' : 'check_circle'}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function SectionCard({ icon, title, count, total, children }: { icon: string; title: string; count?: number; total?: number; children: React.ReactNode }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center gap-3">
        <span className="material-symbols-outlined text-secondary text-[20px]">{icon}</span>
        <h2 className="text-label-caps font-bold text-on-surface tracking-widest flex-1">{title}</h2>
        {count !== undefined && total !== undefined && (
          <span className={cn('text-label-caps font-bold', count === total ? 'text-secondary' : 'text-on-surface-variant')}>
            {count}/{total}
          </span>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

export default function CredentialsPage() {
  const [saved, setSaved]               = useState(false)
  const [licenses, setLicenses]         = useState<string[]>([])
  const [accreds, setAccreds]           = useState<string[]>([])
  const [isoRto, setIsoRto]             = useState('')
  const [duns, setDuns]                 = useState('')
  const [ein, setEin]                   = useState('')
  const [yearsOps, setYearsOps]         = useState('')
  const [annualRevenue, setAnnualRevenue] = useState('')
  const [ebitdaPct, setEbitdaPct]       = useState('')
  const [totalMW, setTotalMW]           = useState('')
  const [pastProjects, setPastProjects] = useState<PastProject[]>([
    { name: '', assetType: 'BESS', capacityMW: '', state: '', status: 'Operating', codYear: '' },
  ])

  function toggleItem(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    return (id: string) => setter(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function updatePP(i: number, field: keyof PastProject, val: string) {
    setPastProjects(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p))
  }

  const totalChecks  = LICENSES.length + ACCREDITATIONS.length
  const checkedCount = licenses.length + accreds.length
  const profileFields = [duns, ein, yearsOps, annualRevenue].filter(Boolean).length
  const namedProjects = pastProjects.filter(p => p.name.trim()).length
  const trustScore = Math.min(
    Math.round(((checkedCount / totalChecks) * 55) + (profileFields / 4) * 25 + Math.min(namedProjects * 5, 20)),
    100,
  )
  const circumference = 2 * Math.PI * 60

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="py-gutter space-y-8 max-w-5xl">

      {/* ── Trust Score Hero ── */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">

          {/* Gauge */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg width="152" height="152" viewBox="0 0 152 152" className="-rotate-90">
              <circle cx="76" cy="76" r="60" fill="none" stroke="#e2e8f0" strokeWidth="12" />
              <circle
                cx="76" cy="76" r="60"
                fill="none"
                stroke={trustScore >= 60 ? '#0D9488' : trustScore >= 30 ? '#2563EB' : '#D97706'}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - trustScore / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <p className="text-[30px] font-bold text-on-surface leading-none">{trustScore}</p>
              <p className="text-label-caps text-secondary mt-1">TRUST</p>
            </div>
          </div>

          {/* Summary */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-display-lg text-on-surface">Credential Portfolio</h1>
                <p className="text-body-base text-on-surface-variant mt-0.5">
                  Verified by institutional counterparties on the LIUM network
                </p>
              </div>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm shrink-0"
              >
                {saved ? (
                  <><span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>Saved</>
                ) : (
                  <><span className="material-symbols-outlined text-[16px]">save</span>Save</>
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-secondary-container/25 rounded-xl p-4 text-center">
                <p className="text-[28px] font-bold text-secondary leading-none">{licenses.length}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wide mt-1">Licenses</p>
              </div>
              <div className="bg-primary/5 rounded-xl p-4 text-center">
                <p className="text-[28px] font-bold text-primary leading-none">{accreds.length}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wide mt-1">Accreditations</p>
              </div>
              <div className="bg-tertiary/5 rounded-xl p-4 text-center">
                <p className="text-[28px] font-bold text-tertiary leading-none">{namedProjects}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wide mt-1">Projects</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-on-surface-variant">Profile completeness</span>
                <span className="text-[11px] font-bold text-on-surface">{trustScore}%</span>
              </div>
              <div className="h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full transition-all duration-500"
                  style={{ width: `${trustScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Regulatory Licenses ── */}
      <SectionCard icon="gavel" title="Regulatory Licenses" count={licenses.length} total={LICENSES.length}>
        <div className="space-y-4">
          <BadgeGrid items={LICENSES} selected={licenses} onToggle={toggleItem(setLicenses)} />
          {licenses.includes('iso_rto') && (
            <div className="mt-4">
              <label className="text-label-caps text-on-surface-variant block mb-1.5">ISO / RTO Market</label>
              <select value={isoRto} onChange={e => setIsoRto(e.target.value)} className={inputCls}>
                <option value="">Select market…</option>
                {ISO_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── Developer Accreditations ── */}
      <SectionCard icon="workspace_premium" title="Developer Accreditations" count={accreds.length} total={ACCREDITATIONS.length}>
        <BadgeGrid items={ACCREDITATIONS} selected={accreds} onToggle={toggleItem(setAccreds)} />
      </SectionCard>

      {/* ── Company Details ── */}
      <SectionCard icon="corporate_fare" title="Company Details">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Years in Operation',    value: yearsOps,       set: setYearsOps,       placeholder: '12',          type: 'number' },
            { label: 'D-U-N-S Number',        value: duns,           set: setDuns,           placeholder: '123456789',   type: 'text' },
            { label: 'EIN / Federal Tax ID',  value: ein,            set: setEin,            placeholder: 'XX-XXXXXXX', type: 'text' },
          ].map(({ label, value, set, placeholder, type }) => (
            <div key={label}>
              <label className="text-label-caps text-on-surface-variant block mb-1.5">{label}</label>
              <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder} className={inputCls} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Financial Track Record ── */}
      <SectionCard icon="bar_chart" title="Financial Track Record">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Annual Revenue ($M)',          value: annualRevenue, set: setAnnualRevenue, placeholder: '45',  icon: 'payments' },
            { label: 'EBITDA Margin (%)',             value: ebitdaPct,     set: setEbitdaPct,     placeholder: '38',  icon: 'percent' },
            { label: 'Total Capacity Developed (MW)', value: totalMW,       set: setTotalMW,       placeholder: '420', icon: 'bolt' },
          ].map(({ label, value, set, placeholder, icon }) => (
            <div key={label} className="bg-surface-container-low rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-secondary text-[16px]">{icon}</span>
                <label className="text-label-caps text-on-surface-variant">{label}</label>
              </div>
              <input
                type="number" min="0" value={value}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                className={inputCls}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Past Projects ── */}
      <SectionCard icon="history_edu" title="Past Projects">
        <div className="space-y-4">
          {pastProjects.map((p, i) => (
            <div key={i} className="bg-surface-container rounded-xl p-5 space-y-4 border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="text-label-caps font-bold text-on-surface-variant">Project {i + 1}</span>
                {pastProjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setPastProjects(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-on-surface-variant hover:text-error transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="col-span-2 sm:col-span-3">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">Project Name</label>
                  <input type="text" value={p.name} onChange={e => updatePP(i, 'name', e.target.value)} placeholder="Mojave BESS Phase II" className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">Asset Type</label>
                  <select value={p.assetType} onChange={e => updatePP(i, 'assetType', e.target.value)} className={inputCls}>
                    {ASSET_TYPES.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">Capacity (MW)</label>
                  <input type="number" min="0" value={p.capacityMW} onChange={e => updatePP(i, 'capacityMW', e.target.value)} placeholder="150" className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">State</label>
                  <input type="text" value={p.state} onChange={e => updatePP(i, 'state', e.target.value)} placeholder="California" className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">Status</label>
                  <select value={p.status} onChange={e => updatePP(i, 'status', e.target.value)} className={inputCls}>
                    {STATUS_OPTS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">COD Year</label>
                  <input type="number" min="2000" max="2030" value={p.codYear} onChange={e => updatePP(i, 'codYear', e.target.value)} placeholder="2023" className={inputCls} />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setPastProjects(prev => [...prev, { name: '', assetType: 'BESS', capacityMW: '', state: '', status: 'Operating', codYear: '' }])}
            className="flex items-center gap-2 text-caption font-bold text-secondary hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Add Project
          </button>
        </div>
      </SectionCard>

    </div>
  )
}
