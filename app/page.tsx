import Image from 'next/image'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { HeroCta, CtaBannerLink } from '@/components/layout/hero-cta'

const FEATURES = [
  {
    icon: 'solar_power',
    title: 'List Your Commissioned Asset',
    description: 'Once your project receives Permit to Operate, list it on LIUM. Financiers, securitisation agents, and institutional investors can discover it immediately.',
  },
  {
    icon: 'handshake',
    title: 'Connect with Capital',
    description: 'Multiple market participants — financiers, securitisation agents, portfolio managers — can discover your asset and make competitive offers.',
  },
  {
    icon: 'autorenew',
    title: 'Retire Debt. Redeploy.',
    description: 'Securitise the asset, retire construction debt, and recycle capital into your next project — faster than traditional structured finance.',
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
      <section className="bg-brand-gradient">
        <div className="max-w-container mx-auto px-margin-desktop py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>

            <h1 className="text-display-lg text-white mb-5">
              Build. Commission.<br />Recycle.
            </h1>
            <p className="text-body-base text-primary-fixed mb-8 max-w-md">
              LIUM turns commissioned energy assets into structured securities — so developers retire debt and redeploy capital into their next project.
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
      <section className="bg-gradient-to-r from-secondary to-[#0F766E] py-16">
        <div className="max-w-container mx-auto px-margin-desktop text-center">
          <h2 className="text-headline-md text-white mb-3">Start with your first asset</h2>
          <p className="text-body-base text-secondary-fixed-dim mb-8 max-w-lg mx-auto">
            List a commissioned project, get discovered by institutional capital, and close your first securitisation on LIUM.
          </p>
          <CtaBannerLink />
        </div>
      </section>

      <Footer />
    </div>
  )
}
