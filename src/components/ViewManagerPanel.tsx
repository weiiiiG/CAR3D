interface ViewManagerPanelProps{
  open:boolean
  overrides:Record<string,{pos:number[];target:number[]}>
  hi:Record<string,{label:string;desc:string;spec:string}>
  onUpdate:(key:string)=>void
  onReset:(key:string)=>void
  onNavigate:(key:string)=>void
  onClose:()=>void
}

const VIEW_KEYS=['front','side','45','interior','doors','wheels']as const

export default function ViewManagerPanel({open,overrides,hi,onUpdate,onReset,onNavigate,onClose}:ViewManagerPanelProps){
  if(!open)return null
  return(<div className="mgmt-mask" onClick={onClose}>
    <div className="mgmt-panel" onClick={e=>e.stopPropagation()}>
      <div className="mgmt-head">
        <span className="mgmt-title">视角调整</span>
        <button className="mgmt-close" onClick={onClose} aria-label="关闭">×</button>
      </div>
      <div className="mgmt-list">
        {VIEW_KEYS.map(k=>(
          <div className="mgmt-item" key={k}>
            <div className="mgmt-item-info">
              <span className="mgmt-item-name">{hi[k].label}</span>
              {overrides[k]&&<span className="mgmt-item-badge">已调整</span>}
            </div>
            <div className="mgmt-item-acts">
              <button className="mgmt-mini" onClick={()=>{onNavigate(k);onClose()}}>跳转</button>
              <button className="mgmt-mini" onClick={()=>{onUpdate(k);onClose()}}>更新</button>
              {overrides[k]&&<button className="mgmt-mini danger" onClick={()=>onReset(k)}>重置</button>}
            </div>
          </div>
        ))}
      </div>
      <div className="mgmt-foot" style={{textAlign:'center',fontSize:11,color:'var(--ink-soft)',paddingTop:12}}>
        拖拽调整相机位置后点"更新"保存
      </div>
    </div>
  </div>)
}
