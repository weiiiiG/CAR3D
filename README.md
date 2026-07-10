# Hennessy Venom GT — 3D 交互式汽车展示系统

[![Tech Stack](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)]()
[![Tech Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react)]()
[![Tech Stack](https://img.shields.io/badge/Three.js-0.184-000000?logo=three.js)]()
[![Tech Stack](https://img.shields.io/badge/GSAP-3.15-88CE02?logo=greensock)]()
[![Tech Stack](https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql)]()

> Hennessey Venom GT 的沉浸式 3D 展示页面，结合 **Three.js** 实时渲染、**GSAP** 电影级动画、**ECharts** 数据可视化与 **Next.js + Prisma** 全栈架构。支持 6 个热点视角漫游、管理员后台、视角自定义覆盖。

![Preview](https://img.shields.io/badge/3D-Hennessy_Venom_GT-FFBC0A?style=for-the-badge)

---

## ✨ 功能亮点

- **🖥️ 3D 实时渲染** — Three.js 构建的完整 3D 场景（模型加载、HDR 环境贴图、四灯照明、阴影系统）
- **🎬 GSAP 电影动画** — 加载进场 → 相机飞镜 → SVG 描边 → 数字递增轮播
- **📊 ECharts 数据面板** — 6 个视角各自绑定专属图表（雷达图/柱状图/饼图/折线图/仪表盘）
- **🎯 6 大热点视角** — 前脸、侧颜、座舱、内饰、鸥翼门、轮毂，一键跳转
- **🚪 特殊交互动画** — 车门开启动画、轮毂旋转模拟
- **🔐 JWT 双 Token 认证** — Access Token（内存）+ Refresh Token（HttpOnly Cookie），无感续期
- **🛠️ 管理后台** — Dashboard 仪表盘、视角 CRUD、视角覆盖（override）、用户管理、竞品车辆管理
- **📷 3D 坐标捕获** — 在 3D 场景中自由调整视角，捕获相机坐标保存到管理后台

---

## 🏗️ 技术栈

| 前端 | 后端 |
|---|---|
| **Next.js 16** (App Router) | **Prisma 7** ORM |
| **React 19** + TypeScript | **PostgreSQL** 18 |
| **Three.js** 0.184 | **JWT** (jsonwebtoken) |
| **GSAP** 3.15 | **pg** (node-postgres) |
| **ECharts** 6 | **bcryptjs** |

---

## 🚀 快速启动

### 前置条件

- Node.js >= 20
- Neon PostgreSQL（免费注册 https://neon.tech）
- npm

### 1. 数据库配置

创建 Neon 项目，从 Dashboard 获取 `DATABASE_URL`，写入 `.env`：

```env
DATABASE_URL="你的Neon连接字符串?sslmode=require"
JWT_SECRET=car3d_jwt_secret_2026
```

### 2. 安装依赖

```bash
npm install
npx prisma generate
npx prisma db push
```

### 3. 初始化数据

```bash
curl -X POST http://localhost:5180/api/seed
```

此命令导入：6 个默认视角 + 3 个默认用户 + 12 台竞品车辆 + Dashboard 配置。

### 4. 启动

```bash
npm run dev
# 前端 + API → http://localhost:5180
# 管理后台 → http://localhost:5180/admin
```

### 5. 访问地址

| 页面 | 地址 | 说明 |
|---|---|---|
| 3D 展示页 | `http://localhost:5180` | 主展示页面 |
| 管理后台 | `http://localhost:5180/admin` | 同一应用内路由 |
| API 端点 | `http://localhost:5180/api` | Next.js API Routes |

---

## 🌐 部署到 Vercel + Neon

本项目前后端一体，可一键部署到 Vercel，搭配 Neon 云数据库：

### 1. 创建 Neon 数据库

1. 注册 https://neon.tech
2. 创建项目，复制 `DATABASE_URL`（带 `?sslmode=require` 后缀）

### 2. 配置 Vercel 环境变量

在 Vercel 项目 → **Settings → Environment Variables** 中添加：

| 变量 | 值 |
|---|---|
| `DATABASE_URL` | Neon 连接字符串（含 `?sslmode=require`） |
| `JWT_SECRET` | `car3d_jwt_secret_2026` |

### 3. 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 后续更新：推送到 GitHub 自动触发
git push
```

### 4. 初始化数据

部署完成后，访问 `/api/seed`（POST）填充初始数据：

```bash
curl -X POST https://你的项目.vercel.app/api/seed
```

## 👤 默认用户

| 用户名 | 密码 | 角色 | 权限 |
|---|---|---|---|
| **admin** | 123456 | super_admin | 全部权限 + 用户管理 |
| editor | 123456 | admin | 视角 CRUD |
| viewer | 123456 | user | 仅查看 |

---

## 📁 项目结构

```
D:/threejs/3D/
├── src/
│   ├── app/
│   │   ├── page.tsx                       # 3D 展示页
│   │   ├── layout.tsx                     # Root Layout（字体 + 样式）
│   │   ├── globals.css                    # 全局样式入口
│   │   ├── admin/                         # 管理后台页面
│   │   │   ├── layout.tsx                 # 后台布局（侧边栏）
│   │   │   ├── dashboard/page.tsx         # 仪表盘
│   │   │   ├── views/page.tsx             # 视角管理
│   │   │   ├── data/page.tsx              # 数据概览
│   │   │   ├── users/page.tsx             # 用户管理
│   │   │   └── settings/page.tsx          # 设置
│   │   └── api/                           # 后端 API Routes
│   │       ├── auth/login/route.ts        # JWT 登录
│   │       ├── auth/refresh/route.ts      # Token 刷新
│   │       ├── auth/logout/route.ts       # 登出
│   │       ├── auth/me/route.ts           # 当前用户
│   │       ├── views/route.ts             # 视角 CRUD
│   │       ├── overrides/route.ts         # 覆盖管理
│   │       ├── dashboard/route.ts         # 仪表盘配置
│   │       ├── mock-vehicles/route.ts     # 竞品车辆
│   │       ├── users/route.ts             # 用户 CRUD
│   │       └── seed/route.ts              # 数据初始化
│   ├── views/                            # 页面组件（非路由，被 app/ dynamic import）
│   │   ├── ScenePage.tsx                 # 3D 场景页
│   │   └── admin/                        # 管理后台各页面组件
│   │       ├── DashboardPage.tsx
│   │       ├── ViewsPage.tsx
│   │       ├── DataPage.tsx
│   │       ├── UsersPage.tsx
│   │       └── SettingsPage.tsx
│   ├── components/                        # 通用组件（Scene/HudBar/AnnotationPanel/LoadingOverlay + admin/ 子组件）
│   ├── hooks/                             # 自定义 Hooks（useAdminAuth + useToast）
│   ├── lib/                               # 服务端工具（Prisma + JWT）
│   ├── styles/                            # CSS 模块
│   ├── data/views.ts                      # 图表配置硬编码
│   └── generated/                         # Prisma Client 生成代码
├── prisma/schema.prisma                   # 数据库模型定义
├── .env                                   # 环境变量
└── docs/                                  # 文档体系
```

---

## 🔐 认证机制

```
┌─────────────────────────────────────────────────┐
│ 1. 用户点击齿轮图标 → LoginModal                │
│ 2. POST /api/auth/login                         │
│    → 响应: { access_token } (JS 内存变量)       │
│    → Cookie: refresh_token (HttpOnly, 7天)      │
│ 3. location.href → /admin                       │
│ 4. Admin 页面启动 → POST /api/auth/refresh      │
│    → Cookie 自动携带，换取新 access_token        │
│ 5. 401 检测 → 自动调 refresh → 重试请求         │
└─────────────────────────────────────────────────┘
```

- **Access Token**（15 分钟）：前端内存变量，`Authorization: Bearer` 头发送
- **Refresh Token**（7 天）：HttpOnly + SameSite=Strict Cookie，前端不可读

---

## 🔌 API 端点

| 模块 | 方法 | 路径 | 说明 |
|---|---|---|---|
| **Auth** | POST | `/api/auth/login` | 登录 |
| | POST | `/api/auth/refresh` | 刷新 Token |
| | POST | `/api/auth/logout` | 登出 |
| | GET | `/api/auth/me` | 当前用户 |
| **Views** | GET | `/api/views` | 全量视角（含覆盖） |
| | POST | `/api/views` | 新增视角 |
| | PATCH | `/api/views/:key` | 更新视角 |
| | DELETE | `/api/views/:key` | 删除视角 |
| **Overrides** | GET | `/api/overrides` | 所有覆盖 |
| | PUT | `/api/overrides/:viewKey` | 设置覆盖 |
| | DELETE | `/api/overrides/:viewKey` | 删除覆盖 |
| **Dashboard** | GET | `/api/dashboard` | 图表配置 |
| **Mock Vehicles** | GET | `/api/mock-vehicles` | 车辆数据 |
| **Users** | GET/POST | `/api/users` | 用户列表 / 新增 |
| | PATCH/DELETE | `/api/users/:id` | 修改 / 删除用户 |
| **System** | POST | `/api/seed` | 初始化数据 |

---

## 🗄️ 数据库模型

| 表 | 说明 | 关键字段 |
|---|---|---|
| `views` | 6 个内置视角 | `key`(PK), `posX/Y/Z`, `targetX/Y/Z`, `chartConfig`(JSONB) |
| `view_overrides` | 管理员覆盖位置 | `viewKey`(FK→views, ON DELETE CASCADE), `posX/Y/Z`, `targetX/Y/Z` |
| `dashboard_config` | 仪表盘 ECharts 配置 | `key`(PK), `data`(JSON) |
| `mock_vehicles` | 竞品车型数据 | `name`, `brand`, `hp`, `topSpeed`, `price` 等 |
| `users` | 管理员用户 | `username`(UNIQUE), `password`(bcrypt), `role` |

---

## 🎯 3D 交互工作流

```
页面加载 → Loading 动画 → Three.js 场景初始化
  → GLTF 模型加载 → 创建 6 个 Hotspot
  → OrbitControls 自由视角

点击 HUD 按钮：
  → GSAP 相机飞镜 (1.2s, power3.inOut)
  → AnnotationPanel SVG 描边入场
  → 数字递增动画
  → ECharts 图表渲染

特殊视角：
  doors → 车门 GSAP 旋转动画
  wheels → 轮速仪表盘 + 轮毂旋转模拟

复位 → 相机回到全景 (8, 2.5, 10)
```

---

## 🖌️ CSS 设计变量

```css
--bg:       #0A0B10    /* 页面底色 */
--surface:  #14161E    /* 卡片/面板底色 */
--accent:   #FFBC0A    /* 赛道黄 */
--display:  Bebas Neue /* 显示字体 */
--sans:     Inter      /* 正文字体 */
```

---

## 📜 开源许可

MIT License © 2026
