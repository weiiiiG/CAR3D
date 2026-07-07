import { useState, useEffect } from 'react'
import PageHeader from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import AdminModal from '../../components/admin/AdminModal'
import { useToast } from './AdminLayout'

const API = '/api'
const cols = [{ key: 'id', label: 'ID' }, { key: 'name', label: '用户名' }, { key: 'role', label: '角色' }, { key: 'time', label: '创建时间' }, { key: 'act', label: '操作', width: 100 }]

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]); const [modal, setModal] = useState(false)
  const toast = useToast()
  const load = async () => { try { const r = await fetch(API + '/users', { credentials: 'include' }); if (r.status !== 401) setUsers(await r.json()) } catch { toast('加载失败') } }
  useEffect(() => { load() }, [])

  return (
    <div className="page active" style={{ animation: 'none' }}>
      <PageHeader title="用户管理" subtitle="添加和管理管理员账户" />
      <DataTable title="用户列表" cols={cols} addLabel="新增用户" onAdd={() => setModal(true)}>
        {users.map(u => (
          <tr key={u.id}>
            <td className="key-cell">{u.id}</td>
            <td style={{ color: 'var(--ink)', fontWeight: 600 }}><input id={'uname_' + u.id} defaultValue={u.username} style={{ background: 'var(--bg)', border: '1px solid var(--rule)', borderRadius: 3, padding: '3px 6px', fontSize: 12, color: 'var(--ink)', width: 120 }} /></td>
            <td><select id={'urole_' + u.id} defaultValue={u.role} style={{ background: 'var(--bg)', border: '1px solid var(--rule)', borderRadius: 3, padding: '3px 4px', fontSize: 11, color: 'var(--ink)' }}><option value="super_admin">超级管理员</option><option value="admin">管理员</option><option value="user">普通用户</option></select></td>
            <td>{u.createdAt}</td>
            <td>
              <button className="btn primary" onClick={async () => { const n = (document.getElementById('uname_' + u.id) as HTMLInputElement).value; const r = (document.getElementById('urole_' + u.id) as HTMLSelectElement).value; await fetch(API + '/users/' + u.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: n, role: r }) }); toast('已更新'); load() }} style={{ fontSize: 10, padding: '2px 8px' }}>保存</button>
              {u.username !== 'admin' && <button className="btn danger" onClick={async () => { if (!confirm('确定删除？')) return; await fetch(API + '/users/' + u.id, { method: 'DELETE' }); toast('已删除'); load() }} style={{ fontSize: 10, padding: '2px 8px' }}>删除</button>}
            </td>
          </tr>
        ))}
      </DataTable>
      {modal && (
        <AdminModal onClose={() => setModal(false)}>
          <h2>新增用户</h2>
          <div className="form-grid">
            <div className="form-group full"><label>用户名</label><input id="nuName" placeholder="用户名" /></div>
            <div className="form-group full"><label>密码</label><input id="nuPass" type="password" placeholder="初始密码" /></div>
            <div className="form-group full"><label>角色</label><select id="nuRole"><option value="user">普通用户</option><option value="admin">管理员</option><option value="super_admin">超级管理员</option></select></div>
          </div>
          <div className="modal-actions">
            <button className="btn" onClick={() => setModal(false)}>取消</button>
            <button className="btn primary" onClick={async () => { const n = (document.getElementById('nuName') as HTMLInputElement).value; const p = (document.getElementById('nuPass') as HTMLInputElement).value; const r = (document.getElementById('nuRole') as HTMLSelectElement).value; if (!n || !p) { toast('请填写用户名和密码'); return } await fetch(API + '/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: n, password: p, role: r }) }); toast('用户已创建'); setModal(false); load() }}>创建</button>
          </div>
        </AdminModal>
      )}
    </div>
  )
}
