/**
 * 混合输入工具函数
 * 
 * 提供混合输入的检测、判断和生成工具函数
 */

import { random } from "remotion";
import {
  MixedContentType,
  MixedItemType,
  BlessingStyleConfig,
  MixedInputConfig,
  MixedInputItem,
  MixedInputGenerateOptions,
  AvailableContent,
  ContentTypeResult,
} from "../types/mixed-input";
import { BlessingSymbolType } from "../schemas";
import { TextStyleConfig } from "./textStyle";

/**
 * 默认祝福图案类型列表
 */
export const DEFAULT_BLESSING_TYPES: BlessingSymbolType[] = [
  "goldCoin",
  "moneyBag",
  "luckyBag",
  "redPacket",
];

/**
 * 默认祝福图案样式
 */
export const DEFAULT_BLESSING_STYLE: BlessingStyleConfig = {
  primaryColor: "#FFD700",
  secondaryColor: "#FFA500",
  enable3D: true,
  enableGlow: true,
  glowIntensity: 1,
  animated: false,
};

/**
 * 检测可用内容
 * 
 * @param config 混合输入配置
 * @returns 可用内容检测结果
 */
export function detectAvailableContent(config: MixedInputConfig): AvailableContent {
  const hasText = (config.words?.length ?? 0) > 0;
  const hasImages = (config.images?.length ?? 0) > 0;
  const hasBlessing = (config.blessingTypes?.length ?? 0) > 0;

  const availableTypes: MixedItemType[] = [];
  if (hasText) availableTypes.push("text");
  if (hasImages) availableTypes.push("image");
  if (hasBlessing) availableTypes.push("blessing");

  return {
    hasText,
    hasImages,
    hasBlessing,
    availableTypes,
  };
}

/**
 * 根据内容类型和权重决定使用哪种类型
 * 
 * @param config 混合输入配置
 * @param available 可用内容检测结果
 * @param seedValue 随机种子值
 * @returns 内容类型判断结果
 */
export function determineContentType(
  config: MixedInputConfig,
  available: AvailableContent,
  seedValue: number
): ContentTypeResult {
  const { contentType = "text", imageWeight = 0.5, words = [], images = [], blessingTypes = [] } = config;
  const { hasText, hasImages, hasBlessing, availableTypes } = available;

  let type: MixedItemType = "text";
  let content = "";
  let contentIndex = 0;

  // 根据 contentType 决定类型
  if (contentType === "text") {
    if (hasText) {
      type = "text";
    } else if (hasBlessing) {
      // 回退到祝福图案
      type = "blessing";
    }
  } else if (contentType === "image") {
    if (hasImages) {
      type = "image";
    } else if (hasBlessing) {
      // 回退到祝福图案
      type = "blessing";
    }
  } else if (contentType === "blessing") {
    type = "blessing";
  } else if (contentType === "mixed") {
    // mixed 模式：根据权重分配概率，只从可用的类型中选择
    if (availableTypes.length === 0) {
      // 没有任何可用内容，使用默认祝福图案
      type = "blessing";
    } else if (availableTypes.length === 1) {
      type = availableTypes[0];
    } else if (availableTypes.length === 2) {
      // 两种类型可用，根据权重分配
      const rand = random(`type-${seedValue}`);
      if (hasText && hasImages) {
        type = rand < imageWeight ? "image" : "text";
      } else if (hasText && hasBlessing) {
        // text 和 blessing 各 50%
        type = rand < 0.5 ? "text" : "blessing";
      } else if (hasImages && hasBlessing) {
        // image 和 blessing 各 50%
        type = rand < 0.5 ? "image" : "blessing";
      }
    } else if (availableTypes.length === 3) {
      // 三种类型都有：text = 1-imageWeight-blessingWeight, image = imageWeight, blessing = blessingWeight
      const blessingWeight = 0.3;
      const textWeight = 1 - imageWeight - blessingWeight;
      const rand = random(`type-${seedValue}`);
      if (rand < textWeight) {
        type = "text";
      } else if (rand < textWeight + imageWeight) {
        type = "image";
      } else {
        type = "blessing";
      }
    }
  }

  // 获取实际内容
  if (type === "text" && hasText) {
    contentIndex = Math.floor(random(`text-${seedValue}`) * words.length);
    content = words[contentIndex];
  } else if (type === "image" && hasImages) {
    contentIndex = Math.floor(random(`image-${seedValue}`) * images.length);
    content = images[contentIndex];
  } else {
    // blessing 类型或回退到 blessing
    type = "blessing";
    const effectiveBlessingTypes = hasBlessing ? blessingTypes : DEFAULT_BLESSING_TYPES;
    contentIndex = Math.floor(random(`blessing-${seedValue}`) * effectiveBlessingTypes.length);
    content = effectiveBlessingTypes[contentIndex];
  }

  return { type, content, contentIndex };
}

/**
 * 轮询获取内容（按顺序而非随机）
 * 
 * @param type 内容类型
 * @param config 混合输入配置
 * @param index 当前索引
 * @returns 内容和实际索引
 */
export function getNextContent(
  type: MixedItemType,
  config: MixedInputConfig,
  index: number
): { content: string; actualIndex: number } {
  const { words = [], images = [], blessingTypes = [] } = config;

  if (type === "text" && words.length > 0) {
    const actualIndex = index % words.length;
    return { content: words[actualIndex], actualIndex };
  } else if (type === "image" && images.length > 0) {
    const actualIndex = index % images.length;
    return { content: images[actualIndex], actualIndex };
  } else if (type === "blessing") {
    const effectiveTypes = blessingTypes.length > 0 ? blessingTypes : DEFAULT_BLESSING_TYPES;
    const actualIndex = index % effectiveTypes.length;
    return { content: effectiveTypes[actualIndex], actualIndex };
  }

  return { content: "", actualIndex: 0 };
}

/**
 * 获取项目大小范围
 * 
 * @param type 内容类型
 * @param options 生成选项
 * @returns [最小值, 最大值]
 */
export function getSizeRange(
  type: MixedItemType,
  options: MixedInputGenerateOptions
): [number, number] {
  const { fontSizeRange = [24, 72], imageSizeRange = [50, 150], blessingSizeRange = [50, 100] } = options;

  switch (type) {
    case "text":
      return fontSizeRange;
    case "image":
      return imageSizeRange;
    case "blessing":
      return blessingSizeRange;
    default:
      return fontSizeRange;
  }
}

/**
 * 生成随机大小
 * 
 * @param range 大小范围
 * @param seedValue 随机种子
 * @returns 随机大小
 */
export function generateRandomSize(range: [number, number], seedValue: number): number {
  return range[0] + random(`size-${seedValue}`) * (range[1] - range[0]);
}

/**
 * 生成随机透明度
 * 
 * @param range 透明度范围
 * @param seedValue 随机种子
 * @returns 随机透明度
 */
export function generateRandomOpacity(range: [number, number], seedValue: number): number {
  return range[0] + random(`opacity-${seedValue}`) * (range[1] - range[0]);
}

/**
 * 生成随机旋转角度
 * 
 * @param range 旋转范围
 * @param seedValue 随机种子
 * @returns 随机旋转角度
 */
export function generateRandomRotation(range: [number, number], seedValue: number): number {
  return range[0] + random(`rotation-${seedValue}`) * (range[1] - range[0]);
}

/**
 * 合并祝福图案样式（带默认值）
 * 
 * @param style 用户提供的样式
 * @returns 合并后的样式
 */
export function mergeBlessingStyle(style: BlessingStyleConfig = {}): BlessingStyleConfig {
  return {
    ...DEFAULT_BLESSING_STYLE,
    ...style,
  };
}

/**
 * 创建混合输入项目
 * 
 * @param id 唯一标识
 * @param type 类型
 * @param content 内容
 * @param options 生成选项
 * @param seedValue 随机种子
 * @returns 混合输入项目
 */
export function createMixedInputItem(
  id: number,
  type: MixedItemType,
  content: string,
  options: MixedInputGenerateOptions,
  seedValue: number
): MixedInputItem {
  const {
    opacityRange = [0.6, 1],
    rotationRange = [-15, 15],
    blessingStyle = {},
  } = options;

  const sizeRange = getSizeRange(type, options);
  const size = generateRandomSize(sizeRange, seedValue);

  const item: MixedInputItem = {
    type,
    id,
    content,
    width: size,
    height: size,
    opacity: generateRandomOpacity(opacityRange, seedValue),
    rotation: generateRandomRotation(rotationRange, seedValue),
    scale: 1,
  };

  // 文字特有属性
  if (type === "text") {
    item.fontSize = size;
  }

  // 图片特有属性
  if (type === "image") {
    item.swingPhase = random(`swing-${seedValue}`) * Math.PI * 2;
    item.spinDirection = random(`spin-${seedValue}`) > 0.5 ? 1 : -1;
  }

  // 祝福图案特有属性
  if (type === "blessing") {
    item.blessingStyle = mergeBlessingStyle(blessingStyle);
  }

  return item;
}

/**
 * 批量生成混合输入项目
 * 
 * @param config 混合输入配置
 * @param options 生成选项
 * @returns 混合输入项目数组
 */
export function generateMixedInputItems(
  config: MixedInputConfig,
  options: MixedInputGenerateOptions
): MixedInputItem[] {
  const { count, seed } = options;
  const items: MixedInputItem[] = [];
  const available = detectAvailableContent(config);

  // 如果没有可用内容，返回空数组
  if (available.availableTypes.length === 0) {
    return items;
  }

  // 使用计数器进行轮询
  const counters = { text: 0, image: 0, blessing: 0 };

  for (let i = 0; i < count; i++) {
    const seedValue = seed + i * 1000;
    const { type, content } = determineContentType(config, available, seedValue);

    if (!content && type !== "blessing") {
      continue;
    }

    // 获取轮询内容
    const { content: actualContent } = getNextContent(type, config, counters[type]);
    counters[type]++;

    const item = createMixedInputItem(
      i,
      type,
      actualContent,
      options,
      seedValue
    );

    items.push(item);
  }

  return items;
}

/**
 * 判断是否有任何有效内容
 */
export function hasAnyContent(config: MixedInputConfig): boolean {
  const available = detectAvailableContent(config);
  return available.availableTypes.length > 0;
}

/**
 * 获取有效的祝福图案类型列表
 */
export function getEffectiveBlessingTypes(config: MixedInputConfig): BlessingSymbolType[] {
  return config.blessingTypes && config.blessingTypes.length > 0
    ? config.blessingTypes
    : DEFAULT_BLESSING_TYPES;
}

// ==================== 高级工具函数 ====================

/**
 * 根据内容类型获取可用类型列表
 * 
 * 这是组件中最常用的逻辑，用于确定哪些内容类型可用
 * 
 * @param config 混合输入配置
 * @returns 可用类型列表
 * 
 * @example
 * const availableTypes = getAvailableTypes({
 *   contentType: "mixed",
 *   words: ["福", "禄"],
 *   images: [],
 *   blessingTypes: [],
 * });
 * // 返回 ["text", "blessing"] - blessing 始终可用作为回退
 */
export function getAvailableTypes(config: MixedInputConfig): MixedItemType[] {
  const { contentType = "text" } = config;
  const available = detectAvailableContent(config);
  const { hasText, hasImages, availableTypes } = available;

  // 非 mixed 模式：根据指定的类型返回
  if (contentType === "text") {
    return hasText ? ["text"] : ["blessing"];
  }
  if (contentType === "image") {
    return hasImages ? ["image"] : ["blessing"];
  }
  if (contentType === "blessing") {
    return ["blessing"];
  }

  // mixed 模式：返回所有可用类型
  // blessing 始终作为可用选项（回退）
  const types: MixedItemType[] = [];
  if (hasText) types.push("text");
  if (hasImages) types.push("image");
  types.push("blessing"); // blessing 始终可用

  return types;
}

/**
 * 创建种子随机数生成器
 * 
 * 返回一个函数，每次调用返回 0-1 之间的随机数，相同种子产生相同序列
 * 
 * @param seed 随机种子
 * @returns 随机数生成函数
 * 
 * @example
 * const random = createSeededRandomGenerator(42);
 * const value1 = random(); // 始终相同
 * const value2 = random(); // 始终相同
 */
export function createSeededRandomGenerator(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * 随机选择内容类型
 * 
 * 根据可用类型和权重随机选择一个类型
 * 
 * @param availableTypes 可用类型列表
 * @param random 随机数生成函数
 * @param imageWeight 图片权重（仅在 mixed 模式下有效）
 * @returns 选中的类型
 */
export function selectRandomType(
  availableTypes: MixedItemType[],
  random: () => number,
  imageWeight: number = 0.5
): MixedItemType {
  if (availableTypes.length === 0) {
    return "blessing";
  }
  if (availableTypes.length === 1) {
    return availableTypes[0];
  }
  if (availableTypes.length === 2) {
    const hasText = availableTypes.includes("text");
    const hasImage = availableTypes.includes("image");
    if (hasText && hasImage) {
      return random() < imageWeight ? "image" : "text";
    }
    // 其他组合各 50%
    return random() < 0.5 ? availableTypes[0] : availableTypes[1];
  }
  // 三种类型都有
  const blessingWeight = 0.3;
  const textWeight = 1 - imageWeight - blessingWeight;
  const r = random();
  if (r < textWeight) return "text";
  if (r < textWeight + imageWeight) return "image";
  return "blessing";
}

/**
 * 随机选择内容
 * 
 * 根据类型从配置中选择一个内容
 * 
 * @param type 内容类型
 * @param config 混合输入配置
 * @param random 随机数生成函数
 * @returns 选中的内容
 */
export function selectRandomContent(
  type: MixedItemType,
  config: MixedInputConfig,
  random: () => number
): string {
  const { words = [], images = [], blessingTypes = [] } = config;
  const effectiveBlessingTypes = getEffectiveBlessingTypes(config);

  switch (type) {
    case "text":
      if (words.length > 0) {
        return words[Math.floor(random() * words.length)];
      }
      // 回退到 blessing
      return effectiveBlessingTypes[Math.floor(random() * effectiveBlessingTypes.length)];
    case "image":
      if (images.length > 0) {
        return images[Math.floor(random() * images.length)];
      }
      // 回退到 blessing
      return effectiveBlessingTypes[Math.floor(random() * effectiveBlessingTypes.length)];
    case "blessing":
    default:
      return effectiveBlessingTypes[Math.floor(random() * effectiveBlessingTypes.length)];
  }
}

/**
 * 默认文字样式
 */
export const DEFAULT_TEXT_STYLE: TextStyleConfig = {
  color: "#FFD700",
  effect: "gold3d",
  effectIntensity: 0.9,
  fontWeight: 700,
};

/**
 * 合并文字样式（带默认值）
 */
export function mergeTextStyle(style: TextStyleConfig = {}): TextStyleConfig {
  return {
    ...DEFAULT_TEXT_STYLE,
    ...style,
  };
}

/**
 * 粒子基础属性
 */
export interface ParticleBaseProps {
  id: number;
  type: MixedItemType;
  content: string;
  size: number;
  opacity: number;
  rotation: number;
}

/**
 * 生成粒子基础属性
 * 
 * @param id 粒子ID
 * @param config 混合输入配置
 * @param options 生成选项
 * @param random 随机数生成函数
 * @returns 粒子基础属性
 */
export function generateParticleBaseProps(
  id: number,
  config: MixedInputConfig,
  options: {
    fontSizeRange?: [number, number];
    imageSizeRange?: [number, number];
    blessingSizeRange?: [number, number];
    opacityRange?: [number, number];
    rotationRange?: [number, number];
    imageWeight?: number;
  },
  random: () => number
): ParticleBaseProps {
  const {
    fontSizeRange = [40, 80],
    imageSizeRange = [50, 100],
    blessingSizeRange = [40, 80],
    opacityRange = [0.6, 1],
    rotationRange = [-15, 15],
    imageWeight = 0.5,
  } = options;

  const availableTypes = getAvailableTypes(config);
  const type = selectRandomType(availableTypes, random, imageWeight);
  const content = selectRandomContent(type, config, random);

  // 根据类型选择大小范围
  let sizeRange: [number, number];
  switch (type) {
    case "text":
      sizeRange = fontSizeRange;
      break;
    case "image":
      sizeRange = imageSizeRange;
      break;
    case "blessing":
    default:
      sizeRange = blessingSizeRange;
  }

  const size = sizeRange[0] + random() * (sizeRange[1] - sizeRange[0]);
  const opacity = opacityRange[0] + random() * (opacityRange[1] - opacityRange[0]);
  const rotation = rotationRange[0] + random() * (rotationRange[1] - rotationRange[0]);

  return {
    id,
    type,
    content,
    size,
    opacity,
    rotation,
  };
}

/**
 * 批量生成粒子基础属性
 * 
 * @param count 粒子数量
 * @param config 混合输入配置
 * @param options 生成选项
 * @param seed 随机种子
 * @returns 粒子基础属性数组
 */
export function generateParticleBasePropsBatch(
  count: number,
  config: MixedInputConfig,
  options: {
    fontSizeRange?: [number, number];
    imageSizeRange?: [number, number];
    blessingSizeRange?: [number, number];
    opacityRange?: [number, number];
    rotationRange?: [number, number];
    imageWeight?: number;
  },
  seed: number
): ParticleBaseProps[] {
  const random = createSeededRandomGenerator(seed);
  const particles: ParticleBaseProps[] = [];

  for (let i = 0; i < count; i++) {
    particles.push(generateParticleBaseProps(i, config, options, random));
  }

  return particles;
}
