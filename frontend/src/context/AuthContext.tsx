import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../types'
import { authApi } from '../api'

interface AuthCtx {
  user: User | null
  loading: boolean
  login: (data: object) => Promise<void>
  register: (data: object) => Promise<void>
  logout: () => void
}

const Ctx = createContext<AuthCtx>(null!)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('clinic_token')
    if (!token) { setLoading(false); return }
    authApi.me().then(u => setUser(u)).catch(() => localStorage.removeItem('clinic_token')).finally(() => setLoading(false))
  }, [])

  const login = async (data: object) => {
    const { token, user } = await authApi.login(data)
    localStorage.setItem('clinic_token', token)
    setUser(user)
  }

  const register = async (data: object) => {
    const { token, user } = await authApi.register(data)
    localStorage.setItem('clinic_token', token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('clinic_token')
    setUser(null)
  }

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>
}
