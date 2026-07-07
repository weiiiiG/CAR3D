import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js'
import gsap from 'gsap'

const MODEL_URL='/models/hennessy/scene.gltf',HDR_URL='/env/studio_small_09_1k.hdr'
const DOOR_OPEN_ANGLE=THREE.MathUtils.degToRad(62),Y_AXIS=new THREE.Vector3(0,1,0),X_AXIS=new THREE.Vector3(1,0,0)
const WHEEL_NODES=['DEF-WheelFtL_5','DEF-WheelFtR_7','DEF-WheelBkL_9','DEF-WheelBkR_11','DEF-WheelBrakeFtL_13','DEF-WheelBrakeFtR_15','DEF-WheelBrakeBkL_17','DEF-WheelBrakeBkR_19']as const

interface SceneRefs {
  camRef: React.MutableRefObject<THREE.PerspectiveCamera | null>
  ctrlRef: React.MutableRefObject<OrbitControls | null>
  drRef: React.MutableRefObject<{node: THREE.Object3D; bq: THREE.Quaternion; sign: number}[]>
  wrRef: React.MutableRefObject<{node: THREE.Object3D; bq: THREE.Quaternion}[]>
  dTlRef: React.MutableRefObject<gsap.core.Timeline | null>
  wsTweenRef: React.MutableRefObject<gsap.core.Tween | null>
  mTlRef: React.MutableRefObject<gsap.core.Timeline | null>
  hitRef: React.MutableRefObject<THREE.Mesh[]>
  allViews: React.MutableRefObject<Record<string,{pos:number[];target:number[]}>>
  wsDataRef: React.MutableRefObject<{speed:number}>
}

interface SceneProps {
  scopeRef: React.RefObject<HTMLDivElement | null>
  sceneRefs: SceneRefs
  setProg: (prog: number) => void
  loRef: React.RefObject<HTMLDivElement | null>
  ltRef: React.RefObject<HTMLHeadingElement | null>
  ldRef: React.RefObject<HTMLDivElement | null>
  prRef: React.RefObject<HTMLDivElement | null>
  lsRef: React.RefObject<HTMLDivElement | null>
  onHotspotClick: (key: string) => void
  onResetView: () => void
  onReveal: () => void
  def: {pos:number[];target:number[]}
}

export default function Scene({scopeRef,sceneRefs,setProg,loRef,ltRef,ldRef,prRef,lsRef,onHotspotClick,onResetView,onReveal,def}:SceneProps){
  const {camRef,ctrlRef,drRef,wrRef,dTlRef,wsTweenRef,mTlRef,hitRef,wsDataRef}=sceneRefs
  const cvsRef=useRef<HTMLDivElement>(null)

  useEffect(()=>{
    const c=scopeRef.current,h=cvsRef.current;if(!c||!h)return
    const sc=new THREE.Scene();const cam=new THREE.PerspectiveCamera(38,h.clientWidth/h.clientHeight,0.02,1000)
    cam.position.set(20,8,20);camRef.current=cam
    const re=new THREE.WebGLRenderer({antialias:true,alpha:true})
    re.setClearColor(0x000000,0);re.setPixelRatio(Math.min(window.devicePixelRatio,2));re.setSize(h.clientWidth,h.clientHeight)
    re.outputColorSpace=THREE.SRGBColorSpace;re.toneMapping=THREE.ACESFilmicToneMapping;re.toneMappingExposure=1.05
    re.shadowMap.enabled=true;re.shadowMap.type=THREE.PCFShadowMap;h.appendChild(re.domElement)

    const hemi=new THREE.HemisphereLight(0xfff1d6,0x1a1714,0.18);sc.add(hemi)
    const key=new THREE.DirectionalLight(0xfff5e0,0.9);key.position.set(5,10,3);key.castShadow=true
    key.shadow.mapSize.set(2048,2048);key.shadow.camera.near=1;key.shadow.camera.far=20
    key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=4;key.shadow.camera.bottom=-4
    key.shadow.bias=-0.001;key.shadow.radius=2;sc.add(key)
    const rim=new THREE.DirectionalLight(0xffd9b3,0.3);rim.position.set(-8,3,-6);sc.add(rim)
    const pt=new THREE.PointLight(0xFFBC0A,0.35,14);pt.position.set(0,1.2,4);sc.add(pt)
    const LT={hemi:0.55,key:2.8,rim:1.0,point:0.6}

    // background gradient floor (extends far, no shadows)
    const gc=document.createElement('canvas');gc.width=512;gc.height=512;const gx=gc.getContext('2d')!
    const gg=gx.createRadialGradient(256,256,0,256,256,256)
    gg.addColorStop(0,'#1E2028');gg.addColorStop(0.35,'#181A22');gg.addColorStop(0.7,'#13151B');gg.addColorStop(1,'#0E1015')
    gx.fillStyle=gg;gx.fillRect(0,0,512,512)
    const bgM=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(gc),transparent:true,opacity:0.75,depthWrite:false}))
    bgM.rotation.x=-Math.PI/2;bgM.position.y=-0.05;sc.add(bgM)
    // reflective floor with gradient fade at edges
    const gc2=document.createElement('canvas');gc2.width=512;gc2.height=512;const gx2=gc2.getContext('2d')!
    const gg2=gx2.createRadialGradient(256,256,0,256,256,256)
    gg2.addColorStop(0,'#1C1E28');gg2.addColorStop(0.55,'#1C1E28');gg2.addColorStop(0.8,'rgba(28,30,40,0.4)');gg2.addColorStop(1,'rgba(28,30,40,0)')
    gx2.fillStyle=gg2;gx2.fillRect(0,0,512,512)
    const gM=new THREE.Mesh(new THREE.PlaneGeometry(50,50),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(gc2),metalness:0.3,roughness:0.6,transparent:true,opacity:0.9}))
    gM.rotation.x=-Math.PI/2;gM.receiveShadow=true;sc.add(gM)
    // soft shadow circle under car
    const sc3=document.createElement('canvas');sc3.width=256;sc3.height=256;const sx=sc3.getContext('2d')!
    const sg=sx.createRadialGradient(128,128,0,128,128,128);sg.addColorStop(0,'rgba(0,0,0,0.65)');sg.addColorStop(0.4,'rgba(0,0,0,0.25)');sg.addColorStop(1,'rgba(0,0,0,0)')
    sx.fillStyle=sg;sx.fillRect(0,0,256,256)
    const shM=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sc3),transparent:true,depthWrite:false,opacity:0})
    const sh=new THREE.Mesh(new THREE.PlaneGeometry(8,8),shM);sh.rotation.x=-Math.PI/2;sh.position.y=0.002;sc.add(sh)
    let disposed=false
    new HDRLoader().load(HDR_URL,(tex)=>{if(disposed)return;tex.mapping=THREE.EquirectangularReflectionMapping;sc.environment=tex},undefined,()=>{})

    const ctrl=new OrbitControls(cam,re.domElement);ctrl.enableDamping=true;ctrl.dampingFactor=0.08;ctrl.minDistance=2.5;ctrl.maxDistance=25
    ctrl.maxPolarAngle=Math.PI/2-0.02
    ctrl.target.set(0,0.6,0);ctrl.enabled=false;ctrlRef.current=ctrl

    ;(window as any).__hotspotClick=onHotspotClick
    ;(window as any).__resetView=onResetView

    let lastT=0;const wA={value:0},wD=new THREE.Quaternion()
    const tick=()=>{
      const now=gsap.ticker.time,dt=now-lastT;lastT=now
      if(wsDataRef.current.speed!==0&&wrRef.current.length){wA.value+=wsDataRef.current.speed*dt;wD.setFromAxisAngle(X_AXIS,wA.value);for(const w of wrRef.current)w.node.quaternion.copy(w.bq).multiply(wD)}
      ctrl.update();re.render(sc,cam)
    };gsap.ticker.add(tick)
    const onResize=()=>{const w=h.clientWidth,wh=h.clientHeight;cam.aspect=w/wh;cam.updateProjectionMatrix();re.setSize(w,wh)}
    window.addEventListener('resize',onResize)
    // first click reveals UI
    const revealFn=()=>{onReveal();re.domElement.removeEventListener('pointerdown',revealFn)}
    re.domElement.addEventListener('pointerdown',revealFn)
    const ct=gsap.timeline({onComplete:()=>{loadDone=true;tryPlay()}})
    // 步骤文字随加载进度变化
    function updateLabel(p:number){
      if(!lsRef.current)return
      if(p>=100)lsRef.current.textContent='SYSTEM READY'
      else if(p>70)lsRef.current.textContent='CALIBRATING'
      else if(p>30)lsRef.current.textContent='LOADING ASSETS'
      else lsRef.current.textContent='INITIALIZING'
    }
    // 进度环独立平滑 0→100，与环的入场动画同步开始
    const progObj={v:0}
    gsap.to(progObj,{v:100,duration:2.5,ease:'power1.inOut',delay:0.75,
      onUpdate:()=>setProg(Math.round(progObj.v))
    })
    // xhr 仅控制步骤文字
    const onProgress=(xhr:ProgressEvent)=>{
      if(!xhr.total)return
      updateLabel(Math.round((xhr.loaded/xhr.total)*100))
    }
    ct.to('.loading-title .char',{y:0,opacity:1,duration:0.4,ease:'power2.out',stagger:0.025},0.15)
    ct.to('.loading-sub',{opacity:1,y:0,duration:0.4,ease:'power2.out'},0.5)
    ct.to(ldRef.current,{opacity:1,scaleX:1,duration:0.7,ease:'power3.out'},0.55)
    ct.to(prRef.current,{opacity:1,duration:0.4},0.75);ct.to(lsRef.current,{opacity:1,duration:0.4},0.9)

    let loadDone=false,modelReady=false
    function tryPlay(){
      if(!loadDone||!modelReady||!mTlRef.current)return
      if(lsRef.current)lsRef.current.textContent='SYSTEM READY'
      gsap.to(progObj,{v:100,duration:0.35,ease:'power2.out',overwrite:'auto',
        onUpdate:()=>setProg(Math.round(progObj.v)),
        onComplete:()=>gsap.delayedCall(1,()=>mTlRef.current?.play())
      })
    }

    const loader=new GLTFLoader()
    loader.load(MODEL_URL,(gltf)=>{
      const m=gltf.scene,b=new THREE.Box3().setFromObject(m),cn=b.getCenter(new THREE.Vector3())
      m.position.sub(cn);m.position.y-=b.min.y-cn.y
      m.traverse((o)=>{const x=o as THREE.Mesh;if(x.isMesh){x.castShadow=true;x.receiveShadow=false;const ma=Array.isArray(x.material)?x.material:[x.material];for(const mat of ma)if(mat.name&&/window|glass/i.test(mat.name))mat.side=THREE.DoubleSide}})
      sc.add(m)
      const lf=m.getObjectByName('door_lf_ok_0'),rf=m.getObjectByName('door_rf_ok_1')
      const dd:{node:THREE.Object3D;bq:THREE.Quaternion;sign:number}[]=[];if(lf)dd.push({node:lf,bq:lf.quaternion.clone(),sign:-1});if(rf)dd.push({node:rf,bq:rf.quaternion.clone(),sign:1});drRef.current=dd
      const wl:{node:THREE.Object3D;bq:THREE.Quaternion}[]=[];for(const n of WHEEL_NODES){const n2=m.getObjectByName(n);if(n2)wl.push({node:n2,bq:n2.quaternion.clone()})};wrRef.current=wl
      const ds={lf:0,rf:0},tq=new THREE.Quaternion()
      dTlRef.current=gsap.timeline({paused:true,onUpdate:()=>{if(lf&&dd.length>0){tq.setFromAxisAngle(Y_AXIS,ds.lf*-1);lf.quaternion.copy(dd[0]!.bq).multiply(tq)};if(rf&&dd.length>1){tq.setFromAxisAngle(Y_AXIS,ds.rf*1);rf.quaternion.copy(dd[1]!.bq).multiply(tq)}}})
      dTlRef.current.to(ds,{lf:DOOR_OPEN_ANGLE,duration:1.5,ease:'back.out(1.3)'},0).to(ds,{rf:DOOR_OPEN_ANGLE,duration:1.5,ease:'back.out(1.3)'},0.12)
      const bcc=b.getCenter(new THREE.Vector3()),fwd=b.max.z,sx=b.max.x
      const pm2:Record<string,[number,number,number]>={front:[0,bcc.y,fwd-0.3],side:[sx,bcc.y,0],'45':[sx*0.4,bcc.y,fwd*0.3],interior:[-0.3,bcc.y-0.05,-0.3],doors:[sx*0.6,bcc.y+0.3,fwd*0.1],wheels:[sx,bcc.y-0.1,fwd*0.25]}
      for(const[key,p]of Object.entries(pm2)){const v=new THREE.Vector3(p[0],p[1],p[2]);m.localToWorld(v)
        const hit=new THREE.Mesh(new THREE.SphereGeometry(0.18,8,8),new THREE.MeshBasicMaterial({visible:false}));hit.position.copy(v);hit.userData.hotspotKey=key;sc.add(hit);hitRef.current.push(hit)
      }

      const orbitTL=gsap.timeline({paused:true,onStart:()=>{
        const rTip=gsap.timeline({defaults:{ease:'power3.out'}})
        rTip.set(loRef.current,{display:'none'})
        rTip.to('.hint',{opacity:1,duration:0.4},0.2)
      },onComplete:()=>{
        ctrl.enabled=true
      }})
      orbitTL.to(hemi,{intensity:LT.hemi,duration:1.5,ease:'power2.out'},0)
      orbitTL.to(key,{intensity:LT.key,duration:1.5,ease:'power2.out'},0)
      orbitTL.to(rim,{intensity:LT.rim,duration:1.5,ease:'power2.out'},0)
      orbitTL.to(pt,{intensity:LT.point,duration:1.5,ease:'power2.out'},0)
      orbitTL.to(shM,{opacity:0.55,duration:1.2,ease:'power2.out'},0.05)
      orbitTL.fromTo(m.rotation,{y:-0.21},{y:0,duration:2.0,ease:'power3.out'},0.1)
      const fromAdmin=sessionStorage.getItem('admin_return')||window.location.search.includes('capture')||(document.referrer||'').includes('admin.html')
      if(fromAdmin)sessionStorage.removeItem('admin_return')
      if(!fromAdmin){
        orbitTL.to(cam.position,{x:0,y:2.5,z:9.5,duration:1.5,ease:'power2.inOut',
          onUpdate:()=>cam.lookAt(0,0.6,0)
        },0)
        const orbAngle={a:0};const O_RADIUS=9.5,O_HEIGHT=2.5
        orbitTL.to(orbAngle,{a:Math.PI*2,duration:4.5,ease:'power2.inOut',
          onUpdate:()=>{
            cam.position.set(Math.sin(orbAngle.a)*O_RADIUS,O_HEIGHT,Math.cos(orbAngle.a)*O_RADIUS)
            cam.lookAt(0,0.6,0)
          }
        },1.5)
        orbitTL.to(cam.position,{x:def.pos[0],y:def.pos[1],z:def.pos[2],duration:1.8,ease:'power3.inOut',
          onUpdate:()=>cam.lookAt(ctrl.target)
        },6.0)
        orbitTL.to(ctrl.target,{x:def.target[0],y:def.target[1],z:def.target[2],duration:1.8,ease:'power3.inOut',
          onUpdate:()=>ctrl.update()
        },6.0)
        orbitTL.to([ltRef.current,ldRef.current,prRef.current,lsRef.current,document.querySelector('.loading-sub')],{opacity:0,y:-8,duration:0.35,stagger:0.025},6.5)
      }else{
        orbitTL.to(cam.position,{x:def.pos[0],y:def.pos[1],z:def.pos[2],duration:1.2,ease:'power3.inOut',
          onUpdate:()=>cam.lookAt(ctrl.target)
        },0)
        orbitTL.to(ctrl.target,{x:def.target[0],y:def.target[1],z:def.target[2],duration:1.2,ease:'power3.inOut',
          onUpdate:()=>ctrl.update()
        },0)
        orbitTL.to([ltRef.current,ldRef.current,prRef.current,lsRef.current,document.querySelector('.loading-sub')],{opacity:0,y:-8,duration:0.25,stagger:0.025},1.2)
      }
      mTlRef.current=orbitTL;modelReady=true;tryPlay()
    },onProgress,(e)=>console.error('GLTF load error',e))

    return()=>{
      disposed=true
      gsap.ticker.remove(tick);ct.kill();dTlRef.current?.kill();wsTweenRef.current?.kill();mTlRef.current?.kill();gsap.killTweensOf(progObj)
      re.domElement.removeEventListener('pointerdown',revealFn);window.removeEventListener('resize',onResize)
      ctrl.dispose();re.dispose()
      if(re.domElement.parentNode===h)h.removeChild(re.domElement);sc.traverse((m)=>{const x=m as THREE.Mesh;if(x.isMesh){x.geometry?.dispose();const ma=x.material;if(Array.isArray(ma))ma.forEach(y=>y.dispose());else ma?.dispose()}})
    }
  },[])

  return <div className="canvas-host" ref={cvsRef}/>
}
