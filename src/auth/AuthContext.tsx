import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { type Permission } from '../access'
import { clearSessionToken, getCurrentPermissions, getCurrentUser, signIn, type SessionUser } from '../services/api'

type Status = 'loading' | 'unauthenticated' | 'authenticated'
interface Context { status: Status; user: SessionUser | null; permissions: Permission[]; error: string | null; has: (permission: Permission) => boolean; login: (email: string, password: string) => Promise<void>; logout: () => void }
const AuthContext = createContext<Context | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('unauthenticated')
  const [user, setUser] = useState<SessionUser | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [error, setError] = useState<string | null>(null)
  const login = useCallback(async (email: string, password: string) => {
    setStatus('loading'); setError(null)
    try {
      await signIn(email, password)
      const [currentUser, granted] = await Promise.all([getCurrentUser(), getCurrentPermissions()])
      setUser(currentUser); setPermissions(granted); setStatus('authenticated')
    } catch {
      clearSessionToken(); setStatus('unauthenticated'); setError('Unable to sign in. Check your credentials and try again.')
    }
  }, [])
  const logout = useCallback(() => { clearSessionToken(); setUser(null); setPermissions([]); setError(null); setStatus('unauthenticated') }, [])
  const value = useMemo<Context>(() => ({ status, user, permissions, error, has: (permission) => permissions.includes(permission), login, logout }), [status, user, permissions, error, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used inside AuthProvider.'); return context }
