/**
 * 姓名生长爆炸特效参数配置
 */

const path = require('path');

const config = {
  id: 'text-grow-explode-effect',
  name: '姓名生长爆炸特效',
  compositionId: 'TextGrowExplode',
  path: path.join(__dirname, '../../effects/text-grow-explode-effect')
};

const params = {
  // ===== 核心输入 =====
  name: {
    type: 'string',
    defaultValue: '福',
    required: true,
    description: '姓名/主要文字'
  },
  words: {
    type: 'array',
    defaultValue: ['财', '运', '亨', '通', '金', '玉', '满', '堂'],
    parser: (v) => {
      if (Array.isArray(v)) return v;
      if (typeof v === 'string') {
        try {
          return JSON.parse(v);
        } catch {
          return v.split(',').map(w => w.trim()).filter(w => w);
        }
      }
      return ['财', '运', '亨', '通', '金', '玉', '满', '堂'];
    },
    description: '文字碎片数组'
  },

  // ===== 阶段时长 =====
  growDuration: {
    type: 'number',
    defaultValue: 90,
    parser: (v) => parseInt(v) || 90,
    description: '生长时长（帧）'
  },
  holdDuration: {
    type: 'number',
    defaultValue: 30,
    parser: (v) => parseInt(v) || 30,
    description: '定格时长（帧）'
  },
  explodeDuration: {
    type: 'number',
    defaultValue: 30,
    parser: (v) => parseInt(v) || 30,
    description: '爆炸时长（帧）'
  },
  fallDuration: {
    type: 'number',
    defaultValue: 90,
    parser: (v) => parseInt(v) || 90,
    description: '下落时长（帧）'
  },

  // ===== 文字样式 =====
  fontSize: {
    type: 'number',
    defaultValue: 14,
    parser: (v) => parseInt(v) || 14,
    description: '字体大小'
  },
  particleFontSize: {
    type: 'number',
    defaultValue: 22,
    parser: (v) => parseInt(v) || 22,
    description: '粒子字体大小'
  },
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

  // ===== 轮廓提取 =====
  threshold: {
    type: 'number',
    defaultValue: 128,
    parser: (v) => parseInt(v) || 128,
    description: '轮廓阈值'
  },
  sampleDensity: {
    type: 'number',
    defaultValue: 6,
    parser: (v) => parseInt(v) || 6,
    description: '采样密度'
  },

  // ===== 生长样式 =====
  growStyle: {
    type: 'string',
    defaultValue: 'tree',
    description: '生长样式'
  },

  // ===== 背景 =====
  backgroundOpacity: {
    type: 'number',
    defaultValue: 0.9,
    parser: (v) => parseFloat(v) || 0.9,
    description: '背景透明度'
  },

  // ===== 图片源 =====
  imageSource: {
    type: 'string',
    defaultValue: null,
    description: '图片源'
  }
};

function validate(params) {
  if (!params.name) {
    return { valid: false, error: '请提供姓名 (name)' };
  }
  if (!params.words || params.words.length === 0) {
    return { valid: false, error: '请提供文字碎片数组 (words)' };
  }
  return { valid: true };
}

/**
 * 时长计算
 */
function calculateDuration(params) {
  if (params.duration && params.duration !== 10) return params.duration;
  
  const totalFrames = params.growDuration + params.holdDuration + params.explodeDuration + params.fallDuration;
  return Math.ceil(totalFrames / (params.fps || 24));
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

  // 处理背景文件
  if (reqParams.backgroundFile) {
    result.imageSource = reqParams.backgroundFile;
  }

  // 自动计算时长
  if (!reqParams.duration) {
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
