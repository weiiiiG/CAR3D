interface LoginModalProps{
  open:boolean
  loginErr:string
  onClose:()=>void
  onSuccess:()=>void
  onLoginError:(msg:string)=>void
}

export default function LoginModal({open,loginErr,onClose,onSuccess,onLoginError}:LoginModalProps){
  if(!open)return null
  return(<div className="mgmt-mask" onClick={onClose}>
    <div className="mgmt-panel" onClick={e=>e.stopPropagation()} style={{width:'min(320px,calc(100vw-32px))'}}>
      <div className="mgmt-head">
        <span className="mgmt-title">管理员登录</span>
        <button className="mgmt-close" onClick={onClose} aria-label="关闭">×</button>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:16}}>
        <input className="mgmt-input" id="loginUser" placeholder="用户名" defaultValue="admin"
          onKeyDown={e=>{if(e.key==='Enter')document.getElementById('loginPass')?.focus()}}/>
        <input className="mgmt-input" id="loginPass" type="password" placeholder="密码"
          onKeyDown={e=>{if(e.key==='Enter')document.querySelector<HTMLButtonElement>('.login-btn')?.click()}}/>
        {loginErr&&<div style={{fontSize:11,color:'#EF4444',textAlign:'center'}}>{loginErr}</div>}
      </div>
      <button className="mgmt-save-btn login-btn" style={{width:'100%',padding:'10px 0',fontSize:13}}
        onClick={()=>{
          const u=(document.getElementById('loginUser') as HTMLInputElement)?.value
          const p=(document.getElementById('loginPass') as HTMLInputElement)?.value
          if(u==='admin'&&p==='123456'){
            onClose()
            onSuccess()
          } else {
            onLoginError('用户名或密码错误')
          }
        }}>进入后台</button>
    </div>
  </div>)
}
