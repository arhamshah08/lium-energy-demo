const FOOTER_LINKS = [
  { label: 'Compliance Disclosure', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Issuance', href: '#' },
  { label: 'Registry Status', href: '#' },
]

export function Footer() {
  return (
    <footer className="bg-surface-container border-t border-outline-variant mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop py-8 max-w-container mx-auto gap-4">
        <div>
          <p className="font-bold text-on-surface">LIUM Network</p>
          <p className="text-caption text-on-surface-variant mt-1">
            © 2024 LIUM Network. All ledger entries are finalized on-chain for institutional audit.
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-6">
          {FOOTER_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-caption text-on-surface-variant hover:text-secondary transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
