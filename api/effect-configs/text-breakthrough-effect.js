/**
 * 文字破屏特效参数配置
 * 支持文字、图片、祝福图案的混合输入
 */

const path = require('path');

const config = {
  id: 'text-breakthrough-effect',
  name: '文字破屏特效',
  compositionId: 'TextBreakthrough',
  path: path.join(__dirname, '../../effects/text-breakthrough-effect')
};

/**
 * 祝福图案类型
 */
const BLESSING_TYPES = ['goldCoin', 'moneyBag', 'luckyBag', 'redPacket'];

const params = {
  // ===== 混合输入配置 =====
  contentType: {
    type: 'string',
    defaultValue: 'mixed',
    description: '内容类型：text | image | blessing | mixed'
  },
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
  images: {
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
    description: '图片列表（相对于 public 目录）'
  },
  blessingTypes: {
    type: 'array',
    defaultValue: BLESSING_TYPES,
    parser: (v) => {
      if (Array.isArray(v)) return v;
      if (typeof v === 'string') {
        try {
          return JSON.parse(v);
        } catch {
          return v.split(',').map(w => w.trim()).filter(w => BLESSING_TYPES.includes(w));
        }
      }
      return BLESSING_TYPES;
    },
    description: '祝福图案类型：goldCoin | moneyBag | luckyBag | redPacket'
  },
  imageWeight: {
    type: 'number',
    defaultValue: 0.3,
    parser: (v) => parseFloat(v) || 0.3,
    description: '图片出现权重（0-1，mixed 模式下有效）'
  },
  blessingStyle: {
    type: 'object',
    defaultValue: {
      primaryColor: '#FFD700',
      secondaryColor: '#FFA500',
      enable3D: true,
      enableGlow: true,
      glowIntensity: 1.5
    },
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
    description: '祝福图案样式配置'
  },

  // ===== 尺寸配置 =====
  fontSize: {
    type: 'number',
    defaultValue: 120,
    parser: (v) => parseInt(v) || 120,
    description: '字体大小'
  },
  imageSize: {
    type: 'number',
    defaultValue: 150,
    parser: (v) => parseInt(v) || 150,
    description: '图片大小'
  },
  blessingSize: {
    type: 'number',
    defaultValue: 120,
    parser: (v) => parseInt(v) || 120,
    description: '祝福图案大小'
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

  // ===== 内容间隔 =====
  contentInterval: {
    type: 'number',
    defaultValue: 50,
    parser: (v) => parseInt(v) || 50,
    description: '内容间隔（帧）'
  },

  // ===== 运动方向 =====
  direction: {
    type: 'string',
    defaultValue: 'top-down',
    description: '运动方向：top-down | bottom-up'
  },

  // ===== 排列方式 =====
  arrangement: {
    type: 'string',
    defaultValue: 'circular',
    description: '排列方式：horizontal | vertical | circular | stacked'
  },
  arrangementSpacing: {
    type: 'number',
    defaultValue: 0.25,
    parser: (v) => parseFloat(v) || 0.25,
    description: '排列间距'
  },

  // ===== 位置偏移 =====
  centerY: {
    type: 'number',
    defaultValue: 0,
    parser: (v) => parseFloat(v) || 0,
    description: 'Y轴中心偏移（-0.5到0.5）'
  },

  // ===== 循环播放 =====
  enableLoop: {
    type: 'boolean',
    defaultValue: false,
    parser: (v) => v === true || v === 'true',
    description: '启用循环播放'
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
  const hasText = params.words && params.words.length > 0;
  const hasImages = params.images && params.images.length > 0;
  
  // blessing 模式始终可用
  if (params.contentType === 'blessing') {
    return { valid: true };
  }
  
  if (params.contentType === 'text' && !hasText) {
    return { valid: false, error: 'text 模式需要提供文字列表 (words)' };
  }
  
  if (params.contentType === 'image' && !hasImages) {
    return { valid: false, error: 'image 模式需要提供图片列表 (images)' };
  }
  
  if (params.contentType === 'mixed' && !hasText && !hasImages) {
    return { valid: false, error: 'mixed 模式至少需要提供文字或图片' };
  }
  
  return { valid: true };
}

/**
 * 计算内容数量
 */
function getContentCount(params) {
  if (params.contentType === 'text') {
    return params.words?.length || 0;
  }
  if (params.contentType === 'image') {
    return params.images?.length || 0;
  }
  if (params.contentType === 'blessing') {
    return params.blessingTypes?.length || BLESSING_TYPES.length;
  }
  // mixed 模式
  const textCount = params.words?.length || 0;
  const imageCount = params.images?.length || 0;
  const blessingCount = params.blessingTypes?.length || BLESSING_TYPES.length;
  return Math.max(textCount, imageCount, blessingCount, 4);
}

/**
 * 时长计算
 */
function calculateDuration(params) {
  if (params.duration && params.duration !== 10) return params.duration;
  
  const contentCount = getContentCount(params);
  const totalAnimation = params.approachDuration + params.breakthroughDuration + params.holdDuration;
  const lastItemStart = (contentCount - 1) * params.contentInterval;
  const totalFrames = lastItemStart + totalAnimation + (params.enableFallDown ? params.fallDownDuration : 0) + 20;
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

  // 自动计算时长（非循环模式）
  if (!reqParams.duration && !result.enableLoop) {
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