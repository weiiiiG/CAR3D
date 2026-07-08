import styles from './sidebar.module.scss'

interface Props { menu: { id: string; label: string }[]; page: string; onNav: (id: string) => void; onTo3D: () => void; onLogout: () => void }

export default function Sidebar({ menu, page, onNav, onTo3D, onLogout }: Props) {
  return (
    <div className={styles.sidebar}>
      <div className={styles['sidebar-brand']}>CAR<span>3D</span></div>
      <nav className={styles['sidebar-nav']}>
        {menu.map(item => (
          <a key={item.id} className={page === item.id ? styles.active : ''} onClick={() => onNav(item.id)}>{item.label}</a>
        ))}
      </nav>
      <div style={{ flex: 1, minHeight: 4 }} />
      <a className={styles['sidebar-3d']} onClick={onTo3D} style={{ marginTop: 6 }}>返回 3D 展示</a>
      <a className={styles['sidebar-3d']} onClick={onLogout} style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', marginTop: 4 }}>退出登录</a>
    </div>
  )
}
