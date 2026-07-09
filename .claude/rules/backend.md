# 后端规则（Next.js API Routes）

当编辑 `src/app/api/` 或 `src/lib/` 目录下的文件时自动加载。

## API 路由规范
- 每个端点对应 `src/app/api/{module}/{action}/route.ts`
- 导出 `GET` / `POST` / `PATCH` / `PUT` / `DELETE` 函数
- 路由参数使用 `params: Promise<{ key: string }>`（Next.js 15+ 异步）
- 请求体用 `request.json()` 解析

## JWT 双 Token 认证
- access_token（15 分钟）：放响应体 `{ access_token }`，前端内存变量保存
- refresh_token（7 天）：设 `HttpOnly; SameSite=Strict; Path=/api/auth` Cookie
- 401 续期：`POST /api/auth/refresh`，Cookie 自动携带
- 工具函数在 `src/lib/auth.ts`：`signAccessToken` / `verifyToken` / `setRefreshCookie`

## Prisma 使用
- 单例在 `src/lib/prisma.ts`，`globalThis` 缓存防止热重载多连接
- **必须使用 Driver Adapter**：`@prisma/adapter-pg` + `pg.Pool` 实例化
- `prisma generate` 输出到 `src/generated/`，导入用 `from '../generated/client'`
- **连接方式**：本地用 `DATABASE_URL` 直连，部署自动切换 AWS RDS IAM 认证
  - IAM：`@aws-sdk/rds-signer` + `@vercel/functions/oidc`，token 15 分钟有效
  - `createPool()` 根据 `PGHOST` 环境变量自动切换（`src/lib/prisma.ts`）
- schema camelCase → SQL 自动转 snake_case（`@@map("view_overrides")`）
- 新增 model：加 schema → `prisma generate` → 创建 API route

## 数据库
- 5 表：views / view_overrides / dashboard_config / mock_vehicles / users
- View: `key(PK) posX/Y/Z targetX/Y/Z chartConfig(JSONB) isActive sortOrder`
- ViewOverride: `viewKey(UNIQUE FK→views) posX/Y/Z targetX/Y/Z` onDelete Cascade
- User: `username(UNIQUE VARCHAR) password(VARCHAR bcrypt) role(VARCHAR:super_admin/admin/user)`
- DashboardConfig: `key(PK) data(JSON)`

## Seed
- `POST /api/seed`：deleteMany + createMany 覆盖全部 5 表
- 初始化：6 视角 + 12 车辆 + 3 用户 + 仪表盘配置
- chartConfig 中的 ECharts 配置**不能含 Function**

## API 端点
| 组 | 方法 | 路径 |
|---|---|---|
| Auth | POST | `/api/auth/login` / `refresh` / `logout` |
| Auth | GET | `/api/auth/me` (Bearer) |
| Views | GET/POST/PATCH/DELETE | `/api/views[/:key]` |
| Overrides | GET/PUT/DELETE | `/api/overrides[/:viewKey]` |
| Dashboard | GET | `/api/dashboard` |
| MockVeh | GET | `/api/mock-vehicles` |
| Users | GET/POST/PATCH/DELETE | `/api/users[/:id]` |
| System | POST | `/api/seed` |

完整端点说明 → [api.md](docs/backend/api.md)

## 环境变量
`.env` 文件（Next.js 自动加载）:
| 变量 | 说明 | 默认值 |
|---|---|---|
| `DATABASE_URL` | 本地 PostgreSQL 连接 | `postgresql://postgres:123456@localhost:5432/car3d_admin` |
| `JWT_SECRET` | JWT 签名密钥 | `car3d_jwt_secret_2026` |
| `PGHOST` | AWS RDS 主机（部署时自动设为 IAM） | — |
| `AWS_ROLE_ARN` | Vercel OIDC 角色 ARN | — |

## 踩坑
1. Prisma 7 需要显式 `output` 路径 → `prisma/schema.prisma` 中配置
2. Prisma Client 导入路径 → `import { PrismaClient } from '../generated/client'`
3. Next.js 路由参数 → `params: Promise<{key: string}>` 需要 await
4. Refresh Cookie → 手动解析 `request.headers.get('cookie')` 提取
5. reSeed → deleteMany 覆盖全部 5 表
6. chartConfig 不能含 Function

## 参考文档
- 需要查具体 API 端点、请求体、返回值 → `docs/backend/api.md`
- 需要查数据库字段定义、类型约束 → `docs/backend/database.md`
