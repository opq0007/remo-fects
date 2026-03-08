import { z } from "zod";
import { zColor } from "@remotion/zod-types";

/**
 * 发散效果类型 Schema
 */
export const RadialBurstEffectTypeSchema = z.enum([
  "buddhaLight",      // 佛光普照：多层光环向外扩散
  "goldenRays",       // 金色光线：从中心发射的光束
  "meteorShower",     // 放射性流星雨：粒子从中心向外飞散
  "sparkleBurst",     // 闪光爆发：闪烁的粒子爆发
]);
export type RadialBurstEffectType = z.infer<typeof RadialBurstEffectTypeSchema>;

/**
 * 中心发散粒子效果配置 Schema（扁平结构）
 */
export const RadialBurstSchema = z.object({
  /** 是否启用效果 */
  radialBurstEnabled: z.boolean().optional(),
  
  /** 效果类型 */
  radialBurstEffectType: RadialBurstEffectTypeSchema.optional(),
  
  /** 主颜色 */
  radialBurstColor: zColor().optional(),
  
  /** 次颜色（用于渐变或多色效果） */
  radialBurstSecondaryColor: zColor().optional(),
  
  /** 效果强度 (0-2) */
  radialBurstIntensity: z.number().min(0).max(2).optional(),
  
  /** 垂直偏移 (0=顶部, 0.5=居中, 1=底部) */
  radialBurstVerticalOffset: z.number().min(0).max(1).optional(),
  
  /** 粒子/光线数量 */
  radialBurstCount: z.number().min(1).max(100).optional(),
  
  /** 动画速度系数 */
  radialBurstSpeed: z.number().min(0.1).max(5).optional(),
  
  /** 整体透明度 (0-1) */
  radialBurstOpacity: z.number().min(0).max(1).optional(),
  
  /** 随机种子 */
  radialBurstSeed: z.number().optional(),
  
  /** 是否旋转 */
  radialBurstRotate: z.boolean().optional(),
  
  /** 旋转速度 */
  radialBurstRotationSpeed: z.number().min(0).max(10).optional(),
});

export type RadialBurstProps = z.infer<typeof RadialBurstSchema>;

/**
 * 嵌套发散粒子效果配置 Schema（用于组件调用）
 */
export const NestedRadialBurstSchema = z.object({
  /** 是否启用 */
  enabled: z.boolean().optional(),
  /** 效果类型 */
  effectType: RadialBurstEffectTypeSchema.optional(),
  /** 主颜色 */
  color: zColor().optional(),
  /** 次颜色 */
  secondaryColor: zColor().optional(),
  /** 效果强度 */
  intensity: z.number().min(0).max(2).optional(),
  /** 垂直偏移 */
  verticalOffset: z.number().min(0).max(1).optional(),
  /** 粒子/光线数量 */
  count: z.number().min(1).max(100).optional(),
  /** 动画速度系数 */
  speed: z.number().min(0.1).max(5).optional(),
  /** 整体透明度 */
  opacity: z.number().min(0).max(1).optional(),
  /** 随机种子 */
  seed: z.number().optional(),
  /** 是否旋转 */
  rotate: z.boolean().optional(),
  /** 旋转速度 */
  rotationSpeed: z.number().min(0).max(10).optional(),
});

export type NestedRadialBurstProps = z.infer<typeof NestedRadialBurstSchema>;

/**
 * RadialBurst 组件 Props（用于组件调用）
 */
export interface RadialBurstComponentProps {
  enabled?: boolean;
  effectType?: RadialBurstEffectType;
  color?: string;
  secondaryColor?: string;
  intensity?: number;
  verticalOffset?: number;
  count?: number;
  speed?: number;
  opacity?: number;
  seed?: number;
  rotate?: boolean;
  rotationSpeed?: number;
}