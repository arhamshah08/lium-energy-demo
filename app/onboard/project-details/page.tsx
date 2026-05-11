import { Stepper } from '@/components/onboard/stepper'
import { ProjectDetailsForm } from '@/components/onboard/project-details-form'
import { Card, CardBody } from '@/components/ui/card'
import { getProject } from '@/lib/store'

interface Props {
  searchParams: Promise<{ id?: string; submitted?: string }>
}

export default async function ProjectDetailsPage({ searchParams }: Props) {
  const { id, submitted } = await searchParams
  const project = id ? getProject(id) : undefined

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-display-lg text-on-surface mb-2">Create financeable energy project</h1>
        <p className="text-body-base text-on-surface-variant">
          Step 1 of 3: Define the core parameters of your utility-scale asset.
        </p>
      </div>

      <Stepper currentStep={1} projectId={id} />

      {submitted && (
        <div className="my-6 flex items-center gap-3 bg-secondary-container/30 border border-secondary-container/50 rounded-xl px-6 py-4">
          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <div>
            <p className="font-bold text-on-secondary-container">Project submitted successfully</p>
            <p className="text-caption text-on-secondary-container/80">
              Your asset is now pending institutional review on the LIUM Network.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-12 gap-gutter">
        <div className="col-span-12 lg:col-span-8">
          <ProjectDetailsForm />
        </div>
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-secondary-container/30 p-6 rounded-xl border border-secondary-container/50">
            <div className="flex items-start gap-3 mb-4">
              <span className="material-symbols-outlined text-secondary">info</span>
              <h3 className="text-headline-md text-on-secondary-container">Institutional Trust</h3>
            </div>
            <p className="text-body-base text-on-secondary-container mb-4">
              Your asset details are the primary anchor for securitization. Accurate geolocation ensures
              compliance with regional environmental mandates.
            </p>
            <ul className="space-y-2">
              {['Verified Jurisdictional Logic', 'On-chain Identity Mapping'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-caption text-on-secondary-container">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {project && (
            <Card>
              <CardBody className="space-y-3">
                <p className="text-label-caps font-bold text-on-surface-variant tracking-widest">CURRENT PROJECT</p>
                <p className="text-headline-md text-on-surface">{project.name}</p>
                <p className="text-caption text-on-surface-variant">{project.location} · {project.jurisdiction}</p>
              </CardBody>
            </Card>
          )}
        </aside>
      </div>
    </div>
  )
}
