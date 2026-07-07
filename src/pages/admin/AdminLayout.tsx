import { useState, useCallback, createContext, useContext, ReactNode } from 'react'
import type { AdminUser } from '../../hooks/useAdminAuth'
import Sidebar from '../../components/admin/Sidebar'
import DashboardPage from './DashboardPage'
import ViewsPage from './ViewsPage'
import DataPage from './DataPage'
import UsersPage from './UsersPage'
import SettingsPage from './SettingsPage'
import LoginPage from './LoginPage'
import '../../components/admin/layout.css'

const ToastCtx = createContext<(msg: string) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

interface Props { user: AdminUser | null; loading: boolean; menu: { id: string; label: string }[]; canManage: boolean; login: (u: string, p: string) => Promise<AdminUser>; logout: () => void }

const roleLabel: Record<string, string> = { super_admin: '超级管理员', admin: '管理员', user: '普通用户' }

export default function AdminLayout({ user, loading, menu, canManage, login, logout }: Props) {
  const [page, setPage] = useState('dashboard')
  const [toast, setToast] = useState('')
  const showToast = useCallback((m: string) => { setToast(m); setTimeout(() => setToast(''), 3000) }, [])

  if (loading) return <div className="main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><span style={{ color: 'var(--ink-soft)', fontSize: 14 }}>加载中...</span></div>
  if (!user) return <LoginPage onLogin={login} />

  return (
    <ToastCtx.Provider value={showToast}>
      <div style={{ display: 'flex', flex: 1, minHeight: 0, height: '100vh' }}>
        <Sidebar username={user.username} role={roleLabel[user.role] || user.role} menu={menu} page={page}
          onNav={setPage} onTo3D={() => { sessionStorage.setItem('admin_return', '1'); window.location.href = '/' }}
          onLogout={() => { fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {}); logout() }} />
        <div className="main">
          {page === 'dashboard' && <DashboardPage />}
          {page === 'views' && <ViewsPage />}
          {page === 'data' && <DataPage />}
          {page === 'users' && canManage && <UsersPage />}
          {page === 'settings' && <SettingsPage />}
        </div>
      </div>
      {toast && <div className="toast"><span>{toast}</span></div>}
    </ToastCtx.Provider>
  )
}
