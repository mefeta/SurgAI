import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  loading,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.98]'

  const variants = {
    primary:
      'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_16px_rgba(0,242,254,0.25)] hover:scale-[1.02] shadow-lg shadow-cyan-500/10',
    secondary:
      'bg-gradient-to-r from-violet-500 to-violet-600 text-white hover:shadow-[0_0_16px_rgba(124,82,255,0.25)] hover:scale-[1.02] shadow-lg shadow-violet-500/10',
    outline:
      'border border-slate-600/50 backdrop-blur-sm bg-slate-800/30 text-slate-200 hover:bg-slate-700/30 hover:border-cyan-400/40 hover:text-cyan-300 dark:border-slate-600/50 dark:bg-slate-800/30 dark:text-slate-200 dark:hover:bg-slate-700/30 not-dark:border-slate-300/50 not-dark:bg-white/50 not-dark:text-slate-700 not-dark:hover:bg-white/80 not-dark:hover:border-cyan-400/50',
    ghost:
      'text-slate-400 hover:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800/50 not-dark:text-slate-600 not-dark:hover:bg-slate-100/80',
    danger:
      'bg-gradient-to-r from-rose-500 to-red-600 text-white hover:shadow-[0_0_16px_rgba(255,77,77,0.25)] hover:scale-[1.02] shadow-lg shadow-rose-500/10',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
