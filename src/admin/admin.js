// Admin 入口 — 页面切换、侧边栏、认证 UI、启动
// 按依赖顺序引入（side-effect imports，各模块在 window 上注册自己）
import './lib/api.js'
import './lib/charts.js'
import './lib/crud.js'

// ─── Auth UI ───
window.currentUser = null
var ROLE_MENU = {
  super_admin: [{ id: 'dashboard', label: '仪表盘' }, { id: 'views', label: '视角管理' }, { id: 'data', label: '数据概览' }, { id: 'users', label: '用户管理' }, { id: 'settings', label: '设置' }],
  admin: [{ id: 'dashboard', label: '仪表盘' }, { id: 'views', label: '视角管理' }, { id: 'data', label: '数据概览' }, { id: 'settings', label: '设置' }],
  user: [{ id: 'dashboard', label: '仪表盘' }, { id: 'data', label: '数据概览' }],
}

window.buildSidebar = function (user) {
  window.currentUser = user
  var menu = ROLE_MENU[user.role] || ROLE_MENU.user
  var nav = document.getElementById('sidebarNav'); nav.innerHTML = ''
  menu.forEach(function (item, i) {
    var a = document.createElement('a')
    a.onclick = function () { window.switchPage(item.id) }; a.setAttribute('data-page', item.id)
    if (i === 0) a.className = 'active'; a.textContent = item.label; nav.appendChild(a)
  })
  document.getElementById('userLabel').textContent = user.username
  document.getElementById('roleLabel').textContent = user.role === 'super_admin' ? '超级管理员' : user.role === 'admin' ? '管理员' : '普通用户'
  document.getElementById('page-login').style.display = 'none'
  document.querySelector('.sidebar').style.display = 'flex'
  document.querySelector('.main').style.display = 'block'
  window.switchPage('dashboard')
}

window.showLogin = function () {
  document.getElementById('page-login').style.display = 'flex'
  document.querySelector('.sidebar').style.display = 'none'
  document.querySelector('.main').style.display = 'block'
  document.querySelectorAll('.page').forEach(function (p) { if (p.id !== 'page-login') p.style.display = 'none' })
}

window.doLogin = function () {
  var u = document.getElementById('loginUser').value; var p = document.getElementById('loginPass').value; var err = document.getElementById('loginError')
  fetch(window.API + '/auth/login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) })
    .then(function (r) {
      if (r.status === 401) { err.style.display = 'block'; err.textContent = '用户名或密码错误'; return }
      if (!r.ok) { err.style.display = 'block'; err.textContent = '服务器错误 (' + r.status + ')'; return }
      return r.json()
    }).then(function (d) {
      if (!d) return; window.adminToken = d.access_token; err.style.display = 'none'
      fetch(window.API + '/auth/me', { credentials: 'include', headers: { 'Authorization': 'Bearer ' + window.adminToken } })
        .then(function (r) { return r.json() })
        .then(function (u2) { window.buildSidebar(u2); window.loadData() })
    }).catch(function () { err.style.display = 'block'; err.textContent = '无法连接后端服务，请确认后端已启动' })
}

window.logout = function () {
  fetch(window.API + '/auth/logout', { method: 'POST', credentials: 'include' }).catch(function () { })
  window.adminToken = ''; window.currentUser = null
  document.getElementById('loginUser').value = 'admin'; document.getElementById('loginPass').value = ''; window.showLogin()
}

// ─── Page switching ───
window.switchPage = function (name) {
  document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); p.style.display = p.id === 'page-' + name ? 'block' : 'none' })
  document.querySelectorAll('[data-page]').forEach(function (a) { a.classList.remove('active') })
  document.querySelector('[data-page="' + name + '"]').classList.add('active')
  if (name === 'dashboard') { window.dashCharts.forEach(function (c) { try { c.dispose() } catch (e) { } }); window.initCharts() }
  if (name === 'data') window.initMockCharts()
  if (name === 'users') window.loadUsers()
}

// ─── Capture from 3D scene ───
window.captureFromScene = function (key) {
  var returnUrl = window.location.href
  localStorage.setItem('admin_return', returnUrl)
  window.location.href = '/?capture=' + encodeURIComponent(key)
  window.toast('请在 3D 场景中调整视角后点击「确认保存」')
}

// ─── Boot ───
window.onload = function () {
  window.initCharts()
  fetch(window.API + '/auth/refresh', { method: 'POST', credentials: 'include' }).then(function (r) {
    if (!r.ok) { window.showLogin(); return }
    return r.json()
  }).then(function (d) {
    if (!d) { window.showLogin(); return }
    window.adminToken = d.access_token
    fetch(window.API + '/auth/me', { credentials: 'include', headers: { 'Authorization': 'Bearer ' + window.adminToken } })
      .then(function (r) { return r.json() }).then(function (u) { window.buildSidebar(u); window.loadData() })
  }).catch(function () { window.showLogin() })
}
