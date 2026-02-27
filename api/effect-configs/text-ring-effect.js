/**
 * 文字环绕特效参数配置
 * 
 * 定义 text-ring-effect 特效的所有参数
 */

const path = require('path');

/**
 * 特效基础信息
 */
const config = {
  id: 'text-ring-effect',
  name: '金色发光立体字环绕特效',
  compositionId: 'TextRing',
  path: path.join(__dirname, '../../effects/text-ring-effect')
};

/**
 * 特效特有参数定义
 */
const params = {
  // ===== 文字内容 =====
  words: {
    type: 'array',
    defaultValue: [],
    parser: (v) => {
      if (Array.isArray(v)) return v;
      if (typeof v === 'string') {
        try {
          return JSON.parse(v);
        } catch {
          return v.split(',').map(w => w.trim()).filter(w => w);
        }
      }
      return [];
    },
    required: true,
    description: '文字列表'
  },

  // ===== 字体配置 =====
  fontSize: {
    type: 'number',
    defaultValue: 70,
    parser: (v) => parseInt(v) || 70,
    description: '字体大小'
  },

  // ===== 透明度 =====
  opacity: {
    type: 'number',
    defaultValue: 1,
    parser: (v) => parseFloat(v) || 1,
    description: '透明度'
  },

  // ===== 环绕配置 =====
  ringRadius: {
    type: 'number',
    defaultValue: 250,
    parser: (v) => parseFloat(v) || 250,
    description: '环绕半径'
  },
  rotationSpeed: {
    type: 'number',
    defaultValue: 0.8,
    parser: (v) => parseFloat(v) || 0.8,
    description: '旋转速度'
  },

  // ===== 发光效果 =====
  glowIntensity: {
    type: 'number',
    defaultValue: 0.9,
    parser: (v) => parseFloat(v) || 0.9,
    description: '发光强度'
  },

  // ===== 3D 效果 =====
  depth3d: {
    type: 'number',
    defaultValue: 8,
    parser: (v) => parseInt(v) || 8,
    description: '3D深度层数'
  },
  cylinderHeight: {
    type: 'number',
    defaultValue: 400,
    parser: (v) => parseFloat(v) || 400,
    description: '圆柱体高度'
  },
  perspective: {
    type: 'number',
    defaultValue: 1000,
    parser: (v) => parseInt(v) || 1000,
    description: '透视距离'
  },

  // ===== 模式配置 =====
  mode: {
    type: 'string',
    defaultValue: 'vertical',
    description: '模式：vertical | positions'
  },
  verticalPosition: {
    type: 'number',
    defaultValue: 0.5,
    parser: (v) => parseFloat(v) || 0.5,
    description: '垂直位置（0=顶部, 0.5=中心, 1=底部）'
  }
};

/**
 * 参数验证函数
 * @param {Object} params - 解析后的参数
 * @returns {{ valid: boolean, error?: string }}
 */
function validate(params) {
  if (!params.words || params.words.length === 0) {
    return { valid: false, error: '请提供文字列表 (words)' };
  }
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

  return result;
}

module.exports = {
  config,
  params,
  validate,
  buildRenderParams
};
