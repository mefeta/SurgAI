import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'
import { formatDuration, getRiskColor } from '@/lib/utils'
import { api } from '@/api/client'
import { getPredictedVsActual, getErrorByOperationType } from '@/api/analytics'
import { getScheduleByDay, type ScheduleResponse } from '@/api/schedule'
import {
  Calendar,
  Clock,
  AlertTriangle,
  UserCheck,
  Brain,
  Activity,
  ArrowRight,
  Zap,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DashboardStats {
  today_scheduled_operations: number
  average_predicted_duration: number
  schedule_risk_level: string
  delayed_cases: number
  model_confidence_average: number
  total_analyzed_operations: number
  average_delay_reduction: number
  saved_clinic_hours: number
}

interface RecentActivityItem {
  action: string
  detail: string
  time: string
}

export function DashboardPage() {
  const { user } = useAuth()
  const { t } = useLocale()
  const firstName = user?.full_name?.split(' ')[0] ?? t('navbar.user')

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<RecentActivityItem[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingActivity, setLoadingActivity] = useState(true)
  const [barChartData, setBarChartData] = useState<{ name: string; predicted: number; actual: number }[]>([])
  const [pieChartData, setPieChartData] = useState<{ name: string; value: number }[]>([])
  const [todaySchedules, setTodaySchedules] = useState<ScheduleResponse[]>([])
  const [loadingSchedule, setLoadingSchedule] = useState(true)

  useEffect(() => {
    api.get<DashboardStats>('/dashboard/stats')
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false))

    api.get<RecentActivityItem[]>('/dashboard/recent-activity')
      .then(setActivity)
      .catch(() => setActivity([]))
      .finally(() => setLoadingActivity(false))

    getPredictedVsActual()
      .then((data) => {
        if (data.length > 0) {
          setBarChartData(data.map((d, i) => ({
            name: `Op ${i + 1}`,
            predicted: d.predicted,
            actual: d.actual,
          })))
        }
      })
      .catch(() => {})

    getErrorByOperationType()
      .then((data) => {
        if (data.length > 0) {
          setPieChartData(data.map((d) => ({
            name: d.operation_type,
            value: Math.max(d.error_minutes, 1),
          })))
        }
      })
      .catch(() => {})

    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    getScheduleByDay(dateStr)
      .then((res) => setTodaySchedules(res.schedules))
      .catch(() => {})
      .finally(() => setLoadingSchedule(false))
  }, [])

  const alerts = [
    ...todaySchedules
      .filter((s) => s.conflict_warning)
      .map((s) => ({
        id: `conflict-${s.id}`,
        type: 'warning' as const,
        title: t('dashboard.conflictTitle'),
        description: s.conflict_warning!,
      })),
    ...todaySchedules
      .filter((s) => s.risk_level === 'High' && (s.predicted_duration ?? 0) > 120)
      .map((s) => ({
        id: `highrisk-${s.id}`,
        type: 'error' as const,
        title: t('dashboard.highRiskTitle'),
        description: `${s.case_id || `#${s.id}`} (${s.operation_type}) exceeds estimated duration with ${s.risk_level} risk.`,
      })),
  ]

  const DarkTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-xl bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-2 shadow-xl">
          <p className="text-xs text-slate-400 mb-1">{label}</p>
          {payload.map((entry: any, i: number) => (
            <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {entry.value} min
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white dark:text-white not-dark:text-slate-900 font-heading">{t('dashboard.title')}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {t('dashboard.welcome', { name: firstName })}
          </p>
        </div>
      </div>

      {/* Welcome: Diagnostic Command Center */}
      <Card className="relative overflow-hidden border-cyan-400/20 dark:border-cyan-400/20 shadow-[0_0_20px_rgba(0,242,254,0.06)] p-6 lg:p-8">
        {/* Animated gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-40 animate-scan" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative mt-1">
              <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_10px_#ed1b24]" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-cyan-500 animate-pulse-glow" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl lg:text-2xl font-bold text-white dark:text-white not-dark:text-slate-900 font-heading">
                {t('dashboard.goodMorning', { name: firstName })}
              </h2>
              <p className="text-slate-400 text-sm lg:text-base">
                {loadingStats
                  ? t('dashboard.loadingOverview')
                  : stats
                    ? t('dashboard.scheduledCount', { count: stats.today_scheduled_operations, confidence: stats.model_confidence_average })
                    : t('dashboard.welcomeDefault')}
              </p>
            </div>
          </div>
          <Link to="/prediction">
            <Button variant="primary" size="lg">
              <Brain className="w-5 h-5" />
              {t('dashboard.newPrediction')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* KPI Cards - Instrument Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard
          title={t('dashboard.todaysOps')}
          value={loadingStats ? '...' : (stats?.today_scheduled_operations ?? 0)}
          subtitle={t('dashboard.scheduledCases')}
          icon={<Calendar className="w-5 h-5" />}
          color="cyan"
        />
        <KpiCard
          title={t('dashboard.avgDuration')}
          value={loadingStats ? '...' : formatDuration(stats?.average_predicted_duration ?? 0)}
          subtitle={t('dashboard.perOperation')}
          icon={<Clock className="w-5 h-5" />}
          color="violet"
        />
        <KpiCard
          title={t('dashboard.scheduleRisk')}
          value={loadingStats ? '...' : (stats?.schedule_risk_level ?? '—')}
          subtitle={t('dashboard.overallRisk')}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="amber"
        />
        <KpiCard
          title={t('dashboard.delayedCases')}
          value={loadingStats ? '...' : (stats?.delayed_cases ?? 0)}
          subtitle={t('dashboard.todaysDelays')}
          icon={<UserCheck className="w-5 h-5" />}
          color="rose"
        />
        <KpiCard
          title={t('dashboard.modelConfidence')}
          value={loadingStats ? '...' : `${stats?.model_confidence_average ?? 0}%`}
          subtitle={t('dashboard.avgAcrossCases')}
          icon={<Brain className="w-5 h-5" />}
          color="cyan"
          progress={stats?.model_confidence_average ?? 0}
        />
      </div>

      {/* Alerts */}
      <div className="space-y-3">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            variant={alert.type}
            title={alert.title}
            description={alert.description}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6" glow>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white dark:text-white not-dark:text-slate-900 font-heading">{t('dashboard.predVsActual')}</h3>
            <span className="text-xs text-slate-500">{t('dashboard.lastOps')}</span>
          </div>
          <div className="h-72">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={barChartData}>
                  <defs>
                    <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ed1b24" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ed1b24" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#385399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#385399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" strokeOpacity={0.5} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#1e293b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#1e293b' }} />
                  <Tooltip content={<DarkTooltip />} />
                  <Area type="monotone" dataKey="predicted" name={t('dashboard.predicted')} stroke="#ed1b24" strokeWidth={2.5} fill="url(#predictedGrad)" dot={{ fill: '#ed1b24', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: '#ed1b24', strokeWidth: 2, stroke: '#0b1124' }} />
                  <Area type="monotone" dataKey="actual" name={t('dashboard.actual')} stroke="#385399" strokeWidth={2.5} fill="url(#actualGrad)" dot={{ fill: '#385399', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: '#385399', strokeWidth: 2, stroke: '#0b1124' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-slate-500">{t('dashboard.noData')}</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6" glow>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white dark:text-white not-dark:text-slate-900 font-heading">{t('dashboard.errorByType')}</h3>
            <span className="text-xs text-slate-500">{t('dashboard.mae')}</span>
          </div>
          <div className="h-72">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pieChartData} layout="vertical">
                  <defs>
                    <linearGradient id="errorGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ff9f43" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#ff4d4d" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" strokeOpacity={0.5} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#1e293b' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#1e293b' }} width={100} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="value" name={t('dashboard.error')} fill="url(#errorGrad)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-slate-500">{t('dashboard.noData')}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Row: Upcoming ops + Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white dark:text-white not-dark:text-slate-900 font-heading">{t('dashboard.upcomingOps')}</h3>
            <Link to="/schedule">
              <Button variant="ghost" size="sm">
                {t('dashboard.viewAll')} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          {loadingSchedule ? (
            <div className="text-sm text-slate-500 text-center py-8">{t('dashboard.loadingSchedule')}</div>
          ) : todaySchedules.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-8">
              {stats
                ? t('dashboard.checkSchedule', { count: stats.today_scheduled_operations })
                : t('dashboard.noSurgeries')}
            </div>
          ) : (
            <div className="space-y-2">
              {todaySchedules.slice(0, 5).map((op) => (
                <div key={op.id} className="flex items-start gap-3 p-3 rounded-xl backdrop-blur-sm bg-slate-800/30 dark:bg-slate-800/30 not-dark:bg-slate-100/60 border border-slate-700/30 dark:border-slate-700/30 not-dark:border-slate-200/50 hover:border-cyan-400/20 transition-all duration-200">
                  <div className={`w-0.5 self-stretch rounded-full shrink-0 shadow-[0_0_6px] ${
                    op.risk_level === 'High' ? 'bg-rose-400 shadow-rose-500/50' :
                    op.risk_level === 'Medium' ? 'bg-amber-400 shadow-amber-500/50' : 'bg-cyan-400 shadow-cyan-500/50'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-100 dark:text-slate-100 not-dark:text-slate-900 truncate">
                        {op.operation_type || `Case #${op.id}`}
                      </span>
                      <Badge variant={
                        op.schedule_status === 'Delayed' ? 'warning' : 'info'
                      } size="sm">{op.schedule_status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      {op.start_time && <span>{op.start_time}</span>}
                      <span>{formatDuration(op.predicted_duration ?? 0)}</span>
                      <span>{op.room_number}</span>
                      {op.assigned_surgeon && <span className="truncate">{op.assigned_surgeon}</span>}
                    </div>
                  </div>
                  {op.risk_level && (
                    <span className={`text-xs font-medium shrink-0 ${getRiskColor(op.risk_level)}`}>
                      {op.risk_level}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-semibold text-white dark:text-white not-dark:text-slate-900 font-heading">{t('dashboard.recentActivity')}</h3>
          </div>
          <div className="space-y-0">
            {loadingActivity ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activity.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">{t('dashboard.noActivity')}</p>
            ) : (
              activity.map((item, idx) => (
                <div key={idx} className="flex gap-3 py-3 border-b border-slate-800/30 dark:border-slate-800/30 not-dark:border-slate-200/50 last:border-0">
                  <div className="relative mt-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-breathe" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 dark:text-slate-200 not-dark:text-slate-800">{item.action}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 not-dark:text-slate-500">{item.detail}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-600 not-dark:text-slate-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
