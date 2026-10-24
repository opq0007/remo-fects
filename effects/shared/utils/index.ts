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
  TEXT_EFFECT_PRESETS,
  FONT_FAMILY,
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
  // 高级工具函数
  getAvailableTypes,
  createSeededRandomGenerator,
  selectRandomType,
  selectRandomContent,
  DEFAULT_TEXT_STYLE,
  mergeTextStyle,
  generateParticleBaseProps,
  generateParticleBasePropsBatch,
  // 类型
  type ParticleBaseProps,
} from "./mixed-input";

// 颜色工具函数
export {
  colorWithOpacity,
  generateGlow,
  generateTextStroke,
  generate3DTextShadow,
  // getCharacterConfig 已在 components/Character.tsx 中定义，这里不再重复导出
  getContrastColor,
  blendColors,
  randomColor,
  shadeColor,
  generateAtmosphere,
  GOLD_SCALE,
  DEEP_BACKGROUNDS,
  EFFECT_PALETTES,
  getEffectPalette,
  type EffectPalette,
} from "./colors";
