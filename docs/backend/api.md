# API 端点清单

**Base URL:** `http://localhost:3000/api`

## Auth

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/login` | 登录，返回 access_token + 设置 refresh_token HttpOnly Cookie |
| POST | `/api/auth/refresh` | 用 Cookie 中的 refresh_token 换取新的 access_token |
| POST | `/api/auth/logout` | 清除 refresh_token Cookie |
| GET | `/api/auth/me` | 获取当前用户信息（需 Bearer token） |

## Users（需 JWT 认证）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/users` | 用户列表 |
| POST | `/api/users` | 新增用户 |
| PATCH | `/api/users/:id` | 修改用户（用户名/角色） |
| DELETE | `/api/users/:id` | 删除用户 |

## Dashboard

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/dashboard` | 获取所有仪表盘图表配置 |
| GET | `/api/dashboard/:key` | 获取单个图表配置 |
| PUT | `/api/dashboard/:key` | 更新图表配置 |

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
| GET | `/admin.html` | 管理后台页面（通过 Vite 代理同端口服务） |
