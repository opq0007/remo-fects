import { Config } from "@remotion/cli/config";
import os from "os";

// 使用 JPEG 格式提高编码速度
Config.setVideoImageFormat("jpeg");

// 允许覆盖输出文件
Config.setOverwriteOutput(true);

// 并发渲染：使用 CPU 核心数
Config.setConcurrency(os.cpus().length);

// 设置 JPEG 质量
Config.setJpegQuality(80);

// 设置像素格式
Config.setPixelFormat("yuv420p");

// 设置编码格式
Config.setCodec("h264");
