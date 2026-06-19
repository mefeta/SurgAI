import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'

export function LoginPage() {
  const { login } = useAuth()
  const { t } = useLocale()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError(t('login.validationRequired'))
      return
    }
    setError('')
    setLoading(true)
    try {
      await login({ username: username.trim(), password })
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('login.invalidCredentials')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1124] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-[0_0_20px_rgba(0,242,254,0.15)] mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white font-heading">
            Surg<span className="text-cyan-400">AI</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">{t('login.title')}</p>
        </div>

        {/* Login Card */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/40 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/60 p-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 font-heading">{t('login.signIn')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t('login.subtitle')}</p>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1">
                {t('login.username')}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('login.usernamePlaceholder')}
                className="w-full px-3 py-2.5 text-sm backdrop-blur-sm bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50 transition-all not-dark:bg-white/80 not-dark:border-slate-300/50 not-dark:text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                {t('login.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder')}
                  className="w-full px-3 py-2.5 pr-10 text-sm backdrop-blur-sm bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50 transition-all not-dark:bg-white/80 not-dark:border-slate-300/50 not-dark:text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:shadow-[0_0_16px_rgba(0,242,254,0.25)] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-heading"
            >
              {loading ? t('login.signingIn') : t('login.signIn')}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 pt-4 border-t border-slate-700/50 dark:border-slate-700/50 not-dark:border-slate-200/50">
            <p className="text-xs font-medium text-slate-400 mb-2">{t('login.demoAccounts')}</p>
            <div className="space-y-1.5 text-xs text-slate-500">
              <p>
                <span className="font-mono text-cyan-400">admin</span> / <span className="font-mono text-cyan-400">admin123</span>
                <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 rounded">{t('login.admin')}</span>
              </p>
              <p>
                <span className="font-mono text-violet-400">efe</span> / <span className="font-mono text-violet-400">doctor123</span>
                <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-violet-500/15 text-violet-400 border border-violet-500/30 rounded">{t('login.doctor')}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
