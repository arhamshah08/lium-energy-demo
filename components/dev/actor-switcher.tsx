'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-context'
import { roleHomePath } from '@/lib/auth-utils'

const ACTORS = [
  { role: 'developer',            label: 'Project Developer',      name: 'Priya Nair',      color: '#0D9488', bg: 'rgba(13,148,136,0.15)',  border: 'rgba(13,148,136,0.4)'  },
  { role: 'financier',            label: 'Financier',              name: 'James Okafor',    color: '#FF9E1B', bg: 'rgba(255,158,27,0.15)',  border: 'rgba(255,158,27,0.4)'  },
  { role: 'securitisation_agent', label: 'Securitisation Agent',   name: 'Chen Wei',        color: '#C8341A', bg: 'rgba(200,52,26,0.15)',   border: 'rgba(200,52,26,0.4)'   },
  { role: 'portfolio_manager',    label: 'Portfolio Manager',      name: 'Sara Lindqvist',  color: '#3B82F6', bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.4)'  },
  { role: 'investor',             label: 'Investor',               name: 'Marcus Bell',     color: '#818CF8', bg: 'rgba(129,140,248,0.15)', border: 'rgba(129,140,248,0.4)' },
]

export function DevActorSwitcher() {
  const [open, setOpen] = useState(false)
  const [switching, setSwitching] = useState<string | null>(null)
  const { user, signIn } = useAuth()
  const router = useRouter()

  const currentActor = ACTORS.find(a => a.role === user?.role)

  async function switchTo(role: string) {
    setSwitching(role)
    try {
      const res = await fetch('/api/dev/switch-actor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      const json = await res.json()
      if (json.token) {
        signIn(json.token)
        setOpen(false)
        router.push(roleHomePath(role))
      }
    } finally {
      setSwitching(null)
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, fontFamily: 'system-ui, sans-serif' }}>
      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 10px)', right: 0,
          background: '#15151A', border: '1px solid #2A2A38', borderRadius: 14,
          padding: 16, width: 280, boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,251,240,0.4)' }}>
              DEV · ACTOR SWITCHER
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,251,240,0.4)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ACTORS.map(actor => {
              const isActive = user?.role === actor.role
              const isLoading = switching === actor.role
              return (
                <button
                  key={actor.role}
                  onClick={() => !isActive && switchTo(actor.role)}
                  disabled={isLoading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 8, border: `1px solid ${isActive ? actor.border : 'rgba(255,251,240,0.08)'}`,
                    background: isActive ? actor.bg : 'rgba(255,255,255,0.03)',
                    cursor: isActive ? 'default' : 'pointer',
                    transition: 'all 0.15s', textAlign: 'left', width: '100%',
                    opacity: isLoading ? 0.6 : 1,
                  }}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: actor.color, boxShadow: isActive ? `0 0 6px ${actor.color}` : 'none',
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? actor.color : 'rgba(255,251,240,0.8)', lineHeight: 1.3 }}>
                      {actor.label}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,251,240,0.4)', lineHeight: 1.3 }}>
                      {actor.name}
                    </div>
                  </div>
                  {isActive && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: actor.color, letterSpacing: '0.06em' }}>ACTIVE</span>
                  )}
                  {isLoading && (
                    <span style={{ fontSize: 10, color: 'rgba(255,251,240,0.4)' }}>…</span>
                  )}
                </button>
              )
            })}
          </div>

          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.07)', fontSize: 10, color: 'rgba(255,251,240,0.25)', textAlign: 'center' }}>
            No login required · Dev mode only
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 12px', borderRadius: 100,
          background: open ? '#1C1C26' : '#15151A',
          border: `1px solid ${currentActor ? currentActor.border : 'rgba(255,251,240,0.15)'}`,
          cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
          transition: 'all 0.15s',
        }}
      >
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: currentActor ? currentActor.color : '#6B7280',
        }} />
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,251,240,0.6)' }}>
          DEV
        </span>
        {currentActor && (
          <span style={{ fontSize: 10, color: currentActor.color, fontWeight: 600 }}>
            {currentActor.label.split(' ')[0]}
          </span>
        )}
      </button>
    </div>
  )
}
