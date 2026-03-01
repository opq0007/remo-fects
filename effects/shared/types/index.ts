/**
 * 类型定义导出
 */

export type {
  RelativePosition,
  Size,
  ColorConfig,
  BaseTextStyle,
  GlowConfig,
  ShadowConfig,
  AnimationTiming,
  Perspective3D,
  ParticleConfig,
} from "./common";

// 混合输入类型（排除已从 schemas 导出的 MixedContentType 和 MixedItemType）
// 注意：MixedContentType 和 MixedItemType 已从 schemas 导出，这里不再重复导出
export type {
  BlessingStyleConfig,
  MixedTextStyleConfig,
  MixedImageStyleConfig,
  MixedInputConfig,
  MixedInputItem,
  MixedInputGenerateOptions,
  AvailableContent,
  ContentTypeResult,
} from "./mixed-input";
