# 太极八卦图特效

一个基于 Remotion 的太极八卦图动态特效，支持丰富的视觉效果和参数配置。

## 功能特性

- ✅ 太极图自转动画
- ✅ 八卦图环绕旋转
- ✅ 能量场光环效果
- ✅ 能量粒子飘动
- ✅ 3D透视视角
- ✅ 垂直位置控制
- ✅ 3D立体厚度效果
- ✅ 金光闪闪粒子
- ✅ 神秘氛围光晕

## 参数说明

### 基础颜色配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `yangColor` | string | `#FFD700` | 阳色（金色） |
| `yinColor` | string | `#1a1a1a` | 阴色（黑色） |
| `backgroundColor` | string | `#FFFFFF` | 背景颜色 |

### 发光效果

| 参数 | 类型 | 默认值 | 范围 | 说明 |
|------|------|--------|------|------|
| `glowIntensity` | number | `0.9` | 0-1 | 发光强度 |

### 动画速度

| 参数 | 类型 | 默认值 | 范围 | 说明 |
|------|------|--------|------|------|
| `taichiRotationSpeed` | number | `1` | 0.1-5 | 太极图旋转速度 |
| `baguaRotationSpeed` | number | `0.8` | 0.1-5 | 八卦图旋转速度 |

### 尺寸配置

| 参数 | 类型 | 默认值 | 范围 | 说明 |
|------|------|--------|------|------|
| `taichiSize` | number | `200` | 50-500 | 太极图直径（像素） |
| `baguaRadius` | number | `280` | 100-600 | 八卦图环绕半径（像素） |

### 显示选项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `showLabels` | boolean | `true` | 是否显示卦名 |
| `showParticles` | boolean | `true` | 是否显示能量粒子 |
| `showEnergyField` | boolean | `true` | 是否显示能量场光环 |
| `labelOffset` | number | `45` | 卦名距离卦象的偏移量 |

### 粒子效果

| 参数 | 类型 | 默认值 | 范围 | 说明 |
|------|------|--------|------|------|
| `particleCount` | number | `40` | 0-100 | 能量粒子数量 |
| `particleSpeed` | number | `1` | 0.1-3 | 粒子运动速度 |

### 3D视角

| 参数 | 类型 | 默认值 | 范围 | 说明 |
|------|------|--------|------|------|
| `viewAngle` | number | `30` | 0-90 | 视角角度（0=水平视角，90=正上方俯视） |
| `perspectiveDistance` | number | `800` | 200-2000 | 透视距离（值越大透视越平缓） |

### 垂直位置（新增）

| 参数 | 类型 | 默认值 | 范围 | 说明 |
|------|------|--------|------|------|
| `verticalPosition` | number | `0.5` | 0-1 | 太极图垂直位置（0=顶部，0.5=中心，1=底部） |

### 3D立体效果（新增）

| 参数 | 类型 | 默认值 | 范围 | 说明 |
|------|------|--------|------|------|
| `enable3D` | boolean | `false` | - | 是否开启3D立体厚度效果 |
| `depth3D` | number | `15` | 5-50 | 3D立体层厚度（像素） |

### 金光闪闪效果（新增）

| 参数 | 类型 | 默认值 | 范围 | 说明 |
|------|------|--------|------|------|
| `enableGoldenSparkle` | boolean | `true` | - | 是否开启金光闪烁粒子 |
| `sparkleDensity` | number | `30` | 10-100 | 闪烁粒子密度 |

### 神秘氛围效果（新增）

| 参数 | 类型 | 默认值 | 范围 | 说明 |
|------|------|--------|------|------|
| `enableMysticalAura` | boolean | `true` | - | 是否开启神秘光晕氛围 |
| `auraIntensity` | number | `0.6` | 0-1 | 氛围强度 |

## API 调用示例

### 1. 基础调用

```bash
curl -X POST http://localhost:3001/api/render/tai-chi-bagua-effect \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 10,
    "fps": 30,
    "width": 720,
    "height": 720
  }'
```

### 2. 自定义颜色

```bash
curl -X POST http://localhost:3001/api/render/tai-chi-bagua-effect \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 10,
    "fps": 30,
    "width": 720,
    "height": 720,
    "yangColor": "#FF6B6B",
    "yinColor": "#2C3E50",
    "backgroundColor": "#1A1A2E"
  }'
```

### 3. 开启3D立体效果

```bash
curl -X POST http://localhost:3001/api/render/tai-chi-bagua-effect \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 10,
    "fps": 30,
    "width": 720,
    "height": 720,
    "enable3D": true,
    "depth3D": 20,
    "viewAngle": 45
  }'
```

### 4. 调整垂直位置

```bash
curl -X POST http://localhost:3001/api/render/tai-chi-bagua-effect \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 10,
    "fps": 30,
    "width": 720,
    "height": 1280,
    "verticalPosition": 0.3
  }'
```

### 5. 关闭部分效果

```bash
curl -X POST http://localhost:3001/api/render/tai-chi-bagua-effect \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 10,
    "fps": 30,
    "width": 720,
    "height": 720,
    "enableGoldenSparkle": false,
    "enableMysticalAura": false,
    "showParticles": false,
    "showEnergyField": false
  }'
```

### 6. 完整参数示例

```bash
curl -X POST http://localhost:3001/api/render/tai-chi-bagua-effect \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 15,
    "fps": 30,
    "width": 1080,
    "height": 1080,
    "yangColor": "#FFD700",
    "yinColor": "#1a1a1a",
    "backgroundColor": "#0D0D0D",
    "glowIntensity": 0.95,
    "taichiRotationSpeed": 1.2,
    "baguaRotationSpeed": 0.6,
    "taichiSize": 250,
    "baguaRadius": 350,
    "showLabels": true,
    "showParticles": true,
    "showEnergyField": true,
    "particleCount": 50,
    "particleSpeed": 1.2,
    "viewAngle": 25,
    "perspectiveDistance": 1000,
    "verticalPosition": 0.5,
    "enable3D": true,
    "depth3D": 18,
    "enableGoldenSparkle": true,
    "sparkleDensity": 40,
    "enableMysticalAura": true,
    "auraIntensity": 0.7
  }'
```

### 7. 查询任务状态

```bash
curl http://localhost:3001/api/jobs/{jobId}
```

### 8. 下载视频

```bash
curl -O http://localhost:3001/outputs/{outputFile}
# 或
curl -O http://localhost:3001/api/download/{jobId}
```

## JavaScript 调用示例

```javascript
// 创建渲染任务
async function renderTaiChiBagua() {
  const response = await fetch('http://localhost:3001/api/render/tai-chi-bagua-effect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      duration: 10,
      fps: 30,
      width: 720,
      height: 720,
      yangColor: '#FFD700',
      yinColor: '#1a1a1a',
      backgroundColor: '#FFFFFF',
      glowIntensity: 0.9,
      enable3D: true,
      depth3D: 15,
      enableGoldenSparkle: true,
      enableMysticalAura: true,
    }),
  });

  const result = await response.json();
  console.log('任务已创建:', result.jobId);
  return result.jobId;
}

// 轮询任务状态
async function pollJobStatus(jobId) {
  const response = await fetch(`http://localhost:3001/api/jobs/${jobId}`);
  const job = await response.json();
  
  if (job.status === 'completed') {
    console.log('渲染完成:', job.downloadUrl);
    return job;
  } else if (job.status === 'failed') {
    throw new Error(job.error);
  } else {
    console.log(`进度: ${job.progress}%`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return pollJobStatus(jobId);
  }
}

// 使用示例
(async () => {
  const jobId = await renderTaiChiBagua();
  const result = await pollJobStatus(jobId);
  console.log('视频地址:', result.downloadUrl);
})();
```

## 本地开发

```bash
# 进入项目目录
cd effects/tai-chi-bagua-effect

# 启动 Remotion Studio（实时预览）
npm run start

# 渲染视频
npm run render

# 渲染预览（前90帧）
npm run render-preview
```

## 效果预设

### 经典风格
```json
{
  "yangColor": "#FFD700",
  "yinColor": "#1a1a1a",
  "backgroundColor": "#FFFFFF",
  "viewAngle": 30,
  "enable3D": false,
  "enableGoldenSparkle": true,
  "enableMysticalAura": true
}
```

### 神秘暗黑风格
```json
{
  "yangColor": "#C0C0C0",
  "yinColor": "#000000",
  "backgroundColor": "#0A0A0A",
  "glowIntensity": 0.7,
  "viewAngle": 45,
  "enable3D": true,
  "depth3D": 25,
  "enableMysticalAura": true,
  "auraIntensity": 0.9
}
```

### 炫酷霓虹风格
```json
{
  "yangColor": "#00FFFF",
  "yinColor": "#FF00FF",
  "backgroundColor": "#1A0A2E",
  "glowIntensity": 1,
  "viewAngle": 20,
  "enableGoldenSparkle": true,
  "sparkleDensity": 60,
  "enableMysticalAura": true,
  "auraIntensity": 0.8
}
```
