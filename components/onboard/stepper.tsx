import { cn } from '@/lib/utils'
import { ONBOARD_STEPS, type OnboardStep } from '@/types'

export function Stepper({ currentStep, projectId }: { currentStep: OnboardStep; projectId?: string }) {
  const query = projectId ? `?id=${projectId}` : ''

  return (
    <div className="flex items-center w-full gap-2 py-6 border-y border-outline-variant/30">
      {ONBOARD_STEPS.map(({ step, label, icon }, i) => {
        const done = step < currentStep
        const active = step === currentStep
        const disabled = step > currentStep

        return (
          <div key={step} className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className={cn(
                'flex items-center gap-2 shrink-0 px-3 py-2 rounded-full text-label-caps transition-all',
                done && 'text-secondary',
                active && 'text-primary bg-primary/5 ring-2 ring-primary/10',
                disabled && 'text-on-surface-variant opacity-40',
              )}
            >
              {done ? (
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
              )}
              <span className="hidden sm:block whitespace-nowrap">{label}</span>
            </div>
            {i < ONBOARD_STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-px',
                  done ? 'bg-secondary/40' : 'bg-outline-variant/30',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
