import { useState } from 'react'

interface Props { onLogin: (user: string, pass: string) => Promise<any> }

export default function LoginPage({ onLogin }: Props) {
  const [user, setUser] = useState('admin')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const doLogin = async () => {
    setBusy(true); setErr('')
    try {
      await onLogin(user, pass)
    } catch (e: any) {
      setErr(e.message || '登录失败')
    } finally { setBusy(false) }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: 360, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: 32, letterSpacing: '.06em', color: 'var(--ink)', marginBottom: 4 }}>CAR<span style={{ color: 'var(--accent)' }}>3D</span></div>
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginBottom: 20 }}>管理后台</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
          <input className="mgmt-input" placeholder="用户名" value={user} onChange={e => setUser(e.target.value)} onKeyDown={e => e.key === 'Enter' && document.getElementById('ap')?.focus()} style={{ width: '100%' }} />
          <input id="ap" className="mgmt-input" type="password" placeholder="密码" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && doLogin()} style={{ width: '100%' }} />
          {err && <div style={{ fontSize: 11, color: '#EF4444', textAlign: 'center' }}>{err}</div>}
          <button className="mgmt-save-btn" disabled={busy} style={{ width: '100%', padding: '10px 0', fontSize: 13, opacity: busy ? 0.5 : 1 }} onClick={doLogin}>{busy ? '登录中...' : '登录'}</button>
        </div>
      </div>
    </div>
  )
}
