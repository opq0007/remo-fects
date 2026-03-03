/**
 * 文字旋涡特效参数配置
 * 
 * 定义 text-vortex-effect 特效的所有参数
 */

const path = require('path');
const {
  MIXED_INPUT_PARAMS,
  SIZE_RANGE_PARAMS,
  TEXT_STYLE_PARAM,
  numberRangeParser,
  intRangeParser,
  booleanParser,
  enumParser,
  validateMixedInput,
  createBuildRenderParams,
} = require('./shared-params');

/**
 * 特效基础信息
 */
const config = {
  id: 'text-vortex-effect',
  name: '文字旋涡特效',
  compositionId: 'TextVortex',
  path: path.join(__dirname, '../../effects/text-vortex-effect')
};

/**
 * 特效特有参数定义
 */
const params = {
  // ===== 混合输入配置（复用公共定义） =====
  ...MIXED_INPUT_PARAMS,

  // ===== 尺寸范围配置（复用公共定义） =====
  ...SIZE_RANGE_PARAMS,

  // ===== 文字样式（复用公共定义） =====
  ...TEXT_STYLE_PARAM,

  // ===== 旋涡特有参数 =====
  particleCount: {
    type: 'number',
    defaultValue: 80,
    parser: intRangeParser(20, 200, 80),
    description: '粒子数量 (20-200)'
  },
  ringCount: {
    type: 'number',
    defaultValue: 6,
    parser: intRangeParser(2, 12, 6),
    description: '环的数量 (2-12)'
  },
  rotationDirection: {
    type: 'string',
    defaultValue: 'clockwise',
    parser: enumParser(['clockwise', 'counterclockwise'], 'clockwise'),
    description: '旋转方向：clockwise(顺时针) | counterclockwise(逆时针)'
  },
  rotationSpeed: {
    type: 'number',
    defaultValue: 1.5,
    parser: numberRangeParser(0.5, 4, 1.5),
    description: '旋转速度 (0.5-4)'
  },
  expansionDuration: {
    type: 'number',
    defaultValue: 6,
    parser: numberRangeParser(2, 15, 6),
    description: '散开动画时长（秒）(2-15)'
  },
  initialRadius: {
    type: 'number',
    defaultValue: 30,
    parser: numberRangeParser(10, 100, 30),
    description: '初始中心半径 (10-100)'
  },
  maxRadius: {
    type: 'number',
    defaultValue: 350,
    parser: numberRangeParser(150, 500, 350),
    description: '最大扩散半径 (150-500)'
  },

  // ===== 3D效果配置 =====
  depth3D: {
    type: 'boolean',
    defaultValue: true,
    parser: booleanParser(true),
    description: '是否启用3D效果'
  },
  depthIntensity: {
    type: 'number',
    defaultValue: 0.4,
    parser: numberRangeParser(0, 1, 0.4),
    description: '3D深度强度 (0-1)'
  },
  perspective: {
    type: 'number',
    defaultValue: 800,
    parser: intRangeParser(400, 2000, 800),
    description: '透视距离 (400-2000)'
  },

  // ===== 动画配置 =====
  entranceDuration: {
    type: 'number',
    defaultValue: 25,
    parser: intRangeParser(10, 60, 25),
    description: '入场动画时长（帧）(10-60)'
  },
  fadeInEnabled: {
    type: 'boolean',
    defaultValue: true,
    parser: booleanParser(true),
    description: '是否启用淡入效果'
  },
  spiralTightness: {
    type: 'number',
    defaultValue: 1.2,
    parser: numberRangeParser(0.5, 2, 1.2),
    description: '螺旋紧密程度 (0.5-2)'
  },
  pulseEnabled: {
    type: 'boolean',
    defaultValue: true,
    parser: booleanParser(true),
    description: '是否启用脉冲效果'
  },
  pulseIntensity: {
    type: 'number',
    defaultValue: 0.15,
    parser: numberRangeParser(0, 0.5, 0.15),
    description: '脉冲强度 (0-0.5)'
  },

  // ===== 震撼效果 =====
  shockwaveEnabled: {
    type: 'boolean',
    defaultValue: true,
    parser: booleanParser(true),
    description: '是否启用冲击波效果'
  },
  shockwaveTiming: {
    type: 'number',
    defaultValue: 3,
    parser: numberRangeParser(1, 10, 3),
    description: '冲击波触发时机（秒）(1-10)'
  },
  suctionEffect: {
    type: 'boolean',
    defaultValue: true,
    parser: booleanParser(true),
    description: '是否启用吸入效果'
  },
  suctionIntensity: {
    type: 'number',
    defaultValue: 0.3,
    parser: numberRangeParser(0, 1, 0.3),
    description: '吸入效果强度 (0-1)'
  },
  seed: {
    type: 'number',
    defaultValue: undefined,
    parser: (v) => v ? parseInt(v) : undefined,
    description: '随机种子（可选，不设置则随机）'
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