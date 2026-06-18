import { useLocale } from '@/context/LocaleContext'

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()

  const toggle = () => {
    setLocale(locale === 'en' ? 'tr' : 'en')
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-semibold text-slate-600 dark:text-slate-400 min-w-[40px]"
      aria-label={locale === 'en' ? 'Switch to Turkish' : 'Switch to English'}
    >
      {locale === 'en' ? 'TR' : 'EN'}
    </button>
  )
}
