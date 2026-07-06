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
1. `useEffect` 初始化 Three.js 场景、相机、灯光、地面
2. `GLTFLoader` 加载车身模型，创建 6 个 Hotspot 球体
3. `OrbitControls` 控制相机，`gsap.ticker` 驱动渲染循环
4. 点击 HUD 按钮 → `hotspotClick()` → GSAP 飞镜到目标视角 + 面板动画
5. 齿轮图标 → LoginModal → JWT 登录 → 同页面跳转 `/admin.html`

## 认证流程
1. 用户点击齿轮 → LoginModal 弹窗
2. 填写用户名密码 → `POST /api/auth/login` → 获取 access_token（内存） + refresh_token（HttpOnly Cookie）
3. 同页面跳转至 `/admin.html`
4. admin.html 启动时自动 `POST /api/auth/refresh` 尝试静默恢复
5. access_token 过期时（401）→ 自动调用 `/api/auth/refresh` 续期 → 重试请求
6. refresh_token 也过期 → 跳回登录页

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
├── 加载动画 (loading-overlay)
├── HUD 按钮栏 (hud-bar)
│   ├── 6 个内置视角按钮
│   ├── 重置按钮
│   └── 齿轮图标（管理入口）
├── 注解面板 (annotation-panel)
│   ├── 规格参数展示
│   └── ECharts 图表
├── 管理员登录弹窗 (login-modal)
├── 3D 坐标捕获面板 (capture-panel)
└── 视角调整面板 (mgmt-panel / view-manager)
```

## 捕获工作流 (Capture Workflow)

1. 管理后台点击「从 3D 场景获取坐标」→ 新窗口打开 `/?capture=<key>`
2. 前端检测到 `?capture` 参数 → 进入捕获模式（CapturePanel 显示）
3. 用户在 3D 场景中自由调整视角（OrbitControls）
4. 捕获面板实时显示 `cam.position` 坐标
5. 点击「确认保存」→ 坐标写入 `localStorage` → admin 页面轮询读取并填入表单
6. 点击「取消」→ 退出捕获模式，关闭窗口
