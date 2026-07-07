import { useRef, useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import * as echarts from 'echarts'
import Scene from '../components/Scene'
import LoadingOverlay from '../components/LoadingOverlay'
import HudBar from '../components/HudBar'
import AnnotationPanel from '../components/AnnotationPanel'
import LoginModal from '../components/LoginModal'
import CapturePanel from '../components/CapturePanel'
import ViewManagerPanel from '../components/ViewManagerPanel'
import { HI, CO, BUILTIN_VIEWS, DEF, API_BASE } from '../data/views'

export default function ScenePage() {
  const ref = useRef<HTMLDivElement>(null)
  const loRef = useRef<HTMLDivElement>(null), ltRef = useRef<HTMLHeadingElement>(null), ldRef = useRef<HTMLDivElement>(null), prRef = useRef<HTMLDivElement>(null), lsRef = useRef<HTMLDivElement>(null)
  const tbRef = useRef<HTMLDivElement>(null), pnRef = useRef<HTMLDivElement>(null), chRef = useRef<HTMLDivElement>(null)
  const [prog, setProg] = useState(0), [hot, setHot] = useState<string | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginErr, setLoginErr] = useState(''), [captureKey, setCaptureKey] = useState<string | null>(null)
  const [capturePos, setCapturePos] = useState('')
  const [hudVisible, setHudVisible] = useState(false)
  const drRef = useRef<{ node: THREE.Object3D; bq: THREE.Quaternion; sign: number }[]>([]), wrRef = useRef<{ node: THREE.Object3D; bq: THREE.Quaternion }[]>([]), wsDataRef = useRef({ speed: 0 })
  const [annOpen, setAnnOpen] = useState(false)
  const camRef = useRef<THREE.PerspectiveCamera | null>(null), ctrlRef = useRef<OrbitControls | null>(null)
  const hitRef = useRef<THREE.Mesh[]>([])
  const dTlRef = useRef<gsap.core.Timeline | null>(null), wsTweenRef = useRef<gsap.core.Tween | null>(null), mTlRef = useRef<gsap.core.Timeline | null>(null)
  const chartInst = useRef<echarts.ECharts | null>(null)
  const hotRef = useRef<string | null>(null); hotRef.current = hot

  const allViews = useRef<Record<string, { pos: number[]; target: number[] }>>({ ...BUILTIN_VIEWS })
  const [overrides, setOverrides] = useState<Record<string, { pos: number[]; target: number[] }>>({})

  useEffect(() => {
    fetch(`${API_BASE}/overrides`).then(r => r.json()).then((data: any[]) => {
      const ov: Record<string, { pos: number[]; target: number[] }> = {}
      for (const item of data) ov[item.viewKey] = { pos: [item.posX, item.posY, item.posZ], target: [item.targetX, item.targetY, item.targetZ] }
      setOverrides(ov); allViews.current = { ...BUILTIN_VIEWS, ...ov }
    }).catch(() => { })
  }, [])

  useEffect(() => { allViews.current = { ...BUILTIN_VIEWS, ...overrides } }, [overrides])

  useEffect(() => {
    if (hudVisible || !tbRef.current) return
    gsap.fromTo(tbRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
  }, [hudVisible])

  useEffect(() => { if (hot) setAnnOpen(true) }, [hot])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search); const key = params.get('capture')
    if (key) setCaptureKey(key)
  }, [])

  useEffect(() => {
    if (!captureKey) return
    const id = setInterval(() => {
      const cam = camRef.current, ctrl = ctrlRef.current
      if (cam && ctrl) setCapturePos(`${cam.position.x.toFixed(2)}, ${cam.position.y.toFixed(2)}, ${cam.position.z.toFixed(2)}`)
    }, 200)
    return () => clearInterval(id)
  }, [captureKey])

  const handleUpdateView = useCallback(async (key: string) => {
    const cam = camRef.current, ctrl = ctrlRef.current
    if (!cam || !ctrl) { alert('相机尚未就绪'); return }
    const payload = { viewKey: key, posX: cam.position.x, posY: cam.position.y, posZ: cam.position.z, targetX: ctrl.target.x, targetY: ctrl.target.y, targetZ: ctrl.target.z }
    try {
      await fetch(`${API_BASE}/overrides/${key}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const ov = { ...overrides, [key]: { pos: [cam.position.x, cam.position.y, cam.position.z], target: [ctrl.target.x, ctrl.target.y, ctrl.target.z] } }
      setOverrides(ov); allViews.current = { ...BUILTIN_VIEWS, ...ov }
    } catch { alert('保存失败，请确认后端已启动') }
  }, [overrides])

  const handleResetOverride = useCallback(async (key: string) => {
    try {
      await fetch(`${API_BASE}/overrides/${key}`, { method: 'DELETE' })
      const ov = { ...overrides }; delete ov[key]; setOverrides(ov); allViews.current = { ...BUILTIN_VIEWS, ...ov }
    } catch { alert('重置失败') }
  }, [overrides])

  useEffect(() => {
    if (chRef.current && hot && CO[hot]) {
      const t = setTimeout(() => {
        if (!chRef.current) return; chartInst.current?.dispose(); chartInst.current = echarts.init(chRef.current); chartInst.current.setOption(CO[hot])
      }, 350)
      return () => { clearTimeout(t); chartInst.current?.dispose(); chartInst.current = null }
    }
  }, [hot])

  const resetView = () => {
    setHot(null)
    if (drRef.current.length) dTlRef.current?.reverse()
    if (wrRef.current.length) { wsTweenRef.current?.kill(); wsTweenRef.current = gsap.to(wsDataRef.current, { speed: 0, duration: 0.8, ease: 'power2.out' }) }
    const cam = camRef.current, ctrl = ctrlRef.current; if (!cam || !ctrl) return
    gsap.to(cam.position, { x: DEF.pos[0], y: DEF.pos[1], z: DEF.pos[2], duration: 1, ease: 'power3.inOut', overwrite: 'auto', onUpdate: () => cam.lookAt(ctrl.target) })
    gsap.to(ctrl.target, { x: DEF.target[0], y: DEF.target[1], z: DEF.target[2], duration: 1, ease: 'power3.inOut', overwrite: 'auto', onUpdate: () => ctrl.update() })
  }

  const hotspotClick = (key: string) => {
    setHot(null)
    const cam = camRef.current, ctrl = ctrlRef.current; if (!cam || !ctrl) return
    const v = allViews.current[key]; if (!v) return
    if (key !== 'doors' && drRef.current.length) dTlRef.current?.reverse()
    if (key !== 'wheels' && wrRef.current.length) { wsTweenRef.current?.kill(); wsTweenRef.current = gsap.to(wsDataRef.current, { speed: 0, duration: 0.8, ease: 'power2.out' }) }
    const dst = new THREE.Vector3(v.pos[0], v.pos[1], v.pos[2]), tgt = new THREE.Vector3(v.target[0], v.target[1], v.target[2])
    gsap.to(cam.position, { x: dst.x, y: dst.y, z: dst.z, duration: 1.2, ease: 'power3.inOut', overwrite: 'auto', onUpdate: () => cam.lookAt(ctrl.target), onComplete: () => setHot(key) })
    gsap.to(ctrl.target, { x: tgt.x, y: tgt.y, z: tgt.z, duration: 1.2, ease: 'power3.inOut', overwrite: 'auto', onUpdate: () => ctrl.update() })
    if (key === 'doors') dTlRef.current?.play()
    if (key === 'wheels') { wsTweenRef.current?.kill(); wsTweenRef.current = gsap.to(wsDataRef.current, { speed: 14, duration: 1.8, ease: 'power2.out' }) }
  }

  const sceneRefs = { camRef, ctrlRef, drRef, wrRef, dTlRef, wsTweenRef, mTlRef, hitRef, allViews, wsDataRef }

  useEffect(() => {
    if (!hot) return
    const capturedHot = hot
    const id = requestAnimationFrame(() => {
      const r = pnRef.current?.querySelector('.panel-frame rect') as SVGRectElement | null
      const inner = pnRef.current?.querySelector('.panel-inner') as HTMLElement | null
      const stripe = pnRef.current?.querySelector('.panel-stripe') as HTMLElement | null
      if (!r || !inner) return
      gsap.fromTo(r, { strokeDashoffset: 1, fillOpacity: 0 }, { strokeDashoffset: 0, duration: 0.5, delay: 0.05, ease: 'power2.inOut' })
      gsap.to(r, { fillOpacity: 1, duration: 0.3, delay: 0.5, ease: 'power1.out' })
      if (stripe) gsap.fromTo(stripe, { scaleX: 0 }, { scaleX: 1, duration: 0.5, delay: 0.15, ease: 'power2.inOut' })
      gsap.fromTo(inner, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, delay: 0.55, ease: 'power2.out' })
      const specEl = pnRef.current?.querySelector('.panel-spec-value') as HTMLElement | null
      if (!specEl) return; const txt = specEl.textContent || ''; const numMatch = txt.match(/([\d,]+\.?\d*)/)
      if (!numMatch) return; const raw = numMatch[0].replace(/,/g, ''), target = parseFloat(raw)
      if (isNaN(target)) return; const isDec = raw.includes('.'), dec = isDec ? raw.split('.')[1].length : 0
      const proxy = { v: 0 }
      gsap.to(proxy, { v: target, duration: 0.9, delay: 0.65, ease: 'power2.out', onUpdate: () => { if (hotRef.current !== capturedHot) return; const formatted = dec > 0 ? proxy.v.toFixed(dec) : Math.round(proxy.v).toLocaleString('en-US'); specEl.textContent = txt.replace(numMatch[0], formatted) } })
    })
    return () => cancelAnimationFrame(id)
  }, [hot])

  return (
    <div className="viewer" ref={ref}>
      <Scene scopeRef={ref} sceneRefs={sceneRefs} setProg={setProg} onReveal={() => setHudVisible(true)}
        loRef={loRef} ltRef={ltRef} ldRef={ldRef} prRef={prRef} lsRef={lsRef}
        onHotspotClick={hotspotClick} onResetView={resetView} def={DEF} />
      <div className="top-bar"><div className="brand">HENNESSY</div><div className="model-tag">VENOM GT · 2010</div></div>
      <LoadingOverlay prog={prog} loRef={loRef} ltRef={ltRef} ldRef={ldRef} prRef={prRef} lsRef={lsRef} />
      <AnnotationPanel hot={hot} pnRef={pnRef} chRef={chRef} hi={HI} co={CO} onClose={resetView} open={annOpen} onToggle={() => setAnnOpen(!annOpen)} />
      <HudBar hot={hot} tbRef={tbRef} hi={HI} onHotspotClick={hotspotClick} onReset={resetView} onGearClick={() => setLoginOpen(true)} />
      <div className="hint">{hudVisible ? 'SELECT VIEW · DRAG TO EXPLORE · RESET TO RETURN' : 'CLICK ANYWHERE TO START'}</div>
      <LoginModal open={loginOpen} loginErr={loginErr}
        onClose={() => { setLoginOpen(false); setLoginErr('') }}
        onSuccess={() => { sessionStorage.setItem('admin_return', '1'); window.location.href = '/admin' }}
        onLoginError={setLoginErr} />
      <CapturePanel captureKey={captureKey} capturePos={capturePos}
        onSave={() => {
          const cam = camRef.current, ctrl = ctrlRef.current
          if (!cam || !ctrl || !captureKey) return
          const p = { viewKey: captureKey, posX: cam.position.x, posY: cam.position.y, posZ: cam.position.z, targetX: ctrl.target.x, targetY: ctrl.target.y, targetZ: ctrl.target.z }
          fetch('/api/overrides/' + captureKey, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })
            .then(function () { sessionStorage.setItem('admin_return', '1'); window.location.href = '/admin' })
            .catch(function () { alert('保存失败，请确认后端已启动') })
        }}
        onClose={() => { sessionStorage.setItem('admin_return', '1'); setCaptureKey(null); window.location.href = '/admin' }} />
      <ViewManagerPanel open={false} overrides={overrides} hi={HI}
        onUpdate={handleUpdateView} onReset={handleResetOverride} onNavigate={hotspotClick} onClose={() => { }} />
    </div>
  )
}
