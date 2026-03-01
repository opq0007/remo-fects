import { z } from "zod";

// 从 types 导入类型定义，避免重复定义
export type { MixedContentType, MixedItemType } from "../types/mixed-input";

/**
 * 混合输入内容类型 Schema
 */
export const MixedContentTypeSchema = z.enum(["text", "image", "blessing", "mixed"]);

/**
 * 混合输入项目类型 Schema
 */
export const MixedItemTypeSchema = z.enum(["text", "image", "blessing"]);

/**
 * 祝福图案样式 Schema
 */
export const BlessingStyleSchema = z.object({
  /** 主颜色 */
  primaryColor: z.string().optional(),
  /** 次颜色 */
  secondaryColor: z.string().optional(),
  /** 是否启用3D效果 */
  enable3D: z.boolean().optional(),
  /** 是否启用发光效果 */
  enableGlow: z.boolean().optional(),
  /** 发光强度 */
  glowIntensity: z.number().min(0).max(3).optional(),
  /** 是否启用动画 */
  animated: z.boolean().optional(),
  /** 动画速度 */
  animationSpeed: z.number().min(0).max(5).optional(),
});

export type BlessingStyle = z.infer<typeof BlessingStyleSchema>;

/**
 * 混合输入文字样式 Schema
 */
export const MixedTextStyleSchema = z.object({
  /** 文字颜色 */
  color: z.string().optional(),
  /** 文字特效类型 */
  effect: z.enum(["none", "shadow", "gold3d", "emboss", "neon", "glow", "outline"]).optional(),
  /** 特效强度 */
  effectIntensity: z.number().min(0).max(2).optional(),
  /** 字重 */
  fontWeight: z.number().min(100).max(900).optional(),
  /** 字体 */
  fontFamily: z.string().optional(),
});

export type MixedTextStyle = z.infer<typeof MixedTextStyleSchema>;

/**
 * 混合输入图片样式 Schema
 */
export const MixedImageStyleSchema = z.object({
  /** 是否发光 */
  glow: z.boolean().optional(),
  /** 发光颜色 */
  glowColor: z.string().optional(),
  /** 发光强度 */
  glowIntensity: z.number().min(0).max(2).optional(),
  /** 是否阴影 */
  shadow: z.boolean().optional(),
  /** 阴影颜色 */
  shadowColor: z.string().optional(),
  /** 阴影模糊 */
  shadowBlur: z.number().min(0).max(50).optional(),
  /** 是否摇摆 */
  swing: z.boolean().optional(),
  /** 摇摆角度 */
  swingAngle: z.number().min(0).max(45).optional(),
  /** 摇摆速度 */
  swingSpeed: z.number().min(0).max(10).optional(),
  /** 是否旋转 */
  spin: z.boolean().optional(),
  /** 旋转速度 */
  spinSpeed: z.number().min(0).max(5).optional(),
});

export type MixedImageStyle = z.infer<typeof MixedImageStyleSchema>;

/**
 * 混合输入配置 Schema
 * 
 * 包含文字、图片、祝福图案的混合输入能力
 */
export const MixedInputSchema = z.object({
  /** 内容类型 */
  contentType: MixedContentTypeSchema.optional().default("text"),
  /** 文字列表 */
  words: z.array(z.string()).optional().default([]),
  /** 图片路径列表（支持：public目录相对路径、网络URL、Data URL） */
  images: z.array(z.string()).optional().default([]),
  /** 祝福图案类型列表 */
  blessingTypes: z.array(z.enum(["goldCoin", "moneyBag", "luckyBag", "redPacket"])).optional().default([]),
  /** 图片出现权重（0-1，mixed 模式下有效） */
  imageWeight: z.number().min(0).max(1).optional().default(0.5),
  /** 祝福图案样式 */
  blessingStyle: BlessingStyleSchema.optional(),
});

export type MixedInputProps = z.infer<typeof MixedInputSchema>;

/**
 * 完整混合输入配置 Schema（包含样式）
 */
export const FullMixedInputSchema = MixedInputSchema.extend({
  /** 文字样式 */
  textStyle: MixedTextStyleSchema.optional(),
  /** 图片样式 */
  imageStyle: MixedImageStyleSchema.optional(),
  /** 字体大小范围 */
  fontSizeRange: z.tuple([z.number(), z.number()]).optional(),
  /** 图片大小范围 */
  imageSizeRange: z.tuple([z.number(), z.number()]).optional(),
  /** 祝福图案大小范围 */
  blessingSizeRange: z.tuple([z.number(), z.number()]).optional(),
});

export type FullMixedInputProps = z.infer<typeof FullMixedInputSchema>;

/**
 * 从完整配置中提取混合输入相关属性
 */
export function extractMixedInputProps<T extends Record<string, unknown>>(
  props: T
): { mixedInput: MixedInputProps; rest: Omit<T, keyof MixedInputProps> } {
  const {
    contentType,
    words,
    images,
    blessingTypes,
    imageWeight,
    blessingStyle,
    ...rest
  } = props as T & MixedInputProps;

  const mixedInput: MixedInputProps = {
    contentType: contentType ?? "text",
    words: words ?? [],
    images: images ?? [],
    blessingTypes: blessingTypes ?? [],
    imageWeight: imageWeight ?? 0.5,
  };

  if (blessingStyle !== undefined) mixedInput.blessingStyle = blessingStyle;

  return {
    mixedInput,
    rest: rest as Omit<T, keyof MixedInputProps>,
  };
}

/**
 * 从完整配置中提取完整混合输入属性（包含样式）
 */
export function extractFullMixedInputProps<T extends Record<string, unknown>>(
  props: T
): { mixedInput: FullMixedInputProps; rest: Omit<T, keyof FullMixedInputProps> } {
  const {
    contentType,
    words,
    images,
    blessingTypes,
    imageWeight,
    blessingStyle,
    textStyle,
    imageStyle,
    fontSizeRange,
    imageSizeRange,
    blessingSizeRange,
    ...rest
  } = props as T & FullMixedInputProps;

  const mixedInput: FullMixedInputProps = {
    contentType: contentType ?? "text",
    words: words ?? [],
    images: images ?? [],
    blessingTypes: blessingTypes ?? [],
    imageWeight: imageWeight ?? 0.5,
  };

  if (blessingStyle !== undefined) mixedInput.blessingStyle = blessingStyle;
  if (textStyle !== undefined) mixedInput.textStyle = textStyle;
  if (imageStyle !== undefined) mixedInput.imageStyle = imageStyle;
  if (fontSizeRange !== undefined) mixedInput.fontSizeRange = fontSizeRange;
  if (imageSizeRange !== undefined) mixedInput.imageSizeRange = imageSizeRange;
  if (blessingSizeRange !== undefined) mixedInput.blessingSizeRange = blessingSizeRange;

  return {
    mixedInput,
    rest: rest as Omit<T, keyof FullMixedInputProps>,
  };
}
