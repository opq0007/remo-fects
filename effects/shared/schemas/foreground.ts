/**
 * 前景组件 Schema 定义
 * 
 * 定义前景组件的参数 Schema，供各特效项目复用
 */

import { z } from "zod";

/**
 * 前景动画效果类型 Schema
 */
export const ForegroundAnimationTypeSchema = z.enum([
  "none",        // 无动画
  "zoom-in",     // 镜头推进
  "zoom-out",    // 镜头拉远
  "fade-in",     // 淡入
  "fade-out",    // 淡出
  "slide-up",    // 从下往上滑入
  "slide-down",  // 从上往下滑入
  "scale-pulse", // 缩放脉冲
  "breath",      // 呼吸效果
  "rotate-zoom", // 旋转并缩放
]);

/**
 * 前景类型 Schema
 */
export const ForegroundTypeSchema = z.enum(["image", "video"]);

/**
 * 前景组件 Props Schema（扁平结构）
 */
export const ForegroundSchema = z.object({
  /** 是否启用前景 */
  foregroundEnabled: z.boolean().optional().meta({
    description: "是否启用前景",
  }),

  /** 前景类型：图片或视频 */
  foregroundType: ForegroundTypeSchema.optional().meta({
    description: "前景类型：image 或 video",
  }),

  /** 前景源文件路径 */
  foregroundSource: z.string().optional().meta({
    description: "前景源文件路径（本地 public 目录、网络 URL 或 Data URL）",
  }),

  // ===== 尺寸与位置 =====
  /** 宽度 */
  foregroundWidth: z.number().int().positive().optional().meta({
    description: "前景宽度（像素），默认使用视频宽度",
  }),

  /** 高度 */
  foregroundHeight: z.number().int().positive().optional().meta({
    description: "前景高度（像素），默认使用视频高度",
  }),

  /** 垂直偏移 */
  foregroundVerticalOffset: z.number().optional().meta({
    description: "垂直偏移（像素），正数向下，负数向上",
  }),

  /** 水平偏移 */
  foregroundHorizontalOffset: z.number().optional().meta({
    description: "水平偏移（像素），正数向右，负数向左",
  }),

  /** 缩放比例 */
  foregroundScale: z.number().min(0.1).max(3).optional().meta({
    description: "前景缩放比例",
  }),

  // ===== 动画配置 =====
  /** 动画类型 */
  foregroundAnimationType: ForegroundAnimationTypeSchema.optional().meta({
    description: "前景动画类型",
  }),

  /** 动画开始帧 */
  foregroundAnimationStartFrame: z.number().int().min(0).optional().meta({
    description: "动画开始帧",
  }),

  /** 动画持续时间 */
  foregroundAnimationDuration: z.number().int().min(1).optional().meta({
    description: "动画持续时间（帧），默认 60 帧",
  }),

  /** 动画强度系数 */
  foregroundAnimationIntensity: z.number().min(0).max(2).optional().meta({
    description: "动画强度系数（0-2）",
  }),

  /** 是否使用弹簧动画 */
  foregroundUseSpring: z.boolean().optional().meta({
    description: "是否使用弹簧动画效果",
  }),

  /** 弹簧阻尼 */
  foregroundSpringDamping: z.number().min(1).max(30).optional().meta({
    description: "弹簧阻尼系数",
  }),

  /** 弹簧刚度 */
  foregroundSpringStiffness: z.number().min(10).max(500).optional().meta({
    description: "弹簧刚度",
  }),

  // ===== 样式配置 =====
  /** 透明度 */
  foregroundOpacity: z.number().min(0).max(1).optional().meta({
    description: "前景透明度（0-1）",
  }),

  /** 混合模式 */
  foregroundMixBlendMode: z.enum([
    "normal", "multiply", "screen", "overlay", "darken", "lighten",
    "color-dodge", "color-burn", "hard-light", "soft-light", "difference",
    "exclusion", "hue", "saturation", "color", "luminosity"
  ]).optional().meta({
    description: "CSS 混合模式",
  }),

  /** 对象适应方式 */
  foregroundObjectFit: z.enum(["cover", "contain", "fill", "none"]).optional().meta({
    description: "对象适应方式",
  }),

  /** z-index 层级 */
  foregroundZIndex: z.number().int().optional().meta({
    description: "前景 z-index 层级",
  }),

  // ===== 视频特有配置 =====
  /** 视频是否循环 */
  foregroundVideoLoop: z.boolean().optional().meta({
    description: "视频前景是否循环播放",
  }),

  /** 视频是否静音 */
  foregroundVideoMuted: z.boolean().optional().meta({
    description: "视频前景是否静音",
  }),

  // ===== 持续动画 =====
  /** 是否启用持续动画 */
  foregroundContinuousAnimation: z.boolean().optional().meta({
    description: "是否启用持续动画（如呼吸效果）",
  }),

  /** 持续动画速度 */
  foregroundContinuousSpeed: z.number().min(0.1).max(5).optional().meta({
    description: "持续动画速度",
  }),
});

/**
 * 前景动画效果类型
 */
export type ForegroundAnimationType = z.infer<typeof ForegroundAnimationTypeSchema>;

/**
 * 前景类型
 */
export type ForegroundType = z.infer<typeof ForegroundTypeSchema>;

/**
 * 前景组件 Props（从 Schema 推导）
 */
export type ForegroundProps = z.infer<typeof ForegroundSchema>;

/**
 * 嵌套前景配置 Schema（用于组件调用）
 */
export const NestedForegroundSchema = z.object({
  /** 是否启用 */
  enabled: z.boolean().optional(),
  /** 前景类型 */
  type: ForegroundTypeSchema.optional(),
  /** 前景源文件路径 */
  source: z.string().optional(),
  /** 宽度 */
  width: z.number().int().positive().optional(),
  /** 高度 */
  height: z.number().int().positive().optional(),
  /** 垂直偏移 */
  verticalOffset: z.number().optional(),
  /** 水平偏移 */
  horizontalOffset: z.number().optional(),
  /** 缩放比例 */
  scale: z.number().min(0.1).max(3).optional(),
  /** 动画类型 */
  animationType: ForegroundAnimationTypeSchema.optional(),
  /** 动画开始帧 */
  animationStartFrame: z.number().int().min(0).optional(),
  /** 动画持续时间 */
  animationDuration: z.number().int().min(1).optional(),
  /** 动画强度系数 */
  animationIntensity: z.number().min(0).max(2).optional(),
  /** 是否使用弹簧动画 */
  useSpring: z.boolean().optional(),
  /** 弹簧阻尼 */
  springDamping: z.number().min(1).max(30).optional(),
  /** 弹簧刚度 */
  springStiffness: z.number().min(10).max(500).optional(),
  /** 透明度 */
  opacity: z.number().min(0).max(1).optional(),
  /** 混合模式 */
  mixBlendMode: z.enum([
    "normal", "multiply", "screen", "overlay", "darken", "lighten",
    "color-dodge", "color-burn", "hard-light", "soft-light", "difference",
    "exclusion", "hue", "saturation", "color", "luminosity"
  ]).optional(),
  /** 对象适应方式 */
  objectFit: z.enum(["cover", "contain", "fill", "none"]).optional(),
  /** z-index 层级 */
  zIndex: z.number().int().optional(),
  /** 视频是否循环 */
  videoLoop: z.boolean().optional(),
  /** 视频是否静音 */
  videoMuted: z.boolean().optional(),
  /** 是否启用持续动画 */
  continuousAnimation: z.boolean().optional(),
  /** 持续动画速度 */
  continuousSpeed: z.number().min(0.1).max(5).optional(),
});

export type NestedForegroundProps = z.infer<typeof NestedForegroundSchema>;

/**
 * 前景组件渲染 Props（用于组件内部使用）
 */
export interface ForegroundComponentProps {
  /** 前景类型：图片或视频 */
  type?: "image" | "video";
  /** 前景源文件路径 */
  source?: string;
  /** 宽度 */
  width?: number;
  /** 高度 */
  height?: number;
  /** 垂直偏移 */
  verticalOffset?: number;
  /** 水平偏移 */
  horizontalOffset?: number;
  /** 缩放比例 */
  scale?: number;
  /** 动画类型 */
  animationType?: ForegroundAnimationType;
  /** 动画开始帧 */
  animationStartFrame?: number;
  /** 动画持续时间 */
  animationDuration?: number;
  /** 动画强度系数 */
  animationIntensity?: number;
  /** 是否使用弹簧动画 */
  useSpring?: boolean;
  /** 弹簧阻尼 */
  springDamping?: number;
  /** 弹簧刚度 */
  springStiffness?: number;
  /** 透明度 */
  opacity?: number;
  /** 混合模式 */
  mixBlendMode?: React.CSSProperties["mixBlendMode"];
  /** 对象适应方式 */
  objectFit?: "cover" | "contain" | "fill" | "none";
  /** 是否启用 */
  enabled?: boolean;
  /** z-index 层级 */
  zIndex?: number;
  /** 视频是否循环 */
  videoLoop?: boolean;
  /** 视频是否静音 */
  videoMuted?: boolean;
  /** 是否启用持续动画 */
  continuousAnimation?: boolean;
  /** 持续动画速度 */
  continuousSpeed?: number;
}