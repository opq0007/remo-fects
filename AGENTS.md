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
│   │   └── text-grow-explode-effect.js # 生长爆炸特效配置
│   ├── outputs/                      # 输出视频目录
│   ├── uploads/                      # 上传文件目录
│   └── package.json                  # API 项目配置
├── effects/                          # 所有特效项目目录
│   ├── shared/                       # 公共组件和 Schema
│   │   ├── components/               # 公共组件（Background, Overlay, Audio 等）
│   │   ├── schemas/                  # 公共 Schema 定义
│   │   └── utils/                    # 工具函数
│   ├── text-rain-effect/             # 文字雨特效
│   ├── text-ring-effect/             # 金色文字环绕特效
│   ├── text-firework-effect/         # 文字烟花特效
│   ├── text-breakthrough-effect/     # 文字破屏特效
│   ├── tai-chi-bagua-effect/         # 太极八卦图特效
│   └── text-grow-explode-effect/     # 姓名生长爆炸特效
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
| backgroundType | string | 'color' | 背景类型 |
| backgroundColor | string | '#1a1a2e' | 背景颜色 |
| overlayColor | string | '#000000' | 遮罩颜色 |
| overlayOpacity | number | 0.2 | 遮罩透明度 |
| audioEnabled | boolean | false | 是否启用音频 |
| audioVolume | number | 0.5 | 音量 |
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
  { "id": "text-grow-explode-effect", "name": "姓名生长爆炸特效", "compositionId": "TextGrowExplode" }
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

### 步骤 1：创建特效项目目录

在 `effects/` 目录下创建新项目，包含：
- `src/index.ts` - 入口文件
- `src/YourComposition.tsx` - 主组合组件
- `remotion.config.ts` - Remotion 配置
- `package.json` - 项目配置

### 步骤 2：创建配置文件（关键）

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
  // 定义你的参数
};

function validate(params) {
  return { valid: true };
}

function buildRenderParams(reqParams, commonParams) {
  return { ...commonParams, ...reqParams };
}

module.exports = { config, params, validate, buildRenderParams };
```

### 步骤 3：注册配置

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

### text-firework-effect（文字烟花特效）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| words | array | [] | 文字列表（必填） |
| fontSize | number | 60 | 字体大小 |
| textColor | string | '#ffd700' | 文字颜色 |
| glowColor | string | '#ffaa00' | 发光颜色 |
| particleCount | number | 80 | 粒子数量 |
| interval | number | 40 | 发射间隔 |

### tai-chi-bagua-effect（太极八卦特效）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| yangColor | string | '#FFD700' | 阳色 |
| yinColor | string | '#1a1a1a' | 阴色 |
| taichiSize | number | 200 | 太极图大小 |
| baguaRadius | number | 280 | 八卦半径 |
| enable3D | boolean | false | 启用3D效果 |
| enableGoldenSparkle | boolean | true | 金光闪闪 |

### text-breakthrough-effect（文字破屏特效）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| words | array | [] | 文字列表 |
| fontSize | number | 120 | 字体大小 |
| approachDuration | number | 45 | 接近时长 |
| impactScale | number | 1.4 | 冲击缩放 |

## 开发规范

### 代码风格

- **TypeScript**：所有组件使用 TypeScript
- **Zod Schema**：每个组合组件定义 Zod schema
- **配置驱动**：参数处理逻辑放在配置文件中

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
