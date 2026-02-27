# 金色发光立体字环绕特效 (Text Ring Effect)

基于 Remotion 的金色发光立体字环绕视频特效生成器。

## 特效描述

这个特效实现了一个酷炫的金色发光立体字环绕效果：
- 指定的文字列表会以金色发光立体字体的形式
- 围绕画面中心进行立体环绕转圈圈
- 效果酷炫，仿佛文字在为画面中心的物体进行加持、祈福

## 项目结构

```
text-ring-effect/
├── src/
│   ├── index.ts           # 入口文件
│   ├── Root.tsx           # 预设配置
│   ├── TextRing.tsx       # 环绕文字核心组件
│   └── TextRingComposition.tsx  # 主组合组件
├── public/                # 静态资源目录
├── out/                   # 输出目录
├── package.json
├── remotion.config.ts
└── tsconfig.json
```

## 安装依赖

```bash
npm install
```

## 运行项目

### 开发模式

```bash
npm start
```

### 渲染视频

```bash
# 完整渲染
npm run render

# 预览渲染（前90帧）
npm run render-preview

# Edge 渲染模式
npm run render-edge
```

## 预设列表

| 预设 ID | 描述 | 分辨率 | 时长 |
|---------|------|--------|------|
| TextRing | 默认预设 | 720x1280 | 12.5秒 |
| TextRingFast | 快速渲染版本 | 720x1280 | 7.5秒 |
| TextRingVertical | 竖屏高清 | 1080x1920 | 12.5秒 |
| TextRingHorizontal | 横屏 | 1920x1080 | 12.5秒 |
| TextRingIntense | 强烈效果 | 720x1280 | 12.5秒 |
| TextRingGentle | 温和效果 | 720x1280 | 12.5秒 |
| TextRingBlessing | 祈福祝福 | 1080x1920 | 12.5秒 |

## 配置参数

### 内容配置

- `words`: 文字列表（必填）
- `textCount`: 文字数量（4-30）

### 字体配置

- `fontSizeRange`: 字体大小范围 [最小, 最大]
- `opacityRange`: 透明度范围 [最小, 最大]

### 环绕配置

- `ringRadius`: 环绕半径（100-600）
- `rotationSpeed`: 旋转速度（0.1-3）
- `waveAmplitude`: 波浪振幅（0-100）
- `waveSpeed`: 波浪速度（0.5-3）

### 特效配置

- `glowIntensity`: 发光强度（0-2）
- `depth3d`: 3D深度层数（1-15）
- `seed`: 随机种子

### 背景配置

- `backgroundType`: 背景类型（color/image/video）
- `backgroundColor`: 背景颜色
- `backgroundSource`: 背景文件路径
- `overlayColor`: 遮罩颜色
- `overlayOpacity`: 遮罩透明度

## API 调用

### POST /api/render/text-ring-effect

```bash
curl -X POST http://localhost:3001/api/render/text-ring-effect \
  -F 'words=["平安喜乐","万事如意","福禄寿喜"]' \
  -F 'fontSizeRange=[60,80]' \
  -F 'ringRadius=280' \
  -F 'rotationSpeed=0.8' \
  -F 'textCount=12'
```

### 查询任务状态

```bash
curl http://localhost:3001/api/jobs/{jobId}
```

### 下载视频

```bash
curl http://localhost:3001/api/download/{jobId} -o output.mp4
```

## 性能优化建议

1. 降低 `textCount` 可以提高渲染速度
2. 减少 `depth3d` 层数可以加速
3. 降低 `glowIntensity` 可以减少计算量
4. 使用纯色背景比图片/视频背景快
5. 缩短 `durationInFrames` 可以快速出片

## 依赖项

- @remotion/cli ^4.0.0
- react ^18.2.0
- remotion ^4.0.0
- @remotion/zod-types ^4.0.0
- zod ^3.22.4