/**
 * 文字洪水特效参数配置
 * 
 * 定义 text-flood-effect 特效的所有参数
 */

const path = require('path');
const {
  MIXED_INPUT_PARAMS,
  SIZE_RANGE_PARAMS,
  TEXT_STYLE_PARAM,
  DEFAULT_BLESSING_STYLE,
  DEFAULT_TEXT_STYLE,
  numberRangeParser,
  intRangeParser,
  booleanParser,
  enumParser,
  objectParser,
  arrayParser,
  validateMixedInput,
  createBuildRenderParams,
} = require('./shared-params');

/**
 * 特效基础信息
 */
const config = {
  id: 'text-flood-effect',
  name: '文字洪水特效',
  compositionId: 'TextFlood',
  path: path.join(__dirname, '../../effects/text-flood-effect')
};

/**
 * 默认文字样式（洪水特效特有）
 */
const FLOOD_TEXT_STYLE = {
  color: '#00d4ff',
  effect: 'glow',
  effectIntensity: 1.2,
  fontWeight: 900,
};

/**
 * 默认图片样式
 */
const FLOOD_IMAGE_STYLE = {
  glow: true,
  glowColor: '#00d4ff',
  glowIntensity: 0.8,
  shadow: true,
};

/**
 * 默认祝福图案样式（洪水特效特有）
 */
const FLOOD_BLESSING_STYLE = {
  ...DEFAULT_BLESSING_STYLE,
  glowIntensity: 1.2,
};

/**
 * 特效特有参数定义
 */
const params = {
  // ===== 混合输入配置（复用公共定义，覆盖默认值） =====
  contentType: MIXED_INPUT_PARAMS.contentType,
  words: {
    ...MIXED_INPUT_PARAMS.words,
    defaultValue: ['洪', '福', '财', '运', '吉', '祥'],
  },
  images: MIXED_INPUT_PARAMS.images,
  imageWeight: {
    ...MIXED_INPUT_PARAMS.imageWeight,
    defaultValue: 0.3,
  },
  blessingTypes: MIXED_INPUT_PARAMS.blessingTypes,
  blessingStyle: {
    type: 'object',
    defaultValue: FLOOD_BLESSING_STYLE,
    parser: objectParser(FLOOD_BLESSING_STYLE),
    description: '祝福图案样式配置'
  },

  // ===== 洪水参数 =====
  particleCount: {
    type: 'number',
    defaultValue: 60,
    parser: intRangeParser(10, 200, 60),
    description: '粒子数量 (10-200)'
  },
  waveCount: {
    type: 'number',
    defaultValue: 5,
    parser: intRangeParser(1, 10, 5),
    description: '波浪层数 (1-10)'
  },
  direction: {
    type: 'string',
    defaultValue: 'toward',
    parser: enumParser(['toward', 'away'], 'toward'),
    description: '洪水方向：toward(从远到近，冲击感) | away(从近到远，退去感)'
  },

  // ===== 波浪配置 =====
  waveConfig: {
    type: 'object',
    defaultValue: { waveSpeed: 1.5, waveAmplitude: 60, waveFrequency: 2 },
    parser: objectParser({ waveSpeed: 1.5, waveAmplitude: 60, waveFrequency: 2 }),
    description: '波浪配置'
  },

  // ===== 冲击效果配置 =====
  impactConfig: {
    type: 'object',
    defaultValue: { impactStart: 0.7, impactScale: 3, impactBlur: 8, impactShake: 15 },
    parser: objectParser({ impactStart: 0.7, impactScale: 3, impactBlur: 8, impactShake: 15 }),
    description: '冲击效果配置'
  },

  // ===== 尺寸配置（洪水特效特有默认值） =====
  fontSizeRange: {
    type: 'array',
    defaultValue: [60, 120],
    parser: arrayParser([60, 120]),
    description: '字体大小范围 [min, max]'
  },
  imageSizeRange: {
    type: 'array',
    defaultValue: [80, 150],
    parser: arrayParser([80, 150]),
    description: '图片大小范围 [min, max]'
  },
  blessingSizeRange: {
    type: 'array',
    defaultValue: [80, 150],
    parser: arrayParser([80, 150]),
    description: '祝福图案大小范围 [min, max]'
  },

  // ===== 透明度 =====
  opacityRange: {
    type: 'array',
    defaultValue: [0.7, 1],
    parser: arrayParser([0.7, 1]),
    description: '透明度范围 [min, max]'
  },

  // ===== 文字样式（洪水特效特有） =====
  textStyle: {
    type: 'object',
    defaultValue: FLOOD_TEXT_STYLE,
    parser: objectParser(FLOOD_TEXT_STYLE),
    description: '文字样式配置'
  },

  // ===== 图片样式 =====
  imageStyle: {
    type: 'object',
    defaultValue: FLOOD_IMAGE_STYLE,
    parser: objectParser(FLOOD_IMAGE_STYLE),
    description: '图片样式配置'
  },

  // ===== 视觉效果 =====
  enablePerspective: {
    type: 'boolean',
    defaultValue: true,
    parser: booleanParser(true),
    description: '是否启用3D透视效果'
  },
  perspectiveStrength: {
    type: 'number',
    defaultValue: 800,
    parser: intRangeParser(100, 2000, 800),
    description: '透视强度 (100-2000)'
  },
  enableWaveBackground: {
    type: 'boolean',
    defaultValue: true,
    parser: booleanParser(true),
    description: '是否启用波浪背景'
  },
  waveBackgroundColor: {
    type: 'string',
    defaultValue: '#0a3a5a',
    description: '波浪背景颜色'
  },
  waveBackgroundOpacity: {
    type: 'number',
    defaultValue: 0.4,
    parser: numberRangeParser(0, 1, 0.4),
    description: '波浪背景透明度 (0-1)'
  },

  // ===== 随机种子 =====
  seed: {
    type: 'number',
    defaultValue: 42,
    parser: (v) => parseInt(v) || 42,
    description: '随机种子'
  },

  // ===== 音频 =====
  audioEnabled: {
    type: 'boolean',
    defaultValue: true,
    parser: booleanParser(true),
    description: '是否启用音频'
  }
};

// 使用公共验证函数
const validate = validateMixedInput;

// 使用公共 buildRenderParams 生成器
const buildRenderParams = createBuildRenderParams(params);

module.exports = {
  config,
  params,
  validate,
  buildRenderParams
};