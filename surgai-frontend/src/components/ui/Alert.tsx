import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title: string
  description?: string
  onClose?: () => void
  className?: string
}

export function Alert({ variant = 'info', title, description, onClose, className }: AlertProps) {
  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
  }

  const styles = {
    info: 'bg-cyan-500/10 border-cyan-500/30 backdrop-blur-sm dark:bg-cyan-500/10 dark:border-cyan-500/30 not-dark:bg-cyan-50 not-dark:border-cyan-200',
    success: 'bg-violet-500/10 border-violet-500/30 backdrop-blur-sm dark:bg-violet-500/10 dark:border-violet-500/30 not-dark:bg-violet-50 not-dark:border-violet-200',
    warning: 'bg-amber-500/10 border-amber-500/30 backdrop-blur-sm dark:bg-amber-500/10 dark:border-amber-500/30 not-dark:bg-amber-50 not-dark:border-amber-200',
    error: 'bg-rose-500/10 border-rose-500/30 backdrop-blur-sm dark:bg-rose-500/10 dark:border-rose-500/30 not-dark:bg-red-50 not-dark:border-red-200',
  }

  const iconColors = {
    info: 'text-cyan-400 dark:text-cyan-400 not-dark:text-cyan-600',
    success: 'text-violet-400 dark:text-violet-400 not-dark:text-violet-600',
    warning: 'text-amber-400 dark:text-amber-400 not-dark:text-amber-600',
    error: 'text-rose-400 dark:text-rose-400 not-dark:text-red-600',
  }

  const textColors = {
    info: 'text-cyan-200 dark:text-cyan-200 not-dark:text-cyan-800',
    desc: 'text-slate-200 dark:text-slate-200 not-dark:text-cyan-700',
  }

  const Icon = icons[variant]

  return (
    <div className={cn('flex items-start gap-3 p-4 rounded-xl border', styles[variant], className)} role="alert">
      <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', iconColors[variant])} />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', variant === 'info' ? 'text-cyan-200 dark:text-cyan-200 not-dark:text-cyan-800' : variant === 'success' ? 'text-violet-200 dark:text-violet-200 not-dark:text-violet-800' : variant === 'warning' ? 'text-amber-200 dark:text-amber-200 not-dark:text-amber-800' : 'text-rose-200 dark:text-rose-200 not-dark:text-red-800')}>
          {title}
        </p>
        {description && (
          <p className={cn('mt-1 text-sm', variant === 'info' ? 'text-slate-300 dark:text-slate-300 not-dark:text-cyan-700' : variant === 'success' ? 'text-slate-300 dark:text-slate-300 not-dark:text-violet-700' : variant === 'warning' ? 'text-slate-300 dark:text-slate-300 not-dark:text-amber-700' : 'text-slate-300 dark:text-slate-300 not-dark:text-red-700')}>
            {description}
          </p>
        )}
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 p-1 rounded hover:bg-white/10 dark:hover:bg-white/10 not-dark:hover:bg-black/5 transition-colors" aria-label="Close">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      )}
    </div>
  )
}
