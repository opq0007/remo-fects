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
  return CHROME_GLOBAL_DIR;
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
    
    // Windows 尝试多种方式创建链接
    if (platform === 'win32') {
      // Windows: 优先尝试 Junction（无需管理员权限）
      try {
        execCommandSync('cmd', ['/c', 'mklink', '/J', target, source]);
        log(`使用 Junction 创建链接`, 'info');
        return true;
      } catch (junctionError) {
        // Junction 失败，尝试符号链接（需要管理员权限）
        try {
          execCommandSync('cmd', ['/c', 'mklink', '/D', target, source]);
          log(`使用符号链接创建链接（需要管理员权限）`, 'info');
          return true;
        } catch (symlinkError) {
          // 符号链接也失败，尝试 PowerShell
          try {
            execCommandSync('powershell', ['-Command', `New-Item -ItemType SymbolicLink -Path "${target}" -Target "${source}"`]);
            log(`使用 PowerShell 创建链接（需要管理员权限）`, 'info');
            return true;
          } catch (psError) {
            // 所有链接方式都失败
            log(`所有链接方式都失败: ${psError.message}`, 'error');
            return false;
          }
        }
      }
    } else {
      // Linux/macOS: 使用符号链接
      fs.symlinkSync(source, target, 'dir');
      log(`使用符号链接创建链接`, 'info');
      return true;
    }
  } catch (error) {
    log(`创建链接失败 (${source} -> ${target}): ${error.message}`, 'warn');
    return false;
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
    
    // 创建必要的目录
    if (!fs.existsSync(projectNodeModules)) {
      fs.mkdirSync(projectNodeModules, { recursive: true });
    }
    if (!fs.existsSync(projectRemotionDir)) {
      fs.mkdirSync(projectRemotionDir, { recursive: true });
    }
    
    // 直接链接整个 chrome-headless-shell 目录
    log(`为项目 ${project} 创建软链接...`, 'info');
    
    const success = createSymlink(chromeGlobalPath, projectChromeDir);
    
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
    const targetPath = path.join(EFFECTS_DIR, project, 'node_modules', '.remotion', 'chrome-headless-shell');
    
    if (fs.existsSync(targetPath)) {
      const stats = fs.lstatSync(targetPath);
      
      if (stats.isDirectory() || stats.isSymbolicLink()) {
        // 检查是否包含 VERSION 文件和平台目录
        const items = fs.readdirSync(targetPath);
        const platformDir = getPlatform();
        const hasVersion = items.includes('VERSION');
        const hasPlatformDir = items.includes(platformDir);
        
        if (hasVersion && hasPlatformDir) {
          log(`✓ ${project} Chrome 已安装`, 'success');
        } else {
          log(`✗ ${project} Chrome 目录不完整（缺少 ${!hasVersion ? 'VERSION' : ''}${!hasPlatformDir ? platformDir : ''}）`, 'error');
        }
      } else {
        log(`✗ ${project} 不是目录或链接`, 'error');
      }
    } else {
      log(`✗ ${project} Chrome 不存在`, 'error');
    }
  }
}

async function cleanProjectsChrome() {
  const projects = fs.readdirSync(EFFECTS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  log('清理项目中的 Chrome...', 'info');
  
  for (const project of projects) {
    const projectChromeDir = path.join(EFFECTS_DIR, project, 'node_modules', '.remotion', 'chrome-headless-shell');
    
    if (fs.existsSync(projectChromeDir)) {
      const stats = fs.lstatSync(projectChromeDir);
      let size = 0;
      
      if (!stats.isSymbolicLink()) {
        // 实际目录：删除整个目录
        try {
          size = getDirSize(projectChromeDir);
          fs.rmSync(projectChromeDir, { recursive: true, force: true });
          log(`✓ ${project} 已删除 (${Math.round(size / 1024 / 1024)} MB)`, 'success');
        } catch (error) {
          log(`⚠ ${project} 清理失败: ${error.message}`, 'warn');
        }
      } else {
        // 符号链接：只删除链接
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
  log('所有平台使用符号链接（节省空间）', 'info');
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