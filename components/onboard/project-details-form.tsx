'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { projectsApi } from '@/lib/api'
import { LIUM_OPTIONS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Card, CardBody, CardFooter } from '@/components/ui/card'
import { MapPicker } from '@/components/onboard/map-picker'
import type { AssetType, Jurisdiction, ProjectFinancials } from '@/types'

const JURISDICTION_OPTIONS = [
  { value: '', label: 'Select jurisdiction...' },
  { value: 'ERCOT', label: 'ERCOT (Texas)' },
  { value: 'PJM', label: 'PJM Interconnection (Mid-Atlantic)' },
  { value: 'CAISO', label: 'CAISO (California)' },
  { value: 'MISO', label: 'MISO (Midwest)' },
  { value: 'NYISO', label: 'NYISO (New York)' },
  { value: 'SPP', label: 'SPP (Southwest Power Pool)' },
  { value: 'WECC', label: 'WECC (Western Interconnect)' },
]

const ASSET_TYPES: { value: AssetType; label: string; subtitle: string; icon: string }[] = [
  { value: 'BESS', label: 'BESS', subtitle: 'Battery Energy Storage System', icon: 'battery_charging_full' },
  { value: 'MICROGRID', label: 'Microgrid', subtitle: 'Distributed Energy Resource Cluster', icon: 'grid_view' },
  { value: 'DER_CLUSTER', label: 'DER Cluster', subtitle: 'Multi-source distributed array', icon: 'hub' },
  { value: 'SOLAR_PV', label: 'Solar PV', subtitle: 'Utility-scale photovoltaic', icon: 'solar_power' },
  { value: 'WIND', label: 'Wind', subtitle: 'Onshore wind turbine cluster', icon: 'air' },
  { value: 'SOLAR_BESS_HYBRID', label: 'Solar+BESS Hybrid', subtitle: 'Co-located solar and storage', icon: 'energy_program_saving' },
]

const TRACKER_TYPE_OPTIONS = [
  { value: '', label: 'Select tracker type...' },
  { value: 'Fixed-tilt', label: 'Fixed-tilt' },
  { value: 'Single-axis tracking', label: 'Single-axis tracking' },
  { value: 'Dual-axis tracking', label: 'Dual-axis tracking' },
]

const IEC_WIND_CLASS_OPTIONS = [
  { value: '', label: 'Select wind class...' },
  { value: 'Class I', label: 'Class I' },
  { value: 'Class II', label: 'Class II' },
  { value: 'Class III', label: 'Class III' },
]

export function ProjectDetailsForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [jurisdiction, setJurisdiction] = useState('')
  const [assetType, setAssetType] = useState<AssetType | null>(null)
  const [revenueTypes, setRevenueTypes] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const [capacityMW, setCapacityMW] = useState('')
  const [capacityMWh, setCapacityMWh] = useState('')
  const [codDate, setCodDate] = useState('')
  const [assetLifeYears, setAssetLifeYears] = useState('')

  const [ppaCounterparty, setPpaCounterparty] = useState('')
  const [ppaTariffMwh, setPpaTariffMwh] = useState('')
  const [ppaContractEndDate, setPpaContractEndDate] = useState('')

  const [totalCapexM, setTotalCapexM] = useState('')
  const [debtPct, setDebtPct] = useState('')
  const [annualRevenueM, setAnnualRevenueM] = useState('')
  const [annualOpexM, setAnnualOpexM] = useState('')
  const [annualDebtServiceM, setAnnualDebtServiceM] = useState('')

  const [gapFundingEligible, setGapFundingEligible] = useState(false)
  const [gapFundingProgram, setGapFundingProgram] = useState('')

  const [designCycleCount, setDesignCycleCount] = useState('')
  const [bessDegradationRate, setBessDegradationRate] = useState('')
  const [bessWarranty, setBessWarranty] = useState('')
  const [panelDegradationRate, setPanelDegradationRate] = useState('')
  const [trackerType, setTrackerType] = useState('')
  const [iecWindClass, setIecWindClass] = useState('')
  const [turbineOem, setTurbineOem] = useState('')

  const equityPct = debtPct !== '' ? Math.max(0, 100 - parseFloat(debtPct || '0')) : ''

  const showMWh = assetType === 'BESS' || assetType === 'SOLAR_BESS_HYBRID'
  const showBessDetails = assetType === 'BESS' || assetType === 'SOLAR_BESS_HYBRID'
  const showSolarDetails = assetType === 'SOLAR_PV' || assetType === 'SOLAR_BESS_HYBRID'
  const showWindDetails = assetType === 'WIND'

  function toggleRevenue(type: string) {
    setRevenueTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')

    const assetDetails: Record<string, unknown> = {}
    if (showBessDetails) {
      if (designCycleCount) assetDetails.designCycleCount = parseFloat(designCycleCount)
      if (bessDegradationRate) assetDetails.bessDegradationRate = parseFloat(bessDegradationRate)
      if (bessWarranty) assetDetails.bessWarranty = parseFloat(bessWarranty)
    }
    if (showSolarDetails) {
      if (panelDegradationRate) assetDetails.panelDegradationRate = parseFloat(panelDegradationRate)
      if (trackerType) assetDetails.trackerType = trackerType
    }
    if (showWindDetails) {
      if (iecWindClass) assetDetails.iecWindClass = iecWindClass
      if (turbineOem) assetDetails.turbineOem = turbineOem
    }

    const financials: ProjectFinancials = {
      ...(capacityMW ? { capacityMW: parseFloat(capacityMW) } : {}),
      ...(showMWh && capacityMWh ? { capacityMWh: parseFloat(capacityMWh) } : {}),
      ...(codDate ? { codDate } : {}),
      ...(assetLifeYears ? { assetLifeYears: parseFloat(assetLifeYears) } : {}),
      ...(ppaCounterparty ? { ppaCounterparty } : {}),
      ...(ppaTariffMwh ? { ppaTariffMwh: parseFloat(ppaTariffMwh) } : {}),
      ...(ppaContractEndDate ? { ppaContractEndDate } : {}),
      ...(totalCapexM ? { totalCapexM: parseFloat(totalCapexM) } : {}),
      ...(debtPct !== '' ? { debtPct: parseFloat(debtPct), equityPct: typeof equityPct === 'number' ? equityPct : undefined } : {}),
      ...(annualRevenueM ? { annualRevenueM: parseFloat(annualRevenueM) } : {}),
      ...(annualOpexM ? { annualOpexM: parseFloat(annualOpexM) } : {}),
      ...(annualDebtServiceM ? { annualDebtServiceM: parseFloat(annualDebtServiceM) } : {}),
      gapFundingEligible,
      ...(gapFundingEligible && gapFundingProgram ? { gapFundingProgram } : {}),
      ...(Object.keys(assetDetails).length > 0 ? { assetDetails } : {}),
    }

    const res = await projectsApi.create({
      name: name.trim() || 'Untitled Project',
      location,
      jurisdiction: (jurisdiction as Jurisdiction) || 'ERCOT',
      assetType: assetType ?? 'BESS',
      revenueTypes,
      financials,
    } as Parameters<typeof projectsApi.create>[0])

    setSubmitting(false)
    if (!res.ok) { setFormError(res.error.message); return }
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
          />

          <MapPicker value={location} onChange={setLocation} />

          <Select
            label="JURISDICTION"
            options={JURISDICTION_OPTIONS}
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
          />

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

          <p className="text-label-caps font-bold text-on-surface tracking-widest mb-4 mt-8">ASSET SPECIFICATIONS (optional)</p>

          <Input
            label="CAPACITY (MW)"
            type="number"
            placeholder="e.g. 100"
            value={capacityMW}
            onChange={(e) => setCapacityMW(e.target.value)}
          />

          {showMWh && (
            <Input
              label="STORAGE CAPACITY (MWh)"
              type="number"
              placeholder="e.g. 200"
              value={capacityMWh}
              onChange={(e) => setCapacityMWh(e.target.value)}
            />
          )}

          <Input
            label="COMMERCIAL OPERATION DATE (COD)"
            type="date"
            value={codDate}
            onChange={(e) => setCodDate(e.target.value)}
          />

          <Input
            label="ASSET LIFE (YEARS)"
            type="number"
            placeholder="e.g. 25"
            value={assetLifeYears}
            onChange={(e) => setAssetLifeYears(e.target.value)}
          />

          <p className="text-label-caps font-bold text-on-surface tracking-widest mb-4 mt-8">OFFTAKE & REVENUE (optional)</p>

          <Input
            label="OFFTAKE COUNTERPARTY"
            placeholder="e.g. Austin Energy"
            value={ppaCounterparty}
            onChange={(e) => setPpaCounterparty(e.target.value)}
          />

          <Input
            label="CONTRACTED TARIFF ($/MWh)"
            type="number"
            placeholder="e.g. 45.00"
            value={ppaTariffMwh}
            onChange={(e) => setPpaTariffMwh(e.target.value)}
          />

          <Input
            label="PPA CONTRACT END DATE"
            type="date"
            value={ppaContractEndDate}
            onChange={(e) => setPpaContractEndDate(e.target.value)}
          />

          <p className="text-label-caps font-bold text-on-surface tracking-widest mb-4 mt-8">FINANCIAL MODEL (optional)</p>

          <Input
            label="TOTAL CAPEX ($M)"
            type="number"
            placeholder="e.g. 195"
            value={totalCapexM}
            onChange={(e) => setTotalCapexM(e.target.value)}
          />

          <div>
            <p className="text-label-caps font-bold text-on-surface tracking-widest mb-2">DEBT FINANCING (%)</p>
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="e.g. 67"
                min={0}
                max={100}
                value={debtPct}
                onChange={(e) => setDebtPct(e.target.value)}
              />
              <div className="flex flex-col gap-1 min-w-[120px]">
                <p className="text-label-caps font-bold text-on-surface-variant tracking-widest text-xs">EQUITY (%)</p>
                <div className="flex items-center h-10 px-3 rounded-lg bg-surface-container-high border border-outline-variant text-on-surface-variant text-sm select-none">
                  {equityPct !== '' ? `${equityPct}%` : '—'}
                </div>
              </div>
            </div>
          </div>

          <Input
            label="ANNUAL CONTRACTED REVENUE ($M)"
            type="number"
            placeholder="e.g. 28.5"
            value={annualRevenueM}
            onChange={(e) => setAnnualRevenueM(e.target.value)}
          />

          <Input
            label="ANNUAL OPEX ($M)"
            type="number"
            placeholder="e.g. 3.5"
            value={annualOpexM}
            onChange={(e) => setAnnualOpexM(e.target.value)}
          />

          <div>
            <Input
              label="ANNUAL DEBT SERVICE ($M)"
              type="number"
              placeholder="e.g. 17.8"
              value={annualDebtServiceM}
              onChange={(e) => setAnnualDebtServiceM(e.target.value)}
            />
            <p className="text-caption text-on-surface-variant mt-1">Only if existing debt</p>
          </div>

          <p className="text-label-caps font-bold text-on-surface tracking-widest mb-4 mt-8">GAP FUNDING (optional)</p>

          <label className="flex items-center gap-3 cursor-pointer">
            <span className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all
              ${gapFundingEligible ? 'border-secondary bg-secondary' : 'border-outline-variant'}`}
              onClick={() => setGapFundingEligible((prev) => !prev)}
            >
              {gapFundingEligible && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </svg>
              )}
            </span>
            <input
              type="checkbox"
              className="sr-only"
              checked={gapFundingEligible}
              onChange={(e) => setGapFundingEligible(e.target.checked)}
            />
            <span className="text-sm text-on-surface">Eligible for federal/state gap funding program</span>
          </label>

          {gapFundingEligible && (
            <Input
              label="GAP FUNDING PROGRAM"
              placeholder="e.g. ITC, USDA REAP, DOE Loan Guarantee"
              value={gapFundingProgram}
              onChange={(e) => setGapFundingProgram(e.target.value)}
            />
          )}

          {(showBessDetails || showSolarDetails || showWindDetails) && (
            <p className="text-label-caps font-bold text-on-surface tracking-widest mb-4 mt-8">ASSET-SPECIFIC DETAILS (optional)</p>
          )}

          {showBessDetails && (
            <>
              <Input
                label="DESIGN CYCLE COUNT"
                type="number"
                placeholder="e.g. 6000"
                value={designCycleCount}
                onChange={(e) => setDesignCycleCount(e.target.value)}
              />
              <Input
                label="DEGRADATION RATE (%/YR)"
                type="number"
                placeholder="e.g. 2.5"
                value={bessDegradationRate}
                onChange={(e) => setBessDegradationRate(e.target.value)}
              />
              <Input
                label="WARRANTY (YEARS)"
                type="number"
                placeholder="e.g. 10"
                value={bessWarranty}
                onChange={(e) => setBessWarranty(e.target.value)}
              />
            </>
          )}

          {showSolarDetails && (
            <>
              <Input
                label="PANEL DEGRADATION RATE (%/YR)"
                type="number"
                placeholder="e.g. 0.5"
                value={panelDegradationRate}
                onChange={(e) => setPanelDegradationRate(e.target.value)}
              />
              <Select
                label="TRACKER TYPE"
                options={TRACKER_TYPE_OPTIONS}
                value={trackerType}
                onChange={(e) => setTrackerType(e.target.value)}
              />
            </>
          )}

          {showWindDetails && (
            <>
              <Select
                label="IEC WIND CLASS"
                options={IEC_WIND_CLASS_OPTIONS}
                value={iecWindClass}
                onChange={(e) => setIecWindClass(e.target.value)}
              />
              <Input
                label="TURBINE OEM"
                placeholder=""
                value={turbineOem}
                onChange={(e) => setTurbineOem(e.target.value)}
              />
            </>
          )}

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
