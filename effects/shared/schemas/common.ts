import { z } from "zod";
import { BackgroundSchema } from "./background";
import { OverlaySchema } from "./overlay";
import { AudioSchema } from "./audio";

/**
 * 基础视频参数 Schema
 * 包含帧率、时长、宽高等基础配置
 */
export const BaseVideoSchema = z.object({
  fps: z.number().min(1).max(120).optional(),
  duration: z.number().min(1).optional(),
  width: z.number().min(100).optional(),
  height: z.number().min(100).optional(),
});

/**
 * 发光效果 Schema
 */
export const GlowEffectSchema = z.object({
  glowColor: z.string().optional(),
  glowIntensity: z.number().min(0).max(3).optional(),
});

/**
 * 基础组合 Props
 * 包含背景、遮罩、音频的完整配置
 * 用于 BaseComposition 组件和各特效组合组件的基础类型
 */
export type BaseCompositionProps = z.infer<typeof BaseCompositionPropsSchema>;

/**
 * 基础组合 Schema
 * 包含背景 + 遮罩 + 音频的完整配置
 */
export const BaseCompositionPropsSchema = BackgroundSchema.merge(OverlaySchema).merge(AudioSchema);