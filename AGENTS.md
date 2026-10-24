# Remo-Fects 项目上下文文档

## 项目概述

**Remo-Fects** 是一个基于 Remotion 的多特效视频生成器，采用 npm workspaces 实现依赖共享，使用**配置驱动架构**实现特效参数的统一管理，并通过**公共组件库**实现跨项目复用。

### 核心特性

1. **依赖共享（npm workspaces）**：所有 Remotion 相关依赖安装在根目录，子项目自动共享，大幅节省磁盘空间
2. **公共组件库（effects/shared）**：角色系统、魔法效果、彩带粒子、卡通元素等公共组件，支持跨项目复用
3. **配置驱动架构**：每个特效项目的参数定义在独立配置文件中，新增特效无需修改核心代码
4. **统一 API 管理**：通过 Express 服务器提供统一的渲染接口，自动处理参数验证和转换
5. **组合特效**：支持将多个特效按顺序拼接、叠加或转场合并成一个最终视频
6. **独立开发**：每个特效项目可以独立运行和调试
7. **混合输入支持**：支持文字、图片、祝福图案等多种内容类型的混合输入

### 技术栈

- **Remotion 4.0**：基于 React 的视频生成框架
- **Node.js**：>=18.0.0
- **Express 4**：API 服务器
- **TypeScript 5**：类型安全
- **Zod 4**（^4.3.6）：数据验证（注意与 Zod 3 的 API 差异）

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
│   │   ├── shared-params.js          # 共享参数定义
│   │   ├── kids-birthday-effect.js   # 儿童生日特效配置
│   │   └── [其他特效配置...]
│   ├── outputs/                      # 输出视频目录
│   └── uploads/                      # 上传文件目录
├── effects/                          # 所有特效项目目录
│   ├── shared/                       # 公共组件库（复用核心）⭐
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
│   │   │   ├── MixedInputItem.tsx    # 混合输入渲染组件
│   │   │   ├── Character.tsx         # 角色系统（生肖/萌宠/超人）🆕
│   │   │   ├── MagicEffects.tsx      # 魔法效果集合 🆕
│   │   │   ├── ConfettiBurst.tsx     # 彩带粒子爆炸 🆕
│   │   │   ├── CartoonElements.tsx   # 卡通元素
│   │   ├── Countdown.tsx         # 倒计时组件
│   │   ├── Subtitle.tsx          # 字幕组件
│   │   ├── StoryChapter.tsx      # 故事章节组件
│   │   ├── StoryPanel.tsx        # 故事面板组件
│   │   └── TransparentVideo.tsx  # 透明视频组件 🆕
│   │   ├── schemas/                  # 公共 Schema 定义
│   │   ├── types/                    # 类型定义
│   │   │   ├── common.ts             # 通用类型
│   │   │   ├── mixed-input.ts        # 混合输入类型
│   │   │   ├── character.ts          # 角色类型 🆕
│   │   │   ├── colors.ts             # 颜色主题 🆕
│   │   │   └── cartoon.ts            # 卡通元素类型 🆕
│   │   └── utils/                    # 工具函数
│   │       ├── easing.ts             # 缓动函数
│   │       ├── random.ts             # 随机数生成
│   │       ├── textStyle.ts          # 文字样式工具
│   │       ├── mixed-input.ts        # 混合输入工具函数
│   │       └── colors.ts             # 颜色工具 🆕
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
├── project/                          # 儿童生日祝福视频生成器 🆕
│   ├── src/
│   │   ├── components/               # 模块化分镜组件
│   │   ├── compositions/             # 主组合组件
│   │   ├── schemas/                  # 参数 Schema
│   │   ├── types/                    # 类型定义
│   │   └── utils/                    # 工具函数
│   ├── AGENTS.md                     # 项目开发上下文
│   └── package.json
├── scripts/                          # 工具脚本
│   └── install-chrome.js             # Chrome 管理工具
├── node_modules/                     # 共享依赖包
├── package.json                      # 根目录配置（包含所有公共依赖）
└── README.md                         # 项目文档
```

## 公共组件库（effects/shared）

### 概述

公共组件库提供了可在多个特效项目中复用的组件、类型和工具函数，避免重复开发。

**导入路径约定（相对路径，不走包名）：**

- 从 `effects/<特效>/src/` 导入：`import { ... } from "../../shared/index";`
- 从 `project/src/` 导入：`import { ... } from "../../effects/shared";`

注意：`shared/package.json` 的 `main` 指向 `dist/index.js`，但实际代码均通过上述相对路径直接引用源码（`dist` 通常未构建），不要按包名 `shared` 导入。

### 组件列表

#### 角色系统（Character.tsx）

三大角色系列，每个角色有独立的配色和问候语：

```tsx
import { Character, SpeechBubble, CharacterWithSpeech, getCharacterConfig } from '../../effects/shared';

// 生肖守护神（12种）
<Character series="zodiac" type="tiger" size={180} expression="happy" />

// 萌宠精灵（6种）
<Character series="pet" type="bunny" size={150} expression="waving" />

// 勇气超人（5种）
<Character series="hero" type="astronaut" size={160} expression="excited" />

// 带对话气泡
<CharacterWithSpeech 
  series="zodiac" 
  type="tiger" 
  speech="你好呀！" 
  showSpeech={true} 
/>

// 单独使用对话气泡
<SpeechBubble text="生日快乐！" color="#FFFFFF" textColor="#333" />
```

**Props 说明：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| series | 'zodiac' \| 'pet' \| 'hero' | - | 角色系列（必填） |
| type | ZodiacType \| PetType \| HeroType | - | 角色类型（必填） |
| size | number | 200 | 角色大小 |
| expression | 'happy' \| 'excited' \| 'waving' \| 'hugging' | 'happy' | 表情 |
| position | 'center' \| 'left' \| 'right' | 'center' | 位置 |
| inline | boolean | false | 是否使用内联布局 |

#### 魔法效果（MagicEffects.tsx）

```tsx
import { 
  MagicParticles, MagicWand, MagicCircle,
  WhiteFlashTransition, Firework, BalloonBurst,
  ShootingStar, StarFieldBackground 
} from '../../effects/shared';

// 魔法光粒聚集
<MagicParticles 
  durationInFrames={48} 
  particleCount={80} 
  color="#B892FF" 
/>

// 魔法棒
<MagicWand x={0.5} y={0.6} casting={true} />

// 魔法圆环
<MagicCircle radius={150} color="#B892FF" rotationSpeed={1} />

// 白闪转场
<WhiteFlashTransition durationInFrames={12} />

// 烟花绽放
<Firework x={0.5} y={0.4} color="#FFD76A" particleCount={30} />

// 气球爆炸
<BalloonBurst x={0.5} y={0.5} balloonCount={8} />

// 流星
<ShootingStar startX={0.8} startY={0.1} endX={0.2} endY={0.5} />

// 星空背景
<StarFieldBackground starCount={100} twinkleSpeed={0.1} />
```

#### 彩带粒子（ConfettiBurst.tsx）

```tsx
import { ConfettiBurst } from '../../effects/shared';

<ConfettiBurst 
  primaryColor="#FFD76A"
  secondaryColor="#7EC8FF"
  level="high"      // 'low' | 'medium' | 'high'
  seed={123}
/>
```

#### 卡通元素（CartoonElements.tsx）

```tsx
import { CartoonElements } from '../../effects/shared';

<CartoonElements
  defaultColor="#FFD76A"
  elements={[
    { type: 'balloon', position: 'top', count: 3, color: '#FF6FAF' },
    { type: 'balloon', position: 'top', count: 2, color: '#6EC8FF' },
    { type: 'star', position: 'around', count: 8, color: '#FFD93D' },
    { type: 'heart', position: 'around', count: 5, color: '#FF6FAF' },
    { type: 'cake', position: 'bottom', count: 1, color: '#8DECB4' }
  ]}
  seed={0}
/>
```

**支持的卡通类型：** star, balloon, cake, rocket, unicorn, heart, crown

### 类型导出

```tsx
// 角色类型
import { 
  CharacterSeries, ZodiacType, PetType, HeroType, 
  CharacterConfig, ScreenOrientation 
} from '../../effects/shared/types';

// 颜色主题
import { 
  PRIMARY_COLORS, CONFETTI_COLORS,
  ZODIAC_CHARACTERS, PET_CHARACTERS, HERO_CHARACTERS,
  PrimaryColors, ColorTheme 
} from '../../effects/shared/types';

// 卡通元素
import { 
  CartoonElementType, CartoonElement, 
  DEFAULT_CARTOON_COLORS 
} from '../../effects/shared/types';
```

### 工具函数

```tsx
import { 
  colorWithOpacity, generateGlow, generate3DTextShadow,
  getCharacterConfig, getContrastColor, blendColors 
} from '../../effects/shared/utils';
```

## 配置驱动架构

### 架构说明

项目采用**配置驱动**方式管理特效参数，新增特效只需添加配置文件，无需修改 `render.js` 和 `server.js`。

配置注册表为 `api/effect-configs/index.js`。其中 `kids-birthday-effect` 指向 `project/` 工作区（compositionId 为 `KidsBirthday`）；修改儿童生日项目前，先阅读 `project/AGENTS.md`（含分镜模块时间线与版本裁剪规则）。

### 配置文件结构

```javascript
// api/effect-configs/your-effect.js
const path = require('path');

const config = {
  id: 'your-effect',
  name: '你的特效名称',
  compositionId: 'YourComposition',
  path: path.join(__dirname, '../../effects/your-effect')
};

const params = {
  customParam: {
    type: 'number',
    defaultValue: 100,
    parser: (v) => parseInt(v) || 100,
  }
};

function validate(params) {
  if (!params.words || params.words.length === 0) {
    return { valid: false, error: '请提供文字列表' };
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

### 公共参数

所有特效共享以下公共参数（由 `common-params.js` 统一处理），采用**嵌套参数格式**（请求时传嵌套对象，如 `"background": {"type": "gradient", "color": "#1a1a2e"}`）：

**基础参数（顶层）：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| width | number | 720 | 视频宽度 |
| height | number | 1280 | 视频高度 |
| fps | number | 24 | 帧率 |
| duration | number | 10 | 视频时长（秒） |
| seed | number | 随机 | 随机种子 |

**嵌套参数组（NESTED_PARAMS）：** 未传的组使用组件内置默认值（默认均不启用）

| 参数组 | 关键字段 | 说明 |
|--------|----------|------|
| background | type ('color'\|'gradient'\|'image'\|'video'), color, gradient, source, videoLoop, videoMuted | 背景配置 |
| overlay | color, opacity | 遮罩配置 |
| audio | enabled, source, volume, loop | 音频配置 |
| watermark | enabled, text, fontSize, color, opacity, velocityX/Y 等 | 水印配置 |
| marquee | enabled, foreground/background (texts, fontSize, color...), direction, speed 等 | 走马灯配置 |
| radialBurst | enabled, effectType, color, count, rotationSpeed 等 | 中心发散粒子配置 |
| foreground | enabled, type ('image'\|'video'), source, animationType, zIndex 等 | 前景配置 |

完整字段定义见 `api/effect-configs/common-params.js` 中的 `NESTED_PARAMS`。

## 构建和运行

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- FFmpeg

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

### 2. 创建渲染任务

```bash
POST http://localhost:3001/api/render/:projectId
Content-Type: application/json

{
  "words": ["福", "禄", "寿"],
  "duration": 5
}
```

### 3. 创建组合特效渲染任务

```bash
POST http://localhost:3001/api/compose
Content-Type: application/json

{
  "mergeMode": "sequence",
  "effects": [
    { "projectId": "tai-chi-bagua-effect", "duration": 5 },
    { "projectId": "text-firework-effect", "words": ["新年快乐"], "duration": 8 }
  ]
}
```

**合并模式：** sequence（顺序拼接）、overlay（叠加混合）、transition（带转场拼接，支持 fade/fadeblack/fadewipe/slideleft/slideright/slideup/slidedown 等转场类型）

### 4. 其他接口

- `GET /api/projects/:projectId/params` - 获取特效参数定义
- `GET /api/jobs/:jobId` - 查询渲染任务状态（渲染为异步任务）
- `GET /api/download/:jobId` - 下载渲染结果
- `GET /api/jobs` - 列出所有任务
- `POST /api/effects/register` - 运行时动态注册特效配置

**文件上传：** `/api/render` 和 `/api/compose` 通过 multipart 表单的 `background` 字段上传背景文件（multer 处理，存入 `api/uploads/`）。

## 添加新特效项目

### 基本要求

1. 使用 Remotion 框架来实现动画效果
2. 尽可能复用 shared 目录下已有的公共组件，避免重复开发
3. 新特效默认需要支持 Mixed 类型输入
4. 动画需要符合近大远小的真实3D立体透视物理规律
5. 新创建的特效项目，需要添加 README.md 说明文档

### 步骤 1：创建特效项目目录

在 `effects/` 目录下创建新项目，包含：
- `src/index.ts` - 入口文件
- `src/YourComposition.tsx` - 主组合组件（继承 BaseComposition）
- `remotion.config.ts` - Remotion 配置
- `package.json` - 项目配置

### 步骤 2：创建组合组件

```tsx
// effects/your-effect/src/YourComposition.tsx
import { BaseComposition, CompleteCompositionSchema } from "../../shared";
import { YourEffectContent } from "./YourEffectContent";

export const YourCompositionSchema = CompleteCompositionSchema.extend({
  words: z.array(z.string()),
  speed: z.number().default(1),
});

export const YourComposition: React.FC<YourCompositionProps> = ({
  words,
  speed,
  ...props
}) => {
  return (
    <BaseComposition {...props}>
      <YourEffectContent words={words} speed={speed} />
    </BaseComposition>
  );
};
```

### 步骤 3：创建配置文件

在 `api/effect-configs/` 目录创建配置文件，然后注册到 `index.js`。

**完成！无需修改 `render.js` 和 `server.js`。**

## 开发规范

### 代码风格

- **TypeScript**：所有组件使用 TypeScript
- **Zod Schema**：每个组合组件定义 Zod schema
- **配置驱动**：参数处理逻辑放在配置文件中
- **BaseComposition**：新特效应继承 BaseComposition 基础组件

### BaseComposition 基础组件

`BaseComposition` 统一处理背景、遮罩、音效、水印、走马灯等渲染，减少重复代码。

**渲染层顺序：**

1. 背景层（Background）
2. 额外层（extraLayers，before-content 时）
3. 遮罩层（Overlay，before 时）
4. 内容层（children）
5. 遮罩层（Overlay，after 时）
6. 额外层（extraLayers，after-content 时）
7. 水印层（Watermark）
8. 走马灯层（Marquee）
9. 前景层（Foreground）
10. 音频层（Audio）

## 常用命令

```bash
npm install              # 安装依赖
npm run api              # 启动 API 服务（http://localhost:3001）
npm run dev:text-rain    # 开发文字雨特效（根目录仅此一个 dev 脚本）
npm run start --workspace=effects/<特效名>   # 开发其他特效（remotion studio）
npm run dev:kids-birthday --workspace=project  # 儿童生日项目 studio（端口 3101）
npm run type-check --workspace=shared  # shared 组件库类型检查（tsc --noEmit）
npm run chrome:all       # 下载并链接 Chrome
npm run chrome:verify    # 验证 Chrome 安装
npm run clean:all        # 清理所有 node_modules
```

**渲染注意：** 通过 Remotion CLI 直接渲染时需要加 `--chromium-flags="--headless=new"`（各特效 package.json 的 `render`/`build` 脚本已包含）。API 渲染为异步任务，返回 jobId 后通过 `/api/jobs/:jobId` 轮询状态。

## 故障排查

1. **渲染失败**：检查配置文件中的参数定义
2. **Chrome 问题**：运行 `npm run chrome:verify`
3. **依赖问题**：运行 `npm run clean:all && npm install`

## 联系方式

- 项目地址：https://github.com/opq0007/remo-fects
- 问题反馈：提交 GitHub Issue
