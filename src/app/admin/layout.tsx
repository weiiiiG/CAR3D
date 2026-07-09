'use client'

import { useState, useCallback, createContext, useContext } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const ToastCtx = createContext<(msg: string) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState('')
  const showToast = useCallback((m: string) => { setToast(m); setTimeout(() => setToast(''), 3000) }, [])
  const pathname = usePathname()
  const currentPage = pathname.replace(/^\/admin\//, '').split('/')[0] || 'dashboard'

  return (
    <ToastCtx.Provider value={showToast}>
      <div style={{ display: 'flex', flex: 1, minHeight: 0, height: '100vh' }}>
        <div className="sidebar">
          <div className="sidebar-brand">CAR<span>3D</span></div>
          <nav className="sidebar-nav">
            {[{ id: 'dashboard', label: '仪表盘' }, { id: 'views', label: '视角管理' }, { id: 'data', label: '数据概览' }, { id: 'users', label: '用户管理' }, { id: 'settings', label: '设置' }].map(item => (
              <a key={item.id} className={currentPage === item.id ? 'active' : ''} onClick={() => window.location.href = '/admin/' + item.id}>{item.label}</a>
            ))}
          </nav>
          <div style={{ flex: 1, minHeight: 4 }} />
          <a className="sidebar-3d" onClick={() => { sessionStorage.setItem('admin_return', '1'); window.location.href = '/' }}>返回 3D 展示</a>
          <a className="sidebar-3d" onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/admin' }}>退出登录</a>
        </div>
        <div className="main">{children}</div>
      </div>
      {toast && <div className="toast"><span>{toast}</span></div>}
    </ToastCtx.Provider>
  )
}
