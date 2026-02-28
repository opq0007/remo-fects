# Text Rain Effect - 文字雨特效

这是一个使用 Remotion 创建的文字雨特效视频模板项目，支持文字、图片、祝福图案等多种内容类型。

## 功能特性

- ✨ 文字/图片/祝福图案像雨滴一样飘落或上升
- 🎨 支持多种内容类型：文字、图片、祝福图案、混合模式
- 🎁 内置祝福图案：金币、金钱袋、福袋、红包
- 🔄 支持雨滴方向：从上到下或从下到上
- 📝 支持文字横排或竖排
- 🖼️ 支持背景图片、视频或纯色背景
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
- 调整参数（内容类型、文字、图案、密度等）
- 导出视频

### API 调用

启动统一的 API 服务器（在 `remo-fects/api` 目录）：

```bash
cd ../api
npm run api
```

然后通过 API 创建渲染任务。

## 内容类型 (contentType)

### 1. text - 纯文字模式

```bash
curl -X POST http://localhost:3001/api/render/text-rain-effect \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "text",
    "words": ["福", "禄", "寿", "喜"],
    "textDirection": "vertical",
    "fallDirection": "down",
    "duration": 5
  }'
```

### 2. image - 纯图片模式

```bash
curl -X POST http://localhost:3001/api/render/text-rain-effect \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "image",
    "images": ["pic1.png", "pic2.png", "pic3.png"],
    "imageSizeRange": [80, 150],
    "duration": 5
  }'
```

### 3. blessing - 祝福图案模式

```bash
curl -X POST http://localhost:3001/api/render/text-rain-effect \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "blessing",
    "blessingTypes": ["goldCoin", "moneyBag", "luckyBag", "redPacket"],
    "fallDirection": "up",
    "duration": 5
  }'
```

### 4. mixed - 混合模式

支持文字、图片、祝福图案的自由组合：

```bash
# 文字 + 祝福图案
curl -X POST http://localhost:3001/api/render/text-rain-effect \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "mixed",
    "words": ["福", "禄", "寿"],
    "blessingTypes": ["goldCoin", "redPacket"],
    "duration": 5
  }'

# 图片 + 祝福图案
curl -X POST http://localhost:3001/api/render/text-rain-effect \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "mixed",
    "images": ["logo.png"],
    "imageWeight": 0.3,
    "blessingTypes": ["goldCoin", "moneyBag"],
    "duration": 5
  }'

# 三种类型混合
curl -X POST http://localhost:3001/api/render/text-rain-effect \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "mixed",
    "words": ["新年快乐"],
    "images": ["mascot.png"],
    "blessingTypes": ["redPacket"],
    "duration": 5
  }'
```

## 参数说明

### 内容配置

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| contentType | string | 内容类型：`text` \| `image` \| `blessing` \| `mixed` | `text` |
| words | string[] | 文字列表（text/mixed 模式必填） | `[]` |
| images | string[] | 图片路径列表（image/mixed 模式必填） | `[]` |
| imageWeight | number | mixed 模式下图片出现权重 (0-1) | `0.5` |
| blessingTypes | string[] | 祝福图案类型列表（blessing/mixed 模式必填） | `[]` |
| blessingStyle | object | 祝福图案样式配置 | 见下表 |

### 祝福图案类型 (blessingTypes)

| 值 | 说明 |
|------|------|
| `goldCoin` | 金币 - 外圆内方的穿孔钱样式 |
| `moneyBag` | 金钱袋 - 金色袋子配金币装饰 |
| `luckyBag` | 福袋 - 红色袋子配"福"字 |
| `redPacket` | 红包 - 红色封包装饰 |

### 祝福图案样式 (blessingStyle)

```typescript
{
  primaryColor: "#FFD700",    // 主色调
  secondaryColor: "#FFA500",  // 次要色调
  enable3D: true,             // 启用3D效果
  enableGlow: true,           // 启用发光效果
  glowIntensity: 1,           // 发光强度 (0-2)
  animated: false             // 启用动画
}
```

### 运动配置

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| fallDirection | string | 雨滴方向：`down`(从上到下) \| `up`(从下到上) | `down` |
| textDirection | string | 文字方向：`horizontal`(横排) \| `vertical`(竖排) | `horizontal` |
| fallSpeed | number | 下落/上升速度系数 | `0.15` |
| density | number | 雨滴密度 | `2` |
| laneCount | number | 列道数量 | `6` |
| minVerticalGap | number | 最小垂直间距 | `100` |

### 尺寸和样式

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| fontSizeRange | [number, number] | 字体大小范围 | `[80, 160]` |
| imageSizeRange | [number, number] | 图片大小范围 | `[80, 150]` |
| opacityRange | [number, number] | 透明度范围 | `[0.6, 1]` |
| rotationRange | [number, number] | 旋转角度范围 | `[-10, 10]` |
| textStyle | object | 文字样式配置 | 见下表 |

### 文字样式 (textStyle)

```typescript
{
  color: "#ffd700",           // 文字颜色
  effect: "gold3d",           // 特效类型：gold3d | glow | shadow | none
  effectIntensity: 0.9,       // 特效强度 (0-1)
  fontWeight: 700,            // 字重
  letterSpacing: 4            // 字间距
}
```

### 背景配置

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| backgroundType | string | 背景类型：`color` \| `image` \| `video` \| `gradient` | `color` |
| backgroundColor | string | 背景颜色 | `#1a1a2e` |
| backgroundSource | string | 背景文件路径 | - |
| overlayColor | string | 遮罩颜色 | `#000000` |
| overlayOpacity | number | 遮罩透明度 | `0.2` |

### 公共参数

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| width | number | 视频宽度 | `720` |
| height | number | 视频高度 | `1280` |
| fps | number | 帧率 | `24` |
| duration | number | 视频时长（秒） | `10` |
| seed | number | 随机种子 | 随机 |

## 使用示例

### 竖排文字从下往上升

```bash
curl -X POST http://localhost:3001/api/render/text-rain-effect \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "text",
    "words": ["步步高升", "财源广进", "吉祥如意"],
    "textDirection": "vertical",
    "fallDirection": "up",
    "textStyle": {
      "color": "#ffd700",
      "effect": "gold3d"
    }
  }'
```

### 新年红包雨

```bash
curl -X POST http://localhost:3001/api/render/text-rain-effect \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "blessing",
    "blessingTypes": ["redPacket", "goldCoin"],
    "fallDirection": "down",
    "density": 3,
    "backgroundColor": "#8B0000"
  }'
```

### 招财进宝

```bash
curl -X POST http://localhost:3001/api/render/text-rain-effect \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "mixed",
    "words": ["招财进宝", "财源滚滚"],
    "blessingTypes": ["goldCoin", "moneyBag"],
    "blessingStyle": {
      "primaryColor": "#FFD700",
      "enableGlow": true
    },
    "fallDirection": "up"
  }'
```

### 带背景视频

```bash
curl -X POST http://localhost:3001/api/render/text-rain-effect \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "text",
    "words": ["新年快乐", "龙年大吉"],
    "backgroundType": "video",
    "backgroundSource": "background.mp4",
    "overlayOpacity": 0.4
  }'
```

## 项目结构

```
text-rain-effect/
├── public/              # 静态资源 (背景图片/视频)
│   ├── 熊猫.png
│   └── coin-sound.mp3
├── src/
│   ├── index.ts        # 入口文件
│   ├── Root.tsx        # Remotion 根组件
│   ├── TextRain.tsx    # 文字雨特效核心组件
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
- mixed 模式下至少需要提供 `words`、`images` 或 `blessingTypes` 中的一种