import { z } from "zod";

/**
 * 祝福图案类型 Schema
 */
export const BlessingSymbolTypeSchema = z.enum([
  "goldCoin",     // 金币
  "moneyBag",     // 金钱袋
  "luckyBag",     // 福袋
  "redPacket",    // 红包
]);

export type BlessingSymbolType = z.infer<typeof BlessingSymbolTypeSchema>;

/**
 * 单个图案配置 Schema
 */
export const SingleSymbolConfigSchema = z.object({
  /** 图案类型 */
  type: BlessingSymbolTypeSchema,
  /** X 位置 (0-100 百分比) */
  x: z.number().min(0).max(100),
  /** Y 位置 (0-100 百分比) */
  y: z.number().min(0).max(100),
  /** 大小系数 (0.1-3) */
  scale: z.number().min(0.1).max(3).optional(),
  /** 旋转角度 */
  rotation: z.number().optional(),
  /** 透明度 (0-1) */
  opacity: z.number().min(0).max(1).optional(),
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
  /** 动画延迟（帧数） */
  animationDelay: z.number().optional(),
});

export type SingleSymbolConfig = z.infer<typeof SingleSymbolConfigSchema>;

/**
 * 批量生成配置 Schema
 */
export const BatchGenerateConfigSchema = z.object({
  /** 图案类型 */
  type: BlessingSymbolTypeSchema,
  /** 生成数量 */
  count: z.number().min(1).max(100),
  /** 随机种子 */
  seed: z.number().optional(),
  /** 最小 X 位置 */
  minX: z.number().min(0).max(100).optional(),
  /** 最大 X 位置 */
  maxX: z.number().min(0).max(100).optional(),
  /** 最小 Y 位置 */
  minY: z.number().min(0).max(100).optional(),
  /** 最大 Y 位置 */
  maxY: z.number().min(0).max(100).optional(),
  /** 最小缩放 */
  minScale: z.number().min(0.1).max(3).optional(),
  /** 最大缩放 */
  maxScale: z.number().min(0.1).max(3).optional(),
  /** 最小旋转角度 */
  minRotation: z.number().optional(),
  /** 最大旋转角度 */
  maxRotation: z.number().optional(),
  /** 透明度范围 */
  opacityRange: z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]).optional(),
  /** 主颜色 */
  primaryColors: z.union([z.string(), z.array(z.string())]).optional(),
  /** 次颜色 */
  secondaryColors: z.union([z.string(), z.array(z.string())]).optional(),
  /** 是否启用3D效果 */
  enable3D: z.boolean().optional(),
  /** 是否启用发光效果 */
  enableGlow: z.boolean().optional(),
  /** 发光强度范围 */
  glowIntensityRange: z.tuple([z.number().min(0).max(3), z.number().min(0).max(3)]).optional(),
  /** 是否启用动画 */
  animated: z.boolean().optional(),
});

export type BatchGenerateConfig = z.infer<typeof BatchGenerateConfigSchema>;

/**
 * BlessingSymbol 组件 Props Schema
 */
export const BlessingSymbolSchema = z.object({
  /** 单个图案配置数组 */
  symbols: z.array(SingleSymbolConfigSchema).optional(),
  /** 批量生成配置数组 */
  batchConfigs: z.array(BatchGenerateConfigSchema).optional(),
  /** 全局默认主颜色 */
  defaultPrimaryColor: z.string().optional(),
  /** 全局默认次颜色 */
  defaultSecondaryColor: z.string().optional(),
  /** 全局默认是否启用3D效果 */
  defaultEnable3D: z.boolean().optional(),
  /** 全局默认是否启用发光效果 */
  defaultEnableGlow: z.boolean().optional(),
  /** 全局默认发光强度 */
  defaultGlowIntensity: z.number().min(0).max(3).optional(),
  /** 全局动画速度系数 */
  animationSpeed: z.number().min(0).max(5).optional(),
});

export type BlessingSymbolProps = z.infer<typeof BlessingSymbolSchema>;

/**
 * 组件调用时的 Props（非 Schema 形式，包含默认值）
 */
export type BlessingSymbolComponentProps = BlessingSymbolProps;

/**
 * 从完整配置中提取 BlessingSymbol 相关属性
 */
export function extractBlessingSymbolProps<T extends Record<string, unknown>>(
  props: T
): { blessingSymbol: BlessingSymbolProps; rest: Omit<T, keyof BlessingSymbolProps> } {
  const {
    symbols,
    batchConfigs,
    defaultPrimaryColor,
    defaultSecondaryColor,
    defaultEnable3D,
    defaultEnableGlow,
    defaultGlowIntensity,
    animationSpeed,
    ...rest
  } = props as T & BlessingSymbolProps;

  const blessingSymbol: BlessingSymbolProps = {};

  if (symbols !== undefined) blessingSymbol.symbols = symbols;
  if (batchConfigs !== undefined) blessingSymbol.batchConfigs = batchConfigs;
  if (defaultPrimaryColor !== undefined) blessingSymbol.defaultPrimaryColor = defaultPrimaryColor;
  if (defaultSecondaryColor !== undefined) blessingSymbol.defaultSecondaryColor = defaultSecondaryColor;
  if (defaultEnable3D !== undefined) blessingSymbol.defaultEnable3D = defaultEnable3D;
  if (defaultEnableGlow !== undefined) blessingSymbol.defaultEnableGlow = defaultEnableGlow;
  if (defaultGlowIntensity !== undefined) blessingSymbol.defaultGlowIntensity = defaultGlowIntensity;
  if (animationSpeed !== undefined) blessingSymbol.animationSpeed = animationSpeed;

  return {
    blessingSymbol,
    rest: rest as Omit<T, keyof BlessingSymbolProps>,
  };
}
