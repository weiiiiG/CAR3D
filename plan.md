# 实现计划

## 需求
1. **中文UI** — 按钮、面板、提示全部中文
2. **底部栏一行** — flex-wrap 去掉，小屏可横向滚动
3. **相机不穿地** — OrbitControls.maxPolarAngle
4. **可编辑保存视角** — 保存当前相机位到 localStorage，导出为代码
5. **入场运镜** — 加载完先绕车一周，再回到默认视角

## 修改文件
- `src/App.tsx` — 新增视角管理、入场运镜、中文文本
- `src/index.css` — HUD 单行 + 中文字体调整

## 实施顺序
1. index.css 样式调整
2. App.tsx: 常量翻译、新增类型与 state
3. App.tsx: 入场运镜
4. App.tsx: 视角保存/导出
5. 验证
