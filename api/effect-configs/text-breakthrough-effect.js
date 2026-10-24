/**
 * 文字破屏特效参数配置
 * 使用嵌套参数格式
 */

const path = require('path');
const {
  MIXED_INPUT_PARAMS,
  BLESSING_TYPES,
  DEFAULT_BLESSING_STYLE,
  booleanParser,
  numberRangeParser,
  getContentCount,
} = require('./shared-params');

const config = {
  id: 'text-breakthrough-effect',
  name: '文字破屏特效',
  compositionId: 'TextBreakthrough',
  path: path.join(__dirname, '../../effects/text-breakthrough-effect')
};

const BREAKTHROUGH_BLESSING_STYLE = { ...DEFAULT_BLESSING_STYLE, glowIntensity: 0.8 };

const params = {
  // 混合输入
  contentType: { ...MIXED_INPUT_PARAMS.contentType, defaultValue: 'mixed' },
  words: MIXED_INPUT_PARAMS.words,
  images: MIXED_INPUT_PARAMS.images,
  blessingTypes: { ...MIXED_INPUT_PARAMS.blessingTypes, defaultValue: [...BLESSING_TYPES] },
  imageWeight: { ...MIXED_INPUT_PARAMS.imageWeight, defaultValue: 0.3 },
  blessingStyle: { type: 'object', defaultValue: BREAKTHROUGH_BLESSING_STYLE },
  
  // 尺寸
  fontSize: { type: 'number', defaultValue: 120 },
  imageSize: { type: 'number', defaultValue: 150 },
  blessingSize: { type: 'number', defaultValue: 120 },
  fontFamily: { type: 'string', defaultValue: 'PingFang SC, Microsoft YaHei, SimHei, sans-serif' },
  fontWeight: { type: 'number', defaultValue: 900 },
  
  // 颜色
  textColor: { type: 'string', defaultValue: '#ffd700' },
  glowColor: { type: 'string', defaultValue: '#ffaa00' },
  secondaryGlowColor: { type: 'string', defaultValue: '#7EC8FF' },
  glowIntensity: { type: 'number', defaultValue: 0.8 },
  bevelDepth: { type: 'number', defaultValue: 3 },
  
  // 3D
  startZ: { type: 'number', defaultValue: 2000 },
  endZ: { type: 'number', defaultValue: -100 },
  
  // 动画
  approachDuration: { type: 'number', defaultValue: 45 },
  breakthroughDuration: { type: 'number', defaultValue: 20 },
  holdDuration: { type: 'number', defaultValue: 40 },
  impactScale: { type: 'number', defaultValue: 1.4 },
  impactRotation: { type: 'number', defaultValue: 12 },
  shakeIntensity: { type: 'number', defaultValue: 10 },
  contentInterval: { type: 'number', defaultValue: 50 },
  direction: { type: 'string', defaultValue: 'top-down' },
  
  // 排列
  arrangement: { type: 'string', defaultValue: 'circular' },
  arrangementSpacing: { type: 'number', defaultValue: 0.25 },
  centerY: { type: 'number', defaultValue: 0 },
  
  // 循环
  enableLoop: { type: 'boolean', defaultValue: false, parser: booleanParser(false) },
  
  // 下落
  enableFallDown: { type: 'boolean', defaultValue: true, parser: booleanParser(true) },
  fallDownDuration: { type: 'number', defaultValue: 40 },
  fallDownEndY: { type: 'number', defaultValue: 0.2, parser: numberRangeParser(0, 1, 0.2) },
};

function validate(params) {
  const hasText = params.words && params.words.length > 0;
  const hasImages = params.images && params.images.length > 0;
  
  if (params.contentType === 'blessing') return { valid: true };
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

  if (!reqParams.duration && !result.enableLoop) {
    result.duration = calculateDuration(result);
  }

  return result;
}

module.exports = { config, params, validate, buildRenderParams, calculateDuration };