import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="block text-label-caps font-bold text-on-surface tracking-widest">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-white border border-outline-variant rounded-lg py-3 text-body-base text-on-surface',
              'focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all',
              'placeholder:text-outline',
              icon ? 'pl-10 pr-4' : 'px-4',
              error && 'border-error focus:ring-error/20 focus:border-error',
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="text-caption text-error">{error}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, options, id, className, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={selectId} className="block text-label-caps font-bold text-on-surface tracking-widest">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full bg-white border border-outline-variant rounded-lg px-4 py-3 text-body-base text-on-surface',
          'focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all',
          error && 'border-error',
          className,
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-caption text-error">{error}</p>}
    </div>
  )
}
