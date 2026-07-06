import { Fragment } from 'react'

interface HudBarProps{
  hot:string|null
  tbRef:React.RefObject<HTMLDivElement | null>
  hi:Record<string,{label:string;desc:string;spec:string}>
  onHotspotClick:(key:string)=>void
  onReset:()=>void
  onGearClick:()=>void
}

const VIEW_KEYS=['front','side','45','interior','doors','wheels']as const

export default function HudBar({hot,tbRef,hi,onHotspotClick,onReset,onGearClick}:HudBarProps){
  return(<div className="hud-bar" ref={tbRef}>
    {VIEW_KEYS.map((k,i)=>(
      <Fragment key={k}>
        {i>0&&<div className="hud-divider"/>}
        <button className={`hud-btn ${hot===k?'active-view':''}`}
          onClick={()=>{if(hot===k)onReset();else onHotspotClick(k)}}>
          {hi[k].label}
        </button>
      </Fragment>
    ))}
    <div className="hud-divider"/>
    <button className="hud-btn" onClick={onReset}>重置</button>
    <div className="hud-divider"/>
    <button className="hud-btn mgmt-toggle" onClick={onGearClick} title="管理员入口" aria-label="管理员入口">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    </button>
  </div>)
}
