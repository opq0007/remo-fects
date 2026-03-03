/**
 * 文字雨特效参数配置
 * 
 * 定义 text-rain-effect 特效的所有参数
 */

const path = require('path');
const {
  MIXED_INPUT_PARAMS,
  SIZE_RANGE_PARAMS,
  TEXT_STYLE_PARAM,
  DEFAULT_BLESSING_STYLE,
  numberRangeParser,
  booleanParser,
  objectParser,
  arrayParser,
  validateMixedInput,
  createBuildRenderParams,
} = require('./shared-params');

/**
 * 特效基础信息
 */
const config = {
  id: 'text-rain-effect',
  name: '文字雨特效',
  compositionId: 'TextRain',
  path: path.join(__dirname, '../../effects/text-rain-effect')
};

/**
 * 默认祝福图案样式（文字雨特有）
 */
const RAIN_BLESSING_STYLE = {
  ...DEFAULT_BLESSING_STYLE,
  animated: false,
};

/**
 * 默认文字样式（文字雨特有）
 */
const RAIN_TEXT_STYLE = {
  color: '#ffd700',
  effect: 'gold3d',
  effectIntensity: 0.9,
  fontWeight: 700,
  letterSpacing: 4,
};

/**
 * 特效特有参数定义
 */
const params = {
  // ===== 混合输入配置（复用公共定义） =====
  ...MIXED_INPUT_PARAMS,

  // ===== 尺寸范围配置（文字雨特有默认值） =====
  fontSizeRange: {
    type: 'array',
    defaultValue: [80, 160],
    parser: arrayParser([80, 160]),
    description: '字体大小范围 [min, max]'
  },
  imageSizeRange: {
    type: 'array',
    defaultValue: [80, 150],
    parser: arrayParser([80, 150]),
    description: '图片大小范围 [min, max]'
  },
  blessingSizeRange: SIZE_RANGE_PARAMS.blessingSizeRange,

  // ===== 文字样式（文字雨特有） =====
  textStyle: {
    type: 'object',
    defaultValue: RAIN_TEXT_STYLE,
    parser: objectParser(RAIN_TEXT_STYLE),
    description: '文字样式配置'
  },

  // ===== 祝福图案样式 =====
  blessingStyle: {
    type: 'object',
    defaultValue: RAIN_BLESSING_STYLE,
    parser: objectParser(RAIN_BLESSING_STYLE),
    description: '祝福图案样式配置'
  },

  // ===== 文字方向 =====
  textDirection: {
    type: 'string',
    defaultValue: 'horizontal',
    description: '文字排列方向：horizontal(横排) | vertical(竖排)'
  },

  // ===== 运动方向 =====
  fallDirection: {
    type: 'string',
    defaultValue: 'down',
    description: '雨滴运动方向：down(从上到下) | up(从下到上)'
  },

  // ===== 运动参数 =====
  fallSpeed: {
    type: 'number',
    defaultValue: 0.15,
    parser: (v) => parseFloat(v) || 0.15,
    description: '下落/上升速度系数'
  },
  density: {
    type: 'number',
    defaultValue: 2,
    parser: (v) => parseFloat(v) || 2,
    description: '雨滴密度'
  },
  laneCount: {
    type: 'number',
    defaultValue: 6,
    parser: (v) => parseInt(v) || 6,
    description: '列道数量'
  },
  minVerticalGap: {
    type: 'number',
    defaultValue: 100,
    parser: (v) => parseInt(v) || 100,
    description: '最小垂直间距'
  },

  // ===== 透明度和旋转 =====
  opacityRange: {
    type: 'array',
    defaultValue: [0.6, 1],
    parser: arrayParser([0.6, 1]),
    description: '透明度范围 [min, max]'
  },
  rotationRange: {
    type: 'array',
    defaultValue: [-10, 10],
    parser: arrayParser([-10, 10]),
    description: '旋转角度范围 [min, max]'
  },

  // ===== 音频（覆盖默认值） =====
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