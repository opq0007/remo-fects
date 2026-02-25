# Text Rain Effect - 文字雨特效

这是一个使用 Remotion 创建的文字雨特效视频模板项目。

## 功能特性

- ✨ 文字像雨滴一样从屏幕顶部飘落
- 🎨 支持自定义文字列表、颜色、大小
- 🖼️ 支持背景图片、视频或纯色背景
- 🎬 多种预设模板可选
- ⚙️ 参数化配置，可在 Remotion Studio 中实时调整
- 🔌 支持 API 调用生成视频

## 快速开始

### 本地开发

```bash
cd text-rain-effect
npm install
npm start
```

这将打开 Remotion Studio，你可以在其中：
- 预览视频效果
- 调整参数（文字、颜色、密度等）
- 导出视频

### API 调用

启动统一的 API 服务器（在 `remo-fects/api` 目录）：

```bash
cd ../api
npm run api
```

然后通过 API 创建渲染任务：

```bash
curl -X POST http://localhost:3001/api/render/text-rain-effect \
  -H "Content-Type: application/json" \
  -d '{
    "words": ["一马平川", "平安喜乐"],
    "textDirection": "vertical",
    "duration": 5
  }'
```

## 参数说明

### 文字雨配置

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| words | string[] | 要显示的文字列表 | ["一马平川", "平安喜乐", ...] |
| textColor | string | 文字颜色 | #ffffff |
| density | number | 雨滴密度 (每秒数量) | 3 |
| fallSpeed | number | 下落速度系数 | 1 |
| fontSizeRange | [number, number] | 字体大小范围 | [32, 80] |
| opacityRange | [number, number] | 透明度范围 | [0.5, 0.95] |
| rotationRange | [number, number] | 旋转角度范围 | [-10, 10] |
| seed | number | 随机种子 | 42 |

### 背景配置

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| backgroundType | "image" \| "video" \| "color" | 背景类型 | color |
| backgroundSource | string | 背景文件路径 | - |
| backgroundColor | string | 背景颜色 | #1a1a2e |
| overlayColor | string | 遮罩颜色 | #000000 |
| overlayOpacity | number | 遮罩透明度 | 0.2 |

## 使用自定义背景

1. 将背景图片或视频放入 `public/` 目录
2. 在 Remotion Studio 中设置：
   - `backgroundType` = "image" 或 "video"
   - `backgroundSource` = "your-file.jpg" (文件名)

## 示例配置

### 祝福语视频

```typescript
{
  words: ["一马平川", "平安喜乐", "万事如意", "心想事成"],
  textColor: "#ffd700",
  backgroundType: "color",
  backgroundColor: "#1a1a2e"
}
```

### 带背景视频

```typescript
{
  words: ["新年快乐", "龙年大吉"],
  backgroundType: "video",
  backgroundSource: "background.mp4",
  overlayOpacity: 0.4
}
```

## 项目结构

```
text-rain-effect/
├── public/              # 静态资源 (背景图片/视频)
├── src/
│   ├── index.ts        # 入口文件
│   ├── Root.tsx        # Remotion 根组件
│   ├── TextRain.tsx    # 文字雨特效组件
│   └── TextRainComposition.tsx  # 主组合组件
├── out/                # 本地渲染输出目录
├── package.json
├── tsconfig.json
└── remotion.config.ts
```

## 注意事项

- API 相关功能已移至 `../api` 目录统一管理
- 此项目仅保留 Remotion 特效核心功能
- 通过 API 调用时，视频输出文件位于 `../api/outputs/` 目录
