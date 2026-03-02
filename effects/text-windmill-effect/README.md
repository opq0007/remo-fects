# 文字大风车特效

一个支持 2D/3D 视角的旋转风车特效，每个风车叶片可以包含多个内容元素，支持文字、图片和祝福图案的混合输入。

## 特性

- **二维数组输入**：每个第一维是一个叶片，每个第二维是叶片内的内容项（垂直拼接）
- **混合内容支持**：支持文字、图片、祝福图案混合显示
- **旋转控制**：支持顺时针/逆时针旋转，可调节旋转速度
- **3D 视角**：支持倾斜角度和 Y 轴旋转，创造立体视觉效果
- **叶片元素旋转控制**：可选择叶片内元素是否随叶片旋转
- **发光效果**：支持可配置的发光效果

## 参数说明

### 基础参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| bladesData | array | 见下方 | 叶片数据（二维数组） |
| words | array | [] | 简化文字输入（自动生成叶片） |
| fontSize | number | 60 | 基础字体大小 |
| colors | array | ["#FFD700", ...] | 叶片颜色列表（循环使用） |
| glowColor | string | "#ffd700" | 发光颜色 |
| glowIntensity | number | 1.2 | 发光强度 (0-3) |

### 旋转配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| rotationSpeed | number | 0.3 | 旋转速度（圈/秒） |
| rotationDirection | string | "clockwise" | 旋转方向：clockwise / counterclockwise |
| centerOffsetY | number | 0 | 中心点垂直偏移（-0.5 到 0.5） |

### 3D 视角配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| tiltAngle | number | 30 | 3D 视角倾斜角度（度，-60 到 60） |
| rotateY | number | 0 | 3D 视角 Y 轴旋转角度（度，-180 到 180） |
| perspective | number | 1000 | 透视距离 |

### 叶片控制

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| itemRotateWithBlade | boolean | false | 叶片内元素是否随叶片旋转 |
| bladeLengthRatio | number | 0.7 | 叶片长度比例 (0.3-1.0) |
| enableRandomBladeLength | boolean | false | 是否启用叶片长度随机变化 |

### 效果开关

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| enableGlow | boolean | true | 是否启用发光效果 |
| appearDuration | number | 30 | 叶片出现动画时长（帧） |

### 祝福图案样式

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| blessingStyle.primaryColor | string | - | 祝福图案主色 |
| blessingStyle.secondaryColor | string | - | 祝福图案副色 |
| blessingStyle.enable3D | boolean | true | 启用 3D 效果 |
| blessingStyle.enableGlow | boolean | true | 启用发光 |
| blessingStyle.glowIntensity | number | - | 发光强度 |

## 使用示例

### 示例 1：简化文字输入

```json
{
  "words": ["福", "禄", "寿", "喜", "财", "吉"],
  "rotationSpeed": 0.3,
  "tiltAngle": 30
}
```

### 示例 2：二维数组输入（推荐）

```json
{
  "bladesData": [
    [
      { "type": "text", "content": "福" },
      { "type": "text", "content": "运" }
    ],
    [
      { "type": "text", "content": "禄" },
      { "type": "blessing", "content": "goldCoin" }
    ],
    [
      { "type": "text", "content": "寿" },
      { "type": "text", "content": "康" }
    ],
    [
      { "type": "blessing", "content": "redPacket" },
      { "type": "text", "content": "喜" }
    ]
  ],
  "rotationSpeed": 0.25,
  "itemRotateWithBlade": false
}
```

### 示例 3：平面风车效果

```json
{
  "words": ["春", "夏", "秋", "冬"],
  "tiltAngle": 0,
  "rotateY": 0,
  "itemRotateWithBlade": true,
  "bladeLengthRatio": 0.8
}
```

### 示例 4：3D 立体效果

```json
{
  "words": ["东", "南", "西", "北", "中"],
  "tiltAngle": 45,
  "rotateY": 15,
  "perspective": 800,
  "rotationSpeed": 0.2
}
```

### 示例 5：自定义颜色和发光

```json
{
  "words": ["金", "木", "水", "火", "土"],
  "colors": ["#FFD700", "#228B22", "#1E90FF", "#FF4500", "#8B4513"],
  "glowColor": "#ffffff",
  "glowIntensity": 1.5,
  "enableGlow": true
}
```

## 内容类型

### text（文字）
普通文字内容，支持中英文。

```json
{ "type": "text", "content": "福" }
```

### blessing（祝福图案）
内置祝福图案类型：
- `goldCoin` - 金币
- `moneyBag` - 钱袋
- `luckyBag` - 福袋
- `redPacket` - 红包

```json
{ "type": "blessing", "content": "goldCoin" }
```

### image（图片）
图片内容（需要提供图片路径）。

```json
{ "type": "image", "content": "/path/to/image.png" }
```

## 叶片元素旋转说明

`itemRotateWithBlade` 参数控制叶片内元素是否随叶片旋转：

- **false（默认）**：元素始终保持水平，不随叶片旋转
  - 效果：文字始终可读，不会倒置
  - 适用：需要保持文字可读性的场景

- **true**：元素随叶片一起旋转
  - 效果：元素与叶片保持相对静止
  - 适用：图案、符号或平面风车效果

## 叶片长度说明

`bladeLengthRatio` 和 `enableRandomBladeLength` 控制叶片长度：

- **bladeLengthRatio**：所有叶片的基础长度比例（0.3-1.0）
- **enableRandomBladeLength**：
  - false（默认）：所有叶片长度一致
  - true：叶片长度在基础比例上随机变化（旧版本行为）

## API 调用

```bash
POST http://localhost:3001/api/render/text-windmill-effect
Content-Type: application/json

{
  "words": ["福", "禄", "寿", "喜"],
  "rotationSpeed": 0.3,
  "tiltAngle": 30,
  "duration": 10
}
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动 Remotion Studio
cd effects/text-windmill-effect
npx remotion preview
```
