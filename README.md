# Hennessy Venom GT — 3D 交互式汽车展示系统

[![Tech Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react)]()
[![Tech Stack](https://img.shields.io/badge/Three.js-0.184-000000?logo=three.js)]()
[![Tech Stack](https://img.shields.io/badge/GSAP-3.15-88CE02?logo=greensock)]()
[![Tech Stack](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)]()
[![Tech Stack](https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql)]()

> Hennessey Venom GT 的沉浸式 3D 展示页面，结合 **Three.js** 实时渲染、**GSAP** 电影级动画、**ECharts** 数据可视化与 **NestJS + Prisma** 管理后端。支持 6 个热点视角漫游、管理员后台、视角自定义覆盖。

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
| **React 19** + TypeScript | **NestJS 11** |
| **Three.js** 0.184 | **Prisma 7** ORM |
| **GSAP** 3.15 + ScrollTrigger | **PostgreSQL** 18 |
| **ECharts** 6 | **JWT** (Passport) |
| **Vite** 8 | **pg** (node-postgres) |

---

## 🚀 快速启动

### 前置条件

- Node.js >= 20
- PostgreSQL 18（数据库 `car3d_admin`）
- npm

### 1. 数据库配置

创建 PostgreSQL 数据库：

```sql
CREATE DATABASE car3d_admin;
```

修改 `server/.env` 中的数据库连接字符串：

```env
DATABASE_URL="postgresql://用户名:密码@localhost:5432/car3d_admin?schema=public"
```

### 2. 启动后端

```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run start:dev
# API → http://localhost:3000/api
```

### 3. 初始化数据

```bash
curl -X POST http://localhost:3000/api/seed
```

此命令导入：6 个默认视角 + 3 个默认用户 + 12 台竞品车辆 + Dashboard 配置。

### 4. 启动前端

```bash
cd D:/threejs/3D
npm install
npm run dev
# 前端 → http://localhost:5180
# 管理后台 → http://localhost:5180/admin.html
```

### 5. 访问地址

| 页面 | 地址 | 说明 |
|---|---|---|
| 3D 展示页 | `http://localhost:5180` | 主展示页面 |
| 管理后台 | `http://localhost:5180/admin.html` | 通过 Vite 代理访问 |
| 后端 API | `http://localhost:3000/api` | 直接访问 |

---

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
├── index.html                        # 入口 HTML（Bebas Neue / Inter 字体）
├── vite.config.ts                    # Vite 配置（/api 代理 + /admin.html 路由重写）
├── src/
│   ├── main.tsx                      # React 入口
│   ├── App.tsx                       # 主组件（场景初始化 + 6 视角 + 热点交互 + 认证）
│   ├── index.css                     # CSS 变量体系（赛道风格 UI）
│   └── components/
│       ├── Scene.tsx                 # Three.js 场景核心
│       ├── LoadingOverlay.tsx        # 加载过渡动画
│       ├── HudBar.tsx                # HUD 视角按钮栏
│       ├── AnnotationPanel.tsx       # 注解数据面板
│       ├── LoginModal.tsx            # 管理员 JWT 登录弹窗
│       ├── CapturePanel.tsx          # 3D 坐标捕获面板
│       └── ViewManagerPanel.tsx      # 视角覆盖管理面板
├── public/
│   └── admin.html                    # 管理后台 SPA
├── docs/                             # 文档体系
└── server/
    ├── prisma/schema.prisma          # 数据库模型定义
    └── src/
        ├── main.ts                   # NestJS 启动入口（端口 3000）
        ├── app.module.ts             # 根模块
        ├── prisma/                   # PrismaService（全局单例）
        ├── auth/                     # JWT 双 Token 认证
        ├── users/                    # 用户 CRUD（三级 RBAC）
        ├── dashboard/                # 仪表盘配置
        ├── views/                    # 视角管理（含 override 覆盖合并）
        ├── mock-vehicles/            # 竞品车辆数据
        └── seed/                     # 初始化数据导入
```

---

## 🔐 认证机制

```
┌─────────────────────────────────────────────────┐
│ 1. 用户点击齿轮图标 → LoginModal                │
│ 2. POST /api/auth/login                         │
│    → 响应: { access_token } (JS 内存变量)       │
│    → Cookie: refresh_token (HttpOnly, 7天)      │
│ 3. location.href → /admin.html                  │
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

MIT License © 2024
