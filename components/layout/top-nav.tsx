import Link from 'next/link'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { label: 'Registry', href: '#' },
  { label: 'Treasury', href: '#' },
  { label: 'Settlement', href: '#' },
  { label: 'Risk Portal', href: '#' },
]

export function TopNav() {
  return (
    <header className="bg-surface shadow-card sticky top-0 z-50">
      <nav className="flex justify-between items-center h-16 px-margin-desktop max-w-container mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-headline-md font-bold text-primary">
            LIUM Network
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-label-caps text-on-surface-variant hover:text-primary transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">Transfer</Button>
          <Button variant="primary" size="sm">Issue</Button>
          <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant" />
        </div>
      </nav>
    </header>
  )
}
