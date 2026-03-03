/**
 * 文字旋涡特效参数配置
 * 
 * 定义 text-vortex-effect 特效的所有参数
 */

const path = require('path');

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
 * 数组解析器工厂函数
 */
const arrayParser = (defaultValue = []) => (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') {
    try {
      return JSON.parse(v);
    } catch {
      return v.split(',').map(w => w.trim()).filter(w => w);
    }
  }
  return defaultValue;
};

/**
 * 对象解析器工厂函数
 */
const objectParser = (defaultValue = {}) => (v) => {
  if (typeof v === 'string') {
    try {
      return JSON.parse(v);
    } catch {
      return defaultValue;
    }
  }
  return v || defaultValue;
};

/**
 * 特效特有参数定义
 */
const params = {
  // ===== 内容类型 =====
  contentType: {
    type: 'string',
    defaultValue: 'text',
    description: '内容类型：text(纯文字) | image(纯图片) | blessing(祝福图案) | mixed(混合模式)'
  },

  // ===== 文字内容 =====
  words: {
    type: 'array',
    defaultValue: [],
    parser: arrayParser([]),
    description: '文字列表'
  },

  // ===== 图片内容 =====
  images: {
    type: 'array',
    defaultValue: [],
    parser: arrayParser([]),
    description: '图片路径列表（支持：1. public目录相对路径如"coin.png" 2. 网络URL如"https://example.com/img.png" 3. Data URL base64编码）'
  },
  imageWeight: {
    type: 'number',
    defaultValue: 0.5,
    parser: (v) => Math.max(0, Math.min(1, parseFloat(v) || 0.5)),
    description: 'mixed 模式下图片出现权重 (0-1)'
  },

  // ===== 祝福图案配置 =====
  blessingTypes: {
    type: 'array',
    defaultValue: [],
    parser: arrayParser([]),
    description: '祝福图案类型列表：goldCoin | moneyBag | luckyBag | redPacket'
  },
  blessingStyle: {
    type: 'object',
    defaultValue: {
      primaryColor: '#FFD700',
      secondaryColor: '#FFA500',
      enable3D: true,
      enableGlow: true,
      glowIntensity: 1
    },
    parser: objectParser({
      primaryColor: '#FFD700',
      secondaryColor: '#FFA500',
      enable3D: true,
      enableGlow: true,
      glowIntensity: 1
    }),
    description: '祝福图案样式配置'
  },

  // ===== 旋涡配置 =====
  particleCount: {
    type: 'number',
    defaultValue: 80,
    parser: (v) => Math.max(20, Math.min(200, parseInt(v) || 80)),
    description: '粒子数量 (20-200)'
  },
  ringCount: {
    type: 'number',
    defaultValue: 6,
    parser: (v) => Math.max(2, Math.min(12, parseInt(v) || 6)),
    description: '环的数量 (2-12)'
  },
  rotationDirection: {
    type: 'string',
    defaultValue: 'clockwise',
    parser: (v) => ['clockwise', 'counterclockwise'].includes(v) ? v : 'clockwise',
    description: '旋转方向：clockwise(顺时针) | counterclockwise(逆时针)'
  },
  rotationSpeed: {
    type: 'number',
    defaultValue: 1.5,
    parser: (v) => Math.max(0.5, Math.min(4, parseFloat(v) || 1.5)),
    description: '旋转速度 (0.5-4)'
  },
  expansionDuration: {
    type: 'number',
    defaultValue: 6,
    parser: (v) => Math.max(2, Math.min(15, parseFloat(v) || 6)),
    description: '散开动画时长（秒）(2-15)'
  },
  initialRadius: {
    type: 'number',
    defaultValue: 30,
    parser: (v) => Math.max(10, Math.min(100, parseFloat(v) || 30)),
    description: '初始中心半径 (10-100)'
  },
  maxRadius: {
    type: 'number',
    defaultValue: 350,
    parser: (v) => Math.max(150, Math.min(500, parseFloat(v) || 350)),
    description: '最大扩散半径 (150-500)'
  },

  // ===== 3D效果配置 =====
  depth3D: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v === true || v === 'true',
    description: '是否启用3D效果'
  },
  depthIntensity: {
    type: 'number',
    defaultValue: 0.4,
    parser: (v) => Math.max(0, Math.min(1, parseFloat(v) || 0.4)),
    description: '3D深度强度 (0-1)'
  },
  perspective: {
    type: 'number',
    defaultValue: 800,
    parser: (v) => Math.max(400, Math.min(2000, parseInt(v) || 800)),
    description: '透视距离 (400-2000)'
  },

  // ===== 尺寸配置 =====
  fontSizeRange: {
    type: 'array',
    defaultValue: [30, 70],
    parser: arrayParser([30, 70]),
    description: '字体大小范围 [min, max]'
  },
  imageSizeRange: {
    type: 'array',
    defaultValue: [40, 90],
    parser: arrayParser([40, 90]),
    description: '图片大小范围 [min, max]'
  },
  blessingSizeRange: {
    type: 'array',
    defaultValue: [30, 70],
    parser: arrayParser([30, 70]),
    description: '祝福图案大小范围 [min, max]'
  },

  // ===== 动画配置 =====
  entranceDuration: {
    type: 'number',
    defaultValue: 25,
    parser: (v) => Math.max(10, Math.min(60, parseInt(v) || 25)),
    description: '入场动画时长（帧）(10-60)'
  },
  fadeInEnabled: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v === true || v === 'true',
    description: '是否启用淡入效果'
  },
  spiralTightness: {
    type: 'number',
    defaultValue: 1.2,
    parser: (v) => Math.max(0.5, Math.min(2, parseFloat(v) || 1.2)),
    description: '螺旋紧密程度 (0.5-2)'
  },
  pulseEnabled: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v === true || v === 'true',
    description: '是否启用脉冲效果'
  },
  pulseIntensity: {
    type: 'number',
    defaultValue: 0.15,
    parser: (v) => Math.max(0, Math.min(0.5, parseFloat(v) || 0.15)),
    description: '脉冲强度 (0-0.5)'
  },

  // ===== 震撼效果 =====
  shockwaveEnabled: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v === true || v === 'true',
    description: '是否启用冲击波效果'
  },
  shockwaveTiming: {
    type: 'number',
    defaultValue: 3,
    parser: (v) => Math.max(1, Math.min(10, parseFloat(v) || 3)),
    description: '冲击波触发时机（秒）(1-10)'
  },
  suctionEffect: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v === true || v === 'true',
    description: '是否启用吸入效果'
  },
  suctionIntensity: {
    type: 'number',
    defaultValue: 0.3,
    parser: (v) => Math.max(0, Math.min(1, parseFloat(v) || 0.3)),
    description: '吸入效果强度 (0-1)'
  },

  // ===== 文字样式 =====
  textStyle: {
    type: 'object',
    defaultValue: {
      color: '#FFD700',
      effect: 'gold3d',
      effectIntensity: 0.9,
      fontWeight: 700
    },
    parser: objectParser({
      color: '#FFD700',
      effect: 'gold3d',
      effectIntensity: 0.9,
      fontWeight: 700
    }),
    description: '文字样式配置'
  },

  // ===== 随机种子 =====
  seed: {
    type: 'number',
    defaultValue: undefined,
    parser: (v) => v ? parseInt(v) : undefined,
    description: '随机种子（可选，不设置则随机）'
  }
};

/**
 * 参数验证函数
 * @param {Object} params - 解析后的参数
 * @returns {{ valid: boolean, error?: string }}
 */
function validate(params) {
  const { contentType, words, images, blessingTypes } = params;

  // 根据内容类型验证必要参数
  if (contentType === 'text') {
    if (!words || words.length === 0) {
      return { valid: false, error: 'text 模式需要提供文字列表 (words)' };
    }
  } else if (contentType === 'image') {
    if (!images || images.length === 0) {
      return { valid: false, error: 'image 模式需要提供图片列表 (images)' };
    }
  } else if (contentType === 'blessing') {
    if (!blessingTypes || blessingTypes.length === 0) {
      return { valid: false, error: 'blessing 模式需要提供祝福图案类型列表 (blessingTypes)' };
    }
  } else if (contentType === 'mixed') {
    // mixed 模式至少需要提供一种内容
    const hasContent = (words && words.length > 0) || 
                       (images && images.length > 0) || 
                       (blessingTypes && blessingTypes.length > 0);
    if (!hasContent) {
      return { valid: false, error: 'mixed 模式需要至少提供 words、images 或 blessingTypes 中的一种' };
    }
  }

  return { valid: true };
}

/**
 * 构建渲染参数
 * 从请求参数构建完整的渲染参数
 * @param {Object} reqParams - 请求参数
 * @param {Object} commonParams - 已处理的公共参数
 * @returns {Object}
 */
function buildRenderParams(reqParams, commonParams) {
  const result = { ...commonParams };

  // 处理特有参数
  for (const [name, def] of Object.entries(params)) {
    if (reqParams[name] !== undefined && reqParams[name] !== null && reqParams[name] !== '') {
      result[name] = def.parser ? def.parser(reqParams[name]) : reqParams[name];
    } else if (def.defaultValue !== undefined) {
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
