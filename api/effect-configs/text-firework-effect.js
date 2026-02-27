/**
 * 文字烟花特效参数配置
 */

const path = require('path');

const config = {
  id: 'text-firework-effect',
  name: '文字烟花特效',
  compositionId: 'TextFirework',
  path: path.join(__dirname, '../../effects/text-firework-effect')
};

const params = {
  // ===== 文字内容 =====
  words: {
    type: 'array',
    defaultValue: [],
    parser: (v) => {
      if (Array.isArray(v)) return v;
      if (typeof v === 'string') {
        try {
          return JSON.parse(v);
        } catch {
          return v.split(',').map(w => w.trim()).filter(w => w);
        }
      }
      return [];
    },
    required: true,
    description: '文字列表'
  },

  // ===== 字体配置 =====
  fontSize: {
    type: 'number',
    defaultValue: 60,
    parser: (v) => parseInt(v) || 60,
    description: '字体大小'
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
  }
};

function validate(params) {
  if (!params.words || params.words.length === 0) {
    return { valid: false, error: '请提供文字列表 (words)' };
  }
  return { valid: true };
}

/**
 * 时长计算函数
 * 根据文字数量自动计算合理的视频时长
 */
function calculateDuration(params) {
  if (params.duration && params.duration !== 10) return params.duration;
  
  const lastLaunchFrame = (params.words.length - 1) * params.interval;
  const totalFrames = lastLaunchFrame + 30 + params.textDuration + params.rainDuration + 30;
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
