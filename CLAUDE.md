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

# 管理后台: http://localhost:3000/admin (admin/123456)
# 前端: http://localhost:5180
```

## 目录结构
```
/3D/                    前端 (Vite + React + Three.js + GSAP)
/3D/server/             后端 (NestJS + Prisma + PostgreSQL)
├── prisma/schema.prisma 数据库模型 (Prisma ORM)
├── src/{views,mock-vehicles,seed,prisma}/
└── public/admin.html    管理后台页面（仪表盘/视角管理/数据概览/设置 共 4 页）
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
