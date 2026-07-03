# Mock 数据 + Prisma 迁移 + 文档体系 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) for this plan since tasks are independent in later stages.

**Goal:** 后端 ORM 从 TypeORM 全量迁移到 Prisma，新增 Mock 数据模块，重建完整文档体系与 CLAUDE.md，初始化 Git

**Architecture:** Prisma schema 统管所有表，替代 TypeORM 实体；Service 层从 `@InjectRepository` 改为 `PrismaService`；Controller 接口完全不变。新增 MockVehiclesModule。文档分层为根/前端/后端三份 CLAUDE.md + 四份框架文档。

**Tech Stack:** NestJS + Prisma + PostgreSQL 18

## Global Constraints

- PostgreSQL 18, 连接 `postgresql://postgres:123456@localhost:5432/car3d_admin`
- 列名用 camelCase（PostgreSQL 中需双引号），Prisma `@map` 映射到数据库精确列名
- CLAUDE.md 每份 ≤200 行
- Git 提交格式：`feat:` `fix:` `docs:` `chore:` `refactor:`
- API 接口保持向后兼容，前端无感知

---

## File Structure

```
server/
├── prisma/
│   └── schema.prisma                  # 新建 - 全量 Prisma schema
├── src/
│   ├── prisma/
│   │   ├── prisma.service.ts          # 新建 - Prisma 单例服务
│   │   └── prisma.module.ts           # 新建 - Prisma 全局 Module
│   ├── views/
│   │   ├── views.module.ts            # 修改 - 移除 TypeORM imports
│   │   ├── views.controller.ts        # 不变
│   │   ├── views.service.ts           # 重写 - TypeORM→Prisma
│   │   ├── entities/                  # 删除 - 不再需要
│   │   └── dto/                       # 保留不变
│   ├── mock-vehicles/
│   │   ├── mock-vehicles.module.ts    # 新建
│   │   ├── mock-vehicles.controller.ts# 新建
│   │   └── mock-vehicles.service.ts   # 新建
│   ├── seed/
│   │   └── seed.service.ts            # 重写 - Prisma 方式
│   ├── admin.controller.ts            # 不变
│   ├── seed.controller.ts             # 不变
│   └── app.module.ts                  # 重写 - 移除 TypeORM → Prisma
├── public/
│   └── admin.html                     # 修改 - API 驱动 mock 数据
├── package.json                       # 修改 - 更换依赖
```

```
docs/
├── backend/
│   ├── CLAUDE.md                      # 新建 ≤200行
│   ├── architecture.md                # 新建
│   ├── api.md                         # 新建
│   └── database.md                    # 新建
├── frontend/
│   ├── CLAUDE.md                      # 新建 ≤200行
│   ├── architecture.md                # 新建
│   └── components.md                  # 新建
└── superpowers/
    └── plans/
        └── 2026-07-03-mock-docs-claude-git.md
```

---

### Task 1: 安装 Prisma + 编写 Schema

**Files:**
- Create: `server/prisma/schema.prisma`
- Modify: `server/package.json`

- [ ] **Step 1: 安装依赖并初始化 Prisma**

```bash
cd D:/threejs/3D/server
npm uninstall @nestjs/typeorm typeorm
npm install @prisma/client
npm install -D prisma
npx prisma init
```

- [ ] **Step 2: 编写 `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model View {
  key           String         @id @default("") @db.VarChar(50)
  label         String         @db.VarChar(100)
  description   String?        @db.Text
  spec          String?        @db.VarChar(200)
  specCategory  String?        @db.VarChar(50)
  posX          Float
  posY          Float
  posZ          Float
  targetX       Float
  targetY       Float
  targetZ       Float
  chartConfig   Json?
  sortOrder     Int            @default(0)
  isActive      Boolean        @default(true)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  overrides     ViewOverride[]

  @@map("views")
}

model ViewOverride {
  id        Int      @id @default(autoincrement())
  viewKey   String   @unique @db.VarChar(50)
  posX      Float
  posY      Float
  posZ      Float
  targetX   Float
  targetY   Float
  targetZ   Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  view      View     @relation(fields: [viewKey], references: [key], onDelete: Cascade)

  @@map("view_overrides")
}

model MockVehicle {
  id              Int      @id @default(autoincrement())
  name            String   @db.VarChar(100)
  brand           String   @db.VarChar(50)
  country         String   @db.VarChar(50)
  year            Int
  hp              Int
  torque          Int
  acceleration    Float
  topSpeed        Int
  weight          Int
  engine          String   @db.VarChar(100)
  price           Float
  fuelConsumption Float
  displacement    Float
  driveType       String   @db.VarChar(50)
  category        String   @db.VarChar(50)

  @@map("mock_vehicles")
}
```

- [ ] **Step 3: 创建 `.env` 数据库连接**

Create `server/.env`:
```
DATABASE_URL="postgresql://postgres:123456@localhost:5432/car3d_admin"
```

- [ ] **Step 4: 生成 Prisma Client + 创建 migration**

```bash
cd D:/threejs/3D/server
npx prisma db push   # 开发环境直接用 db push
npx prisma generate
```

---

### Task 2: Prisma Module + 替换 AppModule

**Files:**
- Create: `server/src/prisma/prisma.service.ts`
- Create: `server/src/prisma/prisma.module.ts`
- Modify: `server/src/app.module.ts`

- [ ] **Step 1: 创建 PrismaService**

```typescript
// server/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

- [ ] **Step 2: 创建 PrismaModule**

```typescript
// server/src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 3: 重写 AppModule**

```typescript
// server/src/app.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ViewsModule } from './views/views.module';
import { MockVehiclesModule } from './mock-vehicles/mock-vehicles.module';
import { SeedService } from './seed/seed.service';
import { SeedController } from './seed/seed.controller';
import { AdminController } from './admin.controller';

@Module({
  imports: [PrismaModule, ViewsModule, MockVehiclesModule],
  controllers: [SeedController, AdminController],
  providers: [SeedService],
})
export class AppModule {}
```

---

### Task 3: 重写 ViewsService (TypeORM → Prisma)

**Files:**
- Delete: `server/src/views/entities/view.entity.ts`
- Delete: `server/src/views/entities/view-override.entity.ts`
- Modify: `server/src/views/views.service.ts`
- Modify: `server/src/views/views.module.ts`

- [ ] **Step 1: 删除 entities 目录**

```bash
rm -rf "D:/threejs/3D/server/src/views/entities"
```

- [ ] **Step 2: 重写 ViewsService**

```typescript
// server/src/views/views.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateViewDto } from './dto/create-view.dto';
import { UpdateViewDto } from './dto/update-view.dto';
import { CreateOverrideDto } from './dto/create-override.dto';

@Injectable()
export class ViewsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.view.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async findOne(key: string) {
    const view = await this.prisma.view.findUnique({ where: { key } });
    if (!view) throw new NotFoundException(`View "${key}" not found`);
    return view;
  }

  async create(dto: CreateViewDto) {
    const existing = await this.prisma.view.findUnique({ where: { key: dto.key } });
    if (existing) throw new ConflictException(`View "${dto.key}" already exists`);
    return this.prisma.view.create({ data: dto as any });
  }

  async update(key: string, dto: UpdateViewDto) {
    await this.findOne(key);
    return this.prisma.view.update({ where: { key }, data: dto as any });
  }

  async remove(key: string) {
    await this.findOne(key);
    await this.prisma.viewOverride.deleteMany({ where: { viewKey: key } });
    await this.prisma.view.delete({ where: { key } });
  }

  async findAllWithOverrides() {
    const views = await this.prisma.view.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { overrides: true },
    });
    return views.map(v => {
      const ov = v.overrides?.[0] || null;
      return {
        ...v,
        overridePos: ov ? { x: ov.posX, y: ov.posY, z: ov.posZ } : null,
        overrideTarget: ov ? { x: ov.targetX, y: ov.targetY, z: ov.targetZ } : null,
        effectivePos: ov ? { x: ov.posX, y: ov.posY, z: ov.posZ } : { x: v.posX, y: v.posY, z: v.posZ },
        effectiveTarget: ov ? { x: ov.targetX, y: ov.targetY, z: ov.targetZ } : { x: v.targetX, y: v.targetY, z: v.targetZ },
      };
    });
  }

  async getOverrides() {
    return this.prisma.viewOverride.findMany();
  }

  async setOverride(dto: CreateOverrideDto) {
    await this.findOne(dto.viewKey);
    return this.prisma.viewOverride.upsert({
      where: { viewKey: dto.viewKey },
      update: { posX: dto.posX, posY: dto.posY, posZ: dto.posZ, targetX: dto.targetX, targetY: dto.targetY, targetZ: dto.targetZ },
      create: dto as any,
    });
  }

  async deleteOverride(viewKey: string) {
    await this.prisma.viewOverride.deleteMany({ where: { viewKey } });
  }
}
```

- [ ] **Step 3: 更新 ViewsModule**

```typescript
// server/src/views/views.module.ts
import { Module } from '@nestjs/common';
import { ViewsController } from './views.controller';
import { ViewsService } from './views.service';

@Module({
  controllers: [ViewsController],
  providers: [ViewsService],
  exports: [ViewsService],
})
export class ViewsModule {}
```

---

### Task 4: 重写 SeedService (Prisma)

**Files:**
- Modify: `server/src/seed/seed.service.ts`

- [ ] **Step 1: 重写 SeedService**

读 `server/src/seed/seed.service.ts` 全文，替换为 PrismaClient 方式：

```bash
# Kill old server process first
taskkill -f -im node.exe 2>/dev/null; sleep 1
```

```typescript
// server/src/seed/seed.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const VIEWS_SEED = [ /* 原有 6 个视角数据，chartConfig 照搬不缩水 */ ];

const MOCK_VEHICLES_SEED = [
  { name:'Hennessy Venom GT', brand:'Hennessy', country:'USA', year:2010, hp:1244, torque:1155, acceleration:2.7, topSpeed:301, weight:1350, engine:'V8 双涡轮', price:95, fuelConsumption:19.8, displacement:6.6, driveType:'后驱', category:'燃油' },
  { name:'Koenigsegg Agera RS', brand:'Koenigsegg', country:'Sweden', year:2015, hp:1360, torque:1011, acceleration:2.8, topSpeed:447, weight:1395, engine:'V8 双涡轮', price:250, fuelConsumption:18.5, displacement:5.0, driveType:'后驱', category:'燃油' },
  { name:'Bugatti Chiron', brand:'Bugatti', country:'France', year:2016, hp:1579, torque:1600, acceleration:2.4, topSpeed:420, weight:1995, engine:'W16 四涡轮', price:300, fuelConsumption:22.5, displacement:8.0, driveType:'四驱', category:'燃油' },
  { name:'Koenigsegg Jesko', brand:'Koenigsegg', country:'Sweden', year:2020, hp:1603, torque:1500, acceleration:2.5, topSpeed:483, weight:1420, engine:'V8 双涡轮', price:280, fuelConsumption:17.0, displacement:5.0, driveType:'后驱', category:'燃油' },
  { name:'Rimac Nevera', brand:'Rimac', country:'Croatia', year:2021, hp:1914, torque:2360, acceleration:1.8, topSpeed:412, weight:2150, engine:'电动四电机', price:240, fuelConsumption:0, displacement:0, driveType:'四驱', category:'电动' },
  { name:'SSC Tuatara', brand:'SSC', country:'USA', year:2020, hp:1750, torque:1340, acceleration:2.5, topSpeed:455, weight:1247, engine:'V8 双涡轮', price:190, fuelConsumption:16.5, displacement:6.9, driveType:'后驱', category:'燃油' },
  { name:'McLaren Speedtail', brand:'McLaren', country:'UK', year:2019, hp:1070, torque:1150, acceleration:2.9, topSpeed:403, weight:1430, engine:'V8 混动', price:225, fuelConsumption:11.5, displacement:4.0, driveType:'后驱', category:'混动' },
  { name:'Aston Martin Valkyrie', brand:'Aston Martin', country:'UK', year:2021, hp:1160, torque:900, acceleration:2.5, topSpeed:362, weight:1030, engine:'V12 自吸', price:320, fuelConsumption:15.2, displacement:6.5, driveType:'后驱', category:'混动' },
  { name:'Porsche 918 Spyder', brand:'Porsche', country:'Germany', year:2013, hp:887, torque:940, acceleration:2.6, topSpeed:345, weight:1634, engine:'V8 混动', price:185, fuelConsumption:8.5, displacement:4.6, driveType:'四驱', category:'混动' },
  { name:'Ferrari LaFerrari', brand:'Ferrari', country:'Italy', year:2013, hp:963, torque:900, acceleration:2.6, topSpeed:349, weight:1585, engine:'V12 混动', price:220, fuelConsumption:12.8, displacement:6.3, driveType:'后驱', category:'混动' },
  { name:'McLaren P1', brand:'McLaren', country:'UK', year:2013, hp:916, torque:900, acceleration:2.8, topSpeed:350, weight:1495, engine:'V8 混动', price:186, fuelConsumption:10.2, displacement:3.8, driveType:'后驱', category:'混动' },
  { name:'Lamborghini Revuelto', brand:'Lamborghini', country:'Italy', year:2023, hp:1015, torque:1062, acceleration:2.5, topSpeed:350, weight:1772, engine:'V12 混动', price:160, fuelConsumption:14.5, displacement:6.5, driveType:'四驱', category:'混动' },
];

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.view.count();
    if (count === 0) {
      console.log('[Seed] 初始化视角数据...');
      for (const v of VIEWS_SEED) await this.prisma.view.create({ data: v as any });
      console.log(`[Seed] 导入 ${VIEWS_SEED.length} 个视角`);
    }

    const mc = await this.prisma.mockVehicle.count();
    if (mc === 0) {
      console.log('[Seed] 初始化 Mock 车辆数据...');
      for (const v of MOCK_VEHICLES_SEED) await this.prisma.mockVehicle.create({ data: v as any });
      console.log(`[Seed] 导入 ${MOCK_VEHICLES_SEED.length} 款车型`);
    }
  }

  async reSeedViews() {
    await this.prisma.viewOverride.deleteMany();
    await this.prisma.view.deleteMany();
    for (const v of VIEWS_SEED) await this.prisma.view.create({ data: v as any });
    return { message: `重新导入 ${VIEWS_SEED.length} 个视角` };
  }
}
```

（VIEWS_SEED 数组从原 seed.service.ts 全文搬移，chartConfig 保持不变）

- [ ] **Step 2: 删除旧 dist 并重新构建**

```bash
cd "D:/threejs/3D/server"
rm -rf dist
npx nest build
```

---

### Task 5: 创建 MockVehiclesModule

**Files:**
- Create: `server/src/mock-vehicles/mock-vehicles.module.ts`
- Create: `server/src/mock-vehicles/mock-vehicles.controller.ts`
- Create: `server/src/mock-vehicles/mock-vehicles.service.ts`

- [ ] **Step 1: 创建 service**

```typescript
// server/src/mock-vehicles/mock-vehicles.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MockVehiclesService {
  constructor(private prisma: PrismaService) {}

  findAll() { return this.prisma.mockVehicle.findMany({ orderBy: { year: 'asc' } }); }

  async findOne(id: number) {
    const v = await this.prisma.mockVehicle.findUnique({ where: { id } });
    if (!v) throw new NotFoundException();
    return v;
  }

  async create(data: any) { return this.prisma.mockVehicle.create({ data }); }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.mockVehicle.delete({ where: { id } });
  }
}
```

- [ ] **Step 2: 创建 controller**

```typescript
// server/src/mock-vehicles/mock-vehicles.controller.ts
import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { MockVehiclesService } from './mock-vehicles.service';

@Controller('api/mock-vehicles')
export class MockVehiclesController {
  constructor(private svc: MockVehiclesService) {}
  @Get() findAll() { return this.svc.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(+id); }
  @Post() create(@Body() body: any) { return this.svc.create(body); }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(+id); }
}
```

- [ ] **Step 3: 创建 module**

```typescript
// server/src/mock-vehicles/mock-vehicles.module.ts
import { Module } from '@nestjs/common';
import { MockVehiclesController } from './mock-vehicles.controller';
import { MockVehiclesService } from './mock-vehicles.service';

@Module({
  controllers: [MockVehiclesController],
  providers: [MockVehiclesService],
})
export class MockVehiclesModule {}
```

- [ ] **Step 4: 构建验证**

```bash
cd "D:/threejs/3D/server"
npx nest build
```

---

### Task 6: 重建数据库 + 启动测试

**Files:** 无（操作步骤）

- [ ] **Step 1: 重建表并 seed**

```bash
taskkill -f -im node.exe 2>/dev/null; sleep 1
PGPASSWORD=123456 "D:/Program Files/PostgreSQL/18/bin/psql" -h localhost -p 5432 -U postgres -d car3d_admin <<'EOSQL'
DROP TABLE IF EXISTS view_overrides CASCADE;
DROP TABLE IF EXISTS views CASCADE;
DROP TABLE IF EXISTS mock_vehicles CASCADE;
EOSQL
```

- [ ] **Step 2: Prisma db push + 启动测试**

```bash
cd "D:/threejs/3D/server"
npx prisma db push
npx prisma generate
node dist/main.js &
sleep 5
curl -s http://localhost:3000/api/views | python3 -c "import json,sys;d=json.load(sys.stdin);print(f'Views: {len(d)}')"
curl -s http://localhost:3000/api/mock-vehicles | python3 -c "import json,sys;d=json.load(sys.stdin);print(f'Mock: {len(d)} vehicles')"
```

预期输出：`Views: 6` + `Mock: 12 vehicles`

---

### Task 7: 更新管理后台 Mock 数据展示

**Files:**
- Modify: `server/public/admin.html`

读 `server/public/admin.html` 全文，找到数据概览页（`#page-data`）的 JS 部分做以下替换：

1. `renderMockTable()` 中 `MOCK_DATA` 数组删除，改为 `fetch(API+'/mock-vehicles')` 数据驱动
2. `initMockCharts()` 中所有硬编码数据改为从 `fetch(API+'/mock-vehicles')` 计算
3. 新增分类统计图表（品牌柱状图、年份饼图）

关键改动点：

```javascript
// 替换 renderMockTable 中的硬编码数据：
async function renderMockTable(){
  var res=await fetch(API+'/mock-vehicles');
  var data=await res.json();
  var h=document.getElementById('mockBody');
  h.innerHTML=data.map(function(d){
    return '<tr><td style="font-weight:600;color:var(--ink)">'+d.name+'</td><td>'+d.hp+'</td><td>'+d.torque+'</td><td>'+d.acceleration+'s</td><td>'+d.topSpeed+'</td><td>'+d.weight+'kg</td><td>'+d.engine+'</td><td>'+d.year+'</td></tr>';
  }).join('');
  document.getElementById('sMock').textContent=data.length;
}

// initMockCharts 函数内所有 echart.init().setOption() 的 data 属性
// 从硬编码数组改为从 data.map() 计算
```

具体改动：
- 品牌柱状图：按 brand 分组计算 avg(hp)，show top brands
- 年份饼图：按 year 分段统计（≤2013 / 2014-2019 / 2020+）
- 雷达图：保持 4 款标杆车型，从 API 数据中按 name 筛选
- 圈速图：保留硬编码圈速（赛道圈速不是车型参数，无法从 mock_vehicles 推）

- [ ] **Step 1: 在 `<script>` 中修改数据加载逻辑**

将 `renderMockTable` 改为 `async`，从 API fetch 数据。修改 `window.onload` 中调用顺序。

- [ ] **Step 2: 修改 `initMockCharts` 为数据驱动**

接收从 API 获取的 data 参数，动态计算图表配置。

- [ ] **Step 3: 验证**

```bash
curl -s http://localhost:3000/admin | python3 -c "import sys;h=sys.stdin.read();print('API驱动:', 'mock-vehicles' in h);print('Table:', 'mockBody' in h);print('Charts:', 'mRadar' in h)"
```

---

### Task 8: 文档 — 后端框架文档

**Files:**
- Create: `docs/backend/architecture.md`
- Create: `docs/backend/api.md`
- Create: `docs/backend/database.md`

- [ ] **Step 1: 写 `docs/backend/architecture.md`**

覆盖：目录树、技术栈、模块清单、Entity 关系、踩坑记录、启动步骤。

```markdown
# 后端架构

## 技术栈
- NestJS 11 + Prisma 6 + PostgreSQL 18

## 目录结构
server/
├── prisma/              # Prisma schema + migrations
├── src/
│   ├── prisma/          # PrismaService（全局单例）
│   ├── views/           # 视角管理模块
│   ├── mock-vehicles/   # Mock 车辆数据模块
│   └── seed/            # 初始化数据导入
└── public/              # 静态文件（管理后台）

## Entity 关系
View 1→* ViewOverride (onDelete: Cascade)

## 踩坑记录
1. PostgreSQL 列名 camelCase → SQL 中需双引号包围
2. Prisma schema 用 @@map 映射到实际表名
3. CORS 配置：enableCors({ origin: ['http://localhost:5173','http://localhost:5180'], credentials: true })

## 启动
cd server && npm run start:dev
```

- [ ] **Step 2: 写 `docs/backend/api.md`**

```markdown
# API 端点点清单

## Views
GET    /api/views            # 全量视角（含覆盖合并）
GET    /api/views/:key       # 单个
POST   /api/views            # 新增
PATCH  /api/views/:key       # 更新
DELETE /api/views/:key       # 删除

## Overrides
GET    /api/overrides                # 所有覆盖
PUT    /api/overrides/:viewKey       # 设置覆盖
DELETE /api/overrides/:viewKey       # 删除覆盖

## Mock Vehicles
GET    /api/mock-vehicles           # 全量
GET    /api/mock-vehicles/:id       # 单个
POST   /api/mock-vehicles           # 新增
DELETE /api/mock-vehicles/:id       # 删除

## System
POST   /api/seed              # 重新导入初始数据
GET    /admin                 # 管理后台页面
```

- [ ] **Step 3: 写 `docs/backend/database.md`**

```markdown
# 数据库结构

数据库: car3d_admin

## views
key VARCHAR(50) PK — front/side/45/interior/doors/wheels
...（字段清单从 schema.prisma 整理）

## view_overrides
id SERIAL PK
viewKey VARCHAR(50) UNIQUE FK→views

## mock_vehicles
id SERIAL PK
...（14 个字段，含 brand/year/hp/torque/acceleration...）
```

---

### Task 9: 文档 — 前端架构文档

**Files:**
- Create: `docs/frontend/architecture.md`
- Create: `docs/frontend/components.md`

- [ ] **Step 1: 写 `docs/frontend/architecture.md`**

```markdown
# 前端架构

## 技术栈
React 19 + Three.js 0.184 + GSAP 3.15 + ECharts 6 + Vite 8

## 目录结构
src/
├── App.tsx       # 主组件（场景初始化 + HUD + 面板 + 管理入口）
├── index.css     # CSS 变量体系 + 赛道风 UI
└── main.tsx      # 入口

## 核心流程
1. useGSAP 初始化 Three.js 场景
2. GLTFLoader 加载车身模型
3. OrbitControls 相机控制
4. Hotspot 点击 → GSAP 飞镜 + 面板动画
5. 齿轮图标 → 管理员登录 → 打开后台

## 关键约定
1. CSS 变量在 :root 中定义，组件级不使用硬编码色值
2. Three.js 资源在 useGSAP cleanup 中 dispose
3. GSAP timeline 用 ref 存储，unmount 时 kill
4. ECharts 实例用 ref 存储，dispose 前先 clear
```

- [ ] **Step 2: 写 `docs/frontend/components.md`**

组件树文档，简要描述每个主要部分。

---

### Task 10: CLAUDE.md 三文件

**Files:**
- Create: `CLAUDE.md`
- Create: `docs/frontend/CLAUDE.md`
- Create: `docs/backend/CLAUDE.md`

每条 ≤200 行。

- [ ] **Step 1: 根目录 CLAUDE.md**

```markdown
# Hennessy Venom GT — 3D 展示项目

React + Three.js 前端 + NestJS + PostgreSQL 后端。

## 快速启动
前端: `cd D:/threejs/3D && npm run dev`
后端: `cd D:/threejs/3D/server && npm run start:dev`
管理后台: http://localhost:3000/admin (账号 admin/123456)

## 目录结构
/3D/                — React 前端 (Vite + Three.js + GSAP)
/3D/server/         — NestJS 后端 (Prisma + PostgreSQL)
/3D/docs/           — 文档体系

## Git 提交格式
feat: 新功能 / fix: 修复 / docs: 文档 / chore: 构建/工具 / refactor: 重构

@see docs/frontend/CLAUDE.md
@see docs/backend/CLAUDE.md
```

- [ ] **Step 2: `docs/frontend/CLAUDE.md`**

覆盖：组件规范、Three.js dispose、GSAP cleanup、ECharts 实例管理、CSS 变量、已踩坑。

- [ ] **Step 3: `docs/backend/CLAUDE.md`**

覆盖：模块规范、Prisma 使用约定、DTO 校验、CORS、Seed 机制、已踩坑。

---

### Task 11: Git 初始化 + 最终提交

**Files:** 无（Git 操作）

- [ ] **Step 1: 初始化 Git 并提交**

```bash
cd "D:/threejs/3D"
git init
git add -A
git commit -m "feat: 初始化项目，含 3D 展示前端 + NestJS 后端 + Prisma + 管理后台"
```

- [ ] **Step 2: 创建 `.gitignore`**

检查已有 `.gitignore`，确保包含：
```
node_modules/
dist/
server/dist/
server/node_modules/
.env
*.local
```

---
