'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/auth/auth-context'

type NavItem = { icon: string; label: string; href: string }
type NavSection = { label: string; items: NavItem[] }

const ALL_SECTIONS: Record<string, NavSection> = {
  overview:      { label: 'OVERVIEW',      items: [{ icon: 'dashboard',         label: 'Command Center',  href: '/dashboard' }] },
  assets:        { label: 'ASSETS',        items: [{ icon: 'account_balance',   label: 'Project Registry', href: '/projects' }] },
  discover:      { label: 'NETWORK',       items: [{ icon: 'groups',            label: 'Find Capital',    href: '/discover' }] },
  credentials:   { label: 'CREDENTIALS',   items: [{ icon: 'badge',             label: 'Credentials',     href: '/credentials' }] },
  tokenisation:  { label: 'ON-CHAIN',      items: [{ icon: 'token',             label: 'Token Registry',  href: '/tokenise' }] },
  structuring:   { label: 'STRUCTURING',   items: [{ icon: 'hub',               label: 'Securities',      href: '/securities' }] },
  marketplace:   { label: 'MARKETPLACE',   items: [{ icon: 'storefront',        label: 'Marketplace',     href: '/marketplace' }] },
  offers:        { label: 'FINANCING',     items: [{ icon: 'payments',          label: 'My Offers',       href: '/offers' }] },
  investments:   { label: 'PORTFOLIO',     items: [{ icon: 'savings',           label: 'My Investments',  href: '/investments' }] },
  pool_requests: { label: 'DEAL FLOW',     items: [{ icon: 'swap_horiz',        label: 'Pool Requests',   href: '/pool-requests' }] },
  pm_offerings:  { label: 'MY OFFERINGS',  items: [{ icon: 'deployed_code',     label: 'My Offerings',    href: '/offerings' }] },
  operations:    { label: 'OPERATIONS',    items: [
    { icon: 'receipt_long',  label: 'Ledger',     href: '#' },
    { icon: 'verified_user', label: 'Compliance', href: '#' },
  ]},
}

const ROLE_SECTIONS: Record<string, { active: string[]; grayed: string[] }> = {
  developer:            { active: ['overview', 'assets', 'discover', 'credentials'],            grayed: [] },
  securitisation_agent: { active: ['overview', 'assets', 'tokenisation', 'pool_requests'],      grayed: ['structuring', 'marketplace'] },
  financier:            { active: ['overview', 'assets', 'offers', 'marketplace'],               grayed: [] },
  portfolio_manager:    { active: ['overview', 'pool_requests', 'pm_offerings'],                 grayed: ['assets', 'tokenisation', 'structuring', 'marketplace', 'operations'] },
  investor:             { active: ['overview', 'marketplace', 'investments'],                    grayed: ['structuring'] },
}

const BOTTOM_ITEMS: NavItem[] = [
  { icon: 'settings', label: 'Settings', href: '#' },
  { icon: 'help',     label: 'Support',  href: '#' },
]

function NavLink({ icon, label, href, active, grayed }: { icon: string; label: string; href: string; active: boolean; grayed?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 rounded-lg text-nav-label transition-all',
        grayed
          ? 'text-on-surface-variant/40 hover:text-on-surface-variant/60'
          : active
            ? 'bg-primary/10 text-primary font-semibold translate-x-0.5'
            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
      )}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
      <span className="flex-1">{label}</span>
      {grayed && (
        <span className="text-[9px] font-bold text-on-surface-variant/30 uppercase tracking-wider">—</span>
      )}
    </Link>
  )
}

export function SideNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const role = user?.role ?? 'developer'
  const roleSections = ROLE_SECTIONS[role] ?? ROLE_SECTIONS.developer

  const activeSections = roleSections.active.map(k => ALL_SECTIONS[k]).filter(Boolean)
  const grayedSections = roleSections.grayed.map(k => ALL_SECTIONS[k]).filter(Boolean)

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

      {/* Active nav items */}
      <nav className="flex-1 px-3 overflow-y-auto pb-2">
        <div className="space-y-0.5">
          {activeSections.flatMap(({ label, items }) =>
            items.map(({ icon, label: itemLabel, href }) => (
              <NavLink
                key={`${label}-${itemLabel}`}
                icon={icon}
                label={itemLabel}
                href={href}
                active={isActive(href)}
              />
            ))
          )}
        </div>

        {/* Grayed legacy items */}
        {grayedSections.length > 0 && (
          <>
            <div className="my-3 border-t border-outline-variant/30" />
            <div className="space-y-0.5">
              {grayedSections.flatMap(({ label, items }) =>
                items.map(({ icon, label: itemLabel, href }) => (
                  <NavLink
                    key={`grayed-${label}-${itemLabel}`}
                    icon={icon}
                    label={itemLabel}
                    href={href}
                    active={false}
                    grayed
                  />
                ))
              )}
            </div>
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="p-3 pt-4 border-t border-outline-variant space-y-1">
        {role === 'developer' && (
          <Link
            href="/onboard/project-details"
            className="flex w-full items-center justify-center gap-2 bg-primary text-on-primary font-label-caps text-label-caps py-3 rounded-lg hover:opacity-90 transition-all mb-3"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Issue Asset
          </Link>
        )}
        {role === 'securitisation_agent' && (
          <Link
            href="/securities/new"
            className="flex w-full items-center justify-center gap-2 bg-secondary text-on-secondary font-label-caps text-label-caps py-3 rounded-lg hover:opacity-90 transition-all mb-3"
          >
            <span className="material-symbols-outlined text-[16px]">hub</span>
            Structure Pool
          </Link>
        )}
        {role === 'portfolio_manager' && (
          <Link
            href="/pool-requests"
            className="flex w-full items-center justify-center gap-2 bg-primary text-on-primary font-label-caps text-label-caps py-3 rounded-lg hover:opacity-90 transition-all mb-3"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Pool Request
          </Link>
        )}
        {BOTTOM_ITEMS.map(({ icon, label, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-nav-label text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            {label}
          </Link>
        ))}
      </div>
    </aside>
  )
}
