import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'
import {
  LayoutDashboard,
  PlusCircle,
  Calendar,
  Clock,
  Upload,
  BarChart3,
  Settings,
  Shield,
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, labelKey: 'nav.dashboard', path: '/dashboard' },
  { icon: PlusCircle, labelKey: 'nav.newPrediction', path: '/prediction' },
  { icon: Calendar, labelKey: 'nav.operationSchedule', path: '/schedule' },
  { icon: Clock, labelKey: 'nav.caseHistory', path: '/history' },
  { icon: Upload, labelKey: 'nav.dataUpload', path: '/upload' },
  { icon: BarChart3, labelKey: 'nav.modelAnalytics', path: '/analytics' },
  { icon: Settings, labelKey: 'nav.settings', path: '/settings' },
]

export function BottomDock() {
  const { user } = useAuth()
  const { t } = useLocale()
  const location = useLocation()
  const navigate = useNavigate()

  const allItems = user?.is_admin
    ? [
        ...navItems,
        { icon: Shield, labelKey: 'nav.userManagement', path: '/admin' },
      ]
    : navItems

  return (
    <>
      {/* Spacer to prevent content from hiding behind the dock on mobile */}
      <div className="h-20 lg:h-24" />
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-2 pt-1 lg:pb-4 lg:pt-2 bg-gradient-to-t from-[#080b11] via-[#080b11]/80 to-transparent dark:from-[#080b11] dark:via-[#080b11]/80 not-dark:from-[#f4f7f6] not-dark:via-[#f4f7f6]/80">
        <div className="flex items-center gap-1 px-2 py-1.5 lg:gap-1.5 lg:px-3 lg:py-2 rounded-2xl backdrop-blur-xl bg-slate-900/60 dark:bg-slate-900/60 not-dark:bg-white/80 border border-slate-700/60 dark:border-slate-700/60 not-dark:border-slate-200/80 shadow-lg shadow-black/20">
          {allItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={t(item.labelKey)}
                className="relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 lg:px-3 lg:py-2 rounded-xl transition-all duration-200 group"
              >
                <div
                  className={`p-1.5 lg:p-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 shadow-[0_0_10px_rgba(0,242,254,0.15)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <item.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                </div>
                {isActive && (
                  <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f2fe]" />
                )}
                {/* Tooltip */}
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] font-medium text-white bg-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg border border-slate-700/50 backdrop-blur-sm">
                  {t(item.labelKey)}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
