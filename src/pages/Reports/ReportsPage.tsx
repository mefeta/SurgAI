import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Modal } from '@/components/ui/Modal'
import { generateReport, getReports, getReportById, type ReportResponse, type ReportSection } from '@/api/reports'
import { formatDate } from '@/lib/utils'
import {
  FileText,
  Download,
  RefreshCw,
  CheckCircle,
  FileBarChart,
  Loader2,
  Eye,
  Printer,
} from 'lucide-react'

const REPORT_TYPE_OPTIONS = [
  { value: 'prediction_report', label: 'Operation Duration Prediction Report' },
  { value: 'test_validation_report', label: 'System Test Report' },
  { value: 'monthly_clinic_performance_report', label: 'Monthly Clinic Performance Report' },
  { value: 'model_performance_report', label: 'Model Accuracy Report' },
  { value: 'schedule_optimization_report', label: 'Schedule Optimization Report' },
]

export function ReportsPage() {
  const [reports, setReports] = useState<ReportResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedType, setSelectedType] = useState(REPORT_TYPE_OPTIONS[0].value)
  const [generateMsg, setGenerateMsg] = useState('')
  const [detailReport, setDetailReport] = useState<{ title: string; sections: ReportSection[] } | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      const res = await getReports()
      setReports(res.reports)
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGenerateMsg('')
    try {
      await generateReport({ report_type: selectedType })
      setGenerateMsg('Report generated successfully!')
      await loadReports()
      setShowGenerateModal(false)
    } catch {
      setGenerateMsg('Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const handleViewReport = async (id: number) => {
    setDetailLoading(true)
    try {
      const report = await getReportById(id)
      const sections = (report as unknown as { sections?: ReportSection[] }).sections || []
      setDetailReport({
        title: report.title || report.report_type,
        sections,
      })
    } catch {
      setDetailReport({
        title: 'Report',
        sections: [{ title: 'Error', content: 'Could not load report details.' }],
      })
    } finally {
      setDetailLoading(false)
    }
  }

  const handleExport = (report: ReportResponse) => {
    const blob = new Blob([JSON.stringify({ id: report.id, type: report.report_type, title: report.title }, null, 2)],
      { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `report-${report.id}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Generate and view clinical and project documentation</p>
        </div>
        <Button onClick={() => setShowGenerateModal(true)}>
          <RefreshCw className="w-4 h-4" /> Generate Report
        </Button>
      </div>

      {generateMsg && (
        <Alert variant={generateMsg.includes('failed') ? 'error' : 'success'} title="Report Generation" description={generateMsg} />
      )}

      {/* Report History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Report History</h3>
          <FileBarChart className="w-4 h-4 text-slate-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="text-left py-3 px-3 font-medium text-slate-500">Title</th>
                <th className="text-left py-3 px-3 font-medium text-slate-500">Type</th>
                <th className="text-left py-3 px-3 font-medium text-slate-500">Date</th>
                <th className="text-left py-3 px-3 font-medium text-slate-500">Status</th>
                <th className="text-left py-3 px-3 font-medium text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-slate-400">No reports generated yet</td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800/50">
                    <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">{r.title || r.report_type}</td>
                    <td className="py-3 px-3">
                      <Badge variant="info" size="sm">{r.report_type}</Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{r.generated_at ? formatDate(r.generated_at) : '—'}</td>
                    <td className="py-3 px-3">
                      <Badge variant={r.report_status === 'completed' || r.report_status === 'generated' ? 'success' : 'default'} size="sm">
                        {r.report_status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleViewReport(r.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleExport(r)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Generate Modal */}
      <Modal open={showGenerateModal} onClose={() => setShowGenerateModal(false)} title="Generate Report">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Report Type</label>
            <select
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:border-surgai-400 focus:outline-none"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {REPORT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowGenerateModal(false)}>Cancel</Button>
            <Button onClick={handleGenerate} loading={generating}>
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Report Detail Modal */}
      <Modal
        open={detailReport !== null}
        onClose={() => setDetailReport(null)}
        title={detailReport?.title || 'Report Details'}
        size="lg"
      >
        {detailLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : detailReport ? (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {detailReport.sections.length > 0 ? detailReport.sections.map((sec, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{sec.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{sec.content}</p>
              </div>
            )) : (
              <p className="text-sm text-slate-500 text-center py-4">No content available</p>
            )}
            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4" /> Print / Export PDF
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
