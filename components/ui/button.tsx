import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:opacity-90 shadow-sm',
  secondary: 'bg-secondary text-white hover:opacity-90 shadow-sm',
  outline: 'border border-secondary text-secondary hover:bg-secondary-container',
  ghost: 'text-on-surface-variant hover:text-on-surface',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-label-caps',
  md: 'px-6 py-3 text-label-caps',
  lg: 'px-10 py-3 text-label-caps',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-label-caps transition-all active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'
