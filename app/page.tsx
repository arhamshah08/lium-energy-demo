import Image from 'next/image'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { HeroCta, CtaBannerLink } from '@/components/layout/hero-cta'

const FEATURES = [
  {
    icon: 'bolt',
    title: 'Tokenise Assets',
    description: 'Onboard solar, wind, and grid projects with standardised documentation and on-chain registration.',
  },
  {
    icon: 'handshake',
    title: 'Match Investors',
    description: 'Connect with institutional capital through a compliant deal room and verified participant registry.',
  },
  {
    icon: 'rocket_launch',
    title: 'Close Faster',
    description: 'Automated workflows take projects from listing to fully funded in days, not months.',
  },
]

const STATS = [
  { value: '$2.4B', label: 'Assets Onboarded' },
  { value: '140+', label: 'Active Projects' },
  { value: '60+', label: 'Institutional Investors' },
  { value: '12', label: 'Jurisdictions' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav />

      {/* ── Hero ── */}
      <section className="bg-primary">
        <div className="max-w-container mx-auto px-margin-desktop py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>

            <h1 className="text-display-lg text-white mb-5">
              Real assets.<br />Global capital.
            </h1>
            <p className="text-body-base text-primary-fixed mb-8 max-w-md">
              Securitise utility-scale energy projects and connect them to institutional investors — on one platform.
            </p>
            <HeroCta />
          </div>

          {/* Hero image */}
          <div className="rounded-2xl overflow-hidden shadow-card-hover">
            <Image
              src="/hero-lium.png"
              alt="LIUM Energy — Asset Dashboard"
              width={720}
              height={480}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-background py-16">
        <div className="max-w-container mx-auto px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, title, description }) => (
              <div
                key={title}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card overflow-hidden hover:shadow-card-hover transition-all"
              >
                <div className="bg-surface-container-high h-44 flex items-center justify-center border-b border-outline-variant">
                  <span className="material-symbols-outlined text-[120px] text-primary">{icon}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-headline-md text-on-surface mb-2">{title}</h3>
                  <p className="text-body-base text-on-surface-variant leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-surface-container-low py-12 border-y border-outline-variant">
        <div className="max-w-container mx-auto px-margin-desktop grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-bold text-primary">{value}</p>
              <p className="text-caption text-on-surface-variant mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-secondary py-16">
        <div className="max-w-container mx-auto px-margin-desktop text-center">
          <h2 className="text-headline-md text-white mb-3">Ready to get started?</h2>
          <p className="text-body-base text-secondary-fixed-dim mb-8 max-w-lg mx-auto">
            Join the growing network of developers, financiers, and investors building the next generation of energy infrastructure.
          </p>
          <CtaBannerLink />
        </div>
      </section>

      <Footer />
    </div>
  )
}
