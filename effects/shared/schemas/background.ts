import { z } from "zod";
import { zColor } from "@remotion/zod-types";

/**
 * 背景类型枚举
 */
export const BackgroundTypeSchema = z.enum(["image", "video", "color", "gradient"]);
export type BackgroundType = z.infer<typeof BackgroundTypeSchema>;

/**
 * 背景配置 Schema
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