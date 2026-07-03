# CLAUDE.md — 后 端 规 范

## 技术栈
NestJS 11 + Prisma 7 + PostgreSQL 18 + pg

## 启动
```bash
cd server
npm run start:dev
```
管理后台: http://localhost:3000/admin (admin/123456)

## 模块规范
- 每个功能模块一个目录：`views/`, `mock-vehicles/`, `seed/`
- 模块注册在 `app.module.ts` 的 `imports` 数组
- 全局 PrismaService 由 `@Global()` PrismaModule 提供

## Prisma 使用约定
- 所有数据库操作通过 `prisma` 服务（`PrismaService`）执行
- 修改 schema 后执行 `npx prisma generate`
- 生成代码在 `src/@generated/prisma-client/`
- 新增模型：在 `prisma/schema.prisma` 添加 model → `prisma generate` → 创建 service/controller/module

## 已踩坑
1. Prisma 7 + CJS: generated client.ts 含 `import.meta.url`，需替换为 `globalThis['__dirname'] = __dirname`
2. PostgreSQL 列名大小写: Prisma schema 用 camelCase，SQL 中需双引号
3. chartConfig 不能含 Function，seed 数据需移除 ECharts 回调函数
4. dist 输出在 dist/src/，AdminController 静态文件路径需 `../../public/admin.html`
5. **class-validator 版本兼容**：class-validator 0.14+ 依赖 ESM-only 包（如 libphonenumber-js），在 CommonJS 模式下可能报错。锁定到 0.15.x 并确保 tsconfig `target: ES2023` 与 `experimentalDecorators` 配合使用。
6. **Prisma 7 强制需要 Driver Adapter**：PostgreSQL 连接必须通过 `@prisma/adapter-pg` + `pg.Pool` 传入，不能直接使用 `datasource.url`。
7. **Prisma Client 生成路径**：Prisma 7 要求显式设置 `output` 路径。生成代码需在 `src/` 目录内，否则 NestJS 编译不会将其打包到 `dist/`。
