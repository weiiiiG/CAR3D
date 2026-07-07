import { ReactNode } from 'react'
import './sidebar.css'

interface Props { username: string; role: string; menu: { id: string; label: string }[]; page: string; onNav: (id: string) => void; onTo3D: () => void; onLogout: () => void }

export default function Sidebar({ username, role, menu, page, onNav, onTo3D, onLogout }: Props) {
  return (
    <div className="sidebar">
      <div className="sidebar-brand">CAR<span>3D</span></div>
      <nav className="sidebar-nav">
        {menu.map(item => (
          <a key={item.id} className={page === item.id ? 'active' : ''} onClick={() => onNav(item.id)}>{item.label}</a>
        ))}
      </nav>
      <div style={{ flex: 1, minHeight: 4 }} />
      <div className="sidebar-status">
        <span className="dot" />
        <span>{username}</span>
        <span style={{ marginLeft: 'auto', fontSize: 10 }}>{role}</span>
      </div>
      <a className="sidebar-3d" onClick={onTo3D} style={{ marginTop: 6 }}>返回 3D 展示</a>
      <a className="sidebar-3d" onClick={onLogout} style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', marginTop: 4 }}>退出登录</a>
    </div>
  )
}
