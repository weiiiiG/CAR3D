# CLAUDE.md — 前 端 规 范

## 技术栈
React 19 + Three.js 0.184 + GSAP 3.15 + ECharts 6 + Vite 8

## 启动
```bash
cd D:/threejs/3D
npm run dev          # 开发服务器 → localhost:5180
```

## 组件规范
- 所有逻辑在 `App.tsx` 使用函数组件 + hooks
- ref 管理：`useRef` 存储 Three.js/GSAP/ECharts 实例，cleanup 时 dispose
- CSS 变量在 `index.css:root` 定义，组件用 `var(--xxx)` 引用

## Three.js 注意事项
- `useGSAP` cleanup 中必须：`gsap.ticker.remove(tick)`、`ctrl.dispose()`、`re.dispose()`
- 模型遍历 `scene.traverse` 释放 geometry/material
- 点光/方向光不需要手动 dispose，但 `PMREMGenerator` 需要 `dispose()`

## GSAP 管理
- timeline 用 `useRef` 存储
- unmount 时 `kill()` 所有 timeline/tween
- `contextSafe` 包裹异步操作中的 GSAP 动画

## ECharts
- 每次 `hot` 变化：先 `dispose()` 旧实例 → `init()` 新实例
- chart 容器在 `useRef` 中追踪

## CSS 变量体系
- `--bg`: 页面底色 `#0A0B10`
- `--surface`: 卡片/面板底色 `#14161E`
- `--accent`: 赛道黄 `#FFBC0A`
- `--display`: Bebas Neue 显示字体
- `--sans`: Inter 正文字体

## Git 提交格式
```
feat: 新功能 / fix: 修复 / docs: 文档 / chore: 构建/工具 / refactor: 重构
```
