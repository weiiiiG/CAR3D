import { useState, useEffect } from 'react'
import type { ViewData, OverrideData } from '../../hooks/useAdminAuth'
import PageHeader from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import AdminModal from '../../components/admin/AdminModal'
import { useToast } from '../../hooks/useToast'

const API = '/api'
interface Form { key: string; label: string; specCategory: string; spec: string; description: string; posX: number; posY: number; posZ: number; targetX: number; targetY: number; targetZ: number }
const emptyForm = (): Form => ({ key: '', label: '', specCategory: 'POWERTRAIN', spec: '', description: '', posX: 0, posY: 1.5, posZ: 5, targetX: 0, targetY: 0.6, targetZ: 0 })

const cols = [
  { key: 'key', label: 'Key' }, { key: 'name', label: '名称' }, { key: 'cat', label: '分类' },
  { key: 'spec', label: '规格' }, { key: 'pos', label: '相机位置' }, { key: 'ov', label: '覆盖' }, { key: 'act', label: '操作', width: 180 },
]

export default function ViewsPage() {
  const [views, setViews] = useState<ViewData[]>([]); const [overrides, setOverrides] = useState<Record<string, boolean>>({})
  const [modal, setModal] = useState<{ editing?: string; form: Form } | null>(null)
  const toast = useToast()

  const load = async () => {
    try {
      const [v, o] = await Promise.all([fetch(API + '/views').then(r => r.json()), fetch(API + '/overrides').then(r => r.json())])
      setViews(v); const ov: Record<string, boolean> = {}; o.forEach((x: OverrideData) => { ov[x.viewKey] = true }); setOverrides(ov)
    } catch { toast('无法连接后端服务') }
  }
  useEffect(() => { load() }, [])

  const captureFromScene = (key: string) => { localStorage.setItem('admin_return', window.location.href); window.location.href = '/?capture=' + encodeURIComponent(key) }

  const set = (patch: Partial<Form>) => modal && setModal({ ...modal, form: { ...modal.form, ...patch } })

  return (
    <>
      <PageHeader title="视角管理" subtitle="增删改查所有视角配置" />
      <DataTable title="视角列表" cols={cols} addLabel="新增视角" onAdd={() => setModal({ form: emptyForm() })}>
        {views.length === 0
          ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--ink-soft)' }}>加载中...</td></tr>
          : views.map(v => (
            <tr key={v.key}>
              <td className="key-cell"><span className={'badge' + (overrides[v.key] ? '' : ' badge-default')}>{v.key}</span></td>
              <td style={{ color: 'var(--ink)' }}>{v.label}</td>
              <td><span className="badge">{v.specCategory || '—'}</span></td><td>{v.spec || '—'}</td>
              <td>{v.posX.toFixed(1) + ', ' + v.posY.toFixed(1) + ', ' + v.posZ.toFixed(1)}</td>
              <td>{overrides[v.key] ? <span style={{ color: 'var(--accent)' }}>已调整</span> : <span style={{ color: 'var(--ink-soft)' }}>默认</span>}</td>
              <td>
                <button className="btn primary" onClick={() => setModal({ editing: v.key, form: { key: v.key, label: v.label, specCategory: v.specCategory || 'POWERTRAIN', spec: v.spec || '', description: v.description || '', posX: v.posX, posY: v.posY, posZ: v.posZ, targetX: v.targetX, targetY: v.targetY, targetZ: v.targetZ } })}>编辑</button>
                <button className="btn danger" onClick={async () => { if (!confirm('确定删除？')) return; await fetch(API + '/views/' + v.key, { method: 'DELETE' }); toast('已删除'); load() }}>删除</button>
              </td>
            </tr>
          ))}
      </DataTable>

      {modal && (
        <AdminModal onClose={() => setModal(null)}>
          <h2>{modal.editing ? '编辑视角 · ' + modal.editing : '新增视角'}</h2>
          <div className="form-grid">
            {!modal.editing && <div className="form-group"><label>Key *</label><input value={modal.form.key} onChange={e => set({ key: e.target.value })} placeholder="如: rear" /></div>}
            <div className="form-group"><label>名称</label><input value={modal.form.label} onChange={e => set({ label: e.target.value })} /></div>
            <div className="form-group"><label>分类</label><select value={modal.form.specCategory} onChange={e => set({ specCategory: e.target.value })}>{['POWERTRAIN', 'AERODYNAMICS', 'COCKPIT', 'INTERIOR', 'DOORS', 'WHEELS'].map(c => <option key={c}>{c}</option>)}</select></div>
            <div className="form-group"><label>规格</label><input value={modal.form.spec} onChange={e => set({ spec: e.target.value })} /></div>
            <div className="form-group"><label>posX</label><input type="number" step="0.1" value={modal.form.posX} onChange={e => set({ posX: +e.target.value })} /></div>
            <div className="form-group"><label>posY</label><input type="number" step="0.1" value={modal.form.posY} onChange={e => set({ posY: +e.target.value })} /></div>
            <div className="form-group"><label>posZ</label><input type="number" step="0.1" value={modal.form.posZ} onChange={e => set({ posZ: +e.target.value })} /></div>
            <div className="form-group"><label>targetX</label><input type="number" step="0.1" value={modal.form.targetX} onChange={e => set({ targetX: +e.target.value })} /></div>
            <div className="form-group"><label>targetY</label><input type="number" step="0.1" value={modal.form.targetY} onChange={e => set({ targetY: +e.target.value })} /></div>
            <div className="form-group"><label>targetZ</label><input type="number" step="0.1" value={modal.form.targetZ} onChange={e => set({ targetZ: +e.target.value })} /></div>
            <div className="form-group full"><label>描述</label><textarea value={modal.form.description} onChange={e => set({ description: e.target.value })} /></div>
          </div>
          <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
            <button className="btn-add" onClick={() => captureFromScene(modal.editing || modal.form.key || 'newview')} style={{ flex: 1, textAlign: 'center' }}>从 3D 场景获取坐标</button>
          </div>
          <div className="modal-actions">
            <button className="btn" onClick={() => setModal(null)}>取消</button>
            <button className="btn primary" onClick={async () => {
              if (!modal.editing && !modal.form.key) { toast('请输入 Key'); return }
              const body = { label: modal.form.label, description: modal.form.description, spec: modal.form.spec, specCategory: modal.form.specCategory, posX: modal.form.posX, posY: modal.form.posY, posZ: modal.form.posZ, targetX: modal.form.targetX, targetY: modal.form.targetY, targetZ: modal.form.targetZ }
              if (modal.editing) await fetch(API + '/views/' + modal.editing, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
              else await fetch(API + '/views', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, key: modal.form.key }) })
              toast(modal.editing ? '视角已更新' : '视角已创建'); setModal(null); load()
            }}>{modal.editing ? '保存修改' : '创建'}</button>
          </div>
        </AdminModal>
      )}
    </>
  )
}
