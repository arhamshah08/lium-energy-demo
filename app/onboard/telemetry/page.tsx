import { redirect } from 'next/navigation'
import { Stepper } from '@/components/onboard/stepper'
import { TelemetryForm } from '@/components/onboard/telemetry-form'

interface Props {
  searchParams: Promise<{ id?: string }>
}

export default async function TelemetryPage({ searchParams }: Props) {
  const { id } = await searchParams
  if (!id) redirect('/onboard/project-details')

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-display-lg text-primary mb-2">Onboarding</h1>
            <p className="text-body-base text-on-surface-variant max-w-2xl">
              Connect your physical energy infrastructure to the LIUM real-time oracle network to enable
              trustless settlement and institutional liquidity.
            </p>
          </div>
        </div>
      </div>

      <Stepper currentStep={3} projectId={id} />

      <div className="mt-8 grid grid-cols-12 gap-gutter">
        <div className="col-span-12 lg:col-span-8">
          <TelemetryForm projectId={id} />
        </div>
        <aside className="col-span-12 lg:col-span-4">
          <div className="bg-primary p-8 rounded-xl text-white shadow-xl sticky top-24">
            <span
              className="material-symbols-outlined text-4xl mb-6 block"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield_with_heart
            </span>
            <h4 className="text-headline-md mb-4">Institutional Trust Factor</h4>
            <p className="text-body-base opacity-90 mb-6 leading-relaxed">
              Telemetry data provides real-time verification of asset performance, eliminating reporting
              delay and manual audit costs.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                { icon: 'bolt', title: 'Loss Quotient (LQ)', body: 'Telemetry streams reduce LQ scores by 15%, lowering your financing costs.' },
                { icon: 'trending_up', title: 'DSCR Accuracy', body: 'Direct feeds provide financiers with precise debt service coverage ratios.' },
              ].map(({ icon, title, body }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary-fixed mt-1">{icon}</span>
                  <div>
                    <span className="block font-bold text-label-caps">{title}</span>
                    <span className="text-caption opacity-80">{body}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-4 bg-white/10 rounded-lg border border-white/20 text-center">
              <p className="text-caption italic opacity-70">Verified assets receive a +1.2% Yield Premium.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
