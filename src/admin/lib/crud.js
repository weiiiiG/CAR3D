// CRUD 模块 — 视角 + 用户增删改查
// 依赖: api.js (window.API, window.fetchAuth, window.toast)

function g(id) { return document.getElementById(id).value }
function pf(id) { return parseFloat(document.getElementById(id).value) }

window.closeModal = function () { document.getElementById('modalBox').style.display = 'none' }

window.renderViewsTable = function () {
  var overridden = {}; window.overridesData.forEach(function (o) { overridden[o.viewKey] = true })
  var h = document.getElementById('viewsBody')
  if (!window.viewsData.length) { h.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--ink-soft)">加载中...</td></tr>'; return }
  h.innerHTML = window.viewsData.map(function (v) {
    var hasOv = overridden[v.key] || false
    return '<tr><td class="key-cell"><span class="badge ' + (hasOv ? '' : 'badge-default') + '">' + v.key + '</span></td>' +
      '<td style="color:var(--ink)">' + v.label + '</td>' +
      '<td><span class="badge">' + (v.specCategory || '—') + '</span></td>' +
      '<td>' + (v.spec || '—') + '</td>' +
      '<td>' + v.posX.toFixed(1) + ', ' + v.posY.toFixed(1) + ', ' + v.posZ.toFixed(1) + '</td>' +
      '<td>' + (hasOv ? '<span style="color:var(--accent)">已调整</span>' : '<span style="color:var(--ink-soft)">默认</span>') + '</td>' +
      '<td><button class="btn primary" onclick="openEdit(\'' + v.key + '\')">编辑</button>' +
      ' <button class="btn danger" onclick="deleteView(\'' + v.key + '\')">删除</button></td></tr>'
  }).join('')
}

window.openEdit = function (key) {
  var v = window.viewsData.find(function (x) { return x.key === key }); if (!v) return
  var m = document.getElementById('modalBox'); m.style.display = 'block'
  m.innerHTML = '<div class="modal-mask" onclick="closeModal()"><div class="modal-panel" onclick="event.stopPropagation()">' +
    '<h2>编辑视角 · ' + v.key + '</h2><div class="form-grid">' +
    '<div class="form-group"><label>Key</label><input id="ek" value="' + v.key + '" readonly style="opacity:.5"/></div>' +
    '<div class="form-group"><label>名称</label><input id="el" value="' + v.label + '"/></div>' +
    '<div class="form-group"><label>分类</label><select id="ec">' +
    '<option' + (v.specCategory === 'POWERTRAIN' ? ' selected' : '') + '>POWERTRAIN</option>' +
    '<option' + (v.specCategory === 'AERODYNAMICS' ? ' selected' : '') + '>AERODYNAMICS</option>' +
    '<option' + (v.specCategory === 'COCKPIT' ? ' selected' : '') + '>COCKPIT</option>' +
    '<option' + (v.specCategory === 'INTERIOR' ? ' selected' : '') + '>INTERIOR</option>' +
    '<option' + (v.specCategory === 'DOORS' ? ' selected' : '') + '>DOORS</option>' +
    '<option' + (v.specCategory === 'WHEELS' ? ' selected' : '') + '>WHEELS</option>' +
    '</select></div>' +
    '<div class="form-group"><label>规格</label><input id="es" value="' + (v.spec || '') + '"/></div>' +
    '<div class="form-group"><label>posX</label><input id="epx" value="' + v.posX + '"/></div>' +
    '<div class="form-group"><label>posY</label><input id="epy" value="' + v.posY + '"/></div>' +
    '<div class="form-group"><label>posZ</label><input id="epz" value="' + v.posZ + '"/></div>' +
    '<div class="form-group"><label>targetX</label><input id="etx" value="' + v.targetX + '"/></div>' +
    '<div class="form-group"><label>targetY</label><input id="ety" value="' + v.targetY + '"/></div>' +
    '<div class="form-group"><label>targetZ</label><input id="etz" value="' + v.targetZ + '"/></div>' +
    '<div class="form-group full"><label>描述</label><textarea id="ed">' + (v.description || '') + '</textarea></div>' +
    '</div><div style="margin-bottom:12px;display:flex;gap:8px">' +
    '<button class="btn-add" onclick="captureFromScene(\'' + v.key + '\')" style="flex:1;text-align:center">从 3D 场景获取坐标</button></div>' +
    '<div class="modal-actions">' +
    '<button class="btn" onclick="closeModal()">取消</button>' +
    '<button class="btn primary" onclick="saveEdit(\'' + v.key + '\')">保存修改</button></div></div></div>'
}

window.openAdd = function () {
  var m = document.getElementById('modalBox'); m.style.display = 'block'
  m.innerHTML = '<div class="modal-mask" onclick="closeModal()"><div class="modal-panel" onclick="event.stopPropagation()">' +
    '<h2>新增视角</h2><div class="form-grid">' +
    '<div class="form-group"><label>Key *</label><input id="ek" placeholder="如: rear"/></div>' +
    '<div class="form-group"><label>名称 *</label><input id="el" placeholder="如: 尾部"/></div>' +
    '<div class="form-group"><label>分类</label><select id="ec"><option>POWERTRAIN</option><option>AERODYNAMICS</option><option>COCKPIT</option><option>INTERIOR</option><option>DOORS</option><option>WHEELS</option></select></div>' +
    '<div class="form-group"><label>规格</label><input id="es" placeholder="如: 1,244 hp"/></div>' +
    '<div class="form-group"><label>posX</label><input id="epx" value="0" placeholder="从场景获取"/></div>' +
    '<div class="form-group"><label>posY</label><input id="epy" value="1.5"/></div>' +
    '<div class="form-group"><label>posZ</label><input id="epz" value="5"/></div>' +
    '<div class="form-group"><label>targetX</label><input id="etx" value="0"/></div>' +
    '<div class="form-group"><label>targetY</label><input id="ety" value="0.6"/></div>' +
    '<div class="form-group"><label>targetZ</label><input id="etz" value="0"/></div>' +
    '<div class="form-group full"><label>描述</label><textarea id="ed"></textarea></div>' +
    '</div><div style="margin-bottom:12px;display:flex;gap:8px">' +
    '<button class="btn-add" onclick="captureFromScene(document.getElementById(\'ek\').value||\'newview\')" style="flex:1;text-align:center">从 3D 场景获取坐标</button></div>' +
    '<div class="modal-actions">' +
    '<button class="btn" onclick="closeModal()">取消</button>' +
    '<button class="btn primary" onclick="saveNew()">创建</button></div></div></div>'
}

window.saveEdit = function (key) {
  var b = { label: g('el'), description: g('ed'), spec: g('es'), specCategory: g('ec'),
    posX: pf('epx'), posY: pf('epy'), posZ: pf('epz'), targetX: pf('etx'), targetY: pf('ety'), targetZ: pf('etz') }
  fetch(window.API + '/views/' + key, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
    .then(function () { window.closeModal(); window.toast('视角已更新'); window.loadData() }).catch(function () { window.toast('保存失败') })
}

window.saveNew = function () {
  var key = g('ek'); if (!key) { window.toast('请输入 Key'); return }
  var b = { key: key, label: g('el'), description: g('ed'), spec: g('es'), specCategory: g('ec'),
    posX: pf('epx'), posY: pf('epy'), posZ: pf('epz'), targetX: pf('etx'), targetY: pf('ety'), targetZ: pf('etz') }
  fetch(window.API + '/views', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
    .then(function () { window.closeModal(); window.toast('视角已创建'); window.loadData() }).catch(function () { window.toast('创建失败') })
}

window.deleteView = function (key) {
  if (!confirm('确定删除视角 「' + key + '」 吗？')) return
  fetch(window.API + '/views/' + key, { method: 'DELETE' })
    .then(function () { window.toast('已删除'); window.loadData() }).catch(function () { window.toast('删除失败') })
}

window.reSeed = function () {
  if (!confirm('将清空所有数据并重新导入初始数据，确定吗？')) return
  fetch(window.API + '/seed', { method: 'POST', credentials: 'include', headers: window.authHeader() })
    .then(function () { window.toast('数据已重置'); window.loadData() }).catch(function () { window.toast('重置失败') })
}

window.renderMockTable = function () {
  var h = document.getElementById('mockBody')
  if (!window.mockData.length) { h.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--ink-soft)">加载中...</td></tr>'; return }
  var sorted = window.mockData.slice().sort(function (a, b) { return b.hp - a.hp })
  h.innerHTML = sorted.map(function (d) {
    return '<tr><td style="font-weight:600;color:var(--ink)">' + d.name + '</td><td>' + d.hp + '</td><td>' + d.torque + '</td><td>' + d.acceleration + 's</td><td>' + d.topSpeed + '</td><td>' + d.weight + 'kg</td><td>' + d.engine + '</td><td>' + d.year + '</td></tr>'
  }).join('')
  document.getElementById('sMock').textContent = window.mockData.length
}

// ─── Users CRUD ───
window.renderUsersTable = function () {
  var h = document.getElementById('usersBody')
  if (!window.usersData.length) { h.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--ink-soft)">加载中...</td></tr>'; return }
  h.innerHTML = window.usersData.map(function (u) {
    return '<tr><td class="key-cell">' + u.id + '</td>' +
      '<td style="color:var(--ink);font-weight:600">' + (window.currentUser && window.currentUser.role === 'super_admin'
        ? '<input id="uname_' + u.id + '" value="' + u.username + '" style="background:var(--bg);border:1px solid var(--rule);border-radius:3px;padding:3px 6px;font-size:12px;color:var(--ink);width:120px"/>'
        : u.username) + '</td>' +
      '<td>' + (window.currentUser && window.currentUser.role === 'super_admin'
        ? '<select id="urole_' + u.id + '" style="background:var(--bg);border:1px solid var(--rule);border-radius:3px;padding:3px 4px;font-size:11px;color:var(--ink)">' +
        '<option value="super_admin" ' + (u.role === 'super_admin' ? 'selected' : '') + '>超级管理员</option>' +
        '<option value="admin" ' + (u.role === 'admin' ? 'selected' : '') + '>管理员</option>' +
        '<option value="user" ' + (u.role === 'user' ? 'selected' : '') + '>普通用户</option></select>'
        : (u.role === 'super_admin' ? '超级管理员' : u.role === 'admin' ? '管理员' : '普通用户')) + '</td>' +
      '<td>' + u.createdAt + '</td>' +
      '<td>' + (window.currentUser && window.currentUser.role === 'super_admin'
        ? '<button class="btn primary" onclick="updateUser(' + u.id + ')" style="font-size:10px;padding:2px 8px">保存</button> ' +
        (u.username !== 'admin' ? '<button class="btn danger" onclick="deleteUser(' + u.id + ')" style="font-size:10px;padding:2px 8px">删除</button>' : '')
        : (u.username !== 'admin' ? '<button class="btn danger" onclick="deleteUser(' + u.id + ')" style="font-size:10px;padding:2px 8px">删除</button>' : '<span style="color:var(--ink-soft);font-size:11px">—</span>')) + '</td></tr>'
  }).join('')
}

window.loadUsers = function () {
  window.fetchAuth(window.API + '/users').then(function (r) {
    if (r.status === 401) { document.getElementById('usersBody').innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--ink-soft)">无权限</td></tr>'; return }
    return r.json()
  }).then(function (d) { if (d) { window.usersData = d; window.renderUsersTable() } }).catch(function () { })
}

window.openAddUser = function () {
  var m = document.getElementById('modalBox'); m.style.display = 'block'
  m.innerHTML = '<div class="modal-mask" onclick="closeModal()"><div class="modal-panel" onclick="event.stopPropagation()">' +
    '<h2>新增用户</h2><div class="form-grid">' +
    '<div class="form-group full"><label>用户名</label><input id="nuName" placeholder="用户名"/></div>' +
    '<div class="form-group full"><label>密码</label><input id="nuPass" type="password" placeholder="初始密码"/></div>' +
    '<div class="form-group full"><label>角色</label><select id="nuRole"><option value="user">普通用户</option><option value="admin">管理员</option><option value="super_admin">超级管理员</option></select></div>' +
    '</div><div class="modal-actions">' +
    '<button class="btn" onclick="closeModal()">取消</button>' +
    '<button class="btn primary" onclick="saveUser()">创建</button></div></div></div>'
}

window.saveUser = function () {
  var name = document.getElementById('nuName').value; var pass = document.getElementById('nuPass').value; var role = document.getElementById('nuRole').value
  if (!name || !pass) { window.toast('请填写用户名和密码'); return }
  window.fetchAuth(window.API + '/users', { method: 'POST', body: JSON.stringify({ username: name, password: pass, role: role }) })
    .then(function (r) { if (!r.ok) return r.json().then(function (e) { throw new Error(e.message) }); window.closeModal(); window.toast('用户已创建'); window.loadUsers() })
    .catch(function (e) { window.toast(e.message || '创建失败') })
}

window.updateUser = function (id) {
  var name = document.getElementById('uname_' + id).value; var role = document.getElementById('urole_' + id).value
  window.fetchAuth(window.API + '/users/' + id, { method: 'PATCH', body: JSON.stringify({ username: name, role: role }) })
    .then(function () { window.toast('已更新'); window.loadUsers() }).catch(function () { window.toast('更新失败') })
}

window.deleteUser = function (id) {
  if (!confirm('确定删除此用户吗？')) return
  window.fetchAuth(window.API + '/users/' + id, { method: 'DELETE' })
    .then(function () { window.toast('已删除'); window.loadUsers() }).catch(function () { window.toast('删除失败') })
}

window.loadData = function () {
  Promise.all([
    fetch(window.API + '/views').then(function (r) { return r.json() }).then(function (d) { window.viewsData = d }),
    fetch(window.API + '/overrides').then(function (r) { return r.json() }).then(function (d) { window.overridesData = d }),
    fetch(window.API + '/mock-vehicles').then(function (r) { return r.json() }).then(function (d) { window.mockData = d })
  ]).then(function () {
    document.getElementById('sViews').textContent = window.viewsData.length
    document.getElementById('sOverrides').textContent = window.overridesData.length
    document.getElementById('sActive').textContent = window.viewsData.filter(function (v) { return v.isActive }).length
    window.renderViewsTable(); window.renderMockTable(); window.initMockCharts()
  }).catch(function () {
    document.getElementById('viewsBody').innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--ink-soft)">无法连接后端服务</td></tr>'
  })
}
