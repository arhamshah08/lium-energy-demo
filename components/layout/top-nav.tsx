'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/auth-context'

export function TopNav() {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-surface shadow-card sticky top-0 z-50">
      <nav className="flex justify-between items-center h-16 px-margin-desktop max-w-container mx-auto">
        <Link href="/" className="text-headline-md font-bold text-primary">
          LIUM Energy
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-on-surface-variant hidden md:block">
                {user.fullName || user.email}
              </span>
              <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
