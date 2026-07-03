# Mock 数据 + 文档体系 + CLAUDE.md + Git 规范

## 一、Mock 数据

### 数据库

新建表 `mock_vehicles`，包含 14 个字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | `SERIAL PRIMARY KEY` | |
| `name` | `VARCHAR(100)` | 车型名 |
| `brand` | `VARCHAR(50)` | 品牌 |
| `country` | `VARCHAR(50)` | 产地 |
| `year` | `INTEGER` | 年份 |
| `hp` | `INTEGER` | 马力 |
| `torque` | `INTEGER` | 扭矩 |
| `acceleration` | `FLOAT` | 0-100 km/h |
| `topSpeed` | `INTEGER` | 极速 |
| `weight` | `INTEGER` | 整备质量 |
| `engine` | `VARCHAR(100)` | 发动机 |
| `price` | `FLOAT` | 售价(万美元) |
| `fuelConsumption` | `FLOAT` | 油耗 |
| `displacement` | `FLOAT` | 排量 |
| `driveType` | `VARCHAR(50)` | 驱动方式 |
| `category` | `VARCHAR(50)` | 分类 |

### Seed 数据（12 款超跑 × 14 维）

Hennessy Venom GT、Koenigsegg Agera RS、Bugatti Chiron、Koenigsegg Jesko、Rimac Nevera、SSC Tuatara、McLaren Speedtail、Aston Martin Valkyrie、Porsche 918 Spyder、Ferrari LaFerrari、McLaren P1、Lamborghini Revuelto。种子数据在 seed.service.ts 中硬编码，启动时自动导入。

### ORM 迁移策略

**全量从 TypeORM 迁移到 Prisma**（用户确认方案 B）。

- 废弃 `server/src/views/entities/*.entity.ts` 中的 TypeORM 装饰器
- 用 `prisma/schema.prisma` 统一定义所有表（`views`、`view_overrides`、`mock_vehicles`）
- Service 层从 `@InjectRepository` + `Repository` 模式改为 `PrismaClient` 调用
- 移除 `@nestjs/typeorm`、`typeorm` 依赖，新增 `@prisma/client`、`prisma`
- Controller 层接口不变，前端无感知

### 后端

新建 `MockVehiclesModule`（entity + controller + service），端点：

- `GET /api/mock-vehicles` — 全量
- `GET /api/mock-vehicles/:id` — 单个
- `POST /api/mock-vehicles` — 新增  
- `DELETE /api/mock-vehicles/:id` — 删除

SeedService 中补充 mock_vehicles 表的初始化。

### 管理后台

数据概览页的 3 张小图 + 雷达图 + 圈速图 + 底部表格，全部改为 `GET /api/mock-vehicles` 数据驱动，新增分类统计图表。

## 二、文档目录结构

```
D:/threejs/3D/docs/
├── backend/
│   ├── CLAUDE.md              # 后端规范（≤200行）
│   ├── architecture.md         # 完整框架文档
│   ├── api.md                  # API 端点清单
│   └── database.md             # DB 结构
├── frontend/
│   ├── CLAUDE.md               # 前端规范（≤200行）
│   ├── architecture.md         # 前端架构
│   └── components.md           # 组件树
└── superpowers/
    └── specs/
        └── 2026-07-03-mock-docs-claude-git-design.md
```

### 后端框架文档 `backend/architecture.md`

1. 目录树 + 用途
2. 技术栈（NestJS + TypeORM + PostgreSQL）
3. 模块清单
4. Entity 关系
5. API 示例（curl）
6. 踩坑记录
7. 启动步骤

## 三、CLAUDE.md 拆分

### `CLAUDE.md`（根目录）

- 项目一句话 + 技术栈总览
- 前后端目录结构
- 快速启动（前端 `npm run dev` / 后端 `npm run start:dev`）
- Git 提交格式：`feat:` `fix:` `docs:` `chore:` `refactor:`
- `@see docs/frontend/CLAUDE.md`
- `@see docs/backend/CLAUDE.md`

### `docs/frontend/CLAUDE.md`

- 组件规范（函数组件 + hooks，ref 清理）
- Three.js 注意事项（renderer/ticker/geometry dispose）
- GSAP timeline 管理（kill on unmount）
- ECharts dispose 规则
- CSS 变量体系说明
- 已踩坑：HMR 后 audio context 被 suspend、Overlay z-index 层级、OrbitControls 与 modal 冲突

### `docs/backend/CLAUDE.md`

- 模块命名规范
- DTO + ValidationPipe
- TypeORM Repository 模式
- 目录按功能分包（entities/dto 不跨模块引用）
- CORS 配置
- Seed 机制
- 已踩坑：PostgreSQL 列名大小写需双引号、class-validator 版本兼容

## 四、Git 初始化

```bash
git init
git add -A
git commit -m "feat: 初始化项目，含 3D 展示前端 + NestJS 后端 + 管理后台"
```

后续每次有改动：
1. 改代码
2. 同步更新相应框架文档和 CLAUDE.md
3. `git add -A && git commit`

## 五、实施清单

| # | 任务 | 涉及文件 |
|---|---|---|
| 1 | 安装 Prisma CLI + 初始化 | `server/package.json`, `prisma/schema.prisma` |
| 2 | 编写 `schema.prisma`（views + view_overrides + mock_vehicles） | `prisma/schema.prisma` |
| 3 | 移除 TypeORM entities + 安装 @prisma/client | `server/src/views/entities/*.ts` → 删除 |
| 4 | 重构 ViewsService → PrismaClient | `server/src/views/views.service.ts` |
| 5 | 重构 SeedService → PrismaClient | `server/src/seed/seed.service.ts` |
| 6 | 重写 AppModule → 移除 TypeORM，注入 PrismaModule | `server/src/app.module.ts` |
| 7 | 建表 `mock_vehicles`（prisma migrate） | Prisma migration |
| 8 | 创建 MockVehiclesModule（Prisma 方式） | `server/src/mock-vehicles/*` |
| 9 | Seed 12 款车型数据 | `seed.service.ts` |
| 10 | 更新 admin.html 数据概览页为 API 驱动 + 分类图表 | `server/public/admin.html` |
| 11 | 写 `docs/backend/architecture.md` | 新建 |
| 12 | 写 `docs/backend/api.md` | 新建 |
| 13 | 写 `docs/backend/database.md` | 新建 |
| 14 | 写 `docs/frontend/architecture.md` | 新建 |
| 15 | 写 `docs/frontend/components.md` | 新建 |
| 16 | 写 `CLAUDE.md`（根目录） | 新建 |
| 17 | 写 `docs/frontend/CLAUDE.md` | 新建 |
| 18 | 写 `docs/backend/CLAUDE.md` | 新建 |
| 19 | `git init` 初始化仓库并提交 | 全量 |
