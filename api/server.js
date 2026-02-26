const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { renderVideo, renderCompositeEffect } = require('./render');

const app = express();
const PORT = process.env.PORT || 3001;

// 项目配置：定义每个特效项目的路径和配置
const projects = {
  'text-rain-effect': {
    path: path.join(__dirname, '../effects/text-rain-effect'),
    compositionId: 'TextRain',
    name: '文字雨特效'
  },
  'gold-text-ring-effect': {
    path: path.join(__dirname, '../effects/gold-text-ring-effect'),
    compositionId: 'TextRing',
    name: '金色发光立体字环绕特效'
  },
  'text-firework-effect': {
    path: path.join(__dirname, '../effects/text-firework-effect'),
    compositionId: 'TextFirework',
    name: '文字烟花特效'
  },
  'text-breakthrough-effect': {
    path: path.join(__dirname, '../effects/text-breakthrough-effect'),
    compositionId: 'TextBreakthrough',
    name: '文字破屏特效'
  },
  'tai-chi-bagua-effect': {
    path: path.join(__dirname, '../effects/tai-chi-bagua-effect'),
    compositionId: 'TaiChiBagua',
    name: '太极八卦图特效'
  }
  // 未来可以添加更多项目，例如：
  // 'particle-effect': {
  //   path: path.join(__dirname, '../effects/particle-effect'),
  //   compositionId: 'Particle',
  //   name: '粒子特效'
  // }
};

// 中间件
app.use(cors());
app.use(express.json());
app.use('/outputs', express.static(path.join(__dirname, 'outputs')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const now = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, 'bg-' + now + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB 限制
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 JPG/PNG/GIF/MP4/WEBM 格式的文件'));
    }
  }
});

// 渲染任务存储
const renderJobs = new Map();

// 生成易识别的 jobId：yyyyMMdd-时间戳格式
function generateJobId() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const timestamp = Date.now();
  return `${yyyy}${MM}${dd}-${timestamp}`;
}

// API: 获取所有可用项目
app.get('/api/projects', (req, res) => {
  const projectList = Object.entries(projects).map(([id, config]) => ({
    id,
    name: config.name,
    compositionId: config.compositionId
  }));
  res.json(projectList);
});

// API: 创建组合特效渲染任务
// 支持将多个特效按顺序或叠加方式组合成一个视频
app.post('/api/compose', upload.single('background'), async (req, res) => {
  try {
    const jobId = generateJobId();

    // 解析 effects 数组
    let effects = [];
    if (req.body.effects) {
      try {
        effects = typeof req.body.effects === 'string' 
          ? JSON.parse(req.body.effects) 
          : req.body.effects;
      } catch (e) {
        return res.status(400).json({ error: 'effects 参数格式错误，应为 JSON 数组' });
      }
    }

    if (!effects || effects.length === 0) {
      return res.status(400).json({ error: '请提供至少一个特效配置' });
    }

    // 验证并构建每个特效的参数
    const processedEffects = [];
    for (let i = 0; i < effects.length; i++) {
      const effect = effects[i];
      
      if (!effect.projectId) {
        return res.status(400).json({ error: `特效 ${i + 1} 缺少 projectId` });
      }

      if (!projects[effect.projectId]) {
        return res.status(400).json({ 
          error: `特效 ${i + 1} 项目不存在: ${effect.projectId}。可用项目: ${Object.keys(projects).join(', ')}` 
        });
      }

      const projectConfig = projects[effect.projectId];

      // 构建特效参数
      const effectParams = {
        projectId: effect.projectId,
        projectPath: projectConfig.path,
        compositionId: projectConfig.compositionId,
        words: effect.words || [],
        duration: effect.duration || 5,
        fps: effect.fps || 24,
        width: effect.width || 720,
        height: effect.height || 1280,
        backgroundColor: effect.backgroundColor || '#1a1a2e',
      };

      // 复制特效特有参数
      const projectId = effect.projectId;

      if (projectId === 'text-rain-effect') {
        effectParams.textDirection = effect.textDirection || 'horizontal';
        effectParams.fontSizeRange = effect.fontSizeRange || [80, 160];
        effectParams.fallSpeed = effect.fallSpeed || 0.15;
        effectParams.density = effect.density || 2;
        effectParams.opacityRange = effect.opacityRange || [0.6, 1];
        effectParams.rotationRange = effect.rotationRange || [-10, 10];
        effectParams.laneCount = effect.laneCount || 6;
        effectParams.minVerticalGap = effect.minVerticalGap || 100;
        effectParams.audioEnabled = effect.audioEnabled !== false;
        effectParams.audioVolume = effect.audioVolume || 0.5;
        effectParams.textStyle = effect.textStyle || {};

        if (!effectParams.words || effectParams.words.length === 0) {
          return res.status(400).json({ error: `特效 ${i + 1} (text-rain-effect) 需要提供文字列表` });
        }
      }

      if (projectId === 'gold-text-ring-effect') {
        effectParams.fontSize = effect.fontSize || 70;
        effectParams.opacity = effect.opacity || 1;
        effectParams.ringRadius = effect.ringRadius || 250;
        effectParams.rotationSpeed = effect.rotationSpeed || 0.8;
        effectParams.glowIntensity = effect.glowIntensity || 0.9;
        effectParams.depth3d = effect.depth3d || 8;
        effectParams.cylinderHeight = effect.cylinderHeight || 400;
        effectParams.perspective = effect.perspective || 1000;
        effectParams.mode = effect.mode || 'vertical';
        effectParams.verticalPosition = effect.verticalPosition || 0.5;

        if (!effectParams.words || effectParams.words.length === 0) {
          return res.status(400).json({ error: `特效 ${i + 1} (gold-text-ring-effect) 需要提供文字列表` });
        }
      }

      if (projectId === 'text-firework-effect') {
        effectParams.fontSize = effect.fontSize || 60;
        effectParams.textColor = effect.textColor || '#ffd700';
        effectParams.glowColor = effect.glowColor || '#ffaa00';
        effectParams.glowIntensity = effect.glowIntensity || 1;
        effectParams.launchHeight = effect.launchHeight || 0.2;
        effectParams.particleCount = effect.particleCount || 80;
        effectParams.textDuration = effect.textDuration || 60;
        effectParams.rainDuration = effect.rainDuration || 120;
        effectParams.gravity = effect.gravity || 0.15;
        effectParams.wind = effect.wind || 0;
        effectParams.rainParticleSize = effect.rainParticleSize || 3;
        effectParams.interval = effect.interval || 40;

        if (!effectParams.words || effectParams.words.length === 0) {
          return res.status(400).json({ error: `特效 ${i + 1} (text-firework-effect) 需要提供文字列表` });
        }
      }

      if (projectId === 'text-breakthrough-effect') {
        effectParams.textGroups = effect.textGroups;
        effectParams.finalPosition = effect.finalPosition;
        effectParams.fontSize = effect.fontSize || 120;
        effectParams.fontFamily = effect.fontFamily || 'PingFang SC, Microsoft YaHei, SimHei, sans-serif';
        effectParams.fontWeight = effect.fontWeight || 900;
        effectParams.textColor = effect.textColor || '#ffd700';
        effectParams.glowColor = effect.glowColor || '#ffaa00';
        effectParams.secondaryGlowColor = effect.secondaryGlowColor || '#ff6600';
        effectParams.glowIntensity = effect.glowIntensity || 1.5;
        effectParams.bevelDepth = effect.bevelDepth || 3;
        effectParams.startZ = effect.startZ || 2000;
        effectParams.endZ = effect.endZ || -100;
        effectParams.approachDuration = effect.approachDuration || 45;
        effectParams.breakthroughDuration = effect.breakthroughDuration || 20;
        effectParams.holdDuration = effect.holdDuration || 40;
        effectParams.impactScale = effect.impactScale || 1.4;
        effectParams.impactRotation = effect.impactRotation || 12;
        effectParams.shakeIntensity = effect.shakeIntensity || 10;
        effectParams.groupInterval = effect.groupInterval || 50;
        effectParams.direction = effect.direction || 'top-down';
        effectParams.enableFallDown = effect.enableFallDown !== false;
        effectParams.fallDownDuration = effect.fallDownDuration || 40;
        effectParams.fallDownEndY = effect.fallDownEndY || 0.2;
        effectParams.audioEnabled = effect.audioEnabled || false;
        effectParams.audioSource = effect.audioSource || 'coin-sound.mp3';
        effectParams.audioVolume = effect.audioVolume || 0.5;

        if ((!effectParams.words || effectParams.words.length === 0) && (!effectParams.textGroups || effectParams.textGroups.length === 0)) {
          return res.status(400).json({ error: `特效 ${i + 1} (text-breakthrough-effect) 需要提供文字列表` });
        }
      }

      if (projectId === 'tai-chi-bagua-effect') {
        effectParams.yangColor = effect.yangColor || '#FFD700';
        effectParams.yinColor = effect.yinColor || '#1a1a1a';
        effectParams.backgroundColor = effect.backgroundColor || '#FFFFFF';
        effectParams.glowIntensity = effect.glowIntensity || 0.9;
        effectParams.taichiRotationSpeed = effect.taichiRotationSpeed || 1;
        effectParams.baguaRotationSpeed = effect.baguaRotationSpeed || 0.8;
        effectParams.taichiSize = effect.taichiSize || 200;
        effectParams.baguaRadius = effect.baguaRadius || 280;
        effectParams.showLabels = effect.showLabels !== false;
        effectParams.showParticles = effect.showParticles !== false;
        effectParams.showEnergyField = effect.showEnergyField !== false;
        effectParams.labelOffset = effect.labelOffset || 45;
        effectParams.particleCount = effect.particleCount || 40;
        effectParams.particleSpeed = effect.particleSpeed || 1;
        effectParams.viewAngle = effect.viewAngle || 30;
        effectParams.perspectiveDistance = effect.perspectiveDistance || 800;
        effectParams.verticalPosition = effect.verticalPosition || 0.5;
        effectParams.enable3D = effect.enable3D || false;
        effectParams.depth3D = effect.depth3D || 15;
        effectParams.enableGoldenSparkle = effect.enableGoldenSparkle !== false;
        effectParams.sparkleDensity = effect.sparkleDensity || 30;
        effectParams.enableMysticalAura = effect.enableMysticalAura !== false;
        effectParams.auraIntensity = effect.auraIntensity || 0.6;
      }

      processedEffects.push(effectParams);
    }

    // 全局参数
    const globalParams = {
      mergeMode: req.body.mergeMode || 'sequence', // sequence | overlay | transition
      transition: req.body.transition || 'fade',
      transitionDuration: parseFloat(req.body.transitionDuration) || 0.5,
      width: parseInt(req.body.width) || 720,
      height: parseInt(req.body.height) || 1280,
      fps: parseInt(req.body.fps) || 24,
    };

    // 创建任务记录
    renderJobs.set(jobId, {
      id: jobId,
      projectId: 'composite',
      projectName: '组合特效',
      status: 'pending',
      params: { effects: processedEffects, globalParams },
      createdAt: new Date(),
      progress: 0
    });

    // 异步执行渲染
    renderCompositeJobAsync(jobId, processedEffects, globalParams).catch(err => {
      console.error('组合渲染失败:', err);
      const job = renderJobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.error = err.message;
      }
    });

    res.json({
      success: true,
      jobId,
      projectId: 'composite',
      projectName: '组合特效',
      message: '组合渲染任务已创建',
      effectsCount: processedEffects.length,
      mergeMode: globalParams.mergeMode,
      statusUrl: '/api/jobs/' + jobId
    });

  } catch (error) {
    console.error('创建组合任务失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 异步执行组合渲染任务
async function renderCompositeJobAsync(jobId, effects, globalParams) {
  const job = renderJobs.get(jobId);
  if (!job) return;

  job.status = 'rendering';
  job.progress = 0;

  try {
    const outputFile = await renderCompositeEffect(effects, jobId, (progress) => {
      job.progress = Math.round(progress * 100);
    }, globalParams);

    job.status = 'completed';
    job.progress = 100;
    job.outputFile = outputFile;
    job.completedAt = new Date();

    console.log(`组合渲染完成:`, jobId, outputFile);
  } catch (error) {
    job.status = 'failed';
    job.error = error.message;
    throw error;
  }
}

// API: 创建渲染任务（通用接口，支持多项目）
app.post('/api/render/:projectId', upload.single('background'), async (req, res) => {
  try {
    const { projectId } = req.params;

    // 验证项目是否存在
    if (!projects[projectId]) {
      return res.status(404).json({ error: `项目不存在: ${projectId}。可用项目: ${Object.keys(projects).join(', ')}` });
    }

    const projectConfig = projects[projectId];
    const jobId = generateJobId();
    const backgroundFile = req.file ? req.file.filename : null;

    // 解析参数 - 支持表单和 JSON 两种方式
    let words = [];
    if (req.body.words) {
      try {
        words = typeof req.body.words === 'string' ? JSON.parse(req.body.words) : req.body.words;
      } catch (e) {
        words = req.body.words.split(',').map(w => w.trim()).filter(w => w);
      }
    }

    // 根据项目类型构建参数
    let params = {
      projectId,
      projectPath: projectConfig.path,
      compositionId: projectConfig.compositionId,
      words: words,
      duration: parseInt(req.body.duration) || 10,
      fps: parseInt(req.body.fps) || 24,
      width: parseInt(req.body.width) || 720,
      height: parseInt(req.body.height) || 1280,
      backgroundFile,
      backgroundType: req.body.backgroundType || (backgroundFile ? 'image' : 'color'),
      backgroundColor: req.body.backgroundColor || '#1a1a2e',
      overlayOpacity: parseFloat(req.body.overlayOpacity) || 0.2,
      overlayColor: req.body.overlayColor || '#000000'
    };

    // text-rain-effect 特有参数
    if (projectId === 'text-rain-effect') {
      params.textDirection = req.body.textDirection || 'horizontal';
      params.fontSizeRange = typeof req.body.fontSizeRange === 'string'
        ? JSON.parse(req.body.fontSizeRange)
        : (req.body.fontSizeRange || [80, 160]);
      params.fallSpeed = parseFloat(req.body.fallSpeed) || 0.15;
      params.density = parseFloat(req.body.density) || 2;
      params.opacityRange = typeof req.body.opacityRange === 'string'
        ? JSON.parse(req.body.opacityRange)
        : (req.body.opacityRange || [0.6, 1]);
      params.rotationRange = typeof req.body.rotationRange === 'string'
        ? JSON.parse(req.body.rotationRange)
        : (req.body.rotationRange || [-10, 10]);
      params.laneCount = parseInt(req.body.laneCount) || 6;
      params.minVerticalGap = parseInt(req.body.minVerticalGap) || 100;
      params.audioEnabled = req.body.audioEnabled !== 'false';
      params.audioVolume = parseFloat(req.body.audioVolume) || 0.5;
      params.textStyle = typeof req.body.textStyle === 'string'
        ? JSON.parse(req.body.textStyle)
        : (req.body.textStyle || {});
    }

    // gold-text-ring-effect 特有参数
    if (projectId === 'gold-text-ring-effect') {
      params.fontSize = parseInt(req.body.fontSize) || 70;
      params.opacity = parseFloat(req.body.opacity) || 1;
      params.ringRadius = parseFloat(req.body.ringRadius) || 250;
      params.rotationSpeed = parseFloat(req.body.rotationSpeed) || 0.8;
      params.seed = parseInt(req.body.seed) || 42;
      params.glowIntensity = parseFloat(req.body.glowIntensity) || 0.9;
      params.depth3d = parseInt(req.body.depth3d) || 8;
      params.cylinderHeight = parseFloat(req.body.cylinderHeight) || 400;
      params.perspective = parseInt(req.body.perspective) || 1000;
      params.mode = req.body.mode || 'vertical';
      params.verticalPosition = parseFloat(req.body.verticalPosition) || 0.5;
    }

    // text-firework-effect 特有参数
    if (projectId === 'text-firework-effect') {
      params.fontSize = parseInt(req.body.fontSize) || 60;
      params.textColor = req.body.textColor || '#ffd700';
      params.glowColor = req.body.glowColor || '#ffaa00';
      params.glowIntensity = parseFloat(req.body.glowIntensity) || 1;
      params.launchHeight = parseFloat(req.body.launchHeight) || 0.2;
      params.particleCount = parseInt(req.body.particleCount) || 80;
      params.textDuration = parseInt(req.body.textDuration) || 60;
      params.rainDuration = parseInt(req.body.rainDuration) || 120;
      params.gravity = parseFloat(req.body.gravity) || 0.15;
      params.wind = parseFloat(req.body.wind) || 0;
      params.rainParticleSize = parseFloat(req.body.rainParticleSize) || 3;
      params.interval = parseInt(req.body.interval) || 40;
      
      // 如果没有指定 duration，根据文字数量自动计算合理的时长
      // 计算公式：最后一个烟花的发射帧 + 发射时间 + 文字显示时间 + 粒子下雨时间 + 缓冲时间
      // duration = (words.length - 1) * interval + 30 + textDuration + rainDuration + 30
      if (!req.body.duration && params.words && params.words.length > 0) {
        const lastLaunchFrame = (params.words.length - 1) * params.interval;
        const totalFrames = lastLaunchFrame + 30 + params.textDuration + params.rainDuration + 30;
        params.duration = Math.ceil(totalFrames / params.fps);
      }
    }

    // text-breakthrough-effect 特有参数
    if (projectId === 'text-breakthrough-effect') {
      // 文字组配置（支持复杂配置或简单 words 数组）
      params.textGroups = typeof req.body.textGroups === 'string'
        ? JSON.parse(req.body.textGroups)
        : req.body.textGroups;
      
      // 定格位置配置
      params.finalPosition = typeof req.body.finalPosition === 'string'
        ? JSON.parse(req.body.finalPosition)
        : req.body.finalPosition;
      
      // 字体配置
      params.fontSize = parseInt(req.body.fontSize) || 120;
      params.fontFamily = req.body.fontFamily || 'PingFang SC, Microsoft YaHei, SimHei, sans-serif';
      params.fontWeight = parseInt(req.body.fontWeight) || 900;
      
      // 3D金色效果
      params.textColor = req.body.textColor || '#ffd700';
      params.glowColor = req.body.glowColor || '#ffaa00';
      params.secondaryGlowColor = req.body.secondaryGlowColor || '#ff6600';
      params.glowIntensity = parseFloat(req.body.glowIntensity) || 1.5;
      params.bevelDepth = parseFloat(req.body.bevelDepth) || 3;
      
      // 3D透视参数
      params.startZ = parseInt(req.body.startZ) || 2000;
      params.endZ = parseInt(req.body.endZ) || -100;
      
      // 动画时长
      params.approachDuration = parseInt(req.body.approachDuration) || 45;
      params.breakthroughDuration = parseInt(req.body.breakthroughDuration) || 20;
      params.holdDuration = parseInt(req.body.holdDuration) || 40;
      
      // 冲击效果
      params.impactScale = parseFloat(req.body.impactScale) || 1.4;
      params.impactRotation = parseFloat(req.body.impactRotation) || 12;
      params.shakeIntensity = parseFloat(req.body.shakeIntensity) || 10;
      
      // 组间延迟和运动方向
      params.groupInterval = parseInt(req.body.groupInterval) || 50;
      params.direction = req.body.direction || 'top-down';
      
      // 下落消失效果
      params.enableFallDown = req.body.enableFallDown !== 'false';
      params.fallDownDuration = parseInt(req.body.fallDownDuration) || 40;
      params.fallDownEndY = parseFloat(req.body.fallDownEndY) || 0.2;
      
      // 音效配置
      params.audioEnabled = req.body.audioEnabled === 'true' || req.body.audioEnabled === true;
      params.audioSource = req.body.audioSource || 'coin-sound.mp3';
      params.audioVolume = parseFloat(req.body.audioVolume) || 0.5;
      
      // 如果没有指定 duration，根据文字组数量自动计算
      if (!req.body.duration && params.words && params.words.length > 0) {
        const groupInterval = params.groupInterval || 50;
        const totalAnimation = params.approachDuration + params.breakthroughDuration + params.holdDuration;
        const lastGroupStart = (params.words.length - 1) * groupInterval;
        const totalFrames = lastGroupStart + totalAnimation + (params.enableFallDown ? params.fallDownDuration : 0) + 20;
        params.duration = Math.ceil(totalFrames / params.fps);
      }
    }

    // tai-chi-bagua-effect 特有参数
    if (projectId === 'tai-chi-bagua-effect') {
      // 颜色配置
      params.yangColor = req.body.yangColor || '#FFD700';
      params.yinColor = req.body.yinColor || '#1a1a1a';
      params.backgroundColor = req.body.backgroundColor || '#FFFFFF';
      
      // 发光效果
      params.glowIntensity = parseFloat(req.body.glowIntensity) || 0.9;
      
      // 动画速度
      params.taichiRotationSpeed = parseFloat(req.body.taichiRotationSpeed) || 1;
      params.baguaRotationSpeed = parseFloat(req.body.baguaRotationSpeed) || 0.8;
      
      // 尺寸
      params.taichiSize = parseInt(req.body.taichiSize) || 200;
      params.baguaRadius = parseInt(req.body.baguaRadius) || 280;
      
      // 显示选项
      params.showLabels = req.body.showLabels !== 'false';
      params.showParticles = req.body.showParticles !== 'false';
      params.showEnergyField = req.body.showEnergyField !== 'false';
      params.labelOffset = parseInt(req.body.labelOffset) || 45;
      
      // 粒子效果
      params.particleCount = parseInt(req.body.particleCount) || 40;
      params.particleSpeed = parseFloat(req.body.particleSpeed) || 1;
      
      // 3D视角
      params.viewAngle = parseFloat(req.body.viewAngle) || 30;
      params.perspectiveDistance = parseInt(req.body.perspectiveDistance) || 800;
      
      // ===== 新增参数 =====
      // 垂直位置：0=顶部, 0.5=中心, 1=底部
      params.verticalPosition = parseFloat(req.body.verticalPosition) || 0.5;
      
      // 3D立体效果
      params.enable3D = req.body.enable3D === 'true' || req.body.enable3D === true;
      params.depth3D = parseInt(req.body.depth3D) || 15;
      
      // 金光闪闪效果
      params.enableGoldenSparkle = req.body.enableGoldenSparkle !== 'false';
      params.sparkleDensity = parseInt(req.body.sparkleDensity) || 30;
      
      // 神秘氛围效果
      params.enableMysticalAura = req.body.enableMysticalAura !== 'false';
      params.auraIntensity = parseFloat(req.body.auraIntensity) || 0.6;
      
      // 默认尺寸为正方形
      if (!req.body.width && !req.body.height) {
        params.width = 720;
        params.height = 720;
      }
    }

    // 验证文字（如果是文字特效）
    if (projectId === 'text-rain-effect' && (!params.words || params.words.length === 0)) {
      return res.status(400).json({ error: '请提供文字列表' });
    }
    if (projectId === 'gold-text-ring-effect' && (!params.words || params.words.length === 0)) {
      return res.status(400).json({ error: '请提供文字列表' });
    }
    if (projectId === 'text-firework-effect' && (!params.words || params.words.length === 0)) {
      return res.status(400).json({ error: '请提供文字列表' });
    }
    if (projectId === 'text-breakthrough-effect' && (!params.words || params.words.length === 0) && (!params.textGroups || params.textGroups.length === 0)) {
      return res.status(400).json({ error: '请提供文字列表 (words) 或文字组配置 (textGroups)' });
    }

    // 创建任务记录
    renderJobs.set(jobId, {
      id: jobId,
      projectId,
      status: 'pending',
      params,
      createdAt: new Date(),
      progress: 0
    });

    // 异步执行渲染
    renderJobAsync(jobId, params).catch(err => {
      console.error('渲染失败:', err);
      const job = renderJobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.error = err.message;
      }
    });

    res.json({
      success: true,
      jobId,
      projectId,
      projectName: projectConfig.name,
      message: '渲染任务已创建',
      statusUrl: '/api/jobs/' + jobId
    });

  } catch (error) {
    console.error('创建任务失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: 查询任务状态（统一接口）
app.get('/api/jobs/:jobId', (req, res) => {
  const job = renderJobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: '任务不存在' });
  }

  const projectName = job.projectId ? projects[job.projectId]?.name : '未知项目';

  res.json({
    id: job.id,
    projectId: job.projectId,
    projectName,
    status: job.status,
    progress: job.progress,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
    error: job.error,
    downloadUrl: job.status === 'completed' ? '/outputs/' + job.outputFile : null
  });
});

// API: 下载视频（统一接口）
app.get('/api/download/:jobId', (req, res) => {
  const job = renderJobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: '任务不存在' });
  }

  if (job.status !== 'completed') {
    return res.status(400).json({ error: '任务尚未完成' });
  }

  const filePath = path.join(__dirname, 'outputs', job.outputFile);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: '文件不存在' });
  }

  const projectName = job.projectId ? projects[job.projectId]?.name : 'video';
  res.download(filePath, `${projectName}-${job.id}.mp4`);
});

// API: 获取所有任务（统一接口）
app.get('/api/jobs', (req, res) => {
  const jobs = Array.from(renderJobs.values()).map(job => ({
    id: job.id,
    projectId: job.projectId,
    projectName: job.projectId ? projects[job.projectId]?.name : '未知项目',
    status: job.status,
    progress: job.progress,
    createdAt: job.createdAt
  }));
  res.json(jobs);
});

// 异步渲染任务
async function renderJobAsync(jobId, params) {
  const job = renderJobs.get(jobId);
  if (!job) return;

  job.status = 'rendering';
  job.progress = 0;

  try {
    const outputFile = await renderVideo(params, jobId, (progress) => {
      job.progress = Math.round(progress * 100);
    });

    job.status = 'completed';
    job.progress = 100;
    job.outputFile = outputFile;
    job.completedAt = new Date();

    console.log(`渲染完成 [${params.projectId}]:`, jobId, outputFile);
  } catch (error) {
    job.status = 'failed';
    job.error = error.message;
    throw error;
  }
}

// 清理过期任务（每30分钟）
setInterval(() => {
  const now = Date.now();
  const expireTime = 30 * 60 * 1000; // 30分钟

  for (const [id, job] of renderJobs) {
    if (job.status === 'completed' && job.completedAt) {
      if (now - job.completedAt.getTime() > expireTime) {
        // 删除输出文件
        if (job.outputFile) {
          const filePath = path.join(__dirname, 'outputs', job.outputFile);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        renderJobs.delete(id);
        console.log('清理过期任务:', id);
      }
    }
  }
}, 30 * 60 * 1000);

app.listen(PORT, () => {
  console.log('========================================');
  console.log('Remotion Effects API 服务已启动');
  console.log('端口:', PORT);
  console.log('API 文档: http://localhost:' + PORT + '/api');
  console.log('可用项目:');
  Object.entries(projects).forEach(([id, config]) => {
    console.log(`  - ${id}: ${config.name}`);
    console.log(`    POST /api/render/${id}`);
  });
  console.log('========================================');
});