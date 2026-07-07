# 数据库结构

**数据库:** `car3d_admin` (PostgreSQL 18)
**ORM:** Prisma 7（通过 PrismaClient 访问）

## 表: views

| 列名 | 类型 | 说明 |
|---|---|---|
| key | VARCHAR(50) PK | 视角标识: front/side/45/interior/doors/wheels |
| label | VARCHAR(100) | 中文名 |
| description | TEXT | 描述 |
| spec | VARCHAR(200) | 规格标注 |
| specCategory | VARCHAR(50) | 分类: POWERTRAIN / AERODYNAMICS 等 |
| posX/Y/Z | DOUBLE PRECISION | 相机位置 |
| targetX/Y/Z | DOUBLE PRECISION | 相机目标点 |
| chartConfig | JSONB | ECharts 配置 |
| sortOrder | INTEGER | 排序 |
| isActive | BOOLEAN | 是否启用 |
| createdAt / updatedAt | TIMESTAMP | 时间戳 |

## 表: view_overrides

| 列名 | 类型 | 说明 |
|---|---|---|
| id | SERIAL PK | |
| viewKey | VARCHAR(50) UNIQUE FK→views | 关联视角 |
| posX/Y/Z | DOUBLE PRECISION | 覆盖的相机位置 |
| targetX/Y/Z | DOUBLE PRECISION | 覆盖的目标点 |
| createdAt / updatedAt | TIMESTAMP | 时间戳 |

## 表: mock_vehicles

| 列名 | 类型 | 说明 |
|---|---|---|
| id | SERIAL PK | |
| name | VARCHAR(100) | 车型名 |
| brand | VARCHAR(50) | 品牌 |
| country | VARCHAR(50) | 产地 |
| year | INTEGER | 年份 |
| hp | INTEGER | 马力 |
| torque | INTEGER | 扭矩 |
| acceleration | FLOAT | 0-100 km/h |
| topSpeed | INTEGER | 极速 |
| weight | INTEGER | 整备质量 |
| engine | VARCHAR(100) | 发动机 |
| price | FLOAT | 售价(万美元) |
| fuelConsumption | FLOAT | 油耗 |
| displacement | FLOAT | 排量 |
| driveType | VARCHAR(50) | 驱动方式 |
| category | VARCHAR(50) | 分类(燃油/混动/电动) |

## 表: users

| 列名 | 类型 | 说明 |
|---|---|---|
| id | SERIAL PK | |
| username | VARCHAR(50) UNIQUE | 登录名 |
| password | VARCHAR(200) | bcrypt 哈希 |
| role | VARCHAR(20) | super_admin / admin / user |
| createdAt / updatedAt | TIMESTAMP | 时间戳 |

## 表: dashboard_config

| 列名 | 类型 | 说明 |
|---|---|---|
| key | VARCHAR(50) PK | 配置标识 |
| data | JSON | ECharts 图表配置 |

## 关系
```
View (1) ──→ (N) ViewOverride (onDelete: Cascade)
```
