import { redirect } from 'next/navigation'
import { Stepper } from '@/components/onboard/stepper'
import { DocumentVaultForm } from '@/components/onboard/document-vault-form'

interface Props {
  searchParams: Promise<{ id?: string }>
}

export default async function DocumentVaultPage({ searchParams }: Props) {
  const { id } = await searchParams
  if (!id) redirect('/onboard/project-details')

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-display-lg text-on-surface mb-2">Create financeable energy project</h1>
        <p className="text-body-base text-on-surface-variant">
          Step 2 of 5: Upload mandatory documentation for institutional audit.
        </p>
      </div>

      <Stepper currentStep={2} projectId={id} />

      <div className="mt-8 grid grid-cols-12 gap-gutter">
        <div className="col-span-12 lg:col-span-8">
          <DocumentVaultForm projectId={id} />
        </div>
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-primary-container/20 p-6 rounded-xl border border-primary/10">
            <div className="flex items-start gap-3 mb-4">
              <span className="material-symbols-outlined text-on-primary-container">inventory</span>
              <h3 className="text-headline-md text-on-primary-container">Diligence Pack</h3>
            </div>
            <p className="text-body-base text-on-primary-container mb-4">
              These documents form the foundation of your asset&apos;s &ldquo;Diligence Pack&rdquo;. Institutional
              financiers review this package to verify risk and issue funding.
            </p>
            <div className="p-4 bg-white/40 rounded-lg">
              <p className="text-label-caps font-bold text-on-primary-container mb-2 uppercase tracking-wider">
                Audit Requirement
              </p>
              <p className="text-caption text-on-primary-container/80">
                All files are encrypted on-chain and only accessible to verified network participants during
                the funding window.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
