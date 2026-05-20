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
  const [isOperational, setIsOperational] = useState(false)

  const [gapFundingEligible, setGapFundingEligible] = useState(false)
  const [gapFundingProgram, setGapFundingProgram] = useState('')

  const [assetMake, setAssetMake] = useState('')
  const [assetModel, setAssetModel] = useState('')
  const [assetUnitCount, setAssetUnitCount] = useState('')
  const [constructionStartDate, setConstructionStartDate] = useState('')
  const [ptoDate, setPtoDate] = useState('')
  const [fundingRows, setFundingRows] = useState<{quarter: string; amountM: string}[]>([])

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

    const assetDetails: Record<string, unknown> = { isOperational }
    if (assetMake) assetDetails.make = assetMake
    if (assetModel) assetDetails.model = assetModel
    if (assetUnitCount) assetDetails.unitCount = parseFloat(assetUnitCount)
    if (constructionStartDate) assetDetails.constructionStartDate = constructionStartDate
    if (ptoDate) assetDetails.ptoDate = ptoDate
    const validRows = fundingRows.filter(r => r.quarter && r.amountM)
    if (validRows.length > 0) assetDetails.fundingSchedule = validRows.map(r => ({ quarter: r.quarter, amountM: parseFloat(r.amountM) }))
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

          <div className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-5">
            <p className="text-label-caps font-bold text-on-surface tracking-widest mb-1">IS THIS PROJECT OPERATIONAL?</p>
            <p className="text-caption text-on-surface-variant mb-4">If the asset is already commissioned and generating, we'll collect telemetry details. If not, you can skip that step.</p>
            <div className="flex gap-3">
              {([{ v: false, label: 'Pre-commissioning', icon: 'construction' }, { v: true, label: 'Operational', icon: 'bolt' }] as const).map(({ v, label, icon }) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => setIsOperational(v)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 text-label-caps font-bold transition-all ${
                    isOperational === v
                      ? 'border-secondary bg-secondary/10 text-secondary'
                      : 'border-outline-variant/60 text-on-surface-variant hover:border-outline'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

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

          <div className="flex gap-3 items-start">
            <div className="flex flex-col gap-1 flex-1">
              <p className="text-label-caps font-bold text-on-surface tracking-widest">MANUFACTURER / MAKE</p>
              <Input
                placeholder="e.g. CATL, BYD, Tesla"
                value={assetMake}
                onChange={(e) => setAssetMake(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <p className="text-label-caps font-bold text-on-surface tracking-widest">MODEL</p>
              <Input
                placeholder="e.g. EnerOne, Megapack"
                value={assetModel}
                onChange={(e) => setAssetModel(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1 w-32 shrink-0">
              <p className="text-label-caps font-bold text-on-surface tracking-widest">NO. OF UNITS</p>
              <Input
                type="number"
                placeholder="e.g. 12"
                min={1}
                value={assetUnitCount}
                onChange={(e) => setAssetUnitCount(e.target.value)}
              />
            </div>
          </div>

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
            label="CONSTRUCTION START DATE"
            type="date"
            value={constructionStartDate}
            onChange={(e) => setConstructionStartDate(e.target.value)}
          />

          <Input
            label="PERMIT TO OPERATE (PTO) DATE"
            type="date"
            value={ptoDate}
            onChange={(e) => setPtoDate(e.target.value)}
          />

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
            label="CONTRACTED TARIFF ($/MWh/month)"
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

          <div className="flex gap-3 items-start">
            <div className="flex flex-col gap-1 flex-1">
              <p className="text-label-caps font-bold text-on-surface tracking-widest">DEBT FINANCING (%)</p>
              <Input
                type="number"
                placeholder="e.g. 67"
                min={0}
                max={100}
                value={debtPct}
                onChange={(e) => setDebtPct(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1 min-w-[120px]">
              <p className="text-label-caps font-bold text-on-surface-variant tracking-widest">EQUITY (%)</p>
              <div className="flex items-center h-10 px-3 rounded-lg bg-surface-container-high border border-outline-variant text-on-surface-variant text-sm select-none">
                {equityPct !== '' ? `${equityPct}%` : '—'}
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

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-label-caps font-bold text-on-surface tracking-widest">QUARTERLY DRAWDOWN SCHEDULE</p>
              <button
                type="button"
                onClick={() => setFundingRows(r => [...r, { quarter: '', amountM: '' }])}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-secondary uppercase tracking-wide hover:opacity-80 transition-opacity"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                Add Quarter
              </button>
            </div>
            {fundingRows.length === 0 ? (
              <p className="text-[11px] text-on-surface-variant/60">No schedule added — click Add Quarter to specify per-quarter capital needs</p>
            ) : (
              <div className="space-y-2">
                {fundingRows.map((row, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex flex-col gap-1 flex-1">
                      {i === 0 && <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">QUARTER</p>}
                      <Input
                        placeholder="e.g. Q1 2026"
                        value={row.quarter}
                        onChange={e => setFundingRows(rows => rows.map((r, j) => j === i ? { ...r, quarter: e.target.value } : r))}
                      />
                    </div>
                    <div className="flex flex-col gap-1 w-32 shrink-0">
                      {i === 0 && <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">AMOUNT ($M)</p>}
                      <Input
                        type="number"
                        placeholder="e.g. 5.0"
                        value={row.amountM}
                        onChange={e => setFundingRows(rows => rows.map((r, j) => j === i ? { ...r, amountM: e.target.value } : r))}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFundingRows(rows => rows.filter((_, j) => j !== i))}
                      className={`shrink-0 text-error/60 hover:text-error transition-colors ${i === 0 ? 'mt-[22px]' : ''}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">remove_circle</span>
                    </button>
                  </div>
                ))}
                {fundingRows.some(r => r.amountM) && (
                  <div className="flex justify-end pt-1">
                    <p className="text-caption text-on-surface-variant">
                      Total: <span className="font-bold text-on-surface">${fundingRows.reduce((s, r) => s + (parseFloat(r.amountM) || 0), 0).toFixed(1)}M</span>
                    </p>
                  </div>
                )}
              </div>
            )}
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
