import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-public-sans), DM Sans, sans-serif', backgroundColor: '#F2F3F3' }}>

      {/* ── Top Nav ── */}
      <header style={{ backgroundColor: '#232F3E', borderBottom: '1px solid #3a4a5c' }}>
        <div className="max-w-container mx-auto px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span style={{ color: '#FF9900', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>LIUM</span>
            <span style={{ color: '#8a9bb0', fontSize: 13 }}>Energy Network</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/signin" style={{ color: '#d1dbe8', fontSize: 14 }} className="hover:text-white transition-colors">Sign in</Link>
            <Link
              href="/signup/developer"
              style={{ backgroundColor: '#FF9900', color: '#0d1117', fontSize: 13, fontWeight: 600, padding: '6px 16px', borderRadius: 2 }}
              className="hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ backgroundColor: '#232F3E' }} className="pb-16 pt-12">
        <div className="max-w-container mx-auto px-10 grid grid-cols-2 gap-12 items-center">
          <div>
            <p style={{ color: '#FF9900', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Institutional Infrastructure Finance
            </p>
            <h1 style={{ color: '#ffffff', fontSize: 42, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 16 }}>
              Real assets.<br />Global capital.
            </h1>
            <p style={{ color: '#8a9bb0', fontSize: 16, lineHeight: 1.6, marginBottom: 28, maxWidth: 400 }}>
              Securitise utility-scale energy projects and connect them to institutional investors — on one platform.
            </p>
            <div className="flex gap-3">
              <Link
                href="/signup/developer"
                style={{ backgroundColor: '#FF9900', color: '#0d1117', fontSize: 14, fontWeight: 600, padding: '10px 24px', borderRadius: 2 }}
                className="hover:opacity-90 transition-opacity"
              >
                List a Project
              </Link>
              <Link
                href="/signup/investor"
                style={{ border: '1px solid #4a5e72', color: '#d1dbe8', fontSize: 14, fontWeight: 500, padding: '10px 24px', borderRadius: 2 }}
                className="hover:border-gray-400 transition-colors"
              >
                Browse Assets
              </Link>
            </div>
          </div>

          {/* Hero image placeholder */}
          <div
            style={{ backgroundColor: '#1a2733', border: '1px solid #2e3f52', borderRadius: 4, height: 320 }}
            className="flex items-center justify-center"
          >
            <div className="text-center">
              <div style={{ width: 48, height: 48, backgroundColor: '#2e3f52', borderRadius: 4, margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="1" stroke="#4a5e72" strokeWidth="1.5"/>
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="#4a5e72" strokeWidth="1.5"/>
                  <path d="M21 15l-5-5L5 21" stroke="#4a5e72" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{ color: '#4a5e72', fontSize: 12 }}>Hero Image</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider bar ── */}
      <div style={{ height: 4, backgroundColor: '#FF9900' }} />

      {/* ── 3-column features ── */}
      <section style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #dde1e7' }}>
        <div className="max-w-container mx-auto px-10 py-12 grid grid-cols-3 gap-8">
          {[
            { label: 'Tokenise Assets', sub: 'Onboard solar, wind, and grid projects with standardised documentation.', icon: '⚡' },
            { label: 'Match Investors', sub: 'Connect with institutional capital through a compliant deal room.', icon: '🔗' },
            { label: 'Close Faster', sub: 'Automated workflows take projects from listing to funded in days.', icon: '✓' },
          ].map((item) => (
            <div key={item.label} style={{ borderLeft: '3px solid #FF9900', paddingLeft: 20 }}>
              {/* Image placeholder */}
              <div
                style={{ backgroundColor: '#F2F3F3', border: '1px solid #dde1e7', borderRadius: 4, height: 160, marginBottom: 16 }}
                className="flex items-center justify-center"
              >
                <div className="text-center">
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</div>
                  <span style={{ color: '#8a9bb0', fontSize: 11 }}>Image</span>
                </div>
              </div>
              <h3 style={{ color: '#0d1117', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{item.label}</h3>
              <p style={{ color: '#5f6b7a', fontSize: 14, lineHeight: 1.6 }}>{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ backgroundColor: '#232F3E' }}>
        <div className="max-w-container mx-auto px-10 py-8 grid grid-cols-4 gap-8">
          {[
            { value: '$2.4B', label: 'Assets Onboarded' },
            { value: '140+', label: 'Active Projects' },
            { value: '60+', label: 'Institutional Investors' },
            { value: '12', label: 'Jurisdictions' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div style={{ color: '#FF9900', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>{stat.value}</div>
              <div style={{ color: '#8a9bb0', fontSize: 13, marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: '#1a2530', borderTop: '1px solid #2e3f52' }}>
        <div className="max-w-container mx-auto px-10 py-6 flex items-center justify-between">
          <span style={{ color: '#FF9900', fontWeight: 700, fontSize: 16 }}>LIUM</span>
          <span style={{ color: '#4a5e72', fontSize: 12 }}>© 2026 LIUM Energy Network. All rights reserved.</span>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact'].map((l) => (
              <a key={l} href="#" style={{ color: '#8a9bb0', fontSize: 12 }} className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}
