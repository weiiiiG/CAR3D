# Hennessy Venom GT 3D 展示页面 — 设计稿 & 实施指南 V6

> 目标：整合参考网站动画逻辑 + ECharts 数据面板 + 3D 热点交互，形成一个完整的电影感汽车展示体验

---

## 一、体验流程全景

```
进场 → 加载屏 → 模型入画 → 闲逛模式 → 发现热点 → 探索细节 → 切换/复原
```

| 阶段 | 用户行为 | 系统响应 | 时长 |
|------|----------|----------|------|
| 1. Loading | 等待 | SVG 圆环 + 百分比 + 品牌字 stagger 入场 | 0–4s |
| 2. 入场推近 | 等待 | 加载层 fade out → 灯光渐亮 → 相机从远处推到 (8,2.5,10) | 3.5–6s |
| 3. 闲逛 | 自由拖拽/缩放 | OrbitControls 活动，3D 热点呼吸动画 | ∞ |
| 4. 预发现 (Hover) | 鼠标移到车身发光点 | 2D 折线预览（半透明虚线从部件延伸 55%） | 即时 |
| 5. 深入查看 (Click) | 点击热点 | 相机运镜 1.2s → 折线全动画 1.2s → 面板+图表 0.3s | ~2.7s |
| 6. 切换 | 点击另一热点 | 清当前 → 到步骤 5 | ~2.7s |
| 7. 复原 | 点击同一热点 | 相机复位到全景，门窗复位 | 1.0s |
| 8. 离开 | 拖拽 | 所有标注消失 | 即时 |

---

## 二、视觉设计系统

### 配色

```css
--bg:           #888A8F    /* 中性灰背景 */
--surface:      rgba(0,0,0,0.10)
--border:       rgba(0,0,0,0.18)
--text:         #FFFFFF
--text-mute:    rgba(255,255,255,0.60)
--accent:       #FF5C26    /* 赤橙 */
--accent-strong:#E04A18
--clash:        #1A6BFF    /* 电光蓝 */
--display:      'Space Grotesk', system-ui, sans-serif
--body:         'Inter', system-ui, sans-serif
```

### 地面过渡

三层材质（由下至上）：
1. 径向渐变底平面（半径 30）：中心 #9A9CA1 → 外围 #888A8F（融入 body bg），opacity 0.85
2. MeshStandard 地面（半径 20）：#929498，metalness 0.3，roughness 0.45，opacity 0.9
3. 阴影 disc（半径 3.5）：径向渐变 rgba(黑→0)，opacity 0.55

### 字体

| 用途 | 字体 | 字重 | 大小 | 追踪 | 颜色 |
|------|------|------|------|------|------|
| 品牌名 | Space Grotesk | 600 | 15px | 0.22em | white |
| 车型标签 | Inter | 400 | 11px | 0.04em | text-mute |
| 按钮文字 | Inter | 500 | 10px | 0.06em | text-mute |
| 面板标题 | Space Grotesk | 600 | 13px | 0.04em | white |
| 面板正文 | Inter | 400 | 11px | — | text-mute |
| 面板 spec | Space Grotesk | 600 | 12px | — | accent→clash gradient |
| 提示文字 | Inter | 400 | 10px | 0.04em | text-mute |

---

## 三、3D 场景

### 相机

| 预设 | pos | target | 用途 |
|------|-----|--------|------|
| 默认全景 | (8, 2.5, 10) | (0, 0.6, 0) | 入场 + 复位 |
| front | (0, 1.8, 8.5) | (0, 0.6, 0) | 前脸热点 |
| side | (9, 1.5, 0.1) | (0, 0.6, 0) | 侧身热点 |
| 45° | (6, 3, 6) | (0, 0.6, 0) | 驾驶舱热点 |
| interior | (-0.05, 0.58, 0.35) | (0, 0.3, 3.2) | 内饰热点——驾驶座视角向前看路+方向盘 |
| doors | (1.5, 1.2, 1.0) | (0.6, 0.5, 0) | 车门热点 |
| wheels | (2.2, 0.4, 3.5) | (1.0, 0.3, 1.8) | 车轮热点 |

近裁面: `0.02`（避免内饰视角被方向盘 clip）

### 灯光（四灯方案）

| 灯光 | 类型 | 位置 | Intensity | 颜色 | 备注 |
|------|------|------|-----------|------|------|
| Hemi | Hemisphere | — | 0.55 | sky 0xa6b0ff / grd 0x101015 | 环境光 |
| Key | Directional | (6, 9, 4) | 2.8 | 0xffffff | 主光，开启阴影 1024 |
| Rim | Directional | (-7, 4, -5) | 1.0 | 0xc8d0ff | 侧逆轮廓光 |
| Accent | Point | (0, 1.5, 4) | 0.6 | 0xff8844 | 暖色补光 |

### 模型处理

- 模型加载后 Box3 居中 + 落到地面 y = 0
- `model.traverse` 设 all mesh castShadow, NOT receiveShadow
- 窗口材质名含 `window|glass` → 设 `material.side = THREE.DoubleSide`
- OrbitControls: damping 0.08, minDist 0.5, maxDist 25, 入场时 disabled

### HDR 环境贴图

- RGBELoader 加载 `/env/studio_small_09_1k.hdr`（1K 分辨率，~1.2MB）
- PMREMGenerator → scene.environment（不设 background，用 CSS #888A8F 底色透明透过）

---

## 四、Canvas 2D 折线系统

### 架构

```
Three.js canvas (底层)
  → 3D 场景 + 模型 + 灯光 + 阴影
  
HTML Canvas overlay (pointer-events: none)
  → 绘制折线 + 小圆点 + 光晕尾迹
  
HTML 标注面板 (z-index: 15)
  → 文字内容 + ECharts 图表
```

### 路径预计算 (computePath)

每帧（ticker 内）hover 检测到新热点或 camera 移动后，调用 `computePath(key)`：

```
1. origin 世界坐标 → camera.project → 屏幕 (ox, oy)
2. 面板锚点 (ex, ey) = clamp 在视口内的右侧区域
3. 弯折点 (mx, my) = 插值 + 向上偏移
4. 100 步二次贝塞尔曲线 → 存入 linePaths[key]
```

### 预览线 (drawPreview, Hover 时)

| 属性 | 值 |
|------|-----|
| 长度 | 全路径 55% |
| 线型 | 虚线 `[3, 5]` |
| 线宽 | 1.5px |
| 颜色 | #FF5C26 |
| opacity | 0.35 |
| 终点 | 小圆点 radius 4，实心 #FF5C26 |

### 全动画线 (drawAnim, Click 时)

GSAP timeline：

```
0.0s  → lineMat.opacity 0→0.85 (0.1s ease-out)
0.1s  → idx: 0→100, power4.in (1.2s)
         每 onUpdate 重绘：
           - trail: idx-35 → idx, opacity 0.5, lineWidth 2
           - 重线: idx-4 → idx, opacity 0.85, lineWidth 2.5
           - 已过路径: 0 → idx-3, opacity 0.06
           - 小圆点: radial gradient glow (radius 14) + core (radius 4)
           - 预露虚线: idx → idx+5, opacity 0.1
1.1s  → dotOp: 1→0 (0.2s fade) 圆点消失
1.25s → 面板弹出 (panel-enter-anim CSS keyframes)
```

---

## 五、3D Hotspots

### 6 个热点

| key | 世界坐标 (模型局部→localToWorld) | 标签 | 特殊 action |
|-----|-------------------------------|------|-------------|
| front | center y, max z - 0.3 | Front End | — |
| side | max x, center y, 0 | Side Line | — |
| '45' | max x × 0.4, center y, max z × 0.3 | Cockpit | — |
| interior | -0.3, center y - 0.05, -0.3 | Interior | — |
| doors | max x × 0.6, center y + 0.3, max z × 0.1 | Dihedral Doors | 开门+关门前先运镜 |
| wheels | max x, center y - 0.1, max z × 0.25 | Forged Alloys | 转轮+停轮前先运镜 |

### 视觉表现

- **Hit mesh**: Sphere(radius 0.18), invisible, 用于 raycaster 检测
- **Sprite 环**: 径向渐变纹理（中心透→橙环→半透→白环→透）, scale: 0.5±0.12 呼吸动画 (gsap.ticker)
- **Hover 时**: 折线预览 + sprite scale → 0.7（将来可加）
- **Click 后**: 折线全动画 + 面板出现 + sprite scale 不变

### 交互检测

```ts
raycaster.setFromCamera(mouse, camera)  // pointermove 更新 mouse
hits = raycaster.intersectObjects(hitMeshes)
if (hits.length) hoverKey = hits[0].userData.hotspotKey

// click 检测：pointerdown + pointerup 距离 < 8px 为 click
```

---

## 六、ECharts 数据面板

### 绑定

| 热点 | 图表类型 | 数据说明 |
|------|----------|----------|
| front | 雷达图 | Horsepower 1244, Torque 1155, Top Speed 301, 0-60 2.7, Downforce 450 |
| side | 柱状图 | Length 4650, Width 1960, Height 1130, Wheelbase 2800 (mm) |
| '45' | 饼图 | Carbon 45%, Alcantara 30%, Leather 15%, Aluminium 10% |
| interior | 折线图 | RPM vs Speed 曲线 (1k→7k RPM → 15→301 mph) |
| doors | 柱状图 | 门重对比: Carbon 2.7kg, Steel 8.5kg, Aluminium 5.1kg |
| wheels | 仪表盘 | Top Speed Locked: 196km/h (max 320) |

### 样式

- 暗色卡片，和 `.panel-body` 同风格（bg rgba(0,0,0,0.65), backdrop-filter, border-left: 3px solid accent）
- 尺寸: 宽 200px, 高 150px
- 入场: panel 出现后 300ms setTimeout 调用 `echarts.init + setOption`
- 清理: `chartInst.current?.dispose()` 在 deps 变更时

---

## 七、UI 组件规格

### 加载层 (Loading Overlay)

| 元素 | 方法 | 动画 |
|------|------|------|
| 品牌标题 | 字符级 `<span className="char">` | stagger 0.035s, y:8→0, opacity 0→1 |
| 分割线 | div 80→200px | opacity 0→1 + width tween 0.8s |
| SVG 圆环 | stroke-dasharray 264, dashoffset 随 progress 变 | stroke-dashoffset CSS transition 0.3s |
| 百分比数字 | absolute 居中 | 字体 bg gradient accent→clash |
| 副标题 | "Loading assets" | opacity 0→1 0.6s |

退出：all → opacity 0, y: -10, stagger 0.04s → display: none

### 顶部栏 (Top Bar)

```
                               ┌──────────────────────────┐
     HENNESSY                  │     VENOM GT · 2010      │
  Space Grotesk 600 15px      └──────────────────────────┘
  letter-spacing 0.22em        Inter 400 11px text-mute
```

- 入场：`fromTo y: -18→0, opacity 0→1, 0.45s ease-out`
- 全程 pointer-events: none

### 标注面板 (Annotation Panel)

```
┌─ ● ─────────────────────────┐
│  panel-dot (10px circle)     │
│                              │
│  █ Front End                 │  panel-title 13px
│  █ Aggressive body kit...    │  panel-desc 11px
│  █ 1,244 hp                  │  panel-spec 12px gradient
│                              │
│  ┌──────────────────────────┐│
│  │   雷达图/ECharts         ││  chart-card 200×150
│  └──────────────────────────┘│
└──────────────────────────────┘
```

- 位置：ticker 内每帧投影 origin 到屏幕坐标，clamp 到视口
- 入场：`panel-enter-anim` CSS keyframes: 0% scale(0.8) translateX(8px) → 25% scale(1.05) translateX(-4px) → ... → 100%

### 底部提示 (Hint)

- "Drag to explore · Hover hotspots · Click for details"
- Inter 10px, opacity 0.5, 底部居中
- 入场后 5s 自动 fadeOut (gsap.delayedCall)

---

## 八、动画时机对照表

### 首屏入场

| 时间 | 动作 | duration | ease |
|------|------|----------|------|
| 0s | Loading 标题字符 stagger 入场 | 0.6s | power3.out |
| 0.2s | 分割线 opacity + width | 0.8s | power2.out |
| 0.8s | 进度环 opacity | 0.5s | — |
| 1.1s | 副标题 opacity | 0.6s | — |
| 模型加载完成 (~4s) | — | — | — |
| +0s | 加载层 fade out (all→opacity 0 + y -10) | 0.45s | stagger 0.04s |
| +0.5s | Loading display: none | — | — |
| +0s | 相机推近 (20,8,20 → 8,2.5,10) | 2.2s | power2.inOut |
| +0.1s | 四灯 intensity from 初始→目标 | 1.8s | power2.out |
| +0.15s | 阴影 opacity 0→0.55 | 1.5s | power2.out |
| +0.15s | 车身微转 -12°→0° | 2.2s | power3.out |
| — | 顶部栏 fromTo | 0.45s | power3.out |

### Hotspot Click 流程

| 时间 | 动作 | duration | ease |
|------|------|----------|------|
| 0s | kill 旧动画，清除 canvas | 0 | — |
| 0s | 相机运镜到 VIEWS[key] | 1.2s | power3.inOut |
| 0.8s | 运镜接近完成 → 计算新路径 | — | — |
| 1.2s | 运镜完成 → startLine | — | — |
| 1.2s | idx 0→100 (折线动画) | 1.2s | power4.in |
| +1.1s | 小圆点 fade out | 0.2s | — |
| +1.25s | 面板弹出 | 0.5s | panel-enter |
| +1.55s | (如有图表) 图表 init | — | — |

---

## 九、文件清单

| 文件 | 状态 | 说明 |
|------|------|------|
| `src/App.tsx` | 已存在 | 全量重写为当前代码，后续按本稿微调 |
| `src/index.css` | 已存在 | 基本完整，需验证 panel/chart 样式 |
| `index.html` | 已存在 | 标题已改，字体 link 已加 |
| `public/models/hennessy/` | 已存在 | glTF + bin + textures |
| `public/env/` | 已存在 | studio_small_09_1k.hdr |

---

## 十、实施优先级

| Pri | 模块 | 任务 | 预估 |
|-----|------|------|------|
| P0 | 基础架构 | 保证 `npx tsc -b && npx vite build` 通过 | 5min |
| P0 | Canvas 折线 | drawPreview + drawAnim 完整正确画线，终点接 panel-dot | 20min |
| P0 | Hotspot 交互 | raycaster hover + click 检测，hotspotClick 完整流程 | 20min |
| P0 | ECharts 面板 | echarts.init + setOption + dispose 生命周期 | 15min |
| P1 | 折线动画 | power4.in 弹射缓动 + trail + 光晕 + 预露虚线 | 15min |
| P1 | 面板入场 | panel-enter-anim CSS keyframes + 抖动效果 | 10min |
| P1 | 门/车轮 action | click doors→开门运镜，click wheels→转轮运镜 | 10min |
| P1 | 复位逻辑 | 同一点击复位到全景，关窗/停轮 | 10min |
| P2 | Interior 视角 | 调 (-0.05, 0.58, 0.35), target (0, 0.3, 3.2) | 5min |
| P2 | 性能 | 减少 ticker 内计算，sprite 复用 | 10min |
| P2 | 全链路测试 | Hover→Click→切换→Drag→Resize | 15min |
