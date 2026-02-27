/**
 * 视频渲染模块
 * 
 * 使用配置驱动方式处理不同特效的参数，支持动态扩展
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// 导入特效配置注册表
const { buildRenderParams: buildParamsFromConfig } = require('./effect-configs');

/**
 * 从图片中提取轮廓点（服务端版本）
 * 使用 canvas 库处理图片
 */
function extractContourPointsFromImage(imagePath, width, height, threshold = 128, sampleDensity = 8) {
  try {
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
  
  for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
    for (let r = radius * 0.3; r <= radius; r += sampleDensity) {
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      const opacity = 0.5 + (r / radius) * 0.5;
      points.push({ x: Math.round(x), y: Math.round(y), opacity });
    }
  }
  
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

/**
 * 处理背景文件
 * 复制背景文件到项目 public 目录，并设置相关参数
 */
function processBackgroundFile(params, projectPath) {
  if (!params.backgroundFile) return;
  
  params.backgroundSource = params.backgroundFile;
  
  const ext = path.extname(params.backgroundFile).toLowerCase();
  if (['.mp4', '.webm', '.mov'].includes(ext)) {
    params.backgroundType = 'video';
    params.backgroundVideoLoop = true;
    params.backgroundVideoMuted = true;
  } else {
    params.backgroundType = 'image';
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

/**
 * 特效特定的后处理函数
 * 用于处理一些特殊的参数转换需求
 */
const effectPostProcessors = {
  'text-grow-explode-effect': (params, jobId) => {
    // 预计算轮廓点数据
    if (params.backgroundFile && params.width && params.height) {
      try {
        const imagePath = path.join(__dirname, 'uploads', params.backgroundFile);
        if (fs.existsSync(imagePath)) {
          const contourPoints = extractContourPointsFromImage(
            imagePath,
            params.width,
            params.height,
            params.threshold,
            params.sampleDensity
          );
          params.contourPointsData = contourPoints;
          console.log('[text-grow-explode-effect] 预计算轮廓点数量:', contourPoints.length);
        }
      } catch (err) {
        console.error('[text-grow-explode-effect] 轮廓点预计算失败:', err.message);
      }
    }
  }
};

/**
 * 渲染视频
 * @param {Object} params - 渲染参数
 * @param {string} jobId - 任务 ID
 * @param {Function} onProgress - 进度回调
 * @returns {Promise<string>} - 输出文件名
 */
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

  // 使用配置驱动方式构建 defaultProps
  // 不再需要大量的 if-else 分支
  const defaultProps = { ...params };
  
  // 确保基本的默认值
  defaultProps.seed = defaultProps.seed || Math.floor(Math.random() * 10000);
  
  // 处理背景文件
  processBackgroundFile(defaultProps, projectPath);
  
  // 执行特效特定的后处理
  const postProcessor = effectPostProcessors[params.projectId];
  if (postProcessor) {
    postProcessor(defaultProps, jobId);
  }

  return new Promise((resolve, reject) => {
    // 使用临时文件传递 props，避免 Windows 命令行 JSON 转义问题
    const tempDir = os.tmpdir();
    const propsFile = path.join(tempDir, 'remotion-props-' + jobId + '.json');

    fs.writeFileSync(propsFile, JSON.stringify(defaultProps, null, 2), 'utf8');

    // 构建 npx remotion render 命令
    const maxFrames = 480;
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
      if (output && !output.includes('react-dom.production.min.js')) {
        console.error('[remotion error]', output);
      }
    });

    child.on('close', (code) => {
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

  if (videoFiles.length === 1) {
    fs.copyFileSync(videoFiles[0], outputPath);
    return outputPath;
  }

  return new Promise((resolve, reject) => {
    let ffmpegPath = process.env.FFMPEG_PATH || 'D:\\programs\\ffmpeg-7.1.1-full_build\\bin\\ffmpeg.exe';
    if (!ffmpegPath.endsWith('ffmpeg.exe') && !ffmpegPath.endsWith('ffmpeg')) {
      ffmpegPath = path.join(ffmpegPath, 'ffmpeg.exe');
    }
    const outputDir = path.dirname(outputPath);

    if (mode === 'sequence') {
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
      const inputs = videoFiles.flatMap(file => ['-i', file]);
      const n = videoFiles.length;
      let filterComplex = '';
      
      if (n === 2) {
        filterComplex = `[0:v][1:v]blend=all_mode='average':all_opacity=0.5[outv]`;
      } else {
        let currentOutput = '[0:v]';
        for (let i = 1; i < n; i++) {
          const opacity = 1 / (i + 1);
          const nextOutput = i === n - 1 ? '[outv]' : `[v${i}]`;
          filterComplex += `${currentOutput}[${i}:v]blend=all_mode='average':all_opacity=${opacity.toFixed(3)}${nextOutput};`;
          currentOutput = nextOutput.replace(';', '');
        }
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
      const probePath = ffmpegPath.replace('ffmpeg.exe', 'ffprobe.exe');
      const tempDir = path.join(outputDir, 'temp-' + Date.now());
      fs.mkdirSync(tempDir, { recursive: true });

      let filterComplex = '';
      const transitions = ['fade', 'fadeblack', 'fadewipe', 'slideleft', 'slideright', 'slideup', 'slidedown'];
      const selectedTransition = transitions.includes(transition) ? transition : 'fade';
      
      if (n === 2) {
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
        reject(new Error('转场模式目前只支持两个视频'));
      }
    }
  });
}

/**
 * 渲染组合特效
 */
async function renderCompositeEffect(effects, jobId, onProgress, globalParams = {}) {
  const outputDir = path.join(__dirname, 'outputs');
  const tempDir = path.join(outputDir, 'temp-' + jobId);
  
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
    for (const effect of effects) {
      currentEffectIndex++;
      const effectJobId = `${jobId}-effect-${currentEffectIndex}`;
      const progressBase = (currentEffectIndex - 1) / totalEffects;
      const progressRange = 1 / totalEffects;

      console.log(`\n========================================`);
      console.log(`渲染特效 ${currentEffectIndex}/${totalEffects}: ${effect.projectId}`);
      console.log(`========================================\n`);

      const effectParams = {
        ...effect,
        width: effect.width || globalParams.width || 720,
        height: effect.height || globalParams.height || 1280,
        fps: effect.fps || globalParams.fps || 24,
        duration: effect.duration || globalParams.duration || 10,
      };

      const videoFile = await renderVideo(
        effectParams,
        effectJobId,
        (progress) => {
          const totalProgress = progressBase + progress * progressRange;
          if (onProgress) {
            onProgress(totalProgress);
          }
        }
      );

      renderedVideos.push(path.join(outputDir, videoFile));
    }

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

    for (const video of renderedVideos) {
      try {
        if (fs.existsSync(video)) {
          fs.unlinkSync(video);
        }
      } catch (e) {
        console.warn('清理临时视频失败:', e.message);
      }
    }

    try {
      fs.rmdirSync(tempDir, { recursive: true });
    } catch (e) {}

    return finalOutputFile;

  } catch (error) {
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

module.exports = { 
  renderVideo, 
  mergeVideos, 
  renderCompositeEffect,
  buildRenderParams: buildParamsFromConfig
};
