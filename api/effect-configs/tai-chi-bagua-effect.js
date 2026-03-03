/**
 * 太极八卦图特效参数配置
 */

const path = require('path');
const {
  numberRangeParser,
  intRangeParser,
  booleanParser,
  createBuildRenderParams,
} = require('./shared-params');

/**
 * 特效基础信息
 */
const config = {
  id: 'tai-chi-bagua-effect',
  name: '太极八卦图特效',
  compositionId: 'TaiChiBagua',
  path: path.join(__dirname, '../../effects/tai-chi-bagua-effect')
};

/**
 * 特效参数定义
 */
const params = {
  // ===== 颜色配置 =====
  yangColor: {
    type: 'string',
    defaultValue: '#FFD700',
    description: '阳色（默认金色）'
  },
  yinColor: {
    type: 'string',
    defaultValue: '#1a1a1a',
    description: '阴色'
  },

  // ===== 发光效果 =====
  glowIntensity: {
    type: 'number',
    defaultValue: 0.9,
    parser: numberRangeParser(0, 2, 0.9),
    description: '发光强度 (0-2)'
  },

  // ===== 旋转速度 =====
  taichiRotationSpeed: {
    type: 'number',
    defaultValue: 1,
    parser: numberRangeParser(0, 5, 1),
    description: '太极旋转速度 (0-5)'
  },
  baguaRotationSpeed: {
    type: 'number',
    defaultValue: 0.8,
    parser: numberRangeParser(0, 5, 0.8),
    description: '八卦旋转速度 (0-5)'
  },

  // ===== 尺寸配置 =====
  taichiSize: {
    type: 'number',
    defaultValue: 200,
    parser: intRangeParser(50, 400, 200),
    description: '太极图大小 (50-400)'
  },
  baguaRadius: {
    type: 'number',
    defaultValue: 280,
    parser: intRangeParser(100, 500, 280),
    description: '八卦半径 (100-500)'
  },

  // ===== 显示选项 =====
  showLabels: {
    type: 'boolean',
    defaultValue: true,
    parser: booleanParser(true),
    description: '是否显示卦名'
  },
  showParticles: {
    type: 'boolean',
    defaultValue: true,
    parser: booleanParser(true),
    description: '是否显示粒子'
  },
  showEnergyField: {
    type: 'boolean',
    defaultValue: true,
    parser: booleanParser(true),
    description: '是否显示能量场'
  },
  labelOffset: {
    type: 'number',
    defaultValue: 45,
    parser: intRangeParser(20, 100, 45),
    description: '标签偏移 (20-100)'
  },

  // ===== 粒子效果 =====
  particleCount: {
    type: 'number',
    defaultValue: 40,
    parser: intRangeParser(10, 100, 40),
    description: '粒子数量 (10-100)'
  },
  particleSpeed: {
    type: 'number',
    defaultValue: 1,
    parser: numberRangeParser(0.1, 3, 1),
    description: '粒子速度 (0.1-3)'
  },

  // ===== 3D 视角 =====
  viewAngle: {
    type: 'number',
    defaultValue: 30,
    parser: numberRangeParser(0, 60, 30),
    description: '视角角度 (0-60)'
  },
  perspectiveDistance: {
    type: 'number',
    defaultValue: 800,
    parser: intRangeParser(400, 2000, 800),
    description: '透视距离 (400-2000)'
  },

  // ===== 位置配置 =====
  verticalPosition: {
    type: 'number',
    defaultValue: 0.5,
    parser: numberRangeParser(0, 1, 0.5),
    description: '垂直位置 (0=顶部, 0.5=居中, 1=底部)'
  },

  // ===== 3D 效果 =====
  enable3D: {
    type: 'boolean',
    defaultValue: false,
    parser: booleanParser(false),
    description: '是否启用 3D 效果'
  },
  depth3D: {
    type: 'number',
    defaultValue: 15,
    parser: intRangeParser(5, 50, 15),
    description: '3D 深度 (5-50)'
  },

  // ===== 金光闪闪 =====
  enableGoldenSparkle: {
    type: 'boolean',
    defaultValue: true,
    parser: booleanParser(true),
    description: '是否启用金光闪闪'
  },
  sparkleDensity: {
    type: 'number',
    defaultValue: 30,
    parser: intRangeParser(10, 100, 30),
    description: '闪烁密度 (10-100)'
  },

  // ===== 神秘氛围 =====
  enableMysticalAura: {
    type: 'boolean',
    defaultValue: true,
    parser: booleanParser(true),
    description: '是否启用神秘氛围'
  },
  auraIntensity: {
    type: 'number',
    defaultValue: 0.6,
    parser: numberRangeParser(0, 1, 0.6),
    description: '氛围强度 (0-1)'
  },

  // ===== 入场动画 =====
  entranceDuration: {
    type: 'number',
    defaultValue: 30,
    parser: intRangeParser(10, 60, 30),
    description: '入场动画时长（帧）(10-60)'
  },

  // ===== 音频 =====
  audioEnabled: {
    type: 'boolean',
    defaultValue: false,
    parser: booleanParser(false),
    description: '是否启用音频'
  }
};

/**
 * 参数验证
 */
function validate(params) {
  return { valid: true };
}

/**
 * 构建渲染参数
 */
function buildRenderParams(reqParams, commonParams) {
  const result = { ...commonParams };

  for (const [name, def] of Object.entries(params)) {
    if (reqParams[name] !== undefined && reqParams[name] !== null && reqParams[name] !== '') {
      result[name] = def.parser ? def.parser(reqParams[name]) : reqParams[name];
    } else {
      result[name] = typeof def.defaultValue === 'function' ? def.defaultValue() : def.defaultValue;
    }
  }

  // 默认正方形尺寸
  if (!reqParams.width && !reqParams.height) {
    result.width = 720;
    result.height = 720;
  }

  return result;
}

module.exports = {
  config,
  params,
  validate,
  buildRenderParams
};