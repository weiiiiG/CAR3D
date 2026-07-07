import { useState, useEffect } from 'react'
import type { ViewData, OverrideData } from '../../hooks/useAdminAuth'
import { useToast } from './AdminToast'

const API = '/api'

interface ViewForm { key: string; label: string; specCategory: string; spec: string; description: string; posX: number; posY: number; posZ: number; targetX: number; targetY: number; targetZ: number }

const emptyForm = (): ViewForm => ({ key: '', label: '', specCategory: 'POWERTRAIN', spec: '', description: '', posX: 0, posY: 1.5, posZ: 5, targetX: 0, targetY: 0.6, targetZ: 0 })

export default function ViewsPage() {
  const [views, setViews] = useState<ViewData[]>([])
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})
  const [modal, setModal] = useState<{ editing?: string; form: ViewForm } | null>(null)
  const toast = useToast()

  const load = async () => {
    try {
      const [v, o] = await Promise.all([
        fetch(API + '/views').then(r => r.json()),
        fetch(API + '/overrides').then(r => r.json()),
      ])
      setViews(v); const ov: Record<string, boolean> = {}; o.forEach((x: OverrideData) => { ov[x.viewKey] = true }); setOverrides(ov)
    } catch { toast('无法连接后端服务') }
  }
  useEffect(() => { load() }, [])

  const saveEdit = async (key: string) => {
    if (!modal) return
    const { key: _, ...rest } = modal.form
    await fetch(API + '/views/' + key, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rest) })
    toast('视角已更新'); setModal(null); load()
  }

  const saveNew = async () => {
    if (!modal || !modal.form.key) { toast('请输入 Key'); return }
    await fetch(API + '/views', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(modal.form) })
    toast('视角已创建'); setModal(null); load()
  }

  const deleteView = async (key: string) => {
    if (!confirm('确定删除视角 「' + key + '」 吗？')) return
    await fetch(API + '/views/' + key, { method: 'DELETE' })
    toast('已删除'); load()
  }

  const captureFromScene = (key: string) => {
    localStorage.setItem('admin_return', window.location.href)
    window.location.href = '/?capture=' + encodeURIComponent(key)
  }

  return (
    <div className="page active">
      <h1>视角管理</h1>
      <div className="subtitle">增删改查所有视角配置</div>
      <div className="data-table-wrap">
        <div className="table-head">
          <h3>视角列表</h3>
          <button className="btn-add" onClick={() => setModal({ form: emptyForm() })}>+ 新增视角</button>
        </div>
        <table className="data-table"><thead><tr>
          <th>Key</th><th>名称</th><th>分类</th><th>规格</th><th>相机位置</th><th>覆盖</th><th style={{ width: 180 }}>操作</th>
        </tr></thead><tbody>
          {views.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--ink-soft)' }}>加载中...</td></tr>
          : views.map(v => (
            <tr key={v.key}>
              <td className="key-cell"><span className={'badge' + (overrides[v.key] ? '' : ' badge-default')}>{v.key}</span></td>
              <td style={{ color: 'var(--ink)' }}>{v.label}</td>
              <td><span className="badge">{v.specCategory || '—'}</span></td>
              <td>{v.spec || '—'}</td>
              <td>{v.posX.toFixed(1)}, {v.posY.toFixed(1)}, {v.posZ.toFixed(1)}</td>
              <td>{overrides[v.key] ? <span style={{ color: 'var(--accent)' }}>已调整</span> : <span style={{ color: 'var(--ink-soft)' }}>默认</span>}</td>
              <td>
                <button className="btn primary" onClick={() => setModal({ editing: v.key, form: { ...v, key: v.key } })}>编辑</button>
                <button className="btn danger" onClick={() => deleteView(v.key)}>删除</button>
              </td>
            </tr>
          ))}
        </tbody></table>
      </div>

      {modal && (
        <div className="modal-mask" onClick={() => setModal(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <h2>{modal.editing ? '编辑视角 · ' + modal.editing : '新增视角'}</h2>
            <div className="form-grid">
              {!modal.editing && <div className="form-group"><label>Key *</label><input value={modal.form.key} onChange={e => setModal({ ...modal, form: { ...modal.form, key: e.target.value } })} placeholder="如: rear" /></div>}
              <div className="form-group"><label>名称</label><input value={modal.form.label} onChange={e => setModal({ ...modal, form: { ...modal.form, label: e.target.value } })} /></div>
              <div className="form-group"><label>分类</label><select value={modal.form.specCategory} onChange={e => setModal({ ...modal, form: { ...modal.form, specCategory: e.target.value } })}>
                {['POWERTRAIN', 'AERODYNAMICS', 'COCKPIT', 'INTERIOR', 'DOORS', 'WHEELS'].map(c => <option key={c}>{c}</option>)}
              </select></div>
              <div className="form-group"><label>规格</label><input value={modal.form.spec} onChange={e => setModal({ ...modal, form: { ...modal.form, spec: e.target.value } })} /></div>
              <div className="form-group"><label>posX</label><input type="number" step="0.1" value={modal.form.posX} onChange={e => setModal({ ...modal, form: { ...modal.form, posX: +e.target.value } })} /></div>
              <div className="form-group"><label>posY</label><input type="number" step="0.1" value={modal.form.posY} onChange={e => setModal({ ...modal, form: { ...modal.form, posY: +e.target.value } })} /></div>
              <div className="form-group"><label>posZ</label><input type="number" step="0.1" value={modal.form.posZ} onChange={e => setModal({ ...modal, form: { ...modal.form, posZ: +e.target.value } })} /></div>
              <div className="form-group"><label>targetX</label><input type="number" step="0.1" value={modal.form.targetX} onChange={e => setModal({ ...modal, form: { ...modal.form, targetX: +e.target.value } })} /></div>
              <div className="form-group"><label>targetY</label><input type="number" step="0.1" value={modal.form.targetY} onChange={e => setModal({ ...modal, form: { ...modal.form, targetY: +e.target.value } })} /></div>
              <div className="form-group"><label>targetZ</label><input type="number" step="0.1" value={modal.form.targetZ} onChange={e => setModal({ ...modal, form: { ...modal.form, targetZ: +e.target.value } })} /></div>
              <div className="form-group full"><label>描述</label><textarea value={modal.form.description} onChange={e => setModal({ ...modal, form: { ...modal.form, description: e.target.value } })} /></div>
            </div>
            <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
              <button className="btn-add" onClick={() => captureFromScene(modal.editing || modal.form.key || 'newview')} style={{ flex: 1, textAlign: 'center' }}>从 3D 场景获取坐标</button>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setModal(null)}>取消</button>
              <button className="btn primary" onClick={modal.editing ? () => saveEdit(modal.editing!) : saveNew}>{modal.editing ? '保存修改' : '创建'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
