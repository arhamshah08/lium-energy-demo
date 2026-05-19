'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/auth-context'

interface Participant {
  id: string
  role: string
  full_name: string
  company_name: string | null
  country: string | null
  job_title: string | null
  financier_type: string | null
}

const STAGE_CONFIG = [
  {
    stage: 1,
    role: 'financier',
    title: 'Financier',
    subtitle: 'Asset acquisition · Debt retirement · Bridge financing',
    icon: 'account_balance',
    color: 'text-secondary',
    bg: 'bg-secondary-container/20',
    border: 'border-secondary/25',
    lbar: 'border-l-secondary',
    badgeBg: 'bg-secondary text-on-secondary',
    when: 'Available after submission',
    whenColor: 'text-secondary',
    whenIcon: 'schedule',
    description: 'Financiers discover submitted assets and submit binding financing offers. Financing closes before PTO — PTO only gates securitisation, not financing.',
    actions: ['Project discovery & diligence', 'Binding term sheet submission', 'Offer revision loop with developer', 'Financing locks once developer accepts'],
  },
  {
    stage: 2,
    role: 'securitisation_agent',
    title: 'Securitisation Agent',
    subtitle: 'Pool structuring · Tokenisation · Tranche issuance',
    icon: 'hub',
    color: 'text-primary',
    bg: 'bg-primary/5',
    border: 'border-primary/20',
    lbar: 'border-l-primary',
    badgeBg: 'bg-primary text-on-primary',
    when: 'Requires financing + PTO approved',
    whenColor: 'text-primary',
    whenIcon: 'lock',
    description: 'Once financing is accepted and the developer obtains PTO, they publish the asset to the SA. The SA tokenises it and issues rated tranches to institutional investors.',
    actions: ['Asset pool structuring', 'Credit rating coordination', 'UNITS token issuance', 'Tranche waterfall management'],
  },
  {
    stage: 3,
    role: 'portfolio_manager',
    title: 'Portfolio Manager',
    subtitle: 'Securities investment · Pool oversight · Distributions',
    icon: 'monitoring',
    color: 'text-tertiary',
    bg: 'bg-tertiary/5',
    border: 'border-tertiary/20',
    lbar: 'border-l-tertiary',
    badgeBg: 'bg-tertiary text-on-tertiary',
    when: 'Requires securitisation',
    whenColor: 'text-tertiary',
    whenIcon: 'lock',
    description: 'Portfolio managers buy into the structured pools and oversee long-term performance. They can discover projects early to plan future allocations.',
    actions: ['Early pipeline discovery', 'Tranche subscription', 'Portfolio performance monitoring', 'Distribution management'],
  },
]

const COUNTRY_FLAG: Record<string, string> = {
  US: '🇺🇸', SE: '🇸🇪', GB: '🇬🇧', SG: '🇸🇬', IN: '🇮🇳', AU: '🇦🇺', CA: '🇨🇦', DE: '🇩🇪',
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function ParticipantCard({
  participant,
  stageColor,
  stageBadge,
}: {
  participant: Participant
  stageColor: string
  stageBadge: string
}) {
  const [showModal, setShowModal] = useState(false)
  const flag = participant.country ? (COUNTRY_FLAG[participant.country] ?? '') : ''

  return (
    <>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all p-5 flex flex-col gap-4">
        {/* Avatar + name */}
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold text-white shrink-0 ${stageBadge.split(' ')[0]}`}>
            {initials(participant.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-on-surface text-caption truncate">{participant.full_name}</p>
            {participant.company_name && (
              <p className="text-[11px] text-on-surface-variant truncate">{participant.company_name}</p>
            )}
            {participant.job_title && (
              <p className="text-[10px] text-on-surface-variant/70 truncate">{participant.job_title}</p>
            )}
          </div>
          {flag && <span className="text-lg shrink-0">{flag}</span>}
        </div>

        {/* Verified badge */}
        <div className="flex items-center gap-1.5 bg-secondary-container/20 rounded-lg px-2.5 py-1.5">
          <span className="material-symbols-outlined text-secondary text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          <span className="text-[10px] font-bold text-secondary uppercase tracking-wide">LIUM Verified</span>
        </div>

        {/* Connect button */}
        <button
          onClick={() => setShowModal(true)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-label-caps font-bold border transition-all hover:opacity-90 ${stageBadge}`}
        >
          <span className="material-symbols-outlined text-[15px]">connect_without_contact</span>
          Express Interest
        </button>
      </div>

      {/* Coming soon modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-label-caps font-bold text-on-surface tracking-widest">CONNECT WITH PARTNER</h3>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex items-start gap-3 bg-secondary-container/20 border border-secondary/20 rounded-xl p-4">
              <span className="material-symbols-outlined text-secondary text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
              <div>
                <p className="text-caption font-bold text-on-surface">Your project is now discoverable</p>
                <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                  {participant.full_name} at {participant.company_name ?? 'their firm'} can already see your listed projects on LIUM.
                  Direct connection requests and deal rooms are coming in the next release.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 rounded-xl bg-primary text-on-primary text-label-caps font-bold hover:opacity-90 transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default function DiscoverPage() {
  const { token } = useAuth()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    fetch('/api/participants', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setParticipants(d.data ?? []))
      .finally(() => setLoading(false))
  }, [token])

  const byRole = (role: string) => participants.filter(p => p.role === role)

  return (
    <div className="py-gutter space-y-10 max-w-5xl">

      {/* Header */}
      <div>
        <h1 className="text-display-lg text-on-surface">Find Capital Partners</h1>
        <p className="text-body-base text-on-surface-variant mt-1">
          Three types of partner move your project from asset to securitised security. Discover them at every stage.
        </p>
      </div>

      {/* Journey pipeline */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card p-6 lg:p-8">
        <p className="text-label-caps text-on-surface-variant font-bold tracking-widest mb-6">THE CAPITAL JOURNEY</p>
        <div className="flex flex-col lg:flex-row items-stretch gap-0">

          {/* Developer (you) */}
          <div className="flex flex-col items-center text-center lg:w-36 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-on-surface-variant text-[22px]">engineering</span>
            </div>
            <p className="text-label-caps font-bold text-on-surface">You</p>
            <p className="text-[10px] text-on-surface-variant mt-0.5">Project Developer</p>
            <div className="mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant uppercase tracking-wide">Starting point</div>
          </div>

          {/* Connectors + stages */}
          {STAGE_CONFIG.map((stage, i) => (
            <div key={stage.role} className="flex flex-col lg:flex-row items-center flex-1">
              {/* Arrow */}
              <div className="flex flex-col lg:flex-row items-center justify-center px-2 py-4 lg:py-0">
                <div className="hidden lg:flex flex-col items-center gap-1">
                  <div className="w-8 h-px bg-outline-variant" />
                  <span className="material-symbols-outlined text-outline-variant text-[14px]">arrow_forward</span>
                </div>
                <div className="lg:hidden flex flex-col items-center gap-1">
                  <div className="h-6 w-px bg-outline-variant" />
                  <span className="material-symbols-outlined text-outline-variant text-[14px]">arrow_downward</span>
                </div>
              </div>

              {/* Stage box */}
              <div className={`flex-1 rounded-xl border ${stage.border} ${stage.bg} p-4 text-center`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${stage.badgeBg}`}>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{stage.icon}</span>
                </div>
                <p className={`text-label-caps font-bold ${stage.color}`}>Stage {stage.stage}</p>
                <p className="text-caption font-bold text-on-surface mt-0.5">{stage.title}</p>
                <div className={`flex items-center justify-center gap-1 mt-2`}>
                  <span className={`material-symbols-outlined text-[11px] ${stage.whenColor}`}>{stage.whenIcon}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wide ${stage.whenColor}`}>{stage.when}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PTO gate callout */}
        <div className="mt-6 flex items-center gap-3 bg-on-surface/5 rounded-xl px-4 py-3 border border-outline-variant/40">
          <span className="material-symbols-outlined text-on-surface text-[18px] shrink-0">lock_open</span>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            <span className="font-bold text-on-surface">Two independent gates.</span> Financing offers are available immediately after submission — PTO is not required.
            PTO approval only gates securitisation: the developer can only publish to the SA once financing is accepted <span className="font-bold text-on-surface">and</span> PTO is confirmed.
          </p>
        </div>
      </div>

      {/* Stage sections */}
      {STAGE_CONFIG.map(stage => {
        const list = byRole(stage.role)
        return (
          <div key={stage.role} className="space-y-4">
            {/* Section header */}
            <div className={`bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-card overflow-hidden`}>
              <div className={`px-6 py-5 border-b border-outline-variant/40 border-l-4 ${stage.lbar} flex items-start gap-4`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${stage.badgeBg}`}>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{stage.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-label-caps font-bold text-on-surface tracking-widest">STAGE {stage.stage} — {stage.title.toUpperCase()}</h2>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${stage.badgeBg}`}>{stage.when}</span>
                    <span className="ml-auto text-label-caps text-on-surface-variant">{list.length} registered</span>
                  </div>
                  <p className={`text-[11px] ${stage.color} mt-0.5`}>{stage.subtitle}</p>
                  <p className="text-[11px] text-on-surface-variant mt-2 leading-relaxed max-w-2xl">{stage.description}</p>
                </div>
              </div>

              {/* What they do */}
              <div className="px-6 py-4 bg-surface-container/30 border-b border-outline-variant/20">
                <div className="flex flex-wrap gap-2">
                  {stage.actions.map(action => (
                    <span key={action} className="flex items-center gap-1.5 text-[10px] text-on-surface-variant bg-surface-container-lowest border border-outline-variant/40 px-2.5 py-1 rounded-full">
                      <span className="material-symbols-outlined text-[11px] text-secondary">check</span>
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Participant cards */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-5 space-y-3 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-surface-container-high rounded" />
                        <div className="h-3 w-1/2 bg-surface-container rounded" />
                      </div>
                    </div>
                    <div className="h-8 w-full bg-surface-container rounded-lg" />
                    <div className="h-9 w-full bg-surface-container-high rounded-lg" />
                  </div>
                ))}
              </div>
            ) : list.length === 0 ? (
              <div className="flex items-center gap-4 bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-6 py-5">
                <span className="material-symbols-outlined text-outline text-[24px]">group_add</span>
                <div>
                  <p className="text-caption font-bold text-on-surface">No {stage.title.toLowerCase()}s registered yet</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Partners will appear here as they join the LIUM network.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map(p => (
                  <ParticipantCard key={p.id} participant={p} stageColor={stage.color} stageBadge={stage.badgeBg} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
