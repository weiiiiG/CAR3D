# Hennessy Venom GT — 3D 展示项目

React 19 + Three.js 0.184 + GSAP 3.15 + ECharts 6 + Vite 8 前端 + NestJS 11 + Prisma 7 + PostgreSQL 18 后端管理系统。

## 快速启动

```bash
# 前端（终端 1）
cd D:/threejs/3D
npm run dev

# 后端（终端 2）
cd D:/threejs/3D/server
npm run start:dev

# 前端:     http://localhost:5180
# 管理后台: http://localhost:5180/admin.html
# API:      http://localhost:3000/api
默认用户: admin / 密码 123456（super_admin 角色）
```

## 目录结构

```
/3D/                          前端 (Vite + React + Three.js + GSAP + ECharts)
├── index.html                主入口 HTML（Bebas Neue / Inter / Noto Sans SC 字体）
├── vite.config.ts            Vite 配置（/api 代理 → localhost:3000 + /admin.html 重写）
├── src/
│   ├── main.tsx              React DOM 入口
│   ├── index.css             CSS 变量体系 + 赛道风格 UI（--bg / --surface / --accent）
│   ├── App.tsx               主组件：场景初始化 + 6视角热点 + HUD + 面板 + 认证入口
│   └── components/
│       ├── Scene.tsx          Three.js 场景核心（GLTF 模型加载 + OrbitControls + GSAP ticker）
│       ├── LoadingOverlay.tsx 加载过渡动画（logo + 进度条 + 文字逐行入场）
│       ├── HudBar.tsx         HUD 视角按钮栏（6个内置视角 + 重置 + 齿轮管理入口）
│       ├── AnnotationPanel.tsx 注解面板（SVG 描边入场 + 数字递增 + ECharts 图表）
│       ├── LoginModal.tsx    管理员 JWT 登录弹窗
│       ├── CapturePanel.tsx  3D 坐标捕获面板（?capture= 模式从 admin 跳转取景）
│       └── ViewManagerPanel.tsx 视角覆盖管理面板（CRUD overrides）
├── public/
│   └── admin.html            管理后台页面（完整 SPA，Dashboard / 视角 / 用户 / 车辆管理）
├── docs/                     文档体系
│   ├── frontend/{architecture,CLAUDE}.md
│   └── backend/{architecture,api,database,CLAUDE}.md
└── .claude/launch.json       Vite 启动配置（自动端口 5180）

/3D/server/                   后端 (NestJS + Prisma + PostgreSQL)
├── prisma/
│   └── schema.prisma         5 个模型：View / ViewOverride / DashboardConfig / MockVehicle / User
├── src/
│   ├── main.ts               NestJS 启动（端口 3000, CORS: 5173+5180, cookie-parser, ValidationPipe）
│   ├── app.module.ts         根模块（imports: Auth / Users / Views / Dashboard / MockVehicles / Prisma）
│   ├── prisma/               PrismaService @Global() 全局单例
│   ├── auth/                 JWT 双 token（access_token 15min 内存 + refresh_token 7天 HttpOnly Cookie）
│   ├── users/                用户 CRUD（super_admin / admin / user 三级 RBAC）
│   ├── dashboard/            仪表盘图表配置（数据库驱动，ECharts JSON 存储）
│   ├── views/                视角管理（CRUD + overrides 覆盖合并，返回 effectivePos/effectiveTarget）
│   ├── mock-vehicles/        Mock 车辆数据（12 台竞品车型对比）
│   ├── seed/                 初始化数据导入（6 视角 + 3 用户 + 12 车辆 + 仪表盘 + 覆盖）
│   └── @generated/           Prisma Client 生成代码
└── public/
    └── admin.html            管理后台源码（与前端 public/admin.html 独立，双入口）
```

## 默认用户

| 用户名 | 密码 | 角色 | 权限 |
|---|---|---|---|
| admin | 123456 | super_admin | 全部权限 + 用户管理 |
| editor | 123456 | admin | 视角 CRUD |
| viewer | 123456 | user | 仅查看 |

## 认证机制
- **Access Token**（15 分钟）：前端内存变量（`adminToken`），每个 API 请求通过 `Authorization: Bearer` 头发送
- **Refresh Token**（7 天）：HttpOnly + SameSite=Strict Cookie，只在 `/api/auth` 路径下传输，前端不可读
- **无感续期**：API 返回 401 时自动调用 `/api/auth/refresh`，Cookie 自动携带换取新 token
- **JWT Strategy**：`@nestjs/jwt` + `passport-jwt`，路由守卫用 `@UseGuards(JwtAuthGuard)`

## API 路径约定
- 3D 展示页和管理后台均使用**相对路径** `/api/*`，通过 Vite 代理转发到 `localhost:3000`
- 管理后台的 API 路径为 `/api`（非 `http://localhost:3000/api`），确保 Cookie 同域名生效
- 后端 CORS 允许 `localhost:5173` 和 `localhost:5180`

## 数据库模型（PostgreSQL 18 + Prisma 7）

| 表名 | 说明 | 关键字段 |
|---|---|---|
| views | 6 个内置视角（前脸/侧颜/座舱/内饰/鸥翼门/轮毂） + 自定义 | key(VARCHAR PK), posX/Y/Z, targetX/Y/Z, chartConfig(JSONB), sortOrder |
| view_overrides | 管理员覆盖的相机位置（upsert 语义） | viewKey(UNIQUE FK→views), posX/Y/Z, targetX/Y/Z (onDelete Cascade) |
| dashboard_config | 管理后台 ECharts 仪表盘配置（JSON 存储） | key(VARCHAR PK), data(JSON) |
| mock_vehicles | 12 台竞品车型对比数据 | name, brand, hp, torque, acceleration, topSpeed, engine, price 等 |
| users | 三级 RBAC 用户 | username(UNIQUE), password(bcrypt), role(VARCHAR) |

## 核心工作流
1. 页面加载 → Scene 组件初始化 Three.js（场景/相机/灯光/HDR环境贴图）→ GLTF 加载车身模型 → 创建 6 个 Hotspot 球体
2. OrbitControls 自由视角 + gsap.ticker 驱动渲染循环
3. 点击 HUD 按钮 → GSAP 飞镜到目标视角（power3.inOut 1.2s）+ AnnotationPanel SVG 描边动画 + ECharts 图表
4. 特殊视角：doors 触发车门 GSAP 动画 / wheels 触发轮速仪表动画
5. 齿轮图标 → LoginModal JWT 登录 → `location.href='/admin.html'` 跳转管理后台
6. 管理后台 `?capture=<key>` → 打开 3D 页面进入捕获模式 → 自由调整视角 → 保存坐标到 localStorage → admin 页面读取

## API 端点清单

### Auth
| 方法 | 路径 | 说明 |
|---|---|---|
| POST | /api/auth/login | 登录，返回 access_token + 设置 refresh_token HttpOnly Cookie |
| POST | /api/auth/refresh | 用 Cookie 中的 refresh_token 换取新的 access_token |
| POST | /api/auth/logout | 清除 refresh_token Cookie |
| GET | /api/auth/me | 获取当前用户信息（需 Bearer token） |

### Views & Overrides
| 方法 | 路径 | 说明 |
|---|---|---|
| GET | /api/views | 全量视角（含覆盖合并后的 effectivePos/effectiveTarget） |
| POST | /api/views | 新增视角 |
| PATCH | /api/views/:key | 更新视角字段 |
| DELETE | /api/views/:key | 删除视角（级联删除关联覆盖） |
| GET | /api/overrides | 所有覆盖记录 |
| PUT | /api/overrides/:viewKey | 设置/更新覆盖（upsert） |
| DELETE | /api/overrides/:viewKey | 删除覆盖（还原默认） |

### System
| 方法 | 路径 | 说明 |
|---|---|---|
| GET | /api/dashboard | 获取所有仪表盘图表配置 |
| GET | /api/mock-vehicles | 全量车辆数据 |
| GET | /api/users | 用户列表（需 super_admin） |
| POST | /api/seed | 重新导入所有初始数据 |

## 前端 CSS 变量体系
- `--bg`: 页面底色 `#0A0B10`
- `--surface`: 卡片/面板底色 `#14161E`
- `--accent`: 赛道黄 `#FFBC0A`
- `--display`: Bebas Neue 显示字体
- `--sans`: Inter 正文字体

## Git 提交格式
```
feat: 新功能 / fix: 修复 / docs: 文档更新 / chore: 构建/工具 / refactor: 重构
```

## 环境变量
| 文件 | 变量 | 说明 | 默认值 |
|---|---|---|---|
| server/.env | `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://postgres:123456@localhost:5432/car3d_admin` |
| server/.env | `JWT_SECRET` | JWT 签名密钥 | `car3d_jwt_secret_2026` |

`.env` 由 `server/src/main.ts` 中 `import 'dotenv/config'` 自动加载。

## 踩坑记录

### 前端
1. **API_BASE 必须用相对路径**：`const API_BASE = '/api'` 而非 `http://localhost:3000/api`，否则绕过 Vite 代理导致 CORS 和 Cookie 问题（`SameSite=Strict` 跨端口失效）。
2. **LoginModal 不能存 token 到 localStorage**：违反安全设计，access_token 应仅在内存中。管理后台靠 refresh_token cookie 自行换取新 token。
3. **ECharts 配置拒绝函数**：doors 柱状图的 `itemStyle.color` 回调函数无法序列化存入数据库 JSONB，改用 `data: [{value, itemStyle:{color}}]` 每项独立颜色。
4. **Scene 车门节点空安全**：如果 glTF 模型缺少 `door_lf_ok_0`/`door_rf_ok_1`，`dd[0]!.bq` 会崩溃。需加 `dd.length > 0` 守卫。
5. **CSS 变量不要重复声明**：`--accent-dim` 被声明了两次，后值覆盖前值，可能造成阅读困惑。
6. **React 19 RefObject 类型必须含 `| null`**：`useRef<HTMLDivElement>(null)` 返回 `RefObject<HTMLDivElement | null>`，组件接口必须写 `RefObject<HTMLDivElement | null>`，否则 `tsc -b` 构建失败（Vercel 部署常见）。

### 后端
1. **PrismaService 硬编码数据库密码**：忽略 `.env` 的 `DATABASE_URL`。修复：`new pg.Pool({ connectionString: process.env.DATABASE_URL })`。
2. **JWT 密钥硬编码**：`auth.module.ts` 和 `jwt.strategy.ts` 中 `secret` 应通过 `process.env.JWT_SECRET` 读取。
3. **reSeed 不完整**：只重置 views + mock_vehicles，漏掉 users 和 dashboard_config。
4. **管理后台登录页闪烁**：`window.onload` 先 `showLogin()` 再 refresh。修复：先 refresh，成功则 `buildSidebar()`，失败才 `showLogin()`。

@see docs/frontend/CLAUDE.md
@see docs/backend/CLAUDE.md
