/**
 * 文字洪水特效参数配置
 * 使用嵌套参数格式
 */

const path = require('path');
const {
  MIXED_INPUT_PARAMS,
  DEFAULT_BLESSING_STYLE,
  numberRangeParser,
  intRangeParser,
  booleanParser,
  enumParser,
  objectParser,
  arrayParser,
  validateMixedInput,
} = require('./shared-params');

const config = {
  id: 'text-flood-effect',
  name: '文字洪水特效',
  compositionId: 'TextFlood',
  path: path.join(__dirname, '../../effects/text-flood-effect')
};

const FLOOD_TEXT_STYLE = { color: '#5BC9E8', effect: 'glow', effectIntensity: 0.7, fontWeight: 800 };
const FLOOD_IMAGE_STYLE = { glow: true, glowColor: '#5BC9E8', glowIntensity: 0.5, shadow: true };
const FLOOD_BLESSING_STYLE = { ...DEFAULT_BLESSING_STYLE, glowIntensity: 0.7 };

const params = {
  // 混合输入
  contentType: MIXED_INPUT_PARAMS.contentType,
  words: { ...MIXED_INPUT_PARAMS.words, defaultValue: ['洪', '福', '财', '运', '吉', '祥'] },
  images: MIXED_INPUT_PARAMS.images,
  imageWeight: { ...MIXED_INPUT_PARAMS.imageWeight, defaultValue: 0.3 },
  blessingTypes: MIXED_INPUT_PARAMS.blessingTypes,
  blessingStyle: { type: 'object', defaultValue: FLOOD_BLESSING_STYLE, parser: objectParser(FLOOD_BLESSING_STYLE) },
  
  // 洪水参数
  particleCount: { type: 'number', defaultValue: 60, parser: intRangeParser(10, 200, 60) },
  waveCount: { type: 'number', defaultValue: 5, parser: intRangeParser(1, 10, 5) },
  direction: { type: 'string', defaultValue: 'toward', parser: enumParser(['toward', 'away'], 'toward') },
  
  // 波浪配置
  waveConfig: { type: 'object', defaultValue: { waveSpeed: 1.5, waveAmplitude: 60, waveFrequency: 2 } },
  
  // 冲击效果
  impactConfig: { type: 'object', defaultValue: { impactStart: 0.7, impactScale: 3, impactBlur: 8, impactShake: 15 } },
  
  // 尺寸
  fontSizeRange: { type: 'array', defaultValue: [60, 120], parser: arrayParser([60, 120]) },
  imageSizeRange: { type: 'array', defaultValue: [80, 150], parser: arrayParser([80, 150]) },
  blessingSizeRange: { type: 'array', defaultValue: [80, 150], parser: arrayParser([80, 150]) },
  opacityRange: { type: 'array', defaultValue: [0.7, 1], parser: arrayParser([0.7, 1]) },
  
  // 样式
  textStyle: { type: 'object', defaultValue: FLOOD_TEXT_STYLE, parser: objectParser(FLOOD_TEXT_STYLE) },
  imageStyle: { type: 'object', defaultValue: FLOOD_IMAGE_STYLE, parser: objectParser(FLOOD_IMAGE_STYLE) },
  
  // 视觉效果
  enablePerspective: { type: 'boolean', defaultValue: true, parser: booleanParser(true) },
  perspectiveStrength: { type: 'number', defaultValue: 800, parser: intRangeParser(100, 2000, 800) },
  enableWaveBackground: { type: 'boolean', defaultValue: true, parser: booleanParser(true) },
  waveBackgroundColor: { type: 'string', defaultValue: '#0a3a5a' },
  waveBackgroundOpacity: { type: 'number', defaultValue: 0.4, parser: numberRangeParser(0, 1, 0.4) },
  
  seed: { type: 'number', defaultValue: 42 },
};

const validate = validateMixedInput;

function buildRenderParams(reqParams, commonParams) {
  const result = { ...commonParams };

  for (const [name, def] of Object.entries(params)) {
    if (reqParams[name] !== undefined && reqParams[name] !== null && reqParams[name] !== '') {
      result[name] = def.parser ? def.parser(reqParams[name]) : reqParams[name];
    } else if (def.defaultValue !== undefined) {
      result[name] = typeof def.defaultValue === 'function' ? def.defaultValue() : def.defaultValue;
    }
  }

  return result;
}

module.exports = { config, params, validate, buildRenderParams };
