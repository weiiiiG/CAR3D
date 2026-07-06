# Hennessy Venom GT — 3D 展示项目

React + Three.js 3D 汽车展示前端 + NestJS + Prisma + PostgreSQL 后端管理系统。

## 快速启动

```bash
# 前端（终端 1）
cd D:/threejs/3D
npm run dev

# 后端（终端 2）
cd D:/threejs/3D/server
npm run start:dev

# 管理后台: http://localhost:5180/admin（同端口，同页面跳转）
# 前端: http://localhost:5180
默认用户: admin / 密码 123456（super_admin 角色）
```

## 目录结构
```
/3D/                    前端 (Vite + React + Three.js + GSAP + ECharts)
├── src/App.tsx         主组件
├── src/components/     7 个独立组件 (Scene / HudBar / AnnotationPanel / etc.)
└── public/admin/       管理后台

/3D/server/             后端 (NestJS + Prisma + PostgreSQL)
├── prisma/schema.prisma 数据库模型
├── src/{auth,users,dashboard,views,mock-vehicles,seed,prisma}/
└── public/admin.html    管理后台源码

/3D/docs/               文档体系
├── backend/{architecture,api,database,CLAUDE}.md
└── frontend/{architecture,CLAUDE}.md
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

## Git 提交格式
```
feat: 新功能 / fix: 修复 / docs: 文档更新 / chore: 构建/工具 / refactor: 重构
```

@see docs/frontend/CLAUDE.md
@see docs/backend/CLAUDE.md
