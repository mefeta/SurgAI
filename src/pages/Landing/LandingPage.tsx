import { useNavigate } from 'react-router-dom'
import { useLocale } from '@/context/LocaleContext'
import {
  Brain,
  CalendarCheck,
  TrendingDown,
  ArrowRight,
  Users,
  BarChart3,
  Target,
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    titleKey: 'landing.feature1Title',
    descKey: 'landing.feature1Desc',
  },
  {
    icon: CalendarCheck,
    titleKey: 'landing.feature2Title',
    descKey: 'landing.feature2Desc',
  },
  {
    icon: TrendingDown,
    titleKey: 'landing.feature4Title',
    descKey: 'landing.feature4Desc',
  },
]

export function LandingPage() {
  const navigate = useNavigate()
  const { t } = useLocale()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0b1124', color: '#ffffff' }}>
      {/* Ambient background — red and navy glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-15%] right-[-5%] w-[70%] h-[70%] rounded-full opacity-[0.05]"
          style={{
            background:
              'radial-gradient(ellipse at center, #ed1b24 0%, transparent 70%)',
          }}
        />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full opacity-[0.04]"
          style={{
            background:
              'radial-gradient(ellipse at center, #23408e 0%, transparent 70%)',
          }}
        />
        {/* Graph-paper dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.015]">
          <defs>
            <pattern id="landing-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="0.8" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#landing-grid)" />
        </svg>
      </div>

      {/* ===== HEADER ===== */}
      <header className="relative z-10"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="mx-auto px-6 lg:px-10" style={{ maxWidth: '1280px' }}>
          <div className="flex items-center justify-between" style={{ height: '64px' }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-md"
                style={{
                  width: 28,
                  height: 28,
                  background: '#ed1b24',
                  boxShadow: '0 0 12px rgba(237,27,36,0.25)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <span className="text-base font-semibold tracking-tight"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Surg<span style={{ color: '#ed1b24' }}>AI</span>
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm transition-colors"
                style={{ color: '#7a7e86', fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.color = '#7a7e86'}
              >
                {t('landing.features')}
              </a>
              <a href="#stats" className="text-sm transition-colors"
                style={{ color: '#7a7e86', fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.color = '#7a7e86'}
              >
                {t('landing.statistics')}
              </a>
              <a href="#about" className="text-sm transition-colors"
                style={{ color: '#7a7e86', fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.color = '#7a7e86'}
              >
                {t('landing.about')}
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="text-sm transition-colors px-4 py-2 rounded-lg"
                style={{
                  color: '#7a7e86',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.color = '#7a7e86'}
              >
                {t('landing.signIn')}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-medium px-5 py-2 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: '#ed1b24',
                  color: '#ffffff',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#f53b42'
                  e.currentTarget.style.transform = 'scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(230,57,70,0.3)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#ed1b24'
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {t('landing.getStarted')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative z-10 mx-auto px-6 lg:px-10"
        style={{ maxWidth: '1280px', paddingTop: '100px', paddingBottom: '80px' }}
      >
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Left — Editorial Text */}
          <div className="lg:col-span-7 space-y-8"
            style={{ animation: 'fade-up 0.6s ease-out' }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase"
              style={{
                color: '#ed1b24',
                border: '1px solid rgba(237,27,36,0.2)',
                backgroundColor: 'rgba(237,27,36,0.06)',
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '0.08em',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: '#ed1b24',
                  animation: 'pulse-glow 2s ease-in-out infinite',
                }}
              />
              {t('landing.heroBadge')}
            </div>

            <h1 className="text-[3rem] leading-[1.08] lg:text-[4rem] xl:text-[4.8rem] font-normal tracking-[-0.02em]"
              style={{
                fontFamily: "'DM Serif Display', serif",
                color: '#ffffff',
              }}
            >
              {t('landing.heroTitle')}{' '}
              <span style={{ color: '#ed1b24' }}>intelligence</span>
            </h1>

            <p className="text-base lg:text-lg leading-relaxed max-w-lg"
              style={{ color: '#7a7e86', fontFamily: "'DM Sans', sans-serif" }}
            >
              {t('landing.heroDesc')}
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: '#ed1b24',
                  color: '#ffffff',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#f53b42'
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(230,57,70,0.3)'
                  e.currentTarget.style.transform = 'scale(1.02)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#ed1b24'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <Brain size={18} />
                {t('landing.startPrediction')}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#c0c4cc',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
                }}
              >
                {t('landing.viewDashboard')}
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="flex items-center gap-5 text-xs"
              style={{ color: '#5c6068', fontFamily: "'DM Sans', sans-serif" }}
            >
              <span className="flex items-center gap-1.5">
                <span style={{ color: '#ed1b24' }}>&#x2713;</span>
                HIPAA Compliant
              </span>
              <span className="flex items-center gap-1.5">
                <span style={{ color: '#ed1b24' }}>&#x2713;</span>
                Clinic Ready
              </span>
              <span className="flex items-center gap-1.5">
                <span style={{ color: '#ed1b24' }}>&#x2713;</span>
                94.2% Accuracy
              </span>
            </div>
          </div>

          {/* Right — Clinical Monitor Visual */}
          <div className="lg:col-span-5 flex justify-center"
            style={{ animation: 'fade-up 0.6s ease-out 0.15s both' }}
          >
            <div className="relative w-full"
              style={{ maxWidth: 380 }}
            >
              {/* Glow behind */}
              <div className="absolute -inset-6 rounded-[32px] opacity-30"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(237,27,36,0.12) 0%, transparent 70%)',
                }}
              />

              {/* Monitor card */}
              <div className="relative overflow-hidden rounded-2xl p-[1px]"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)' }}
              >
                <div className="rounded-2xl p-6"
                  style={{
                    backgroundColor: 'rgba(11,17,36,0.85)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {/* Monitor header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ed1b24' }} />
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f4a261' }} />
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ed1b24' }} />
                      </div>
                      <span className="text-[11px] font-medium tracking-wider uppercase ml-1"
                        style={{ color: '#4a4e56', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.1em' }}
                      >
                        OR Monitor
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider uppercase"
                      style={{ color: '#ed1b24', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.08em' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: '#ed1b24',
                          boxShadow: '0 0 6px rgba(237,27,36,0.6)',
                        }}
                      />
                      Active
                    </div>
                  </div>

                  {/* Operation info */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] tracking-wider uppercase"
                          style={{ color: '#4a4e56', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.06em' }}
                        >
                          Current Case
                        </span>
                        <span className="text-xs font-medium"
                          style={{ color: '#ed1b24', fontFamily: "'DM Sans', sans-serif" }}
                        >
                          TKA-2407
                        </span>
                      </div>
                      <p className="text-sm"
                        style={{ color: '#e0e2e6', fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Total Knee Replacement
                      </p>
                    </div>

                    {/* Heart-rate line */}
                    <div className="py-1">
                      <svg viewBox="0 0 300 40" className="w-full" style={{ height: 32 }}>
                        <defs>
                          <linearGradient id="ecg-line-grad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#ed1b24" stopOpacity="0" />
                            <stop offset="15%" stopColor="#ed1b24" stopOpacity="1" />
                            <stop offset="85%" stopColor="#ed1b24" stopOpacity="1" />
                            <stop offset="100%" stopColor="#ed1b24" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        <line x1="0" y1="8" x2="300" y2="8" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                        <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                        <line x1="0" y1="32" x2="300" y2="32" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                        {/* ECG waveform */}
                        <path
                          d="M0,20 L30,20 L35,12 L40,28 L45,20 L60,20 L65,14 L70,26 L75,20 L90,20 L95,8 L100,32 L105,20 L120,20 L130,20 L135,16 L140,24 L145,20 L160,20 L165,12 L170,28 L175,20 L190,20 L200,20 L205,14 L210,26 L215,20 L230,20 L235,10 L240,30 L245,20 L260,20 L270,20 L275,16 L280,24 L285,20 L300,20"
                          fill="none"
                          stroke="url(#ecg-line-grad)"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="animate-[ecg-draw_3s_ease-out_forwards]"
                          style={{
                            strokeDasharray: 600,
                            strokeDashoffset: 600,
                            animation: 'ecg-draw 4s ease-out forwards',
                          }}
                        />
                      </svg>
                    </div>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl p-3.5"
                        style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <p className="text-[10px] tracking-wider uppercase mb-1"
                          style={{ color: '#4a4e56', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.08em' }}
                        >
                          Est. Duration
                        </p>
                        <p className="text-xl font-medium tracking-tight"
                          style={{ color: '#ffffff', fontFamily: "'DM Sans', sans-serif" }}
                        >
                          74<span className="text-xs font-normal" style={{ color: '#5c6068' }}>min</span>
                        </p>
                      </div>
                      <div className="rounded-xl p-3.5"
                        style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <p className="text-[10px] tracking-wider uppercase mb-1"
                          style={{ color: '#4a4e56', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.08em' }}
                        >
                          Confidence
                        </p>
                        <p className="text-xl font-medium tracking-tight"
                          style={{ color: '#ed1b24', fontFamily: "'DM Sans', sans-serif" }}
                        >
                          92%
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] tracking-wider uppercase mb-1.5"
                        style={{ color: '#4a4e56', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.06em' }}
                      >
                        <span>Progress</span>
                        <span>62%</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden"
                        style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                      >
                        <div className="h-full rounded-full transition-all"
                          style={{
                            width: '62%',
                            backgroundColor: '#ed1b24',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="relative z-10 mx-auto px-6 lg:px-10"
        style={{ maxWidth: '1280px', paddingTop: '60px', paddingBottom: '100px' }}
      >
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-6"
            style={{
              color: '#ed1b24',
              border: '1px solid rgba(237,27,36,0.2)',
              backgroundColor: 'rgba(237,27,36,0.06)',
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '0.08em',
            }}
          >
            {t('landing.platformFeatures')}
          </div>
          <h2 className="text-3xl lg:text-4xl font-normal mb-4 tracking-[-0.01em]"
            style={{
              fontFamily: "'DM Serif Display', serif",
              color: '#ffffff',
            }}
          >
            {t('landing.featuresTitle')}
          </h2>
          <p className="text-base max-w-xl mx-auto"
            style={{ color: '#7a7e86', fontFamily: "'DM Sans', sans-serif" }}
          >
            {t('landing.featuresDesc')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={feature.titleKey}
              className="group rounded-2xl p-8 transition-all duration-300"
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                animation: `fade-up 0.5s ease-out ${0.1 + i * 0.1}s both`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(237,27,36,0.04)'
                e.currentTarget.style.borderColor = 'rgba(237,27,36,0.15)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 transition-colors"
                style={{
                  backgroundColor: 'rgba(237,27,36,0.08)',
                  border: '1px solid rgba(237,27,36,0.1)',
                }}
              >
                <feature.icon className="w-5 h-5" style={{ color: '#ed1b24' }} />
              </div>
              <h3 className="text-base font-medium mb-3"
                style={{ color: '#ffffff', fontFamily: "'DM Sans', sans-serif" }}
              >
                {t(feature.titleKey)}
              </h3>
              <p className="text-sm leading-relaxed"
                style={{ color: '#7a7e86', fontFamily: "'DM Sans', sans-serif" }}
              >
                {t(feature.descKey)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section id="stats" className="relative z-10 mx-auto px-6 lg:px-10"
        style={{ maxWidth: '1280px', paddingTop: '60px', paddingBottom: '100px' }}
      >
        <div className="rounded-3xl p-10 lg:p-16"
          style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-6"
              style={{
                color: '#ed1b24',
                border: '1px solid rgba(237,27,36,0.2)',
                backgroundColor: 'rgba(237,27,36,0.06)',
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '0.08em',
              }}
            >
              {t('landing.performanceMetrics')}
            </div>
            <h2 className="text-3xl lg:text-4xl font-normal tracking-[-0.01em]"
              style={{
                fontFamily: "'DM Serif Display', serif",
                color: '#ffffff',
              }}
            >
              {t('landing.provenResults')}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { value: t('landing.stat1Value'), label: t('landing.stat1Label'), color: '#ed1b24' },
              { value: t('landing.stat2Value'), label: t('landing.stat2Label'), color: '#ed1b24' },
              { value: t('landing.stat3Value'), label: t('landing.stat3Label'), color: '#f4a261' },
              { value: t('landing.stat4Value'), label: t('landing.stat4Label'), color: '#ed1b24' },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center"
                style={{ animation: `fade-up 0.5s ease-out ${0.1 + i * 0.08}s both` }}
              >
                <p className="text-4xl lg:text-5xl font-medium tracking-tight mb-1"
                  style={{ color: stat.color, fontFamily: "'DM Serif Display', serif" }}
                >
                  {stat.value}
                </p>
                <p className="text-sm"
                  style={{ color: '#7a7e86', fontFamily: "'DM Sans', sans-serif" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT / CTA ===== */}
      <section id="about" className="relative z-10 mx-auto px-6 lg:px-10"
        style={{ maxWidth: '1280px', paddingTop: '60px', paddingBottom: '100px' }}
      >
        <div className="grid lg:grid-cols-12 gap-14 lg:gap-20 items-center">
          {/* Left */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase"
              style={{
                color: '#ed1b24',
                border: '1px solid rgba(237,27,36,0.2)',
                backgroundColor: 'rgba(237,27,36,0.06)',
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '0.08em',
              }}
            >
              {t('landing.whySurgAI')}
            </div>
            <h2 className="text-3xl lg:text-4xl font-normal tracking-[-0.01em]"
              style={{
                fontFamily: "'DM Serif Display', serif",
                color: '#ffffff',
              }}
            >
              {t('landing.whyTitle')}
            </h2>
            <p className="text-base leading-relaxed max-w-xl"
              style={{ color: '#7a7e86', fontFamily: "'DM Sans', sans-serif" }}
            >
              {t('landing.whyDesc')}
            </p>
            <div className="space-y-4 pt-2">
              {[
                { icon: Users, text: t('landing.trustedBy') },
                { icon: BarChart3, text: t('landing.integrates') },
                { icon: Target, text: t('landing.accuracy') },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 text-sm"
                  style={{ color: '#7a7e86', fontFamily: "'DM Sans', sans-serif" }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(237,27,36,0.08)',
                      border: '1px solid rgba(237,27,36,0.1)',
                    }}
                  >
                    <item.icon className="w-4 h-4" style={{ color: '#ed1b24' }} />
                  </div>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right — CTA */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl p-8 lg:p-10"
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <h3 className="text-xl font-medium mb-3"
                style={{ color: '#ffffff', fontFamily: "'DM Sans', sans-serif" }}
              >
                {t('landing.ctaTitle')}
              </h3>
              <p className="text-sm mb-6"
                style={{ color: '#7a7e86', fontFamily: "'DM Sans', sans-serif" }}
              >
                {t('landing.ctaDesc')}
              </p>
              <div className="space-y-3 mb-7">
                {[
                  t('landing.ctaItem1'),
                  t('landing.ctaItem2'),
                  t('landing.ctaItem3'),
                  t('landing.ctaItem4'),
                ].map((text) => (
                  <div key={text} className="flex items-center gap-2.5 text-sm"
                    style={{ color: '#7a7e86', fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: 'rgba(237,27,36,0.12)',
                        border: '1px solid rgba(237,27,36,0.2)',
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#ed1b24' }} />
                    </div>
                    {text}
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: '#ed1b24',
                  color: '#ffffff',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#f53b42'
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(230,57,70,0.25)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#ed1b24'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {t('landing.enterDashboard')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="mx-auto px-6 lg:px-10"
          style={{ maxWidth: '1280px', paddingTop: '32px', paddingBottom: '32px' }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm"
              style={{ color: '#5c6068', fontFamily: "'DM Sans', sans-serif" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ed1b24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span>{t('landing.footerCopyright')}</span>
            </div>
            <div className="flex items-center gap-6 text-sm"
              style={{ color: '#5c6068', fontFamily: "'DM Sans', sans-serif" }}
            >
              <a href="#" className="transition-colors"
                style={{ color: '#5c6068' }}
                onMouseEnter={e => e.currentTarget.style.color = '#c0c4cc'}
                onMouseLeave={e => e.currentTarget.style.color = '#5c6068'}
              >
                {t('landing.privacy')}
              </a>
              <a href="#" className="transition-colors"
                style={{ color: '#5c6068' }}
                onMouseEnter={e => e.currentTarget.style.color = '#c0c4cc'}
                onMouseLeave={e => e.currentTarget.style.color = '#5c6068'}
              >
                {t('landing.terms')}
              </a>
              <a href="#" className="transition-colors"
                style={{ color: '#5c6068' }}
                onMouseEnter={e => e.currentTarget.style.color = '#c0c4cc'}
                onMouseLeave={e => e.currentTarget.style.color = '#5c6068'}
              >
                {t('landing.contact')}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
