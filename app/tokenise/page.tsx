import Link from 'next/link'
import { listTokens } from '@/lib/token-store'
import type { Token } from '@/types'

export const dynamic = 'force-dynamic'

function statusColor(status: Token['status']) {
  return {
    ACTIVE:   'bg-secondary/10 text-secondary',
    LOCKED:   'bg-primary/10 text-primary',
    PLEDGED:  'bg-tertiary/10 text-tertiary',
    REDEEMED: 'bg-outline/10 text-outline',
    BURNED:   'bg-error/10 text-error',
  }[status] ?? 'bg-outline/10 text-outline'
}

function statusIcon(status: Token['status']) {
  return {
    ACTIVE:   'check_circle',
    LOCKED:   'lock',
    PLEDGED:  'handshake',
    REDEEMED: 'paid',
    BURNED:   'local_fire_department',
  }[status] ?? 'circle'
}

export default async function TokenisePage() {
  const tokens = await listTokens()

  const totalAUM = tokens.reduce((s, t) => s + t.nominalValueINR, 0)
  const active   = tokens.filter(t => t.status === 'ACTIVE').length
  const locked   = tokens.filter(t => t.status === 'LOCKED').length

  return (
    <div className="py-gutter space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-display-lg text-on-surface">Token Registry</h1>
          <p className="text-body-base text-on-surface-variant mt-1">
            UNITS security tokens issued against onboarded energy assets
          </p>
        </div>
        <Link
          href="/onboard/project-details"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Issue Token
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tokens',   value: tokens.length, icon: 'token',       accent: '' },
          { label: 'Total AUM (₹ Mn)', value: totalAUM.toFixed(0), icon: 'payments',   accent: 'text-secondary' },
          { label: 'Active',         value: active,         icon: 'check_circle', accent: 'text-secondary' },
          { label: 'Locked in Pool', value: locked,         icon: 'lock',        accent: 'text-primary' },
        ].map(({ label, value, icon, accent }) => (
          <div key={label} className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-5 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined text-[18px] ${accent || 'text-on-surface-variant'}`}>{icon}</span>
              <p className="text-label-caps text-on-surface-variant">{label}</p>
            </div>
            <p className={`text-data-point font-bold ${accent || 'text-on-surface'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Token list */}
      {tokens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[40px] text-outline">token</span>
          </div>
          <h2 className="text-headline-md text-on-surface mb-2">No tokens issued yet</h2>
          <p className="text-body-base text-on-surface-variant max-w-sm mb-8">
            Complete the 5-step onboarding flow to issue a UNITS security token against your energy asset.
          </p>
          <Link
            href="/onboard/project-details"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-lg text-label-caps font-bold hover:opacity-90 transition-all shadow-sm"
          >
            Start Onboarding
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tokens.map(token => (
            <Link
              key={token.id}
              href={`/tokenise/${token.id}`}
              className="block bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center gap-5 p-5">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>token</span>
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-on-surface">{token.tokenId}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(token.status)}`}>
                      {token.status}
                    </span>
                  </div>
                  <p className="text-caption text-on-surface-variant">
                    Pool: {token.issuedTo} · Issued {new Date(token.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* LQ */}
                <div className="text-center shrink-0 hidden sm:block">
                  <p className="text-data-point font-bold text-on-surface">{token.lqScore.composite.toFixed(3)}</p>
                  <p className="text-label-caps text-on-surface-variant">LQ SCORE</p>
                </div>

                {/* Nominal */}
                <div className="text-right shrink-0 hidden md:block">
                  <p className="text-data-point font-bold text-on-surface">₹{token.nominalValueINR.toLocaleString()} Mn</p>
                  <p className="text-label-caps text-on-surface-variant">NOMINAL VALUE</p>
                </div>

                {/* Arrow */}
                <span className="material-symbols-outlined text-outline text-[20px] shrink-0">chevron_right</span>
              </div>

              {/* Operation strip */}
              {token.operations.length > 0 && (
                <div className="px-5 pb-4 flex items-center gap-2">
                  {token.operations.slice(0, 4).map((op, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-container text-on-surface-variant border border-outline-variant/40"
                    >
                      {op.operation}
                    </span>
                  ))}
                  {token.operations.length > 4 && (
                    <span className="text-[10px] text-on-surface-variant">+{token.operations.length - 4} more</span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
