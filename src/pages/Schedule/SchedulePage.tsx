import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Modal } from '@/components/ui/Modal'
import { formatDuration, formatDateWithLocale, getRiskColor } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'
import { getScheduleByDay, getScheduleByWeek, getSchedule, createSchedule, deleteSchedule, updateSchedule } from '@/api/schedule'
import type { ScheduleResponse } from '@/api/schedule'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Lightbulb,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react'

type ViewType = 'daily' | 'weekly' | 'monthly'

function formatDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function groupSchedules(schedules: ScheduleResponse[], view: ViewType): [string, ScheduleResponse[]][] {
  if (view === 'daily') {
    const groups: Record<string, ScheduleResponse[]> = {}
    for (const s of schedules) {
      const key = s.start_time ? s.start_time.substring(0, 5) : 'Other'
      if (!groups[key]) groups[key] = []
      groups[key].push(s)
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }

  const groups: Record<string, ScheduleResponse[]> = {}
  for (const s of schedules) {
    if (!s.scheduled_date) continue
    const d = new Date(s.scheduled_date)
    let key: string
    if (view === 'weekly') {
      key = formatDateWithLocale(d, { weekday: 'long', month: 'short', day: 'numeric' })
    } else {
      key = formatDateWithLocale(d, { weekday: 'short', month: 'short', day: 'numeric' })
    }
    if (!groups[key]) groups[key] = []
    groups[key].push(s)
  }
  return Object.entries(groups).sort(([a], [b]) => {
    const da = new Date(a)
    const db = new Date(b)
    return da.getTime() - db.getTime()
  })
}

export function SchedulePage() {
  const { user } = useAuth()
  const { t } = useLocale()
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState<ViewType>('daily')
  const [selectedDate, setSelectedDate] = useState(() => {
    const dateParam = searchParams.get('date')
    if (dateParam) {
      const d = new Date(dateParam + 'T00:00:00')
      if (!isNaN(d.getTime())) return d
    }
    return new Date()
  })
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllSurgeons, setShowAllSurgeons] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addingSchedule, setAddingSchedule] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null)
  const [newSurgery, setNewSurgery] = useState({
    scheduled_date: formatDateStr(new Date()),
    start_time: '08:00',
    room_number: 'OR-1',
    operation_type: '',
    predicted_duration: 60,
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const dateStr = formatDateStr(selectedDate)
      let res: { schedules: ScheduleResponse[] }

      if (view === 'daily') {
        res = await getScheduleByDay(dateStr)
      } else if (view === 'weekly') {
        const weekStart = getWeekStart(selectedDate)
        res = await getScheduleByWeek(formatDateStr(weekStart))
      } else {
        const all = await getSchedule(0, 200)
        const filtered = all.schedules.filter((s) => {
          if (!s.scheduled_date) return false
          const d = new Date(s.scheduled_date)
          return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear()
        })
        res = { schedules: filtered }
      }

      const userSchedules = !showAllSurgeons && user
        ? res.schedules.filter((s) => s.assigned_surgeon === user.full_name)
        : res.schedules

      setSchedules(userSchedules)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('schedule.failedLoad'))
    } finally {
      setLoading(false)
    }
  }, [view, selectedDate, user, showAllSurgeons, t])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateDate = (d: Date) => {
    setSelectedDate(d)
    setSearchParams({ date: formatDateStr(d) }, { replace: true })
  }

  const navigate = (direction: number) => {
    const d = new Date(selectedDate)
    if (view === 'daily') d.setDate(d.getDate() + direction)
    else if (view === 'weekly') d.setDate(d.getDate() + direction * 7)
    else d.setMonth(d.getMonth() + direction)
    updateDate(d)
  }

  const confirmDelete = (id: number) => {
    setDeleteConfirmId(id)
  }

  const handleDeleteSurgery = async () => {
    if (deleteConfirmId === null) return
    setDeletingId(deleteConfirmId)
    try {
      await deleteSchedule(deleteConfirmId)
      setDeleteConfirmId(null)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('schedule.failedDelete'))
    } finally {
      setDeletingId(null)
    }
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdatingStatusId(id)
    try {
      await updateSchedule(id, { schedule_status: newStatus })
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setUpdatingStatusId(null)
    }
  }

  const handleAddSurgery = async () => {
    if (!newSurgery.operation_type) return
    setAddingSchedule(true)
    try {
      await createSchedule({
        scheduled_date: newSurgery.scheduled_date,
        start_time: newSurgery.start_time,
        room_number: newSurgery.room_number,
        operation_type: newSurgery.operation_type,
        predicted_duration: newSurgery.predicted_duration,
        assigned_surgeon: user?.full_name,
      })
      setShowAddModal(false)
      setNewSurgery({ scheduled_date: formatDateStr(new Date()), start_time: '08:00', room_number: 'OR-1', operation_type: '', predicted_duration: 60 })
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('schedule.failedAdd'))
    } finally {
      setAddingSchedule(false)
    }
  }

  const grouped = groupSchedules(schedules, view)

  const allOps = schedules.map((s) => ({
    id: s.id,
    caseId: s.case_id ?? `#${s.id}`,
    surgeon: s.assigned_surgeon ?? '',
    type: s.operation_type ?? '',
    duration: s.predicted_duration ?? 0,
    room: s.room_number ?? '',
    risk: s.risk_level ?? 'Low',
    status: s.schedule_status,
  }))

  const headerDate =
    view === 'daily'
      ? formatDateWithLocale(selectedDate, {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
        })
      : view === 'weekly'
        ? t('schedule.weekOf', { date: formatDateWithLocale(getWeekStart(selectedDate), {
            month: 'long', day: 'numeric',
          }) })
        : formatDateWithLocale(selectedDate, { month: 'long', year: 'numeric' })

  const inputClasses = 'w-full px-3 py-2 text-sm backdrop-blur-sm bg-slate-800/50 dark:bg-slate-800/50 not-dark:bg-white/80 border border-slate-700/50 dark:border-slate-700/50 not-dark:border-slate-300/50 rounded-xl text-slate-200 dark:text-slate-200 not-dark:text-slate-900 focus:border-cyan-400/50 focus:outline-none transition-all'
  const labelClasses = 'block text-sm font-medium text-slate-300 dark:text-slate-300 not-dark:text-slate-700 mb-1.5'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white dark:text-white not-dark:text-slate-900 font-heading">{t('schedule.title')}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {showAllSurgeons ? t('schedule.allSurgeries') : user ? t('schedule.mySurgeries', { name: user.full_name }) : t('schedule.manage')}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" /> {t('schedule.addSurgery')}
        </Button>
      </div>

      <Alert
        variant="info"
        title={t('schedule.alertTitle')}
        description={t('schedule.alertDesc')}
      />

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-center min-w-[220px]">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{headerDate}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant={showAllSurgeons ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowAllSurgeons(!showAllSurgeons)}
            >
              {showAllSurgeons ? t('schedule.allSurgeriesBtn') : t('schedule.mySurgeriesBtn')}
            </Button>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {(['daily', 'weekly', 'monthly'] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  view === v
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {t(`schedule.${v}`)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <Alert variant="error" title={t('schedule.errorLoading')} description={error} />
      ) : schedules.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">{t('schedule.noSurgeries')}</p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {grouped.map(([label, ops]) => (
              <div key={label} className="flex gap-4">
                <div className="w-16 shrink-0 text-right">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                  <div className="w-px h-full bg-slate-200 dark:bg-slate-700 mx-auto mt-2" />
                </div>
                <div className="flex-1 space-y-3">
                  {ops.map((op) => (
                    <Card key={op.id} className={`p-4 border-l-4 ${
                      op.risk_level === 'High' ? 'border-l-red-500' :
                      op.risk_level === 'Medium' ? 'border-l-amber-500' :
                      'border-l-teal-500'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-slate-900 dark:text-white">{op.case_id ?? `#${op.id}`}</span>
                            <div className="relative group">
                              <select
                                value={op.schedule_status}
                                onChange={(e) => handleStatusChange(op.id, e.target.value)}
                                disabled={updatingStatusId === op.id}
                                className={`text-xs font-medium rounded-md border px-2 py-0.5 pr-6 cursor-pointer appearance-none transition-colors ${
                                  op.schedule_status === 'Delayed' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                                  op.schedule_status === 'completed' || op.schedule_status === 'Completed' ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' :
                                  op.schedule_status === 'cancelled' || op.schedule_status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                                  'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                }`}
                              >
                                <option value="scheduled" className="bg-slate-800 text-slate-200">Scheduled</option>
                                <option value="completed" className="bg-slate-800 text-slate-200">Completed</option>
                                <option value="delayed" className="bg-slate-800 text-slate-200">Delayed</option>
                                <option value="cancelled" className="bg-slate-800 text-slate-200">Cancelled</option>
                              </select>
                              {updatingStatusId === op.id && (
                                <Loader2 className="w-3 h-3 animate-spin text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{op.operation_type}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            {op.start_time && (
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {op.start_time}</span>
                            )}
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(op.predicted_duration ?? 0)}</span>
                            <span>{op.assigned_surgeon}</span>
                            <span>{op.room_number}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={getRiskColor(op.risk_level ?? 'Low')}>{op.risk_level}</span>
                          <button
                            onClick={() => confirmDelete(op.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                            title={t('schedule.delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('schedule.optimizedOrder')}</h3>
              </div>
              <div className="space-y-2">
                {allOps.sort((a, b) => a.duration - b.duration).map((op, idx) => (
                  <div key={op.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{op.caseId}</p>
                      <p className="text-xs text-slate-400">{formatDuration(op.duration)} &mdash; {op.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{t('schedule.summary')}</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t('schedule.totalOps')}</span>
                  <span className="font-medium">{allOps.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t('schedule.totalDuration')}</span>
                  <span className="font-medium">{formatDuration(allOps.reduce((sum, op) => sum + op.duration, 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t('schedule.activeRooms')}</span>
                  <span className="font-medium">{new Set(allOps.map((o) => o.room)).size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t('schedule.delayed')}</span>
                  <span className="font-medium text-amber-600">{allOps.filter((o) => o.status === 'Delayed').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t('schedule.highRisk')}</span>
                  <span className="font-medium text-red-600">{allOps.filter((o) => o.risk === 'High').length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title={t('schedule.addTitle')}>
        <div className="space-y-4">
          <div>
            <label className={labelClasses}>{t('schedule.operationType')}</label>
            <input type="text" className={inputClasses} placeholder="e.g. Cataract Surgery"
              value={newSurgery.operation_type}
              onChange={(e) => setNewSurgery({ ...newSurgery, operation_type: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>{t('schedule.date')}</label>
              <input type="date" className={inputClasses}
                value={newSurgery.scheduled_date}
                onChange={(e) => setNewSurgery({ ...newSurgery, scheduled_date: e.target.value })} />
            </div>
            <div>
              <label className={labelClasses}>{t('schedule.time')}</label>
              <input type="time" className={inputClasses}
                value={newSurgery.start_time}
                onChange={(e) => setNewSurgery({ ...newSurgery, start_time: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>{t('schedule.room')}</label>
              <select className={inputClasses}
                value={newSurgery.room_number}
                onChange={(e) => setNewSurgery({ ...newSurgery, room_number: e.target.value })}>
                <option value="OR-1">OR-1</option>
                <option value="OR-2">OR-2</option>
                <option value="OR-3">OR-3</option>
                <option value="OR-4">OR-4</option>
                <option value="DEN-1">DEN-1</option>
                <option value="DEN-2">DEN-2</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>{t('schedule.duration')}</label>
              <input type="number" className={inputClasses}
                value={newSurgery.predicted_duration}
                onChange={(e) => setNewSurgery({ ...newSurgery, predicted_duration: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>{t('schedule.cancel')}</Button>
            <Button onClick={handleAddSurgery} loading={addingSchedule}>{t('schedule.addToSchedule')}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)} title={t('schedule.deleteTitle')}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('schedule.deleteConfirm')}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>{t('schedule.cancel')}</Button>
            <Button variant="danger" onClick={handleDeleteSurgery} loading={deletingId !== null}>
              {deletingId !== null ? t('schedule.deleting') : t('schedule.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
