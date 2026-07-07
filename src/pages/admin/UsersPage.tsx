import { useState, useEffect } from 'react'
import { useToast } from './AdminToast'

const API = '/api'

interface User { id: number; username: string; role: string; createdAt: string }

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [modal, setModal] = useState(false)
  const toast = useToast()

  const load = async () => {
    try {
      const r = await fetch(API + '/users', { credentials: 'include' })
      if (r.status === 401) return
      setUsers(await r.json())
    } catch { toast('加载失败') }
  }
  useEffect(() => { load() }, [])

  const update = async (id: number) => {
    const name = (document.getElementById('uname_' + id) as HTMLInputElement)?.value
    const role = (document.getElementById('urole_' + id) as HTMLSelectElement)?.value
    await fetch(API + '/users/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: name, role }) })
    toast('已更新'); load()
  }
  const del = async (id: number) => {
    if (!confirm('确定删除此用户吗？')) return
    await fetch(API + '/users/' + id, { method: 'DELETE' }); toast('已删除'); load()
  }
  const create = async () => {
    const name = (document.getElementById('nuName') as HTMLInputElement)?.value
    const pass = (document.getElementById('nuPass') as HTMLInputElement)?.value
    const role = (document.getElementById('nuRole') as HTMLSelectElement)?.value
    if (!name || !pass) { toast('请填写用户名和密码'); return }
    await fetch(API + '/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: name, password: pass, role }) })
    toast('用户已创建'); setModal(false); load()
  }

  return (
    <div className="page active">
      <h1>用户管理</h1>
      <div className="subtitle">添加和管理管理员账户</div>
      <div className="data-table-wrap">
        <div className="table-head"><h3>用户列表</h3><button className="btn-add" onClick={() => setModal(true)}>+ 新增用户</button></div>
        <table className="data-table"><thead><tr>
          <th>ID</th><th>用户名</th><th>角色</th><th>创建时间</th><th style={{ width: 100 }}>操作</th>
        </tr></thead><tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td className="key-cell">{u.id}</td>
              <td style={{ color: 'var(--ink)', fontWeight: 600 }}><input id={'uname_' + u.id} defaultValue={u.username} style={{ background: 'var(--bg)', border: '1px solid var(--rule)', borderRadius: 3, padding: '3px 6px', fontSize: 12, color: 'var(--ink)', width: 120 }} /></td>
              <td><select id={'urole_' + u.id} defaultValue={u.role} style={{ background: 'var(--bg)', border: '1px solid var(--rule)', borderRadius: 3, padding: '3px 4px', fontSize: 11, color: 'var(--ink)' }}>
                <option value="super_admin">超级管理员</option><option value="admin">管理员</option><option value="user">普通用户</option>
              </select></td>
              <td>{u.createdAt}</td>
              <td>
                <button className="btn primary" onClick={() => update(u.id)} style={{ fontSize: 10, padding: '2px 8px' }}>保存</button>
                {u.username !== 'admin' && <button className="btn danger" onClick={() => del(u.id)} style={{ fontSize: 10, padding: '2px 8px' }}>删除</button>}
              </td>
            </tr>
          ))}
        </tbody></table>
      </div>
      {modal && (
        <div className="modal-mask" onClick={() => setModal(false)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <h2>新增用户</h2>
            <div className="form-grid">
              <div className="form-group full"><label>用户名</label><input id="nuName" placeholder="用户名" /></div>
              <div className="form-group full"><label>密码</label><input id="nuPass" type="password" placeholder="初始密码" /></div>
              <div className="form-group full"><label>角色</label><select id="nuRole"><option value="user">普通用户</option><option value="admin">管理员</option><option value="super_admin">超级管理员</option></select></div>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setModal(false)}>取消</button>
              <button className="btn primary" onClick={create}>创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
