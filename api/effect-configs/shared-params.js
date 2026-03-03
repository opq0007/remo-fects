/**
 * 共享参数定义和工具函数
 * 
 * 提供所有特效配置文件共享的参数定义、解析器和验证函数
 * 减少重复代码，统一管理混合输入相关配置
 */

/**
 * 祝福图案类型常量
 */
const BLESSING_TYPES = ['goldCoin', 'moneyBag', 'luckyBag', 'redPacket'];

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
  '#DDA0DD', // 梅红
];

/**
 * 默认祝福图案样式
 */
const DEFAULT_BLESSING_STYLE = {
  primaryColor: '#FFD700',
  secondaryColor: '#FFA500',
  enable3D: true,
  enableGlow: true,
  glowIntensity: 1,
  animated: false,
};

/**
 * 默认文字样式
 */
const DEFAULT_TEXT_STYLE = {
  color: '#FFD700',
  effect: 'gold3d',
  effectIntensity: 0.9,
  fontWeight: 700,
};

// ==================== 解析器工厂函数 ====================

/**
 * 数组解析器工厂函数
 * @param {Array} defaultValue - 默认值
 * @returns {Function} 解析器函数
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
 * @param {Object} defaultValue - 默认值
 * @returns {Function} 解析器函数
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
 * 数字范围解析器
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @param {number} defaultValue - 默认值
 * @returns {Function} 解析器函数
 */
const numberRangeParser = (min, max, defaultValue) => (v) => {
  const num = parseFloat(v);
  if (isNaN(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
};

/**
 * 整数范围解析器
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @param {number} defaultValue - 默认值
 * @returns {Function} 解析器函数
 */
const intRangeParser = (min, max, defaultValue) => (v) => {
  const num = parseInt(v);
  if (isNaN(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
};

/**
 * 布尔值解析器
 * @param {boolean} defaultValue - 默认值
 * @returns {Function} 解析器函数
 */
const booleanParser = (defaultValue = false) => (v) => {
  if (v === true || v === 'true') return true;
  if (v === false || v === 'false') return false;
  return defaultValue;
};

/**
 * 枚举解析器
 * @param {Array} allowedValues - 允许的值列表
 * @param {string} defaultValue - 默认值
 * @returns {Function} 解析器函数
 */
const enumParser = (allowedValues, defaultValue) => (v) => {
  return allowedValues.includes(v) ? v : defaultValue;
};

// ==================== 混合输入参数定义 ====================

/**
 * 混合输入参数定义
 * 可直接展开使用：{ ...MIXED_INPUT_PARAMS }
 */
const MIXED_INPUT_PARAMS = {
  // 内容类型
  contentType: {
    type: 'string',
    defaultValue: 'text',
    description: '内容类型：text(纯文字) | image(纯图片) | blessing(祝福图案) | mixed(混合模式)'
  },

  // 文字内容
  words: {
    type: 'array',
    defaultValue: [],
    parser: arrayParser([]),
    description: '文字列表'
  },

  // 图片内容
  images: {
    type: 'array',
    defaultValue: [],
    parser: arrayParser([]),
    description: '图片路径列表（支持：1. public目录相对路径如"coin.png" 2. 网络URL如"https://example.com/img.png" 3. Data URL base64编码）'
  },

  // 图片权重
  imageWeight: {
    type: 'number',
    defaultValue: 0.5,
    parser: numberRangeParser(0, 1, 0.5),
    description: 'mixed 模式下图片出现权重 (0-1)'
  },

  // 祝福图案类型
  blessingTypes: {
    type: 'array',
    defaultValue: [...BLESSING_TYPES],
    parser: arrayParser([...BLESSING_TYPES]),
    description: '祝福图案类型列表：goldCoin(金币) | moneyBag(金钱袋) | luckyBag(福袋) | redPacket(红包)'
  },

  // 祝福图案样式
  blessingStyle: {
    type: 'object',
    defaultValue: { ...DEFAULT_BLESSING_STYLE },
    parser: objectParser({ ...DEFAULT_BLESSING_STYLE }),
    description: '祝福图案样式配置'
  },
};

/**
 * 尺寸范围参数定义
 */
const SIZE_RANGE_PARAMS = {
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
};

/**
 * 文字样式参数定义
 */
const TEXT_STYLE_PARAM = {
  textStyle: {
    type: 'object',
    defaultValue: { ...DEFAULT_TEXT_STYLE },
    parser: objectParser({ ...DEFAULT_TEXT_STYLE }),
    description: '文字样式配置'
  },
};

// ==================== 验证函数 ====================

/**
 * 混合输入参数验证函数
 * @param {Object} params - 解析后的参数
 * @returns {{ valid: boolean, error?: string }}
 */
function validateMixedInput(params) {
  const { contentType, words, images, blessingTypes } = params;

  if (contentType === 'text') {
    if (!words || words.length === 0) {
      return { valid: false, error: 'text 模式需要提供文字列表 (words)' };
    }
  } else if (contentType === 'image') {
    if (!images || images.length === 0) {
      return { valid: false, error: 'image 模式需要提供图片列表 (images)' };
    }
  } else if (contentType === 'blessing') {
    // blessing 模式始终可用，因为有默认值
    return { valid: true };
  } else if (contentType === 'mixed') {
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
 * 创建混合输入验证函数（可自定义默认行为）
 * @param {Object} options - 选项
 * @param {boolean} options.allowEmpty - 是否允许空内容（默认 blessing 模式允许）
 * @returns {Function} 验证函数
 */
function createMixedInputValidator(options = {}) {
  const { allowEmpty = true } = options;
  
  return function(params) {
    const { contentType, words, images, blessingTypes } = params;

    // 如果允许空内容，blessing 模式始终有效
    if (allowEmpty && contentType === 'blessing') {
      return { valid: true };
    }

    return validateMixedInput(params);
  };
}

// ==================== buildRenderParams 辅助函数 ====================

/**
 * 通用的 buildRenderParams 实现
 * @param {Object} reqParams - 请求参数
 * @param {Object} commonParams - 已处理的公共参数
 * @param {Object} params - 参数定义对象
 * @returns {Object} 完整的渲染参数
 */
function buildRenderParamsGeneric(reqParams, commonParams, params) {
  const result = { ...commonParams };

  for (const [name, def] of Object.entries(params)) {
    if (reqParams[name] !== undefined && reqParams[name] !== null && reqParams[name] !== '') {
      result[name] = def.parser ? def.parser(reqParams[name]) : reqParams[name];
    } else if (def.defaultValue !== undefined) {
      result[name] = typeof def.defaultValue === 'function' 
        ? def.defaultValue() 
        : def.defaultValue;
    }
  }

  return result;
}

/**
 * 创建 buildRenderParams 函数
 * @param {Object} params - 参数定义对象
 * @returns {Function} buildRenderParams 函数
 */
function createBuildRenderParams(params) {
  return function(reqParams, commonParams) {
    return buildRenderParamsGeneric(reqParams, commonParams, params);
  };
}

// ==================== 内容数量计算 ====================

/**
 * 计算内容数量
 * @param {Object} params - 参数对象
 * @returns {number} 内容数量
 */
function getContentCount(params) {
  const { contentType, words, images, blessingTypes } = params;

  if (contentType === 'text') {
    return words?.length || 0;
  }
  if (contentType === 'image') {
    return images?.length || 0;
  }
  if (contentType === 'blessing') {
    return blessingTypes?.length || BLESSING_TYPES.length;
  }
  // mixed 模式
  const textCount = words?.length || 0;
  const imageCount = images?.length || 0;
  const blessingCount = blessingTypes?.length || BLESSING_TYPES.length;
  return Math.max(textCount, imageCount, blessingCount, 4);
}

// ==================== 导出 ====================

module.exports = {
  // 常量
  BLESSING_TYPES,
  DEFAULT_COLORS,
  DEFAULT_BLESSING_STYLE,
  DEFAULT_TEXT_STYLE,

  // 解析器工厂函数
  arrayParser,
  objectParser,
  numberRangeParser,
  intRangeParser,
  booleanParser,
  enumParser,

  // 参数定义
  MIXED_INPUT_PARAMS,
  SIZE_RANGE_PARAMS,
  TEXT_STYLE_PARAM,

  // 验证函数
  validateMixedInput,
  createMixedInputValidator,

  // buildRenderParams 辅助函数
  buildRenderParamsGeneric,
  createBuildRenderParams,

  // 工具函数
  getContentCount,
};
