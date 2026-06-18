import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  size?: 'sm' | 'md'
  color?: 'cyan' | 'violet' | 'amber' | 'rose'
  showLabel?: boolean
  className?: string
}

export function ProgressBar({ value, max = 100, size = 'md', color = 'cyan', showLabel, className }: ProgressBarProps) {
  const percentage = Math.min(100, Math.round((value / max) * 100))

  const colors = {
    cyan: 'bg-gradient-to-r from-cyan-400 to-cyan-500',
    violet: 'bg-gradient-to-r from-violet-400 to-violet-500',
    amber: 'bg-gradient-to-r from-amber-400 to-amber-500',
    rose: 'bg-gradient-to-r from-rose-400 to-red-500',
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('flex-1 bg-slate-700/50 dark:bg-slate-700/50 not-dark:bg-slate-200 rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2.5')}>
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_6px_rgba(0,242,254,0.2)]', colors[color])}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-slate-400 dark:text-slate-400 not-dark:text-slate-600 min-w-[3ch]">{percentage}%</span>
      )}
    </div>
  )
}
