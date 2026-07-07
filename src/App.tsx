import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ScenePage from './pages/ScenePage'
import AdminLayout from './pages/admin/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import ViewsPage from './pages/admin/ViewsPage'
import DataPage from './pages/admin/DataPage'
import UsersPage from './pages/admin/UsersPage'
import SettingsPage from './pages/admin/SettingsPage'
import LoginPage from './pages/admin/LoginPage'
import { useAdminAuth } from './hooks/useAdminAuth'
import { AuthCtx } from './hooks/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

function AdminApp() {
  const { user, loading, menu, canManage, login, logout, authFetch } = useAdminAuth()

  if (loading) return <div className="main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><span style={{ color: 'var(--ink-soft)', fontSize: 14 }}>加载中...</span></div>
  if (!user) return <LoginPage onLogin={login} />

  return (
    <AuthCtx.Provider value={{ authFetch, canManage, userRole: user.role }}>
      <AdminLayout menu={menu} onLogout={() => { fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {}); logout() }}>
        <Routes>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
          <Route path="views" element={<ErrorBoundary><ViewsPage /></ErrorBoundary>} />
          <Route path="data" element={<ErrorBoundary><DataPage /></ErrorBoundary>} />
          {canManage && <Route path="users" element={<ErrorBoundary><UsersPage /></ErrorBoundary>} />}
          <Route path="settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
        </Routes>
      </AdminLayout>
    </AuthCtx.Provider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScenePage />} />
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  )
}
