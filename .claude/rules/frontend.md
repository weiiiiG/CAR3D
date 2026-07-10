# 前端规则

当编辑 `src/` 目录下的文件时自动加载。

## Next.js 规范
- 使用 `npm run dev`（即 `next dev`）启动开发服务器
- 3D 场景页面使用 `'use client'` + `dynamic(() => import(), { ssr: false })`
- 管理后台页面使用 `'use client'`（admin 全是客户端交互）
- Three.js/GSAP/ECharts 组件必须禁用 SSR（`{ ssr: false }`）
- 字体在 `src/app/layout.tsx` 的 `<head>` 中加载（Google Fonts）
- **不要使用 `src/pages/` 目录名**（Next.js Pages Router 会误识别）。组件放在 `src/views/`，App Router 页面通过 `dynamic(() => import('@/views/...'))` 导入
- ToastCtx 在 `src/hooks/useToast.ts`，由 `app/admin/layout.tsx` 的 Provider 提供，子页面通过 `useToast()` 调用

## React 19 规范
- `useRef(null)` 返回 `RefObject<T | null>`，props 接口必须写 `| null`
- useEffect cleanup 必须释放所有资源（GSAP kill + 事件移除 + ECharts dispose + rAF cancel）
- cleanup 中引用的变量必须在 useEffect 顶层作用域定义，不能在异步回调（`.then()`）内定义
- 添加 `ErrorBoundary` 包裹可能抛出的组件，避免白屏崩溃

## SCSS Modules
- 所有 admin 组件 CSS 使用 `.module.scss` + CSS Modules（`import styles from './file.module.scss'`）
- 组件专属类名自动 hash 防冲突，页面布局类（`.stats-row`、`.charts-row` 等）用 `:global()` 保持全局
- 3D 场景样式在 `src/styles/` 下为全局 CSS，不与 admin 样式冲突

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

## 路由（Next.js App Router）
- `/` → `ScenePage`（3D 展示），`/admin/*` → `admin/layout.tsx` + 子页面
- 管理后台页面在 `src/app/admin/*/page.tsx`，通过 `dynamic` 导入 admin 组件
- 侧边栏导航用 `window.location.href = '/admin/' + id` 或 `next/navigation`
- 当前页检测用 `usePathname()` 提取路径

## 管理后台组件结构
```
src/app/admin/layout.tsx (AdminLayout — 侧边栏 + ToastCtx)
  └── children (page.tsx 内容)
       ├── /admin/dashboard → DashboardPage → StatsCard + ChartCard + PageHeader
       ├── /admin/views     → ViewsPage     → DataTable + AdminModal + PageHeader
       ├── /admin/data      → DataPage      → ChartCard + DataTable + PageHeader
       ├── /admin/users     → UsersPage     → DataTable + AdminModal + PageHeader
       └── /admin/settings  → SettingsPage  → SettingsGroup + PageHeader
```
- AdminLayout 提供 `ToastCtx`，子页面用 `useToast()` 调用
- API 调用直接用 `fetch('/api/...')`，无需代理配置

## GSAP 动画
- 所有 timeline/tween 用 ref 存储，cleanup 中 `kill()`
- 同一对象追赶动画用 `overwrite:'auto'`，不用 `killTweensOf` + 新对象
- 面板入场：rAF → fromTo 描边/内容/标签/delay 同步
- 车门/轮速用 `dTlRef` / `wsDataRef` 独立控制

## ECharts
- 3D 展示页：`hot` 变化时 `dispose()` → 350ms 延迟 → `init()` → `setOption(CO[hot])`
- 管理后台：`useEffect` 内 `init` + `setOption`，加 `window.addEventListener('resize', onResize)` 自适应
- **禁止在 chartConfig 中使用函数回调**，颜色用 `data: [{value, itemStyle:{color}}]`

## State 管理
- `hot` + `annOpen`：hot ≠ null 时自动展开抽屉
- `hotRef.current = hot` 在 render 体设置，用于 stale 动画守卫

## 注解抽屉
- `.ann-drawer` 定位 + `.ann-drawer-content` CSS transition 滑动 + `.ann-tab` 切换
- `.panel-close` 需 `pointer-events: auto` 穿透父级

## API
- 全部通过 Next.js API Routes，与前端同端口（`/api/*`）
- 管理后台返回：三重检测 `sessionStorage + URL params + document.referrer`
- overrides：`PUT /api/overrides/:key` upsert + `DELETE` 还原

## CSS 变量
`--bg: #0A0B10` `--surface: #14161E` `--accent: #FFBC0A` `--display: 'Bebas Neue'` `--sans: 'Inter'`

## 参考文档
- 需要查看 API 端点定义、请求体格式 → `docs/backend/api.md`
- 需要查看数据库字段定义 → `docs/backend/database.md`
- 需要项目全局信息 → `CLAUDE.md`
