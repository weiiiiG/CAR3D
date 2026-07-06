# CLAUDE.md — 后 端 规 范

## 技术栈
NestJS 11 + Prisma 7 + PostgreSQL 18 + pg

## 启动
```bash
cd server
npm run start:dev    # 开发模式（自动加载 .env）
# 管理后台: http://localhost:5180/admin（通过 Vite 代理）
# 直接 API: http://localhost:3000/api
默认用户: admin / super_admin / 密码 123456
```

## 环境变量
项目依赖 `.env` 文件中的环境变量：

| 变量 | 说明 | 默认值 |
|---|---|---|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://postgres:123456@localhost:5432/car3d_admin` |
| `JWT_SECRET` | JWT 签名密钥 | `car3d_jwt_secret_2026` |

`.env` 文件在 `server/.env`，由 `server/src/main.ts` 中 `import 'dotenv/config'` 自动加载。
Prisma CLI 使用 `schema.prisma` 的 datasource 配置指向同一数据库。

## 模块规范
- 每个功能模块一个目录：`auth/`, `users/`, `dashboard/`, `views/`, `mock-vehicles/`, `seed/`
- 模块注册在 `app.module.ts` 的 `imports` 数组
- 全局 PrismaService 由 `@Global()` PrismaModule 提供
- JWT 路由守卫用 `@UseGuards(JwtAuthGuard)`，加到 Controller 级别

## Prisma 使用约定
- 所有数据库操作通过 `prisma` 服务（`PrismaService`）执行
- 修改 schema 后执行 `npx prisma generate`
- 生成代码在 `src/@generated/prisma-client/`
- 新增模型：在 `prisma/schema.prisma` 添加 model → `prisma generate` → 创建 service/controller/module

## 已踩坑
1. Prisma 7 + CJS: generated client.ts 含 `import.meta.url`，需替换为 `globalThis['__dirname'] = __dirname`
2. PostgreSQL 列名大小写: Prisma schema 用 camelCase，SQL 中需双引号
3. chartConfig 不能含 Function，seed 数据需移除 ECharts 回调函数
4. dist 输出在 dist/src/，需 `node dist/src/main.js` 启动
5. **class-validator 版本兼容**：class-validator 0.14+ 依赖 ESM-only 包，锁定 0.15.x
6. **Prisma 7 强制需要 Driver Adapter**：通过 `@prisma/adapter-pg` + `pg.Pool`
7. **Prisma Client 生成路径**：必须在 `src/` 目录内，否则 NestJS 不编译到 dist
8. **JWT Refresh Token**：access_token 15min 放前端内存，refresh_token 7 天放 HttpOnly Cookie。`/api/auth/refresh` 用 Cookie 自动续期
9. **CORS 与 Cookie**：`credentials: true` 必须同时在后端 `enableCors` 和前端 `fetch` 中设置，否则 HttpOnly Cookie 不会被浏览器发送
10. **PrismaService 硬编码数据库密码**：原代码在 `prisma.service.ts` 中硬编码 `host/port/user/password`，忽略 `.env` 的 `DATABASE_URL`。修复：使用 `new pg.Pool({ connectionString: process.env.DATABASE_URL })`，并在 `main.ts` 添加 `import 'dotenv/config'`。
11. **JWT 密钥硬编码**：`auth.module.ts` 和 `jwt.strategy.ts` 中 `secret` 硬编码字符串。修复：改用 `process.env.JWT_SECRET || 'fallback'`。
12. **reSeed 不完整**：`seed.service.ts` 的 `reSeed()` 只重置 views + mock_vehicles，漏掉了 users 和 dashboard_config。修复：reSeed 中 deleteMany + createMany 覆盖全部 5 张表。
13. **管理后台登录页闪烁**：`window.onload` 先 `showLogin()` 再 refresh，已登录用户看到登录页闪一下。修复：先 `fetch('/api/auth/refresh')`，成功则 `buildSidebar()`，失败才 `showLogin()`。
