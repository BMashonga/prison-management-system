import axios from 'axios'
import { isPermission, normaliseRole, type Permission, type Role } from '../access'

const tokenKey = 'prison-management-token'
export interface SessionUser { id: string; name: string; role: Role }
type Data = Record<string, unknown>

export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api' })
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(tokenKey)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const asRecord = (value: unknown): Data | null => typeof value === 'object' && value !== null ? value as Data : null
const unwrap = (value: unknown) => {
  const outer = asRecord(value)
  return asRecord(outer?.data) ?? outer
}

export async function getCurrentUser(): Promise<SessionUser> {
  const response = await api.get('/users/me')
  const data = unwrap(response.data)
  const source = asRecord(data?.user) ?? data
  const role = normaliseRole(source?.role)
  if (!source || !role) throw new Error('Current-user response has no supported role.')
  return { id: String(source.id ?? source.userId ?? 'current-user'), name: String(source.name ?? source.fullName ?? source.email ?? 'Authorized staff member'), role }
}

export async function getCurrentPermissions(): Promise<Permission[]> {
  const response = await api.get('/users/me/permissions')
  const data = unwrap(response.data)
  const values = Array.isArray(data?.permissions) ? data.permissions : Array.isArray(response.data) ? response.data : []
  return values.filter((item): item is Permission => typeof item === 'string' && isPermission(item))
}

export async function signIn(email: string, password: string) {
  const response = await api.post('/auth/login', { email, password })
  const data = unwrap(response.data)
  const token = data?.token ?? data?.accessToken
  if (typeof token === 'string') localStorage.setItem(tokenKey, token)
}
export const clearSessionToken = () => localStorage.removeItem(tokenKey)
