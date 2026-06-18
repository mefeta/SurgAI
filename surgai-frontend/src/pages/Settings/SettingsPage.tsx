import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useLocale } from '@/context/LocaleContext'
import {
  Building2,
  Users,
  Shield,
  Brain,
  Clock,
  Bell,
  Lock,
  Code,
  Save,
} from 'lucide-react'

const settingsSections = [
  { id: 'clinic', labelKey: 'settings.clinicProfile', icon: Building2 },
  { id: 'users', labelKey: 'settings.userManagement', icon: Users },
  { id: 'roles', labelKey: 'settings.rolePermissions', icon: Shield },
  { id: 'prediction', labelKey: 'settings.predictionParams', icon: Brain },
  { id: 'schedule', labelKey: 'settings.scheduleBuffer', icon: Clock },
  { id: 'notifications', labelKey: 'settings.notifications', icon: Bell },
  { id: 'privacy', labelKey: 'settings.dataPrivacy', icon: Lock },
  { id: 'api', labelKey: 'settings.apiConfig', icon: Code },
]

export function SettingsPage() {
  const navigate = useNavigate()
  const { t } = useLocale()
  const [activeSection, setActiveSection] = useState('clinic')
  const [saved, setSaved] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState([
    { labelKey: 'settings.scheduleConflicts', descKey: 'settings.scheduleConflictsDesc', enabled: true },
    { labelKey: 'settings.highRiskSurgeries', descKey: 'settings.highRiskSurgeriesDesc', enabled: true },
    { labelKey: 'settings.predictionCompletion', descKey: 'settings.predictionCompletionDesc', enabled: true },
    { labelKey: 'settings.emailReports', descKey: 'settings.emailReportsDesc', enabled: false },
    { labelKey: 'settings.delayAlerts', descKey: 'settings.delayAlertsDesc', enabled: true },
  ])

  const [privacySettings, setPrivacySettings] = useState([
    { labelKey: 'settings.autoAnonymize', descKey: 'settings.autoAnonymizeDesc', enabled: true },
    { labelKey: 'settings.dataRetention', descKey: 'settings.dataRetentionDesc', enabled: true },
    { labelKey: 'settings.auditLogging', descKey: 'settings.auditLoggingDesc', enabled: true },
    { labelKey: 'settings.hipaaMode', descKey: 'settings.hipaaModeDesc', enabled: false },
  ])

  const handleSave = () => {
    localStorage.setItem('surgai_privacy_settings', JSON.stringify(privacySettings))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const togglePrivacy = (index: number) => {
    setPrivacySettings((prev) => prev.map((item, i) => (i === index ? { ...item, enabled: !item.enabled } : item)))
  }

  const toggleNotification = (index: number) => {
    setNotificationSettings((prev) => prev.map((item, i) => (i === index ? { ...item, enabled: !item.enabled } : item)))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white dark:text-white not-dark:text-slate-900 font-heading">{t('settings.title')}</h1>
        <p className="text-sm text-slate-400 mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="p-2 lg:col-span-1">
          <nav className="space-y-1">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                  activeSection === section.id
                    ? 'bg-cyan-500/10 text-cyan-400 dark:bg-cyan-500/10 dark:text-cyan-400 not-dark:bg-cyan-50 not-dark:text-cyan-700'
                    : 'text-slate-400 hover:bg-slate-800/30 dark:hover:bg-slate-800/30 hover:text-white not-dark:hover:bg-slate-100 not-dark:hover:text-slate-900',
                )}
              >
                <section.icon className="w-4 h-4 shrink-0" />
                <span>{t(section.labelKey)}</span>
              </button>
            ))}
          </nav>
        </Card>

        {/* Settings Content */}
        <Card className="p-6 lg:col-span-3">
          {activeSection === 'clinic' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                <Building2 className="w-5 h-5 text-surgai-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('settings.clinicProfile')}</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.clinicName')}</label>
                  <input type="text" className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg" defaultValue="City Medical Center" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.clinicId')}</label>
                  <input type="text" className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg" defaultValue="CMC-001" disabled />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.address')}</label>
                  <input type="text" className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg" defaultValue="123 Medical Center Blvd, Suite 200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.phone')}</label>
                  <input type="text" className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg" defaultValue="+1 (555) 123-4567" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.email')}</label>
                  <input type="email" className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg" defaultValue="contact@citymedical.com" />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'users' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                <Users className="w-5 h-5 text-surgai-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('settings.userManagement')}</h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('settings.userMgmtDesc')}</p>
              <Button onClick={() => navigate('/admin')}>
                <Users className="w-4 h-4" /> {t('settings.goToUserMgmt')}
              </Button>
            </div>
          )}

          {activeSection === 'roles' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                <Shield className="w-5 h-5 text-surgai-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('settings.rolePermissions')}</h2>
              </div>
              <div className="space-y-3">
                {[
                  { roleKey: 'settings.roleAdmin', descKey: 'settings.roleAdminDesc', badgeKey: 'settings.roleAdminBadge' },
                  { roleKey: 'settings.roleManager', descKey: 'settings.roleManagerDesc', badgeKey: 'settings.roleManagerBadge' },
                  { roleKey: 'settings.roleSurgeon', descKey: 'settings.roleSurgeonDesc', badgeKey: 'settings.roleSurgeonBadge' },
                  { roleKey: 'settings.roleViewer', descKey: 'settings.roleViewerDesc', badgeKey: 'settings.roleViewerBadge' },
                ].map((r) => (
                  <div key={r.roleKey} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800/50">
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{t(r.roleKey)}</p>
                      <p className="text-xs text-slate-500">{t(r.descKey)}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{t(r.badgeKey)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'prediction' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                <Brain className="w-5 h-5 text-surgai-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('settings.predictionParams')}</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.defaultBuffer')}</label>
                  <input type="number" className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg" defaultValue={15} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.confThreshold')}</label>
                  <input type="number" className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg" defaultValue={70} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.maxOpsPerDay')}</label>
                  <input type="number" className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg" defaultValue={10} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.minDurationAlert')}</label>
                  <input type="number" className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg" defaultValue={180} />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'schedule' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                <Clock className="w-5 h-5 text-surgai-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('settings.scheduleBuffer')}</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.bufferBetween')}</label>
                  <input type="number" className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg" defaultValue={15} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.cleaningTime')}</label>
                  <input type="number" className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg" defaultValue={20} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.opHoursStart')}</label>
                  <input type="time" className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg" defaultValue="08:00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.opHoursEnd')}</label>
                  <input type="time" className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg" defaultValue="17:00" />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                <Bell className="w-5 h-5 text-surgai-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('settings.notifications')}</h2>
              </div>
              <div className="space-y-4">
                {notificationSettings.map((item, idx) => (
                  <div key={item.labelKey} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800/50">
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{t(item.labelKey)}</p>
                      <p className="text-xs text-slate-500">{t(item.descKey)}</p>
                    </div>
                    <button
                      className={`relative w-10 h-6 rounded-full transition-colors ${item.enabled ? 'bg-surgai-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                      role="switch" aria-checked={item.enabled} aria-label={t(item.labelKey)}
                      onClick={() => toggleNotification(idx)}
                    >
                      <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${item.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                <Lock className="w-5 h-5 text-surgai-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('settings.dataPrivacy')}</h2>
              </div>
              <div className="space-y-4">
                {privacySettings.map((item, idx) => (
                  <div key={item.labelKey} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800/50">
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{t(item.labelKey)}</p>
                      <p className="text-xs text-slate-500">{t(item.descKey)}</p>
                    </div>
                    <button
                      className={`relative w-10 h-6 rounded-full transition-colors ${
                        item.enabled ? 'bg-surgai-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                      role="switch"
                      aria-checked={item.enabled}
                      aria-label={t(item.labelKey)}
                      onClick={() => togglePrivacy(idx)}
                    >
                      <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${
                        item.enabled ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'api' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                <Code className="w-5 h-5 text-surgai-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('settings.apiConfig')}</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.apiEndpoint')}</label>
                  <input type="text" className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg font-mono" defaultValue="https://api.surgai.com/v1" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.apiKey')}</label>
                  <div className="flex gap-2">
                    <input type="password" className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg font-mono" defaultValue="sk-surgai-********************" readOnly />
                    <Button variant="outline" size="sm">{t('settings.regenerate')}</Button>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('settings.exampleRequest')}</h4>
                  <code className="text-xs text-slate-500 block whitespace-pre-wrap">
{`POST /v1/predict
{
  "operation_type": "Total Knee Replacement",
  "surgeon_experience": "Senior",
  "complexity": "High"
}`}
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-5 mt-5 border-t border-slate-200 dark:border-slate-800">
            <Button onClick={handleSave}>
              <Save className="w-4 h-4" /> {saved ? t('settings.settingsSaved') : t('settings.saveSettings')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
