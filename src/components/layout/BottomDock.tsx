import { useState } from 'react'
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
  const [isExpanded, setIsExpanded] = useState(false)

  const allItems = user?.is_admin
    ? [
        ...navItems,
        { icon: Shield, labelKey: 'nav.userManagement', path: '/admin' },
      ]
    : navItems

  return (
    <>
      {/* Spacer to prevent content from hiding behind the dock */}
      <div className="h-20 lg:h-24" />
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-2 pt-1 lg:pb-4 lg:pt-2 bg-gradient-to-t from-[#0b1124] via-[#0b1124]/80 to-transparent dark:from-[#0b1124] dark:via-[#0b1124]/80 not-dark:from-[#f4f7f6] not-dark:via-[#f4f7f6]/80"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div
          className={`flex items-center rounded-2xl backdrop-blur-xl bg-slate-900/60 dark:bg-slate-900/60 not-dark:bg-white/80 border border-slate-700/60 dark:border-slate-700/60 not-dark:border-slate-200/80 shadow-lg shadow-black/20 transition-all duration-300 ${
            isExpanded ? 'px-4 py-2.5 gap-1.5' : 'px-2 py-1.5 gap-1'
          }`}
        >
          {allItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center rounded-xl transition-all duration-300 group"
              >
                <div
                  className={`rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-500 shadow-[0_0_10px_rgba(237,27,36,0.15)]'
                      : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800/50'
                  } ${isExpanded ? 'p-1.5' : 'p-1.5 lg:p-2'}`}
                >
                  <item.icon className={`transition-all duration-300 ${
                    isExpanded ? 'w-4 h-4' : 'w-4 h-4 lg:w-5 lg:h-5'
                  }`} />
                </div>
                {/* Label — visible inline when dock is expanded */}
                <span
                  className={`text-[10px] font-medium transition-all duration-200 ${
                    isExpanded
                      ? 'opacity-100 translate-y-0 mt-0.5'
                      : 'opacity-0 translate-y-1 mt-0 pointer-events-none'
                  } ${isActive ? 'text-cyan-500' : 'text-slate-500'}`}
                >
                  {t(item.labelKey)}
                </span>
                {/* Active dot */}
                {isActive && (
                  <span
                    className={`absolute rounded-full bg-cyan-500 transition-all duration-200 ${
                      isExpanded
                        ? '-bottom-1 w-1 h-1'
                        : '-bottom-0.5 w-1 h-1'
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
