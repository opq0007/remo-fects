/**
 * 工具函数导出
 */

export {
  seededRandom,
  seededRandomNumber,
  createSeededRandom,
  seededRandomInt,
  seededRandomFloat,
  seededRandomChoice,
} from "./random";

export {
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeOutElastic,
  easeOutBounce,
  easeInExpo,
  easeOutExpo,
  easeInSine,
  easeOutSine,
  easeInOutSine,
  getEasing,
  type EasingFunction,
} from "./easing";

export {
  generateTextStyle,
  type TextStyleConfig,
} from "./textStyle";

// 混合输入工具函数
export {
  DEFAULT_BLESSING_TYPES,
  DEFAULT_BLESSING_STYLE,
  detectAvailableContent,
  determineContentType,
  getNextContent,
  getSizeRange,
  generateRandomSize,
  generateRandomOpacity,
  generateRandomRotation,
  mergeBlessingStyle,
  createMixedInputItem,
  generateMixedInputItems,
  hasAnyContent,
  getEffectiveBlessingTypes,
} from "./mixed-input";
