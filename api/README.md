# Remo-Fects API

统一的 Remotion 特效视频生成 API 服务器。

## 目录结构

```
remo-fects/
├── api/                    # API 服务器（统一管理所有特效）
│   ├── server.js          # Express 服务器
│   ├── render.js          # 渲染逻辑
│   ├── package.json       # 依赖配置
│   ├── outputs/           # 输出视频目录
│   └── uploads/           # 上传文件目录
├── text-rain-effect/      # 文字雨特效项目
│   ├── src/
│   ├── public/
│   └── package.json
└── [其他特效项目...]      # 未来添加的特效项目
```

## 快速开始

### 1. 安装依赖

```bash
cd api
npm install
```

### 2. 启动 API 服务

```bash
npm run api
```

服务将在 `http://localhost:3001` 启动。

### 3. 添加新的特效项目

在 `api/server.js` 的 `projects` 配置中添加新项目：

```javascript
const projects = {
  'text-rain-effect': {
    path: path.join(__dirname, '../text-rain-effect'),
    compositionId: 'TextRain',
    name: '文字雨特效'
  },
  'your-effect': {
    path: path.join(__dirname, '../your-effect'),
    compositionId: 'YourComposition',
    name: '你的特效名称'
  }
};
```

## API 接口

### 获取所有可用项目

```
GET /api/projects
```

**响应示例：**
```json
[
  {
    "id": "text-rain-effect",
    "name": "文字雨特效",
    "compositionId": "TextRain"
  }
]
```

### 创建渲染任务

```
POST /api/render/:projectId
Content-Type: multipart/form-data
```

**参数：**
- `projectId` - 项目 ID（路径参数）
- `words` - 文字列表（JSON 数组或逗号分隔）
- `textDirection` - 文字方向（horizontal/vertical）
- `fontSizeRange` - 字体大小范围 [min, max]
- `fallSpeed` - 下落速度
- `density` - 密度
- `duration` - 视频时长（秒）
- `fps` - 帧率
- `width` - 视频宽度
- `height` - 视频高度
- `background` - 背景图片文件（可选）
- 其他参数...

**示例（文字雨特效）：**
```bash
curl -X POST http://localhost:3001/api/render/text-rain-effect \
  -F "words=[\"一马平川\",\"平安喜乐\"]" \
  -F "textDirection=vertical" \
  -F "duration=5" \
  -F "background=@bg.jpg"
```

**响应示例：**
```json
{
  "success": true,
  "jobId": "20260225-1771985664997",
  "projectId": "text-rain-effect",
  "projectName": "文字雨特效",
  "message": "渲染任务已创建",
  "statusUrl": "/api/jobs/20260225-1771985664997"
}
```

### 查询任务状态

```
GET /api/jobs/:jobId
```

**响应示例：**
```json
{
  "id": "20260225-1771985664997",
  "projectId": "text-rain-effect",
  "projectName": "文字雨特效",
  "status": "completed",
  "progress": 100,
  "createdAt": "2026-02-25T02:14:24.997Z",
  "completedAt": "2026-02-25T02:14:48.800Z",
  "downloadUrl": "/outputs/video-20260225-1771985664997.mp4"
}
```

### 下载视频

```
GET /api/download/:jobId
```

### 获取所有任务

```
GET /api/jobs
```

## 设计原则

1. **项目隔离**：每个特效项目都是独立的子目录，可以单独运行和调试
2. **统一 API**：所有特效项目通过同一个 API 服务调用
3. **路由区分**：通过 URL 路径 `/api/render/:projectId` 区分不同特效
4. **统一接口**：任务状态查询和视频下载使用统一的接口