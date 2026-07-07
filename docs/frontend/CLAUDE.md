# 前端规范 — CLAUDE.md

## 技术栈
React 19 + TypeScript + Three.js 0.184 + GSAP 3.15 + ECharts 6 + Vite 8

## 启动
```bash
cd D:/threejs/3D
npm run dev              # → http://localhost:5180
npx tsc --noEmit         # 类型检查
```

## 项目结构

```
src/
├── App.tsx              主组件：状态（hot/annOpen/overrides）+ 6 视角热点 + 面板入场动画
├── index.css            CSS 变量 + 抽屉样式 + 加载环 + HUD + 管理面板
├── main.tsx             React DOM 渲染入口
└── components/
    ├── Scene.tsx        Three.js 引擎
    │   ├── 初始化场景/相机/PerspectiveCamera(38,fov,0.02,1000)/ACESFilmicToneMapping
    │   ├── GLTFLoader 加载车身 + HDRLoader 环境贴图
    │   ├── DirectionalLight(2048² 阴影) + HemisphereLight + PointLight
    │   ├── 地面：径向渐变 CanvasTexture 背景层 + 反射层 + 软阴影圈
    │   ├── OrbitControls + gsap.ticker 渲染循环
    │   ├── 6 Hotspot 球体 + 车门/车轮节点查找 + GSAP 动画
    │   ├── 加载进度环 GSAP 独立 0→100 + 首次访问运镜 4.5s / 后台返回直飞
    │   └── cleanup：disposed 守卫 + 事件移除 + GSAP kill + Three.js dispose
    ├── LoadingOverlay.tsx  标题逐字符入场 + SVG 进度环（逆时针 stroke-dashoffset）+ 步骤文字
    ├── HudBar.tsx          水平按钮栏（6 视角 + 重置 + 齿轮），首次点击 reveal
    ├── AnnotationPanel.tsx 侧边抽屉容器
    │   ├── .ann-drawer 定位 + .ann-drawer-content 滑动 + .ann-tab 切换标签
    │   ├── SVG 描边边框 + 顶部 accent 色带 + 规格数字递增动画
    │   └── ECharts 图表（雷达/柱状/饼图/仪表盘，350ms 延迟 init）
    ├── LoginModal.tsx      模态遮罩 + JWT 登录 → sessionStorage 标记 + 跳转 admin
    ├── CapturePanel.tsx    ?capture= 模式：实时坐标显示 + PUT API 保存
    └── ViewManagerPanel.tsx 视角覆盖列表：跳转/更新/重置（mgmt-* CSS 类）
```

## State 管理
- `hot`: `string | null` — 当前选中的视角 key。`setHot(null)` → `onComplete(()=>setHot(key))` 切换
- `annOpen`: boolean — 注解抽屉展开/收起
- `overrides`: `Record<string,{pos,target}>` — 从 API 拉取的视角覆盖数据
- `prog`: number — 加载进度 0-100，用于 LoadingOverlay 渲染
- `hudVisible`: boolean — 首次点击场景后 reveal HUD 栏
- `captureKey`: `string | null` — URL `?capture=` 参数触发的捕获模式

## 动画模式

| 场景 | 方法 | 时长 | easing |
|---|---|---|---|
| 飞镜切换视角 | `gsap.to(cam.position)` + `gsap.to(ctrl.target)` | 1.2s | power3.inOut |
| 重置视角 | 同上 | 1s | power3.inOut |
| 首次运镜 | `orbitTL.to(orbAngle, {a: PI*2})` | 4.5s | power2.inOut |
| 加载进度环 | `gsap.to(progObj, {v:100})` | 2.5s + 0.75s 延迟 | power1.inOut |
| 收尾追赶 | `gsap.to(progObj, {v:100, overwrite:'auto'})` | 0.35s | power2.out |
| 面板描边 | `gsap.fromTo(rect, {strokeDashoffset:1}, {strokeDashoffset:0})` | 0.5s | power2.inOut |
| 面板内容 | `gsap.fromTo(inner, {opacity:0,y:8}, {opacity:1,y:0})` | 0.35s + 0.55s 延迟 | power2.out |
| 标签渐入 | `gsap.fromTo(tabRef, {opacity:0}, {opacity:1})` | 0.35s + 0.55s 延迟 | power2.out |
| 规格数字 | `gsap.to(proxy, {v:target})` | 0.9s + 0.65s 延迟 | power2.out |
| 车门开 | `dTlRef.current.to(ds, {lf:degToRad(62)})` | 1.5s | back.out(1.3) |
| 车轮转 | `gsap.to(wsDataRef, {speed:14})` | 1.8s | power2.out |

## ECharts 使用
- 每次 `hot` 变化：`dispose()` → 350ms 延迟 → `init(chRef.current)` → `setOption(CO[hot])`
- chartConfig 存储在数据库 JSONB，启动时 API 拉取覆盖 CO 硬编码
- **不可用函数回调**（无法 JSON 序列化），颜色用 `data: [{value, itemStyle:{color}}]`
- 雷达图 center `['50%','52%']`，仪表盘 startAngle `200` endAngle `-20`

## Three.js 注意事项
- `Scenes.ts` useEffect 中初始化，cleanup 需：`gsap.ticker.remove(tick)` + `ctrl.dispose()` + `re.dispose()` + 遍历 dispose geometry/material
- 阴影：`PCFShadowMap` + 2048² + 紧贴 shadow.camera frustum 减少锯齿
- 地面：Canvas 径向渐变纹理（背景层 `MeshBasicMaterial` + 反射层 `MeshStandardMaterial` + 软阴影 `MeshBasicMaterial`）
- HDR：`HDRLoader` 直接设 `scene.environment`，不需 PMREMGenerator

## API 调用
- 模块级 `fetch('/api/views')` 拉取视角数据覆盖 CO/HI，需 `.catch(()=>{})` 防未捕获异常
- overrides 通过 `fetch('/api/overrides')` + `PUT /api/overrides/:key` CRUD
- CapturePanel 直接 `fetch('/api/overrides/'+key, {method:'PUT'})`

## 捕获工作流
1. 管理后台 → 新窗口打开 `/?capture=<key>`
2. 前端 `URLSearchParams.get('capture')` → `setCaptureKey(key)`
3. 定时 200ms 读取 `cam.position` → 显示坐标
4. 保存：`PUT /api/overrides/:key` + `sessionStorage.setItem('admin_return','1')` → 跳回 admin
5. 关闭：同上但跳过保存

@see [主 CLAUDE.md](../../CLAUDE.md)
