import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  children: ReactNode
  className?: string
  size?: 'sm' | 'md'
}

export function Badge({ variant = 'default', children, className, size = 'sm' }: BadgeProps) {
  const variants = {
    default: 'bg-slate-800/70 text-slate-300 border border-slate-700/50 not-dark:bg-slate-100 not-dark:text-slate-700 not-dark:border-slate-200/50',
    success: 'bg-violet-500/15 text-violet-400 border border-violet-500/30 shadow-[0_0_8px_rgba(124,82,255,0.1)] not-dark:bg-violet-50 not-dark:text-violet-700 not-dark:border-violet-200/80',
    warning: 'bg-amber-500/15 text-amber-glow border border-amber-500/30 shadow-[0_0_8px_rgba(255,159,67,0.1)] not-dark:bg-amber-50 not-dark:text-amber-700 not-dark:border-amber-200/80',
    danger: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_8px_rgba(255,77,77,0.1)] not-dark:bg-red-50 not-dark:text-red-700 not-dark:border-red-200/80',
    info: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_8px_rgba(0,242,254,0.1)] not-dark:bg-cyan-50 not-dark:text-cyan-700 not-dark:border-cyan-200/80',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }

  return (
    <span className={cn('inline-flex items-center font-medium rounded-full backdrop-blur-sm', variants[variant], sizes[size], className)}>
      {children}
    </span>
  )
}
