import { Config } from "@remotion/cli/config";
import os from "os";

// ==================== 浏览器配置说明 ====================
// 
// 【重要】Remotion 4.0.247+ 已内置 Chrome Headless Shell
// 
// - 不要设置 setBrowserExecutable()，让 Remotion 使用内置的 Chrome Headless Shell
// - Chrome Headless Shell 专门为视频渲染优化，比系统 Chrome 更稳定
// - 系统 Chrome 132+ 已移除旧的 headless 模式，会导致渲染失败
// 
// 如果确实需要使用自定义浏览器：
// 1. 设置环境变量: REMOTION_BROWSER_EXECUTABLE=/path/to/chrome
// 2. 或使用 --browser-executable 命令行参数
// 
// 注意：使用系统 Chrome 可能会遇到 headless 模式兼容性问题

// ==================== 性能优化配置 ====================
// 
// 【为什么预览快但渲染慢？】
// 1. 预览模式：只渲染当前显示的1帧，浏览器实时计算
// 2. 渲染模式：需要逐帧生成图片（如 240帧 × 720×1280像素），再编码成视频
// 
// 【优化建议】
// 1. 降低 fps（从30降到24）
// 2. 减少 density（从3降到1-2）
// 3. 缩短视频时长
// 4. 使用图片背景代替视频背景
// 5. 使用简单的文字效果（如 shadow 比 gold3d 快）
// 6. 渲染时使用 --concurrency 参数增加并发

// 使用 JPEG 格式提高编码速度（比 PNG 快）
Config.setVideoImageFormat("jpeg");

// 允许覆盖输出文件
Config.setOverwriteOutput(true);

// 并发渲染：使用 CPU 核心数（命令行可通过 --concurrency 覆盖）
Config.setConcurrency(os.cpus().length);

// 设置 JPEG 质量（0-100），适当降低可以提高速度
Config.setJpegQuality(80);

// 设置像素格式（yuv420p 兼容性最好）
Config.setPixelFormat("yuv420p");

// 设置编码格式
Config.setCodec("h264");
