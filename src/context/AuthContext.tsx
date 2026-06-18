import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api } from '@/api/client'

export interface User {
  id: number
  username: string
  full_name: string
  email: string
  role: string
  is_admin: boolean
  clinic_name: string | null
}

interface LoginCredentials {
  username: string
  password: string
}

interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('surgai_token'))
  const [loading, setLoading] = useState(true)

  // On mount / token change, fetch user info
  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    api.get<User>('/auth/me')
      .then((userData) => {
        setUser(userData)
      })
      .catch(() => {
        // Token invalid — clear it
        localStorage.removeItem('surgai_token')
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const res = await api.post<LoginResponse>('/auth/login', credentials)
    localStorage.setItem('surgai_token', res.access_token)
    setToken(res.access_token)
    setUser(res.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('surgai_token')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
