/**
 * 文字洪水特效参数配置
 * 
 * 定义 text-flood-effect 特效的所有参数
 */

const path = require('path');

/**
 * 特效基础信息
 */
const config = {
  id: 'text-flood-effect',
  name: '文字洪水特效',
  compositionId: 'TextFlood',
  path: path.join(__dirname, '../../effects/text-flood-effect')
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
    defaultValue: ['洪', '福', '财', '运', '吉', '祥'],
    parser: arrayParser(['洪', '福', '财', '运', '吉', '祥']),
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
    defaultValue: 0.3,
    parser: (v) => Math.max(0, Math.min(1, parseFloat(v) || 0.3)),
    description: 'mixed 模式下图片出现权重 (0-1)'
  },

  // ===== 祝福图案配置 =====
  blessingTypes: {
    type: 'array',
    defaultValue: [],
    parser: arrayParser([]),
    description: '祝福图案类型列表：goldCoin(金币) | moneyBag(金钱袋) | luckyBag(福袋) | redPacket(红包)'
  },
  blessingStyle: {
    type: 'object',
    defaultValue: {
      primaryColor: '#FFD700',
      secondaryColor: '#FFA500',
      enable3D: true,
      enableGlow: true,
      glowIntensity: 1.2
    },
    parser: objectParser({
      primaryColor: '#FFD700',
      secondaryColor: '#FFA500',
      enable3D: true,
      enableGlow: true,
      glowIntensity: 1.2
    }),
    description: '祝福图案样式配置'
  },

  // ===== 洪水参数 =====
  particleCount: {
    type: 'number',
    defaultValue: 60,
    parser: (v) => Math.max(10, Math.min(200, parseInt(v) || 60)),
    description: '粒子数量 (10-200)'
  },
  waveCount: {
    type: 'number',
    defaultValue: 5,
    parser: (v) => Math.max(1, Math.min(10, parseInt(v) || 5)),
    description: '波浪层数 (1-10)'
  },
  direction: {
    type: 'string',
    defaultValue: 'toward',
    description: '洪水方向：toward(从远到近，冲击感) | away(从近到远，退去感)'
  },

  // ===== 波浪配置 =====
  waveConfig: {
    type: 'object',
    defaultValue: {
      waveSpeed: 1.5,
      waveAmplitude: 60,
      waveFrequency: 2
    },
    parser: objectParser({
      waveSpeed: 1.5,
      waveAmplitude: 60,
      waveFrequency: 2
    }),
    description: '波浪配置'
  },

  // ===== 冲击效果配置 =====
  impactConfig: {
    type: 'object',
    defaultValue: {
      impactStart: 0.7,
      impactScale: 3,
      impactBlur: 8,
      impactShake: 15
    },
    parser: objectParser({
      impactStart: 0.7,
      impactScale: 3,
      impactBlur: 8,
      impactShake: 15
    }),
    description: '冲击效果配置'
  },

  // ===== 字体配置 =====
  fontSizeRange: {
    type: 'array',
    defaultValue: [60, 120],
    parser: arrayParser([60, 120]),
    description: '字体大小范围 [min, max]'
  },
  imageSizeRange: {
    type: 'array',
    defaultValue: [80, 150],
    parser: arrayParser([80, 150]),
    description: '图片大小范围 [min, max]'
  },
  blessingSizeRange: {
    type: 'array',
    defaultValue: [80, 150],
    parser: arrayParser([80, 150]),
    description: '祝福图案大小范围 [min, max]'
  },

  // ===== 透明度 =====
  opacityRange: {
    type: 'array',
    defaultValue: [0.7, 1],
    parser: arrayParser([0.7, 1]),
    description: '透明度范围 [min, max]'
  },

  // ===== 文字样式 =====
  textStyle: {
    type: 'object',
    defaultValue: {
      color: '#00d4ff',
      effect: 'glow',
      effectIntensity: 1.2,
      fontWeight: 900
    },
    parser: objectParser({
      color: '#00d4ff',
      effect: 'glow',
      effectIntensity: 1.2,
      fontWeight: 900
    }),
    description: '文字样式配置'
  },

  // ===== 图片样式 =====
  imageStyle: {
    type: 'object',
    defaultValue: {
      glow: true,
      glowColor: '#00d4ff',
      glowIntensity: 0.8,
      shadow: true
    },
    parser: objectParser({
      glow: true,
      glowColor: '#00d4ff',
      glowIntensity: 0.8,
      shadow: true
    }),
    description: '图片样式配置'
  },

  // ===== 视觉效果 =====
  enablePerspective: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v !== false && v !== 'false',
    description: '是否启用3D透视效果'
  },
  perspectiveStrength: {
    type: 'number',
    defaultValue: 800,
    parser: (v) => Math.max(100, Math.min(2000, parseFloat(v) || 800)),
    description: '透视强度 (100-2000)'
  },
  enableWaveBackground: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v !== false && v !== 'false',
    description: '是否启用波浪背景'
  },
  waveBackgroundColor: {
    type: 'string',
    defaultValue: '#0a3a5a',
    description: '波浪背景颜色'
  },
  waveBackgroundOpacity: {
    type: 'number',
    defaultValue: 0.4,
    parser: (v) => Math.max(0, Math.min(1, parseFloat(v) || 0.4)),
    description: '波浪背景透明度 (0-1)'
  },

  // ===== 随机种子 =====
  seed: {
    type: 'number',
    defaultValue: 42,
    parser: (v) => parseInt(v) || 42,
    description: '随机种子'
  },

  // ===== 音频 =====
  audioEnabled: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v !== false && v !== 'false',
    description: '是否启用音频'
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
