import { useRef, useEffect } from 'react'
import gsap from 'gsap'

interface AnnotationPanelProps{
  hot:string|null
  pnRef:React.RefObject<HTMLDivElement | null>
  chRef:React.RefObject<HTMLDivElement | null>
  hi:Record<string,{label:string;desc:string;spec:string}>
  co:Record<string,any>
  onClose:()=>void
  open:boolean
  onToggle:()=>void
}

export default function AnnotationPanel({hot,pnRef,chRef,hi,co,onClose,open,onToggle}:AnnotationPanelProps){
  if(!hot||!hi[hot])return null
  const isWheels=hot==='wheels'
  const tabRef=useRef<HTMLButtonElement>(null)
  useEffect(()=>{
    if(tabRef.current)gsap.fromTo(tabRef.current,{opacity:0},{opacity:1,duration:0.35,delay:0.55,ease:'power2.out'})
  },[hot])
  return(<div className={`ann-drawer${isWheels?' drawer-left':''}`}>
    <div className={`ann-drawer-content${open?' open':''}`}>
      <div className={`annotation-panel${isWheels?' panel-left':''}`} ref={pnRef}>
        <svg className="panel-frame" preserveAspectRatio="none">
          <rect x="0.5" y="0.5" width="calc(100% - 1px)" height="calc(100% - 1px)" pathLength={1}/>
        </svg>
        <button className="panel-close" onClick={onClose} aria-label="关闭">×</button>
        <div className="panel-stripe"/>
        <div className="panel-inner">
          <div className="panel-label">{hot==='front'?'POWERTRAIN':hot==='side'?'AERODYNAMICS':hot==='45'?'COCKPIT':hot==='interior'?'INTERIOR':hot==='doors'?'DOORS':'WHEELS'}</div>
          <div className="panel-title">{hi[hot].label}</div>
          <div className="panel-desc">{hi[hot].desc}</div>
          <div className="panel-spec" data-cat={hot}>
            <span className="panel-spec-value">{hi[hot].spec}</span>
            <span className="panel-spec-unit"/>
          </div>
          {co[hot]&&<div className="chart-card" ref={chRef}/>}
        </div>
      </div>
    </div>
    <button className="ann-tab" ref={tabRef} onClick={onToggle} title={open?'隐藏':'展开'}>
      <span>{open?'›':'‹'}</span>
    </button>
  </div>)
}
