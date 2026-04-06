import * as React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs))
}

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

export function Button({
  variant = 'primary',
  className,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        variant === 'primary' && 'bg-brand-500 text-white hover:bg-blue-600',
        variant === 'secondary' && 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
        variant === 'ghost' && 'bg-transparent text-slate-700 hover:bg-slate-100',
        variant === 'danger' && 'bg-red-500 text-white hover:bg-red-600',
        className,
      )}
    />
  )
}

