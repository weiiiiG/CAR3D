# Hennessy Venom GT — 3D 展示项目

Next.js 16 + Three.js 0.184 + GSAP 3.15 + ECharts 6 + Prisma 7 + PostgreSQL 18（前后端一体化）。

## 快速启动

```bash
# 启动开发服务器（vercel dev 模拟部署环境，支持 IAM 认证）
cd D:/threejs/3D && npm run dev          # → http://localhost:5180
# 同步数据库
npx prisma db push
# 初始化数据
curl -X POST http://localhost:5180/api/seed
```

默认用户: admin / 123456（super_admin）| editor / 123456（admin）| viewer / 123456（user）

## 目录结构

```
/3D/                      (Next.js 16 全栈项目)
├── src/
│   ├── app/
│   │   ├── page.tsx                 3D 展示页（Client Component）
│   │   ├── layout.tsx               Root Layout（字体 + 全局样式）
│   │   ├── globals.css              样式入口（import styles/*）
│   │   ├── admin/
│   │   │   ├── layout.tsx           管理后台布局（侧边栏 + ToastCtx）
│   │   │   ├── page.tsx             重定向到 /admin/dashboard
│   │   │   ├── dashboard/page.tsx   仪表盘 ECharts
│   │   │   ├── views/page.tsx       视角 CRUD
│   │   │   ├── data/page.tsx        Mock 数据图表/表格
│   │   │   ├── users/page.tsx       用户管理
│   │   │   └── settings/page.tsx    设置
│   │   └── api/                     Next.js API Routes
│   │       ├── auth/login/route.ts   JWT 登录
│   │       ├── auth/refresh/route.ts Token 刷新
│   │       ├── auth/logout/route.ts  登出
│   │       ├── auth/me/route.ts      当前用户
│   │       ├── views/route.ts        视角 CRUD
│   │       ├── overrides/route.ts    覆盖管理
│   │       ├── dashboard/route.ts    仪表盘配置
│   │       ├── mock-vehicles/route.ts 竞品车辆
│   │       ├── users/route.ts        用户 CRUD
│   │       └── seed/route.ts         数据初始化
│   ├── views/
│   │   ├── ScenePage.tsx            3D 展示页（Three.js/GSAP/ECharts）
│   │   └── admin/                   Admin 页面组件（非路由，由 app/ 层 dynamic import）
│   ├── components/                  通用 React 组件
│   ├── hooks/                       自定义 Hooks
│   ├── data/views.ts                HI/CO/BUILTIN_VIEWS/DEF
│   ├── styles/                      CSS 模块（variables/viewer/loading/hud/annotation/mgmt）
│   ├── lib/                         服务端工具
│   │   ├── prisma.ts                Prisma Client 单例
│   │   └── auth.ts                  JWT + bcrypt 工具函数
│   └── generated/                   Prisma Client 生成代码
├── prisma/schema.prisma             5 模型
├── vercel.json                      Vercel 构建配置（--include=dev）
├── .env                             环境变量
└── docs/backend/{api.md,database.md}
```

## 认证机制
- **Access Token**（15 分钟）：前端内存变量（`adminToken`），每个 API 请求 `Authorization: Bearer` 头发送
- **Refresh Token**（7 天）：HttpOnly + SameSite=Strict Cookie，路径 `/api/auth`，前端不可读
- **无感续期**：API 返回 401 时自动调用 `/api/auth/refresh`，Cookie 自动携带换取新 token
- **后端 JWT**：`src/lib/auth.ts`，`jsonwebtoken` 直接验证（无 Passport）
- 管理后台启动时先尝试 refresh 恢复会话，成功则直接进仪表盘，失败才显示登录页

## API 路径
- 所有端点通过 Next.js API Routes 处理（`/api/*`），与前端同端口 5180
- `POST /api/seed` 重新导入全部初始数据（6 视角 + 12 车辆 + 3 用户 + 仪表盘）

## 核心工作流
1. 页面加载 → LoadingOverlay 入场 → Three.js 场景初始化 → GLTF 加载车身
2. **首次访问**：进度环 GSAP 独立 0→100（2.5s power1.inOut，延迟 0.75s 与环入场同步）→ 模型加载完成尾迹 0.35s 收尾 → 环绕运镜 4.5s → 飞镜到默认 3/4 视图
3. **管理后台返回**（检测 `sessionStorage admin_return` / `?capture=` / `document.referrer` 含 admin）：跳过运镜直飞默认视角
4. 点击 HUD → GSAP 飞镜 1.2s + 注解面板抽屉滑入 + SVG 描边动画 + ECharts 图表
5. doors/ wheels 特殊视角触发车门开关/轮速仪表 GSAP 动画
6. 齿轮 → LoginModal → JWT 登录 → `window.location.href = '/admin'`
7. 管理后台 Next.js App Router：仪表盘/视角管理/数据概览/用户管理/设置
8. `?capture=<key>` → ScenePage 捕获模式 → 自由调整 → PUT `/api/overrides/:key` 保存 → 跳回 `/admin`

## 前端 CSS 变量体系
`--bg: #0A0B10` | `--surface: #14161E` | `--accent: #FFBC0A` | `--display: 'Bebas Neue'` | `--sans: 'Inter'`

## 环境变量
`.env` 文件（Next.js 自动加载）:
```
DATABASE_URL=postgresql://postgres:123456@localhost:5432/car3d_admin
JWT_SECRET=car3d_jwt_secret_2026

# AWS RDS IAM 认证（部署时使用）
PGHOST=aws-apg-cyan-kite.cluster-xxx.rds.amazonaws.com
PGPORT=5432
PGUSER=postgres
PGDATABASE=postgres
AWS_REGION=us-east-1
AWS_ROLE_ARN=arn:aws:iam::461073513124:role/Vercel/access-apg-cyan-kite
```
- 本地开发：Prisma 使用 `DATABASE_URL` 直连本地 PostgreSQL
- 部署（Vercel）：Prisma 检测到 `PGHOST` 存在时自动切换 AWS RDS IAM 认证
  - `@aws-sdk/rds-signer` 通过 OIDC 获取临时 token
  - `@vercel/functions/oidc` 提供 AWS 凭据
  - token 每 15 分钟自动刷新

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
10. **chart-card overflow 裁切图表**：管理后台 CSS 类名与 3D 场景冲突。修复：admin 组件使用 SCSS Modules 自动 hash。
11. **useEffect cleanup 变量作用域**：`const onResize` 定义在 `.then()` 回调内但 cleanup 引用不到。修复：变量提升到 useEffect 顶层。
12. **ErrorBoundary**：添加 `ErrorBoundary` 组件捕获渲染错误，避免白屏崩溃。
13. **Three.js SSR 兼容**：Next.js 下 Three.js/GSAP/ECharts 需 `dynamic(() => import(...), { ssr: false })` 禁用 SSR，否则 `window is not defined`。
14. **Prisma + Next.js 集成**：Prisma 7 需要显示 `output` 路径，导入用 `../generated/client`。
15. **TypeScript 版本兼容**：Next.js 16 不兼容 TypeScript 7.x，需锁定 5.x。`erasableSyntaxOnly` 为 TS7 独有选项，TS5 下需移除。
16. **Vercel 构建依赖**：`typescript` 和 `@types/*` 需放在 `dependencies` 而非 `devDependencies`，否则 Vercel 可能跳过安装导致构建失败。`prisma` 留在 `devDependencies`，通过 `vercel.json` 的 `installCommand: "npm install --include=dev"` 确保安装。
17. **src/views/ 而非 src/pages/**：不要使用 `src/pages/` 目录名，Next.js Pages Router 会将其识别为路由页面。Admin 页面组件放在 `src/views/admin/`，由 `src/app/admin/*/page.tsx` 通过 `dynamic` 导入。
18. **禁止设置 NODE_ENV**：在 Vercel 项目设置或 `.env` 中手动设置 `NODE_ENV=production` 会导致 `next build` 异常（Next.js 自身管理 `NODE_ENV`，外部覆盖会破坏构建行为）。如需区分环境，使用自定义变量如 `APP_ENV`。

### 后端（Next.js API Routes）
1. **Prisma Client 单例**：`globalThis` 缓存防止开发热重载创建多个连接。
2. **JWT 密钥**：`process.env.JWT_SECRET`，`.env` 文件 Next.js 自动加载。
3. **reSeed 完整**：deleteMany 覆盖全部 5 表，chartConfig 不能含 Function。
4. **Refresh Cookie**：HttpOnly + SameSite=Strict + Path=/api/auth，API Route 中手动解析 `cookie` header。
5. **路由参数**：Next.js 15+ 使用 `params: Promise<{key: string}>` 异步解析。
6. **AWS RDS IAM 认证**：Prisma 通过 `@prisma/adapter-pg` + pg.Pool 连接。部署时用 `@aws-sdk/rds-signer` 获取临时 token（15 分钟有效），开发时用 `DATABASE_URL` 直连。`src/lib/prisma.ts` 中 `createPool()` 根据 `PGHOST` 环境变量自动切换。

@see docs/backend/api.md
@see docs/backend/database.md
