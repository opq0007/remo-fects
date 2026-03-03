# 文字矢量动画特效 (Text Vector Effect)

将文字转为 SVG 路径轮廓，然后用混合输入元素（文字、图片、祝福图案）填充轨迹，创造出独特的视觉效果。

## 特效说明

这个特效的核心功能是：
1. **文字转路径**：将输入的核心文字转换为 SVG 路径坐标点
2. **轨迹填充**：在路径坐标点上放置混合输入元素
3. **动画效果**：支持多种入场、填充和停留动画

## 核心参数

### 核心文字配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| text | string | "福" | 要显示的核心文字 |
| fontSize | number | 300 | 核心文字字体大小 |
| fontFamily | string | "Arial, sans-serif" | 字体家族 |
| fontWeight | number | 700 | 字重 |

### 混合输入配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| contentType | string | "mixed" | 内容类型：text \| image \| blessing \| mixed |
| words | array | [] | 填充文字列表 |
| images | array | [] | 填充图片列表 |
| blessingTypes | array | ["goldCoin", "moneyBag", "luckyBag", "redPacket"] | 祝福图案类型 |
| imageWeight | number | 0.5 | 图片出现权重（0-1） |

### 元素配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| elementSize | number | 20 | 填充元素大小 |
| elementSizeRange | [number, number] | null | 元素大小范围 |
| elementSpacing | number | 16 | 元素间距 |

### 颜色配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| textColor | string | "#FFD700" | 文字颜色 |
| glowColor | string | "#FFD700" | 发光颜色 |
| glowIntensity | number | 1.2 | 发光强度（0-3） |
| colors | array | [7种颜色] | 颜色列表（循环使用） |

### 动画配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| entranceDuration | number | 12 | 入场动画时长（帧） |
| fillDuration | number | 80 | 填充动画时长（帧） |
| fillType | string | "sequential" | 填充类型：sequential \| random \| radial \| wave |
| stayAnimation | string | "pulse" | 停留动画：pulse \| glow \| float \| none |
| pulseSpeed | number | 1.2 | 脉冲速度 |
| glowPulseSpeed | number | 0.8 | 发光脉冲速度 |
| floatAmplitude | number | 4 | 漂浮幅度 |
| floatSpeed | number | 1 | 漂浮速度 |

### 3D 效果

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| enable3D | boolean | true | 启用3D效果 |
| rotation3D | number | 10 | 3D旋转角度 |

### 星空背景

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| enableStarField | boolean | true | 启用星空背景 |
| starCount | number | 50 | 星星数量 |
| starOpacity | number | 0.35 | 星星透明度 |

## 填充动画类型

1. **sequential**（顺序）：元素按顺序逐一出现，从第一个点到最后一个点
2. **random**（随机）：元素随机延迟出现
3. **radial**（径向）：从中心向外扩散出现
4. **wave**（波浪）：按波浪形式填充

## 停留动画类型

1. **pulse**（脉冲）：元素大小和发光强度周期性变化
2. **glow**（发光）：发光强度周期性变化
3. **float**（漂浮）：元素轻微漂浮移动
4. **none**（无）：无停留动画

## 使用示例

### API 调用

```bash
# 基础用法
curl -X POST http://localhost:3001/api/render/text-vector-effect \
  -H "Content-Type: application/json" \
  -d '{
    "text": "福",
    "words": ["福", "禄", "寿", "喜", "财", "运"],
    "fillType": "sequential",
    "stayAnimation": "pulse"
  }'

# 使用图片填充
curl -X POST http://localhost:3001/api/render/text-vector-effect \
  -H "Content-Type: application/json" \
  -d '{
    "text": "新年快乐",
    "contentType": "image",
    "images": ["coin.png", "flower.png"],
    "elementSize": 30,
    "fillType": "radial"
  }'

# 混合模式
curl -X POST http://localhost:3001/api/render/text-vector-effect \
  -H "Content-Type: application/json" \
  -d '{
    "text": "财源广进",
    "contentType": "mixed",
    "words": ["金", "银", "财", "宝"],
    "images": ["coin.png"],
    "blessingTypes": ["goldCoin", "moneyBag"],
    "imageWeight": 0.3,
    "colors": ["#FFD700", "#FF6B6B", "#4ECDC4"]
  }'
```

### 开发调试

```bash
# 安装依赖
npm install

# 启动 Remotion Studio 预览
cd effects/text-vector-effect
npm run start

# 渲染视频
npm run build
```

## 技术实现

### 文字转路径

特效使用两种方法将文字转换为路径坐标点：

1. **浏览器 API 方法**（优先）：
   - 使用 Canvas 绘制文字
   - 获取像素数据进行边缘检测
   - 提取轮廓点并排序

2. **近似方法**（降级）：
   - 根据字符类型计算填充区域
   - 在区域内生成均匀分布的点
   - 使用椭圆形状模拟字符轮廓

### 动画系统

- **入场动画**：控制元素的透明度和缩放
- **填充动画**：控制元素的出现顺序和延迟
- **停留动画**：控制元素在完成填充后的动态效果

## 注意事项

1. **字体选择**：建议使用粗体字体以获得更好的填充效果
2. **文字长度**：单个字符效果最佳，多个字符会均匀分布
3. **元素数量**：根据字体大小和间距自动计算，通常为数百个
4. **性能考虑**：大量元素可能影响渲染性能，建议适当调整 `elementSpacing`

## 版本历史

- v1.0.0 - 初始版本，支持基础文字矢量动画功能
