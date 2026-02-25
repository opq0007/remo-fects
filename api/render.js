const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

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

  // gold-text-ring-effect 特有参数
  if (params.projectId === 'gold-text-ring-effect') {
    defaultProps.fontSize = params.fontSize;
    defaultProps.opacity = params.opacity;
    defaultProps.ringRadius = params.ringRadius;
    defaultProps.rotationSpeed = params.rotationSpeed;
    defaultProps.glowIntensity = params.glowIntensity;
    defaultProps.depth3d = params.depth3d;
    defaultProps.cylinderHeight = params.cylinderHeight;
    defaultProps.perspective = params.perspective;
    defaultProps.mode = params.mode || 'vertical';
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
      '--frames', '0-' + (params.duration * params.fps - 1)
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
      console.error('[remotion error]', data.toString().trim());
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

module.exports = { renderVideo };