/**
 * 文字龙卷风特效参数配置
 * 
 * 定义 text-tornado-effect 特效的所有参数
 */

const path = require('path');
const {
  MIXED_INPUT_PARAMS,
  SIZE_RANGE_PARAMS,
  TEXT_STYLE_PARAM,
  numberRangeParser,
  intRangeParser,
  validateMixedInput,
  createBuildRenderParams,
} = require('./shared-params');

/**
 * 特效基础信息
 */
const config = {
  id: 'text-tornado-effect',
  name: '文字龙卷风特效',
  compositionId: 'TextTornado',
  path: path.join(__dirname, '../../effects/text-tornado-effect')
};

/**
 * 特效特有参数定义
 * 使用展开运算符复用混合输入参数
 */
const params = {
  // ===== 混合输入配置（复用公共定义） =====
  ...MIXED_INPUT_PARAMS,

  // ===== 尺寸范围配置（复用公共定义） =====
  ...SIZE_RANGE_PARAMS,

  // ===== 文字样式（复用公共定义） =====
  ...TEXT_STYLE_PARAM,

  // ===== 龙卷风特有参数 =====
  particleCount: {
    type: 'number',
    defaultValue: 60,
    parser: intRangeParser(10, 200, 60),
    description: '粒子数量 (10-200)'
  },
  baseRadius: {
    type: 'number',
    defaultValue: 300,
    parser: (v) => parseFloat(v) || 300,
    description: '龙卷风底部半径'
  },
  topRadius: {
    type: 'number',
    defaultValue: 50,
    parser: (v) => parseFloat(v) || 50,
    description: '龙卷风顶部半径'
  },
  rotationSpeed: {
    type: 'number',
    defaultValue: 2,
    parser: (v) => parseFloat(v) || 2,
    description: '旋转速度'
  },
  liftSpeed: {
    type: 'number',
    defaultValue: 0.3,
    parser: numberRangeParser(0, 1, 0.3),
    description: '上升速度 (0-1)'
  },
  funnelHeight: {
    type: 'number',
    defaultValue: 0.85,
    parser: numberRangeParser(0.3, 1, 0.85),
    description: '漏斗高度比例 (0.3-1)'
  },
  zoomIntensity: {
    type: 'number',
    defaultValue: 0.5,
    parser: numberRangeParser(0, 2, 0.5),
    description: '镜头拉近强度 (0-2)'
  },
  entranceDuration: {
    type: 'number',
    defaultValue: 30,
    parser: intRangeParser(10, 60, 30),
    description: '入场动画时长（帧）'
  },
  swirlIntensity: {
    type: 'number',
    defaultValue: 1,
    parser: numberRangeParser(0.5, 2, 1),
    description: '螺旋强度 (0.5-2)'
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