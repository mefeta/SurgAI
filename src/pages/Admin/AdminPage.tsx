import { useState, useEffect, type FormEvent } from 'react'
import { Shield, UserPlus, Users, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/api/client'
import { useAuth, type User } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'

interface CreateUserPayload {
  username: string
  password: string
  full_name: string
  email: string
  role: string
  clinic_name?: string
  is_admin?: boolean
}

export function AdminPage() {
  const { user: currentUser } = useAuth()
  const { t } = useLocale()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('clinic_manager')
  const [clinicName, setClinicName] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function fetchUsers() {
    setLoading(true)
    try {
      const data = await api.get<User[]>('/auth/users')
      setUsers(data)
    } catch {
      setError(t('admin.failedLoad'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  async function handleCreateUser(e: FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password.trim() || !fullName.trim() || !email.trim()) {
      setError(t('admin.validationError'))
      return
    }
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      const payload: CreateUserPayload = {
        username: username.trim(),
        password,
        full_name: fullName.trim(),
        email: email.trim(),
        role,
      }
      if (clinicName.trim()) payload.clinic_name = clinicName.trim()
      if (isAdmin) payload.is_admin = true

      await api.post<User>('/auth/users', payload)
      setSuccess(t('admin.createdSuccess', { name: username }))
      // Reset form
      setUsername('')
      setPassword('')
      setFullName('')
      setEmail('')
      setRole('clinic_manager')
      setClinicName('')
      setIsAdmin(false)
      fetchUsers()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('admin.failedCreate')
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Only admin can view this page
  if (currentUser && !currentUser.is_admin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Shield className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">{t('admin.accessDenied')}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin.accessDeniedDesc')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white dark:text-white not-dark:text-slate-900 font-heading">{t('admin.title')}</h1>
        <p className="text-sm text-slate-400 mt-1">{t('admin.subtitle')}</p>
      </div>

      {/* Create User Form */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-semibold text-white dark:text-white not-dark:text-slate-900 font-heading">{t('admin.createUser')}</h2>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 mb-4 text-sm text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
            {success}
          </div>
        )}

        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t('admin.username')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 text-sm backdrop-blur-sm bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400/50 transition-all not-dark:bg-white/80 not-dark:border-slate-300/50 not-dark:text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t('admin.password')} <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm backdrop-blur-sm bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400/50 transition-all not-dark:bg-white/80 not-dark:border-slate-300/50 not-dark:text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t('admin.fullName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-sm backdrop-blur-sm bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400/50 transition-all not-dark:bg-white/80 not-dark:border-slate-300/50 not-dark:text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t('admin.email')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm backdrop-blur-sm bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400/50 transition-all not-dark:bg-white/80 not-dark:border-slate-300/50 not-dark:text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.role')}</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 text-sm backdrop-blur-sm bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400/50 transition-all not-dark:bg-white/80 not-dark:border-slate-300/50 not-dark:text-slate-900"
            >
              <option value="clinic_manager">{t('admin.roleManager')}</option>
              <option value="surgeon">{t('admin.roleSurgeon')}</option>
              <option value="nurse">{t('admin.roleNurse')}</option>
              <option value="admin">{t('admin.roleAdmin')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.clinicName')}</label>
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder={t('admin.optional')}
              className="w-full px-3 py-2 text-sm backdrop-blur-sm bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50 transition-all not-dark:bg-white/80 not-dark:border-slate-300/50 not-dark:text-slate-900"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="isAdmin"
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-surgai-500 focus:ring-surgai-400"
            />
            <label htmlFor="isAdmin" className="text-sm text-slate-300">
              {t('admin.grantAdmin')}
            </label>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-surgai-500 to-teal-500 rounded-lg hover:from-surgai-600 hover:to-teal-600 disabled:opacity-50 transition-all"
            >
              {submitting ? t('admin.creating') : t('admin.createUserBtn')}
            </button>
          </div>
        </form>
      </Card>

      {/* Users List */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-semibold text-white font-heading">
            {t('admin.systemUsers', { count: users.length })}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-surgai-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/50 dark:border-slate-800/50">
                  <th className="text-left py-3 px-2 font-medium text-slate-400">{t('admin.usernameCol')}</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-400">{t('admin.fullNameCol')}</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-400">{t('admin.emailCol')}</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-400">{t('admin.roleCol')}</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-400">{t('admin.adminCol')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800/50">
                    <td className="py-3 px-2 font-medium text-white dark:text-white not-dark:text-slate-900">{u.username}</td>
                    <td className="py-3 px-2 text-slate-400">{u.full_name}</td>
                    <td className="py-3 px-2 text-slate-400">{u.email}</td>
                    <td className="py-3 px-2">
                      <span className="capitalize text-slate-600 dark:text-slate-400">{u.role}</span>
                    </td>
                    <td className="py-3 px-2">
                      {u.is_admin ? (
                        <Badge variant="info">{t('admin.adminCol')}</Badge>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
