# 文字万花筒特效 (Text Kaleidoscope Effect)

一个酷炫的文字万花筒特效，支持从中心向外圆形扩散的动画效果，可混合显示文字和祝福图案。

## 特效特点

- **圆形扩散动画**：文字和图案从中心向外优雅扩散
- **整体旋转**：万花筒整体缓慢旋转，增加动感
- **混合内容支持**：支持文字、图片、祝福图案的混合显示
- **中心焦点文字**：可选的中心焦点文字，带脉冲效果
- **中心爆发效果**：文字从中心爆发扩散的冲击效果
- **星空背景**：内置星空粒子背景

## 参数说明

### 混合输入配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `contentType` | string | `"text"` | 内容类型：`text` \| `image` \| `blessing` \| `mixed` |
| `words` | string[] | `[]` | 文字列表 |
| `images` | string[] | `[]` | 图片路径列表 |
| `blessingTypes` | string[] | `[]` | 祝福图案类型：`goldCoin` \| `moneyBag` \| `luckyBag` \| `redPacket` |
| `blessingStyle` | object | `null` | 祝福图案样式配置 |

### 中心焦点文字配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `focusWords` | string[] | `null` | 中心焦点文字列表（**不配置则不渲染焦点文字**） |
| `focusFontSize` | number | `fontSize * 2` | 焦点文字字体大小 |
| `focusTextInterval` | number | `90` | 焦点文字间隔（帧） |
| `focusTextDuration` | number | `60` | 焦点文字持续时间（帧） |

### 字体和颜色配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `fontSize` | number | `60` | 基础字体大小 |
| `colors` | string[] | 6种彩虹色 | 文字颜色列表（循环使用） |
| `glowColor` | string | `"#ffd700"` | 发光颜色 |
| `glowIntensity` | number | `1.2` | 发光强度（0-3） |

### 万花筒配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `itemCount` | number | `60` | 万花筒元素数量 |
| `ringCount` | number | `5` | 圆环数量 |
| `rotationSpeed` | number | `0.3` | 整体旋转速度（圈/秒） |

### 动画配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `expansionDuration` | number | `120` | 扩散动画时长（帧） |
| `fadeInDuration` | number | `60` | 淡入时长（帧） |

### 中心爆发配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enableCenterBurst` | boolean | `true` | 启用中心爆发效果 |
| `burstParticleCount` | number | `20` | 每次爆发粒子数 |
| `burstInterval` | number | `60` | 爆发间隔（帧） |

### 效果开关

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enable3D` | boolean | `true` | 启用3D效果 |
| `enablePulse` | boolean | `true` | 启用脉冲效果 |

## 使用示例

### 基础用法 - 纯文字

```json
{
  "contentType": "text",
  "words": ["福", "禄", "寿", "喜", "财", "运"],
  "colors": ["#FFD700", "#FF6B6B", "#4ECDC4"],
  "itemCount": 60
}
```

### 带中心焦点文字

```json
{
  "words": ["新", "年", "快", "乐"],
  "focusWords": ["福", "财"],
  "focusFontSize": 140,
  "itemCount": 40
}
```

### 不显示中心焦点文字

```json
{
  "words": ["春", "节", "快", "乐"],
  "focusWords": null,
  "itemCount": 50
}
```

### 纯祝福图案

```json
{
  "contentType": "blessing",
  "blessingTypes": ["goldCoin", "redPacket", "moneyBag"],
  "blessingStyle": {
    "primaryColor": "#FFD700",
    "enableGlow": true,
    "glowIntensity": 1.5
  },
  "itemCount": 40
}
```

### 混合模式 - 文字 + 祝福图案

```json
{
  "contentType": "mixed",
  "words": ["福", "财", "运"],
  "blessingTypes": ["goldCoin", "redPacket"],
  "itemCount": 50,
  "ringCount": 4
}
```

### API 调用示例

```bash
# 渲染纯文字万花筒
curl -X POST http://localhost:3001/api/render/text-kaleidoscope-effect \
  -H "Content-Type: application/json" \
  -d '{
    "words": ["福", "禄", "寿", "喜", "财", "运"],
    "focusWords": ["福"],
    "itemCount": 60,
    "duration": 15
  }'

# 渲染混合内容万花筒
curl -X POST http://localhost:3001/api/render/text-kaleidoscope-effect \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "mixed",
    "words": ["新年快乐", "万事如意"],
    "blessingTypes": ["goldCoin", "luckyBag"],
    "focusWords": ["福"],
    "itemCount": 50,
    "duration": 12
  }'
```

## 动画效果说明

### 圆形扩散动画

1. **波浪式出现**：按圆环层级依次出现，形成波浪效果
2. **缓动扩散**：使用 `Easing.out(Easing.cubic)` 缓动函数，先快后慢
3. **距离缩放**：远离中心的元素稍小，营造深度感
4. **整体旋转**：万花筒整体缓慢旋转

### 中心爆发效果

- 文字从中心向四周爆发扩散
- 带有缩放和旋转动画
- 增强视觉冲击力

### 焦点文字效果

- 弹簧动画出现
- 脉冲呼吸效果
- 旋转和发光

## 祝福图案类型

| 类型 | 名称 | 描述 |
|------|------|------|
| `goldCoin` | 金币 | 古铜钱样式，外圆内方 |
| `moneyBag` | 金钱袋 | 褐色钱袋，顶部有金币 |
| `luckyBag` | 福袋 | 红色福袋，带"福"字 |
| `redPacket` | 红包 | 红色红包，带"福"字 |

## 本地开发

```bash
# 启动 Remotion Studio 预览
npm run dev:kaleidoscope

# 或直接运行
cd effects/text-kaleidoscope-effect
npm start
```

## 输出示例

- 默认配置：15秒视频，60个元素，5个圆环
- 输出路径：`effects/text-kaleidoscope-effect/out/`
