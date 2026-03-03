/**
 * 文字烟花特效参数配置
 * 支持文字、图片、祝福图案的混合输入
 */

const path = require('path');
const {
  MIXED_INPUT_PARAMS,
  BLESSING_TYPES,
  DEFAULT_BLESSING_STYLE,
  booleanParser,
  validateMixedInput,
  getContentCount,
} = require('./shared-params');

/**
 * 特效基础信息
 */
const config = {
  id: 'text-firework-effect',
  name: '文字烟花特效',
  compositionId: 'TextFirework',
  path: path.join(__dirname, '../../effects/text-firework-effect')
};

/**
 * 默认祝福图案样式
 */
const FIREWORK_BLESSING_STYLE = {
  ...DEFAULT_BLESSING_STYLE,
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
    defaultValue: FIREWORK_BLESSING_STYLE,
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
    defaultValue: 60,
    parser: (v) => parseInt(v) || 60,
    description: '字体大小'
  },
  imageSize: {
    type: 'number',
    defaultValue: 90,
    parser: (v) => parseInt(v) || 90,
    description: '图片大小'
  },
  blessingSize: {
    type: 'number',
    defaultValue: 72,
    parser: (v) => parseInt(v) || 72,
    description: '祝福图案大小'
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
  glowIntensity: {
    type: 'number',
    defaultValue: 1,
    parser: (v) => parseFloat(v) || 1,
    description: '发光强度'
  },

  // ===== 发射配置 =====
  launchHeight: {
    type: 'number',
    defaultValue: 0.2,
    parser: (v) => parseFloat(v) || 0.2,
    description: '发射高度比例'
  },

  // ===== 粒子配置 =====
  particleCount: {
    type: 'number',
    defaultValue: 80,
    parser: (v) => parseInt(v) || 80,
    description: '粒子数量'
  },
  gravity: {
    type: 'number',
    defaultValue: 0.15,
    parser: (v) => parseFloat(v) || 0.15,
    description: '重力'
  },
  wind: {
    type: 'number',
    defaultValue: 0,
    parser: (v) => parseFloat(v) || 0,
    description: '风力'
  },
  rainParticleSize: {
    type: 'number',
    defaultValue: 3,
    parser: (v) => parseFloat(v) || 3,
    description: '粒子大小'
  },

  // ===== 时长配置 =====
  textDuration: {
    type: 'number',
    defaultValue: 60,
    parser: (v) => parseInt(v) || 60,
    description: '文字显示时长（帧）'
  },
  rainDuration: {
    type: 'number',
    defaultValue: 120,
    parser: (v) => parseInt(v) || 120,
    description: '粒子下雨时长（帧）'
  },
  interval: {
    type: 'number',
    defaultValue: 40,
    parser: (v) => parseInt(v) || 40,
    description: '发射间隔（帧）'
  },

  // ===== 循环播放 =====
  enableLoop: {
    type: 'boolean',
    defaultValue: false,
    parser: booleanParser(false),
    description: '启用循环播放'
  }
};

/**
 * 参数验证函数（带兼容逻辑）
 */
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
  
  // 兼容旧版
  if (!params.contentType && hasText) {
    return { valid: true };
  }
  
  return { valid: true };
}

/**
 * 时长计算函数
 */
function calculateDuration(params) {
  if (params.duration && params.duration !== 10) return params.duration;
  
  const contentCount = getContentCount(params);
  const lastLaunchFrame = (contentCount - 1) * params.interval;
  const totalFrames = lastLaunchFrame + 30 + params.textDuration + params.rainDuration + 30;
  return Math.ceil(totalFrames / params.fps);
}

/**
 * 构建渲染参数
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

  // 兼容旧版
  if (!reqParams.contentType && result.words && result.words.length > 0) {
    result.contentType = 'text';
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
