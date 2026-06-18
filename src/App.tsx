import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from '@/components/ui/Toast'
import { LocaleProvider } from '@/context/LocaleContext'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { LandingPage } from '@/pages/Landing/LandingPage'
import { LoginPage } from '@/pages/Login/LoginPage'
import { DashboardPage } from '@/pages/Dashboard/DashboardPage'
import { PredictionPage } from '@/pages/Prediction/PredictionPage'
import { SchedulePage } from '@/pages/Schedule/SchedulePage'
import { CaseHistoryPage } from '@/pages/CaseHistory/CaseHistoryPage'
import { DataUploadPage } from '@/pages/DataUpload/DataUploadPage'
import { AnalyticsPage } from '@/pages/Analytics/AnalyticsPage'
import { SettingsPage } from '@/pages/Settings/SettingsPage'
import { AdminPage } from '@/pages/Admin/AdminPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-2 border-surgai-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/prediction" element={<PredictionPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/history" element={<CaseHistoryPage />} />
        <Route path="/upload" element={<DataUploadPage />} />
<Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <LocaleProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </LocaleProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
