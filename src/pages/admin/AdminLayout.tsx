import { useState, useCallback, createContext, useContext, ReactNode } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../../components/admin/Sidebar'
import '../../components/admin/layout.css'

const ToastCtx = createContext<(msg: string) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

interface Props { children: ReactNode; menu: { id: string; label: string }[]; canManage: boolean; onLogout: () => void }

const roleLabel: Record<string, string> = { super_admin: '超级管理员', admin: '管理员', user: '普通用户' }

export default function AdminLayout({ children, menu, canManage, onLogout }: Props) {
  const [toast, setToast] = useState('')
  const showToast = useCallback((m: string) => { setToast(m); setTimeout(() => setToast(''), 3000) }, [])
  const navigate = useNavigate()
  const location = useLocation()
  const currentPage = location.pathname.split('/').pop() || 'dashboard'

  return (
    <ToastCtx.Provider value={showToast}>
      <div style={{ display: 'flex', flex: 1, minHeight: 0, height: '100vh' }}>
        <Sidebar menu={menu} page={currentPage}
          onNav={(id) => navigate(id)}
          onTo3D={() => { sessionStorage.setItem('admin_return', '1'); window.location.href = '/' }}
          onLogout={onLogout} />
        <div className="main">{children}</div>
      </div>
      {toast && <div className="toast"><span>{toast}</span></div>}
    </ToastCtx.Provider>
  )
}
