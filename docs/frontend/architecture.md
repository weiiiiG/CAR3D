# 前端架构

## 技术栈
React 19 + TypeScript + Three.js 0.184 + GSAP 3.15 + ECharts 6 + Vite 8

## 目录结构
```
src/
├── App.tsx        # 主组件：场景初始化 + HUD + 面板 + 管理入口
├── index.css      # CSS 变量体系 + 赛道风格 UI
└── main.tsx       # React 入口
```

## 核心流程
1. `useGSAP` 初始化 Three.js 场景、相机、灯光、地面
2. `GLTFLoader` 加载车身模型，创建 6 个 Hotspot 球体
3. `OrbitControls` 控制相机，`gsap.ticker` 驱动渲染循环
4. 点击 HUD 按钮 → `hotspotClick()` → GSAP 飞镜到目标视角 + 面板动画
5. 齿轮图标 → 管理员登录 → 新窗口打开管理后台

## 关键约定
- CSS 变量在 `:root` 中定义（`--bg`, `--surface`, `--accent` 等），组件不硬编码色值
- Three.js 资源在 `useGSAP` 的 cleanup 函数中 dispose
- GSAP timeline 用 `ref` 存储，unmount 时 `kill()`
- ECharts 实例用 `ref` 存储，`hot` 变化时先 `dispose()` 再 `init()`
- 视角覆盖数据从后端 API 获取（localhost:3000/api），API 不可用时 fallback 到 localStorage

## 组件树
```
App
├── Three.js 场景 (useGSAP)
│   ├── 模型加载 + Hotspots
│   └── OrbitControls + Ticker
├── HUD 按钮栏 (hud-bar)
│   ├── 6 个内置视角按钮
│   ├── 重置按钮
│   └── 齿轮图标（管理入口）
├── 注解面板 (annotation-panel)
├── 加载动画 (loading-overlay)
├── 管理员登录弹窗
└── 视角调整面板 (mgmt-panel)
```
