import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../../components/admin/Sidebar'
import '../../components/admin/layout.css'

const ToastCtx = createContext<(msg: string) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

interface Props { children: ReactNode; menu: { id: string; label: string }[]; onLogout: () => void }

export default function AdminLayout({ children, menu, onLogout }: Props) {
  const [toast, setToast] = useState('')
  const showToast = useCallback((m: string) => { setToast(m); setTimeout(() => setToast(''), 3000) }, [])
  const navigate = useNavigate()
  const location = useLocation()
  const currentPage = location.pathname.replace(/^\/admin\//, '').split('/')[0] || 'dashboard'

  return (
    <ToastCtx.Provider value={showToast}>
      <div style={{ display: 'flex', flex: 1, minHeight: 0, height: '100vh' }}>
        <Sidebar menu={menu} page={currentPage}
          onNav={(id) => navigate('/admin/' + id)}
          onTo3D={() => { sessionStorage.setItem('admin_return', '1'); window.location.href = '/' }}
          onLogout={onLogout} />
        <div className="main">{children}</div>
      </div>
      {toast && <div className="toast"><span>{toast}</span></div>}
    </ToastCtx.Provider>
  )
}
