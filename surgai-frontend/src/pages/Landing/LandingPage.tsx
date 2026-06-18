import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useLocale } from '@/context/LocaleContext'
import {
  Clock,
  TrendingDown,
  Activity,
  CalendarCheck,
  BarChart3,
  Shield,
  Brain,
  ArrowRight,
  CheckCircle,
  Users,
  Hospital,
  Target,
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    titleKey: 'landing.feature1Title',
    descKey: 'landing.feature1Desc',
    color: 'from-surgai-500 to-blue-600',
  },
  {
    icon: CalendarCheck,
    titleKey: 'landing.feature2Title',
    descKey: 'landing.feature2Desc',
    color: 'from-teal-500 to-emerald-600',
  },
  {
    icon: Clock,
    titleKey: 'landing.feature3Title',
    descKey: 'landing.feature3Desc',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: TrendingDown,
    titleKey: 'landing.feature4Title',
    descKey: 'landing.feature4Desc',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: BarChart3,
    titleKey: 'landing.feature5Title',
    descKey: 'landing.feature5Desc',
    color: 'from-cyan-500 to-teal-600',
  },
  {
    icon: Shield,
    titleKey: 'landing.feature6Title',
    descKey: 'landing.feature6Desc',
    color: 'from-rose-500 to-pink-600',
  },
]

const stats = [
  { icon: Target, valueKey: 'landing.stat1Value', labelKey: 'landing.stat1Label', color: 'text-teal-600' },
  { icon: TrendingDown, valueKey: 'landing.stat2Value', labelKey: 'landing.stat2Label', color: 'text-surgai-600' },
  { icon: Activity, valueKey: 'landing.stat3Value', labelKey: 'landing.stat3Label', color: 'text-violet-600' },
  { icon: Clock, valueKey: 'landing.stat4Value', labelKey: 'landing.stat4Label', color: 'text-amber-600' },
]

export function LandingPage() {
  const navigate = useNavigate()
  const { t } = useLocale()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-surgai-500 to-teal-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-slate-900 dark:text-white">Surg</span>
                <span className="text-surgai-500">AI</span>
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{t('landing.features')}</a>
              <a href="#stats" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{t('landing.statistics')}</a>
              <a href="#about" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{t('landing.about')}</a>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                {t('landing.signIn')}
              </Button>
              <Button size="sm" onClick={() => navigate('/login')}>
                {t('landing.getStarted')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Badge variant="info" size="md">{t('landing.heroBadge')}</Badge>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
              {t('landing.heroTitle')}{' '}
              <span className="bg-gradient-to-r from-surgai-500 to-teal-500 bg-clip-text text-transparent">AI</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('landing.heroDesc')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" onClick={() => navigate('/login')}>
                <Brain className="w-5 h-5" />
                {t('landing.startPrediction')}
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
                {t('landing.viewDashboard')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-500">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-teal-500" /> {t('landing.hipaa')}</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-teal-500" /> {t('landing.clinicReady')}</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-teal-500" /> {t('landing.fdaListed')}</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-surgai-500/10 to-teal-500/10 rounded-3xl blur-3xl" />
            <Card className="relative p-8 overflow-hidden border-slate-300/50 dark:border-slate-700/50 shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-surgai-500/5 to-teal-500/5 rounded-full blur-2xl" />
              <div className="space-y-6 relative">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('landing.liveDemo')}</h3>
                  <Badge variant="success" size="sm">{t('landing.aiActive')}</Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{t('landing.operation')}</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{t('landing.totalKnee')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{t('landing.surgeon')}</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{t('landing.drSarah')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{t('landing.complexity')}</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{t('landing.high')}</span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-500 dark:text-slate-400">{t('landing.predictedDuration')}</span>
                      <span className="text-2xl font-bold text-surgai-600 dark:text-surgai-400">74 {t('prediction.min')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500 dark:text-slate-400">{t('landing.confidence')}</span>
                      <span className="text-sm font-semibold text-teal-600">87%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-12">
          <Badge variant="info" size="md">{t('landing.platformFeatures')}</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mt-4 mb-4">
            {t('landing.featuresTitle')}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t('landing.featuresDesc')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.titleKey} hover className="group p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-200`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t(feature.titleKey)}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t(feature.descKey)}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-8 lg:p-12 shadow-xl">
          <div className="text-center mb-10">
            <Badge variant="info" size="md" className="bg-white/10 text-white">{t('landing.performanceMetrics')}</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mt-4">
              {t('landing.provenResults')}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.labelKey} className="text-center">
                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                <p className="text-3xl lg:text-4xl font-bold text-white mb-1">{t(stat.valueKey)}</p>
                <p className="text-sm text-slate-400">{t(stat.labelKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Value Prop */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="info" size="md">{t('landing.whySurgAI')}</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mt-4 mb-4">
              {t('landing.whyTitle')}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              {t('landing.whyDesc')}
            </p>
            <div className="space-y-4">
              {[
                { icon: Users, textKey: 'landing.trustedBy' },
                { icon: Hospital, textKey: 'landing.integrates' },
                { icon: Target, textKey: 'landing.accuracy' },
              ].map((item) => (
                <div key={item.textKey} className="flex items-start gap-3">
                  <item.icon className="w-5 h-5 text-surgai-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{t(item.textKey)}</span>
                </div>
              ))}
            </div>
          </div>
          <Card className="p-8 border-slate-300/50 dark:border-slate-700/50 shadow-lg">
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('landing.ctaTitle')}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('landing.ctaDesc')}</p>
              <div className="space-y-3">
                {['landing.ctaItem1', 'landing.ctaItem2', 'landing.ctaItem3', 'landing.ctaItem4'].map((key) => (
                  <div key={key} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                    {t(key)}
                  </div>
                ))}
              </div>
              <Button size="lg" className="w-full" onClick={() => navigate('/login')}>
                <Activity className="w-5 h-5" />
                {t('landing.enterDashboard')}
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Activity className="w-4 h-4 text-surgai-500" />
              <span>{t('landing.footerCopyright')}</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">{t('landing.privacy')}</a>
              <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">{t('landing.terms')}</a>
              <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">{t('landing.contact')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
