/**
 * 文字破屏特效参数配置
 */

const path = require('path');

const config = {
  id: 'text-breakthrough-effect',
  name: '文字破屏特效',
  compositionId: 'TextBreakthrough',
  path: path.join(__dirname, '../../effects/text-breakthrough-effect')
};

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
    description: '文字列表'
  },

  // ===== 文字组配置 =====
  textGroups: {
    type: 'array',
    defaultValue: null,
    parser: (v) => {
      if (!v) return null;
      if (typeof v === 'string') {
        try {
          return JSON.parse(v);
        } catch {
          return null;
        }
      }
      return v;
    },
    description: '文字组配置'
  },

  // ===== 定格位置 =====
  finalPosition: {
    type: 'object',
    defaultValue: null,
    parser: (v) => {
      if (!v) return null;
      if (typeof v === 'string') {
        try {
          return JSON.parse(v);
        } catch {
          return null;
        }
      }
      return v;
    },
    description: '定格位置配置'
  },

  // ===== 字体配置 =====
  fontSize: {
    type: 'number',
    defaultValue: 120,
    parser: (v) => parseInt(v) || 120,
    description: '字体大小'
  },
  fontFamily: {
    type: 'string',
    defaultValue: 'PingFang SC, Microsoft YaHei, SimHei, sans-serif',
    description: '字体'
  },
  fontWeight: {
    type: 'number',
    defaultValue: 900,
    parser: (v) => parseInt(v) || 900,
    description: '字重'
  },

  // ===== 颜色配置 =====
  textColor: {
    type: 'string',
    defaultValue: '#ffd700',
    description: '文字颜色'
  },
  glowColor: {
    type: 'string',
    defaultValue: '#ffaa00',
    description: '发光颜色'
  },
  secondaryGlowColor: {
    type: 'string',
    defaultValue: '#ff6600',
    description: '次级发光颜色'
  },
  glowIntensity: {
    type: 'number',
    defaultValue: 1.5,
    parser: (v) => parseFloat(v) || 1.5,
    description: '发光强度'
  },
  bevelDepth: {
    type: 'number',
    defaultValue: 3,
    parser: (v) => parseFloat(v) || 3,
    description: '斜面深度'
  },

  // ===== 3D 透视 =====
  startZ: {
    type: 'number',
    defaultValue: 2000,
    parser: (v) => parseInt(v) || 2000,
    description: '起始 Z 位置'
  },
  endZ: {
    type: 'number',
    defaultValue: -100,
    parser: (v) => parseInt(v) || -100,
    description: '结束 Z 位置'
  },

  // ===== 动画时长 =====
  approachDuration: {
    type: 'number',
    defaultValue: 45,
    parser: (v) => parseInt(v) || 45,
    description: '接近时长（帧）'
  },
  breakthroughDuration: {
    type: 'number',
    defaultValue: 20,
    parser: (v) => parseInt(v) || 20,
    description: '突破时长（帧）'
  },
  holdDuration: {
    type: 'number',
    defaultValue: 40,
    parser: (v) => parseInt(v) || 40,
    description: '定格时长（帧）'
  },

  // ===== 冲击效果 =====
  impactScale: {
    type: 'number',
    defaultValue: 1.4,
    parser: (v) => parseFloat(v) || 1.4,
    description: '冲击缩放'
  },
  impactRotation: {
    type: 'number',
    defaultValue: 12,
    parser: (v) => parseFloat(v) || 12,
    description: '冲击旋转角度'
  },
  shakeIntensity: {
    type: 'number',
    defaultValue: 10,
    parser: (v) => parseFloat(v) || 10,
    description: '震动强度'
  },

  // ===== 组间延迟 =====
  groupInterval: {
    type: 'number',
    defaultValue: 50,
    parser: (v) => parseInt(v) || 50,
    description: '组间延迟（帧）'
  },

  // ===== 运动方向 =====
  direction: {
    type: 'string',
    defaultValue: 'top-down',
    description: '运动方向'
  },

  // ===== 下落消失 =====
  enableFallDown: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v !== false && v !== 'false',
    description: '是否启用下落消失'
  },
  fallDownDuration: {
    type: 'number',
    defaultValue: 40,
    parser: (v) => parseInt(v) || 40,
    description: '下落时长（帧）'
  },
  fallDownEndY: {
    type: 'number',
    defaultValue: 0.2,
    parser: (v) => parseFloat(v) || 0.2,
    description: '下落结束位置'
  }
};

function validate(params) {
  if ((!params.words || params.words.length === 0) && (!params.textGroups || params.textGroups.length === 0)) {
    return { valid: false, error: '请提供文字列表 (words) 或文字组配置 (textGroups)' };
  }
  return { valid: true };
}

/**
 * 时长计算
 */
function calculateDuration(params) {
  if (params.duration && params.duration !== 10) return params.duration;
  
  const groupInterval = params.groupInterval || 50;
  const totalAnimation = params.approachDuration + params.breakthroughDuration + params.holdDuration;
  const wordsCount = params.textGroups ? params.textGroups.length : (params.words ? params.words.length : 0);
  const lastGroupStart = (wordsCount - 1) * groupInterval;
  const totalFrames = lastGroupStart + totalAnimation + (params.enableFallDown ? params.fallDownDuration : 0) + 20;
  return Math.ceil(totalFrames / params.fps);
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

  // 构建 textGroups（如果没有提供）
  if (!result.textGroups && result.words && result.words.length > 0) {
    result.textGroups = result.words.map(w => ({ texts: [w], groupDelay: result.groupInterval }));
  }

  // 自动计算时长
  if (!reqParams.duration) {
    result.duration = calculateDuration(result);
  }

  return result;
}

module.exports = {
  config,
  params,
  validate,
  buildRenderParams,
  calculateDuration
};
