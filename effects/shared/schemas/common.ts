import { z } from "zod";

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