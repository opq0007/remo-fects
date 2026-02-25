# Remo-Fects - Remotion 特效视频生成器

基于 Remotion 的多特效视频生成器，支持统一 API 管理和共享依赖。

## 项目结构

```
remo-fects/
├── package.json           # 根目录配置（包含所有公共依赖）
├── node_modules/          # 共享依赖包（所有子项目共用）
│   └── .bin/              # 共享命令行工具
├── api/                   # 统一 API 服务器
│   ├── server.js          # Express 服务器
│   ├── render.js          # 渲染逻辑
│   ├── outputs/           # 输出视频目录
│   └── uploads/           # 上传文件目录
└── effects/               # 所有特效项目目录
    ├── text-rain-effect/  # 文字雨特效项目
    │   ├── src/           # 源代码
    │   ├── public/        # 静态资源
    │   └── package.json   # 子项目配置（无依赖）
    └── [新特效项目...]    # 未来添加的特效项目
```

## 特性

### 1. 依赖共享（npm workspaces）
- 所有 Remotion 相关依赖安装在根目录
- 子项目自动共享根目录的 node_modules
- 减少磁盘占用和安装时间
- 统一版本管理

### 2. 统一 API 管理
- 所有特效项目通过统一 API 调用
- 支持动态添加新特效项目
- 统一的任务状态查询和下载接口

### 3. 独立开发
- 每个特效项目可以独立运行和调试
- 使用 `npm run start` 启动 Remotion Studio
- 实时预览和调整参数

## 快速开始

### 1. 安装依赖

```bash
cd remo-fects
npm install
```

这会安装所有公共依赖到根目录的 `node_modules`。

### 2. 启动 API 服务

```bash
cd remo-fects
npm run api
```

或直接运行：
```bash
cd api
npm run api
```

### 3. 开发特效项目

```bash
cd text-rain-effect
npm run start
```

## 添加新特效项目

### 1. 创建项目目录

```bash
cd remo-fects/effects
mkdir your-effect
cd your-effect
```

### 2. 初始化项目

创建 `package.json`（无需重复依赖）：

```json
{
  "name": "your-effect",
  "version": "1.0.0",
  "description": "你的特效描述",
  "private": true,
  "scripts": {
    "start": "remotion studio",
    "render": "remotion render src/index.ts YourComposition out/video.mp4"
  }
}
```

### 3. 在 API 中配置项目

编辑 `api/server.js`：

```javascript
const projects = {
  'text-rain-effect': { /* ... */ },
  'your-effect': {
    path: path.join(__dirname, '../effects/your-effect'),
    compositionId: 'YourComposition',
    name: '你的特效名称'
  }
};
```

**无需其他配置！**
- npm workspace 会自动识别 `effects/*` 下的所有项目
- 自动继承根目录的所有公共依赖
- 无需重新安装依赖

## 公共依赖

### Remotion 核心库
- `@remotion/cli` - CLI 工具
- `@remotion/media` - 媒体处理
- `@remotion/renderer` - 渲染引擎
- `@remotion/zod-types` - 类型验证
- `remotion` - 核心框架

### React 生态
- `react` - UI 框架
- `react-dom` - DOM 渲染

### API 服务
- `express` - Web 服务器
- `cors` - 跨域处理
- `multer` - 文件上传

### 工具库
- `zod` - 数据验证

## 优势

### 1. 节省磁盘空间
- **优化前**：每个子项目 200-300 MB
- **优化后**：根目录 300 MB，子项目 0 MB
- **节省**：每个新项目节省 200-300 MB

### 2. 加快安装速度
- 只需安装一次公共依赖
- 新项目无需重复下载
- npm workspace 自动处理依赖解析

### 3. 统一版本管理
- 所有项目使用相同版本的 Remotion
- 避免版本冲突
- 便于升级和维护

### 4. 便于扩展
- 添加新特效项目只需配置
- 自动继承所有公共依赖
- 快速开发和部署

## 常用命令

### 根目录
```bash
npm install              # 安装所有依赖
npm run clean:all        # 清理所有 node_modules
npm run api              # 启动 API 服务
```

### 子项目（text-rain-effect）
```bash
cd effects/text-rain-effect
npm run start            # 启动 Remotion Studio
npm run render           # 渲染视频
```

### API 服务
```bash
cd api
npm run api              # 启动服务器
```

## API 使用示例

### 获取所有项目
```bash
GET http://localhost:3001/api/projects
```

### 创建渲染任务
```bash
POST http://localhost:3001/api/render/text-rain-effect
Content-Type: application/json

{
  "words": ["一马平川", "平安喜乐"],
  "duration": 5
}
```

### 查询任务状态
```bash
GET http://localhost:3001/api/jobs/:jobId
```

### 下载视频
```bash
GET http://localhost:3001/api/download/:jobId
```

## 注意事项

1. **不要在子项目中安装依赖**
   - 所有依赖都应放在根目录
   - 子项目自动继承根目录的 node_modules

2. **统一版本管理**
   - 所有项目使用相同的 Remotion 版本
   - 如需升级，在根目录执行 `npm update`

3. **脚本命令**
   - 子项目的脚本可以直接使用根目录的命令
   - 如 `npx remotion studio` 会自动查找

4. **清理缓存**
   - 如遇到依赖问题，运行 `npm run clean:all`
   - 然后重新运行 `npm install`