import { z } from "zod";
import { zColor } from "@remotion/zod-types";

/**
 * 水印动态效果类型 Schema
 * 仅保留 bounce（碰撞反弹）效果
 */
export const WatermarkEffectTypeSchema = z.enum([
  "bounce",      // 碰撞反弹
]);

export type WatermarkEffectType = z.infer<typeof WatermarkEffectTypeSchema>;

/**
 * 水印配置 Schema
 */
export const WatermarkSchema = z.object({
  // 启用状态
  watermarkEnabled: z.boolean().optional().meta({ description: "是否启用水印" }),
  
  // 基础配置
  watermarkText: z.string().optional().meta({ description: "水印文字" }),
  
  // 样式配置
  watermarkFontSize: z.number().min(8).max(200).optional().meta({ description: "水印字体大小" }),
  watermarkColor: zColor().optional().meta({ description: "水印颜色" }),
  watermarkOpacity: z.number().min(0).max(1).optional().meta({ description: "水印透明度" }),
  
  // 动态效果配置
  watermarkEffect: WatermarkEffectTypeSchema.optional().meta({ description: "水印动态效果类型" }),
  watermarkSpeed: z.number().min(0.1).max(5).optional().meta({ description: "水印动画速度" }),
  watermarkIntensity: z.number().min(0).max(1).optional().meta({ description: "水印效果强度" }),
  
  // 碰撞反弹配置
  watermarkVelocityX: z.number().optional().meta({ description: "X 方向速度（像素/秒）" }),
  watermarkVelocityY: z.number().optional().meta({ description: "Y 方向速度（像素/秒）" }),
});

export type WatermarkProps = z.infer<typeof WatermarkSchema>;

/**
 * 水印组件 Props（用于组件调用）
 */
export interface WatermarkComponentProps {
  enabled?: boolean;
  text?: string;
  fontSize?: number;
  color?: string;
  opacity?: number;
  effect?: WatermarkEffectType;
  speed?: number;
  intensity?: number;
  velocityX?: number;
  velocityY?: number;
}

/**
 * 从 Schema Props 提取组件 Props
 */
export function extractWatermarkProps(props: WatermarkProps): WatermarkComponentProps {
  return {
    enabled: props.watermarkEnabled,
    text: props.watermarkText,
    fontSize: props.watermarkFontSize,
    color: props.watermarkColor,
    opacity: props.watermarkOpacity,
    effect: props.watermarkEffect,
    speed: props.watermarkSpeed,
    intensity: props.watermarkIntensity,
    velocityX: props.watermarkVelocityX,
    velocityY: props.watermarkVelocityY,
  };
}