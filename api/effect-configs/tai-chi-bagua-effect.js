/**
 * 太极八卦图特效参数配置
 */

const path = require('path');

const config = {
  id: 'tai-chi-bagua-effect',
  name: '太极八卦图特效',
  compositionId: 'TaiChiBagua',
  path: path.join(__dirname, '../../effects/tai-chi-bagua-effect')
};

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
    parser: (v) => parseFloat(v) || 0.9,
    description: '发光强度'
  },

  // ===== 旋转速度 =====
  taichiRotationSpeed: {
    type: 'number',
    defaultValue: 1,
    parser: (v) => parseFloat(v) || 1,
    description: '太极旋转速度'
  },
  baguaRotationSpeed: {
    type: 'number',
    defaultValue: 0.8,
    parser: (v) => parseFloat(v) || 0.8,
    description: '八卦旋转速度'
  },

  // ===== 尺寸配置 =====
  taichiSize: {
    type: 'number',
    defaultValue: 200,
    parser: (v) => parseInt(v) || 200,
    description: '太极图大小'
  },
  baguaRadius: {
    type: 'number',
    defaultValue: 280,
    parser: (v) => parseInt(v) || 280,
    description: '八卦半径'
  },

  // ===== 显示选项 =====
  showLabels: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v !== false && v !== 'false',
    description: '是否显示卦名'
  },
  showParticles: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v !== false && v !== 'false',
    description: '是否显示粒子'
  },
  showEnergyField: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v !== false && v !== 'false',
    description: '是否显示能量场'
  },
  labelOffset: {
    type: 'number',
    defaultValue: 45,
    parser: (v) => parseInt(v) || 45,
    description: '标签偏移'
  },

  // ===== 粒子效果 =====
  particleCount: {
    type: 'number',
    defaultValue: 40,
    parser: (v) => parseInt(v) || 40,
    description: '粒子数量'
  },
  particleSpeed: {
    type: 'number',
    defaultValue: 1,
    parser: (v) => parseFloat(v) || 1,
    description: '粒子速度'
  },

  // ===== 3D 视角 =====
  viewAngle: {
    type: 'number',
    defaultValue: 30,
    parser: (v) => parseFloat(v) || 30,
    description: '视角角度'
  },
  perspectiveDistance: {
    type: 'number',
    defaultValue: 800,
    parser: (v) => parseInt(v) || 800,
    description: '透视距离'
  },

  // ===== 位置配置 =====
  verticalPosition: {
    type: 'number',
    defaultValue: 0.5,
    parser: (v) => parseFloat(v) || 0.5,
    description: '垂直位置'
  },

  // ===== 3D 效果 =====
  enable3D: {
    type: 'boolean',
    defaultValue: false,
    parser: (v) => v === 'true' || v === true,
    description: '是否启用 3D 效果'
  },
  depth3D: {
    type: 'number',
    defaultValue: 15,
    parser: (v) => parseInt(v) || 15,
    description: '3D 深度'
  },

  // ===== 金光闪闪 =====
  enableGoldenSparkle: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v !== false && v !== 'false',
    description: '是否启用金光闪闪'
  },
  sparkleDensity: {
    type: 'number',
    defaultValue: 30,
    parser: (v) => parseInt(v) || 30,
    description: '闪烁密度'
  },

  // ===== 神秘氛围 =====
  enableMysticalAura: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v !== false && v !== 'false',
    description: '是否启用神秘氛围'
  },
  auraIntensity: {
    type: 'number',
    defaultValue: 0.6,
    parser: (v) => parseFloat(v) || 0.6,
    description: '氛围强度'
  }
};

function validate(params) {
  return { valid: true };
}

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
