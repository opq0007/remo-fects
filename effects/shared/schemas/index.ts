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

// 水印配置
export {
  WatermarkSchema,
  WatermarkEffectTypeSchema,
  type WatermarkProps,
  type WatermarkEffectType,
  type WatermarkComponentProps,
  extractWatermarkProps,
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
  type MarqueeProps,
  type MarqueeComponentProps,
  extractMarqueeProps,
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
  extractBlessingSymbolProps,
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
  extractMixedInputProps,
  extractFullMixedInputProps,
} from "./mixed-input";

// 中心发散粒子效果配置
export {
  RadialBurstEffectTypeSchema,
  RadialBurstSchema,
  type RadialBurstEffectType,
  type RadialBurstProps,
  type RadialBurstComponentProps,
  extractRadialBurstProps,
} from "./radial-burst";

// 前景配置
export {
  ForegroundAnimationTypeSchema,
  ForegroundTypeSchema,
  ForegroundSchema,
  type ForegroundAnimationType,
  type ForegroundType,
  type ForegroundProps,
  type ForegroundComponentProps,
  extractForegroundProps,
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
  extractStoryChapterProps,
  extractStoryPanelProps,
  type ChapterTransitionTypeType,
  type ChapterTransitionProps,
  type StoryPanelChapterProps,
  type BackgroundMusicProps,
  type StoryPanelProps as StoryPanelSchemaType,
  type CustomChapterInputProps,
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

// 重新导出完整背景 Schema（合并背景和遮罩）
import { z } from "zod";
import { BackgroundSchema } from "./background";
import { OverlaySchema } from "./overlay";
import { AudioSchema } from "./audio";
import { WatermarkSchema } from "./watermark";
import { MarqueeSchema } from "./marquee";
import { RadialBurstSchema } from "./radial-burst";
import { ForegroundSchema } from "./foreground";

/**
 * 完整背景 Schema（背景 + 遮罩 + 发散粒子）
 * 适用于大多数需要背景和遮罩的场景
 */
export const FullBackgroundSchema = BackgroundSchema.merge(OverlaySchema).merge(RadialBurstSchema);

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
export const FullCompositionSchema = FullBackgroundSchema.merge(AudioSchema);

/**
 * 全功能组合 Schema
 * 包含背景 + 遮罩 + 音频 + 水印 + 走马灯 + 前景的完整配置
 * 
 * 注意：使用扁平化的 AudioSchema（audioEnabled, audioSource 等），
 * 与 BaseComposition 组件接口保持一致。
 * 
 * 使用方式：
 * ```typescript
 * export const MySchema = CompleteCompositionSchema.extend({
 *   // 项目特有参数
 * });
 * ```
 */
export const CompleteCompositionSchema = FullBackgroundSchema
  .merge(AudioSchema)
  .merge(WatermarkSchema)
  .merge(MarqueeSchema)
  .merge(ForegroundSchema);