const LOADING_TITLE='HENNESSY VENOM GT'

interface LoadingOverlayProps{
  prog:number
  loRef:React.RefObject<HTMLDivElement | null>
  ltRef:React.RefObject<HTMLHeadingElement | null>
  ldRef:React.RefObject<HTMLDivElement | null>
  prRef:React.RefObject<HTMLDivElement | null>
  lsRef:React.RefObject<HTMLDivElement | null>
}

export default function LoadingOverlay({prog,loRef,ltRef,ldRef,prRef,lsRef}:LoadingOverlayProps){
  const R=34,CR=2*Math.PI*R,dOff=CR*(1-prog/100)
  return(<div className="loading-overlay" ref={loRef}>
    <h1 className="loading-title" ref={ltRef}>{LOADING_TITLE.split('').map((c,i)=>(<span className="char" key={i}>{c===' '?' ':c}</span>))}</h1>
    <div className="loading-sub" style={{opacity:0,transform:'translateY(6px)'}}>LAUNCH SEQUENCE</div>
    <div className="loading-divider" ref={ldRef} style={{width:0,opacity:0}}/>
    <div className="progress-ring" ref={prRef}>
      <svg viewBox="0 0 100 100">
        <circle className="progress-bg" cx="50" cy="50" r="34"/><circle className="progress-fill" cx="50" cy="50" r="34" style={{strokeDashoffset:dOff}}/>
      </svg><div className="progress-text">{prog}%</div>
    </div>
    <div className="loading-sublabel" ref={lsRef}>INITIALIZING</div>
  </div>)
}
