# Remo-Fects 项目上下文文档

## 项目概述

**Remo-Fects** 是一个基于 Remotion 的多特效视频生成器，采用 npm workspaces 实现依赖共享，使用**配置驱动架构**实现特效参数的统一管理。

### 核心特性

1. **依赖共享（npm workspaces）**：所有 Remotion 相关依赖安装在根目录，子项目自动共享，大幅节省磁盘空间
2. **配置驱动架构**：每个特效项目的参数定义在独立配置文件中，新增特效无需修改核心代码
3. **统一 API 管理**：通过 Express 服务器提供统一的渲染接口，自动处理参数验证和转换
4. **组合特效**：支持将多个特效按顺序拼接、叠加或转场合并成一个最终视频
5. **独立开发**：每个特效项目可以独立运行和调试
6. **Chrome Headless Shell 共享**：所有项目共享一个 Chrome Headless Shell，避免重复下载
7. **混合输入支持**：支持文字、图片、祝福图案等多种内容类型的混合输入

### 技术栈

- **Remotion 4.0**：基于 React 的视频生成框架
- **Node.js**：>=18.0.0
- **Express 4**：API 服务器
- **TypeScript 5**：类型安全
- **Zod**：数据验证

## 项目结构

```
remo-fects/
├── api/                              # 统一 API 服务器
│   ├── server.js                     # Express 服务器主文件
│   ├── render.js                     # 渲染逻辑（包含视频合并功能）
│   ├── effect-configs/               # 特效配置目录（配置驱动核心）
│   │   ├── index.js                  # 配置注册表
│   │   ├── types.js                  # 类型定义
│   │   ├── common-params.js          # 公共参数处理器
│   │   ├── text-rain-effect.js       # 文字雨特效配置
│   │   ├── text-ring-effect.js       # 文字环绕特效配置
│   │   ├── text-firework-effect.js   # 文字烟花特效配置
│   │   ├── text-breakthrough-effect.js # 文字破屏特效配置
│   │   ├── tai-chi-bagua-effect.js   # 太极八卦特效配置
│   │   ├── text-tornado-effect.js    # 文字龙卷风特效配置
│   │   ├── text-flood-effect.js      # 文字洪水特效配置
│   │   ├── text-vortex-effect.js     # 文字旋涡特效配置
│   │   ├── text-kaleidoscope-effect.js # 文字万花筒特效配置
│   │   ├── text-windmill-effect.js   # 文字大风车特效配置
│   │   ├── text-vector-effect.js     # 文字矢量动画特效配置
│   │   └── text-crystal-ball-effect.js # 文字水晶球特效配置
│   ├── outputs/                      # 输出视频目录
│   ├── uploads/                      # 上传文件目录
│   └── package.json                  # API 项目配置
├── effects/                          # 所有特效项目目录
│   ├── shared/                       # 公共组件和 Schema
│   │   ├── components/               # 公共组件
│   │   │   ├── Background.tsx        # 统一背景组件
│   │   │   ├── Overlay.tsx           # 遮罩组件
│   │   │   ├── AudioPlayer.tsx       # 音频播放组件
│   │   │   ├── BaseComposition.tsx   # 基础组合组件（核心）
│   │   │   ├── CenterGlow.tsx        # 中心发光效果
│   │   │   ├── StarField.tsx         # 星空背景
│   │   │   ├── Watermark.tsx         # 水印组件
│   │   │   ├── Marquee.tsx           # 走马灯组件
│   │   │   ├── BlessingSymbol.tsx    # 祝福图案组件（金币、福袋等）
│   │   │   ├── RadialBurst.tsx       # 中心发散粒子效果
│   │   │   ├── Foreground.tsx        # 前景效果组件
│   │   │   └── MixedInputItem.tsx    # 混合输入渲染组件
│   │   ├── schemas/                  # 公共 Schema 定义
│   │   │   ├── background.ts         # 背景 Schema
│   │   │   ├── overlay.ts            # 遮罩 Schema
│   │   │   ├── audio.ts              # 音频 Schema
│   │   │   ├── common.ts             # 通用 Schema + BaseCompositionProps
│   │   │   ├── watermark.ts          # 水印 Schema
│   │   │   ├── marquee.ts            # 走马灯 Schema
│   │   │   ├── blessing-symbol.ts    # 祝福图案 Schema
│   │   │   ├── mixed-input.ts        # 混合输入 Schema
│   │   │   ├── radial-burst.ts       # 中心发散粒子 Schema
│   │   │   └── foreground.ts         # 前景效果 Schema
│   │   ├── types/                    # 类型定义
│   │   │   ├── common.ts             # 通用类型
│   │   │   └── mixed-input.ts        # 混合输入类型
│   │   └── utils/                    # 工具函数
│   │       ├── easing.ts             # 缓动函数
│   │       ├── random.ts             # 随机数生成
│   │       ├── textStyle.ts          # 文字样式工具
│   │       └── mixed-input.ts        # 混合输入工具函数
│   ├── text-rain-effect/             # 文字雨特效
│   ├── text-ring-effect/             # 金色文字环绕特效
│   ├── text-firework-effect/         # 文字烟花特效
│   ├── text-breakthrough-effect/     # 文字破屏特效
│   ├── tai-chi-bagua-effect/         # 太极八卦图特效
│   ├── text-tornado-effect/          # 文字龙卷风特效
│   ├── text-flood-effect/            # 文字洪水特效
│   ├── text-vortex-effect/           # 文字旋涡特效
│   ├── text-kaleidoscope-effect/     # 文字万花筒特效
│   ├── text-windmill-effect/         # 文字大风车特效
│   ├── text-vector-effect/           # 文字矢量动画特效
│   └── text-crystal-ball-effect/     # 文字水晶球特效
├── scripts/                          # 工具脚本
│   └── install-chrome.js             # Chrome 管理工具
├── node_modules/                     # 共享依赖包
├── package.json                      # 根目录配置（包含所有公共依赖）
└── README.md                         # 项目文档
```

## 配置驱动架构

### 架构说明

项目采用**配置驱动**方式管理特效参数，新增特效只需添加配置文件，无需修改 `render.js` 和 `server.js`。

### 配置文件结构

每个特效配置文件包含以下部分：

```javascript
// api/effect-configs/your-effect.js
const path = require('path');

// 1. 特效基础信息
const config = {
  id: 'your-effect',
  name: '你的特效名称',
  compositionId: 'YourComposition',
  path: path.join(__dirname, '../../effects/your-effect')
};

// 2. 参数定义（包含类型、默认值、解析器）
const params = {
  customParam: {
    type: 'number',
    defaultValue: 100,
    parser: (v) => parseInt(v) || 100,
    description: '参数描述'
  }
};

// 3. 参数验证函数
function validate(params) {
  if (!params.words || params.words.length === 0) {
    return { valid: false, error: '请提供文字列表' };
  }
  return { valid: true };
}

// 4. 构建渲染参数
function buildRenderParams(reqParams, commonParams) {
  const result = { ...commonParams };
  for (const [name, def] of Object.entries(params)) {
    result[name] = reqParams[name] ?? def.defaultValue;
  }
  return result;
}

module.exports = { config, params, validate, buildRenderParams };
```

### 公共参数

所有特效共享以下公共参数（由 `common-params.js` 统一处理）：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| width | number | 720 | 视频宽度 |
| height | number | 1280 | 视频高度 |
| fps | number | 24 | 帧率 |
| duration | number | 10 | 视频时长（秒） |
| backgroundType | string | 'color' | 背景类型：color \| image \| video \| gradient |
| backgroundColor | string | '#1a1a2e' | 背景颜色 |
| backgroundSource | string | null | 背景源文件（图片或视频） |
| backgroundVideoLoop | boolean | true | 背景视频是否循环 |
| backgroundVideoMuted | boolean | true | 背景视频是否静音 |
| overlayColor | string | '#000000' | 遮罩颜色 |
| overlayOpacity | number | 0.2 | 遮罩透明度 |
| audioEnabled | boolean | false | 是否启用音频 |
| audioSource | string | 'coin-sound.mp3' | 音频文件路径 |
| audioVolume | number | 0.5 | 音量（0-1） |
| audioLoop | boolean | true | 音频是否循环 |
| seed | number | 随机 | 随机种子 |

## 构建和运行

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- FFmpeg（已安装：D:\programs\ffmpeg-7.1.1-full_build\bin\ffmpeg.exe）

### 安装依赖

```bash
npm install
```

### 启动 API 服务

```bash
npm run api
```

服务将在 http://localhost:3001 启动。

### 开发特效项目

```bash
npm run dev:text-rain
```

## API 接口文档

### 1. 获取所有可用项目

```bash
GET http://localhost:3001/api/projects
```

**响应：**
```json
[
  { "id": "text-rain-effect", "name": "文字雨特效", "compositionId": "TextRain" },
  { "id": "text-ring-effect", "name": "金色发光立体字环绕特效", "compositionId": "TextRing" },
  { "id": "text-firework-effect", "name": "文字烟花特效", "compositionId": "TextFirework" },
  { "id": "text-breakthrough-effect", "name": "文字破屏特效", "compositionId": "TextBreakthrough" },
  { "id": "tai-chi-bagua-effect", "name": "太极八卦图特效", "compositionId": "TaiChiBagua" },
  { "id": "text-tornado-effect", "name": "文字龙卷风特效", "compositionId": "TextTornado" },
  { "id": "text-flood-effect", "name": "文字洪水特效", "compositionId": "TextFlood" },
  { "id": "text-vortex-effect", "name": "文字旋涡特效", "compositionId": "TextVortex" },
  { "id": "text-kaleidoscope-effect", "name": "文字万花筒特效", "compositionId": "TextKaleidoscope" },
  { "id": "text-windmill-effect", "name": "文字大风车特效", "compositionId": "TextWindmill" },
  { "id": "text-vector-effect", "name": "文字矢量动画特效", "compositionId": "TextVector" },
  { "id": "text-crystal-ball-effect", "name": "文字水晶球特效", "compositionId": "TextCrystalBall" }
]
```

### 2. 创建渲染任务

```bash
POST http://localhost:3001/api/render/:projectId
Content-Type: application/json
```

**请求示例：**
```json
{
  "words": ["福", "禄", "寿"],
  "duration": 5,
  "fps": 24,
  "backgroundColor": "#1a1a2e"
}
```

**响应：**
```json
{
  "success": true,
  "jobId": "20260227-1234567890",
  "projectId": "text-rain-effect",
  "projectName": "文字雨特效",
  "message": "渲染任务已创建",
  "statusUrl": "/api/jobs/20260227-1234567890"
}
```

### 3. 查询任务状态

```bash
GET http://localhost:3001/api/jobs/:jobId
```

### 4. 下载视频

```bash
GET http://localhost:3001/api/download/:jobId
```

### 5. 创建组合特效渲染任务

```bash
POST http://localhost:3001/api/compose
Content-Type: application/json
```

**请求示例：**
```json
{
  "mergeMode": "sequence",
  "effects": [
    {
      "projectId": "tai-chi-bagua-effect",
      "duration": 5,
      "width": 720,
      "height": 720
    },
    {
      "projectId": "text-firework-effect",
      "words": ["新年快乐", "万事如意"],
      "duration": 8
    }
  ]
}
```

**合并模式：**
- `sequence`：顺序拼接
- `overlay`：叠加混合
- `transition`：带转场拼接（仅支持2个视频）

### 6. 动态注册新特效（高级）

```bash
POST http://localhost:3001/api/effects/register
Content-Type: application/json
```

## 添加新特效项目

### 基本要求

1. 使用 Remotion 框架来实现动画效果
2. 尽可能复用 shared 目录下已有的公共组件（例如背景、音效、走马灯、水印等），避免重复开发
3. 新特效默认需要支持 Mixed 类型输入（包含文字、图片、blessing 等）
4. 动画需要符合近大远小的真实3D立体透视物理规律
5. 新创建的特效项目，需要添加 README.md 说明文档，方便快速入手

### 步骤 1：创建特效项目目录

在 `effects/` 目录下创建新项目，包含：
- `src/index.ts` - 入口文件
- `src/YourComposition.tsx` - 主组合组件（继承 BaseComposition）
- `remotion.config.ts` - Remotion 配置
- `package.json` - 项目配置

### 步骤 2：创建组合组件

使用 `BaseComposition` 和 `CompleteCompositionSchema`：

```tsx
// effects/your-effect/src/YourComposition.tsx
import React from "react";
import { z } from "zod";
import { BaseComposition, CompleteCompositionSchema } from "../../shared/index";
import { YourEffectContent } from "./YourEffectContent";

// 定义 Schema（继承公共参数）
export const YourCompositionSchema = CompleteCompositionSchema.extend({
  words: z.array(z.string()).meta({ description: "文字列表" }),
  speed: z.number().min(0.1).max(2).default(1),
});

export type YourCompositionProps = z.infer<typeof YourCompositionSchema>;

// 主组件
export const YourComposition: React.FC<YourCompositionProps> = ({
  words,
  speed,
  // 基础参数
  backgroundType = "color",
  backgroundColor = "#0a0a20",
  overlayOpacity = 0.2,
  audioEnabled = false,
  audioSource = "coin-sound.mp3",
  audioVolume = 0.5,
}) => {
  return (
    <BaseComposition
      backgroundType={backgroundType}
      backgroundColor={backgroundColor}
      overlayOpacity={overlayOpacity}
      audioEnabled={audioEnabled}
      audioSource={audioSource}
      audioVolume={audioVolume}
    >
      <YourEffectContent words={words} speed={speed} />
    </BaseComposition>
  );
};
```

### 步骤 3：创建入口文件

```tsx
// effects/your-effect/src/index.ts
import { Composition } from "remotion";
import { YourComposition, YourCompositionSchema } from "./YourComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="YourComposition"
      component={YourComposition}
      durationInFrames={300}
      fps={24}
      width={720}
      height={1280}
      schema={YourCompositionSchema}
    />
  );
};
```

### 步骤 4：创建配置文件

在 `api/effect-configs/` 目录创建配置文件：

```javascript
// api/effect-configs/your-effect.js
const path = require('path');

const config = {
  id: 'your-effect',
  name: '你的特效',
  compositionId: 'YourComposition',
  path: path.join(__dirname, '../../effects/your-effect')
};

const params = {
  words: {
    type: 'array',
    defaultValue: [],
    parser: (v) => Array.isArray(v) ? v : v.split(',').map(w => w.trim()),
    required: true,
  },
  speed: {
    type: 'number',
    defaultValue: 1,
    parser: (v) => parseFloat(v) || 1,
  }
};

function validate(params) {
  if (!params.words || params.words.length === 0) {
    return { valid: false, error: '请提供文字列表 (words)' };
  }
  return { valid: true };
}

function buildRenderParams(reqParams, commonParams) {
  const result = { ...commonParams };
  for (const [name, def] of Object.entries(params)) {
    result[name] = reqParams[name] ?? def.defaultValue;
  }
  return result;
}

module.exports = { config, params, validate, buildRenderParams };
```

### 步骤 5：注册配置

编辑 `api/effect-configs/index.js`，添加：

```javascript
const effectConfigs = {
  // ...
  'your-effect': require('./your-effect')
};
```

**完成！无需修改 `render.js` 和 `server.js`。**

## 各特效参数说明

### text-rain-effect（文字雨特效）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| words | array | [] | 文字列表（必填） |
| textDirection | string | 'horizontal' | 文字方向 |
| fontSizeRange | array | [80, 160] | 字体大小范围 |
| fallSpeed | number | 0.15 | 下落速度 |
| density | number | 2 | 雨滴密度 |
| laneCount | number | 6 | 列道数量 |
| textStyle | object | {...} | 文字样式 |
| audio.enabled | boolean | true | 是否启用音频（嵌套格式） |
| audio.volume | number | 0.5 | 音量 |

### text-firework-effect（文字烟花特效）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| words | array | [] | 文字列表（必填） |
| fontSize | number | 60 | 字体大小 |
| textColor | string | '#ffd700' | 文字颜色 |
| glowColor | string | '#ffaa00' | 发光颜色 |
| particleCount | number | 80 | 粒子数量 |
| interval | number | 40 | 发射间隔 |
| audioEnabled | boolean | false | 是否启用音频 |

### text-ring-effect（文字环绕特效）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| words | array | [] | 文字列表（必填） |
| fontSize | number | 70 | 字体大小 |
| ringRadius | number | 250 | 环绕半径 |
| rotationSpeed | number | 0.8 | 旋转速度 |
| depth3d | number | 8 | 3D深度层数 |
| glowIntensity | number | 0.9 | 发光强度 |
| audioEnabled | boolean | false | 是否启用音频 |

### text-breakthrough-effect（文字破屏特效）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| words | array | [] | 文字列表 |
| fontSize | number | 120 | 字体大小 |
| approachDuration | number | 45 | 接近时长 |
| impactScale | number | 1.4 | 冲击缩放 |
| audioEnabled | boolean | false | 是否启用音频 |

### tai-chi-bagua-effect（太极八卦特效）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| yangColor | string | '#FFD700' | 阳色 |
| yinColor | string | '#1a1a1a' | 阴色 |
| taichiSize | number | 200 | 太极图大小 |
| baguaRadius | number | 280 | 八卦半径 |
| enable3D | boolean | false | 启用3D效果 |
| enableGoldenSparkle | boolean | true | 金光闪闪 |
| audioEnabled | boolean | false | 是否启用音频 |

### text-tornado-effect（文字龙卷风特效）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| contentType | string | 'text' | 内容类型：text \| image \| blessing \| mixed |
| words | array | [] | 文字列表 |
| images | array | [] | 图片路径列表 |
| blessingTypes | array | [] | 祝福图案类型列表 |
| particleCount | number | 60 | 粒子数量 (10-200) |
| baseRadius | number | 300 | 龙卷风底部半径 |
| topRadius | number | 50 | 龙卷风顶部半径 |
| rotationSpeed | number | 2 | 旋转速度 |
| liftSpeed | number | 0.3 | 上升速度 (0-1) |
| funnelHeight | number | 0.85 | 漏斗高度比例 (0.3-1) |
| zoomIntensity | number | 0.5 | 镜头拉近强度 (0-2) |

### text-flood-effect（文字洪水特效）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| contentType | string | 'text' | 内容类型：text \| image \| blessing \| mixed |
| words | array | ['洪', '福', '财', '运', '吉', '祥'] | 文字列表 |
| particleCount | number | 60 | 粒子数量 (10-200) |
| waveCount | number | 5 | 波浪层数 (1-10) |
| direction | string | 'toward' | 洪水方向：toward \| away |
| waveConfig.waveSpeed | number | 1.5 | 波浪速度 |
| waveConfig.waveAmplitude | number | 60 | 波浪振幅 |
| impactConfig.impactStart | number | 0.7 | 冲击开始时间 |
| impactConfig.impactScale | number | 3 | 冲击缩放 |
| enablePerspective | boolean | true | 启用3D透视效果 |

### text-vortex-effect（文字旋涡特效）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| contentType | string | 'text' | 内容类型：text \| image \| blessing \| mixed |
| words | array | [] | 文字列表 |
| particleCount | number | 80 | 粒子数量 (20-200) |
| ringCount | number | 6 | 环的数量 (2-12) |
| rotationDirection | string | 'clockwise' | 旋转方向：clockwise \| counterclockwise |
| rotationSpeed | number | 1.5 | 旋转速度 (0.5-4) |
| expansionDuration | number | 6 | 散开动画时长（秒） |
| initialRadius | number | 30 | 初始中心半径 |
| maxRadius | number | 350 | 最大扩散半径 |
| depth3D | boolean | true | 是否启用3D效果 |
| shockwaveEnabled | boolean | true | 启用冲击波效果 |

### text-kaleidoscope-effect（文字万花筒特效）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| contentType | string | 'text' | 内容类型：text \| image \| blessing \| mixed |
| words | array | [] | 文字列表 |
| focusWords | array | null | 中心焦点文字列表（可选） |
| fontSize | number | 60 | 基础字体大小 |
| colors | array | ['#FFD700', '#FF6B6B', ...] | 文字颜色列表 |
| itemCount | number | 60 | 万花筒元素数量 |
| ringCount | number | 5 | 圆环数量 |
| rotationSpeed | number | 0.3 | 旋转速度（圈/秒） |
| expansionDuration | number | 120 | 扩散动画时长（帧） |
| enableCenterBurst | boolean | true | 启用中心爆发效果 |
| enable3D | boolean | true | 启用3D效果 |
| enablePulse | boolean | true | 启用脉冲效果 |

### text-windmill-effect（文字大风车特效）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| bladesData | array | [[{type:'text',content:'福'},...],...] | 叶片数据（二维数组） |
| words | array | [] | 文字列表（简化模式） |
| fontSize | number | 60 | 基础字体大小 |
| colors | array | ['#FFD700', '#FF6B6B', ...] | 叶片颜色列表 |
| rotationSpeed | number | 0.3 | 旋转速度（圈/秒） |
| rotationDirection | string | 'clockwise' | 旋转方向 |
| tiltAngle | number | 30 | 3D视角倾斜角度（度） |
| perspective | number | 1000 | 透视距离 |
| bladeLengthRatio | number | 0.7 | 叶片长度比例 (0.3-1.0) |
| itemRotateWithBlade | boolean | false | 叶片内部元素是否随叶片旋转 |

### text-vector-effect（文字矢量动画特效）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| text | string | '福' | 要显示的核心文字 |
| fontSize | number | 300 | 核心文字字体大小 |
| contentType | string | 'mixed' | 内容类型：text \| image \| blessing \| mixed |
| words | array | [] | 填充文字列表 |
| images | array | [] | 填充图片列表 |
| blessingTypes | array | ['goldCoin', 'moneyBag', 'luckyBag', 'redPacket'] | 祝福图案类型 |
| elementSize | number | 20 | 填充元素大小 |
| colors | array | ['#FFD700', '#FF6B6B', ...] | 颜色列表 |
| charAnimationMode | string | 'together' | 多字动画模式：together \| sequential |
| fillType | string | 'sequential' | 填充动画类型：sequential \| random \| radial \| wave |
| stayAnimation | string | 'pulse' | 停留动画类型：pulse \| glow \| float \| none |
| enable3D | boolean | true | 启用3D效果 |
| enableStarField | boolean | true | 启用星空背景 |

### text-crystal-ball-effect（文字水晶球特效）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| contentType | string | 'text' | 内容类型：text \| image \| blessing \| mixed |
| words | array | [] | 文字列表 |
| images | array | [] | 图片路径列表 |
| blessingTypes | array | [] | 祝福图案类型列表 |
| ballRadius | number | 200 | 水晶球半径 (50-400) |
| ballColor | string | '#4169E1' | 水晶球颜色 |
| ballOpacity | number | 0.3 | 水晶球透明度 (0-1) |
| glowColor | string | '#87CEEB' | 发光颜色 |
| glowIntensity | number | 1 | 发光强度 (0-2) |
| rotationSpeedX | number | 0.2 | X轴旋转速度 (0-2) |
| rotationSpeedY | number | 0.6 | Y轴旋转速度 (0-2) |
| rotationSpeedZ | number | 0.1 | Z轴旋转速度 (0-2) |
| zoomEnabled | boolean | false | 是否启用镜头推进效果 |
| particleCount | number | 30 | 粒子数量 (10-100) |
| perspective | number | 1000 | 透视距离 (200-2000) |

## 混合输入系统

### 概述

混合输入系统支持在单个特效中同时使用文字、图片和祝福图案，提供统一的数据结构和渲染接口。

### 内容类型

- **text**：纯文字模式，仅使用 `words` 参数
- **image**：纯图片模式，仅使用 `images` 参数
- **blessing**：祝福图案模式，使用 `blessingTypes` 参数
- **mixed**：混合模式，可同时使用多种内容类型

### 祝福图案类型

| 类型 | 名称 | 说明 |
|------|------|------|
| goldCoin | 金币 | 金色圆形金币 |
| moneyBag | 金钱袋 | 装满金币的袋子 |
| luckyBag | 福袋 | 红色福袋 |
| redPacket | 红包 | 红色红包 |

### 祝福图案样式配置

```typescript
interface BlessingStyle {
  primaryColor: string;      // 主色调
  secondaryColor: string;    // 次要颜色
  enable3D: boolean;         // 启用3D效果
  enableGlow: boolean;       // 启用发光效果
  glowIntensity: number;     // 发光强度 (0-2)
}
```

### 使用示例

```json
{
  "contentType": "mixed",
  "words": ["福", "禄", "寿"],
  "images": ["coin.png", "https://example.com/img.png"],
  "blessingTypes": ["goldCoin", "moneyBag"],
  "imageWeight": 0.3,
  "blessingStyle": {
    "primaryColor": "#FFD700",
    "secondaryColor": "#FFA500",
    "enable3D": true,
    "enableGlow": true,
    "glowIntensity": 1
  }
}
```

## 开发规范

### 代码风格

- **TypeScript**：所有组件使用 TypeScript
- **Zod Schema**：每个组合组件定义 Zod schema
- **配置驱动**：参数处理逻辑放在配置文件中
- **BaseComposition**：新特效应继承 BaseComposition 基础组件

### BaseComposition 基础组件

`BaseComposition` 是所有特效组合组件的基础类，统一处理背景、遮罩、音效、水印、走马灯等渲染，减少重复代码。

#### 基本用法

```tsx
import { BaseComposition, StarField, CompleteCompositionSchema } from "../../shared/index";

export const MyEffectSchema = CompleteCompositionSchema.extend({
  // 特有参数
  words: z.array(z.string()),
  speed: z.number(),
});

export const MyEffect: React.FC<MyEffectProps> = ({
  words,
  speed,
  // 基础参数（自动传递给 BaseComposition）
  backgroundType = "color",
  backgroundColor = "#0a0a20",
  overlayOpacity = 0.2,
  audioEnabled = false,
  audioSource = "coin-sound.mp3",
  audioVolume = 0.5,
  watermarkEnabled = false,
  marqueeEnabled = false,
}) => {
  return (
    <BaseComposition
      backgroundType={backgroundType}
      backgroundColor={backgroundColor}
      overlayOpacity={overlayOpacity}
      audioEnabled={audioEnabled}
      audioSource={audioSource}
      audioVolume={audioVolume}
      watermarkEnabled={watermarkEnabled}
      marqueeEnabled={marqueeEnabled}
      extraLayers={<StarField count={100} opacity={0.5} />}
    >
      {/* 特效内容 */}
      <MyEffectContent words={words} speed={speed} />
    </BaseComposition>
  );
};
```

#### BaseComposition Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| children | ReactNode | - | 特效内容（必填） |
| showBackground | boolean | true | 是否显示背景层 |
| showOverlay | boolean | true | 是否显示遮罩层 |
| overlayPosition | string | 'before' | 遮罩位置：before \| after |
| extraLayers | ReactNode | null | 额外特效层（如 StarField） |
| extraLayersPosition | string | 'before-content' | 额外层位置 |
| backgroundType | string | 'color' | 背景类型 |
| backgroundColor | string | '#1a1a2e' | 背景颜色 |
| backgroundSource | string | null | 背景源文件 |
| overlayColor | string | '#000000' | 遮罩颜色 |
| overlayOpacity | number | 0.2 | 遮罩透明度 |
| audioEnabled | boolean | false | 是否启用音频 |
| audioSource | string | 'coin-sound.mp3' | 音频文件 |
| audioVolume | number | 0.5 | 音量 |
| audioLoop | boolean | true | 是否循环 |
| watermarkEnabled | boolean | false | 是否启用水印 |
| marqueeEnabled | boolean | false | 是否启用走马灯 |

#### Schema 扩展方式

```tsx
import { CompleteCompositionSchema } from "../../shared/index";

// 使用 CompleteCompositionSchema（包含背景+遮罩+音频+水印+走马灯+前景）
export const MySchema = CompleteCompositionSchema.extend({
  myParam: z.string(),
});
```

#### 渲染层顺序

BaseComposition 按以下顺序渲染各层：

1. **背景层**（Background）
2. **额外层**（extraLayers，before-content 时）
3. **遮罩层**（Overlay，before 时）
4. **内容层**（children）
5. **遮罩层**（Overlay，after 时）
6. **额外层**（extraLayers，after-content 时）
7. **水印层**（Watermark）
8. **走马灯层**（Marquee）
9. **前景层**（Foreground）
10. **音频层**（Audio）

### 公共组件

#### StarField 星空背景

```tsx
<StarField count={100} opacity={0.5} />
```

#### CenterGlow 中心发光

```tsx
<CenterGlow color="#FFD700" intensity={0.8} size={300} />
```

#### BlessingSymbol 祝福图案

```tsx
<BlessingSymbol
  type="goldCoin"
  size={50}
  primaryColor="#FFD700"
  enable3D={true}
  enableGlow={true}
/>
```

#### RadialBurst 中心发散粒子

```tsx
<RadialBurst
  effectType="burst"
  particleCount={20}
  colors={['#FFD700', '#FF6B6B']}
/>
```

### 响应式设计

- 使用 `useVideoConfig()` 获取视频尺寸
- 支持不同分辨率

## 常用命令

```bash
npm install              # 安装依赖
npm run api              # 启动 API 服务
npm run chrome:all       # 下载并链接 Chrome
npm run clean:all        # 清理所有 node_modules
```

## 故障排查

1. **渲染失败**：检查配置文件中的参数定义
2. **Chrome 问题**：运行 `npm run chrome:verify`
3. **依赖问题**：运行 `npm run clean:all && npm install`

## 联系方式

- 项目地址：https://github.com/opq007/remo-fects
- 问题反馈：提交 GitHub Issue