/**
 * 文字雨特效参数配置
 * 
 * 定义 text-rain-effect 特效的所有参数
 */

const path = require('path');

/**
 * 特效基础信息
 */
const config = {
  id: 'text-rain-effect',
  name: '文字雨特效',
  compositionId: 'TextRain',
  path: path.join(__dirname, '../../effects/text-rain-effect')
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
    description: '图片路径列表 (相对于 public 目录)'
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
    description: '祝福图案类型列表：goldCoin(金币) | moneyBag(金钱袋) | luckyBag(福袋) | redPacket(红包)'
  },
  blessingStyle: {
    type: 'object',
    defaultValue: {
      primaryColor: '#FFD700',
      secondaryColor: '#FFA500',
      enable3D: true,
      enableGlow: true,
      glowIntensity: 1,
      animated: false
    },
    parser: objectParser({
      primaryColor: '#FFD700',
      secondaryColor: '#FFA500',
      enable3D: true,
      enableGlow: true,
      glowIntensity: 1,
      animated: false
    }),
    description: '祝福图案样式配置'
  },

  // ===== 文字方向 =====
  textDirection: {
    type: 'string',
    defaultValue: 'horizontal',
    description: '文字排列方向：horizontal(横排) | vertical(竖排)'
  },

  // ===== 运动方向 =====
  fallDirection: {
    type: 'string',
    defaultValue: 'down',
    description: '雨滴运动方向：down(从上到下) | up(从下到上)'
  },

  // ===== 字体配置 =====
  fontSizeRange: {
    type: 'array',
    defaultValue: [80, 160],
    parser: arrayParser([80, 160]),
    description: '字体大小范围 [min, max]'
  },
  imageSizeRange: {
    type: 'array',
    defaultValue: [80, 150],
    parser: arrayParser([80, 150]),
    description: '图片大小范围 [min, max]'
  },

  // ===== 运动参数 =====
  fallSpeed: {
    type: 'number',
    defaultValue: 0.15,
    parser: (v) => parseFloat(v) || 0.15,
    description: '下落/上升速度系数'
  },
  density: {
    type: 'number',
    defaultValue: 2,
    parser: (v) => parseFloat(v) || 2,
    description: '雨滴密度'
  },
  laneCount: {
    type: 'number',
    defaultValue: 6,
    parser: (v) => parseInt(v) || 6,
    description: '列道数量'
  },
  minVerticalGap: {
    type: 'number',
    defaultValue: 100,
    parser: (v) => parseInt(v) || 100,
    description: '最小垂直间距'
  },

  // ===== 透明度和旋转 =====
  opacityRange: {
    type: 'array',
    defaultValue: [0.6, 1],
    parser: arrayParser([0.6, 1]),
    description: '透明度范围 [min, max]'
  },
  rotationRange: {
    type: 'array',
    defaultValue: [-10, 10],
    parser: arrayParser([-10, 10]),
    description: '旋转角度范围 [min, max]'
  },

  // ===== 文字样式 =====
  textStyle: {
    type: 'object',
    defaultValue: {
      color: '#ffd700',
      effect: 'gold3d',
      effectIntensity: 0.9,
      fontWeight: 700,
      letterSpacing: 4
    },
    parser: objectParser({
      color: '#ffd700',
      effect: 'gold3d',
      effectIntensity: 0.9,
      fontWeight: 700,
      letterSpacing: 4
    }),
    description: '文字样式配置'
  },

  // ===== 音频（覆盖默认值） =====
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
