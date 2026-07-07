# 前端规则

当编辑 `src/` 目录下的文件时自动加载。

## React 19 规范
- `useRef(null)` 返回 `RefObject<T | null>`，props 接口必须写 `| null`
- useEffect cleanup 必须释放所有资源（GSAP kill + 事件移除 + ECharts dispose + rAF cancel）
- cleanup 中引用的变量必须在 useEffect 顶层作用域定义，不能在异步回调（`.then()`）内定义
- 添加 `ErrorBoundary` 包裹可能抛出的组件，避免白屏崩溃

## Three.js 场景（Scene.tsx）
- 场景初始化在 `useEffect` 中，cleanup 需：
  - `gsap.ticker.remove(tick)` + `ctrl.dispose()` + `re.dispose()`
  - 遍历 `scene.traverse` 释放 geometry/material，注意 `Array.isArray(material)`
  - 移除 `window.addEventListener('resize')` 和 `pointerdown` 监听
  - `gsap.killTweensOf()` 所有动画对象 + `gsap.killTweensOf(progObj)`
  - 设置 `disposed=true` 守卫异步回调
- HDR 环境：`HDRLoader.load()` 设 `mapping = EquirectangularReflectionMapping`，无需 PMREMGenerator
- 阴影：`PCFShadowMap` + 2048² mapSize + 紧贴 shadow.camera frustum
- 地面：Canvas 径向渐变纹理，背景层 + 反射层 + 软阴影圈三层叠加

## 路由（react-router-dom）
- `/` → `ScenePage`（3D 展示），`/admin/*` → `AdminApp`（管理后台）
- 管理后台用嵌套 `<Routes>`：dashboard/views/data/users/settings
- 侧边栏导航用 `navigate('/admin/' + id)` 绝对路径，防止路径叠加
- 当前页检测用 `location.pathname.replace(/^\/admin\//, '')`

## 管理后台组件结构
```
AdminApp (useAdminAuth → AuthCtx.Provider)
  └── AdminLayout (toast + sidebar + .main)
       └── <Routes>
            ├── DashboardPage → StatsCard + ChartCard + PageHeader
            ├── ViewsPage     → DataTable + AdminModal + PageHeader
            ├── DataPage      → ChartCard + DataTable + PageHeader
            ├── UsersPage     → DataTable + AdminModal + PageHeader (authFetch)
            └── SettingsPage  → SettingsGroup + PageHeader
```
- `AdminLayout` 提供 `ToastCtx`，子页面用 `useToast()` 调用
- 认证 API 用 `AuthCtx` 的 `authFetch`（自动带 token + refresh）

## GSAP 动画
- 所有 timeline/tween 用 ref 存储，cleanup 中 `kill()`
- 同一对象追赶动画用 `overwrite:'auto'`，不用 `killTweensOf` + 新对象
- 面板入场：rAF → fromTo 描边/内容/标签/delay 同步
- 车门/轮速用 `dTlRef` / `wsDataRef` 独立控制

## ECharts
- 3D 展示页：`hot` 变化时 `dispose()` → 350ms 延迟 → `init()` → `setOption(CO[hot])`
- 管理后台：`useEffect` 内 `init` + `setOption`，加 `window.addEventListener('resize', onResize)` 自适应
- chart-box 容器需 `min-height: 0; height: 280px` 确保 grid 不裁切
- **禁止在 chartConfig 中使用函数回调**，颜色用 `data: [{value, itemStyle:{color}}]`

## State 管理
- `hot` + `annOpen`：hot ≠ null 时自动展开抽屉
- 切换视角：`setHot(null)` 触发卸载 → `onComplete(()=>setHot(key))`
- `hotRef.current = hot` 在 render 体设置，用于 stale 动画守卫
- overrides 从 API 拉取 → `setOverrides` → `allViews.current` 合并

## 注解抽屉
- `.ann-drawer` 定位 + `.ann-drawer-content` CSS transition 滑动 + `.ann-tab` 切换
- `.panel-close` 需 `pointer-events: auto` 穿透父级
- 左侧视图（wheels）：`.drawer-left` 类切换

## API
- 全部用相对路径 `/api/*`，通过 Vite 代理转发
- 管理后台返回：三重检测 `sessionStorage + URL params + document.referrer`
- overrides：`PUT /api/overrides/:key` upsert + `DELETE` 还原
- 用户 CRUD 等需要 token 的 API 通过 `authFetch()`（来自 AuthContext）

## CSS 变量
`--bg: #0A0B10` `--surface: #14161E` `--accent: #FFBC0A` `--display: 'Bebas Neue'` `--sans: 'Inter'`

## 参考文档
- 需要查看 API 端点定义、请求体格式 → `docs/backend/api.md`
- 需要查看数据库字段定义 → `docs/backend/database.md`
- 需要项目全局信息 → `CLAUDE.md`
