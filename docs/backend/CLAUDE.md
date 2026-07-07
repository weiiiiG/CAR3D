# 后端规范 — CLAUDE.md

## 技术栈
NestJS 11 + Prisma 7 + PostgreSQL 18 + pg (node-postgres) + class-validator 0.15.x

## 启动
```bash
cd server
npm run start:dev      # 开发（watch）→ http://localhost:3000
npm run start          # 生产
npx prisma generate    # schema 变更后重新生成 client
npx prisma db push     # 同步 schema 到数据库
```

入口：`server/src/main.ts`（自动 `import 'dotenv/config'` 加载 `.env`）

## 目录结构
```
server/src/
├── main.ts                 NestJS 启动（CORS: 5173+5180, cookie-parser, ValidationPipe）
├── app.module.ts           根模块
├── prisma/                 PrismaService (@Global 单例)
├── auth/                   JWT 双 token + passport-jwt Strategy
│   ├── auth.module.ts      JwtModule.register({secret: process.env.JWT_SECRET})
│   ├── auth.controller.ts  /login /refresh /logout /me
│   └── jwt.strategy.ts     secret 读 process.env
├── users/                  三级 RBAC CRUD
├── views/                  视角 CRUD + overrides 覆盖合并
│   └── views.service.ts    findAll 合并 override → effectivePos/effectiveTarget
├── dashboard/              ECharts 配置 CRUD（JSONB 存取）
├── mock-vehicles/          12 台竞品车型数据
└── seed/                   reSeed 全部 5 张表
```

## API 端点

| 组 | 方法 | 路径 |
|---|---|---|
| Auth | POST | `/api/auth/login` / `refresh` / `logout` |
| Auth | GET | `/api/auth/me` |
| Users | GET/POST/PATCH/DELETE | `/api/users[/:id]` |
| Views | GET/POST/PATCH/DELETE | `/api/views[/:key]` |
| Overrides | GET | `/api/overrides` |
| Overrides | PUT/DELETE | `/api/overrides/:viewKey` |
| Dashboard | GET/PUT | `/api/dashboard[/:key]` |
| MockVeh | GET/POST/DELETE | `/api/mock-vehicles[/:id]` |
| System | POST | `/api/seed` |

完整端点说明 → [api.md](api.md)

## 数据库模型（5 表）

| 表 | 说明 | 关键字段 |
|---|---|---|
| `views` | 6 内置视角 + 自定义 | `key(PK)`, `posX/Y/Z`, `targetX/Y/Z`, `chartConfig(JSONB)`, `sortOrder`, `isActive` |
| `view_overrides` | 管理员覆盖 | `viewKey(UNIQUE FK→views)`, `posX/Y/Z`, `targetX/Y/Z`, onDelete Cascade |
| `dashboard_config` | ECharts 配置 | `key(PK)`, `data(JSON)` |
| `mock_vehicles` | 12 竞品 | `name/brand/hp/torque/acceleration/topSpeed/engine/price` 等 |
| `users` | RBAC 用户 | `username(UNIQUE)`, `password(bcrypt)`, `role(VARCHAR)` |

详细字段 → [database.md](database.md)

## 认证流程
1. `POST /api/auth/login` → 验证 bcrypt → 生成 access_token(15min) + refresh_token(7d)
2. access_token 放响应体 `{ access_token }`，refresh_token 设 `HttpOnly; SameSite=Strict; Path=/api/auth` Cookie
3. 前端存 access_token 到内存变量，每个请求 `Authorization: Bearer <token>`
4. 401 → 自动 `POST /api/auth/refresh` → Cookie 携带 → 新 access_token
5. refresh 失败（Cookie 过期）→ 清除 Cookie，返回登录页
6. 路由守卫：`@UseGuards(JwtAuthGuard)` Controller 级别

## Seed 数据

| 数据 | 数量 | 说明 |
|---|---|---|
| views | 6 | front/side/45/interior/doors/wheels 含 chartConfig |
| users | 3 | admin(super_admin) / editor(admin) / viewer(user)，密码均为 123456 |
| mock_vehicles | 12 | 燃油/混动/电动 竞品 |
| dashboard_config | 若干 | 管理后台 ECharts 图表 |

`POST /api/seed` 重新导入全部，deleteMany + createMany 覆盖 5 表。

## 模块规范
- 每个模块一目录（auth/users/views/dashboard/mock-vehicles/seed）
- 模块注册在 `app.module.ts` `imports` 数组
- PrismaModule 用 `@Global()`，各模块直接注入 PrismaService

## 踩坑
1. **PrismaService 硬编码密码**：`new pg.Pool({ connectionString: process.env.DATABASE_URL })`
2. **JWT 密钥硬编码**：`process.env.JWT_SECRET || 'fallback'`
3. **chartConfig 不能含 Function**：ECharts 回调无法 JSON 序列化
4. **Prisma 7 Driver Adapter**：必须 `@prisma/adapter-pg` + `pg.Pool` 实例化
5. **class-validator 版本**：0.14+ 含 ESM-only 依赖，锁定 0.15.x
6. **生成路径**：Prisma Client output 必须在 `src/` 内，否则 NestJS 不编译到 dist
7. **CORS Cookie**：后端 `credentials: true` + 前端 `credentials: 'include'` 缺一不可
8. **reSeed 完整**：deleteMany 需覆盖全部 5 表，不可遗漏
9. **管理后台登录闪烁**：先 refresh → 成功则仪表盘，失败才 showLogin

@see [主 CLAUDE.md](../../CLAUDE.md)
@see [API 端点](api.md)
@see [数据库设计](database.md)
