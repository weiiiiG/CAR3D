import { useState, useEffect } from 'react'
import type { AdminUser } from '../../hooks/useAdminAuth'
import DashboardPage from './DashboardPage'
import ViewsPage from './ViewsPage'
import DataPage from './DataPage'
import UsersPage from './UsersPage'
import SettingsPage from './SettingsPage'
import LoginPage from './LoginPage'
import { ToastProvider } from './AdminToast'
import '../../styles/admin.css'

interface Props {
  user: AdminUser | null
  loading: boolean
  menu: { id: string; label: string }[]
  canManage: boolean
  login: (u: string, p: string) => Promise<AdminUser>
  logout: () => void
}

export default function AdminLayout({ user, loading, menu, canManage, login, logout }: Props) {
  const [page, setPage] = useState('dashboard')

  const onNavTo3D = () => { sessionStorage.setItem('admin_return', '1'); window.location.href = '/' }

  if (loading) return <div className="main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><span style={{ color: 'var(--ink-soft)', fontSize: 14 }}>加载中...</span></div>

  if (!user) return <LoginPage onLogin={login} />

  return (
    <ToastProvider>
      <div style={{ display: 'flex', flex: 1, minHeight: 0, height: '100vh' }}>
        <div className="sidebar">
          <div className="sidebar-brand">CAR<span>3D</span></div>
          <nav className="sidebar-nav">
            {menu.map(item => (
              <a key={item.id} className={page === item.id ? 'active' : ''} onClick={() => setPage(item.id)} data-page={item.id}>{item.label}</a>
            ))}
          </nav>
          <div style={{ flex: 1, minHeight: 4 }} />
          <div className="sidebar-status">
            <span className="dot" /> <span>{user.username}</span>
            <span style={{ marginLeft: 'auto', fontSize: 10 }}>
              {user.role === 'super_admin' ? '超级管理员' : user.role === 'admin' ? '管理员' : '普通用户'}
            </span>
          </div>
          <a className="sidebar-3d" onClick={onNavTo3D} style={{ marginTop: 6 }}>返回 3D 展示</a>
          <a className="sidebar-3d" onClick={logout} style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', marginTop: 4 }}>退出登录</a>
        </div>
        <div className="main">
          {page === 'dashboard' && <DashboardPage />}
          {page === 'views' && <ViewsPage />}
          {page === 'data' && <DataPage />}
          {page === 'users' && canManage && <UsersPage />}
          {page === 'settings' && <SettingsPage />}
        </div>
      </div>
    </ToastProvider>
  )
}
