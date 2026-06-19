import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { BottomDock } from './BottomDock'

export function AppLayout() {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('surgai_darkMode')
    const isDark = stored === 'true'
    if (isDark) document.documentElement.classList.add('dark')
    return isDark
  })

  const toggleDark = () => {
    const newVal = !darkMode
    setDarkMode(newVal)
    localStorage.setItem('surgai_darkMode', String(newVal))
    document.documentElement.classList.toggle('dark', newVal)
  }

  return (
    <div className="min-h-screen bg-[#0b1124] dark:bg-[#0b1124] not-dark:bg-[#f4f7f6] text-slate-100 dark:text-slate-100 not-dark:text-slate-900 relative">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      <main className="relative z-10 p-4 lg:p-6 pb-4">
        <Outlet />
      </main>
      <BottomDock />
    </div>
  )
}
