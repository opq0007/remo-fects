# 姓名生长爆炸特效

## 概述

这是一个炫酷的文字动画特效，动画过程分为三个阶段：

1. **生长阶段**：姓名文字像大树一样生长，形成输入图片的黑白二值化轮廓
2. **爆炸阶段**：姓名墙爆炸，背景切换为原图，文字碎片四散
3. **消散阶段**：文字碎片像烟花一样落下消失

## 核心输入

- **name**: 姓名（核心文字）
- **words**: 文字数组（爆炸后的碎片文字）
- **imageSource**: 图片路径（用于生成轮廓和最终背景）

## 参数配置

### 阶段时长（帧数）

| 参数 | 默认值 | 描述 |
|------|--------|------|
| growDuration | 90 | 生长阶段时长（帧） |
| holdDuration | 30 | 定格显示时长（帧） |
| explodeDuration | 30 | 爆炸阶段时长（帧） |
| fallDuration | 90 | 碎片下落时长（帧） |

### 文字样式

| 参数 | 默认值 | 描述 |
|------|--------|------|
| fontSize | 14 | 生长文字大小 |
| particleFontSize | 22 | 粒子文字大小 |
| textColor | #ffd700 | 生长文字颜色 |
| glowColor | #ffaa00 | 发光颜色 |
| glowIntensity | 1 | 发光强度 |

### 粒子配置

| 参数 | 默认值 | 描述 |
|------|--------|------|
| particleCount | 80 | 爆炸粒子数量 |
| gravity | 0.15 | 重力系数 |
| wind | 0 | 风力系数（负数左风，正数右风） |

### 轮廓提取

| 参数 | 默认值 | 描述 |
|------|--------|------|
| threshold | 128 | 二值化阈值（0-255） |
| sampleDensity | 6 | 采样密度（越小越精细） |
| growStyle | tree | 生长样式：radial/wave/tree |

### 背景配置

| 参数 | 默认值 | 描述 |
|------|--------|------|
| backgroundColor | #0a0a1a | 初始背景颜色 |
| backgroundOpacity | 0.9 | 背景图片透明度 |

## API 使用示例

```bash
# 创建渲染任务
curl -X POST http://localhost:3001/api/render/text-grow-explode-effect \
  -F "background=@福字.png" \
  -F "name=福" \
  -F 'words=["财","运","亨","通","金","玉","满","堂","吉","祥","如","意"]' \
  -F "growDuration=90" \
  -F "holdDuration=30" \
  -F "explodeDuration=30" \
  -F "fallDuration=90" \
  -F "fontSize=14" \
  -F "particleFontSize=22" \
  -F "textColor=#ffd700" \
  -F "glowColor=#ffaa00" \
  -F "glowIntensity=1" \
  -F "particleCount=80" \
  -F "gravity=0.15" \
  -F "growStyle=tree" \
  -F "threshold=128" \
  -F "sampleDensity=6"
```

## 生长样式说明

- **radial**: 从中心向外辐射生长
- **wave**: 波浪式从下到上生长
- **tree**: 树式生长（从底部树干向上分支）

## 开发

```bash
# 进入项目目录
cd effects/text-grow-explode-effect

# 启动 Remotion Studio
npm run start

# 渲染预览（前 90 帧）
npm run render-preview

# 渲染完整视频
npm run render
```

## 注意事项

1. 图片应使用高对比度的图片，轮廓提取效果更好
2. 建议使用黑白分明的图片或文字图片
3. `sampleDensity` 越小，轮廓越精细，但渲染越慢
4. `threshold` 根据图片调整，深色图片用较低值，浅色图片用较高值
