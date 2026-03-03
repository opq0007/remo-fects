/**
 * 文字环绕特效参数配置
 * 
 * 定义 text-ring-effect 特效的所有参数
 * 支持文字、图片、祝福图案的混合输入
 */

const path = require('path');
const {
  MIXED_INPUT_PARAMS,
  BLESSING_TYPES,
  DEFAULT_BLESSING_STYLE,
  objectParser,
  validateMixedInput,
  createBuildRenderParams,
} = require('./shared-params');

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
  // ===== 混合输入配置（复用公共定义，覆盖部分默认值） =====
  contentType: MIXED_INPUT_PARAMS.contentType,
  words: MIXED_INPUT_PARAMS.words,
  images: MIXED_INPUT_PARAMS.images,
  blessingTypes: {
    ...MIXED_INPUT_PARAMS.blessingTypes,
    defaultValue: [...BLESSING_TYPES],
  },
  imageWeight: MIXED_INPUT_PARAMS.imageWeight,
  blessingStyle: {
    type: 'object',
    defaultValue: DEFAULT_BLESSING_STYLE,
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
    defaultValue: 70,
    parser: (v) => parseInt(v) || 70,
    description: '字体大小'
  },
  imageSize: {
    type: 'number',
    defaultValue: 80,
    parser: (v) => parseInt(v) || 80,
    description: '图片大小'
  },
  blessingSize: {
    type: 'number',
    defaultValue: 80,
    parser: (v) => parseInt(v) || 80,
    description: '祝福图案大小'
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
 * 参数验证函数（带兼容逻辑）
 */
function validate(params) {
  const hasText = params.words && params.words.length > 0;
  const hasImages = params.images && params.images.length > 0;
  
  // blessing 模式始终可用，因为默认有祝福图案
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
  
  // 兼容旧版：如果没有指定 contentType 但提供了 words
  if (!params.contentType && hasText) {
    return { valid: true };
  }
  
  return { valid: true };
}

/**
 * 构建渲染参数（带兼容逻辑）
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

  // 兼容旧版：如果没有指定 contentType 但提供了 words，设置为 text 模式
  if (!reqParams.contentType && result.words && result.words.length > 0) {
    result.contentType = 'text';
  }

  return result;
}

module.exports = {
  config,
  params,
  validate,
  buildRenderParams
};
