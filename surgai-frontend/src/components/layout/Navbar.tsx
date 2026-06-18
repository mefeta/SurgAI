import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Moon, Sun, ChevronDown, Activity } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'
import { LanguageSwitcher } from './LanguageSwitcher'

interface NavbarProps {
  darkMode: boolean
  onToggleDark: () => void
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Navbar({ darkMode, onToggleDark }: NavbarProps) {
  const { user, logout } = useAuth()
  const { t } = useLocale()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  function handleSignOut() {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#080b11]/70 dark:bg-[#080b11]/70 not-dark:bg-white/70 border-b border-slate-800/50 dark:border-slate-800/50 not-dark:border-slate-200/50">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          {/* SurgAI Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_12px_rgba(0,242,254,0.2)]">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div className="font-heading">
              <span className="text-lg font-bold text-white dark:text-white not-dark:text-slate-900">Surg</span>
              <span className="text-lg font-bold text-cyan-400">AI</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="search"
              placeholder={t('navbar.searchPlaceholder')}
              className="pl-9 pr-4 py-2 w-64 lg:w-80 text-sm bg-slate-800/50 dark:bg-slate-800/50 not-dark:bg-slate-100/80 border border-slate-700/50 dark:border-slate-700/50 not-dark:border-slate-300/50 focus:border-cyan-400/50 rounded-xl text-slate-200 dark:text-slate-200 not-dark:text-slate-700 placeholder:text-slate-500 focus:outline-none transition-all backdrop-blur-sm"
              aria-label={t('navbar.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/history?search=${encodeURIComponent(searchQuery.trim())}`)
                  setSearchQuery('')
                }
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user?.clinic_name && (
            <span className="hidden sm:block text-sm text-slate-400 mr-2">{user.clinic_name}</span>
          )}

          <button
            onClick={onToggleDark}
            className="p-2 rounded-lg hover:bg-slate-800/50 dark:hover:bg-slate-800/50 not-dark:hover:bg-slate-100/80 transition-colors"
            aria-label={darkMode ? t('navbar.switchToLight') : t('navbar.switchToDark')}
          >
            {darkMode ? <Sun className="w-5 h-5 text-slate-400" /> : <Moon className="w-5 h-5 text-slate-400" />}
          </button>

          <LanguageSwitcher />

          <button className="relative p-2 rounded-lg hover:bg-slate-800/50 dark:hover:bg-slate-800/50 not-dark:hover:bg-slate-100/80 transition-colors" aria-label={t('navbar.notifications')}>
            <Bell className="w-5 h-5 text-slate-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#080b11] dark:border-[#080b11] not-dark:border-[#f4f7f6]" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800/50 dark:hover:bg-slate-800/50 not-dark:hover:bg-slate-100/80 transition-colors"
              aria-label={t('navbar.userMenu')}
              aria-expanded={showProfile}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-white text-sm font-semibold shadow-[0_0_8px_rgba(0,242,254,0.15)]">
                {user ? getInitials(user.full_name) : '??'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-200 dark:text-slate-200 not-dark:text-slate-700">{user?.full_name ?? t('navbar.user')}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role?.replace('_', ' ') ?? ''}</p>
              </div>
              <ChevronDown className="hidden md:block w-4 h-4 text-slate-500" />
            </button>

            {showProfile && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowProfile(false)} />
                <div className="absolute right-0 mt-1 w-56 backdrop-blur-xl bg-slate-900/90 dark:bg-slate-900/90 not-dark:bg-white/90 rounded-xl shadow-lg border border-slate-700/50 dark:border-slate-700/50 not-dark:border-slate-200/50 py-1 z-20">
                  <button className="w-full px-4 py-2 text-sm text-left text-slate-200 dark:text-slate-200 not-dark:text-slate-700 hover:bg-slate-800/50 not-dark:hover:bg-slate-100/80 transition-colors" onClick={() => { navigate('/settings'); setShowProfile(false) }}>{t('navbar.profile')}</button>
                  <button className="w-full px-4 py-2 text-sm text-left text-slate-200 dark:text-slate-200 not-dark:text-slate-700 hover:bg-slate-800/50 not-dark:hover:bg-slate-100/80 transition-colors" onClick={() => { navigate('/settings'); setShowProfile(false) }}>{t('navbar.clinicSettings')}</button>
                  <hr className="my-1 border-slate-700/50 dark:border-slate-700/50 not-dark:border-slate-200/50" />
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-sm text-left text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    {t('navbar.signOut')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
