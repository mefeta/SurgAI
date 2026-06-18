import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import en from '@/translations/en.json'
import tr from '@/translations/tr.json'

type Locale = 'en' | 'tr'
type TranslationMap = Record<string, string>

const translations: Record<Locale, TranslationMap> = { en, tr }

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextType | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    return (typeof window !== 'undefined' ? localStorage.getItem('surgai_locale') as Locale : null) || 'en'
  })

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('surgai_locale', newLocale)
    window.dispatchEvent(new CustomEvent('localechange', { detail: newLocale }))
  }, [])

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const map = translations[locale]
    let value = map[key]
    if (value === undefined) {
      console.warn(`Missing translation key: "${key}" for locale "${locale}"`)
      return key
    }
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{{${k}}}`, String(v))
      })
    }
    return value
  }, [locale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}

export type { Locale }
