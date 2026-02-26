# 文字破屏特效 (Text Breakthrough Effect)

## 特效描述

文字破屏特效是一种极具冲击力的3D动画效果，文字从远处快速飞向观众，最终突破屏幕定格在画面中，配合金色立体效果、碎片粒子、冲击波、闪光等特效，营造出强烈的视觉冲击感。

### 核心特性

- **3D透视动画**：文字从远处（深度2000）快速飞向镜头，最终突破屏幕（深度-100）
- **金色立体效果**：多层次的渐变色、发光和3D阴影，打造高级金属质感
- **冲击特效**：突破瞬间的缩放、旋转、震动、碎片粒子、冲击波、闪光
- **可定制定格位置**：支持自定义每个文字组的最终位置和排列方式
- **动态背景**：支持图片、视频、颜色、渐变四种背景类型
- **下落消失效果**：可选的文字停留后下落消失动画

## 本地开发

```bash
# 进入项目目录
cd effects/text-breakthrough-effect

# 启动 Remotion Studio
npm run start
```

## API 调用

### 基础接口

```http
POST http://localhost:3001/api/render/text-breakthrough-effect
Content-Type: multipart/form-data
```

### 参数说明

#### 基础参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| words | string[] | 是* | - | 文字列表，逗号分隔或JSON数组 |
| textGroups | object[] | 是* | - | 文字组配置（与words二选一） |
| duration | number | 否 | 自动计算 | 视频时长（秒） |
| fps | number | 否 | 24 | 帧率 |
| width | number | 否 | 720 | 视频宽度 |
| height | number | 否 | 1280 | 视频高度 |
| background | file | 否 | - | 背景文件（图片或视频） |
| backgroundType | string | 否 | gradient | 背景类型：image/video/color/gradient |
| backgroundSource | string | 否 | - | 背景文件路径 |
| backgroundColor | string | 否 | #0a0a20 | 背景颜色 |
| overlayColor | string | 否 | #000000 | 遮罩颜色 |
| overlayOpacity | number | 否 | 0.1 | 遮罩透明度 |

> *words 和 textGroups 二选一，必须提供其中一个

#### 文字组配置 (textGroups)

当需要更精细控制每个文字组时，使用 textGroups 参数：

```json
[
  {
    "texts": ["平安喜乐"],
    "groupDelay": 48
  },
  {
    "texts": ["健康成长"],
    "groupDelay": 48
  }
]
```

| 字段 | 类型 | 说明 |
|------|------|------|
| texts | string[] | 该组文字列表（同时出现） |
| groupDelay | number | 该组相对于上一组的延迟帧数 |

#### 定格位置配置 (finalPosition)

控制文字最终定格在画面中的位置：

```json
{
  "defaultX": 0,
  "defaultY": 0,
  "groupPositions": [
    { "x": 0, "y": -0.3, "arrangement": "circular" },
    { "x": -0.15, "y": -0.1, "arrangement": "horizontal" },
    { "x": 0.15, "y": 0.1, "arrangement": "horizontal" },
    { "x": 0, "y": 0.3, "arrangement": "circular" }
  ],
  "autoArrangement": "circular",
  "autoArrangementSpacing": 0.25
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| defaultX | number | 默认水平位置（-0.5左 到 0.5右） |
| defaultY | number | 默认垂直位置（-0.5上 到 0.5下） |
| groupPositions | object[] | 每个文字组的独立位置配置 |
| autoArrangement | string | 自动排列方式：horizontal/vertical/circular/stacked |
| autoArrangementSpacing | number | 自动排列间距 |

**排列方式说明：**
- `horizontal`：水平排列
- `vertical`：垂直排列
- `circular`：圆形/椭圆排列（默认）
- `stacked`：堆叠排列（轻微错位）

#### 字体配置

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| fontSize | number | 120 | 字体大小 |
| fontFamily | string | PingFang SC... | 字体名称 |
| fontWeight | number | 900 | 字体粗细 |

#### 3D金色效果

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| textColor | string | #ffd700 | 文字主色（金色） |
| glowColor | string | #ffaa00 | 发光颜色 |
| secondaryGlowColor | string | #ff6600 | 次要发光颜色 |
| glowIntensity | number | 1.5 | 发光强度（0.1-3） |
| bevelDepth | number | 3 | 3D立体深度（0-10） |

#### 3D透视参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| startZ | number | 2000 | 起始深度（远离镜头） |
| endZ | number | -100 | 结束深度（负数表示突破屏幕） |

#### 动画时长

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| approachDuration | number | 45 | 接近动画时长（帧） |
| breakthroughDuration | number | 20 | 突破动画时长（帧） |
| holdDuration | number | 40 | 停留时长（帧） |

#### 冲击效果

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| impactScale | number | 1.4 | 冲击时的缩放倍数（1-2） |
| impactRotation | number | 12 | 冲击时的最大旋转角度（0-30） |
| shakeIntensity | number | 10 | 震动强度（0-20） |

#### 组间延迟与运动方向

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| groupInterval | number | 50 | 文字组之间的间隔帧数 |
| direction | string | top-down | 运动方向：bottom-up/top-down |

#### 下落消失效果

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| enableFallDown | boolean | true | 是否启用下落消失效果 |
| fallDownDuration | number | 40 | 下落动画时长（帧） |
| fallDownEndY | number | 0.2 | 下落结束位置（距底部百分比） |

#### 音效配置

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| audioEnabled | boolean | false | 是否启用背景音效 |
| audioSource | string | coin-sound.mp3 | 音效文件路径 |
| audioVolume | number | 0.5 | 音量（0-2，1为正常音量） |

### 调用示例

#### 示例1：简单调用（使用默认配置）

```bash
curl -X POST http://localhost:3001/api/render/text-breakthrough-effect \
  -F "words=平安喜乐,健康成长,财源滚滚,马上有钱" \
  -F "background=@background.jpg"
```

#### 示例2：完整配置调用

```bash
curl -X POST http://localhost:3001/api/render/text-breakthrough-effect \
  -H "Content-Type: application/json" \
  -d '{
    "words": ["平安喜乐", "健康成长", "财源滚滚", "马上有钱"],
    "duration": 15,
    "fps": 24,
    "width": 1080,
    "height": 1920,
    "fontSize": 120,
    "textColor": "#ffd700",
    "glowColor": "#ffaa00",
    "glowIntensity": 1.5,
    "bevelDepth": 3,
    "startZ": 2000,
    "endZ": -100,
    "approachDuration": 45,
    "breakthroughDuration": 20,
    "holdDuration": 40,
    "impactScale": 1.4,
    "impactRotation": 12,
    "shakeIntensity": 10,
    "groupInterval": 50,
    "direction": "top-down",
    "enableFallDown": true,
    "backgroundType": "gradient",
    "overlayOpacity": 0.1
  }'
```

#### 示例3：自定义定格位置

```bash
curl -X POST http://localhost:3001/api/render/text-breakthrough-effect \
  -H "Content-Type: application/json" \
  -d '{
    "words": ["平安喜乐", "健康成长", "财源滚滚", "马上有钱"],
    "finalPosition": {
      "defaultX": 0,
      "defaultY": 0,
      "groupPositions": [
        { "x": 0, "y": -0.3, "arrangement": "circular" },
        { "x": -0.2, "y": 0, "arrangement": "horizontal" },
        { "x": 0.2, "y": 0, "arrangement": "horizontal" },
        { "x": 0, "y": 0.3, "arrangement": "circular" }
      ],
      "autoArrangement": "circular",
      "autoArrangementSpacing": 0.25
    },
    "backgroundType": "image",
    "backgroundSource": "财神2.png"
  }'
```

#### 示例4：使用文字组配置

```bash
curl -X POST http://localhost:3001/api/render/text-breakthrough-effect \
  -H "Content-Type: application/json" \
  -d '{
    "textGroups": [
      { "texts": ["新年快乐"], "groupDelay": 60 },
      { "texts": ["恭喜发财", "万事如意"], "groupDelay": 50 },
      { "texts": ["龙年大吉"], "groupDelay": 50 }
    ],
    "finalPosition": {
      "defaultX": 0,
      "defaultY": 0,
      "groupPositions": [
        { "x": 0, "y": -0.25, "arrangement": "circular" },
        { "x": 0, "y": 0, "arrangement": "horizontal", "arrangementSpacing": 0.15 },
        { "x": 0, "y": 0.25, "arrangement": "circular" }
      ]
    },
    "fontSize": 100,
    "direction": "bottom-up"
  }'
```

#### 示例5：启用背景音效

```bash
curl -X POST http://localhost:3001/api/render/text-breakthrough-effect \
  -H "Content-Type: application/json" \
  -d '{
    "words": ["平安喜乐", "健康成长", "财源滚滚", "马上有钱"],
    "audioEnabled": true,
    "audioSource": "coin-sound.mp3",
    "audioVolume": 0.6,
    "backgroundType": "image",
    "backgroundSource": "财神2.png"
  }'
```

#### JavaScript 调用示例

```javascript
const formData = new FormData();
formData.append('words', JSON.stringify(['平安喜乐', '健康成长', '财源滚滚', '马上有钱']));
formData.append('fontSize', '120');
formData.append('direction', 'top-down');
formData.append('enableFallDown', 'true');

const response = await fetch('http://localhost:3001/api/render/text-breakthrough-effect', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('任务ID:', result.jobId);
console.log('状态查询:', result.statusUrl);
```

### 查询任务状态

```bash
curl http://localhost:3001/api/jobs/{jobId}
```

### 下载视频

```bash
curl -O http://localhost:3001/api/download/{jobId}
```

## 参数调优建议

### 视觉冲击力优化

- 增大 `impactScale`（1.4-1.8）获得更强的冲击感
- 增大 `shakeIntensity`（10-15）增强震动效果
- 调整 `breakthroughDuration`（15-25）控制冲击速度

### 性能优化

- 降低 `fps`（24即可获得流畅效果）
- 减少 `holdDuration` 缩短视频时长
- 使用 `backgroundType: "color"` 或 `"gradient"` 避免加载大图片

### 文字数量适配

| 文字数量 | 建议 groupInterval | 建议 duration |
|----------|-------------------|---------------|
| 1-2 个 | 30-40 | 8-10秒 |
| 3-4 个 | 45-60 | 12-15秒 |
| 5-8 个 | 50-70 | 18-25秒 |

## 项目结构

```
text-breakthrough-effect/
├── src/
│   ├── index.ts                    # 入口文件
│   ├── Root.tsx                    # Remotion 根组件
│   ├── TextBreakthrough.tsx        # 文字破屏核心逻辑
│   └── TextBreakthroughComposition.tsx  # 组合组件和Schema定义
├── public/                         # 静态资源
├── remotion.config.ts              # Remotion 配置
├── tsconfig.json                   # TypeScript 配置
└── package.json                    # 项目配置
```

## 注意事项

1. **背景文件**：上传的背景文件会被复制到项目的 `public` 目录
2. **字体支持**：默认支持系统中文字体，可自定义 `fontFamily`
3. **时长计算**：如未指定 `duration`，系统会根据文字组数量自动计算合理时长
4. **内存占用**：高分辨率和复杂特效会占用更多内存，建议 8GB+ 内存
