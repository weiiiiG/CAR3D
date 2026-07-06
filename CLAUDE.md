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

# 管理后台: http://localhost:5180/admin.html (通过 Vite 代理)
# 前端: http://localhost:5180
```

## 目录结构
```
/3D/                    前端 (Vite + React + Three.js + GSAP)
/3D/server/             后端 (NestJS + Prisma + PostgreSQL)
├── prisma/schema.prisma 数据库模型 (Prisma ORM)
├── src/{auth,users,dashboard,views,mock-vehicles,seed,prisma}/
└── public/admin.html    管理后台页面（仪表盘/视角管理/数据概览/用户管理/设置）

## 角色体系
| 角色 | 权限 |
|---|---|
| super_admin | 全部权限 + 用户管理 |
| admin | 视角 CRUD，不可管理用户 |
| user | 仅查看仪表盘和数据概览 |

## 认证机制
- Access Token（15 分钟）：前端内存变量
- Refresh Token（7 天）：HttpOnly Cookie（`/api/auth` 路径），无感续期
/3D/docs/               文档体系
├── backend/{architecture,api,database,CLAUDE}.md
└── frontend/{architecture,CLAUDE}.md
```

## Git 提交格式
```
feat: 新功能
fix: 修复
docs: 文档更新
chore: 构建/工具
refactor: 重构
```

@see docs/frontend/CLAUDE.md
@see docs/backend/CLAUDE.md
