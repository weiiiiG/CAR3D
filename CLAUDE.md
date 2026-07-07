# Hennessy Venom GT — 3D 展示项目

React 19 + Three.js 0.184 + GSAP 3.15 + ECharts 6 + Vite 8 前端 + NestJS 11 + Prisma 7 + PostgreSQL 18 后端管理系统。

## 快速启动

```bash
# 前端（终端 1）
cd D:/threejs/3D && npm run dev          # → http://localhost:5180
# 后端（终端 2）
cd D:/threejs/3D/server && npm run start:dev # → http://localhost:3000
# 管理后台
# http://localhost:5180/admin（同一 React 应用内路由）
```

默认用户: admin / 123456（super_admin）| editor / 123456（admin）| viewer / 123456（user）

## 目录结构

```
/3D/                      前端 (Vite 8)
├── src/
│   ├── App.tsx           路由：/ → 3D 场景，/admin/* → 管理后台
│   ├── index.css         样式入口（import styles/*）
│   ├── main.tsx          React DOM 入口
│   ├── data/views.ts    HI(描述)/CO(图表配置)/BUILTIN_VIEWS/DEF
│   ├── styles/           CSS 模块（variables/viewer/loading/hud/annotation/mgmt）
│   ├── hooks/            useAdminAuth(认证+API) + AuthContext
│   ├── pages/
│   │   ├── ScenePage.tsx 3D 展示页（原 App.tsx SceneApp）
│   │   └── admin/        管理后台路由页面（Dashboard/Views/Data/Users/Settings/Login）
│   └── components/
│       ├── Scene.tsx     Three.js 引擎
│       ├── LoadingOverlay.tsx/HudBar.tsx/AnnotationPanel.tsx
│       ├── LoginModal.tsx/CapturePanel.tsx/ViewManagerPanel.tsx
│       ├── ErrorBoundary.tsx
│       └── admin/        Sidebar/StatsCard/ChartCard/DataTable/AdminModal/
│                         PageHeader/SettingsGroup + 各组件 CSS
├── public/
└── docs/backend/{api.md,database.md}

/3D/server/               后端 (NestJS 11)
├── prisma/schema.prisma   5 模型
├── src/{auth/users/views/dashboard/mock-vehicles/seed/prisma}
└── docs/backend/{api.md,database.md}
```

## 认证机制
- **Access Token**（15 分钟）：前端内存变量（`adminToken`），每个 API 请求 `Authorization: Bearer` 头发送
- **Refresh Token**（7 天）：HttpOnly + SameSite=Strict Cookie，前端不可读
- **无感续期**：`useAdminAuth` hook 自动处理 401 → refresh → 重试
- 管理后台启动时先尝试 refresh 恢复会话，成功则直接进仪表盘，失败才显示登录页
- `AuthContext` 提供 `authFetch` 给子页面组件（UserPage 等需要认证的 API）

## API 路径约定
- 所有前端用 **相对路径** `/api/*`，通过 Vite 代理 → `localhost:3000`。不可硬编码 `http://localhost:3000/api`
- 后端 CORS 允许 `localhost:5173` 和 `localhost:5180`，启用 `credentials: true`

## 核心工作流
1. 页面加载 → LoadingOverlay 入场 → Three.js 场景初始化 → GLTF 加载车身
2. **首次访问**：进度环 GSAP 独立 0→100（2.5s power1.inOut，延迟 0.75s 与环入场同步）→ 模型加载完成尾迹 0.35s 收尾 → 环绕运镜 4.5s → 飞镜到默认 3/4 视图
3. **管理后台返回**（检测 `sessionStorage admin_return` / `?capture=` / `document.referrer` 含 admin）：跳过运镜直飞默认视角
4. 点击 HUD → GSAP 飞镜 1.2s + 注解面板抽屉滑入 + SVG 描边动画 + ECharts 图表
5. doors/ wheels 特殊视角触发车门开关/轮速仪表 GSAP 动画
6. 齿轮 → LoginModal → JWT 登录 → `window.location.href = '/admin'`
7. 管理后台 `/admin/*` 路由（react-router-dom）：仪表盘/视角管理/数据概览/用户管理/设置
8. `?capture=<key>` → ScenePage 捕获模式 → 自由调整 → PUT `/api/overrides/:key` 保存 → 跳回 `/admin`

## 路由结构
| 路径 | 组件 | 说明 |
|---|---|---|
| `/` | `ScenePage` | 3D 展示页 |
| `/admin/*` | `AdminApp`(useAdminAuth) → `AdminLayout` → `<Routes>` | 管理后台 |
| `/admin/dashboard` | `DashboardPage` | 仪表盘 ECharts |
| `/admin/views` | `ViewsPage` | 视角 CRUD |
| `/admin/data` | `DataPage` | Mock 数据图表/表格 |
| `/admin/users` | `UsersPage` | 用户管理（super_admin） |
| `/admin/settings` | `SettingsPage` | 设置 |

## 前端 CSS 变量体系
`--bg: #0A0B10` | `--surface: #14161E` | `--accent: #FFBC0A` | `--display: 'Bebas Neue'` | `--sans: 'Inter'`

## 环境变量
`server/.env`: `DATABASE_URL=postgresql://postgres:123456@localhost:5432/car3d_admin` | `JWT_SECRET=car3d_jwt_secret_2026`

## Git 提交格式
`feat:` / `fix:` / `docs:` / `chore:` / `refactor:`

## 踩坑记录

### 前端
1. **进度环解耦 XHR**：浏览器缓存让 XHR 瞬间 100%。修复：GSAP 独立 0→100 动画，XHR 仅控制步骤文字。
2. **GSAP 回跳**：`tryPlay` kill 主 tween 后用新对象追赶，舍入偏差回跳。修复：`overwrite:'auto'` 同一对象。
3. **进度环起点方向**：`rotate(-90deg)` + 水平镜像起点在底部。修复：垂直镜像 `matrix(1 0 0 -1 0 100)` 顶部逆时针。
4. **极速切换视角面板数字错乱**：旧 proxy tween onUpdate 用旧闭包改文本。修复：`hotRef` 守卫 + rAF cleanup。
5. **管理后台返回运镜检测**：仅 sessionStorage 不可靠。修复：三重检测 `sessionStorage + URL + document.referrer`。
6. **pointer-events:none 阻塞关闭按钮**：SVG 面板容器阻塞 × 按钮。修复：`.panel-close { pointer-events: auto }`。
7. **数据库 chartConfig 覆盖前端硬编码**：API 旧英文数据覆盖中文配置。修复：PATCH 更新数据库中文数据。
8. **React 19 RefObject**：`useRef(null)` 返回 `RefObject<T | null>`，组件接口必须写 `| null`。
9. **HDRLoader 替代 RGBELoader**：Three.js 0.184 不需要 PMREMGenerator，`loader.load()` 设 `mapping` 即可。
10. **chart-card overflow 裁切图表**：chart-box(240px) 比父容器 chart-card(200px) 大，溢出被 hidden 裁切。修复：chart-card 加 `height:100%; min-height:0; overflow:visible`，chart-box 加 `min-height:0`。
11. **useEffect cleanup 变量作用域**：`const onResize` 定义在 `.then()` 回调内但在 cleanup 中引用，React StrictMode 双次 effect 导致 ReferenceError。修复：变量提升到 useEffect 顶层，不在异步回调内定义 cleanup 需要的引用。
12. **ErrorBoundary**：添加 `ErrorBoundary` 组件捕获渲染错误，避免白屏崩溃。

### 后端
1. **PrismaService 硬编码密码** → `new pg.Pool({ connectionString: process.env.DATABASE_URL })`。
2. **JWT 密钥硬编码** → `process.env.JWT_SECRET`。
3. **reSeed 不完整** → deleteMany 覆盖全部 5 表。
4. **管理后台登录闪烁** → 先 refresh 再 showLogin。
5. **class-validator 版本**：0.14+ 含 ESM-only 依赖，锁定 0.15.x。
6. **Prisma 7 Driver Adapter**：必须 `@prisma/adapter-pg` + `pg.Pool`。
7. **chartConfig 不能含 Function**：ECharts 回调无法 JSONB 序列化。

@see docs/backend/api.md
@see docs/backend/database.md
