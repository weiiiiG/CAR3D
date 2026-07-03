interface CapturePanelProps{
  captureKey:string|null
  capturePos:string
  onSave:()=>void
  onClose:()=>void
}

export default function CapturePanel({captureKey,capturePos,onSave,onClose}:CapturePanelProps){
  if(!captureKey)return null
  return(<div style={{
    position:'fixed',left:16,bottom:'clamp(70px,11vh,86px)',zIndex:60,
    background:'var(--surface)',border:'1px solid var(--rule)',
    borderRadius:6,padding:'10px 14px',
    boxShadow:'0 4px 20px rgba(0,0,0,0.4)',
    display:'flex',alignItems:'center',gap:12,
    pointerEvents:'auto',maxWidth:'calc(100vw - 32px)',
  }}>
    <div style={{display:'flex',flexDirection:'column',gap:2}}>
      <div style={{fontFamily:'var(--display)',fontSize:13,letterSpacing:'0.04em',color:'var(--ink)'}}>
        选取视角 · {captureKey}
      </div>
      <div style={{fontSize:10,color:'var(--ink-mute)'}}>
        拖拽旋转到合适位置
      </div>
      <div style={{fontFamily:'monospace',fontSize:10,color:'var(--accent)',marginTop:2}}>
        {capturePos||'获取中...'}
      </div>
    </div>
    <button className="hud-btn" style={{
      background:'var(--accent)',color:'var(--bg-deep)',
      fontWeight:700,padding:'6px 14px',fontSize:11,borderRadius:4,border:'none',cursor:'pointer'
    }} onClick={onSave}>保存</button>
    <button className="hud-btn" style={{
      padding:'6px 10px',fontSize:11,borderRadius:4,border:'1px solid var(--rule)',
      background:'transparent',color:'var(--ink-mute)',cursor:'pointer'
    }} onClick={onClose}>关闭</button>
  </div>)
}
