/**
 * Remotion Effects API 服务器
 * 
 * 使用配置驱动方式处理不同特效项目，支持动态扩展
 * 新增特效只需在 effect-configs 目录添加配置文件即可
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { renderVideo, renderCompositeEffect } = require('./render');

// 导入特效配置注册表
const {
  getProjectList,
  getProjectInfo,
  validateParams,
  buildRenderParams,
  hasEffect,
  registerEffect
} = require('./effect-configs');

const app = express();
const PORT = process.env.PORT || 3001;

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
  limits: { fileSize: 50 * 1024 * 1024 },
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

// 生成易识别的 jobId
function generateJobId() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const timestamp = Date.now();
  return `${yyyy}${MM}${dd}-${timestamp}`;
}

// ============================================================
// API: 获取所有可用项目
// ============================================================
app.get('/api/projects', (req, res) => {
  const projectList = getProjectList();
  res.json(projectList);
});

// ============================================================
// API: 创建渲染任务（通用接口）
// 使用配置驱动方式，自动处理参数
// ============================================================
app.post('/api/render/:projectId', upload.single('background'), async (req, res) => {
  try {
    const { projectId } = req.params;

    // 验证项目是否存在
    if (!hasEffect(projectId)) {
      return res.status(404).json({ 
        error: `项目不存在: ${projectId}。可用项目: ${getProjectList().map(p => p.id).join(', ')}` 
      });
    }

    const projectInfo = getProjectInfo(projectId);
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

    // 使用配置驱动方式构建参数
    const params = buildRenderParams(projectId, req.body, { backgroundFile });
    params.words = words.length > 0 ? words : params.words;

    // 验证参数
    const validation = validateParams(projectId, params);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
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
      projectName: projectInfo.name,
      message: '渲染任务已创建',
      statusUrl: '/api/jobs/' + jobId
    });

  } catch (error) {
    console.error('创建任务失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// API: 创建组合特效渲染任务
// ============================================================
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

      if (!hasEffect(effect.projectId)) {
        return res.status(400).json({ 
          error: `特效 ${i + 1} 项目不存在: ${effect.projectId}。可用项目: ${getProjectList().map(p => p.id).join(', ')}` 
        });
      }

      // 使用配置驱动方式构建参数
      const effectParams = buildRenderParams(effect.projectId, effect);
      
      // 覆盖全局参数
      effectParams.width = effect.width || req.body.width || 720;
      effectParams.height = effect.height || req.body.height || 1280;
      effectParams.fps = effect.fps || req.body.fps || 24;
      effectParams.duration = effect.duration || 5;

      // 验证参数
      const validation = validateParams(effect.projectId, effectParams);
      if (!validation.valid) {
        return res.status(400).json({ error: `特效 ${i + 1} (${effect.projectId}): ${validation.error}` });
      }

      processedEffects.push(effectParams);
    }

    // 全局参数
    const globalParams = {
      mergeMode: req.body.mergeMode || 'sequence',
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

// ============================================================
// API: 查询任务状态
// ============================================================
app.get('/api/jobs/:jobId', (req, res) => {
  const job = renderJobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: '任务不存在' });
  }

  const projectInfo = getProjectInfo(job.projectId);
  const projectName = projectInfo ? projectInfo.name : (job.projectId === 'composite' ? '组合特效' : '未知项目');

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

// ============================================================
// API: 下载视频
// ============================================================
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

  const projectInfo = getProjectInfo(job.projectId);
  const projectName = projectInfo ? projectInfo.name : 'video';
  res.download(filePath, `${projectName}-${job.id}.mp4`);
});

// ============================================================
// API: 获取所有任务
// ============================================================
app.get('/api/jobs', (req, res) => {
  const jobs = Array.from(renderJobs.values()).map(job => {
    const projectInfo = getProjectInfo(job.projectId);
    const projectName = projectInfo ? projectInfo.name : (job.projectId === 'composite' ? '组合特效' : '未知项目');
    
    return {
      id: job.id,
      projectId: job.projectId,
      projectName,
      status: job.status,
      progress: job.progress,
      createdAt: job.createdAt
    };
  });
  res.json(jobs);
});

// ============================================================
// API: 动态注册新特效（高级功能）
// ============================================================
app.post('/api/effects/register', express.json(), (req, res) => {
  try {
    const { id, name, compositionId, path: effectPath, params } = req.body;
    
    if (!id || !name || !compositionId || !effectPath) {
      return res.status(400).json({ error: '缺少必要参数: id, name, compositionId, path' });
    }

    // 构建配置对象
    const config = {
      config: { id, name, compositionId, path: effectPath },
      params: params || {},
      validate: () => ({ valid: true }),
      buildRenderParams: (reqParams, commonParams) => ({ ...commonParams, ...reqParams })
    };

    registerEffect(id, config);
    
    res.json({ 
      success: true, 
      message: `特效 ${id} 注册成功`,
      effect: { id, name, compositionId }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 辅助函数
// ============================================================

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

// 清理过期任务（每30分钟）
setInterval(() => {
  const now = Date.now();
  const expireTime = 30 * 60 * 1000;

  for (const [id, job] of renderJobs) {
    if (job.status === 'completed' && job.completedAt) {
      if (now - job.completedAt.getTime() > expireTime) {
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

// 启动服务器
app.listen(PORT, () => {
  console.log('========================================');
  console.log('Remotion Effects API 服务已启动');
  console.log('端口:', PORT);
  console.log('API 文档: http://localhost:' + PORT + '/api');
  console.log('可用项目:');
  
  const projects = getProjectList();
  projects.forEach(project => {
    console.log(`  - ${project.id}: ${project.name}`);
    console.log(`    POST /api/render/${project.id}`);
  });
  
  console.log('========================================');
  console.log('提示: 新增特效只需在 api/effect-configs/ 目录添加配置文件');
  console.log('========================================');
});
