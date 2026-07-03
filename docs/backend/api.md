# API 端点清单

**Base URL:** `http://localhost:3000/api`

## Views

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/views` | 全量视角（含覆盖合并后的 effectivePos/effectiveTarget） |
| GET | `/api/views/:key` | 单个视角详情 |
| POST | `/api/views` | 新增视角 |
| PATCH | `/api/views/:key` | 更新视角字段 |
| DELETE | `/api/views/:key` | 删除视角（级联删除关联覆盖） |

## Overrides

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/overrides` | 所有覆盖记录 |
| PUT | `/api/overrides/:viewKey` | 设置/更新覆盖（upsert） |
| DELETE | `/api/overrides/:viewKey` | 删除覆盖（还原默认） |

## Mock Vehicles

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/mock-vehicles` | 全量车辆数据 |
| GET | `/api/mock-vehicles/:id` | 单个车辆 |
| POST | `/api/mock-vehicles` | 新增车辆 |
| DELETE | `/api/mock-vehicles/:id` | 删除车辆 |

## System

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/seed` | 重新导入所有初始数据（views + mock_vehicles） |
| GET | `/admin` | 管理后台页面 |
