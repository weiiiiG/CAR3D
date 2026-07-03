# 后端架构

## 技术栈
- NestJS 11 + Prisma 7 + PostgreSQL 18 + pg (node-postgres)

## 目录结构
```
server/
├── prisma/                    # Prisma schema + 配置
│   └── schema.prisma          # 3 个模型: View, ViewOverride, MockVehicle
├── src/
│   ├── prisma/                # PrismaService（全局单例）
│   ├── views/                 # 视角管理模块（CRUD + overrides）
│   ├── mock-vehicles/         # Mock 车辆数据模块
│   ├── seed/                  # 初始化数据导入（views + mock_vehicles，自动运行）
│   └── @generated/            # Prisma Client 生成代码
├── public/                    # 静态文件（管理后台 admin.html）
└── dist/                      # 编译产出
```

## 模块清单
| 模块 | 路由前缀 | 说明 |
|---|---|---|
| ViewsModule | /api/views, /api/overrides | 视角配置 + 覆盖管理 |
| MockVehiclesModule | /api/mock-vehicles | 模拟车辆数据 |
| SeedService | /api/seed (POST) | 数据初始化 |
| AdminController | /admin (GET) | 管理后台页面 |

## Entity 关系
```
View (1) ──→ (N) ViewOverride (onDelete: Cascade)
```
View 的 key 是字符串主键，ViewOverride 通过 viewKey 外键关联。

## 踩坑记录
1. **PostgreSQL 列名大小写**：camelCase 列名在 SQL 中需双引号包围。Prisma schema 用 @@map 映射到表名。
2. **Prisma 7 + NestJS CJS 兼容**：Prisma 7 生成的 client.ts 使用 import.meta.url（ESM 特性），需手动替换为 `globalThis['__dirname'] = __dirname` 才能在 CommonJS 下运行。
3. **Prisma 7 需要 Driver Adapter**：PostgreSQL 连接需安装 @prisma/adapter-pg，并使用 pg.Pool 实例化适配器。
4. **CORS 配置**：前端在 localhost:5180，需 enableCors 允许该 origin。
5. **Module 编译路径**：nest build 输出为 dist/src/，入口为 dist/src/main.js（不是 dist/main.js）。
6. **chartConfig 序列化**：ECharts 配置中的 Function 无法存入 Prisma JSON 列，Seed 数据中需移除函数。
7. **class-validator 版本兼容**：class-validator 0.14+ 引入了 ESM-only 依赖（如 libphonenumber-js），在 NestJS CommonJS 模式下需确保 `target` 编译选项与 `module` 兼容。本项目使用 0.15.x，若升级需同步检查构建配置。

## 启动
```bash
cd server
npm run start:dev    # 开发模式（watch）
npm run start        # 生产模式
```
