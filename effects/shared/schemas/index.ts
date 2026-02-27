/**
 * Shared Schemas Index
 * 
 * 导出所有公共 Schema 定义，供各特效项目复用
 */

// 背景相关
export {
  BackgroundSchema,
  BackgroundTypeSchema,
  type BackgroundProps,
  type BackgroundType,
} from "./background";

// 背景组件 Props（用于组件调用）
export type { BackgroundComponentProps } from "./background";

// 遮罩效果
export { OverlaySchema, type OverlayProps } from "./overlay";

// 遮罩组件 Props
export type { OverlayComponentProps } from "./overlay";

// 音频配置
export {
  AudioSchema,
  NestedAudioSchema,
  type AudioProps,
  type NestedAudioProps,
} from "./audio";

// 通用配置
export { BaseVideoSchema, GlowEffectSchema } from "./common";

// 重新导出完整背景 Schema（合并背景和遮罩）
import { z } from "zod";
import { BackgroundSchema } from "./background";
import { OverlaySchema } from "./overlay";

/**
 * 完整背景 Schema（背景 + 遮罩）
 * 适用于大多数需要背景和遮罩的场景
 */
export const FullBackgroundSchema = BackgroundSchema.merge(OverlaySchema);

/**
 * 基础组合 Schema
 * 包含背景 + 遮罩的基础配置
 * 
 * 使用方式：
 * ```typescript
 * export const MySchema = BaseCompositionSchema.extend({
 *   // 项目特有参数
 * });
 * ```
 */
export const BaseCompositionSchema = FullBackgroundSchema;

/**
 * 完整组合 Schema
 * 包含背景 + 遮罩 + 音频的完整配置
 * 
 * 使用方式：
 * ```typescript
 * export const MySchema = FullCompositionSchema.extend({
 *   // 项目特有参数
 * });
 * ```
 */
import { AudioSchema } from "./audio";
export const FullCompositionSchema = FullBackgroundSchema.merge(AudioSchema);
