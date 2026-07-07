import { useState, useEffect, useCallback } from 'react'

const API = '/api'

export interface AdminUser {
  id: number; username: string; role: 'super_admin' | 'admin' | 'user'; createdAt: string
}
export interface ViewData {
  key: string; label: string; description?: string; spec?: string; specCategory?: string
  posX: number; posY: number; posZ: number; targetX: number; targetY: number; targetZ: number
  chartConfig?: any; isActive: boolean; sortOrder: number
}
export interface OverrideData { viewKey: string; posX: number; posY: number; posZ: number; targetX: number; targetY: number; targetZ: number }

const ROLE_MENU: Record<string, { id: string; label: string }[]> = {
  super_admin: [{ id: 'dashboard', label: '仪表盘' }, { id: 'views', label: '视角管理' }, { id: 'data', label: '数据概览' }, { id: 'users', label: '用户管理' }, { id: 'settings', label: '设置' }],
  admin: [{ id: 'dashboard', label: '仪表盘' }, { id: 'views', label: '视角管理' }, { id: 'data', label: '数据概览' }, { id: 'settings', label: '设置' }],
  user: [{ id: 'dashboard', label: '仪表盘' }, { id: 'data', label: '数据概览' }],
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState('')

  useEffect(() => {
    fetch(API + '/auth/refresh', { method: 'POST', credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) { setLoading(false); return }
        setToken(d.access_token)
        return fetch(API + '/auth/me', { credentials: 'include', headers: { Authorization: 'Bearer ' + d.access_token } })
      })
      .then((r: any) => r?.json?.().then((u: AdminUser) => { setUser(u); setLoading(false) }))
      .catch(() => setLoading(false))
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const r = await fetch(API + '/auth/login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
    if (!r.ok) throw new Error(r.status === 401 ? '用户名或密码错误' : '服务器错误')
    const d = await r.json()
    setToken(d.access_token)
    const r2 = await fetch(API + '/auth/me', { credentials: 'include', headers: { Authorization: 'Bearer ' + d.access_token } })
    const u: AdminUser = await r2.json()
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    fetch(API + '/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
    setToken(''); setUser(null)
  }, [])

  const authFetch = useCallback(async (url: string, opts?: RequestInit) => {
    const headers: Record<string, string> = { ...(opts?.headers as Record<string, string> || {}) }
    if (token) headers.Authorization = 'Bearer ' + token
    if (!headers['Content-Type']) headers['Content-Type'] = 'application/json'
    let res = await fetch(url, { ...opts, headers, credentials: 'include' })
    if (res.status === 401 && token) {
      const r2 = await fetch(API + '/auth/refresh', { method: 'POST', credentials: 'include' })
      if (r2.ok) {
        const d2 = await r2.json()
        setToken(d2.access_token)
        headers.Authorization = 'Bearer ' + d2.access_token
        res = await fetch(url, { ...opts, headers, credentials: 'include' })
      } else {
        setToken(''); setUser(null); throw new Error('Session expired')
      }
    }
    return res
  }, [token])

  const menu = user ? ROLE_MENU[user.role] || ROLE_MENU.user : []
  const canManage = user?.role === 'super_admin' || user?.role === 'admin'

  return { user, loading, token, login, logout, authFetch, menu, canManage, API }
}
