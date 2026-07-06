import { useRef, useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import * as echarts from 'echarts'
import Scene from './components/Scene'
import LoadingOverlay from './components/LoadingOverlay'
import HudBar from './components/HudBar'
import AnnotationPanel from './components/AnnotationPanel'
import LoginModal from './components/LoginModal'
import CapturePanel from './components/CapturePanel'
import ViewManagerPanel from './components/ViewManagerPanel'

// ───── 中文描述 ─────
const HI:Record<string,{label:string;desc:string;spec:string}>={front:{label:'前脸',desc:'激进车身套件搭配碳纤维进气口。',spec:'1,244 hp'},side:{label:'侧颜',desc:'风洞打磨的流畅空气动力学轮廓。',spec:'Cd 0.35'},'45':{label:'座舱',desc:'以驾驶者为中心的座舱预览。',spec:'RWD 底盘'},interior:{label:'内饰',desc:'Alcantara 翻毛皮与碳纤维座舱。',spec:'单座布局'},doors:{label:'鸥翼门',desc:'向上开启的碳纤维车门。',spec:'单扇 2.7 kg'},wheels:{label:'轮毂',desc:'20 英寸锻造合金轮毂。',spec:'Pilot Sport Cup 2'}}

// ───── 内置相机视角 ─────
const BUILTIN_VIEWS:Record<string,{pos:number[];target:number[]}>={front:{pos:[0,1.8,9.5],target:[-0.8,0.6,0]},side:{pos:[11,1.7,0.1],target:[-0.8,0.6,0]},'45':{pos:[7,3,7],target:[-0.8,0.6,0]},interior:{pos:[-0.05,0.58,0.35],target:[0,0.3,3.2]},doors:{pos:[3.5,1.6,2.4],target:[0.2,0.5,0]},wheels:{pos:[4.0,0.9,5.0],target:[0.4,0.3,1.8]}}
const API_BASE='/api'
// 视角描述数据 — 启动时从 API 拉取覆盖硬编码默认值，数据库 views 表存储所有数据
fetch(API_BASE+'/views').then(r=>r.json()).then((d:any[])=>{
  for(const v of d){
    HI[v.key]={label:v.label,desc:v.description||'',spec:v.spec||''}
    if(v.chartConfig)CO[v.key]=v.chartConfig
  }
})
function loadOverrides():Record<string,{pos:number[];target:number[]}>{
  try{return JSON.parse(localStorage.getItem('car3d_view_overrides')||'{}')}catch{return{}}
}
const DEF={pos:[-0.05,0.58,0.35],target:[0,0.3,3.2]}
const CO:Record<string,any>={front:{radar:{center:['50%','52%'],radius:'65%',indicator:[{name:'马力\n1244 hp',max:1500},{name:'扭矩\n1155 Nm',max:1200},{name:'极速\n301 km/h',max:350},{name:'零百\n2.7s',max:3.5},{name:'下压力\n450 kg',max:500}],axisName:{color:'#92949E',fontSize:10},splitArea:{areaStyle:{color:['rgba(255,188,10,0.04)','rgba(255,188,10,0.10)']}},splitLine:{lineStyle:{color:'rgba(228,229,235,0.12)'}},axisLine:{lineStyle:{color:'rgba(228,229,235,0.12)'}}},series:[{type:'radar',data:[{value:[1244,1155,301,2.7,450]}],areaStyle:{color:'rgba(255,188,10,0.28)'},lineStyle:{color:'#FFBC0A',width:2},itemStyle:{color:'#FFBC0A'}}]},side:{tooltip:{trigger:'axis'},grid:{left:46,right:12,top:12,bottom:28},xAxis:{type:'category',data:['车长','车宽','车高','轴距'],axisLabel:{color:'#92949E',fontSize:11,interval:0},axisLine:{lineStyle:{color:'rgba(228,229,235,0.18)'}}},yAxis:{type:'value',axisLabel:{color:'#6B7280',fontSize:10,formatter:'{value}mm'},splitLine:{lineStyle:{color:'rgba(228,229,235,0.08)'}}},series:[{type:'bar',data:[4650,1960,1130,2800],itemStyle:{color:'#FFBC0A'},barMaxWidth:40,label:{show:true,position:'top',color:'#FFBC0A',fontSize:10,formatter:'{c}mm'}}]},'45':{tooltip:{trigger:'item',formatter:'{b}: {c}%'},series:[{type:'pie',radius:['35%','55%'],center:['50%','52%'],avoidLabelOverlap:true,label:{color:'#92949E',fontSize:11,formatter:'{b}\n{d}%'},labelLine:{length:10,length2:8},data:[{value:45,name:'碳纤维',itemStyle:{color:'#2D3040'}},{value:30,name:'Alcantara',itemStyle:{color:'#6B7280'}},{value:15,name:'真皮',itemStyle:{color:'#FFBC0A'}},{value:10,name:'铝合金',itemStyle:{color:'#D99A00'}}]}]},interior:{radar:{center:['50%','52%'],radius:'65%',indicator:[{name:'豪华感',max:10},{name:'科技配置',max:10},{name:'座椅舒适',max:10},{name:'空间表现',max:10},{name:'隔音效果',max:10}],axisName:{color:'#92949E',fontSize:11},splitArea:{areaStyle:{color:['rgba(255,188,10,0.04)','rgba(255,188,10,0.10)']}},splitLine:{lineStyle:{color:'rgba(228,229,235,0.12)'}},axisLine:{lineStyle:{color:'rgba(228,229,235,0.12)'}}},series:[{type:'radar',data:[{value:[9.2,8.5,9.0,7.0,8.5],name:'内饰评分'}],areaStyle:{color:'rgba(255,188,10,0.28)'},lineStyle:{color:'#FFBC0A',width:2},itemStyle:{color:'#FFBC0A'}}]},doors:{tooltip:{trigger:'axis'},grid:{left:40,right:12,top:12,bottom:26},xAxis:{type:'category',data:['碳纤维','钢材','铝合金'],axisLabel:{color:'#92949E',fontSize:11,interval:0},axisLine:{lineStyle:{color:'rgba(228,229,235,0.18)'}}},yAxis:{type:'value',name:'kg',nameTextStyle:{color:'#6B7280',fontSize:10},axisLabel:{color:'#6B7280',fontSize:10},splitLine:{lineStyle:{color:'rgba(228,229,235,0.08)'}}},series:[{type:'bar',barMaxWidth:40,data:[{value:2.7,itemStyle:{color:'#FFBC0A'}},{value:8.5,itemStyle:{color:'#6B7280'}},{value:5.1,itemStyle:{color:'#8B8FA0'}}],label:{show:true,position:'top',color:'#FFBC0A',fontSize:10,formatter:'{c}kg'}}]},wheels:{series:[{type:'gauge',startAngle:200,endAngle:-20,min:0,max:320,center:['50%','55%'],radius:'80%',axisLine:{lineStyle:{width:10,color:[[0.3,'#6B7280'],[0.7,'#FFBC0A'],[1,'#D99A00']]}},axisLabel:{color:'#FFBC0A',fontSize:9,distance:18,splitNumber:4},splitLine:{length:8},detail:{formatter:'{value} km/h',color:'#E4E5EB',fontSize:13,offsetCenter:[0,'55%']},title:{color:'#92949E',fontSize:11,offsetCenter:[0,'35%']},data:[{value:196,name:'极速锁定'}]}]}}

function App(){
  const ref=useRef<HTMLDivElement>(null)
  const loRef=useRef<HTMLDivElement>(null),ltRef=useRef<HTMLHeadingElement>(null),ldRef=useRef<HTMLDivElement>(null),prRef=useRef<HTMLDivElement>(null),lsRef=useRef<HTMLDivElement>(null)
  const tbRef=useRef<HTMLDivElement>(null),pnRef=useRef<HTMLDivElement>(null),chRef=useRef<HTMLDivElement>(null)
  const [prog,setProg]=useState(0),[hot,setHot]=useState<string|null>(null)
  const [loginOpen,setLoginOpen]=useState(false)
  const [loginErr,setLoginErr]=useState(''),[captureKey,setCaptureKey]=useState<string|null>(null)
  const [capturePos,setCapturePos]=useState('')
  const drRef=useRef<{node:THREE.Object3D;bq:THREE.Quaternion;sign:number}[]>([]),wrRef=useRef<{node:THREE.Object3D;bq:THREE.Quaternion}[]>([]),wsDataRef=useRef({speed:0})
  const camRef=useRef<THREE.PerspectiveCamera|null>(null),ctrlRef=useRef<OrbitControls|null>(null)
  const hitRef=useRef<THREE.Mesh[]>([])
  const dTlRef=useRef<gsap.core.Timeline|null>(null),wsTweenRef=useRef<gsap.core.Tween|null>(null),mTlRef=useRef<gsap.core.Timeline|null>(null)
  const chartInst=useRef<echarts.ECharts|null>(null)

  // 合并内置视角与用户覆盖
  const allViews=useRef<Record<string,{pos:number[];target:number[]}>>({...BUILTIN_VIEWS})
  const [overrides,setOverrides]=useState<Record<string,{pos:number[];target:number[]}>>({})

  // 启动时从 API 拉取覆盖
  useEffect(()=>{
    fetch(`${API_BASE}/overrides`).then(r=>r.json()).then((data:any[])=>{
      const ov:Record<string,{pos:number[];target:number[]}>={}
      for(const item of data)ov[item.viewKey]={pos:[item.posX,item.posY,item.posZ],target:[item.targetX,item.targetY,item.targetZ]}
      setOverrides(ov)
      allViews.current={...BUILTIN_VIEWS,...ov}
    }).catch(()=>{
      const ov=loadOverrides()
      setOverrides(ov)
      allViews.current={...BUILTIN_VIEWS,...ov}
    })
  },[])

  // overrides 变化时同步 allViews
  useEffect(()=>{
    allViews.current={...BUILTIN_VIEWS,...overrides}
  },[overrides])

  // 捕获模式：从管理后台打开 ?capture=1 进入视角选取
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search)
    const key=params.get('capture')
    if(key){setCaptureKey(key)}
  },[])

  // 捕获模式：定时更新相机位置显示
  useEffect(()=>{
    if(!captureKey)return
    const id=setInterval(()=>{
      const cam=camRef.current,ctrl=ctrlRef.current
      if(cam&&ctrl)setCapturePos(`${cam.position.x.toFixed(2)}, ${cam.position.y.toFixed(2)}, ${cam.position.z.toFixed(2)}`)
    },200)
    return ()=>clearInterval(id)
  },[captureKey])

  const handleUpdateView=useCallback(async (key:string)=>{
    const cam=camRef.current,ctrl=ctrlRef.current
    if(!cam||!ctrl){alert('相机尚未就绪');return}
    const payload={viewKey:key,posX:cam.position.x,posY:cam.position.y,posZ:cam.position.z,targetX:ctrl.target.x,targetY:ctrl.target.y,targetZ:ctrl.target.z}
    try {
      await fetch(`${API_BASE}/overrides/${key}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      const ov={...overrides,[key]:{pos:[cam.position.x,cam.position.y,cam.position.z],target:[ctrl.target.x,ctrl.target.y,ctrl.target.z]}}
      setOverrides(ov)
      allViews.current={...BUILTIN_VIEWS,...ov}
    } catch {
      alert('保存失败，请确认后端已启动')
    }
  },[overrides])

  const handleResetOverride=useCallback(async (key:string)=>{
    try {
      await fetch(`${API_BASE}/overrides/${key}`,{method:'DELETE'})
      const ov={...overrides};delete ov[key]
      setOverrides(ov)
      allViews.current={...BUILTIN_VIEWS,...ov}
    } catch {
      alert('重置失败')
    }
  },[overrides])

  useEffect(()=>{
    if(chRef.current&&hot&&CO[hot]){const t=setTimeout(()=>{if(!chRef.current)return;chartInst.current?.dispose();chartInst.current=echarts.init(chRef.current);chartInst.current.setOption(CO[hot])},350);return ()=>{clearTimeout(t);chartInst.current?.dispose();chartInst.current=null}}
  },[hot])

  const resetView=()=>{
    setHot(null)
    if(drRef.current.length){dTlRef.current?.reverse()}
    if(wrRef.current.length){wsTweenRef.current?.kill();wsTweenRef.current=gsap.to(wsDataRef.current,{speed:0,duration:0.8,ease:'power2.out'})}
    const cam=camRef.current,ctrl=ctrlRef.current;if(!cam||!ctrl)return
    gsap.to(cam.position,{x:DEF.pos[0],y:DEF.pos[1],z:DEF.pos[2],duration:1,ease:'power3.inOut',overwrite:'auto',onUpdate:()=>cam.lookAt(ctrl.target)})
    gsap.to(ctrl.target,{x:DEF.target[0],y:DEF.target[1],z:DEF.target[2],duration:1,ease:'power3.inOut',overwrite:'auto',onUpdate:()=>ctrl.update()})
  }

  const hotspotClick=(key:string)=>{
    setHot(null)
    const cam=camRef.current,ctrl=ctrlRef.current;if(!cam||!ctrl)return
    const v=allViews.current[key];if(!v)return
    if(key!=='doors'&&drRef.current.length){dTlRef.current?.reverse()}
    if(key!=='wheels'&&wrRef.current.length){wsTweenRef.current?.kill();wsTweenRef.current=gsap.to(wsDataRef.current,{speed:0,duration:0.8,ease:'power2.out'})}
    const dst=new THREE.Vector3(v.pos[0],v.pos[1],v.pos[2]),tgt=new THREE.Vector3(v.target[0],v.target[1],v.target[2])
    gsap.to(cam.position,{x:dst.x,y:dst.y,z:dst.z,duration:1.2,ease:'power3.inOut',overwrite:'auto',onUpdate:()=>cam.lookAt(ctrl.target),onComplete:()=>setHot(key)})
    gsap.to(ctrl.target,{x:tgt.x,y:tgt.y,z:tgt.z,duration:1.2,ease:'power3.inOut',overwrite:'auto',onUpdate:()=>ctrl.update()})
    if(key==='doors'){dTlRef.current?.play()}
    if(key==='wheels'){wsTweenRef.current?.kill();wsTweenRef.current=gsap.to(wsDataRef.current,{speed:14,duration:1.8,ease:'power2.out'})}
  }

  const sceneRefs={camRef,ctrlRef,drRef,wrRef,dTlRef,wsTweenRef,mTlRef,hitRef,allViews,wsDataRef}

  // ───── 面板入场动画 ─────
  useEffect(()=>{
    if(!hot)return
    requestAnimationFrame(()=>{
      const r=pnRef.current?.querySelector('.panel-frame rect') as SVGRectElement|null
      const inner=pnRef.current?.querySelector('.panel-inner') as HTMLElement|null
      const stripe=pnRef.current?.querySelector('.panel-stripe') as HTMLElement|null
      if(!r||!inner)return
      gsap.fromTo(r,{strokeDashoffset:1,fillOpacity:0},{strokeDashoffset:0,duration:0.5,delay:0.05,ease:'power2.inOut'})
      gsap.to(r,{fillOpacity:1,duration:0.3,delay:0.5,ease:'power1.out'})
      if(stripe)gsap.fromTo(stripe,{scaleX:0},{scaleX:1,duration:0.5,delay:0.15,ease:'power2.inOut'})
      gsap.fromTo(inner,{opacity:0,y:8},{opacity:1,y:0,duration:0.35,delay:0.55,ease:'power2.out'})

      const specEl=pnRef.current?.querySelector('.panel-spec-value') as HTMLElement|null
      if(!specEl)return
      const txt=specEl.textContent||''
      const numMatch=txt.match(/([\d,]+\.?\d*)/)
      if(!numMatch)return
      const raw=numMatch[0].replace(/,/g,''),target=parseFloat(raw)
      if(isNaN(target))return
      const isDec=raw.includes('.'),dec=isDec?raw.split('.')[1].length:0
      const proxy={v:0}
      gsap.to(proxy,{
        v:target,
        duration:0.9,
        delay:0.65,
        ease:'power2.out',
        onUpdate:()=>{
          const formatted=dec>0?proxy.v.toFixed(dec):Math.round(proxy.v).toLocaleString('en-US')
          specEl.textContent=txt.replace(numMatch[0],formatted)
        }
      })
    })
  },[hot])

  return(<div className="viewer" ref={ref}>
    <Scene scopeRef={ref} sceneRefs={sceneRefs} setProg={setProg}
      loRef={loRef} ltRef={ltRef} ldRef={ldRef} prRef={prRef} lsRef={lsRef}
      tbRef={tbRef} onHotspotClick={hotspotClick} onResetView={resetView} def={DEF}/>
    <div className="top-bar"><div className="brand">HENNESSY</div><div className="model-tag">VENOM GT · 2010</div></div>
    <LoadingOverlay prog={prog} loRef={loRef} ltRef={ltRef} ldRef={ldRef} prRef={prRef} lsRef={lsRef}/>
    <AnnotationPanel hot={hot} pnRef={pnRef} chRef={chRef} hi={HI} co={CO} onClose={resetView}/>
    <HudBar hot={hot} tbRef={tbRef} hi={HI} onHotspotClick={hotspotClick} onReset={resetView} onGearClick={()=>setLoginOpen(true)}/>
    <div className="hint">SELECT VIEW · DRAG TO EXPLORE · RESET TO RETURN</div>
    <LoginModal open={loginOpen} loginErr={loginErr}
      onClose={()=>{setLoginOpen(false);setLoginErr('')}}
      onSuccess={()=>window.location.href='/admin.html'}
      onLoginError={setLoginErr}/>
    <CapturePanel captureKey={captureKey} capturePos={capturePos}
      onSave={()=>{
        const cam=camRef.current,ctrl=ctrlRef.current
        if(!cam||!ctrl||!captureKey)return
        const p={viewKey:captureKey,posX:cam.position.x,posY:cam.position.y,posZ:cam.position.z,targetX:ctrl.target.x,targetY:ctrl.target.y,targetZ:ctrl.target.z}
        fetch('/api/overrides/'+captureKey,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)})
          .then(function(){alert('视角已保存！');window.location.href='/admin.html'})
          .catch(function(){alert('保存失败，请确认后端已启动')})
      }}
      onClose={()=>{setCaptureKey(null);window.location.href='/admin.html'}}/>
    <ViewManagerPanel open={false} overrides={overrides} hi={HI}
      onUpdate={handleUpdateView} onReset={handleResetOverride} onNavigate={hotspotClick} onClose={()=>{}}/>
  </div>)
}
export default App
