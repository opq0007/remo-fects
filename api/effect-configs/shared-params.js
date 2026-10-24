/**
 * 共享参数定义和工具函数
 * 
 * 提供所有特效配置文件共享的参���定义、解析器和验证函数
 */

/**
 * 祝福图案类型常量
 */
const BLESSING_TYPES = ['goldCoin', 'moneyBag', 'luckyBag', 'redPacket', 'star', 'heart', 'balloon'];

/**
 * 默认颜色配置：鎏金 2.0 纪律色板（金主 + 玫瑰辅 + 天蓝冷呼吸 + 淡金高光）
 */
const DEFAULT_COLORS = [
  '#FFD76A', // 亮金（主）
  '#FF8FA3', // 玫瑰粉（辅）
  '#7EC8FF', // 天蓝（冷呼吸）
  '#FFF3C4', // 淡金高光
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
 * 数字范围解析器
 */
const numberRangeParser = (min, max, defaultValue) => (v) => {
  const num = parseFloat(v);
  if (isNaN(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
};

/**
 * 整数范围解析器
 */
const intRangeParser = (min, max, defaultValue) => (v) => {
  const num = parseInt(v);
  if (isNaN(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
};

/**
 * 布尔值解析器
 */
const booleanParser = (defaultValue = false) => (v) => {
  if (v === true || v === 'true') return true;
  if (v === false || v === 'false') return false;
  return defaultValue;
};

/**
 * 枚举解析器
 */
const enumParser = (allowedValues, defaultValue) => (v) => {
  return allowedValues.includes(v) ? v : defaultValue;
};

// ==================== 混合输入参数定义 ====================

/**
 * 混合输入参数定义
 */
const MIXED_INPUT_PARAMS = {
  contentType: {
    type: 'string',
    defaultValue: 'text',
    description: '内容类型：text | image | blessing | mixed'
  },
  words: {
    type: 'array',
    defaultValue: [],
    parser: arrayParser([]),
    description: '文字列表'
  },
  images: {
    type: 'array',
    defaultValue: [],
    parser: arrayParser([]),
    description: '图片路径列表'
  },
  imageWeight: {
    type: 'number',
    defaultValue: 0.5,
    parser: numberRangeParser(0, 1, 0.5),
    description: 'mixed 模式下图片出现权重 (0-1)'
  },
  blessingTypes: {
    type: 'array',
    defaultValue: [...BLESSING_TYPES],
    parser: arrayParser([...BLESSING_TYPES]),
    description: '祝福图案类型列表'
  },
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

// ==================== 内容数量计算 ====================

/**
 * 计算内容数量
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

// ==================== 通用 buildRenderParams ====================

/**
 * 通用的 buildRenderParams 实现
 * 自动合并特效参数、公共参数和嵌套参数
 */
function buildRenderParamsGeneric(reqParams, commonParams, effectParams) {
  const result = { ...commonParams };

  // 处理特效特有参数
  for (const [name, def] of Object.entries(effectParams)) {
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
 */
function createBuildRenderParams(effectParams) {
  return function(reqParams, commonParams) {
    return buildRenderParamsGeneric(reqParams, commonParams, effectParams);
  };
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

  // buildRenderParams 辅助函数
  buildRenderParamsGeneric,
  createBuildRenderParams,

  // 工具函数
  getContentCount,
};