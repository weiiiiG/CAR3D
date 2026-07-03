# 前端组件结构

## 组件总览

所有 7 个组件均定义在 `App.tsx` 中（尚未拆分），通过 `useState` / `useRef` 管理状态与 DOM 引用。

## 组件树

```
App
├── Scene                    # Three.js 场景初始化 + 模型加载
│   ├── PerspectiveCamera
│   ├── OrbitControls
│   ├── GLTF 车身模型
│   ├── 6 个 Hotspot 球体
│   ├── 环境光 + 点光
│   └── gsap.ticker 渲染循环
├── LoadingOverlay           # 加载进度 + 标题动画
│   ├── 标题 "HENNESSY VENOM GT"
│   ├── 加载进度环 (SVG circle)
│   ├── 进度百分比文字
│   └── 渐入/渐出 GSAP 动画
├── HudBar                   # 视角切换按钮
│   ├── 6 个内置视角按钮 (前脸/侧颜/座舱/内饰/鸥翼门/轮毂)
│   ├── 重置视角按钮
│   └── 齿轮图标（管理入口）
├── AnnotationPanel          # Hotspot 详情面板
│   ├── 规格参数展示
│   ├── ECharts 图表（每个视角对应不同图表）
│   └── 关闭按钮
├── LoginModal               # 管理员认证
│   ├── 用户名/密码输入框
│   ├── 登录错误提示
│   └── 提交 → 打开管理后台
├── CapturePanel             # 3D 坐标捕获模式
│   ├── 相机坐标实时显示
│   ├── 确认保存按钮
│   └── 取消按钮
└── ViewManagerPanel         # 视角覆盖管理
    ├── 覆盖列表
    ├── 启用/禁用切换
    └── 输入坐标调整
```

## 组件详情

### Scene
- `useGSAP` 初始化 Three.js 场景、相机、灯光、地面
- `GLTFLoader` 加载 `scene.gltf`
- `OrbitControls` 控制相机，`gsap.ticker` 驱动渲染循环
- 创建 6 个 Hotspot 球体（`THREE.Mesh`）附加到车身对应位置
- 车门/车轮动画通过 `gsap.timeline` 实现
- cleanup 时 dispose 所有 Three.js 资源

### LoadingOverlay
- 通过 `loadingTitleTlRef` 控制 GSAP 标题逐字动画
- 通过 `progressTlRef` 控制进度条填充动画
- `setProg` 更新进度值（0-100），完成后触发渐出动画
- z-index: 100（最高层级）

### HudBar
- 渲染 6 个视角按钮，点击触发 `hotspotClick(key)`
- 重置按钮调用 `resetView()` 恢复默认相机位置
- 齿轮图标点击弹出管理员登录弹窗
- 激活状态通过 `hot` state 高亮当前按钮

### AnnotationPanel
- 当 `hot` 非 null 时显示
- 展示当前视角标签、描述、规格
- ECharts 图表实例通过 `chartInst` ref 管理
- `hot` 变化时先 `dispose()` 旧图表 → `init()` 新图表
- 关闭按钮调用 `setHot(null)` 恢复 OrbitControls

### LoginModal
- 模态遮罩层 + 表单面板
- 提交后 POST `/api/admin/login` 验证
- 验证成功后 `window.open` 管理后台页面
- 验证失败显示错误信息
- z-index: 50

### CapturePanel
- 进入条件：URL 带 `?capture=<key>` 参数
- 定时（200ms）读取 `camRef.position` 显示实时坐标
- 点击「确认保存」将坐标写入 `localStorage` 供 admin 页面轮询读取
- 点击「取消」退出捕获模式

### ViewManagerPanel
- 管理员模式下可查看/编辑视角覆盖数据
- 对 each view 可调整 pos/target 坐标
- 覆盖数据通过 API 同步到后端，同时更新本地 `allViews`
