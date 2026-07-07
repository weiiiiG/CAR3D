import { useToast } from './AdminToast'

const API = '/api'

export default function SettingsPage() {
  const toast = useToast()
  const reSeed = async () => {
    if (!confirm('将清空所有数据并重新导入初始数据，确定吗？')) return
    try {
      await fetch(API + '/seed', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
      toast('数据已重置')
    } catch { toast('重置失败') }
  }

  return (
    <div className="page active">
      <h1>设置</h1><div className="subtitle">系统配置与管理</div>
      <div className="settings-group">
        <h3>数据库连接</h3>
        <div className="setting-row"><span className="setting-label">地址</span><span className="setting-value">localhost:5432/car3d_admin</span></div>
        <div className="setting-row"><span className="setting-label">表</span><span className="setting-value">views, view_overrides, mock_vehicles</span></div>
        <div className="setting-row"><span className="setting-label">状态</span><span className="setting-value" style={{ color: '#22C55E' }}>已连接</span></div>
      </div>
      <div className="settings-group">
        <h3>数据操作</h3>
        <div className="setting-row">
          <span className="setting-label">重新导入初始数据</span>
          <button style={{ padding: '6px 14px', borderRadius: 4, border: 'none', background: 'var(--accent)', color: 'var(--bg)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }} onClick={reSeed}>执行</button>
        </div>
        <div className="setting-row"><span className="setting-label">API 地址</span><span className="setting-value" style={{ fontFamily: 'monospace', fontSize: 11 }}>http://localhost:3000/api</span></div>
      </div>
      <div className="settings-group">
        <h3>关于</h3>
        <div className="setting-row"><span className="setting-label">版本</span><span className="setting-value">v1.0.0</span></div>
        <div className="setting-row"><span className="setting-label">技术栈</span><span className="setting-value">React + Three.js + GSAP + NestJS + Prisma + PostgreSQL</span></div>
      </div>
    </div>
  )
}
