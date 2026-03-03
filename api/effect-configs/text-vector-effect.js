/**
 * 文字矢量动画特效参数配置
 * 
 * 将文字转为SVG路径轮廓，用混合输入元素填充轨迹
 */

const path = require('path');

const config = {
  id: 'text-vector-effect',
  name: '文字矢量动画特效',
  compositionId: 'TextVector',
  path: path.join(__dirname, '../../effects/text-vector-effect')
};

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
 * 默认祝福图案类型
 */
const DEFAULT_BLESSING_TYPES = ['goldCoin', 'moneyBag', 'luckyBag', 'redPacket'];

const params = {
  // ===== 核心文字配置 =====
  text: {
    type: 'string',
    defaultValue: '福',
    description: '要显示的核心文字'
  },
  
  // ===== 字体配置 =====
  fontSize: {
    type: 'number',
    defaultValue: 300,
    parser: (v) => parseInt(v) || 300,
    description: '核心文字字体大小'
  },
  fontFamily: {
    type: 'string',
    defaultValue: 'Arial, sans-serif',
    description: '字体家族'
  },
  fontWeight: {
    type: 'number',
    defaultValue: 700,
    parser: (v) => parseInt(v) || 700,
    description: '字重'
  },
  
  // ===== 混合输入配置 =====
  contentType: {
    type: 'string',
    defaultValue: 'mixed',
    description: '内容类型：text | image | blessing | mixed'
  },
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
    description: '填充文字列表'
  },
  images: {
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
    description: '填充图片列表'
  },
  blessingTypes: {
    type: 'array',
    defaultValue: DEFAULT_BLESSING_TYPES,
    parser: (v) => {
      if (Array.isArray(v)) return v.length > 0 ? v : DEFAULT_BLESSING_TYPES;
      if (typeof v === 'string') {
        try {
          const arr = JSON.parse(v);
          return arr.length > 0 ? arr : DEFAULT_BLESSING_TYPES;
        } catch {
          const arr = v.split(',').map(w => w.trim()).filter(w => w);
          return arr.length > 0 ? arr : DEFAULT_BLESSING_TYPES;
        }
      }
      return DEFAULT_BLESSING_TYPES;
    },
    description: '祝福图案类型：goldCoin | moneyBag | luckyBag | redPacket'
  },
  imageWeight: {
    type: 'number',
    defaultValue: 0.5,
    parser: (v) => parseFloat(v) || 0.5,
    description: '图片出现权重（0-1）'
  },
  blessingStyle: {
    type: 'object',
    defaultValue: null,
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
  
  // ===== 元素配置 =====
  elementSize: {
    type: 'number',
    defaultValue: 20,
    parser: (v) => parseInt(v) || 20,
    description: '填充元素大小'
  },
  elementSizeRange: {
    type: 'array',
    defaultValue: null,
    parser: (v) => {
      if (!v) return null;
      if (Array.isArray(v)) return v;
      if (typeof v === 'string') {
        try {
          return JSON.parse(v);
        } catch {
          return null;
        }
      }
      return null;
    },
    description: '元素大小范围 [最小, 最大]'
  },
  elementSpacing: {
    type: 'number',
    defaultValue: 16,
    parser: (v) => parseInt(v) || 16,
    description: '元素间距'
  },
  
  // ===== 颜色配置 =====
  textColor: {
    type: 'string',
    defaultValue: '#FFD700',
    description: '文字颜色'
  },
  glowColor: {
    type: 'string',
    defaultValue: '#FFD700',
    description: '发光颜色'
  },
  glowIntensity: {
    type: 'number',
    defaultValue: 1.2,
    parser: (v) => parseFloat(v) || 1.2,
    description: '发光强度（0-3）'
  },
  colors: {
    type: 'array',
    defaultValue: DEFAULT_COLORS,
    parser: (v) => {
      if (Array.isArray(v)) return v.length > 0 ? v : DEFAULT_COLORS;
      if (typeof v === 'string') {
        try {
          const arr = JSON.parse(v);
          return arr.length > 0 ? arr : DEFAULT_COLORS;
        } catch {
          const arr = v.split(',').map(c => c.trim()).filter(c => c);
          return arr.length > 0 ? arr : DEFAULT_COLORS;
        }
      }
      return DEFAULT_COLORS;
    },
    description: '颜色列表（循环使用）'
  },
  
  // ===== 文字排列配置 =====
  textOrientation: {
    type: 'string',
    defaultValue: 'horizontal',
    description: '文字排列方向：horizontal（水平）| vertical（垂直）'
  },
  
  // ===== 多字动画配置 =====
  charAnimationMode: {
    type: 'string',
    defaultValue: 'together',
    description: '多字动画模式：together（同时展示）| sequential（依次展示）'
  },
  charInterval: {
    type: 'number',
    defaultValue: 60,
    parser: (v) => parseInt(v) || 60,
    description: '依次展示时每字间隔（帧），仅 charAnimationMode=sequential 时有效'
  },
  charStayDuration: {
    type: 'number',
    defaultValue: 120,
    parser: (v) => parseInt(v) || 120,
    description: '依次展示时每字停留时长（帧），仅 charAnimationMode=sequential 时有效'
  },
  
  // ===== 动画配置 =====
  entranceDuration: {
    type: 'number',
    defaultValue: 12,
    parser: (v) => parseInt(v) || 12,
    description: '入场动画时长（帧）'
  },
  fillDuration: {
    type: 'number',
    defaultValue: 80,
    parser: (v) => parseInt(v) || 80,
    description: '填充动画时长（帧）'
  },
  fillType: {
    type: 'string',
    defaultValue: 'sequential',
    description: '填充动画类型：sequential | random | radial | wave'
  },
  stayAnimation: {
    type: 'string',
    defaultValue: 'pulse',
    description: '停留动画类型：pulse | glow | float | none'
  },
  pulseSpeed: {
    type: 'number',
    defaultValue: 1.2,
    parser: (v) => parseFloat(v) || 1.2,
    description: '脉冲速度'
  },
  glowPulseSpeed: {
    type: 'number',
    defaultValue: 0.8,
    parser: (v) => parseFloat(v) || 0.8,
    description: '发光脉冲速度'
  },
  floatAmplitude: {
    type: 'number',
    defaultValue: 4,
    parser: (v) => parseFloat(v) || 4,
    description: '漂浮幅度'
  },
  floatSpeed: {
    type: 'number',
    defaultValue: 1,
    parser: (v) => parseFloat(v) || 1,
    description: '漂浮速度'
  },
  
  // ===== 3D 效果 =====
  enable3D: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v !== false && v !== 'false',
    description: '启用3D效果'
  },
  rotation3D: {
    type: 'number',
    defaultValue: 10,
    parser: (v) => parseFloat(v) || 10,
    description: '3D旋转角度'
  },
  
  // ===== StarField =====
  enableStarField: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v !== false && v !== 'false',
    description: '启用星空背景'
  },
  starCount: {
    type: 'number',
    defaultValue: 50,
    parser: (v) => parseInt(v) || 50,
    description: '星星数量'
  },
  starOpacity: {
    type: 'number',
    defaultValue: 0.35,
    parser: (v) => parseFloat(v) || 0.35,
    description: '星星透明度'
  },
  
  // ===== 随机种子 =====
  seed: {
    type: 'number',
    defaultValue: 12345,
    parser: (v) => parseInt(v) || 12345,
    description: '随机种子'
  }
};

/**
 * 参数验证
 */
function validate(params) {
  // 验证核心文字
  if (!params.text || params.text.trim().length === 0) {
    return { valid: false, error: '请提供核心文字 (text)' };
  }
  
  // 验证填充类型
  const hasWords = params.words && params.words.length > 0;
  const hasImages = params.images && params.images.length > 0;
  const hasBlessing = params.blessingTypes && params.blessingTypes.length > 0;
  
  // blessing 模式始终可用
  if (params.contentType === 'blessing') {
    return { valid: true };
  }
  
  if (params.contentType === 'text' && !hasWords) {
    // text 模式没有文字时，会自动回退到祝福图案
    return { valid: true };
  }
  
  if (params.contentType === 'image' && !hasImages) {
    // image 模式没有图片时，会自动回退到祝福图案
    return { valid: true };
  }
  
  if (params.contentType === 'mixed' && !hasWords && !hasImages && !hasBlessing) {
    // mixed 模式没有任何内容时，会自动使用默认祝福图案
    return { valid: true };
  }
  
  return { valid: true };
}

/**
 * 时长计算函数
 */
function calculateDuration(params) {
  if (params.duration && params.duration !== 10) return params.duration;
  
  // 依次展示模式：每个字的展示时间
  if (params.charAnimationMode === 'sequential' && params.text && params.text.length > 1) {
    const textLength = params.text.length;
    const totalCharTime = (textLength - 1) * params.charInterval + params.charStayDuration;
    const baseDuration = params.entranceDuration + params.fillDuration;
    return Math.ceil(Math.max(totalCharTime, baseDuration + 60) / params.fps);
  }
  
  // 同时展示模式：入场 + 填充动画 + 停留时间
  const baseDuration = params.entranceDuration + params.fillDuration + 60;
  
  // 根据文字长度调整
  const textLength = (params.text || '福').length;
  const textBonus = Math.max(0, textLength - 1) * 30;
  
  return Math.ceil((baseDuration + textBonus) / params.fps);
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
