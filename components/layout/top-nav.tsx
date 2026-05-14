'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/auth-context'

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
  return (
    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
      {initials || '?'}
    </div>
  )
}

export function TopNav() {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-surface shadow-card sticky top-0 z-50 border-b border-outline-variant/40">
      <nav className="flex justify-between items-center h-16 px-margin-desktop max-w-container mx-auto">
        <Link href="/" className="text-headline-sm font-bold text-on-surface">
          LIUM<span className="text-primary"> Energy</span>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2.5">
                <UserAvatar name={user.fullName || user.email} />
                <div className="leading-tight">
                  <p className="text-sm font-medium text-on-surface">{user.fullName || user.email}</p>
                  <p className="text-xs text-on-surface-variant capitalize">{user.role.replace('_', ' ')}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut}>Sign Out</Button>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
