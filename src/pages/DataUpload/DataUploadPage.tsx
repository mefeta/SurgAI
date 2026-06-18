import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Modal } from '@/components/ui/Modal'
import { api } from '@/api/client'
import { getDatasets, getDatasetPreview, prepareDataset, type DatasetUploadResponse, type DatasetPreviewResponse } from '@/api/datasets'
import { useLocale } from '@/context/LocaleContext'
import { formatDateWithLocale } from '@/lib/utils'
import { FileUp, Upload, Shield, CheckCircle, AlertTriangle, History, Columns, X, Loader2 } from 'lucide-react'

export function DataUploadPage() {
  const { t } = useLocale()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState('')
  const [datasets, setDatasets] = useState<DatasetUploadResponse[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [preparing, setPreparing] = useState(false)
  const [prepareMsg, setPrepareMsg] = useState('')
  const [previewData, setPreviewData] = useState<DatasetPreviewResponse | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewDatasetId, setPreviewDatasetId] = useState<number | null>(null)

  useEffect(() => {
    loadDatasets()
  }, [])

  const loadDatasets = async () => {
    try {
      const res = await getDatasets()
      setDatasets(res.datasets)
    } catch {
      // Silently handle
    }
  }

  const handleFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !['csv', 'xlsx', 'xls'].includes(ext)) {
      setError(t('upload.invalidFile'))
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setError(t('upload.fileTooLarge'))
      return
    }
    setError('')
    setSelectedFile(file)
    setUploaded(false)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    setError('')
    try {
      await api.upload('/datasets/upload', selectedFile)
      setUploaded(true)
      setSelectedFile(null)
      loadDatasets()
    } catch {
      setError(t('upload.uploadFailed'))
    } finally {
      setUploading(false)
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setUploaded(false)
    setError('')
  }

  const loadPreview = async (datasetId: number) => {
    setPreviewLoading(true)
    setPreviewDatasetId(datasetId)
    try {
      const data = await getDatasetPreview(datasetId)
      setPreviewData(data)
    } catch {
      setPreviewData(null)
    } finally {
      setPreviewLoading(false)
    }
  }

  const openHistory = async () => {
    setHistoryLoading(true)
    setShowHistory(true)
    await loadDatasets()
    setHistoryLoading(false)
  }

  const handlePrepareDataset = async () => {
    if (datasets.length === 0) {
      setError(t('upload.noDatasetsPrepare'))
      return
    }
    setPreparing(true)
    setPrepareMsg('')
    setError('')
    try {
      const latest = datasets.reduce((a, b) => (a.id > b.id ? a : b))
      const res = await prepareDataset(latest.id)
      setPrepareMsg(`Dataset prepared: ${res.cleaned_row_count} rows (${res.duplicates_removed} duplicates removed, ${res.missing_values_filled} missing values filled)`)
      loadDatasets()
    } catch {
      setError(t('upload.prepareFailed'))
    } finally {
      setPreparing(false)
    }
  }

  const latestDataset = datasets.length > 0
    ? datasets.reduce((a, b) => (a.id > b.id ? a : b))
    : null

  const totalRows = datasets.reduce((sum, d) => sum + (d.row_count || 0), 0)
  const qualityScore = latestDataset?.data_quality_score
  const missingValues = latestDataset?.missing_value_count
  const duplicateCount = latestDataset?.duplicate_count

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white dark:text-white not-dark:text-slate-900 font-heading">{t('upload.title')}</h1>
        <p className="text-sm text-slate-400 mt-1">{t('upload.subtitle')}</p>
      </div>

      <Alert
        variant="info"
        title={t('upload.privacyTitle')}
        description={t('upload.privacyDesc')}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
          dragOver
            ? 'border-surgai-500 bg-surgai-50 dark:bg-surgai-950'
            : uploaded
            ? 'border-teal-400 bg-teal-50 dark:bg-teal-950'
            : 'border-slate-300 dark:border-slate-600 hover:border-surgai-400 dark:hover:border-surgai-500'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        onClick={() => !uploaded && fileInputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' && !uploaded) fileInputRef.current?.click() }}
        role="button"
        tabIndex={0}
        aria-label={t('upload.uploadFile')}
      >
        {uploaded ? (
          <div className="space-y-3">
            <CheckCircle className="w-12 h-12 mx-auto text-teal-500" />
            <p className="text-lg font-semibold text-teal-700 dark:text-teal-300">{t('upload.fileUploaded')}</p>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); resetUpload() }}>
              {t('upload.uploadAnother')}
            </Button>
          </div>
        ) : selectedFile ? (
          <div className="space-y-3">
            <FileUp className="w-10 h-10 mx-auto text-surgai-500" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{selectedFile.name}</p>
            <p className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
            <div className="flex items-center justify-center gap-2">
              <Button size="sm" onClick={(e) => { e.stopPropagation(); handleUpload() }} loading={uploading}>
                {uploading ? t('upload.uploading') : t('upload.uploadFile')}
              </Button>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); resetUpload() }} disabled={uploading}>
                <X className="w-4 h-4" /> {t('upload.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <FileUp className="w-12 h-12 mx-auto text-slate-400" />
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{t('upload.dropFiles')}</p>
            <p className="text-sm text-slate-400">{t('upload.fileFormats')}</p>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4" /> {t('upload.selectFiles')}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="error" title={t('upload.error')} description={error} />
      )}

      {prepareMsg && (
        <Alert variant="success" title={t('upload.datasetPrepared')} description={prepareMsg} />
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-teal-500" />
            <div>
              <p className="text-xs text-slate-500">{t('upload.dataQuality')}</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{qualityScore != null ? `${Math.round(qualityScore)}%` : '—'}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-xs text-slate-500">{t('upload.missingValues')}</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{missingValues != null ? `${missingValues} ${t('upload.fields')}` : '—'}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-surgai-500" />
            <div>
              <p className="text-xs text-slate-500">{t('upload.duplicateEntries')}</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{duplicateCount != null ? (duplicateCount > 0 ? `${duplicateCount} ${t('upload.found')}` : t('upload.noneFound')) : '—'}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{t('upload.dataPreview')}</h3>
            <div className="flex items-center gap-2">
              <select
                className="px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300"
                value={previewDatasetId ?? ''}
                onChange={(e) => {
                  const id = Number(e.target.value)
                  if (id) loadPreview(id)
                }}
              >
                <option value="">{t('upload.selectDataset')}</option>
                {datasets.map((ds) => (
                  <option key={ds.id} value={ds.id}>{ds.filename}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            {previewLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : previewData ? (
              <>
                <p className="text-xs text-slate-400 mb-2">{previewData.filename} — {previewData.total_rows} rows &times; {previewData.columns.length} columns</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      {previewData.columns.slice(0, 6).map((col) => (
                        <th key={col} className="text-left py-2 px-2 font-medium text-slate-500 whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.rows.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50">
                        {previewData.columns.slice(0, 6).map((col) => (
                          <td key={col} className="py-2 px-2 text-slate-600 dark:text-slate-400 max-w-[140px] truncate">
                            {String(row[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.total_rows > 10 && (
                  <p className="text-xs text-slate-400 mt-2">{t('upload.showingFirst', { total: previewData.total_rows })}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">{t('upload.noPreview')}</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Columns className="w-4 h-4 text-surgai-500" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{t('upload.datasetColumns')}</h3>
          </div>
          <div className="space-y-1">
            {previewData ? (
              previewData.columns.map((col) => (
                <div key={col} className="flex items-center gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                  <code className="text-xs font-mono text-slate-500">{col}</code>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">{t('upload.noColumns')}</p>
            )}
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={openHistory}>
          <History className="w-4 h-4" /> {t('upload.versionHistory')}
        </Button>
        <Button onClick={handlePrepareDataset} loading={preparing}>
          <Upload className="w-4 h-4" /> {preparing ? t('upload.preparing') : t('upload.prepareDataset')}
        </Button>
      </div>

      <Modal open={showHistory} onClose={() => setShowHistory(false)} title={t('upload.versionHistory')}>
        <div className="space-y-3">
          {historyLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : datasets.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">{t('upload.noDatasets')}</p>
          ) : (
            datasets.map((ds) => (
              <div key={ds.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{ds.filename}</p>
                  <p className="text-xs text-slate-500">
                    {t('upload.rowsCols', { rows: ds.row_count, cols: ds.column_count })}
                    {ds.uploaded_at ? ` — ${formatDateWithLocale(new Date(ds.uploaded_at))}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    ds.status === 'ready' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300' :
                    ds.status === 'prepared' ? 'bg-surgai-100 text-surgai-700 dark:bg-surgai-900 dark:text-surgai-300' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {ds.status}
                  </span>
                  <span className="text-xs text-slate-400">{Math.round(ds.data_quality_score)}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  )
}
