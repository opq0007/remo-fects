/**
 * Shared Schemas Index
 * 
 * 导出所有公共 Schema 定义，供各特效项目复用
 */

// 背景相关
export {
  BackgroundSchema,
  BackgroundTypeSchema,
  NestedBackgroundSchema,
  type BackgroundProps,
  type BackgroundType,
  type NestedBackgroundProps,
} from "./background";

// 背景组件 Props（用于组件调用）
export type { BackgroundComponentProps } from "./background";

// 遮罩效果
export { 
  OverlaySchema, 
  NestedOverlaySchema,
  type OverlayProps, 
  type NestedOverlayProps,
} from "./overlay";

// 遮罩组件 Props
export type { OverlayComponentProps } from "./overlay";

// 音频配置
export {
  AudioSchema,
  NestedAudioSchema,
  type AudioProps,
  type NestedAudioProps,
} from "./audio";

// 水印配置
export {
  WatermarkSchema,
  WatermarkEffectTypeSchema,
  NestedWatermarkSchema,
  type WatermarkProps,
  type WatermarkEffectType,
  type WatermarkComponentProps,
  type NestedWatermarkProps,
} from "./watermark";

// 走马灯配置
export {
  MarqueeSchema,
  MarqueeOrientationSchema,
  MarqueeDirectionSchema,
  MarqueeLayerConfigSchema,
  MarqueeTextItemSchema,
  MarqueeImageItemSchema,
  MarqueeTextStyleSchema,
  NestedMarqueeSchema,
  type MarqueeProps,
  type MarqueeComponentProps,
  type NestedMarqueeProps,
} from "./marquee";

// 通用配置
export {
  BaseVideoSchema,
  GlowEffectSchema,
  BaseCompositionPropsSchema,
  type BaseCompositionProps,
} from "./common";

// 祝福图案配置
export {
  BlessingSymbolTypeSchema,
  SingleSymbolConfigSchema,
  BatchGenerateConfigSchema,
  BlessingSymbolSchema,
  type BlessingSymbolType,
  type SingleSymbolConfig,
  type BatchGenerateConfig,
  type BlessingSymbolProps,
  type BlessingSymbolComponentProps,
} from "./blessing-symbol";

// 混合输入配置
export {
  MixedContentTypeSchema,
  MixedItemTypeSchema,
  BlessingStyleSchema,
  MixedTextStyleSchema,
  MixedImageStyleSchema,
  MixedInputSchema,
  FullMixedInputSchema,
  type MixedContentType,
  type MixedItemType,
  type BlessingStyle,
  type MixedTextStyle,
  type MixedImageStyle,
  type MixedInputProps,
  type FullMixedInputProps,
} from "./mixed-input";

// 中心发散粒子效果配置
export {
  RadialBurstEffectTypeSchema,
  RadialBurstSchema,
  NestedRadialBurstSchema,
  type RadialBurstEffectType,
  type RadialBurstProps,
  type RadialBurstComponentProps,
  type NestedRadialBurstProps,
} from "./radial-burst";

// 前景配置
export {
  ForegroundAnimationTypeSchema,
  ForegroundTypeSchema,
  ForegroundSchema,
  NestedForegroundSchema,
  type ForegroundAnimationType,
  type ForegroundType,
  type ForegroundProps,
  type ForegroundComponentProps,
  type NestedForegroundProps,
} from "./foreground";

// ==================== 故事系统 Schema ====================

// 字幕相关
export {
  SubtitlePositionSchema,
  SubtitleAnimationTypeSchema,
  SubtitleItemSchema,
  SubtitleListSchema,
  type SubtitlePosition,
  type SubtitleAnimationType,
  type SubtitleItemProps,
} from "./story";

// 角色相关
export {
  CharacterSeriesSchema,
  ZodiacTypeSchema,
  PetTypeSchema,
  HeroTypeSchema,
  CharacterExpressionSchema,
  CharacterPositionSchema,
  StoryCharacterConfigSchema,
  type CharacterSeriesType,
  type ZodiacTypeSchemaType,
  type PetTypeSchemaType,
  type HeroTypeSchemaType,
  type CharacterExpressionType,
  type CharacterPositionType,
  type StoryCharacterConfigProps,
} from "./story";

// 彩带效果
export {
  ConfettiLevelSchema,
  StoryConfettiConfigSchema,
  type ConfettiLevelType,
  type StoryConfettiConfigProps,
} from "./story";

// 魔法效果
export {
  StoryMagicParticlesConfigSchema,
  StoryMagicWandConfigSchema,
  StoryMagicCircleConfigSchema,
  StoryFireworkConfigSchema,
  StoryBalloonBurstConfigSchema,
  StoryWhiteFlashConfigSchema,
  StoryShootingStarConfigSchema,
  StoryMagicEffectsConfigSchema,
  type StoryMagicParticlesConfigProps,
  type StoryMagicWandConfigProps,
  type StoryMagicCircleConfigProps,
  type StoryFireworkConfigProps,
  type StoryBalloonBurstConfigProps,
  type StoryWhiteFlashConfigProps,
  type StoryShootingStarConfigProps,
  type StoryMagicEffectsConfigProps,
} from "./story";

// 故事章节
export {
  StoryChapterSchema,
  type StoryChapterSchemaType,
} from "./story";

// 故事面板
export {
  ChapterTransitionTypeSchema,
  ChapterTransitionSchema,
  StoryPanelChapterSchema,
  BackgroundMusicSchema,
  StoryPanelSchema,
  CustomChapterInputSchema,
  type ChapterTransitionTypeType,
  type ChapterTransitionProps,
  type StoryPanelChapterProps,
  type BackgroundMusicProps,
  type StoryPanelProps as StoryPanelSchemaType,
  type CustomChapterInputProps,
} from "./story";

// 照片展示配置
export {
  PhotoAnimationTypeSchema,
  PhotoFrameTypeSchema,
  PhotoDisplaySchema,
  type PhotoAnimationType,
  type PhotoFrameType,
  type PhotoDisplayProps,
} from "./story";

// PlusEffects 特效扩展
export {
  EffectTypeSchema,
  PlusEffectItemSchema,
  PlusEffectsSchema,
  type EffectType,
  type PlusEffectItemProps,
  type PlusEffectsProps,
} from "./story";

// 倒计时配置
export {
  CountdownTypeSchema,
  CountdownEffectTypeSchema,
  CountdownTextStyleSchema,
  CountdownAudioConfigSchema,
  CountdownFinalTextSchema,
  CountdownSchema,
  StoryCountdownConfigSchema,
  type CountdownType,
  type CountdownEffectType,
  type CountdownTextStyleProps,
  type CountdownAudioConfigProps,
  type CountdownFinalTextProps,
  type CountdownSchemaType,
  type StoryCountdownConfigProps,
} from "./story";

// ==================== 嵌套结构 Schema ====================

import { z } from "zod";
import { NestedBackgroundSchema } from "./background";
import { NestedOverlaySchema } from "./overlay";
import { NestedAudioSchema } from "./audio";
import { NestedWatermarkSchema } from "./watermark";
import { NestedMarqueeSchema } from "./marquee";
import { NestedRadialBurstSchema } from "./radial-burst";
import { NestedForegroundSchema } from "./foreground";

/**
 * 基础组合 Schema（嵌套结构）
 * 包含背景 + 遮罩的基础配置
 * 
 * 使用方式：
 * ```typescript
 * export const MySchema = BaseCompositionSchema.extend({
 *   // 项目特有参数
 * });
 * ```
 */
export const BaseCompositionSchema = z.object({
  background: NestedBackgroundSchema.optional(),
  overlay: NestedOverlaySchema.optional(),
  radialBurst: NestedRadialBurstSchema.optional(),
});

/**
 * 完整组合 Schema（嵌套结构）
 * 包含背景 + 遮罩 + 音频 + 水印 + 走马灯 + 前景的完整配置
 * 
 * 使用方式：
 * ```typescript
 * export const MySchema = CompleteCompositionSchema.extend({
 *   // 项目特有参数
 * });
 * ```
 */
export const CompleteCompositionSchema = z.object({
  background: NestedBackgroundSchema.optional(),
  overlay: NestedOverlaySchema.optional(),
  audio: NestedAudioSchema.optional(),
  watermark: NestedWatermarkSchema.optional(),
  marquee: NestedMarqueeSchema.optional(),
  radialBurst: NestedRadialBurstSchema.optional(),
  foreground: NestedForegroundSchema.optional(),
});

/**
 * 完整背景 Schema（背景 + 遮罩 + 发散粒子）
 * 适用于大多数需要背景和遮罩的场景
 * @deprecated 请使用 BaseCompositionSchema
 */
export const FullBackgroundSchema = BaseCompositionSchema;

/**
 * 全功能组合 Schema
 * @deprecated 请使用 CompleteCompositionSchema
 */
export const FullCompositionSchema = CompleteCompositionSchema;