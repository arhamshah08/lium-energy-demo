'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-context'
import { projectsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardBody, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ConnectionMethod, TelemetryTestResult } from '@/types'

const CONNECTION_METHODS: { value: ConnectionMethod; label: string; subtitle: string; icon: string }[] = [
  { value: 'DIRECT_API', label: 'Direct API Integration', subtitle: 'Institutional SCADA/EMS (Tesla, Schneider).', icon: 'api' },
  { value: 'IOT_GATEWAY', label: 'IoT Gateway', subtitle: 'Field-level hardware via LIUM Hub.', icon: 'router' },
  { value: 'DATA_BRIDGE', label: 'Data Bridge', subtitle: 'Third-party aggregators and cloud platforms.', icon: 'hub' },
]

export function TelemetryForm({ projectId }: { projectId: string }) {
  const router = useRouter()
  const { token } = useAuth()
  const [isOperational, setIsOperational] = useState<boolean | null>(null)
  const [method, setMethod] = useState<ConnectionMethod>('DIRECT_API')
  const [endpoint, setEndpoint] = useState('')
  const [assetId, setAssetId] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<TelemetryTestResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!projectId || !token) return
    fetch(`/api/projects/${projectId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(json => {
        if (json.ok) {
          const ad = json.data?.financials?.assetDetails
          setIsOperational(ad?.isOperational !== false)
        } else {
          setIsOperational(true)
        }
      })
      .catch(() => setIsOperational(true))
  }, [projectId, token])

  async function saveConfig() {
    if (!endpoint.trim()) { setError('API endpoint is required'); return null }
    setSaving(true)
    const res = await projectsApi.updateTelemetry(projectId, {
      connectionMethod: method,
      apiEndpoint: endpoint,
      assetIdMapping: assetId,
      secretKey,
    })
    setSaving(false)
    if (!res.ok) { setError(res.error.message); return null }
    return res.data
  }

  async function handleTest() {
    setError('')
    const saved = await saveConfig()
    if (!saved) return
    setTesting(true)
    const res = await projectsApi.testTelemetry(projectId)
    setTesting(false)
    if (!res.ok) { setError(res.error.message); return }
    setTestResult(res.data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!testResult?.success) { setError('Test the connection before proceeding'); return }
    router.push(`/onboard/credit-pack?id=${projectId}`)
  }

  if (isOperational === null) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center gap-3 py-4">
            <span className="material-symbols-outlined text-outline animate-spin">progress_activity</span>
            <p className="text-caption text-on-surface-variant">Loading project…</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  if (!isOperational) {
    return (
      <Card>
        <CardBody className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-tertiary-container/40 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-tertiary text-[24px]">construction</span>
            </div>
            <div>
              <h3 className="text-headline-md text-on-surface">Pre-commissioning Project</h3>
              <p className="text-caption text-on-surface-variant mt-0.5">Telemetry connection is not required until the asset is operational</p>
            </div>
          </div>

          <div className="bg-tertiary/5 border border-tertiary/20 rounded-xl px-5 py-4">
            <p className="text-caption text-on-surface">
              You marked this project as <span className="font-bold">pre-commissioning</span> in Step 1.
              Telemetry can be connected after commissioning — skip this step and return later from your project dashboard.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={() => router.push(`/onboard/document-vault?id=${projectId}`)}
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Document Vault
            </Button>
            <Button
              type="button"
              variant="primary"
              className="gap-2"
              onClick={() => router.push(`/onboard/credit-pack?id=${projectId}`)}
            >
              Skip to Credit Pack
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Button>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-gutter">
        {/* Connection method */}
        <Card>
          <CardBody>
            <h3 className="text-headline-md text-on-surface mb-6">Select Connection Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CONNECTION_METHODS.map(({ value, label, subtitle, icon }) => (
                <label
                  key={value}
                  className={cn(
                    'relative flex flex-col p-5 border-2 rounded-xl cursor-pointer transition-all',
                    method === value
                      ? 'border-primary bg-primary/5'
                      : 'border-outline-variant hover:border-primary/40 bg-white',
                  )}
                >
                  <input type="radio" name="method" className="sr-only" checked={method === value} onChange={() => setMethod(value)} />
                  <span className={cn('material-symbols-outlined mb-3', method === value ? 'text-primary' : 'text-outline')}>
                    {icon}
                  </span>
                  <span className="text-label-caps font-bold text-on-surface">{label}</span>
                  <span className="text-caption text-on-surface-variant mt-1">{subtitle}</span>
                  {method === value && (
                    <span
                      className="absolute top-3 right-3 material-symbols-outlined text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  )}
                </label>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Config fields */}
        <Card>
          <CardBody className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">settings_ethernet</span>
              <h3 className="text-headline-md text-on-surface">Configuration Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="API ENDPOINT URL"
                placeholder="https://api.energy-provider.com/v1"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                error={error && !endpoint ? error : undefined}
              />
              <Input
                label="ASSET ID MAPPING"
                placeholder="BESS-UNIT-0492-PROD"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
              />
            </div>
            <div className="relative space-y-2">
              <label className="block text-label-caps font-bold text-on-surface tracking-widest">
                SECRET AUTHORIZATION KEY
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 pr-10 text-body-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="••••••••••••••••••••"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline"
                  onClick={() => setShowKey(!showKey)}
                >
                  <span className="material-symbols-outlined text-[20px]">{showKey ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <div className="p-4 bg-secondary-container/20 rounded-lg flex gap-4 items-start">
              <span className="material-symbols-outlined text-secondary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
              <p className="text-caption text-on-secondary-container">
                <span className="font-bold block mb-1">Security Protocol</span>
                All keys are encrypted using AES-256 GCM and stored in an HSM. LIUM only uses these keys to pull read-only performance data.
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Live telemetry preview */}
        {testResult && (
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary" />
                  </span>
                  <span className="text-label-caps text-secondary font-bold">Live Telemetry Feed · Verified</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-on-surface-variant border border-outline-variant uppercase tracking-widest">
                    {testResult.latencyMs}ms
                  </span>
                  <span className="px-3 py-1 bg-secondary-container rounded-full text-[10px] font-bold text-on-secondary-container uppercase tracking-widest">
                    Connected
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'State of Charge', value: `${testResult.metrics.stateOfCharge.toFixed(1)}%` },
                  { label: 'Net Export', value: `${testResult.metrics.netExportMW.toFixed(2)} MW` },
                  { label: 'Voltage Lag', value: `${testResult.metrics.voltageLagMs.toFixed(2)}ms` },
                  { label: 'Heat Index', value: `${testResult.metrics.heatIndexC.toFixed(1)}°C` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white border border-outline-variant rounded-lg p-4">
                    <p className="text-label-caps text-on-surface-variant mb-1">{label}</p>
                    <p className="text-data-point text-secondary font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {error && (
          <p className="text-caption text-error bg-error-container/30 px-4 py-3 rounded-lg">{error}</p>
        )}

        <div className="pt-4 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            className="gap-2"
            onClick={() => router.push(`/onboard/document-vault?id=${projectId}`)}
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Document Vault
          </Button>
          <div className="flex gap-3 w-full md:w-auto">
            <Button type="button" variant="outline" onClick={handleTest} loading={saving || testing} className="flex-1 md:flex-none">
              {testing ? 'Testing…' : 'Test Connection'}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!testResult?.success}
              className="flex-1 md:flex-none gap-2"
            >
              Next: Credit Pack
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
