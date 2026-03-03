/**
 * 文字水晶球特效参数配置
 * 
 * 定义 text-crystal-ball-effect 特效的所有参数
 */

const path = require('path');
const {
  MIXED_INPUT_PARAMS,
  SIZE_RANGE_PARAMS,
  TEXT_STYLE_PARAM,
  numberRangeParser,
  intRangeParser,
  booleanParser,
  validateMixedInput,
  createBuildRenderParams,
} = require('./shared-params');

/**
 * 特效基础信息
 */
const config = {
  id: 'text-crystal-ball-effect',
  name: '文字水晶球特效',
  compositionId: 'TextCrystalBall',
  path: path.join(__dirname, '../../effects/text-crystal-ball-effect')
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

  // ===== 水晶球特有参数 =====
  ballRadius: {
    type: 'number',
    defaultValue: 200,
    parser: numberRangeParser(50, 400, 200),
    description: '水晶球半径 (50-400)'
  },
  ballColor: {
    type: 'string',
    defaultValue: '#4169E1',
    description: '水晶球颜色'
  },
  ballOpacity: {
    type: 'number',
    defaultValue: 0.3,
    parser: numberRangeParser(0, 1, 0.3),
    description: '水晶球透明度 (0-1)'
  },
  glowColor: {
    type: 'string',
    defaultValue: '#87CEEB',
    description: '发光颜色'
  },
  glowIntensity: {
    type: 'number',
    defaultValue: 1,
    parser: numberRangeParser(0, 2, 1),
    description: '发光强度 (0-2)'
  },

  // ===== 位置配置 =====
  verticalOffset: {
    type: 'number',
    defaultValue: 0.5,
    parser: numberRangeParser(0, 1, 0.5),
    description: '垂直偏移 (0=顶部, 0.5=居中, 1=底部)'
  },

  // ===== 旋转动画配置 =====
  rotationSpeedX: {
    type: 'number',
    defaultValue: 0.2,
    parser: numberRangeParser(0, 2, 0.2),
    description: 'X轴旋转速度 (0-2)'
  },
  rotationSpeedY: {
    type: 'number',
    defaultValue: 0.6,
    parser: numberRangeParser(0, 2, 0.6),
    description: 'Y轴旋转速度 (0-2)'
  },
  rotationSpeedZ: {
    type: 'number',
    defaultValue: 0.1,
    parser: numberRangeParser(0, 2, 0.1),
    description: 'Z轴旋转速度 (0-2)'
  },
  autoRotate: {
    type: 'boolean',
    defaultValue: true,
    parser: booleanParser(true),
    description: '是否自动旋转'
  },

  // ===== 镜头推进配置 =====
  zoomEnabled: {
    type: 'boolean',
    defaultValue: false,
    parser: booleanParser(false),
    description: '是否启用镜头推进效果'
  },
  zoomProgress: {
    type: 'number',
    defaultValue: 0,
    parser: numberRangeParser(0, 1, 0),
    description: '镜头推进进度 (0=正常距离, 1=最近)'
  },

  // ===== 内容配置 =====
  particleCount: {
    type: 'number',
    defaultValue: 30,
    parser: intRangeParser(10, 100, 30),
    description: '粒子数量 (10-100)'
  },

  // ===== 透视配置 =====
  perspective: {
    type: 'number',
    defaultValue: 1000,
    parser: intRangeParser(200, 2000, 1000),
    description: '透视距离 (200-2000)'
  },

  // ===== 入场动画 =====
  entranceDuration: {
    type: 'number',
    defaultValue: 30,
    parser: intRangeParser(10, 60, 30),
    description: '入场动画时长（帧）'
  },

  // ===== 随机种子 =====
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