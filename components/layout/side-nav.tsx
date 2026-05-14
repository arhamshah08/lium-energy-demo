'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_SECTIONS = [
  {
    label: 'OVERVIEW',
    items: [
      { icon: 'dashboard',        label: 'Command Center', href: '/dashboard' },
    ],
  },
  {
    label: 'ASSETS',
    items: [
      { icon: 'account_balance',  label: 'Asset Registry', href: '/projects' },
    ],
  },
  {
    label: 'TOKENISATION',
    items: [
      { icon: 'token',            label: 'Token Registry', href: '/tokenise' },
    ],
  },
  {
    label: 'SECURITIES',
    items: [
      { icon: 'hub',              label: 'Pool Structuring', href: '/securities' },
      { icon: 'storefront',       label: 'Marketplace',     href: '/marketplace' },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { icon: 'receipt_long',     label: 'Ledger',          href: '#' },
      { icon: 'verified_user',    label: 'Compliance',      href: '#' },
    ],
  },
]

const BOTTOM_ITEMS = [
  { icon: 'settings', label: 'Settings', href: '#' },
  { icon: 'help',     label: 'Support',  href: '#' },
]

export function SideNav() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '#') return false
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-outline-variant bg-surface-container-low">
      {/* Brand */}
      <div className="p-6 pb-4">
        <p className="text-primary font-bold text-headline-md">LIUM Network</p>
        <p className="text-caption text-on-surface-variant mt-1">Institutional Energy Finance</p>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 px-3 overflow-y-auto space-y-4 pb-2">
        {NAV_SECTIONS.map(({ label, items }) => (
          <div key={label}>
            <p className="text-[10px] font-bold tracking-[0.12em] text-on-surface-variant/50 uppercase px-4 mb-1">
              {label}
            </p>
            <div className="space-y-0.5">
              {items.map(({ icon, label: itemLabel, href }) => (
                <Link
                  key={itemLabel}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-label-caps transition-all',
                    isActive(href)
                      ? 'bg-secondary-container text-on-secondary-container translate-x-1'
                      : 'text-on-surface-variant hover:bg-surface-variant',
                  )}
                >
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  {itemLabel}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 pt-4 border-t border-outline-variant space-y-1">
        <Link
          href="/onboard/project-details"
          className="flex w-full items-center justify-center gap-2 bg-primary text-on-primary font-label-caps text-label-caps py-3 rounded-lg hover:opacity-90 transition-all mb-3"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Issue Asset
        </Link>
        {BOTTOM_ITEMS.map(({ icon, label, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-label-caps text-on-surface-variant hover:bg-surface-variant transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            {label}
          </Link>
        ))}
      </div>
    </aside>
  )
}
