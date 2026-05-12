'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { projectsApi } from '@/lib/api'
import { LIUM_OPTIONS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Card, CardBody, CardFooter } from '@/components/ui/card'
import { MapPicker } from '@/components/onboard/map-picker'
import type { AssetType, Jurisdiction } from '@/types'

const JURISDICTION_OPTIONS = [
  { value: '', label: 'Select jurisdiction...' },
  { value: 'ERCOT', label: 'ERCOT (Texas)' },
  { value: 'PJM', label: 'PJM Interconnection' },
  { value: 'CAISO', label: 'CAISO (California)' },
  { value: 'MISO', label: 'MISO' },
]

const ACTOR_ROLE_OPTIONS = [
  { value: '', label: 'Select role...' },
  ...LIUM_OPTIONS.actorRoles.map((r) => ({ value: r, label: r })),
]

const ASSET_TYPES: { value: AssetType; label: string; subtitle: string; icon: string }[] = [
  { value: 'BESS', label: 'BESS', subtitle: 'Battery Energy Storage System', icon: 'battery_charging_full' },
  { value: 'MICROGRID', label: 'Microgrid', subtitle: 'Distributed Energy Resource Cluster', icon: 'grid_view' },
  { value: 'DER_CLUSTER', label: 'DER Cluster', subtitle: 'Multi-source distributed array', icon: 'hub' },
]

export function ProjectDetailsForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [jurisdiction, setJurisdiction] = useState('')
  const [assetType, setAssetType] = useState<AssetType | null>(null)
  const [actorRole, setActorRole] = useState('')
  const [revenueTypes, setRevenueTypes] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  function toggleRevenue(type: string) {
    setRevenueTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')

    const res = await projectsApi.create({
      name: name.trim() || 'Untitled Project',
      location,
      jurisdiction: (jurisdiction as Jurisdiction) || 'ERCOT',
      assetType: assetType ?? 'BESS',
      actorRole,
      revenueTypes,
    } as Parameters<typeof projectsApi.create>[0])

    setSubmitting(false)
    if (!res.ok) { setFormError(res.error.message); return }
    router.push(`/onboard/document-vault?id=${res.data.id}`)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card>
        <CardBody className="space-y-8">

          {/* Project Name */}
          <Input
            label="PROJECT NAME"
            placeholder="e.g. North Basin Solar Array"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Location */}
          <MapPicker value={location} onChange={setLocation} />

          {/* Jurisdiction */}
          <Select
            label="JURISDICTION"
            options={JURISDICTION_OPTIONS}
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
          />

          {/* Asset Type */}
          <div>
            <p className="text-label-caps font-bold text-on-surface tracking-widest mb-4">ASSET TYPE</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ASSET_TYPES.map(({ value, label, subtitle, icon }) => (
                <label
                  key={value}
                  className={`relative flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all
                    ${assetType === value
                      ? 'border-secondary bg-secondary-container/10'
                      : 'border-outline-variant hover:border-secondary/40'}`}
                >
                  <input
                    type="radio"
                    name="assetType"
                    className="sr-only"
                    checked={assetType === value}
                    onChange={() => setAssetType(value)}
                  />
                  <div className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all
                    ${assetType === value ? 'bg-secondary-container text-secondary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-[24px]">{icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">{label}</p>
                    <p className="text-caption text-on-surface-variant">{subtitle}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actor Role */}
          <Select
            label="ACTOR ROLE"
            options={ACTOR_ROLE_OPTIONS}
            value={actorRole}
            onChange={(e) => setActorRole(e.target.value)}
          />

          {/* Revenue Types */}
          <div>
            <p className="text-label-caps font-bold text-on-surface tracking-widest mb-1">REVENUE TYPES</p>
            <p className="text-caption text-on-surface-variant mb-4">Select all that apply</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {LIUM_OPTIONS.revenueTypes.map((type) => (
                <label
                  key={type}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all
                    ${revenueTypes.includes(type)
                      ? 'border-secondary bg-secondary-container/10 text-on-surface'
                      : 'border-outline-variant hover:border-secondary/40 text-on-surface-variant'}`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={revenueTypes.includes(type)}
                    onChange={() => toggleRevenue(type)}
                  />
                  <span className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all
                    ${revenueTypes.includes(type) ? 'border-secondary bg-secondary' : 'border-outline-variant'}`}>
                    {revenueTypes.includes(type) && (
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      </svg>
                    )}
                  </span>
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {formError && (
            <p className="text-caption text-error bg-error-container/30 px-4 py-3 rounded-lg">{formError}</p>
          )}
        </CardBody>

        <CardFooter>
          <Button type="button" variant="ghost" size="sm" className="gap-2">
            <span className="material-symbols-outlined text-[16px]">save</span>
            SAVE DRAFT
          </Button>
          <Button type="submit" variant="secondary" loading={submitting} className="gap-2">
            NEXT: UPLOAD DOCUMENTS
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
