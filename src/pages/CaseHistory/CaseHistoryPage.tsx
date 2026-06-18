import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { cn, formatDuration, formatDateWithLocale, getRiskColor } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'
import { getCaseHistory } from '@/api/cases'
import { getPredictedVsActual } from '@/api/analytics'
import type { CaseHistoryItem } from '@/api/cases'
import {
  Search,
  Download,
  Eye,
  BarChart3,
  Loader2,
  X,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function CaseHistoryPage() {
  const { user } = useAuth()
  const { t } = useLocale()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(() => searchParams.get('search') || '')
  const [selectedCase, setSelectedCase] = useState<CaseHistoryItem | null>(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [cases, setCases] = useState<CaseHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<{ predicted: number; actual: number }[]>([])
  const [showChart, setShowChart] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getCaseHistory(0, 200, user?.is_admin ? undefined : user?.full_name)
      .then((res) => setCases(res.cases))
      .catch((err) => setError(err instanceof Error ? err.message : t('history.errorLoading')))
      .finally(() => setLoading(false))
  }, [user])

  const filtered = cases.filter((c) => {
    const matchesSearch =
      !search ||
      c.case_id.toLowerCase().includes(search.toLowerCase()) ||
      c.operation_type.toLowerCase().includes(search.toLowerCase()) ||
      (c.surgeon && c.surgeon.toLowerCase().includes(search.toLowerCase()))
    const matchesType = !typeFilter || c.operation_type === typeFilter
    const matchesStatus = !statusFilter || c.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const operationTypes = [...new Set(cases.map((c) => c.operation_type))]

  const handleViewComparison = async () => {
    if (chartData.length > 0) {
      setShowChart(!showChart)
      return
    }
    try {
      const data = await getPredictedVsActual()
      setChartData(data)
      setShowChart(true)
    } catch {
      setChartData([{ predicted: 0, actual: 0 }])
      setShowChart(true)
    }
  }

  const handleExport = () => {
    const headers = 'Case ID,Operation Type,Surgeon,Predicted (min),Confidence,Risk,Status'
    const rows = filtered.map((c) =>
      `"${c.case_id}","${c.operation_type}","${c.surgeon || ''}",${c.predicted_duration ?? 'N/A'},${c.confidence_score ?? 'N/A'},"${c.risk_level || ''}","${c.status}"`,
    )
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'case-history.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white dark:text-white not-dark:text-slate-900 font-heading">{t('history.title')}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {t('history.subtitle')}
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4" /> {t('history.exportCSV')}
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('history.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-surgai-400 focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-surgai-400 focus:outline-none"
            value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">{t('history.allTypes')}</option>
            {operationTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-surgai-400 focus:outline-none"
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t('history.allStatus')}</option>
            <option value="completed">Completed</option>
            <option value="predicted">Predicted</option>
            <option value="scheduled">Scheduled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <Alert variant="error" title={t('history.errorLoading')} description={error} />
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">{t('history.noCases')}</p>
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left py-3.5 px-4 font-medium text-slate-500 dark:text-slate-400">{t('history.caseId')}</th>
                  <th className="text-left py-3.5 px-4 font-medium text-slate-500 dark:text-slate-400">{t('history.date')}</th>
                  <th className="text-left py-3.5 px-4 font-medium text-slate-500 dark:text-slate-400">{t('history.operationType')}</th>
                  <th className="text-left py-3.5 px-4 font-medium text-slate-500 dark:text-slate-400">{t('history.surgeon')}</th>
                  <th className="text-left py-3.5 px-4 font-medium text-slate-500 dark:text-slate-400">{t('history.predicted')}</th>
                  <th className="text-left py-3.5 px-4 font-medium text-slate-500 dark:text-slate-400">{t('history.confidence')}</th>
                  <th className="text-left py-3.5 px-4 font-medium text-slate-500 dark:text-slate-400">{t('history.risk')}</th>
                  <th className="text-left py-3.5 px-4 font-medium text-slate-500 dark:text-slate-400">{t('history.status')}</th>
                  <th className="text-left py-3.5 px-4 font-medium text-slate-500 dark:text-slate-400"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.case_id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">{c.case_id}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {c.created_at ? formatDateWithLocale(new Date(c.created_at)) : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-[160px] truncate">{c.operation_type}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{c.surgeon || '—'}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                      {c.predicted_duration != null ? formatDuration(c.predicted_duration) : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      {c.confidence_score != null ? (
                        <span className="font-medium text-teal-600">{c.confidence_score}%</span>
                      ) : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      {c.risk_level ? (
                        <span className={getRiskColor(c.risk_level)}>{c.risk_level}</span>
                      ) : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={c.status === 'completed' ? 'success' : c.status === 'predicted' ? 'info' : 'default'}
                        size="sm"
                      >
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedCase(c)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={!!selectedCase} onClose={() => setSelectedCase(null)} title={selectedCase ? `${t('history.caseId')} ${selectedCase.case_id}` : ''}>
        {selectedCase && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">{t('history.operationType')}</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedCase.operation_type}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('history.surgeon')}</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedCase.surgeon || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('history.predDuration')}</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {selectedCase.predicted_duration != null ? formatDuration(selectedCase.predicted_duration) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('history.confScore')}</p>
                <p className="text-sm font-medium text-teal-600">
                  {selectedCase.confidence_score != null ? `${selectedCase.confidence_score}%` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('history.riskLevel')}</p>
                <span className={getRiskColor(selectedCase.risk_level ?? '')}>{selectedCase.risk_level || '—'}</span>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('history.room')}</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedCase.room_number || '—'}</p>
              </div>
            </div>

            {selectedCase.predicted_duration != null && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('history.predInfo')}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t('history.predInfoText', {
                    duration: formatDuration(selectedCase.predicted_duration),
                    confidence: selectedCase.confidence_score != null ? `${selectedCase.confidence_score}` : 'N/A',
                    riskDesc: selectedCase.risk_level === 'Low'
                      ? t('history.riskLow')
                      : selectedCase.risk_level === 'High'
                        ? t('history.riskHigh')
                        : t('history.riskModerate'),
                  })}
                </p>
              </div>
            )}

            <Button variant="outline" className="w-full" onClick={handleViewComparison}>
              {showChart ? <><X className="w-4 h-4" /> {t('history.hideChart')}</> : <><BarChart3 className="w-4 h-4" /> {t('history.comparisonChart')}</>}
            </Button>
            {showChart && chartData.length > 0 && (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="predicted" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="predicted" name="Predicted" fill="#2e93ff" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="actual" name="Actual" fill="#06b489" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
