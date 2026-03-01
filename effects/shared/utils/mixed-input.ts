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
