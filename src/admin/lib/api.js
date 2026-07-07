// API 配置与认证模块
// 所有函数通过 window 共享以兼容 HTML onclick 调用

window.API = '/api'
window.adminToken = ''
window.viewsData = []
window.overridesData = []
window.mockData = []
window.usersData = []
var refreshPromise = null

window.aH = function () { return window.adminToken ? { 'Authorization': 'Bearer ' + window.adminToken } : {} }

window.authHeader = function () { var h = window.aH(); h['Content-Type'] = 'application/json'; return h }

window.toast = function (msg) {
  var t = document.getElementById('toastBox')
  t.innerHTML = '<div class="toast"><span>' + msg + '</span><button class="close" onclick="this.parentElement.remove()">×</button></div>'
  setTimeout(function () { var d = t.querySelector('.toast'); if (d) d.remove() }, 3000)
}

window.fetchAuth = function (url, opt) {
  opt = opt || {}; opt.headers = opt.headers || {}; opt.credentials = 'include'
  var ah = window.aH(); for (var k in ah) opt.headers[k] = ah[k]
  if (!opt.headers['Content-Type']) opt.headers['Content-Type'] = 'application/json'
  return fetch(url, opt).then(function (r) {
    if (r.status !== 401 || !window.adminToken) return r
    if (!refreshPromise) refreshPromise = fetch(window.API + '/auth/refresh', { method: 'POST', credentials: 'include' })
      .then(function (r2) { if (!r2.ok) { window.adminToken = ''; refreshPromise = null; return null } return r2.json() })
      .then(function (d2) { if (d2) { window.adminToken = d2.access_token } refreshPromise = null; return d2 })
    return refreshPromise.then(function (d2) {
      if (!d2) { window.showLogin(); return Promise.reject('Session expired') }
      ah = window.aH(); for (var k2 in ah) opt.headers[k2] = ah[k2]
      return fetch(url, opt)
    })
  })
}
