'use client'

import { useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { ToastCtx } from '../../hooks/useToast'
import adminStyles from '../../components/admin/layout.module.scss'
import sidebarStyles from '../../components/admin/sidebar.module.scss'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState('')
  const showToast = useCallback((m: string) => { setToast(m); setTimeout(() => setToast(''), 3000) }, [])
  const pathname = usePathname()
  const currentPage = (pathname ?? '').replace(/^\/admin\//, '').split('/')[0] || 'dashboard'

  return (
    <ToastCtx.Provider value={showToast}>
      <div style={{ display: 'flex', flex: 1, minHeight: 0, height: '100vh' }}>
        <div className={sidebarStyles.sidebar}>
          <div className={sidebarStyles['sidebar-brand']}>CAR<span>3D</span></div>
          <nav className={sidebarStyles['sidebar-nav']}>
            {[{ id: 'dashboard', label: '仪表盘' }, { id: 'views', label: '视角管理' }, { id: 'data', label: '数据概览' }, { id: 'users', label: '用户管理' }, { id: 'settings', label: '设置' }].map(item => (
              <a key={item.id} className={currentPage === item.id ? sidebarStyles.active : ''} onClick={() => window.location.href = '/admin/' + item.id}>{item.label}</a>
            ))}
          </nav>
          <div style={{ flex: 1, minHeight: 4 }} />
          <a className={sidebarStyles['sidebar-3d']} onClick={() => { sessionStorage.setItem('admin_return', '1'); window.location.href = '/' }}>返回 3D 展示</a>
          <a style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }} className={sidebarStyles['sidebar-3d']} onClick={async () => { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); window.location.href = '/' }}>退出登录</a>
        </div>
        <div className={adminStyles.main}>{children}</div>
      </div>
      {toast && <div className={adminStyles.toast}><span>{toast}</span></div>}
    </ToastCtx.Provider>
  )
}
