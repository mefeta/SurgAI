import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: { value: number; positive: boolean }
  color?: 'cyan' | 'violet' | 'amber' | 'rose' | 'surgai' | 'teal' | 'red' | 'blue'
  className?: string
  progress?: number // 0-100 for the circular ring
}

const ringColors = {
  cyan: { stroke: '#00f2fe', bg: '#00f2fe15' },
  violet: { stroke: '#7c52ff', bg: '#7c52ff15' },
  amber: { stroke: '#ff9f43', bg: '#ff9f4315' },
  rose: { stroke: '#ff4d4d', bg: '#ff4d4d15' },
  surgai: { stroke: '#00f2fe', bg: '#00f2fe15' },
  teal: { stroke: '#7c52ff', bg: '#7c52ff15' },
  red: { stroke: '#ff4d4d', bg: '#ff4d4d15' },
  blue: { stroke: '#4facfe', bg: '#4facfe15' },
}

const iconColors = {
  cyan: 'bg-cyan-500/15 text-cyan-400 shadow-[0_0_10px_rgba(0,242,254,0.15)]',
  violet: 'bg-violet-500/15 text-violet-400 shadow-[0_0_10px_rgba(124,82,255,0.15)]',
  amber: 'bg-amber-500/15 text-amber-glow shadow-[0_0_10px_rgba(255,159,67,0.15)]',
  rose: 'bg-rose-500/15 text-rose-neon shadow-[0_0_10px_rgba(255,77,77,0.15)]',
  surgai: 'bg-cyan-500/15 text-cyan-400 shadow-[0_0_10px_rgba(0,242,254,0.15)]',
  teal: 'bg-violet-500/15 text-violet-400 shadow-[0_0_10px_rgba(124,82,255,0.15)]',
  red: 'bg-rose-500/15 text-rose-neon shadow-[0_0_10px_rgba(255,77,77,0.15)]',
  blue: 'bg-blue-500/15 text-blue-400 shadow-[0_0_10px_rgba(79,172,254,0.15)]',
}

const CIRCUMFERENCE = 2 * Math.PI * 42

export function KpiCard({ title, value, subtitle, icon, trend, color = 'cyan', className, progress }: KpiCardProps) {
  const rc = ringColors[color] || ringColors.cyan
  const ic = iconColors[color] || iconColors.cyan
  const offset = progress != null ? CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE : CIRCUMFERENCE

  return (
    <div
      className={cn(
        'relative overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-slate-900/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-lg shadow-black/5 dark:shadow-black/20 p-5 transition-all duration-300',
        'hover:shadow-cyan-500/5 dark:hover:shadow-cyan-500/10 hover:border-cyan-400/30 dark:hover:border-cyan-400/30',
        className,
      )}
    >
      {/* Circular progress ring */}
      {progress != null && (
        <div className="absolute -top-3 -right-3 w-28 h-28 opacity-60">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle cx="50" cy="50" r="42" fill="none" stroke={rc.bg} strokeWidth="6" />
            {/* Progress ring */}
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke={rc.stroke} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              className="animate-ring-fill"
              style={{ '--ring-offset': `${offset}px` } as React.CSSProperties}
            />
          </svg>
        </div>
      )}

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-sm text-slate-400 dark:text-slate-400 not-dark:text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-white dark:text-white not-dark:text-slate-900 font-heading">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-500 not-dark:text-slate-400">{subtitle}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl backdrop-blur-sm', ic)}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className={cn('mt-3 flex items-center gap-1 text-xs font-medium', trend.positive ? 'text-cyan-400' : 'text-rose-400')}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={trend.positive ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
          </svg>
          {trend.value}% {trend.positive ? 'increase' : 'decrease'}
        </div>
      )}
    </div>
  )
}
