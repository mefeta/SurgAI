import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

function getCurrentLocale(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('surgai_locale') === 'tr' ? 'tr-TR' : 'en-US'
  }
  return 'en-US'
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString(getCurrentLocale(), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateTime(date: Date): string {
  return date.toLocaleDateString(getCurrentLocale(), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateWithLocale(date: Date, options?: Intl.DateTimeFormatOptions): string {
  return date.toLocaleDateString(getCurrentLocale(), options)
}

export function getConfidenceColor(score: number): string {
  if (score >= 85) return 'text-teal-600'
  if (score >= 70) return 'text-amber-600'
  return 'text-red-600'
}

export function getRiskColor(level: string): string {
  switch (level) {
    case 'Low': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300'
    case 'Medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
    case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Completed': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300'
    case 'Scheduled': return 'bg-surgai-100 text-surgai-800 dark:bg-surgai-900/40 dark:text-surgai-300'
    case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
    case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
    case 'Delayed': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
}
