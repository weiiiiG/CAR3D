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

## 踩坑记录

1. **HMR 后 GSAP timeline 重复执行**：Vite HMR 更新组件时，`useGSAP` 的 cleanup 可能未正确销毁旧 timeline，导致多次初始化。确保 `useRef` 存储的 timeline 在 cleanup 中执行 `kill()`。
2. **Overlay z-index 层级**：
   - LoadingOverlay: `z-index: 100`
   - LoginModal / ViewManagerPanel: `z-index: 50`
   - Toast 提示: `z-index: 200`
   - 确保 Toast 始终在最顶层。
3. **OrbitControls 与弹窗交互冲突**：弹窗（AnnotationPanel / LoginModal）打开时，OrbitControls 仍然响应鼠标事件，导致视角误操作。解决方案：弹窗显示时调用 `ctrlRef.current.enabled = false`，关闭时恢复 `true`。
4. **`useGSAP` 不能跨组件传递 scope**：子组件的 `useGSAP({scope: parentRef})` 会导致 GSAP 上下文无法正确初始化，回调被跳过。Three.js 场景初始化不需要 GSAP 上下文管理，应使用 `useEffect` 替代 `useGSAP`。
5. **`contextSafe` 移除后残留括号**：去掉 `contextSafe((fn)=>{...})` 后多一个 `)`，Vite 编译时报 "Expected a semicolon" 错误。加载器回调参数括号需同步清理。
6. **RGBELoader 已废弃**：Three.js 0.184 中 `RGBELoader` 替换为 `HDRLoader`。旧用法需 PMREMGenerator 处理，新用法直接 `HDRLoader.load()` 返回的 texture 设置 `mapping = EquirectangularReflectionMapping` 即可作为 `scene.environment`。
