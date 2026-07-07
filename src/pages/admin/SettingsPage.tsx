import PageHeader from '../../components/admin/PageHeader'
import SettingsGroup from '../../components/admin/SettingsGroup'
import { useToast } from './AdminLayout'

const API = '/api'

export default function SettingsPage() {
  const toast = useToast()
  return (
    <>
      <PageHeader title="设置" subtitle="系统配置与管理" />
      <SettingsGroup title="数据库连接">
        <div className="setting-row"><span className="setting-label">地址</span><span className="setting-value">localhost:5432/car3d_admin</span></div>
        <div className="setting-row"><span className="setting-label">表</span><span className="setting-value">views, view_overrides, mock_vehicles</span></div>
        <div className="setting-row"><span className="setting-label">状态</span><span className="setting-value" style={{ color: '#22C55E' }}>已连接</span></div>
      </SettingsGroup>
      <SettingsGroup title="数据操作">
        <div className="setting-row"><span className="setting-label">重新导入初始数据</span>
          <button style={{ padding: '6px 14px', borderRadius: 4, border: 'none', background: 'var(--accent)', color: 'var(--bg)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
            onClick={async () => { if (!confirm('将清空所有数据并重新导入初始数据，确定吗？')) return; try { await fetch(API + '/seed', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' } }); toast('数据已重置') } catch { toast('重置失败') } }}>执行</button>
        </div>
        <div className="setting-row"><span className="setting-label">API 地址</span><span className="setting-value" style={{ fontFamily: 'monospace', fontSize: 11 }}>http://localhost:3000/api</span></div>
      </SettingsGroup>
      <SettingsGroup title="关于">
        <div className="setting-row"><span className="setting-label">版本</span><span className="setting-value">v1.0.0</span></div>
        <div className="setting-row"><span className="setting-label">技术栈</span><span className="setting-value">React + Three.js + GSAP + NestJS + Prisma + PostgreSQL</span></div>
      </SettingsGroup>
    </>
  )
}
