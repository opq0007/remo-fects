# 文字烟花特效

一个基于 Remotion 的文字烟花特效视频生成器，支持将输入的文字像烟花一样发射到空中，炸开后显示文字，最后化作金色粒子像雨一样落下。

## 特效说明

### 核心效果

1. **烟花发射**：文字从屏幕底部随机位置发射到空中
2. **空中爆炸**：烟花在预定高度爆炸，显示对应的文字
3. **文字闪烁**：文字以发光效果显示，带有金色光晕
4. **粒子下雨**：文字消失后，化作金色粒子像雨一样落下

### 视觉特点

- 深色夜空背景，带有星空效果
- 金色发光的文字和粒子
- 流畅的动画效果
- 支持自定义背景（图片、视频或纯色）

## 使用方法

### 通过 API 使用

```bash
# 创建渲染任务
POST http://localhost:3001/api/render/text-firework-effect
Content-Type: multipart/form-data

words=["新年快乐", "万事如意", "心想事成"]&fontSize=60&textColor=#ffd700&glowColor=#ffaa00&glowIntensity=1&particleCount=80&interval=30
```

### 本地开发

```bash
cd effects/text-firework-effect
npm run start
```

## 参数说明

### 必需参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `words` | `string[]` | 要显示的文字列表（每个文字一个烟花） |

### 字体配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `fontSize` | `number` | 60 | 字体大小（20-200） |
| `textColor` | `string` | `#ffd700` | 文字颜色 |
| `glowColor` | `string` | `#ffaa00` | 发光颜色 |
| `glowIntensity` | `number` | 1 | 发光强度（0-2） |

### 烟花配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `launchHeight` | `number` | 0.3 | 发射高度比例（0-1） |
| `particleCount` | `number` | 80 | 爆炸粒子数量（20-200） |
| `textDuration` | `number` | 60 | 文字显示时长（帧） |
| `rainDuration` | `number` | 120 | 粒子下雨时长（帧） |
| `interval` | `number` | 30 | 烟花发射间隔（帧） |

### 粒子下雨配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `gravity` | `number` | 0.15 | 重力系数（0.05-0.5） |
| `wind` | `number` | 0 | 风力系数（-0.2 到 0.2） |
| `rainParticleSize` | `number` | 3 | 雨滴粒子大小（1-10） |

### 背景配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `backgroundType` | `enum` | `color` | 背景类型（color/image/video） |
| `backgroundColor` | `string` | `#0a0a20` | 背景颜色 |
| `backgroundSource` | `string` | - | 背景文件路径 |
| `overlayColor` | `string` | `#000000` | 遮罩颜色 |
| `overlayOpacity` | `number` | 0.2 | 遮罩透明度（0-1） |

## API 使用示例

### 基础示例

```bash
curl -X POST http://localhost:3001/api/render/text-firework-effect \
  -H "Content-Type: application/json" \
  -d '{
    "words": ["新年快乐", "万事如意"],
    "fontSize": 60,
    "textColor": "#ffd700",
    "glowColor": "#ffaa00"
  }'
```

### 完整示例

```bash
curl -X POST http://localhost:3001/api/render/text-firework-effect \
  -H "Content-Type: application/json" \
  -d '{
    "words": ["恭喜发财", "大吉大利", "财源广进"],
    "fontSize": 70,
    "textColor": "#ffd700",
    "glowColor": "#ffaa00",
    "glowIntensity": 1.2,
    "launchHeight": 0.25,
    "particleCount": 100,
    "textDuration": 80,
    "rainDuration": 150,
    "gravity": 0.18,
    "wind": 0.05,
    "interval": 35,
    "backgroundColor": "#0a0a20",
    "overlayOpacity": 0.3
  }'
```

### 带背景图片

```bash
curl -X POST http://localhost:3001/api/render/text-firework-effect \
  -F "background=@/path/to/background.jpg" \
  -F "words=[\"生日快乐\", \"天天开心\"]" \
  -F "fontSize=65" \
  -F "backgroundType=image"
```

## 技术实现

### 组件结构

- **`Firework.tsx`**：烟花发射、爆炸和文字显示组件
- **`GoldenRain.tsx`**：金色粒子下雨效果组件
- **`TextFireworkComposition.tsx`**：主组合组件，协调整体效果

### 动画原理

1. **发射阶段**：使用缓动函数（easeOut）模拟火箭上升
2. **爆炸阶段**：生成圆形分布的粒子，文字渐显
3. **下雨阶段**：粒子受重力和风力影响，物理模拟下落

### 性能优化

- 使用 `useMemo` 缓存粒子数组
- 粒子超出屏幕范围后停止渲染
- 使用 CSS transform 而非位置属性提高性能

## 注意事项

1. **文字数量**：建议每个视频最多 5-8 个文字，避免视频过长
2. **粒子数量**：粒子数量越多，渲染时间越长
3. **视频时长**：根据文字数量和间隔参数自动计算
4. **背景视频**：使用背景视频会增加渲染时间

## 常见问题

### Q: 如何调整烟花的位置？
A: 烟花位置是随机生成的，可以通过修改 `launchHeight` 参数调整爆炸高度。

### Q: 粒子为什么看起来模糊？
A: 这是为了营造发光效果，可以通过调整 `glowIntensity` 参数控制。

### Q: 如何让烟花更快？
A: 减少 `interval` 参数，让烟花发射更频繁。

### Q: 可以添加音效吗？
A: 当前版本暂不支持音效，可以在 Remotion Studio 中手动添加音频。

## 许可证

MIT License