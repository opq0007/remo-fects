/**
 * 文字龙卷风特效参数配置
 * 
 * 定义 text-tornado-effect 特效的所有参数
 */

const path = require('path');

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

  // ===== 龙卷风配置 =====
  particleCount: {
    type: 'number',
    defaultValue: 60,
    parser: (v) => Math.max(10, Math.min(200, parseInt(v) || 60)),
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
    parser: (v) => Math.max(0, Math.min(1, parseFloat(v) || 0.3)),
    description: '上升速度 (0-1)'
  },
  funnelHeight: {
    type: 'number',
    defaultValue: 0.85,
    parser: (v) => Math.max(0.3, Math.min(1, parseFloat(v) || 0.85)),
    description: '漏斗高度比例 (0.3-1)'
  },

  // ===== 尺寸配置 =====
  fontSizeRange: {
    type: 'array',
    defaultValue: [40, 80],
    parser: arrayParser([40, 80]),
    description: '字体大小范围 [min, max]'
  },
  imageSizeRange: {
    type: 'array',
    defaultValue: [50, 100],
    parser: arrayParser([50, 100]),
    description: '图片大小范围 [min, max]'
  },
  blessingSizeRange: {
    type: 'array',
    defaultValue: [40, 80],
    parser: arrayParser([40, 80]),
    description: '祝福图案大小范围 [min, max]'
  },

  // ===== 动画配置 =====
  zoomIntensity: {
    type: 'number',
    defaultValue: 0.5,
    parser: (v) => Math.max(0, Math.min(2, parseFloat(v) || 0.5)),
    description: '镜头拉近强度 (0-2)'
  },
  entranceDuration: {
    type: 'number',
    defaultValue: 30,
    parser: (v) => Math.max(10, Math.min(60, parseInt(v) || 30)),
    description: '入场动画时长（帧）'
  },
  swirlIntensity: {
    type: 'number',
    defaultValue: 1,
    parser: (v) => Math.max(0.5, Math.min(2, parseFloat(v) || 1)),
    description: '螺旋强度 (0.5-2)'
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
