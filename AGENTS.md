# Remo-Fects 项目上下文文档

## 项目概述

**Remo-Fects** 是一个基于 Remotion 的多特效视频生成器，采用 npm workspaces 实现依赖共享和统一 API 管理。

### 核心特性

1. **依赖共享（npm workspaces）**：所有 Remotion 相关依赖安装在根目录，子项目自动共享，大幅节省磁盘空间
2. **统一 API 管理**：通过 Express 服务器提供统一的渲染接口，支持动态添加新特效项目
3. **组合特效**：支持将多个特效按顺序拼接、叠加或转场合并成一个最终视频
4. **独立开发**：每个特效项目可以独立运行和调试
5. **Chrome Headless Shell 共享**：所有项目共享一个 Chrome Headless Shell，避免重复下载

### 技术栈

- **Remotion 4.0**：基于 React 的视频生成框架
- **Node.js**：>=18.0.0
- **Express 4**：API 服务器
- **TypeScript 5**：类型安全
- **Zod**：数据验证

## 项目结构

```
remo-fects/
├── api/                          # 统一 API 服务器
│   ├── server.js                 # Express 服务器主文件
│   ├── render.js                 # 渲染逻辑（包含视频合并功能）
│   ├── outputs/                  # 输出视频目录
│   ├── uploads/                  # 上传文件目录
│   └── package.json              # API 项目配置
├── effects/                      # 所有特效项目目录
│   ├── text-rain-effect/         # 文字雨特效
│   │   ├── src/
│   │   │   ├── TextRainComposition.tsx  # 主组合组件
│   │   │   ├── TextRain.tsx             # 文字雨逻辑组件
│   │   │   ├── Root.tsx                 # Remotion 根组件
│   │   │   └── index.ts                 # 入口文件
│   │   ├── public/                     # 静态资源
│   │   ├── out/                        # 输出目录
│   │   ├── remotion.config.ts          # Remotion 配置
│   │   ├── tsconfig.json               # TypeScript 配置
│   │   └── package.json                # 子项目配置（无依赖）
│   ├── text-ring-effect/          # 金色文字环绕特效
│   ├── text-firework-effect/       # 文字烟花特效
│   ├── text-breakthrough-effect/   # 文字破屏特效
│   └── tai-chi-bagua-effect/       # 太极八卦图特效
├── scripts/                      # 工具脚本
│   └── install-chrome.js         # Chrome 管理工具
├── node_modules/                 # 共享依赖包
├── package.json                  # 根目录配置（包含所有公共依赖）
└── README.md                     # 项目文档
```

## 构建和运行

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- FFmpeg（已安装：D:\programs\ffmpeg-7.1.1-full_build\bin\ffmpeg.exe）

### 安装依赖

```bash
npm install
```

所有公共依赖会安装到根目录的 `node_modules`，子项目自动共享。

### 启动 API 服务

```bash
npm run api
```

服务将在 http://localhost:3001 启动。

### 开发特效项目

```bash
# 开发文字雨特效
npm run dev:text-rain

# 或直接进入项目目录
cd effects/text-rain-effect
npm run start
```

### Chrome Headless Shell 管理

```bash
# 下载并链接到所有项目
npm run chrome:all

# 仅下载
npm run chrome:download

# 仅链接
npm run chrome:link

# 验证链接
npm run chrome:verify

# 清理
npm run clean:chrome
```

## API 接口文档

### 1. 获取所有可用项目

**请求：**
```bash
GET http://localhost:3001/api/projects
```

**响应：**
```json
[
  {
    "id": "text-rain-effect",
    "name": "文字雨特效",
    "compositionId": "TextRain"
  },
  {
    "id": "text-ring-effect",
    "name": "金色发光立体字环绕特效",
    "compositionId": "TextRing"
  }
]
```

### 2. 创建渲染任务

**请求：**
```bash
POST http://localhost:3001/api/render/:projectId
Content-Type: multipart/form-data

# 表单字段
- background: (可选) 背景文件（图片或视频）
- words: 文字列表（JSON 数组或逗号分隔字符串）
- duration: 视频时长（秒）
- fps: 帧率
- width: 视频宽度
- height: 视频高度
- backgroundType: background/image/video
- backgroundColor: 背景颜色
```

**text-rain-effect 特有参数：**
- textDirection: horizontal/vertical
- fontSizeRange: [min, max]
- fallSpeed: 下落速度系数
- density: 雨滴密度
- opacityRange: [min, max]
- rotationRange: [min, max]
- laneCount: 列道数量
- minVerticalGap: 最小垂直间距
- audioEnabled: 是否启用音效
- audioVolume: 音量
- textStyle: 文字样式配置

**text-ring-effect 特有参数：**
- fontSize: 字体大小
- opacity: 透明度
- ringRadius: 环绕半径
- rotationSpeed: 旋转速度
- glowIntensity: 发光强度
- depth3d: 3D深度层数
- cylinderHeight: 圆柱体高度
- perspective: 透视距离
- mode: vertical/positions

**响应：**
```json
{
  "success": true,
  "jobId": "20260225-1234567890",
  "projectId": "text-rain-effect",
  "projectName": "文字雨特效",
  "message": "渲染任务已创建",
  "statusUrl": "/api/jobs/20260225-1234567890"
}
```

### 3. 查询任务状态

**请求：**
```bash
GET http://localhost:3001/api/jobs/:jobId
```

**响应：**
```json
{
  "id": "20260225-1234567890",
  "projectId": "text-rain-effect",
  "projectName": "文字雨特效",
  "status": "completed",
  "progress": 100,
  "createdAt": "2026-02-25T10:00:00.000Z",
  "completedAt": "2026-02-25T10:00:15.000Z",
  "error": null,
  "downloadUrl": "/outputs/video-20260225-1234567890.mp4"
}
```

### 4. 下载视频

**请求：**
```bash
GET http://localhost:3001/api/download/:jobId
```

### 5. 获取所有任务

**请求：**
```bash
GET http://localhost:3001/api/jobs
```

### 6. 创建组合特效渲染任务（新功能）

组合特效允许将多个特效按顺序拼接或叠加合并成一个最终视频。

**请求：**
```bash
POST http://localhost:3001/api/compose
Content-Type: application/json
```

**请求体参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `effects` | Array | 是 | 特效配置数组（至少 1 个） |
| `mergeMode` | string | 否 | 合并模式：`sequence`（顺序拼接）、`overlay`（叠加）、`transition`（转场），默认 `sequence` |
| `transition` | string | 否 | 转场效果（仅 mergeMode=transition 时生效）：`fade`、`fadeblack`、`slideleft`、`slideright` 等 |
| `transitionDuration` | number | 否 | 转场时长（秒），默认 0.5 |
| `width` | number | 否 | 全局视频宽度，默认 720 |
| `height` | number | 否 | 全局视频高度，默认 1280 |
| `fps` | number | 否 | 全局帧率，默认 30 |

**effects 数组中每个特效的配置：**

每个特效需要包含 `projectId` 和该特效特有的参数。所有参数都是可选的（使用默认值）：

```json
{
  "projectId": "text-rain-effect",  // 必填：特效项目 ID
  "words": ["文字1", "文字2"],       // 部分特效必填
  "duration": 5,                    // 该特效时长（秒）
  "fps": 30,
  "width": 720,
  "height": 1280,
  "backgroundColor": "#1a1a2e",
  // ... 其他特效特有参数
}
```

**示例 1：顺序拼接多个特效**

```bash
curl -X POST http://localhost:3001/api/compose \
  -H "Content-Type: application/json" \
  -d '{
    "mergeMode": "sequence",
    "effects": [
      {
        "projectId": "tai-chi-bagua-effect",
        "duration": 5,
        "yangColor": "#FFD700",
        "enable3D": true
      },
      {
        "projectId": "text-firework-effect",
        "words": ["新年快乐", "万事如意"],
        "duration": 8
      },
      {
        "projectId": "text-ring-effect",
        "words": ["恭喜发财"],
        "duration": 5
      }
    ]
  }'
```

**示例 2：叠加两个特效**

```bash
curl -X POST http://localhost:3001/api/compose \
  -H "Content-Type: application/json" \
  -d '{
    "mergeMode": "overlay",
    "width": 720,
    "height": 720,
    "effects": [
      {
        "projectId": "tai-chi-bagua-effect",
        "duration": 10,
        "opacity": 0.8
      },
      {
        "projectId": "text-rain-effect",
        "words": ["福", "禄", "寿", "喜"],
        "duration": 10,
        "opacity": 0.5
      }
    ]
  }'
```

**示例 3：带转场效果拼接**

```bash
curl -X POST http://localhost:3001/api/compose \
  -H "Content-Type: application/json" \
  -d '{
    "mergeMode": "transition",
    "transition": "fade",
    "transitionDuration": 1,
    "effects": [
      {
        "projectId": "tai-chi-bagua-effect",
        "duration": 6
      },
      {
        "projectId": "text-breakthrough-effect",
        "words": ["震撼登场"],
        "duration": 5
      }
    ]
  }'
```

**响应：**
```json
{
  "success": true,
  "jobId": "20260226-1234567890",
  "projectId": "composite",
  "projectName": "组合特效",
  "message": "组合渲染任务已创建",
  "effectsCount": 3,
  "mergeMode": "sequence",
  "statusUrl": "/api/jobs/20260226-1234567890"
}
```

**合并模式说明：**

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| `sequence` | 按顺序拼接视频，一个接一个播放 | 创建多段特效视频合集 |
| `overlay` | 多个视频叠加混合，透明度均分 | 同时展示多个特效效果 |
| `transition` | 带转场效果的拼接（目前仅支持2个视频） | 创建平滑过渡的特效切换 |

**JavaScript 调用示例：**

```javascript
async function renderCompositeEffect() {
  const response = await fetch('http://localhost:3001/api/compose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mergeMode: 'sequence',
      effects: [
        {
          projectId: 'tai-chi-bagua-effect',
          duration: 5,
          yangColor: '#FFD700',
          enable3D: true
        },
        {
          projectId: 'text-firework-effect',
          words: ['新年快乐', '大吉大利'],
          textColor: '#ff6b6b'
        }
      ]
    })
  });
  
  const result = await response.json();
  console.log('任务 ID:', result.jobId);
  return result.jobId;
}
```

## 添加新特效项目

### 步骤 1：创建项目目录

```bash
cd effects
mkdir your-effect
cd your-effect
```

### 步骤 2：创建项目文件

**package.json（无需依赖）：**
```json
{
  "name": "your-effect",
  "version": "1.0.0",
  "description": "你的特效描述",
  "private": true,
  "scripts": {
    "start": "remotion studio",
    "build": "remotion render src/index.ts YourComposition out/video.mp4 --chromium-flags=\"--headless=new\"",
    "render": "remotion render src/index.ts YourComposition out/video.mp4 --chromium-flags=\"--headless=new\""
  }
}
```

**remotion.config.ts（必需）：**
```typescript
import { Config } from "@remotion/cli/config";
import os from "os";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(os.cpus().length);
Config.setJpegQuality(80);
Config.setPixelFormat("yuv420p");
Config.setCodec("h264");
```

**src/index.ts（入口文件）：**
```typescript
import { Composition } from "remotion";
import { YourComposition, YourCompositionSchema } from "./YourComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="YourComposition"
        component={YourComposition}
        durationInFrames={300}
        fps={24}
        width={720}
        height={1280}
        schema={YourCompositionSchema}
      />
    </>
  );
};
```

**src/YourComposition.tsx（主组合组件）：**
```typescript
import React from "react";
import { AbsoluteFill } from "remotion";
import { z } from "zod";

export const YourCompositionSchema = z.object({
  // 定义你的参数 schema
  param1: z.string(),
  param2: z.number(),
});

export type YourCompositionProps = z.infer<typeof YourCompositionSchema>;

export const YourComposition: React.FC<YourCompositionProps> = ({ param1, param2 }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* 你的特效代码 */}
    </AbsoluteFill>
  );
};
```

### 步骤 3：在 API 中配置项目

编辑 `api/server.js`，在 `projects` 对象中添加：

```javascript
const projects = {
  'text-rain-effect': { /* ... */ },
  'text-ring-effect': { /* ... */ },
  'your-effect': {
    path: path.join(__dirname, '../effects/your-effect'),
    compositionId: 'YourComposition',
    name: '你的特效名称'
  }
};
```

### 步骤 4：在 render.js 中处理项目参数

编辑 `api/render.js`，添加项目特有的参数处理：

```javascript
// your-effect 特有参数
if (params.projectId === 'your-effect') {
  defaultProps.param1 = params.param1;
  defaultProps.param2 = params.param2;
  // 添加更多参数...
}
```

## 开发规范

### 代码风格

- **TypeScript**：所有组件使用 TypeScript，定义清晰的类型
- **Zod Schema**：每个组合组件必须定义 Zod schema 用于参数验证
- **Remotion 组件**：使用 Remotion 提供的组件（AbsoluteFill, Img, Video 等）
- **静态资源**：使用 `staticFile()` 引用 public 目录中的资源

### 文件命名

- 组件文件使用 PascalCase：`YourComponent.tsx`
- 组合组件使用 Composition 后缀：`YourComposition.tsx`
- 配置文件使用小写：`remotion.config.ts`

### 渲染优化

所有特效项目的 `remotion.config.ts` 应包含以下优化配置：

```typescript
Config.setVideoImageFormat("jpeg");     // 使用 JPEG 编码（更快）
Config.setJpegQuality(80);              // 平衡质量和速度
Config.setPixelFormat("yuv420p");       // 兼容性最好的像素格式
Config.setConcurrency(os.cpus().length); // 使用所有 CPU 核心
```

### 响应式设计

- 使用 `useVideoConfig()` 获取视频尺寸
- 组件应支持不同的分辨率
- 字体和间距应使用相对单位或基于视频宽度的比例

## 常用命令

### 根目录

```bash
npm install              # 安装所有依赖
npm run clean:all        # 清理所有 node_modules
npm run clean:node       # 清理子项目的 node_modules
npm run clean:cache      # 清理 npm 缓存
npm run clean:chrome     # 清理 Chrome
npm run chrome:all       # 下载并链接 Chrome
npm run api              # 启动 API 服务
```

### 子项目

```bash
cd effects/text-rain-effect
npm run start            # 启动 Remotion Studio
npm run render           # 渲染完整视频
npm run render-preview   # 渲染预览（前 90 帧）
npm run build            # 构建视频
```

## 已知问题和注意事项

### Chrome Headless Shell

- 项目使用全局 Chrome Headless Shell，避免重复下载
- 所有子项目通过软链接共享 Chrome
- 如果遇到渲染问题，运行 `npm run chrome:verify` 检查链接状态

### 依赖管理

- **不要在子项目中安装依赖**：所有依赖都应在根目录安装
- 子项目自动继承根目录的 node_modules
- 如需添加新依赖，在根目录安装：`npm install your-package`

### 文件上传

- 最大文件大小：50MB
- 支持格式：JPG/PNG/GIF/MP4/WEBM
- 上传的文件会复制到对应特效项目的 public 目录

### 渲染性能

- 预览模式（Remotion Studio）比渲染模式快得多
- 渲染速度受以下因素影响：
  - 帧率（fps）
  - 视频时长（duration）
  - 视频分辨率（width × height）
  - 特效复杂度（密度、粒子数量等）
- 优化建议：
  - 降低 fps（24-30）
  - 减少 density
  - 使用简单的文字效果
  - 缩短视频时长

### Windows 特殊注意

- 使用 PowerShell 或 CMD 命令
- 路径使用反斜杠 `\`（但许多工具也接受正斜杠 `/`）
- 命令链使用分号 `;` 而不是 `&&`
- Chrome 链接使用 Junction 或符号链接（可能需要管理员权限）

## 项目维护

### 清理过期任务

API 服务器每 30 分钟自动清理超过 30 分钟的已完成任务及其输出文件。

### 查看日志

渲染任务的日志会输出到控制台，包含：
- 任务 ID
- 项目 ID
- 组合 ID
- 渲染进度
- 错误信息

### 故障排查

1. **渲染失败**：检查 `api/render.js` 中的参数传递是否正确
2. **Chrome 问题**：运行 `npm run chrome:verify` 验证链接状态
3. **依赖问题**：运行 `npm run clean:all && npm install` 重新安装
4. **端口占用**：修改 `api/server.js` 中的 PORT 常量

## 贡献指南

### 添加新特效

1. 按照上述"添加新特效项目"步骤创建项目
2. 在 API 中配置项目
3. 测试所有参数是否正确传递
4. 更新 README.md 文档

### 代码审查要点

- TypeScript 类型是否正确
- Zod schema 是否完整
- 是否使用了 Remotion 提供的组件
- 是否遵循现有的代码风格
- 是否正确处理了背景和遮罩

## 联系方式

- 项目地址：https://github.com/opq007/remo-fects
- 问题反馈：提交 GitHub Issue