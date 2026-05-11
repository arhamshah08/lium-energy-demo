'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { projectsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Card, CardBody, CardFooter } from '@/components/ui/card'
import { MapPicker } from '@/components/onboard/map-picker'
import type { AssetType, Jurisdiction } from '@/types'

const JURISDICTION_OPTIONS = [
  { value: 'ERCOT', label: 'ERCOT (Texas)' },
  { value: 'PJM', label: 'PJM Interconnection' },
  { value: 'CAISO', label: 'CAISO (California)' },
  { value: 'MISO', label: 'MISO' },
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
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('ERCOT')
  const [assetType, setAssetType] = useState<AssetType | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Project name is required'
    if (!assetType) errs.assetType = 'Select an asset type'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    const res = await projectsApi.create({ name, location, jurisdiction, assetType: assetType! })
    setSubmitting(false)

    if (!res.ok) { setErrors({ form: res.error.message }); return }
    router.push(`/onboard/document-vault?id=${res.data.id}`)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card>
        <CardBody className="space-y-8">
          <Input
            label="PROJECT NAME"
            placeholder="e.g. North Basin Solar Array"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
          <MapPicker
            value={location}
            onChange={setLocation}
          />
          <Select
            label="JURISDICTION"
            options={JURISDICTION_OPTIONS}
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value as Jurisdiction)}
          />
          <div>
            <p className="text-label-caps font-bold text-on-surface tracking-widest mb-4">ASSET TYPE</p>
            {errors.assetType && <p className="text-caption text-error mb-3">{errors.assetType}</p>}
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
                    onChange={() => { setAssetType(value); setErrors((e) => ({ ...e, assetType: '' })) }}
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
          {errors.form && (
            <p className="text-caption text-error bg-error-container/30 px-4 py-3 rounded-lg">{errors.form}</p>
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
