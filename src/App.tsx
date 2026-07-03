import { useRef, useState, useEffect, Fragment, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import * as echarts from 'echarts'
gsap.registerPlugin(useGSAP)

const MODEL_URL='/models/hennessy/scene.gltf',HDR_URL='/env/studio_small_09_1k.hdr'
const DOOR_OPEN_ANGLE=THREE.MathUtils.degToRad(62),Y_AXIS=new THREE.Vector3(0,1,0),X_AXIS=new THREE.Vector3(1,0,0)
const WHEEL_NODES=['DEF-WheelFtL_5','DEF-WheelFtR_7','DEF-WheelBkL_9','DEF-WheelBkR_11','DEF-WheelBrakeFtL_13','DEF-WheelBrakeFtR_15','DEF-WheelBrakeBkL_17','DEF-WheelBrakeBkR_19']as const

// ───── 中文描述 ─────
const HI:Record<string,{label:string;desc:string;spec:string}>={front:{label:'前脸',desc:'激进车身套件搭配碳纤维进气口。',spec:'1,244 hp'},side:{label:'侧颜',desc:'风洞打磨的流畅空气动力学轮廓。',spec:'Cd 0.35'},'45':{label:'座舱',desc:'以驾驶者为中心的座舱预览。',spec:'RWD 底盘'},interior:{label:'内饰',desc:'Alcantara 翻毛皮与碳纤维座舱。',spec:'单座布局'},doors:{label:'鸥翼门',desc:'向上开启的碳纤维车门。',spec:'单扇 2.7 kg'},wheels:{label:'轮毂',desc:'20 英寸锻造合金轮毂。',spec:'Pilot Sport Cup 2'}}

// ───── 内置相机视角 ─────
const BUILTIN_VIEWS:Record<string,{pos:number[];target:number[]}>={front:{pos:[0,1.8,9.5],target:[-0.8,0.6,0]},side:{pos:[11,1.7,0.1],target:[-0.8,0.6,0]},'45':{pos:[7,3,7],target:[-0.8,0.6,0]},interior:{pos:[-0.05,0.58,0.35],target:[0,0.3,3.2]},doors:{pos:[3.5,1.6,2.4],target:[0.2,0.5,0]},wheels:{pos:[4.0,0.9,5.0],target:[0.4,0.3,1.8]}}
const API_BASE='http://localhost:3000/api'
function loadOverrides():Record<string,{pos:number[];target:number[]}>{
  try{return JSON.parse(localStorage.getItem('car3d_view_overrides')||'{}')}catch{return{}}
}
const DEF={pos:[8,2.5,10],target:[0,0.6,0]}
const CO:Record<string,any>={front:{radar:{indicator:[{name:'Horsepower',max:1500},{name:'Torque',max:1200},{name:'Top Speed',max:350},{name:'0-60',max:3.5},{name:'Downforce',max:500}],axisName:{color:'#92949E',fontSize:9},splitArea:{areaStyle:{color:['rgba(255,188,10,0.04)','rgba(255,188,10,0.10)']}},splitLine:{lineStyle:{color:'rgba(228,229,235,0.12)'}},axisLine:{lineStyle:{color:'rgba(228,229,235,0.12)'}}},series:[{type:'radar',data:[{value:[1244,1155,301,2.7,450]}],areaStyle:{color:'rgba(255,188,10,0.28)'},lineStyle:{color:'#FFBC0A',width:2},itemStyle:{color:'#FFBC0A'}}]},side:{xAxis:{type:'category',data:['Length','Width','Height','Wheelbase'],axisLabel:{color:'#92949E',fontSize:9},axisLine:{lineStyle:{color:'rgba(228,229,235,0.18)'}}},yAxis:{type:'value',axisLabel:{color:'#6B7280'},splitLine:{lineStyle:{color:'rgba(228,229,235,0.08)'}}},series:[{type:'bar',data:[4650,1960,1130,2800],itemStyle:{color:'#FFBC0A'}}]},'45':{tooltip:{trigger:'item'},series:[{type:'pie',radius:['40%','60%'],data:[{value:45,name:'Carbon Fibre',itemStyle:{color:'#2D3040'}},{value:30,name:'Alcantara',itemStyle:{color:'#6B7280'}},{value:15,name:'Leather',itemStyle:{color:'#FFBC0A'}},{value:10,name:'Aluminium',itemStyle:{color:'#D99A00'}}],label:{color:'#92949E',fontSize:9}}]},interior:{xAxis:{type:'category',data:['1k','2k','3k','4k','5k','6k','7k'],axisLabel:{color:'#92949E',fontSize:9},axisLine:{lineStyle:{color:'rgba(228,229,235,0.18)'}}},yAxis:{type:'value',name:'RPM',nameTextStyle:{color:'#6B7280'},axisLabel:{color:'#6B7280'},splitLine:{lineStyle:{color:'rgba(228,229,235,0.08)'}}},series:[{type:'line',data:[15,40,80,140,200,270,301],smooth:true,areaStyle:{color:'rgba(255,188,10,0.18)'},lineStyle:{color:'#FFBC0A',width:2},itemStyle:{color:'#FFBC0A'}}]},doors:{xAxis:{type:'category',data:['Carbon','Steel','Aluminium'],axisLabel:{color:'#92949E',fontSize:9},axisLine:{lineStyle:{color:'rgba(228,229,235,0.18)'}}},yAxis:{type:'value',name:'kg',nameTextStyle:{color:'#6B7280'},axisLabel:{color:'#6B7280'},splitLine:{lineStyle:{color:'rgba(228,229,235,0.08)'}}},series:[{type:'bar',data:[2.7,8.5,5.1],itemStyle:{color:(p:any)=>['#FFBC0A','#6B7280','#8B8FA0'][p.dataIndex]}}]},wheels:{series:[{type:'gauge',startAngle:180,endAngle:0,min:0,max:320,axisLine:{lineStyle:{width:8,color:[[0.3,'#6B7280'],[0.7,'#FFBC0A'],[1,'#D99A00']]}},axisLabel:{color:'#6B7280',fontSize:9},detail:{formatter:'{value} km/h',color:'#E4E5EB',fontSize:11},title:{color:'#92949E'},data:[{value:196,name:'Top Speed Locked'}]}]}}

const LOADING_TITLE='HENNESSY VENOM GT'

function App(){
  const ref=useRef<HTMLDivElement>(null),cvsRef=useRef<HTMLDivElement>(null)
  const loRef=useRef<HTMLDivElement>(null),ltRef=useRef<HTMLHeadingElement>(null),ldRef=useRef<HTMLDivElement>(null),prRef=useRef<HTMLDivElement>(null)
  const psRef=useRef<SVGCircleElement>(null),lsRef=useRef<HTMLDivElement>(null),tbRef=useRef<HTMLDivElement>(null),pnRef=useRef<HTMLDivElement>(null),chRef=useRef<HTMLDivElement>(null)
  const [prog,setProg]=useState(0),[hot,setHot]=useState<string|null>(null),[drOp,setDrOp]=useState(false),[ws,setWs]=useState(false)
  const [mgmtOpen,setMgmtOpen]=useState(false),[loginOpen,setLoginOpen]=useState(false)
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

  useGSAP((_ctx,contextSafe)=>{
    const c=ref.current,h=cvsRef.current;if(!c||!h||!contextSafe)return
    const sc=new THREE.Scene();const cam=new THREE.PerspectiveCamera(38,h.clientWidth/h.clientHeight,0.02,1000)
    cam.position.set(20,8,20);camRef.current=cam
    const re=new THREE.WebGLRenderer({antialias:true,alpha:true})
    re.setClearColor(0x000000,0);re.setPixelRatio(Math.min(window.devicePixelRatio,2));re.setSize(h.clientWidth,h.clientHeight)
    re.outputColorSpace=THREE.SRGBColorSpace;re.toneMapping=THREE.ACESFilmicToneMapping;re.toneMappingExposure=1.05
    re.shadowMap.enabled=true;re.shadowMap.type=THREE.PCFShadowMap;h.appendChild(re.domElement)

    const hemi=new THREE.HemisphereLight(0xfff1d6,0x1a1714,0.18);sc.add(hemi)
    const key=new THREE.DirectionalLight(0xfff5e0,0.9);key.position.set(6,9,4);key.castShadow=true
    key.shadow.mapSize.set(1024,1024);key.shadow.camera.near=1;key.shadow.camera.far=30
    key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.bottom=-6;key.shadow.bias=-0.0008;key.shadow.radius=4;sc.add(key)
    const rim=new THREE.DirectionalLight(0xffd9b3,0.3);rim.position.set(-7,4,-5);sc.add(rim)
    const pt=new THREE.PointLight(0xFFBC0A,0.35,14);pt.position.set(0,1.5,4);sc.add(pt)
    const LT={hemi:0.55,key:2.8,rim:1.0,point:0.6}

    const gc=document.createElement('canvas');gc.width=512;gc.height=512;const gx=gc.getContext('2d')!
    const gg=gx.createRadialGradient(256,256,0,256,256,256)
    gg.addColorStop(0,'#1E2028');gg.addColorStop(0.35,'#181A22');gg.addColorStop(0.7,'#13151B');gg.addColorStop(1,'#0E1015')
    gx.fillStyle=gg;gx.fillRect(0,0,512,512)
    const bgM=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(gc),transparent:true,opacity:0.75,depthWrite:false}))
    bgM.rotation.x=-Math.PI/2;bgM.position.y=-0.05;sc.add(bgM)
    const gM=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({color:0x1C1E28,metalness:0.4,roughness:0.5,transparent:true,opacity:0.85}))
    gM.rotation.x=-Math.PI/2;gM.receiveShadow=true;sc.add(gM)
    const sc3=document.createElement('canvas');sc3.width=256;sc3.height=256;const sx=sc3.getContext('2d')!
    const sg=sx.createRadialGradient(128,128,0,128,128,128);sg.addColorStop(0,'rgba(0,0,0,0.70)');sg.addColorStop(0.5,'rgba(0,0,0,0.18)');sg.addColorStop(1,'rgba(0,0,0,0)')
    sx.fillStyle=sg;sx.fillRect(0,0,256,256)
    const shM=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sc3),transparent:true,depthWrite:false,opacity:0})
    const sh=new THREE.Mesh(new THREE.PlaneGeometry(7,7),shM);sh.rotation.x=-Math.PI/2;sh.position.y=0.002;sc.add(sh)
    const pmrem=new THREE.PMREMGenerator(re);pmrem.compileEquirectangularShader()
    new RGBELoader().load(HDR_URL,contextSafe((tex)=>{sc.environment=pmrem.fromEquirectangular(tex).texture;tex.dispose();pmrem.dispose()}),undefined,()=>pmrem.dispose())

    const ctrl=new OrbitControls(cam,re.domElement);ctrl.enableDamping=true;ctrl.dampingFactor=0.08;ctrl.minDistance=2.5;ctrl.maxDistance=25
    ctrl.maxPolarAngle=Math.PI/2-0.02 // 相机不能到地面以下
    ctrl.target.set(0,0.6,0);ctrl.enabled=false;ctrlRef.current=ctrl
    // BUGFIX 1: drag does NOT clear annotation lines — they persist until next hotspot click

    ;(window as any).__hotspotClick=(k:string)=>hotspotClick(k,sc)
    ;(window as any).__resetView=()=>resetView(sc)
    ;(window as any).__gsap=gsap;(window as any).__camRef=camRef;(window as any).__allViews=allViews

    // --- Ticker ---
    let lastT=0;const wA={value:0},wD=new THREE.Quaternion()
    const tick=()=>{
      const now=gsap.ticker.time,dt=now-lastT;lastT=now
      if(wsDataRef.current.speed!==0&&wrRef.current.length){wA.value+=wsDataRef.current.speed*dt;wD.setFromAxisAngle(X_AXIS,wA.value);for(const w of wrRef.current)w.node.quaternion.copy(w.bq).multiply(wD)}
      ctrl.update();re.render(sc,cam)
    };gsap.ticker.add(tick)
    window.addEventListener('resize',()=>{const w=h.clientWidth,wh=h.clientHeight;cam.aspect=w/wh;cam.updateProjectionMatrix();re.setSize(w,wh)})
    const ct=gsap.timeline()
    ct.to('.loading-title .char',{y:0,opacity:1,duration:0.4,ease:'power2.out',stagger:0.025},0.15)
    ct.to('.loading-sub',{opacity:1,y:0,duration:0.4,ease:'power2.out'},0.5)
    ct.to(ldRef.current,{opacity:1,scaleX:1,duration:0.7,ease:'power3.out'},0.55)
    ct.to(prRef.current,{opacity:1,duration:0.4},0.75);ct.to(lsRef.current,{opacity:1,duration:0.4},0.9)

    // --- Load model ---
    const loader=new GLTFLoader()
    loader.load(MODEL_URL,contextSafe((gltf)=>{
      const m=gltf.scene,b=new THREE.Box3().setFromObject(m),cn=b.getCenter(new THREE.Vector3())
      m.position.sub(cn);m.position.y-=b.min.y-cn.y
      m.traverse((o)=>{const x=o as THREE.Mesh;if(x.isMesh){x.castShadow=true;x.receiveShadow=false;const ma=Array.isArray(x.material)?x.material:[x.material];for(const mat of ma)if(mat.name&&/window|glass/i.test(mat.name))mat.side=THREE.DoubleSide}})
      sc.add(m)
      const lf=m.getObjectByName('door_lf_ok_0'),rf=m.getObjectByName('door_rf_ok_1')
      const dd:{node:THREE.Object3D;bq:THREE.Quaternion;sign:number}[]=[];if(lf)dd.push({node:lf,bq:lf.quaternion.clone(),sign:-1});if(rf)dd.push({node:rf,bq:rf.quaternion.clone(),sign:1});drRef.current=dd
      const wl:{node:THREE.Object3D;bq:THREE.Quaternion}[]=[];for(const n of WHEEL_NODES){const n2=m.getObjectByName(n);if(n2)wl.push({node:n2,bq:n2.quaternion.clone()})};wrRef.current=wl
      const ds={lf:0,rf:0},tq=new THREE.Quaternion()
      dTlRef.current=gsap.timeline({paused:true,onUpdate:()=>{if(lf){tq.setFromAxisAngle(Y_AXIS,ds.lf*-1);lf.quaternion.copy(dd[0]!.bq).multiply(tq)};if(rf){tq.setFromAxisAngle(Y_AXIS,ds.rf*1);rf.quaternion.copy(dd[1]!.bq).multiply(tq)}}})
      dTlRef.current.to(ds,{lf:DOOR_OPEN_ANGLE,duration:1.5,ease:'back.out(1.3)'},0).to(ds,{rf:DOOR_OPEN_ANGLE,duration:1.5,ease:'back.out(1.3)'},0.12)
      const bcc=b.getCenter(new THREE.Vector3()),fwd=b.max.z,sx=b.max.x
      const pm2:Record<string,[number,number,number]>={front:[0,bcc.y,fwd-0.3],side:[sx,bcc.y,0],'45':[sx*0.4,bcc.y,fwd*0.3],interior:[-0.3,bcc.y-0.05,-0.3],doors:[sx*0.6,bcc.y+0.3,fwd*0.1],wheels:[sx,bcc.y-0.1,fwd*0.25]}
      for(const[key,p]of Object.entries(pm2)){const v=new THREE.Vector3(p[0],p[1],p[2]);m.localToWorld(v)
        const hit=new THREE.Mesh(new THREE.SphereGeometry(0.18,8,8),new THREE.MeshBasicMaterial({visible:false}));hit.position.copy(v);hit.userData.hotspotKey=key;sc.add(hit);hitRef.current.push(hit)
      }
      // allViews.current 由 overrides effect 同步
      // ───── 入场运镜：绕车一周 ─────
      const orbitTL=gsap.timeline({paused:true,onStart:()=>{
        // 先隐藏 loading 浮层，显示 HUD + 提示
        const rTip=gsap.timeline({defaults:{ease:'power3.out'}})
        rTip.set(loRef.current,{display:'none'})
        rTip.fromTo(tbRef.current,{xPercent:-50,y:18,opacity:0},{xPercent:-50,y:0,opacity:1,duration:0.45,ease:'power3.out'})
        rTip.to('.hint',{opacity:1,duration:0.4},0.2)
      },onComplete:()=>{
        ctrl.enabled=true
      }})
      // 灯光同步渐入
      orbitTL.to(hemi,{intensity:LT.hemi,duration:1.5,ease:'power2.out'},0)
      orbitTL.to(key,{intensity:LT.key,duration:1.5,ease:'power2.out'},0)
      orbitTL.to(rim,{intensity:LT.rim,duration:1.5,ease:'power2.out'},0)
      orbitTL.to(pt,{intensity:LT.point,duration:1.5,ease:'power2.out'},0)
      orbitTL.to(shM,{opacity:0.55,duration:1.2,ease:'power2.out'},0.05)
      orbitTL.fromTo(m.rotation,{y:-0.21},{y:0,duration:2.0,ease:'power3.out'},0.1)
      // 飞到环拍起点
      orbitTL.to(cam.position,{x:0,y:2.5,z:9.5,duration:1.5,ease:'power2.inOut',
        onUpdate:()=>cam.lookAt(0,0.6,0)
      },0)
      // 绕车 360 度旋转
      const orbAngle={a:0};const O_RADIUS=9.5,O_HEIGHT=2.5
      orbitTL.to(orbAngle,{a:Math.PI*2,duration:4.5,ease:'power2.inOut',
        onUpdate:()=>{
          cam.position.set(Math.sin(orbAngle.a)*O_RADIUS,O_HEIGHT,Math.cos(orbAngle.a)*O_RADIUS)
          cam.lookAt(0,0.6,0)
        }
      },1.5)
      // 飞到默认视角
      orbitTL.to(cam.position,{x:DEF.pos[0],y:DEF.pos[1],z:DEF.pos[2],duration:1.8,ease:'power3.inOut',
        onUpdate:()=>cam.lookAt(ctrl.target)
      },6.0)
      // 淡出 loading 文字
      orbitTL.to([ltRef.current,ldRef.current,prRef.current,lsRef.current,document.querySelector('.loading-sub')],{opacity:0,y:-8,duration:0.35,stagger:0.025},6.5)
      mTlRef.current=orbitTL;setProg(100);orbitTL.play()
    }),(xhr)=>{if(xhr.total)setProg(Math.round((xhr.loaded/xhr.total)*100))},()=>{})

    return()=>{
      gsap.ticker.remove(tick);dTlRef.current?.kill();wsTweenRef.current?.kill();mTlRef.current?.kill();ctrl.dispose();re.dispose()
      if(re.domElement.parentNode===h)h.removeChild(re.domElement);sc.traverse((m)=>{const x=m as THREE.Mesh;if(x.isMesh){x.geometry?.dispose();const ma=x.material;if(Array.isArray(ma))ma.forEach(y=>y.dispose());else ma?.dispose()}})
    }
  },{scope:ref})

  const resetView=(_sc?:THREE.Scene)=>{
    setHot(null)
    if(drRef.current.length){dTlRef.current?.reverse();setDrOp(false)}
    if(wrRef.current.length){wsTweenRef.current?.kill();wsTweenRef.current=gsap.to(wsDataRef.current,{speed:0,duration:0.8,ease:'power2.out'});setWs(false)}
    const cam=camRef.current,ctrl=ctrlRef.current;if(!cam||!ctrl)return
    gsap.to(cam.position,{x:DEF.pos[0],y:DEF.pos[1],z:DEF.pos[2],duration:1,ease:'power3.inOut',overwrite:'auto',onUpdate:()=>cam.lookAt(ctrl.target)})
    gsap.to(ctrl.target,{x:DEF.target[0],y:DEF.target[1],z:DEF.target[2],duration:1,ease:'power3.inOut',overwrite:'auto',onUpdate:()=>ctrl.update()})
  }

  const hotspotClick=(key:string,sc?:THREE.Scene)=>{
    setHot(null)
    const cam=camRef.current,ctrl=ctrlRef.current;if(!cam||!ctrl)return
    const v=allViews.current[key];if(!v)return
    // 切走时停轮毂/关车门
    if(key!=='doors'&&drRef.current.length){dTlRef.current?.reverse();setDrOp(false)}
    if(key!=='wheels'&&wrRef.current.length){wsTweenRef.current?.kill();wsTweenRef.current=gsap.to(wsDataRef.current,{speed:0,duration:0.8,ease:'power2.out'});setWs(false)}
    const dst=new THREE.Vector3(v.pos[0],v.pos[1],v.pos[2]),tgt=new THREE.Vector3(v.target[0],v.target[1],v.target[2])
    gsap.to(cam.position,{x:dst.x,y:dst.y,z:dst.z,duration:1.2,ease:'power3.inOut',overwrite:'auto',onUpdate:()=>cam.lookAt(ctrl.target),onComplete:()=>startAnim(key)})
    gsap.to(ctrl.target,{x:tgt.x,y:tgt.y,z:tgt.z,duration:1.2,ease:'power3.inOut',overwrite:'auto',onUpdate:()=>ctrl.update()})
    if(key==='doors'){dTlRef.current?.play();setDrOp(true)}
    if(key==='wheels'){wsTweenRef.current?.kill();wsTweenRef.current=gsap.to(wsDataRef.current,{speed:14,duration:1.8,ease:'power2.out'});setWs(true)}
  }

  const startAnim=(key:string)=>{
    console.log('[startAnim]',key)
    setHot(key)
  }

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

      // 规格值数字 roll-up 动画
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

  const R=34,CR=2*Math.PI*R,dOff=CR*(1-prog/100)
  return(<div className="viewer" ref={ref}>
    <div className="canvas-host" ref={cvsRef}/>
    <div className="top-bar"><div className="brand">HENNESSY</div><div className="model-tag">VENOM GT · 2010</div></div>
    <div className="loading-overlay" ref={loRef}>
      <h1 className="loading-title" ref={ltRef}>{LOADING_TITLE.split('').map((c,i)=>(<span className="char" key={i}>{c===' '?' ':c}</span>))}</h1>
      <div className="loading-sub" style={{opacity:0,transform:'translateY(6px)'}}>LAUNCH SEQUENCE</div>
      <div className="loading-divider" ref={ldRef} style={{width:0,opacity:0}}/>
      <div className="progress-ring" ref={prRef}>
        <svg viewBox="0 0 100 100">
          <circle className="progress-bg" cx="50" cy="50" r="34"/><circle className="progress-fill" ref={psRef} cx="50" cy="50" r="34" style={{strokeDashoffset:dOff}}/>
        </svg><div className="progress-text">{prog}%</div>
      </div>
      <div className="loading-sublabel" ref={lsRef}>INITIALIZING</div>
    </div>
    {hot&&HI[hot]&&(<div className="annotation-panel" ref={pnRef}>
      <svg className="panel-frame" preserveAspectRatio="none">
        <rect x="0.5" y="0.5" width="calc(100% - 1px)" height="calc(100% - 1px)" pathLength={1}/>
      </svg>
      <div className="panel-stripe"/>
      <div className="panel-inner">
        <div className="panel-label">{hot==='front'?'POWERTRAIN':hot==='side'?'AERODYNAMICS':hot==='45'?'COCKPIT':hot==='interior'?'INTERIOR':hot==='doors'?'DOORS':'WHEELS'}</div>
        <div className="panel-title">{HI[hot].label}</div>
        <div className="panel-desc">{HI[hot].desc}</div>
        <div className="panel-spec" data-cat={hot}>
          <span className="panel-spec-value">{HI[hot].spec}</span>
          <span className="panel-spec-unit"/>
        </div>
        {CO[hot]&&<div className="chart-card" ref={chRef}/>}
      </div>
    </div>)}
    <div className="hud-bar" ref={tbRef}>
      {(['front','side','45','interior','doors','wheels'] as const).map((k,i)=>(
        <Fragment key={k}>
          {i>0&&<div className="hud-divider"/>}
          <button className={`hud-btn ${hot===k?'active-view':''}`}
            onClick={()=>{if(hot===k)(window as any).__resetView?.();else (window as any).__hotspotClick?.(k)}}>
            {HI[k].label}
          </button>
        </Fragment>
      ))}
      <div className="hud-divider"/>
      <button className="hud-btn" onClick={()=>(window as any).__resetView?.()}>重置</button>
      <div className="hud-divider"/>
      <button className="hud-btn mgmt-toggle" onClick={()=>setLoginOpen(true)} title="管理员入口" aria-label="管理员入口">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
    </div>
    <div className="hint">SELECT VIEW · DRAG TO EXPLORE · RESET TO RETURN</div>

    {/* 管理员登录 */}
    {loginOpen&&(<div className="mgmt-mask" onClick={()=>{setLoginOpen(false);setLoginErr('')}}>
      <div className="mgmt-panel" onClick={e=>e.stopPropagation()} style={{width:'min(320px,calc(100vw-32px))'}}>
        <div className="mgmt-head">
          <span className="mgmt-title">管理员登录</span>
          <button className="mgmt-close" onClick={()=>{setLoginOpen(false);setLoginErr('')}} aria-label="关闭">×</button>
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
              setLoginOpen(false);setLoginErr('')
              window.open('http://localhost:3000/admin','_blank')
            } else {
              setLoginErr('用户名或密码错误')
            }
          }}>进入后台</button>
      </div>
    </div>)}

    {/* 视角调整面板 */}
    {mgmtOpen&&(<div className="mgmt-mask" onClick={()=>setMgmtOpen(false)}>
      <div className="mgmt-panel" onClick={e=>e.stopPropagation()}>
        <div className="mgmt-head">
          <span className="mgmt-title">视角调整</span>
          <button className="mgmt-close" onClick={()=>setMgmtOpen(false)} aria-label="关闭">×</button>
        </div>
        <div className="mgmt-list">
          {(['front','side','45','interior','doors','wheels'] as const).map(k=>(
            <div className="mgmt-item" key={k}>
              <div className="mgmt-item-info">
                <span className="mgmt-item-name">{HI[k].label}</span>
                {overrides[k]&&<span className="mgmt-item-badge">已调整</span>}
              </div>
              <div className="mgmt-item-acts">
                <button className="mgmt-mini" onClick={()=>{(window as any).__hotspotClick?.(k);setMgmtOpen(false)}}>跳转</button>
                <button className="mgmt-mini" onClick={()=>{handleUpdateView(k);setMgmtOpen(false)}}>更新</button>
                {overrides[k]&&<button className="mgmt-mini danger" onClick={()=>handleResetOverride(k)}>重置</button>}
              </div>
            </div>
          ))}
        </div>
        <div className="mgmt-foot" style={{textAlign:'center',fontSize:11,color:'var(--ink-soft)',paddingTop:12}}>
          拖拽调整相机位置后点"更新"保存
        </div>
      </div>
    </div>)}

    {/* 捕获模式：左下角浮动卡片，不遮挡场景 */}
    {captureKey&&(<div style={{
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
      }}
        onClick={()=>{
          const cam=camRef.current,ctrl=ctrlRef.current
          if(!cam||!ctrl)return
          localStorage.setItem('admin_capture',JSON.stringify({
            pos:[cam.position.x,cam.position.y,cam.position.z],
            target:[ctrl.target.x,ctrl.target.y,ctrl.target.z]
          }))
          alert('视角已保存！正在返回管理后台...')
          window.location.href = 'http://localhost:3000/admin'
        }}>保存</button>
      <button className="hud-btn" style={{
        padding:'6px 10px',fontSize:11,borderRadius:4,border:'1px solid var(--rule)',
        background:'transparent',color:'var(--ink-mute)',cursor:'pointer'
      }} onClick={()=>{setCaptureKey(null);window.location.href='http://localhost:3000/admin'}}>关闭</button>
    </div>)}
  </div>)
}
export default App