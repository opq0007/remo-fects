const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ==================== 配置 ====================
const SCRIPT_DIR = __dirname;
const ROOT_DIR = path.join(SCRIPT_DIR, '..');
const EFFECTS_DIR = path.join(ROOT_DIR, 'effects');
const CHROME_GLOBAL_DIR = path.join(ROOT_DIR, 'node_modules', '.remotion', 'chrome-headless-shell');

// 平台映射
const PLATFORM_MAP = {
  'win32': 'win64',
  'darwin': 'mac-arm64', // macOS ARM64
  'linux': 'linux64'
};

// ==================== 工具函数 ====================

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const colors = {
    info: '\x1b[36m',   // 青色
    success: '\x1b[32m', // 绿色
    warn: '\x1b[33m',    // 黄色
    error: '\x1b[31m',   // 红色
    reset: '\x1b[0m'
  };
  const color = colors[type] || colors.info;
  console.log(`${color}[${timestamp}]${colors.reset} ${message}`);
}

function execCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'pipe',
      shell: true,
      cwd: ROOT_DIR,
      ...options
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

function getPlatform() {
  const platform = os.platform();
  if (!PLATFORM_MAP[platform]) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  return PLATFORM_MAP[platform];
}

function getChromeGlobalPath() {
  const platform = getPlatform();
  return path.join(CHROME_GLOBAL_DIR, platform);
}

function getChromeExecutablePath() {
  const platform = getPlatform();
  const chromeDir = getChromeGlobalPath();
  
  if (platform === 'win32') {
    return path.join(chromeDir, `chrome-headless-shell-${platform}`, 'chrome-headless-shell.exe');
  } else {
    return path.join(chromeDir, `chrome-headless-shell-${platform}`, 'chrome-headless-shell');
  }
}

// ==================== 主要功能 ====================

async function downloadChrome() {
  log('开始下载 Chrome Headless Shell...', 'info');
  
  try {
    await execCommand('npx', ['remotion', 'browser', 'ensure']);
    log('Chrome Headless Shell 下载完成', 'success');
    return true;
  } catch (error) {
    log(`下载失败: ${error.message}`, 'error');
    return false;
  }
}

function createSymlink(source, target) {
  const platform = os.platform();
  
  try {
    // 先删除目标（如果存在）
    if (fs.existsSync(target)) {
      const stats = fs.lstatSync(target);
      
      if (stats.isSymbolicLink()) {
        fs.unlinkSync(target);
      } else if (stats.isDirectory()) {
        fs.rmSync(target, { recursive: true, force: true });
      } else {
        fs.unlinkSync(target);
      }
    }
    
    // 创建目标父目录
    const targetParent = path.dirname(target);
    if (!fs.existsSync(targetParent)) {
      fs.mkdirSync(targetParent, { recursive: true });
    }
    
    // Windows 使用复制，Linux/macOS 使用软链接
    if (platform === 'win32') {
      // Windows: 复制整个平台目录（包括 VERSION 文件）
      // 注意：Remotion 期望的路径是 chrome-headless-shell/win64/{files}
      // 所以直接复制 win64 目录的内容到目标
      copyPlatformDirectory(source, target);
      return true;
    } else {
      // Linux/macOS: 使用符号链接
      fs.symlinkSync(source, target, 'dir');
      return true;
    }
  } catch (error) {
    log(`创建链接失败 (${source} -> ${target}): ${error.message}`, 'warn');
    return false;
  }
}

function copyDirectory(source, target) {
  // 创建目标目录
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  
  // 递归复制所有文件和目录
  const items = fs.readdirSync(source);
  
  for (const item of items) {
    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);
    const stats = fs.lstatSync(sourcePath);
    
    if (stats.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else if (stats.isFile()) {
      // 复制文件
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

// 复制整个平台目录（包括 VERSION 文件）
function copyPlatformDirectory(source, target) {
  // Windows: source 是 win64 目录，需要复制其内容
  // Remotion 期望的路径: chrome-headless-shell/win64/{files}
  // Chrome 目录结构: chrome-headless-shell/{VERSION, win64/}
  
  log(`复制 ${path.basename(source)} 目录内容到 ${target}`, 'info');
  
  // 复制 win64 目录下的所有文件和子目录
  const items = fs.readdirSync(source);
  
  for (const item of items) {
    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);
    const stats = fs.lstatSync(sourcePath);
    
    if (stats.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else if (stats.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
  
  // 复制 VERSION 文件（应该和 win64 在同一层，即 target 的父目录）
  const parentTarget = path.dirname(target);
  const versionFile = path.join(path.dirname(source), 'VERSION');
  if (fs.existsSync(versionFile)) {
    const targetVersionFile = path.join(parentTarget, 'VERSION');
    fs.copyFileSync(versionFile, targetVersionFile);
    log(`复制 VERSION 文件到 ${targetVersionFile}`, 'info');
  }
}

function execCommandSync(command, args) {
  const { spawnSync } = require('child_process');
  const result = spawnSync(command, args, {
    stdio: 'pipe',
    shell: true,
    cwd: ROOT_DIR
  });
  
  if (result.status !== 0) {
    throw new Error(`Command failed: ${result.stderr.toString() || result.stdout.toString()}`);
  }
  
  return result.stdout.toString();
}

async function linkChromeToProjects() {
  const platform = getPlatform();
  const chromeGlobalPath = getChromeGlobalPath();
  
  log(`Chrome 全局路径: ${chromeGlobalPath}`, 'info');
  
  // 检查全局 Chrome 是否存在
  if (!fs.existsSync(chromeGlobalPath)) {
    log('Chrome 未安装，请先运行下载', 'error');
    return false;
  }
  
  // 获取所有 effects 项目
  const projects = fs.readdirSync(EFFECTS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  if (projects.length === 0) {
    log('未找到任何特效项目', 'warn');
    return true;
  }
  
  log(`找到 ${projects.length} 个特效项目`, 'info');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const project of projects) {
    const projectPath = path.join(EFFECTS_DIR, project);
    const projectNodeModules = path.join(projectPath, 'node_modules');
    const projectRemotionDir = path.join(projectNodeModules, '.remotion');
    const projectChromeDir = path.join(projectRemotionDir, 'chrome-headless-shell');
    const targetPath = path.join(projectChromeDir, platform);
    
    // 创建必要的目录
    if (!fs.existsSync(projectNodeModules)) {
      fs.mkdirSync(projectNodeModules, { recursive: true });
    }
    if (!fs.existsSync(projectRemotionDir)) {
      fs.mkdirSync(projectRemotionDir, { recursive: true });
    }
    
    // 创建软链接
    log(`为项目 ${project} 创建软链接...`, 'info');
    
    const success = createSymlink(chromeGlobalPath, targetPath);
    
    if (success) {
      log(`✓ ${project} 软链接创建成功`, 'success');
      successCount++;
    } else {
      log(`✗ ${project} 软链接创建失败`, 'error');
      failCount++;
    }
  }
  
  log(`\n软链接创建完成: 成功 ${successCount}/${projects.length}, 失败 ${failCount}/${projects.length}`, 
    failCount === 0 ? 'success' : 'warn');
  
  return failCount === 0;
}

function verifyLinks() {
  const platform = os.platform();
  const projects = fs.readdirSync(EFFECTS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  log('验证链接...', 'info');
  
  for (const project of projects) {
    const targetPath = path.join(EFFECTS_DIR, project, 'node_modules', '.remotion', 'chrome-headless-shell', platform);
    
    if (fs.existsSync(targetPath)) {
      if (platform === 'win32') {
        // Windows: 检查是否有文件（复制）
        const stats = fs.statSync(targetPath);
        if (stats.isDirectory()) {
          // 检查是否有文件
          const items = fs.readdirSync(targetPath);
          const hasFiles = items.some(item => {
            const itemPath = path.join(targetPath, item);
            return fs.statSync(itemPath).isFile();
          });
          
          if (hasFiles) {
            log(`✓ ${project} Chrome 已安装（复制）`, 'success');
          } else {
            log(`✗ ${project} Chrome 目录为空`, 'error');
          }
        } else {
          log(`✗ ${project} 不是目录`, 'error');
        }
      } else {
        // Linux/macOS: 检查是否为符号链接
        const stats = fs.lstatSync(targetPath);
        if (stats.isSymbolicLink()) {
          log(`✓ ${project} 软链接正常`, 'success');
        } else {
          log(`⚠ ${project} 不是软链接`, 'warn');
        }
      }
    } else {
      log(`✗ ${project} Chrome 不存在`, 'error');
    }
  }
}

async function cleanProjectsChrome() {
  const platform = getPlatform();
  const projects = fs.readdirSync(EFFECTS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  log('清理项目中的 Chrome...', 'info');
  
  for (const project of projects) {
    const projectChromeDir = path.join(EFFECTS_DIR, project, 'node_modules', '.remotion', 'chrome-headless-shell');
    
    if (fs.existsSync(projectChromeDir)) {
      const stats = fs.lstatSync(projectChromeDir);
      let size = 0;
      
      if (platform === 'win32' || !stats.isSymbolicLink()) {
        // Windows 或实际目录：删除整个目录
        try {
          size = getDirSize(projectChromeDir);
          fs.rmSync(projectChromeDir, { recursive: true, force: true });
          log(`✓ ${project} 已删除 (${Math.round(size / 1024 / 1024)} MB)`, 'success');
        } catch (error) {
          log(`⚠ ${project} 清理失败: ${error.message}`, 'warn');
        }
      } else {
        // Linux/macOS 符号链接：只删除链接
        fs.unlinkSync(projectChromeDir);
        log(`✓ ${project} 符号链接已删除`, 'success');
      }
    }
  }
}

function getDirSize(dirPath) {
  let size = 0;
  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.lstatSync(filePath);
      
      if (stats.isDirectory() && !stats.isSymbolicLink()) {
        size += getDirSize(filePath);
      } else if (!stats.isSymbolicLink()) {
        size += stats.size;
      }
    }
  } catch (error) {
    // 忽略无法访问的文件
  }
  
  return size;
}

// ==================== 主程序 ====================

async function main() {
  const command = process.argv[2] || 'all';
  
  log('========================================', 'info');
  log('Chrome Headless Shell 管理工具', 'info');
  log(`平台: ${os.platform()} (${getPlatform()})`, 'info');
  if (os.platform() === 'win32') {
    log('Windows 平台使用复制方式', 'info');
  } else {
    log('Linux/macOS 平台使用软链接', 'info');
  }
  log('========================================\n', 'info');
  
  try {
    switch (command) {
      case 'download':
        await downloadChrome();
        break;
        
      case 'link':
        await linkChromeToProjects();
        break;
        
      case 'verify':
        verifyLinks();
        break;
        
      case 'clean':
        await cleanProjectsChrome();
        break;
        
      case 'all':
      default:
        const downloadSuccess = await downloadChrome();
        if (downloadSuccess) {
          await linkChromeToProjects();
        }
        verifyLinks();
        break;
    }
    
    log('\n操作完成！', 'success');
  } catch (error) {
    log(`\n错误: ${error.message}`, 'error');
    process.exit(1);
  }
}

// 运行主程序
main();