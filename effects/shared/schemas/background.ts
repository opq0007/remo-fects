import { z } from "zod";
import { zColor } from "@remotion/zod-types";

/**
 * 背景类型枚举
 */
export const BackgroundTypeSchema = z.enum(["image", "video", "color", "gradient"]);
export type BackgroundType = z.infer<typeof BackgroundTypeSchema>;

/**
 * 背景配置 Schema（扁平化结构 - 用于 API 参数）
 * 支持图片、视频、纯色、渐变四种背景类型
 * 
 * 所有属性都是可选的，组件内部会提供默认值
 */
export const BackgroundSchema = z.object({
  backgroundType: BackgroundTypeSchema.optional(),
  backgroundSource: z.string().optional(),
  backgroundColor: zColor().optional(),
  backgroundGradient: z.string().optional(),
  backgroundVideoLoop: z.boolean().optional(),
  backgroundVideoMuted: z.boolean().optional(),
});

export type BackgroundProps = z.infer<typeof BackgroundSchema>;

/**
 * 嵌套背景配置 Schema（用于组件调用）
 * 将背景相关参数聚合为嵌套对象
 */
export const NestedBackgroundSchema = z.object({
  /** 背景类型 */
  type: BackgroundTypeSchema.optional(),
  /** 背景源（图片/视频路径） */
  source: z.string().optional(),
  /** 背景颜色 */
  color: zColor().optional(),
  /** 背景渐变 */
  gradient: z.string().optional(),
  /** 视频是否循环 */
  videoLoop: z.boolean().optional(),
  /** 视频是否静音 */
  videoMuted: z.boolean().optional(),
});

export type NestedBackgroundProps = z.infer<typeof NestedBackgroundSchema>;

/**
 * 背景组件 Props（用于组件调用）
 */
export interface BackgroundComponentProps {
  type: BackgroundType;
  source?: string;
  color?: string;
  gradient?: string;
  videoLoop?: boolean;
  videoMuted?: boolean;
}

/**
 * 从扁平化 Props 提取嵌套背景配置
 */
export function extractBackgroundProps(props: BackgroundProps): NestedBackgroundProps {
  return {
    type: props.backgroundType,
    source: props.backgroundSource,
    color: props.backgroundColor,
    gradient: props.backgroundGradient,
    videoLoop: props.backgroundVideoLoop,
    videoMuted: props.backgroundVideoMuted,
  };
}
