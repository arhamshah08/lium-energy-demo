'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/auth-context'
import type { ExternalRiskRequest } from '@/types'

const PROVIDERS = [
  { id: 'CRISIL',   label: 'CRISIL Ratings',              sub: 'S&P Global affiliate' },
  { id: 'ICRA',     label: 'ICRA Limited',                sub: "Moody's affiliate" },
  { id: 'CARE',     label: 'CARE Ratings',                sub: 'Credit Analysis & Research' },
  { id: 'INDRA',    label: 'India Ratings & Research',    sub: 'Fitch affiliate' },
]

export function RiskProviderPanel({
  projectId,
  existingRequest,
  hasInternalScore,
}: {
  projectId: string
  existingRequest?: ExternalRiskRequest
  hasInternalScore: boolean
}) {
  const { token } = useAuth()
  const [selected, setSelected] = useState(PROVIDERS[0].id)
  const [sending, setSending] = useState(false)
  const [request, setRequest] = useState<ExternalRiskRequest | undefined>(existingRequest)

  async function handleSend() {
    if (!token) return
    setSending(true)
    const now = new Date().toISOString()
    const payload: ExternalRiskRequest = { provider: selected, status: 'PENDING', requestedAt: now }
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ telemetry: { externalRiskRequest: payload } }),
    })
    const json = await res.json()
    if (json.ok) setRequest(payload)
    setSending(false)
  }

  const providerLabel = PROVIDERS.find(p => p.id === (request?.provider ?? selected))?.label ?? request?.provider

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-outline-variant/40 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
        <h2 className="text-label-caps font-bold text-on-surface tracking-widest">External Risk Assessment</h2>
      </div>

      <div className="p-6 space-y-4">
        {hasInternalScore && (
          <div className="flex items-start gap-3 bg-tertiary/5 border border-tertiary/20 rounded-lg px-4 py-3">
            <span className="material-symbols-outlined text-tertiary text-[16px] shrink-0 mt-0.5">info</span>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              The LQ score above is an <span className="font-semibold text-on-surface">internal estimate</span> computed from your submitted data.
              For securitisation, you must also obtain an external risk assessment from a SEBI-registered rating agency.
              The external score will replace the internal estimate once received.
            </p>
          </div>
        )}

        {!request ? (
          <div className="space-y-3">
            <div>
              <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">SELECT RISK PROVIDER</p>
              <div className="grid grid-cols-2 gap-2">
                {PROVIDERS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelected(p.id)}
                    className={`text-left px-3 py-2.5 rounded-lg border transition-all ${
                      selected === p.id
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-outline-variant/50 hover:border-outline-variant'
                    }`}
                  >
                    <p className={`text-[11px] font-bold ${selected === p.id ? 'text-primary' : 'text-on-surface'}`}>{p.label}</p>
                    <p className="text-[9px] text-on-surface-variant mt-0.5">{p.sub}</p>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={sending}
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              {sending ? 'Sending…' : `Send to ${PROVIDERS.find(p => p.id === selected)?.label}`}
            </button>
          </div>
        ) : request.status === 'PENDING' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-tertiary/5 border border-tertiary/20 rounded-lg px-4 py-3">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-on-surface">Assessment Requested — {providerLabel}</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">
                  Sent {new Date(request.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · Awaiting response
                </p>
              </div>
            </div>
            <p className="text-[10px] text-on-surface-variant/60">
              The internal LQ estimate remains active until the external score is received. Rating agencies typically respond within 15–30 business days.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-secondary/5 border border-secondary/20 rounded-lg px-4 py-3">
            <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-on-surface">External Score Received — {providerLabel}</p>
              {request.externalScore != null && (
                <p className="text-[10px] text-on-surface-variant mt-0.5">LQ: {request.externalScore.toFixed(3)} · Gate: {request.externalGate}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
