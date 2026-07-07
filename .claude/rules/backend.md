# 后端规则

当编辑 `server/` 目录下的文件时自动加载。

## NestJS 模块规范
- 每个功能一个目录（auth/users/views/dashboard/mock-vehicles/prisma/seed）
- 模块注册在 `app.module.ts` `imports` 数组
- PrismaModule `@Global()`，各模块直接注入 PrismaService
- 路由守卫 `@UseGuards(JwtAuthGuard)` Controller 级别
- class-validator 锁定 0.15.x（0.14+ 含 ESM-only 依赖）

## JWT 双 Token 认证
- access_token（15 分钟）：放响应体 `{ access_token }`，前端内存变量保存
- refresh_token（7 天）：设 `HttpOnly; SameSite=Strict; Path=/api/auth` Cookie
- 401 续期：`POST /api/auth/refresh`，Cookie 自动携带
- access_token 签名：`process.env.JWT_SECRET`，不用硬编码
- refresh_token 存数据库或 Cookie 自身（本项目用 Cookie 自身）

## Prisma 使用
- **必须使用 Driver Adapter**：`@prisma/adapter-pg` + `pg.Pool` 实例化，不能直接 datasource.url
- `prisma generate` 后 client 输出在 `src/@generated/prisma-client/`（必须在 src/ 内）
- schema camelCase → SQL 自动转 snake_case（`@@map("view_overrides")`）
- 新增 model：加 schema → `prisma generate` → 创建 service/controller/module

## 数据库
- 5 表：views / view_overrides / dashboard_config / mock_vehicles / users
- View: `key(PK) posX/Y/Z targetX/Y/Z chartConfig(JSONB) isActive sortOrder`
- ViewOverride: `viewKey(UNIQUE FK→views) posX/Y/Z targetX/Y/Z` onDelete Cascade
- User: `username(UNIQUE VARCHAR) password(VARCHAR bcrypt) role(VARCHAR:super_admin/admin/user)`
- DashboardConfig: `key(PK) data(JSON)`

## Seed
- `POST /api/seed`：deleteMany + createMany 覆盖全部 5 表，不可遗漏
- 初始化：6 视角 + 12 车辆 + 3 用户 + 仪表盘配置
- chartConfig 中的 ECharts 配置**不能含 Function**

## API 路径
- 所有端点：`/api/auth/*` `/api/users/*` `/api/views/*` `/api/overrides/*` `/api/dashboard/*` `/api/mock-vehicles/*`
- overrides：`PUT /api/overrides/:viewKey` upsert 语义
- views：`GET` 返回时合并 override 为 `effectivePos/effectiveTarget`
- CORS：前端 `localhost:5173` + `5180`，`credentials: true`

## 环境变量
| 变量 | 说明 | 默认值 |
|---|---|---|
| `DATABASE_URL` | PostgreSQL 连接 | `postgresql://postgres:123456@localhost:5432/car3d_admin` |
| `JWT_SECRET` | JWT 签名密钥 | `car3d_jwt_secret_2026` |

`server/src/main.ts` 中 `import 'dotenv/config'` 自动加载 `.env`。

## 踩坑
1. PrismaService 硬编码密码 → `new pg.Pool({ connectionString: process.env.DATABASE_URL })`
2. reSeed 不完整 → deleteMany 覆盖全部 5 表
3. 管理后台登录闪烁 → 先 refresh 再 showLogin
4. CORS + Cookie → 两端 `credentials: true` 缺一不可
5. 编译入口为 `dist/src/main.js`

## 参考文档
- 需要查具体 API 端点、请求体、返回值 → 查阅 `docs/backend/api.md`
- 需要查数据库字段定义、类型约束 → 查阅 `docs/backend/database.md`
- 新增端点或修改 schema 后，同步更新上述文档
