import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-surface-container-lowest rounded-xl border border-[#E2E8F0]',
        'shadow-card hover:shadow-card-hover hover:-translate-y-px transition-all duration-200',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-8 pt-8 pb-6 border-b border-outline-variant/50', className)} {...props}>
      {children}
    </div>
  )
}

export function CardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-8', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-8 pb-8 pt-6 border-t border-outline-variant/50 flex justify-between items-center', className)}
      {...props}
    >
      {children}
    </div>
  )
}
