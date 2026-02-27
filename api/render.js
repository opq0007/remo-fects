const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * 从图片中提取轮廓点（服务端版本）
 * 使用 canvas 库处理图片
 */
function extractContourPointsFromImage(imagePath, width, height, threshold = 128, sampleDensity = 8) {
  // 由于 Node.js 没有原生 canvas，我们使用简化的图片处理
  // 这里使用 jimp 或直接读取像素数据
  // 为了性能，我们使用一个简化的方案
  
  try {
    // 动态加载 canvas（如果可用）
    let canvas, ctx;
    
    try {
      canvas = require('canvas');
    } catch (e) {
      console.log('[轮廓提取] canvas 库不可用，使用默认轮廓');
      return generateDefaultContour(width, height, sampleDensity);
    }
    
    const img = canvas.loadImage(imagePath);
    const canvasInstance = canvas.createCanvas(width, height);
    ctx = canvasInstance.getContext('2d');
    
    // 同步等待图片加载（在 Node.js 中 loadImage 是 Promise）
    // 这里需要改为同步或使用其他方法
    
    return generateDefaultContour(width, height, sampleDensity);
  } catch (err) {
    console.error('[轮廓提取] 错误:', err.message);
    return generateDefaultContour(width, height, sampleDensity);
  }
}

/**
 * 生成默认轮廓（圆形或心形）
 */
function generateDefaultContour(width, height, sampleDensity) {
  const points = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;
  
  // 生成圆形轮廓
  for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
    for (let r = radius * 0.3; r <= radius; r += sampleDensity) {
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      const opacity = 0.5 + (r / radius) * 0.5;
      points.push({ x: Math.round(x), y: Math.round(y), opacity });
    }
  }
  
  // 填充内部
  for (let y = centerY - radius; y <= centerY + radius; y += sampleDensity * 2) {
    for (let x = centerX - radius; x <= centerX + radius; x += sampleDensity * 2) {
      const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      if (dist < radius * 0.8) {
        const opacity = 1 - dist / radius;
        points.push({ x: Math.round(x), y: Math.round(y), opacity });
      }
    }
  }
  
  return points;
}

async function renderVideo(params, jobId, onProgress) {
  const outputDir = path.join(__dirname, 'outputs');
  const outputFile = 'video-' + jobId + '.mp4';
  const outputPath = path.join(outputDir, outputFile);

  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 项目路径和组合 ID
  const projectPath = params.projectPath;
  const compositionId = params.compositionId;

  console.log('[renderVideo] projectId:', params.projectId);

  // 构建 defaultProps
  const defaultProps = {
    words: params.words,
    seed: Math.floor(Math.random() * 10000),
    backgroundType: params.backgroundType || 'color',
    backgroundColor: params.backgroundColor || '#1a1a2e',
    overlayOpacity: params.overlayOpacity ?? 0.2,
    overlayColor: params.overlayColor || '#000000'
  };

  // text-rain-effect 特有参数
  if (params.projectId === 'text-rain-effect') {
    defaultProps.contentType = 'text';
    defaultProps.textDirection = params.textDirection || 'horizontal';
    defaultProps.fontSizeRange = params.fontSizeRange;
    defaultProps.fallSpeed = params.fallSpeed;
    defaultProps.density = params.density;
    defaultProps.opacityRange = params.opacityRange;
    defaultProps.rotationRange = params.rotationRange;
    defaultProps.laneCount = params.laneCount;
    defaultProps.minVerticalGap = params.minVerticalGap;
    defaultProps.imageSizeRange = [80, 150];
    defaultProps.textStyle = {
      color: params.textStyle?.color || '#ffd700',
      effect: params.textStyle?.effect || 'gold3d',
      effectIntensity: params.textStyle?.effectIntensity ?? 0.9,
      fontWeight: params.textStyle?.fontWeight || 700,
      letterSpacing: params.textStyle?.letterSpacing ?? 4,
    };
    defaultProps.audio = {
      enabled: params.audioEnabled !== false,
      src: 'coin-sound.mp3',
      volume: params.audioVolume || 0.5,
      loop: true
    };
  }

  // text-ring-effect 特有参数
  if (params.projectId === 'text-ring-effect') {
    defaultProps.fontSize = params.fontSize;
    defaultProps.opacity = params.opacity;
    defaultProps.ringRadius = params.ringRadius;
    defaultProps.rotationSpeed = params.rotationSpeed;
    defaultProps.glowIntensity = params.glowIntensity;
    defaultProps.depth3d = params.depth3d;
    defaultProps.cylinderHeight = params.cylinderHeight;
    defaultProps.perspective = params.perspective;
    defaultProps.mode = params.mode || 'vertical';
    defaultProps.verticalPosition = params.verticalPosition || 0.5;
    console.log('[text-ring-effect] mode 参数:', params.mode, '-> defaultProps.mode:', defaultProps.mode);
    console.log('[text-ring-effect] verticalPosition 参数:', params.verticalPosition, '-> defaultProps.verticalPosition:', defaultProps.verticalPosition);
  }

  // text-firework-effect 特有参数
  if (params.projectId === 'text-firework-effect') {
    defaultProps.fontSize = params.fontSize || 60;
    defaultProps.textColor = params.textColor || '#ffd700';
    defaultProps.glowColor = params.glowColor || '#ffaa00';
    defaultProps.glowIntensity = params.glowIntensity || 1;
    defaultProps.launchHeight = params.launchHeight || 0.2;
    defaultProps.particleCount = params.particleCount || 80;
    defaultProps.textDuration = params.textDuration || 60;
    defaultProps.rainDuration = params.rainDuration || 120;
    defaultProps.gravity = params.gravity || 0.15;
    defaultProps.wind = params.wind || 0;
    defaultProps.rainParticleSize = params.rainParticleSize || 3;
    defaultProps.interval = params.interval || 40;
  }

  // text-breakthrough-effect 特有参数
  if (params.projectId === 'text-breakthrough-effect') {
    // 文字组配置
    defaultProps.textGroups = params.textGroups || params.words.map(w => ({ texts: [w], groupDelay: params.groupInterval || 50 }));
    
    // 定格位置配置
    if (params.finalPosition) {
      defaultProps.finalPosition = typeof params.finalPosition === 'string' 
        ? JSON.parse(params.finalPosition) 
        : params.finalPosition;
    }
    
    // 字体配置
    defaultProps.fontSize = params.fontSize || 120;
    defaultProps.fontFamily = params.fontFamily || 'PingFang SC, Microsoft YaHei, SimHei, sans-serif';
    defaultProps.fontWeight = params.fontWeight || 900;
    
    // 3D金色效果
    defaultProps.textColor = params.textColor || '#ffd700';
    defaultProps.glowColor = params.glowColor || '#ffaa00';
    defaultProps.secondaryGlowColor = params.secondaryGlowColor || '#ff6600';
    defaultProps.glowIntensity = params.glowIntensity || 1.5;
    defaultProps.bevelDepth = params.bevelDepth || 3;
    
    // 3D透视参数
    defaultProps.startZ = params.startZ || 2000;
    defaultProps.endZ = params.endZ || -100;
    
    // 动画时长
    defaultProps.approachDuration = params.approachDuration || 45;
    defaultProps.breakthroughDuration = params.breakthroughDuration || 20;
    defaultProps.holdDuration = params.holdDuration || 40;
    
    // 冲击效果
    defaultProps.impactScale = params.impactScale || 1.4;
    defaultProps.impactRotation = params.impactRotation || 12;
    defaultProps.shakeIntensity = params.shakeIntensity || 10;
    
    // 组间延迟
    defaultProps.groupInterval = params.groupInterval || 50;
    
    // 运动方向
    defaultProps.direction = params.direction || 'top-down';
    
    // 下落消失效果
    defaultProps.enableFallDown = params.enableFallDown !== false;
    defaultProps.fallDownDuration = params.fallDownDuration || 40;
    defaultProps.fallDownEndY = params.fallDownEndY || 0.2;
    
    // 音效配置
    defaultProps.audioEnabled = params.audioEnabled || false;
    defaultProps.audioSource = params.audioSource || 'coin-sound.mp3';
    defaultProps.audioVolume = params.audioVolume || 0.5;
  }

  // tai-chi-bagua-effect 特有参数
  if (params.projectId === 'tai-chi-bagua-effect') {
    defaultProps.yangColor = params.yangColor || '#FFD700';
    defaultProps.yinColor = params.yinColor || '#1a1a1a';
    defaultProps.backgroundColor = params.backgroundColor || '#FFFFFF';
    defaultProps.glowIntensity = params.glowIntensity || 0.9;
    defaultProps.taichiRotationSpeed = params.taichiRotationSpeed || 1;
    defaultProps.baguaRotationSpeed = params.baguaRotationSpeed || 0.8;
    defaultProps.taichiSize = params.taichiSize || 200;
    defaultProps.baguaRadius = params.baguaRadius || 280;
    defaultProps.showLabels = params.showLabels !== false;
    defaultProps.showParticles = params.showParticles !== false;
    defaultProps.showEnergyField = params.showEnergyField !== false;
    defaultProps.labelOffset = params.labelOffset || 45;
    defaultProps.particleCount = params.particleCount || 40;
    defaultProps.particleSpeed = params.particleSpeed || 1;
    defaultProps.viewAngle = params.viewAngle || 30;
    defaultProps.perspectiveDistance = params.perspectiveDistance || 800;
    // 新增参数
    defaultProps.verticalPosition = params.verticalPosition || 0.5;
    console.log('[tai-chi-bagua-effect] verticalPosition 参数:', params.verticalPosition, '-> defaultProps.verticalPosition:', defaultProps.verticalPosition);
    defaultProps.enable3D = params.enable3D || false;
    defaultProps.depth3D = params.depth3D || 15;
    defaultProps.enableGoldenSparkle = params.enableGoldenSparkle !== false;
    defaultProps.sparkleDensity = params.sparkleDensity || 30;
    defaultProps.enableMysticalAura = params.enableMysticalAura !== false;
    defaultProps.auraIntensity = params.auraIntensity || 0.6;
  }

  // text-grow-explode-effect 特有参数
  if (params.projectId === 'text-grow-explode-effect') {
    // 核心输入
    defaultProps.name = params.name || '福';
    defaultProps.words = params.words || ['财', '运', '亨', '通', '金', '玉', '满', '堂'];
    
    // 阶段时长配置
    defaultProps.growDuration = params.growDuration || 90;
    defaultProps.holdDuration = params.holdDuration || 30;
    defaultProps.explodeDuration = params.explodeDuration || 30;
    defaultProps.fallDuration = params.fallDuration || 90;
    
    // 文字样式
    defaultProps.fontSize = params.fontSize || 14;
    defaultProps.particleFontSize = params.particleFontSize || 22;
    defaultProps.textColor = params.textColor || '#ffd700';
    defaultProps.glowColor = params.glowColor || '#ffaa00';
    defaultProps.glowIntensity = params.glowIntensity || 1;
    
    // 粒子配置
    defaultProps.particleCount = params.particleCount || 80;
    defaultProps.gravity = params.gravity || 0.15;
    defaultProps.wind = params.wind || 0;
    
    // 轮廓提取配置
    defaultProps.threshold = params.threshold || 128;
    defaultProps.sampleDensity = params.sampleDensity || 6;
    
    // 生长样式
    defaultProps.growStyle = params.growStyle || 'tree';
    
    // 背景配置
    defaultProps.backgroundColor = params.backgroundColor || '#0a0a1a';
    defaultProps.backgroundOpacity = params.backgroundOpacity || 0.9;
    
    // 随机种子
    defaultProps.seed = params.seed || 42;
    
    // 图片源（必须提供）
    if (params.backgroundFile) {
      defaultProps.imageSource = params.backgroundFile;
    }
    
    // 预计算轮廓点数据（服务端处理，避免客户端重复计算）
    if (params.backgroundFile && params.width && params.height) {
      try {
        const imagePath = path.join(__dirname, 'uploads', params.backgroundFile);
        if (fs.existsSync(imagePath)) {
          const contourPoints = extractContourPointsFromImage(
            imagePath,
            params.width,
            params.height,
            defaultProps.threshold,
            defaultProps.sampleDensity
          );
          defaultProps.contourPointsData = contourPoints;
          console.log('[text-grow-explode-effect] 预计算轮廓点数量:', contourPoints.length);
        }
      } catch (err) {
        console.error('[text-grow-explode-effect] 轮廓点预计算失败:', err.message);
      }
    }
    
    console.log('[text-grow-explode-effect] name:', defaultProps.name);
    console.log('[text-grow-explode-effect] words:', defaultProps.words);
    console.log('[text-grow-explode-effect] imageSource:', defaultProps.imageSource);
  }

  // 如果有背景文件，复制到项目 public 目录
  if (params.backgroundFile) {
    defaultProps.backgroundSource = params.backgroundFile;

    const ext = path.extname(params.backgroundFile).toLowerCase();
    if (['.mp4', '.webm', '.mov'].includes(ext)) {
      defaultProps.backgroundType = 'video';
      defaultProps.backgroundVideoLoop = true;
      defaultProps.backgroundVideoMuted = true;
    } else {
      defaultProps.backgroundType = 'image';
    }

    // 复制背景文件到项目的 public 目录
    const sourceFile = path.join(__dirname, 'uploads', params.backgroundFile);
    const targetDir = path.join(projectPath, 'public');
    const targetFile = path.join(targetDir, params.backgroundFile);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, targetFile);
    }
  }

  return new Promise((resolve, reject) => {
    // 使用临时文件传递 props，避免 Windows 命令行 JSON 转义问题
    const tempDir = os.tmpdir();
    const propsFile = path.join(tempDir, 'remotion-props-' + jobId + '.json');

    fs.writeFileSync(propsFile, JSON.stringify(defaultProps, null, 2), 'utf8');

    // 构建 npx remotion render 命令
    // 使用 --frames 参数支持自定义时长
    // 帧数 = duration(秒) * fps
    // 注意：帧数不能超过 Composition 的 durationInFrames (默认 480)
    const maxFrames = 480; // 与 Root.tsx 中的 durationInFrames 保持一致
    const frameCount = Math.min(params.duration * params.fps, maxFrames);
    const args = [
      'remotion',
      'render',
      'src/index.ts',
      compositionId,
      outputPath,
      '--props=' + propsFile,
      '--chromium-flags=--headless=new',
      '--codec', 'h264',
      '--concurrency', '1',
      '--frames', '0-' + (frameCount - 1),
      '--width', String(params.width || 720),
      '--height', String(params.height || 1280)
    ];

    console.log('========================================');
    console.log('项目:', params.projectId);
    console.log('组合:', compositionId);
    console.log('工作目录:', projectPath);
    console.log('执行命令: npx', args.join(' '));
    console.log('Props 文件:', propsFile);
    console.log('========================================');

    const child = spawn('npx', args, {
      cwd: projectPath,
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        REMOTION_BROWSER_EXECUTABLE: path.join(__dirname, '../node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe')
      }
    });

    let lastProgress = 0;

    child.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('[remotion]', output.trim());

      // 解析进度
      const progressMatch = output.match(/(\d+)%/);
      if (progressMatch && onProgress) {
        const progress = parseInt(progressMatch[1]) / 100;
        if (progress > lastProgress) {
          lastProgress = progress;
          onProgress(progress);
        }
      }
    });

    child.stderr.on('data', (data) => {
      const output = data.toString().trim();
      // 过滤掉 React concurrent rendering 的警告信息
      if (output && !output.includes('react-dom.production.min.js')) {
        console.error('[remotion error]', output);
      }
    });

    child.on('close', (code) => {
      // 清理临时文件
      try {
        if (fs.existsSync(propsFile)) {
          fs.unlinkSync(propsFile);
        }
      } catch (e) {
        console.warn('清理临时文件失败:', e.message);
      }

      if (code === 0) {
        if (onProgress) onProgress(1);
        resolve(outputFile);
      } else {
        reject(new Error(`渲染失败，退出码: ${code}`));
      }
    });

    child.on('error', (err) => {
      // 清理临时文件
      try {
        if (fs.existsSync(propsFile)) {
          fs.unlinkSync(propsFile);
        }
      } catch (e) {}
      reject(err);
    });
  });
}

/**
 * 使用 FFmpeg 合并多个视频
 * @param {string[]} videoFiles - 视频文件路径数组
 * @param {string} outputPath - 输出文件路径
 * @param {Object} options - 合并选项
 * @param {string} options.mode - 合并模式：'sequence'(顺序拼接) 或 'overlay'(叠加)
 * @param {number} options.fps - 帧率
 * @param {string} options.transition - 转场效果（可选）
 * @param {number} options.transitionDuration - 转场时长（秒）
 */
async function mergeVideos(videoFiles, outputPath, options = {}) {
  const { 
    mode = 'sequence', 
    fps = 30,
    transition = 'fade',
    transitionDuration = 0.5
  } = options;

  if (!videoFiles || videoFiles.length === 0) {
    throw new Error('没有视频文件需要合并');
  }

  // 如果只有一个视频，直接复制
  if (videoFiles.length === 1) {
    fs.copyFileSync(videoFiles[0], outputPath);
    return outputPath;
  }

  return new Promise((resolve, reject) => {
    // FFmpeg 路径 - 确保是可执行文件路径
    let ffmpegPath = process.env.FFMPEG_PATH || 'D:\\programs\\ffmpeg-7.1.1-full_build\\bin\\ffmpeg.exe';
    // 如果路径指向目录而非文件，添加 ffmpeg.exe
    if (!ffmpegPath.endsWith('ffmpeg.exe') && !ffmpegPath.endsWith('ffmpeg')) {
      ffmpegPath = path.join(ffmpegPath, 'ffmpeg.exe');
    }
    const outputDir = path.dirname(outputPath);

    if (mode === 'sequence') {
      // 顺序拼接模式
      // 创建文件列表
      const listFile = path.join(outputDir, 'filelist-' + Date.now() + '.txt');
      const fileListContent = videoFiles
        .map(file => `file '${file.replace(/'/g, "'\\''")}'`)
        .join('\n');
      
      fs.writeFileSync(listFile, fileListContent, 'utf8');

      const args = [
        '-y',
        '-f', 'concat',
        '-safe', '0',
        '-i', listFile,
        '-c', 'copy',
        outputPath
      ];

      console.log('========================================');
      console.log('FFmpeg 顺序拼接模式');
      console.log('视频数量:', videoFiles.length);
      console.log('执行命令:', ffmpegPath, args.join(' '));
      console.log('========================================');

      const child = spawn(ffmpegPath, args);

      child.stdout.on('data', (data) => {
        console.log('[ffmpeg]', data.toString().trim());
      });

      child.stderr.on('data', (data) => {
        console.error('[ffmpeg stderr]', data.toString().trim());
      });

      child.on('close', (code) => {
        // 清理临时文件
        try {
          if (fs.existsSync(listFile)) {
            fs.unlinkSync(listFile);
          }
        } catch (e) {}

        if (code === 0) {
          resolve(outputPath);
        } else {
          reject(new Error(`视频合并失败，退出码: ${code}`));
        }
      });

      child.on('error', reject);

    } else if (mode === 'overlay') {
      // 叠加模式 - 所有视频叠加在一起
      // 构建 filter_complex 命令
      const inputs = videoFiles.flatMap(file => ['-i', file]);
      
      // 获取视频数量
      const n = videoFiles.length;
      
      // 构建 overlay 滤镜链
      // 每个视频的透明度设为 1/n，实现均匀叠加
      let filterComplex = '';
      
      if (n === 2) {
        filterComplex = `[0:v][1:v]blend=all_mode='average':all_opacity=0.5[outv]`;
      } else {
        // 多个视频的叠加
        let currentOutput = '[0:v]';
        for (let i = 1; i < n; i++) {
          const opacity = 1 / (i + 1);
          const nextOutput = i === n - 1 ? '[outv]' : `[v${i}]`;
          filterComplex += `${currentOutput}[${i}:v]blend=all_mode='average':all_opacity=${opacity.toFixed(3)}${nextOutput};`;
          currentOutput = nextOutput.replace(';', '');
        }
        // 移除最后的分号
        filterComplex = filterComplex.slice(0, -1);
      }

      const args = [
        '-y',
        ...inputs,
        '-filter_complex', filterComplex,
        '-map', '[outv]',
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-r', String(fps),
        outputPath
      ];

      console.log('========================================');
      console.log('FFmpeg 叠加模式');
      console.log('视频数量:', videoFiles.length);
      console.log('滤镜:', filterComplex);
      console.log('========================================');

      const child = spawn(ffmpegPath, args);

      child.stdout.on('data', (data) => {
        console.log('[ffmpeg]', data.toString().trim());
      });

      child.stderr.on('data', (data) => {
        console.error('[ffmpeg stderr]', data.toString().trim());
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(outputPath);
        } else {
          reject(new Error(`视频叠加失败，退出码: ${code}`));
        }
      });

      child.on('error', reject);

    } else if (mode === 'transition') {
      // 带转场效果的拼接
      // 获取每个视频的时长信息
      const probePath = ffmpegPath.replace('ffmpeg.exe', 'ffprobe.exe');
      
      // 简化实现：使用 xfade 滤镜进行转场
      // 先将所有视频调整为相同尺寸
      const tempDir = path.join(outputDir, 'temp-' + Date.now());
      fs.mkdirSync(tempDir, { recursive: true });

      // 构建滤镜链
      let filterComplex = '';
      const transitions = ['fade', 'fadeblack', 'fadewipe', 'slideleft', 'slideright', 'slideup', 'slidedown'];
      const selectedTransition = transitions.includes(transition) ? transition : 'fade';
      
      // 简化：只处理两个视频的转场
      if (n === 2) {
        // 假设两个视频时长相同，转场发生在中间
        filterComplex = `[0:v][1:v]xfade=transition=${selectedTransition}:duration=${transitionDuration}:offset=5[outv]`;
        
        const args = [
          '-y',
          '-i', videoFiles[0],
          '-i', videoFiles[1],
          '-filter_complex', filterComplex,
          '-map', '[outv]',
          '-c:v', 'libx264',
          '-preset', 'medium',
          '-crf', '23',
          outputPath
        ];

        console.log('========================================');
        console.log('FFmpeg 转场模式');
        console.log('转场效果:', selectedTransition);
        console.log('========================================');

        const child = spawn(ffmpegPath, args);

        child.stdout.on('data', (data) => {
          console.log('[ffmpeg]', data.toString().trim());
        });

        child.stderr.on('data', (data) => {
          console.error('[ffmpeg stderr]', data.toString().trim());
        });

        child.on('close', (code) => {
          if (code === 0) {
            resolve(outputPath);
          } else {
            reject(new Error(`转场合并失败，退出码: ${code}`));
          }
        });

        child.on('error', reject);
      } else {
        // 多个视频的转场处理（逐对处理）
        reject(new Error('转场模式目前只支持两个视频'));
      }
    }
  });
}

/**
 * 渲染组合特效
 * @param {Object[]} effects - 特效配置数组
 * @param {string} jobId - 任务 ID
 * @param {Function} onProgress - 进度回调
 * @param {Object} globalParams - 全局参数（宽度、高度、帧率等）
 */
async function renderCompositeEffect(effects, jobId, onProgress, globalParams = {}) {
  const outputDir = path.join(__dirname, 'outputs');
  const tempDir = path.join(outputDir, 'temp-' + jobId);
  
  // 确保目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const renderedVideos = [];
  const totalEffects = effects.length;
  let currentEffectIndex = 0;

  try {
    // 逐个渲染每个特效
    for (const effect of effects) {
      currentEffectIndex++;
      const effectJobId = `${jobId}-effect-${currentEffectIndex}`;
      const progressBase = (currentEffectIndex - 1) / totalEffects;
      const progressRange = 1 / totalEffects;

      console.log(`\n========================================`);
      console.log(`渲染特效 ${currentEffectIndex}/${totalEffects}: ${effect.projectId}`);
      console.log(`========================================\n`);

      // 合并全局参数和特效参数
      const effectParams = {
        ...effect,
        width: effect.width || globalParams.width || 720,
        height: effect.height || globalParams.height || 1280,
        fps: effect.fps || globalParams.fps || 24,
        duration: effect.duration || globalParams.duration || 10,
      };

      // 渲染单个特效
      const videoFile = await renderVideo(
        effectParams,
        effectJobId,
        (progress) => {
          // 计算总进度
          const totalProgress = progressBase + progress * progressRange;
          if (onProgress) {
            onProgress(totalProgress);
          }
        }
      );

      renderedVideos.push(path.join(outputDir, videoFile));
    }

    // 合并所有视频
    console.log(`\n========================================`);
    console.log('合并视频中...');
    console.log(`视频数量: ${renderedVideos.length}`);
    console.log(`合并模式: ${globalParams.mergeMode || 'sequence'}`);
    console.log('========================================\n');

    const finalOutputFile = 'video-' + jobId + '.mp4';
    const finalOutputPath = path.join(outputDir, finalOutputFile);

    await mergeVideos(renderedVideos, finalOutputPath, {
      mode: globalParams.mergeMode || 'sequence',
      fps: globalParams.fps || 24,
      transition: globalParams.transition,
      transitionDuration: globalParams.transitionDuration || 0.5,
    });

    // 清理临时视频文件
    for (const video of renderedVideos) {
      try {
        if (fs.existsSync(video)) {
          fs.unlinkSync(video);
        }
      } catch (e) {
        console.warn('清理临时视频失败:', e.message);
      }
    }

    // 清理临时目录
    try {
      fs.rmdirSync(tempDir, { recursive: true });
    } catch (e) {}

    return finalOutputFile;

  } catch (error) {
    // 清理临时文件
    for (const video of renderedVideos) {
      try {
        if (fs.existsSync(video)) {
          fs.unlinkSync(video);
        }
      } catch (e) {}
    }
    try {
      fs.rmdirSync(tempDir, { recursive: true });
    } catch (e) {}

    throw error;
  }
}

module.exports = { renderVideo, mergeVideos, renderCompositeEffect };