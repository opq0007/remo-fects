/**
 * 文字万花筒特效参数配置
 * 支持从中心向外圆形扩散的3D立体效果
 */

const path = require('path');

const config = {
  id: 'text-kaleidoscope-effect',
  name: '文字万花筒特效',
  compositionId: 'TextKaleidoscope',
  path: path.join(__dirname, '../../effects/text-kaleidoscope-effect')
};

/**
 * 默认颜色配置
 */
const DEFAULT_COLORS = [
  '#FFD700', // 金色
  '#FF6B6B', // 珊瑚红
  '#4ECDC4', // 青绿
  '#45B7D1', // 天蓝
  '#96CEB4', // 薄荷绿
  '#FFEAA7', // 淡金
];

const params = {
  // ===== 混合输入配置 =====
  contentType: {
    type: 'string',
    defaultValue: 'text',
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
    description: '图片列表'
  },
  blessingTypes: {
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
    description: '祝福图案类型：goldCoin | moneyBag | luckyBag | redPacket'
  },
  imageWeight: {
    type: 'number',
    defaultValue: 0.5,
    parser: (v) => parseFloat(v) || 0.5,
    description: '图片出现权重'
  },
  blessingStyle: {
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
    description: '祝福图案样式配置'
  },

  // ===== 中心焦点文字配置（独立） =====
  focusWords: {
    type: 'array',
    defaultValue: null,
    parser: (v) => {
      if (!v) return null;
      if (Array.isArray(v)) return v.length > 0 ? v : null;
      if (typeof v === 'string') {
        try {
          const arr = JSON.parse(v);
          return arr.length > 0 ? arr : null;
        } catch {
          const arr = v.split(',').map(w => w.trim()).filter(w => w);
          return arr.length > 0 ? arr : null;
        }
      }
      return null;
    },
    description: '中心焦点文字列表（不配置则不渲染焦点文字）'
  },

  // ===== 字体配置 =====
  fontSize: {
    type: 'number',
    defaultValue: 60,
    parser: (v) => parseInt(v) || 60,
    description: '基础字体大小'
  },
  focusFontSize: {
    type: 'number',
    defaultValue: null,
    parser: (v) => v ? parseInt(v) : null,
    description: '焦点文字字体大小（默认为 fontSize * 2）'
  },

  // ===== 颜色配置 =====
  colors: {
    type: 'array',
    defaultValue: DEFAULT_COLORS,
    parser: (v) => {
      if (Array.isArray(v)) return v.length > 0 ? v : DEFAULT_COLORS;
      if (typeof v === 'string') {
        try {
          const arr = JSON.parse(v);
          return arr.length > 0 ? arr : DEFAULT_COLORS;
        } catch {
          const arr = v.split(',').map(c => c.trim()).filter(c => c);
          return arr.length > 0 ? arr : DEFAULT_COLORS;
        }
      }
      return DEFAULT_COLORS;
    },
    description: '文字颜色列表'
  },
  glowColor: {
    type: 'string',
    defaultValue: '#ffd700',
    description: '发光颜色'
  },
  glowIntensity: {
    type: 'number',
    defaultValue: 1.2,
    parser: (v) => parseFloat(v) || 1.2,
    description: '发光强度'
  },

  // ===== 万花筒配置 =====
  itemCount: {
    type: 'number',
    defaultValue: 60,
    parser: (v) => parseInt(v) || 60,
    description: '万花筒元素数量'
  },
  ringCount: {
    type: 'number',
    defaultValue: 5,
    parser: (v) => parseInt(v) || 5,
    description: '圆环数量'
  },
  rotationSpeed: {
    type: 'number',
    defaultValue: 0.3,
    parser: (v) => parseFloat(v) || 0.3,
    description: '旋转速度（圈/秒）'
  },

  // ===== 动画配置 =====
  expansionDuration: {
    type: 'number',
    defaultValue: 120,
    parser: (v) => parseInt(v) || 120,
    description: '扩散动画时长（帧）'
  },
  fadeInDuration: {
    type: 'number',
    defaultValue: 60,
    parser: (v) => parseInt(v) || 60,
    description: '淡入时长（帧）'
  },

  // ===== 中心爆发配置 =====
  enableCenterBurst: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v === true || v === 'true',
    description: '启用中心爆发效果'
  },
  burstParticleCount: {
    type: 'number',
    defaultValue: 20,
    parser: (v) => parseInt(v) || 20,
    description: '每次爆发粒子数'
  },
  burstInterval: {
    type: 'number',
    defaultValue: 60,
    parser: (v) => parseInt(v) || 60,
    description: '爆发间隔（帧）'
  },

  // ===== 焦点文字配置（仅当 focusWords 有值时生效） =====
  focusTextInterval: {
    type: 'number',
    defaultValue: 90,
    parser: (v) => parseInt(v) || 90,
    description: '焦点文字间隔（帧）'
  },
  focusTextDuration: {
    type: 'number',
    defaultValue: 60,
    parser: (v) => parseInt(v) || 60,
    description: '焦点文字持续时间（帧）'
  },

  // ===== 3D 效果 =====
  enable3D: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v !== false && v !== 'false',
    description: '启用3D效果'
  },

  // ===== 脉冲效果 =====
  enablePulse: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v !== false && v !== 'false',
    description: '启用脉冲效果'
  }
};

function validate(params) {
  const hasText = params.words && params.words.length > 0;
  const hasImages = params.images && params.images.length > 0;
  const hasBlessing = params.blessingTypes && params.blessingTypes.length > 0;
  
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
  
  if (params.contentType === 'mixed' && !hasText && !hasImages && !hasBlessing) {
    return { valid: false, error: 'mixed 模式至少需要提供文字、图片或祝福图案之一' };
  }
  
  return { valid: true };
}

/**
 * 时长计算函数
 */
function calculateDuration(params) {
  if (params.duration && params.duration !== 10) return params.duration;
  
  // 基础时长：淡入 + 扩散动画 + 额外缓冲
  const baseDuration = params.fadeInDuration + params.expansionDuration + 60;
  
  // 如果有焦点文字，确保至少能显示一轮
  if (params.focusWords && params.focusWords.length > 0) {
    const focusCycleDuration = params.focusTextInterval + params.focusTextDuration;
    return Math.max(baseDuration, focusCycleDuration + 60) / params.fps;
  }
  
  return Math.ceil(baseDuration / params.fps);
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