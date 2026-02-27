import { z } from "zod";
import { zColor } from "@remotion/zod-types";

/**
 * 文字样式 Schema
 */
export const MarqueeTextStyleSchema = z.object({
  color: zColor().optional().meta({ description: "字体颜色" }),
  fontFamily: z.string().optional().meta({ description: "字体族" }),
  fontWeight: z.union([z.number(), z.string()]).optional().meta({ description: "字体粗细" }),
  letterSpacing: z.number().optional().meta({ description: "字间距" }),
  effect: z.enum(["none", "shadow", "glow", "outline", "3d", "gold3d", "neon"]).optional().meta({ description: "文字特效类型" }),
  effectIntensity: z.number().min(0).max(2).optional().meta({ description: "特效强度" }),
  glowColor: zColor().optional().meta({ description: "发光/阴影颜色" }),
  strokeColor: zColor().optional().meta({ description: "描边颜色" }),
  strokeWidth: z.number().optional().meta({ description: "描边宽度" }),
});

/**
 * 单个文字项 Schema
 */
export const MarqueeTextItemSchema = z.object({
  text: z.string().meta({ description: "文字内容" }),
  style: MarqueeTextStyleSchema.optional().meta({ description: "单独的样式" }),
});

/**
 * 单个图片项 Schema
 */
export const MarqueeImageItemSchema = z.object({
  src: z.string().meta({ description: "图片路径（相对于 public 目录）" }),
  width: z.number().optional().meta({ description: "图片宽度" }),
  height: z.number().optional().meta({ description: "图片高度" }),
  opacity: z.number().min(0).max(1).optional().meta({ description: "单独的透明度" }),
});

/**
 * 层级配置 Schema
 */
export const MarqueeLayerConfigSchema = z.object({
  texts: z.array(MarqueeTextItemSchema).optional().meta({ description: "文字项数组" }),
  images: z.array(MarqueeImageItemSchema).optional().meta({ description: "图片项数组" }),
  fontSize: z.number().min(8).max(200).optional().meta({ description: "基础字体大小" }),
  opacity: z.number().min(0).max(1).optional().meta({ description: "基础透明度" }),
  spacing: z.number().min(0).max(500).optional().meta({ description: "文字间距（像素）" }),
  textStyle: MarqueeTextStyleSchema.optional().meta({ description: "默认文字样式" }),
  name: z.string().optional().meta({ description: "层级名称" }),
});

/**
 * 排列方向 Schema
 */
export const MarqueeOrientationSchema = z.enum(["horizontal", "vertical"]);

/**
 * 运动方向 Schema
 */
export const MarqueeDirectionSchema = z.enum([
  "left-to-right",
  "right-to-left",
  "top-to-bottom",
  "bottom-to-top",
]);

/**
 * 走马灯完整 Schema（用于 API 参数）
 */
export const MarqueeSchema = z.object({
  // 启用状态
  marqueeEnabled: z.boolean().optional().meta({ description: "是否启用走马灯" }),
  
  // 前景层配置
  marqueeForegroundTexts: z.array(z.string()).optional().meta({ description: "前景文字列表（简化配置）" }),
  marqueeForegroundImages: z.array(z.string()).optional().meta({ description: "前景图片列表（简化配置）" }),
  marqueeForegroundFontSize: z.number().min(8).max(200).optional().meta({ description: "前景字体大小" }),
  marqueeForegroundOpacity: z.number().min(0).max(1).optional().meta({ description: "前景透明度" }),
  marqueeForegroundColor: zColor().optional().meta({ description: "前景字体颜色" }),
  marqueeForegroundEffect: MarqueeTextStyleSchema.shape.effect.unwrap().optional().meta({ description: "前景文字特效" }),
  
  // 后景层配置
  marqueeBackgroundTexts: z.array(z.string()).optional().meta({ description: "后景文字列表（简化配置）" }),
  marqueeBackgroundImages: z.array(z.string()).optional().meta({ description: "后景图片列表（简化配置）" }),
  marqueeBackgroundFontSize: z.number().min(8).max(200).optional().meta({ description: "后景字体大小" }),
  marqueeBackgroundOpacity: z.number().min(0).max(1).optional().meta({ description: "后景透明度" }),
  marqueeBackgroundColor: zColor().optional().meta({ description: "后景字体颜色" }),
  marqueeBackgroundEffect: MarqueeTextStyleSchema.shape.effect.unwrap().optional().meta({ description: "后景文字特效" }),
  
  // 布局配置
  marqueeOrientation: MarqueeOrientationSchema.optional().meta({ description: "排列方向" }),
  marqueeDirection: MarqueeDirectionSchema.optional().meta({ description: "运动方向" }),
  marqueeSpeed: z.number().min(10).max(500).optional().meta({ description: "移动速度（像素/秒）" }),
  marqueeSpacing: z.number().min(0).max(500).optional().meta({ description: "文字间距" }),
  
  // 视觉效果
  marqueePerspectiveDepth: z.number().min(0).max(300).optional().meta({ description: "3D透视深度" }),
  marqueeForegroundOffsetY: z.number().optional().meta({ description: "前景层 Y 偏移" }),
  marqueeBackgroundOffsetY: z.number().optional().meta({ description: "后景层 Y 偏移" }),
  
  // 其他配置
  marqueeZIndex: z.number().optional().meta({ description: "z-index 层级" }),
});

export type MarqueeProps = z.infer<typeof MarqueeSchema>;

/**
 * 走马灯组件 Props（用于组件调用）
 */
export interface MarqueeComponentProps {
  enabled?: boolean;
  foreground?: {
    texts?: Array<{ text: string; style?: any }>;
    images?: Array<{ src: string; width?: number; height?: number; opacity?: number }>;
    fontSize?: number;
    opacity?: number;
    spacing?: number;
    textStyle?: any;
  };
  background?: {
    texts?: Array<{ text: string; style?: any }>;
    images?: Array<{ src: string; width?: number; height?: number; opacity?: number }>;
    fontSize?: number;
    opacity?: number;
    spacing?: number;
    textStyle?: any;
  };
  orientation?: "horizontal" | "vertical";
  direction?: "left-to-right" | "right-to-left" | "top-to-bottom" | "bottom-to-top";
  speed?: number;
  perspectiveDepth?: number;
  foregroundOffsetY?: number;
  backgroundOffsetY?: number;
  zIndex?: number;
}

/**
 * 从 Schema Props 提取组件 Props
 */
export function extractMarqueeProps(props: MarqueeProps): MarqueeComponentProps | undefined {
  if (!props.marqueeEnabled) return undefined;
  
  const result: MarqueeComponentProps = {
    enabled: props.marqueeEnabled,
    orientation: props.marqueeOrientation,
    direction: props.marqueeDirection,
    speed: props.marqueeSpeed,
    perspectiveDepth: props.marqueePerspectiveDepth,
    foregroundOffsetY: props.marqueeForegroundOffsetY,
    backgroundOffsetY: props.marqueeBackgroundOffsetY,
    zIndex: props.marqueeZIndex,
  };

  // 构建前景层
  if (props.marqueeForegroundTexts?.length || props.marqueeForegroundImages?.length) {
    result.foreground = {
      texts: props.marqueeForegroundTexts?.map(text => ({ text })) || [],
      images: props.marqueeForegroundImages?.map(src => ({ src })) || [],
      fontSize: props.marqueeForegroundFontSize,
      opacity: props.marqueeForegroundOpacity,
      spacing: props.marqueeSpacing,
      textStyle: {
        color: props.marqueeForegroundColor,
        effect: props.marqueeForegroundEffect,
      },
    };
  }

  // 构建后景层
  if (props.marqueeBackgroundTexts?.length || props.marqueeBackgroundImages?.length) {
    result.background = {
      texts: props.marqueeBackgroundTexts?.map(text => ({ text })) || [],
      images: props.marqueeBackgroundImages?.map(src => ({ src })) || [],
      fontSize: props.marqueeBackgroundFontSize,
      opacity: props.marqueeBackgroundOpacity,
      spacing: props.marqueeSpacing,
      textStyle: {
        color: props.marqueeBackgroundColor,
        effect: props.marqueeBackgroundEffect,
      },
    };
  }

  return result;
}
