/**
 * 混合输入类型定义
 * 
 * 支持文字、图片、祝福图案的混合输入，供各特效项目复用
 */

import { BlessingSymbolType } from "../schemas";

/**
 * 内容类型枚举
 * - text: 仅文字
 * - image: 仅图片
 * - blessing: 仅祝福图案
 * - mixed: 混合使用文字、图片、祝福图案
 */
export type MixedContentType = "text" | "image" | "blessing" | "mixed";

/**
 * 单个项目类型
 */
export type MixedItemType = "text" | "image" | "blessing";

/**
 * 祝福图案样式配置
 */
export interface BlessingStyleConfig {
  /** 主颜色 */
  primaryColor?: string;
  /** 次颜色 */
  secondaryColor?: string;
  /** 是否启用3D效果 */
  enable3D?: boolean;
  /** 是否启用发光效果 */
  enableGlow?: boolean;
  /** 发光强度 */
  glowIntensity?: number;
  /** 是否启用动画 */
  animated?: boolean;
  /** 动画速度 */
  animationSpeed?: number;
}

/**
 * 文字样式配置（简化版）
 */
export interface MixedTextStyleConfig {
  /** 文字颜色 */
  color?: string;
  /** 文字特效类型 */
  effect?: "none" | "shadow" | "gold3d" | "emboss" | "neon" | "glow" | "outline";
  /** 特效强度 */
  effectIntensity?: number;
  /** 字重 */
  fontWeight?: number;
  /** 字体 */
  fontFamily?: string;
}

/**
 * 图片样式配置
 */
export interface MixedImageStyleConfig {
  /** 是否发光 */
  glow?: boolean;
  /** 发光颜色 */
  glowColor?: string;
  /** 发光强度 */
  glowIntensity?: number;
  /** 是否阴影 */
  shadow?: boolean;
  /** 阴影颜色 */
  shadowColor?: string;
  /** 阴影模糊 */
  shadowBlur?: number;
  /** 是否摇摆 */
  swing?: boolean;
  /** 摇摆角度 */
  swingAngle?: number;
  /** 摇摆速度 */
  swingSpeed?: number;
  /** 是否旋转 */
  spin?: boolean;
  /** 旋转速度 */
  spinSpeed?: number;
}

/**
 * 混合输入基础配置
 */
export interface MixedInputConfig {
  /** 内容类型 */
  contentType?: MixedContentType;
  /** 文字列表 */
  words?: string[];
  /** 图片路径列表（相对于 public 目录） */
  images?: string[];
  /** 祝福图案类型列表 */
  blessingTypes?: BlessingSymbolType[];
  /** 图片出现权重（0-1，mixed 模式下有效） */
  imageWeight?: number;
  /** 祝福图案样式 */
  blessingStyle?: BlessingStyleConfig;
}

/**
 * 混合输入项目（单个元素的数据结构）
 */
export interface MixedInputItem {
  /** 项目类型 */
  type: MixedItemType;
  /** 唯一标识 */
  id: number;
  /** 内容：文字内容、图片路径或祝福图案类型 */
  content: string;
  /** X 位置 */
  x?: number;
  /** Y 位置 */
  y?: number;
  /** 宽度/大小 */
  width?: number;
  /** 高度 */
  height?: number;
  /** 透明度 */
  opacity?: number;
  /** 旋转角度 */
  rotation?: number;
  /** 缩放 */
  scale?: number;
  /** 延迟（帧数） */
  delay?: number;
  /** 持续时间（帧数） */
  duration?: number;
  
  // 文字特有属性
  /** 字体大小 */
  fontSize?: number;
  
  // 图片特有属性
  /** 摇摆相位 */
  swingPhase?: number;
  /** 旋转方向 */
  spinDirection?: number;
  
  // 祝福图案特有属性
  /** 祝福图案样式 */
  blessingStyle?: BlessingStyleConfig;
}

/**
 * 混合输入生成选项
 */
export interface MixedInputGenerateOptions {
  /** 生成数量 */
  count: number;
  /** 随机种子 */
  seed: number;
  /** 字体大小范围 */
  fontSizeRange?: [number, number];
  /** 图片大小范围 */
  imageSizeRange?: [number, number];
  /** 祝福图案大小范围 */
  blessingSizeRange?: [number, number];
  /** 透明度范围 */
  opacityRange?: [number, number];
  /** 旋转范围 */
  rotationRange?: [number, number];
  /** 默认文字样式 */
  textStyle?: MixedTextStyleConfig;
  /** 默认图片样式 */
  imageStyle?: MixedImageStyleConfig;
  /** 默认祝福图案样式 */
  blessingStyle?: BlessingStyleConfig;
}

/**
 * 可用内容检测结果
 */
export interface AvailableContent {
  /** 是否有文字 */
  hasText: boolean;
  /** 是否有图片 */
  hasImages: boolean;
  /** 是否有祝福图案 */
  hasBlessing: boolean;
  /** 可用类型列表 */
  availableTypes: MixedItemType[];
}

/**
 * 内容类型判断结果
 */
export interface ContentTypeResult {
  /** 选定的类型 */
  type: MixedItemType;
  /** 实际内容 */
  content: string;
  /** 内容索引 */
  contentIndex: number;
}
