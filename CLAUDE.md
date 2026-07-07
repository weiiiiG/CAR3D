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
│   ├── App.tsx           主组件：状态管理 + 6 视角切换 + 入场动画
│   ├── index.css         CSS 变量体系 + 赛道风格 UI（--bg / --surface / --accent）
│   ├── main.tsx          React DOM 入口
│   ├── styles/           CSS 模块（variables/viewer/loading/hud/annotation/mgmt/admin）
│   ├── hooks/            自定义 hooks（useAdminAuth）
│   ├── pages/
│   │   └── admin/        管理后台页面组件（Dashboard/Views/Data/Users/Settings/Login）
│   └── components/
│       ├── Scene.tsx     Three.js 引擎：GLTF 模型/HDR/OrbitControls/地面融合/阴影
│       ├── LoadingOverlay.tsx  加载环（SVG 逆时针 GSAP 独立动画）+ 标题入场
│       ├── HudBar.tsx    HUD 按钮栏（6 视角 + 重置 + 管理员入口齿轮）
│       ├── AnnotationPanel.tsx  注解侧边抽屉（描边入场 + 数字递增 + ECharts）
│       ├── LoginModal.tsx      JWT 登录弹窗
│       ├── CapturePanel.tsx    3D 坐标捕获（?capture= 模式 → API 保存）
│       └── ViewManagerPanel.tsx 视角覆盖 CRUD 面板
├── public/
└── docs/
    ├── frontend/CLAUDE.md   前端专项规范
    └── backend/{CLAUDE.md,api.md,database.md}

/3D/server/               后端 (NestJS 11)
├── prisma/schema.prisma   5 模型：View/ViewOverride/DashboardConfig/MockVehicle/User
├── src/
│   ├── auth/             JWT 双 token（access_token 15min + refresh_token 7d HttpOnly Cookie）
│   ├── users/            用户 CRUD（super_admin/admin/user 三级 RBAC）
│   ├── views/            视角 CRUD + overrides 合并（返回 effectivePos/effectiveTarget）
│   ├── dashboard/        仪表盘图表配置（ECharts JSON 存储）
│   ├── mock-vehicles/    12 台竞品车型数据
│   ├── seed/             初始化数据（6 视角 + 12 车辆 + 3 用户 + 仪表盘）
│   └── prisma/           PrismaService @Global() 单例
├── src/                  管理后台（React 组件，同一应用内路由）
└── docs/backend/{CLAUDE.md,api.md,database.md}
```

## 认证机制
- **Access Token**（15 分钟）：前端内存变量（`adminToken`），每个 API 请求 `Authorization: Bearer` 头发送
- **Refresh Token**（7 天）：HttpOnly + SameSite=Strict Cookie，前端不可读
- **无感续期**：API 返回 401 时自动调用 `/api/auth/refresh`，Cookie 自动携带换取新 token
- 管理后台启动时先尝试 refresh 恢复会话，成功则直接进仪表盘，失败才显示登录页

## API 路径约定
- 所有前端用 **相对路径** `/api/*`，通过 Vite 代理 → `localhost:3000`。不可硬编码 `http://localhost:3000/api`
- 后端 CORS 允许 `localhost:5173` 和 `localhost:5180`，启用 `credentials: true`

## 核心工作流
1. 页面加载 → LoadingOverlay 入场 → Three.js 场景初始化 → GLTF 加载车身
2. **首次访问**：进度环 GSAP 独立 0→100（2.5s power1.inOut，延迟 0.75s 与环入场同步）→ 模型加载完成尾迹 0.35s 收尾 → 环绕运镜 4.5s → 飞镜到默认 3/4 视图
3. **管理后台返回**（检测 `sessionStorage admin_return` / `?capture=` / `document.referrer` 含 admin）：跳过运镜直飞默认视角
4. 点击 HUD → GSAP 飞镜 1.2s + 注解面板抽屉滑入 + SVG 描边动画 + ECharts 图表
5. doors/ wheels 特殊视角触发车门开关/轮速仪表 GSAP 动画
6. 齿轮 → LoginModal → JWT 登录 → 跳转管理后台
7. 管理后台 `?capture=<key>` → 3D 页面捕获模式 → 自由调整 → PUT `/api/overrides/:key` 保存

## 前端 CSS 变量体系
`--bg: #0A0B10` | `--surface: #14161E` | `--accent: #FFBC0A` | `--display: 'Bebas Neue'` | `--sans: 'Inter'`

## 环境变量
| 文件 | 变量 | 说明 | 默认值 |
|---|---|---|---|
| server/.env | `DATABASE_URL` | PostgreSQL 连接 | `postgresql://postgres:123456@localhost:5432/car3d_admin` |
| server/.env | `JWT_SECRET` | JWT 签名密钥 | `car3d_jwt_secret_2026` |

`.env` 由 `server/src/main.ts` 中 `import 'dotenv/config'` 自动加载。

## Git 提交格式
`feat:` 新功能 / `fix:` 修复 / `docs:` 文档 / `chore:` 构建/工具 / `refactor:` 重构

## 踩坑记录

### 前端
1. **进度环解耦 XHR**：浏览器缓存让 XHR 瞬间 100%，环跳到 90+。修复：GSAP 独立动画 0→100，XHR 仅控制步骤文字。
2. **GSAP 回跳**：`tryPlay` 中 kill 主 tween 后用新对象追赶，舍入偏差导致 100→70 回跳。修复：`overwrite:'auto'` 直接操作同一对象。
3. **进度环起点方向**：`rotate(-90deg)` + 水平镜像起点在底部。修复：垂直镜像 `matrix(1 0 0 -1 0 100)`，顶部逆时针。
4. **极速切换视角面板数字错乱**：旧 proxy tween 的 onUpdate 用旧闭包改写文本。修复：`hotRef` 守卫 + rAF cleanup。
5. **管理后台返回运镜检测**：仅 sessionStorage 不可靠。修复：三重检测 `sessionStorage` + `URL` + `document.referrer`。
6. **pointer-events:none 阻塞关闭按钮**：SVG 面板容器阻塞 × 按钮。修复：`.panel-close { pointer-events: auto }`。
7. **数据库 chartConfig 覆盖前端硬编码**：API 拉取旧英文数据覆盖中文配置。修复：PATCH 更新数据库为正确中文数据。
8. **React 19 RefObject 类型**：`useRef(null)` 返回 `RefObject<T | null>`，组件接口必须写 `| null`。
9. **HDRLoader 替代 RGBELoader**：Three.js 0.184 不需要 PMREMGenerator，直接 `loader.load()` 设 `mapping = EquirectangularReflectionMapping`。

### 后端
1. **PrismaService 硬编码密码**：忽略 `.env`。修复：`new pg.Pool({ connectionString: process.env.DATABASE_URL })`。
2. **JWT 密钥硬编码**：`auth.module.ts` / `jwt.strategy.ts` 需读 `process.env.JWT_SECRET`。
3. **reSeed 不完整**：只重置 views + mock_vehicles，漏 users + dashboard_config。
4. **管理后台登录页闪烁**：先 refresh 再 showLogin。
5. **class-validator ESM 兼容**：0.14+ 依赖 ESM-only 包，锁定 0.15.x。
6. **Prisma 7 Driver Adapter**：必须 `@prisma/adapter-pg` + `pg.Pool`，不能直接 `datasource.url`。
7. **chartConfig 不能含 Function**：ECharts 回调函数无法 JSONB 序列化，用 `data: [{value, itemStyle:{color}}]`。

@see docs/backend/api.md
@see docs/backend/database.md
