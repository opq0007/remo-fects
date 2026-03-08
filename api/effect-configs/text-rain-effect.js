/**
 * 文字雨特效参数配置
 * 
 * 定义 text-rain-effect 特效的所有参数
 * 使用嵌套参数结构
 */

const path = require('path');
const {
  MIXED_INPUT_PARAMS,
  SIZE_RANGE_PARAMS,
  TEXT_STYLE_PARAM,
  DEFAULT_BLESSING_STYLE,
  numberRangeParser,
  booleanParser,
  objectParser,
  arrayParser,
  validateMixedInput,
} = require('./shared-params');

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
 * 默认祝福图案样式（文字雨特有）
 */
const RAIN_BLESSING_STYLE = {
  ...DEFAULT_BLESSING_STYLE,
  animated: false,
};

/**
 * 默认文字样式（文字雨特有）
 */
const RAIN_TEXT_STYLE = {
  color: '#ffd700',
  effect: 'gold3d',
  effectIntensity: 0.9,
  fontWeight: 700,
  letterSpacing: 4,
};

/**
 * 特效特有参数定义（扁平结构，用于 API 输入）
 */
const params = {
  // ===== 混合输入配置（复用公共定义） =====
  ...MIXED_INPUT_PARAMS,

  // ===== 尺寸范围配置（文字雨特有默认值） =====
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
  blessingSizeRange: SIZE_RANGE_PARAMS.blessingSizeRange,

  // ===== 文字样式（文字雨特有） =====
  textStyle: {
    type: 'object',
    defaultValue: RAIN_TEXT_STYLE,
    parser: objectParser(RAIN_TEXT_STYLE),
    description: '文字样式配置'
  },

  // ===== 祝福图案样式 =====
  blessingStyle: {
    type: 'object',
    defaultValue: RAIN_BLESSING_STYLE,
    parser: objectParser(RAIN_BLESSING_STYLE),
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

  // ===== 嵌套参数：背景配置 =====
  backgroundType: {
    type: 'string',
    defaultValue: 'color',
    description: '背景类型：color | gradient | image | video'
  },
  backgroundColor: {
    type: 'string',
    defaultValue: '#1a1a2e',
    description: '背景颜色'
  },
  backgroundGradient: {
    type: 'string',
    defaultValue: null,
    description: '背景渐变 CSS'
  },
  backgroundSource: {
    type: 'string',
    defaultValue: null,
    description: '背景图片/视频路径'
  },

  // ===== 嵌套参数：遮罩配置 =====
  overlayColor: {
    type: 'string',
    defaultValue: '#000000',
    description: '遮罩颜色'
  },
  overlayOpacity: {
    type: 'number',
    defaultValue: 0.2,
    parser: numberRangeParser(0, 1, 0.2),
    description: '遮罩透明度'
  },

  // ===== 嵌套参数：音频配置 =====
  audioEnabled: {
    type: 'boolean',
    defaultValue: true,
    parser: booleanParser(true),
    description: '是否启用音频'
  },
  audioSource: {
    type: 'string',
    defaultValue: 'coin-sound.mp3',
    description: '音频文件路径'
  },
  audioVolume: {
    type: 'number',
    defaultValue: 0.5,
    parser: numberRangeParser(0, 1, 0.5),
    description: '音频音量'
  },

  // ===== 嵌套参数：水印配置 =====
  watermarkEnabled: {
    type: 'boolean',
    defaultValue: false,
    parser: booleanParser(false),
    description: '是否启用水印'
  },
  watermarkText: {
    type: 'string',
    defaultValue: '© Remo-Fects',
    description: '水印文字'
  },
  watermarkColor: {
    type: 'string',
    defaultValue: '#ffffff',
    description: '水印颜色'
  },
  watermarkOpacity: {
    type: 'number',
    defaultValue: 0.35,
    parser: numberRangeParser(0, 1, 0.35),
    description: '水印透明度'
  },

  // ===== 嵌套参数：走马灯配置 =====
  marqueeEnabled: {
    type: 'boolean',
    defaultValue: false,
    parser: booleanParser(false),
    description: '是否启用走马灯'
  },
  marqueeTexts: {
    type: 'array',
    defaultValue: [],
    parser: arrayParser([]),
    description: '走马灯文字列表'
  },
  marqueeSpeed: {
    type: 'number',
    defaultValue: 100,
    parser: (v) => parseInt(v) || 100,
    description: '走马灯速度'
  },

  // ===== 嵌套参数：射线爆发配置 =====
  radialBurstEnabled: {
    type: 'boolean',
    defaultValue: false,
    parser: booleanParser(false),
    description: '是否启用射线爆发'
  },
  radialBurstColor: {
    type: 'string',
    defaultValue: '#FFD700',
    description: '射线爆发颜色'
  },

  // ===== 嵌套参数：前景配置 =====
  foregroundEnabled: {
    type: 'boolean',
    defaultValue: false,
    parser: booleanParser(false),
    description: '是否启用前景'
  },
  foregroundSource: {
    type: 'string',
    defaultValue: null,
    description: '前景图片/视频路径'
  },

  // ===== 随机种子 =====
  seed: {
    type: 'number',
    defaultValue: 42,
    parser: (v) => parseInt(v) || 42,
    description: '随机种子'
  },
};

// 使用公共验证函数
const validate = validateMixedInput;

/**
 * 构建渲染参数（转换为嵌套结构）
 * 将扁平的 API 参数转换为组件需要的嵌套参数结构
 */
function buildRenderParams(reqParams, commonParams) {
  // 构建嵌套的背景参数
  const background = {
    type: reqParams.backgroundType || params.backgroundType.defaultValue,
    color: reqParams.backgroundColor || params.backgroundColor.defaultValue,
    gradient: reqParams.backgroundGradient || undefined,
    source: reqParams.backgroundSource || undefined,
  };

  // 构建嵌套的遮罩参数
  const overlay = {
    color: reqParams.overlayColor || params.overlayColor.defaultValue,
    opacity: reqParams.overlayOpacity ?? params.overlayOpacity.defaultValue,
  };

  // 构建嵌套的音频参数
  const audio = {
    enabled: reqParams.audioEnabled ?? params.audioEnabled.defaultValue,
    source: reqParams.audioSource || params.audioSource.defaultValue,
    volume: reqParams.audioVolume ?? params.audioVolume.defaultValue,
    loop: true,
  };

  // 构建嵌套的水印参数
  const watermark = reqParams.watermarkEnabled ? {
    enabled: true,
    text: reqParams.watermarkText || params.watermarkText.defaultValue,
    color: reqParams.watermarkColor || params.watermarkColor.defaultValue,
    opacity: reqParams.watermarkOpacity ?? params.watermarkOpacity.defaultValue,
  } : undefined;

  // 构建嵌套的走马灯参数
  const marquee = reqParams.marqueeEnabled ? {
    enabled: true,
    foregroundTexts: reqParams.marqueeTexts || [],
    speed: reqParams.marqueeSpeed || params.marqueeSpeed.defaultValue,
  } : undefined;

  // 构建嵌套的射线爆发参数
  const radialBurst = reqParams.radialBurstEnabled ? {
    enabled: true,
    color: reqParams.radialBurstColor || params.radialBurstColor.defaultValue,
  } : undefined;

  // 构建嵌套的前景参数
  const foreground = reqParams.foregroundEnabled ? {
    enabled: true,
    source: reqParams.foregroundSource || '',
  } : undefined;

  // 合并所有参数
  const result = {
    ...commonParams,
    
    // 内容配置
    words: reqParams.words || [],
    images: reqParams.images || [],
    contentType: reqParams.contentType || 'text',
    imageWeight: reqParams.imageWeight ?? 0.5,
    blessingTypes: reqParams.blessingTypes || ['goldCoin', 'redPacket', 'star'],
    blessingStyle: reqParams.blessingStyle || RAIN_BLESSING_STYLE,
    
    // 运动配置
    textDirection: reqParams.textDirection || 'horizontal',
    fallDirection: reqParams.fallDirection || 'down',
    fallSpeed: reqParams.fallSpeed ?? 0.15,
    density: reqParams.density ?? 2,
    laneCount: reqParams.laneCount ?? 6,
    minVerticalGap: reqParams.minVerticalGap ?? 100,
    
    // 尺寸配置
    fontSizeRange: reqParams.fontSizeRange || [80, 160],
    imageSizeRange: reqParams.imageSizeRange || [80, 150],
    opacityRange: reqParams.opacityRange || [0.6, 1],
    rotationRange: reqParams.rotationRange || [-10, 10],
    
    // 样式配置
    textStyle: reqParams.textStyle || RAIN_TEXT_STYLE,
    
    // 嵌套参数
    background,
    overlay,
    audio,
    watermark,
    marquee,
    radialBurst,
    foreground,
    
    // 随机种子
    seed: reqParams.seed ?? 42,
  };

  return result;
}

module.exports = {
  config,
  params,
  validate,
  buildRenderParams
};
