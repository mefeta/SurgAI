import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import { Button } from '@/components/ui/Button'
import { api } from '@/api/client'
import {
  getModelAnalytics,
  getAccuracyOverTime,
  getPredictedVsActual,
  getErrorByOperationType,
  retrainModel,
  type ModelAnalytics,
  type AccuracyOverTime,
  type PredictedVsActual,
  type ErrorByOperationType,
} from '@/api/analytics'
import { useLocale } from '@/context/LocaleContext'
import { formatDateWithLocale } from '@/lib/utils'
import {
  Brain,
  Activity,
  Clock,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Target,
  AlertTriangle,
  Download,
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts'

const DarkTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="backdrop-blur-xl bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-2 shadow-xl">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}{entry.name?.toLowerCase().includes('accuracy') ? '%' : ''}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function AnalyticsPage() {
  const { t } = useLocale()
  const [metrics, setMetrics] = useState<ModelAnalytics | null>(null)
  const [accuracyData, setAccuracyData] = useState<AccuracyOverTime[]>([])
  const [errorByTypeData, setErrorByTypeData] = useState<ErrorByOperationType[]>([])
  const [predictedVsActualData, setPredictedVsActualData] = useState<PredictedVsActual[]>([])
  const [loading, setLoading] = useState(true)
  const [retraining, setRetraining] = useState(false)
  const [retrainMsg, setRetrainMsg] = useState('')

  useEffect(() => {
    Promise.all([
      getModelAnalytics(),
      getAccuracyOverTime(),
      getErrorByOperationType(),
      getPredictedVsActual(),
    ])
      .then(([m, acc, err, pva]) => {
        setMetrics(m)
        setAccuracyData(acc)
        setErrorByTypeData(err)
        setPredictedVsActualData(pva)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleRetrain() {
    setRetraining(true)
    setRetrainMsg('')
    try {
      const res = await retrainModel()
      setRetrainMsg(res.message || t('analytics.retrainSuccess'))
      const m = await getModelAnalytics()
      setMetrics(m)
    } catch {
      setRetrainMsg(t('analytics.retrainFailed'))
    } finally {
      setRetraining(false)
    }
  }

  const errorBySurgeon = errorByTypeData.length > 0
    ? errorByTypeData.map((e) => ({
        surgeon: e.operation_type,
        error: Math.round(e.error_minutes),
      }))
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white dark:text-white not-dark:text-slate-900 font-heading">{t('analytics.title')}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {loading
              ? t('analytics.loading')
              : metrics
                ? t('analytics.lastTrained', { version: metrics.model_version, date: formatDateWithLocale(new Date(metrics.last_training_date)) })
                : t('analytics.unavailable')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {metrics && (
            <Badge variant={metrics.model_health_status.toLowerCase() === 'healthy' ? 'success' : 'warning'} size="md">
              <Activity className="w-3.5 h-3.5 mr-1" /> {metrics.model_health_status}
            </Badge>
          )}
          {retrainMsg && (
            <span className="text-xs text-cyan-400">{retrainMsg}</span>
          )}
          <Button variant="outline" onClick={handleRetrain} loading={retraining}>
            <RefreshCw className="w-4 h-4" /> {retraining ? t('analytics.retraining') : t('analytics.retrain')}
          </Button>
          <Button variant="ghost" onClick={() => {
            const data = { metrics, accuracyData, errorByTypeData, predictedVsActualData }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = 'model-analytics.json'; a.click()
            URL.revokeObjectURL(url)
          }}>
            <Download className="w-4 h-4" /> {t('analytics.export')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title={t('analytics.modelAccuracy')}
          value={loading ? '...' : metrics ? `${(metrics.accuracy_score * 100).toFixed(1)}%` : '—'}
          subtitle={t('analytics.overallAccuracy')}
          icon={<Target className="w-5 h-5" />}
          color="cyan"
          progress={metrics ? metrics.accuracy_score * 100 : undefined}
        />
        <KpiCard
          title={t('analytics.meanAbsoluteError')}
          value={loading ? '...' : metrics ? `${metrics.mean_absolute_error} min` : '—'}
          subtitle={t('analytics.avgDeviation')}
          icon={<BarChart3 className="w-5 h-5" />}
          color="violet"
        />
        <KpiCard
          title={t('analytics.avgErrorPerOp')}
          value={loading ? '...' : metrics ? `${metrics.average_error_minutes} min` : '—'}
          subtitle={t('analytics.perOperation')}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <KpiCard
          title={t('analytics.modelVersion')}
          value={loading ? '...' : metrics?.model_version ?? '—'}
          subtitle={t('analytics.currentDeployment')}
          icon={<Brain className="w-5 h-5" />}
          color="violet"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Accuracy Over Time */}
        <Card className="p-6" glow>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white dark:text-white not-dark:text-slate-900 font-heading">{t('analytics.accuracyOverTime')}</h3>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="h-72">
            {accuracyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={accuracyData}>
                  <defs>
                    <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00f2fe" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" strokeOpacity={0.5} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#1e293b' }} />
                  <YAxis domain={[88, 96]} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#1e293b' }} />
                  <Tooltip content={<DarkTooltip />} />
                  <Area type="monotone" dataKey="accuracy" stroke="#00f2fe" strokeWidth={2.5} fill="url(#accuracyGrad)" dot={{ fill: '#00f2fe', strokeWidth: 2, r: 3, stroke: '#080b11' }} activeDot={{ r: 5, fill: '#00f2fe', strokeWidth: 2, stroke: '#080b11' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-slate-500">{t('analytics.noData')}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Error by Operation Type */}
        <Card className="p-6" glow>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white dark:text-white not-dark:text-slate-900 font-heading">{t('analytics.errorByOpType')}</h3>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="h-72">
            {errorByTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={errorByTypeData} layout="vertical">
                  <defs>
                    <linearGradient id="errorBarGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ff9f43" />
                      <stop offset="100%" stopColor="#ff4d4d" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" strokeOpacity={0.5} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#1e293b' }} />
                  <YAxis dataKey="operation_type" type="category" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#1e293b' }} width={100} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="error_minutes" name="Error (min)" fill="url(#errorBarGrad)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-slate-500">{t('analytics.noData')}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Confidence Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white dark:text-white not-dark:text-slate-900 font-heading">{t('analytics.confidenceDist')}</h3>
            <Brain className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="h-72 flex items-center justify-center">
            <p className="text-sm text-slate-500">{t('analytics.confidenceDistNA')}</p>
          </div>
        </Card>

        {/* Predicted vs Actual Scatter */}
        <Card className="p-6" glow>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white dark:text-white not-dark:text-slate-900 font-heading">{t('analytics.predVsActual')}</h3>
            <Target className="w-4 h-4 text-violet-400" />
          </div>
          <div className="h-72">
            {predictedVsActualData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" strokeOpacity={0.5} />
                  <XAxis dataKey="predicted" name="Predicted" unit=" min" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#1e293b' }} />
                  <YAxis dataKey="actual" name="Actual" unit=" min" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#1e293b' }} />
                  <Tooltip content={<DarkTooltip />} />
                  <Scatter
                    data={predictedVsActualData}
                    fill="#00f2fe"
                    shape={(props: any) => {
                      const { cx, cy } = props
                      return (
                        <g>
                          <circle cx={cx} cy={cy} r={5} fill="#00f2fe" opacity={0.6} />
                          <circle cx={cx} cy={cy} r={3} fill="#00f2fe" />
                        </g>
                      )
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-slate-500">{t('analytics.noData')}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Error Table */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-white dark:text-white not-dark:text-slate-900 font-heading mb-4">{t('analytics.errorTable')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/50 dark:border-slate-800/50 not-dark:border-slate-200/50">
                <th className="text-left py-3 px-3 font-medium text-slate-400">{t('analytics.errorTableOp')}</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">{t('analytics.errorTableAvg')}</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">{t('analytics.errorTablePerf')}</th>
              </tr>
            </thead>
            <tbody>
              {errorBySurgeon.length > 0 ? errorBySurgeon.map((s) => (
                <tr key={s.surgeon} className="border-b border-slate-800/30 dark:border-slate-800/30 not-dark:border-slate-200/30 hover:bg-slate-800/20 dark:hover:bg-slate-800/20 not-dark:hover:bg-slate-100/50 transition-colors">
                  <td className="py-3 px-3 font-medium text-slate-200 dark:text-slate-200 not-dark:text-slate-900">{s.surgeon}</td>
                  <td className="py-3 px-3 text-slate-400">±{s.error} min</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-700/50 dark:bg-slate-700/50 not-dark:bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            s.error <= 5 ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 shadow-[0_0_6px_rgba(0,242,254,0.2)]' : s.error <= 10 ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_6px_rgba(255,159,67,0.2)]' : 'bg-gradient-to-r from-rose-400 to-red-500 shadow-[0_0_6px_rgba(255,77,77,0.2)]'
                          }`}
                          style={{ width: `${Math.max(10, 100 - s.error * 3)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-sm text-slate-500">{t('analytics.noErrorData')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
