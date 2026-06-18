import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: ReactNode
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  glow?: boolean
}

export function Card({ className, children, hover, padding = 'md', glow }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  }

  return (
    <div
      className={cn(
        'backdrop-blur-xl bg-white/70 dark:bg-slate-900/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-lg shadow-black/5 dark:shadow-black/20',
        hover && 'hover:shadow-cyan-500/5 dark:hover:shadow-cyan-500/10 hover:border-cyan-400/30 dark:hover:border-cyan-400/30 transition-all duration-300',
        glow && 'shadow-[0_0_15px_rgba(0,242,254,0.08)] dark:shadow-[0_0_15px_rgba(0,242,254,0.12)] border-cyan-400/20 dark:border-cyan-400/30',
        paddings[padding],
        className,
      )}
    >
      {children}
    </div>
  )
}
