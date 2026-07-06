interface AnnotationPanelProps{
  hot:string|null
  pnRef:React.RefObject<HTMLDivElement | null>
  chRef:React.RefObject<HTMLDivElement | null>
  hi:Record<string,{label:string;desc:string;spec:string}>
  co:Record<string,any>
}

export default function AnnotationPanel({hot,pnRef,chRef,hi,co}:AnnotationPanelProps){
  if(!hot||!hi[hot])return null
  return(<div className="annotation-panel" ref={pnRef}>
    <svg className="panel-frame" preserveAspectRatio="none">
      <rect x="0.5" y="0.5" width="calc(100% - 1px)" height="calc(100% - 1px)" pathLength={1}/>
    </svg>
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
  </div>)
}
