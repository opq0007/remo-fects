/**
 * 文字大风车特效参数配置
 * 支持二维数组输入，每个第一维是一个叶片，每个第二维是叶片内的内容项
 */

const path = require('path');

const config = {
  id: 'text-windmill-effect',
  name: '文字大风车特效',
  compositionId: 'TextWindmill',
  path: path.join(__dirname, '../../effects/text-windmill-effect')
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
  '#DDA0DD', // 梅红
];

/**
 * 默认叶片数据
 */
const DEFAULT_BLADES_DATA = [
  [{ type: 'text', content: '福' }, { type: 'text', content: '运' }],
  [{ type: 'text', content: '禄' }, { type: 'text', content: '财' }],
  [{ type: 'text', content: '寿' }, { type: 'text', content: '喜' }],
  [{ type: 'text', content: '吉' }, { type: 'text', content: '祥' }],
];

const params = {
  // ===== 叶片数据配置（二维数组） =====
  bladesData: {
    type: 'array',
    defaultValue: DEFAULT_BLADES_DATA,
    parser: (v) => {
      if (!v) return DEFAULT_BLADES_DATA;
      if (Array.isArray(v)) {
        // 验证二维数组结构
        if (v.length === 0) return DEFAULT_BLADES_DATA;
        // 确保每个元素都是数组
        return v.map(blade => {
          if (!Array.isArray(blade)) {
            // 如果不是数组，转换为单个元素数组
            return [parseContentItem(blade)];
          }
          return blade.map(item => parseContentItem(item));
        });
      }
      if (typeof v === 'string') {
        try {
          const parsed = JSON.parse(v);
          if (Array.isArray(parsed)) {
            return parsed.map(blade => {
              if (!Array.isArray(blade)) return [parseContentItem(blade)];
              return blade.map(item => parseContentItem(item));
            });
          }
        } catch (e) {
          // 解析失败，尝试简单分割
        }
      }
      return DEFAULT_BLADES_DATA;
    },
    description: '叶片数据（二维数组），每个第一维是一个叶片，每个第二维是叶片内的内容项'
  },

  // ===== 简化文字输入（兼容模式） =====
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
    description: '文字列表（简化模式，自动生成叶片）'
  },

  // ===== 字体配置 =====
  fontSize: {
    type: 'number',
    defaultValue: 60,
    parser: (v) => parseInt(v) || 60,
    description: '基础字体大小'
  },

  // ===== 颜色配置 =====
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
    description: '叶片颜色列表（循环使用）'
  },
  glowColor: {
    type: 'string',
    defaultValue: '#ffd700',
    description: '发光颜色'
  },
  glowIntensity: {
    type: 'number',
    defaultValue: 1.2,
    parser: (v) => parseFloat(v) || 1.2,
    description: '发光强度'
  },

  // ===== 旋转配置 =====
  rotationSpeed: {
    type: 'number',
    defaultValue: 0.3,
    parser: (v) => parseFloat(v) || 0.3,
    description: '旋转速度（圈/秒）'
  },
  rotationDirection: {
    type: 'string',
    defaultValue: 'clockwise',
    parser: (v) => v === 'counterclockwise' ? 'counterclockwise' : 'clockwise',
    description: '旋转方向：clockwise（顺时针）或 counterclockwise（逆时针）'
  },

  // ===== 中心点配置 =====
  centerOffsetY: {
    type: 'number',
    defaultValue: 0,
    parser: (v) => {
      const val = parseFloat(v) || 0;
      return Math.max(-0.5, Math.min(0.5, val));
    },
    description: '中心点垂直偏移（-0.5 到 0.5，相对于画面高度）'
  },

  // ===== 3D 视角配置 =====
  tiltAngle: {
    type: 'number',
    defaultValue: 30,
    parser: (v) => {
      const val = parseInt(v) || 30;
      return Math.max(-60, Math.min(60, val));
    },
    description: '3D 视角倾斜角度（度）'
  },
  rotateY: {
    type: 'number',
    defaultValue: 0,
    parser: (v) => {
      const val = parseInt(v) || 0;
      return Math.max(-180, Math.min(180, val));
    },
    description: '3D 视角 Y 轴旋转角度（度）'
  },
  perspective: {
    type: 'number',
    defaultValue: 1000,
    parser: (v) => parseInt(v) || 1000,
    description: '透视距离'
  },

  // ===== 效果开关 =====
  enableGlow: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v !== false && v !== 'false',
    description: '启用发光效果'
  },
  appearDuration: {
    type: 'number',
    defaultValue: 30,
    parser: (v) => parseInt(v) || 30,
    description: '叶片出现动画时长（帧）'
  },

  // ===== 叶片控制 =====
  itemRotateWithBlade: {
    type: 'boolean',
    defaultValue: false,
    parser: (v) => v === true || v === 'true',
    description: '叶片内部元素是否随叶片旋转（true: 随叶片旋转, false: 保持水平）'
  },
  bladeLengthRatio: {
    type: 'number',
    defaultValue: 0.7,
    parser: (v) => {
      const val = parseFloat(v) || 0.7;
      return Math.max(0.3, Math.min(1, val));
    },
    description: '叶片长度比例（0.3-1.0）'
  },
  enableRandomBladeLength: {
    type: 'boolean',
    defaultValue: false,
    parser: (v) => v === true || v === 'true',
    description: '是否启用叶片长度随机变化'
  },

  // ===== 祝福图案样式 =====
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
  }
};

/**
 * 解析单个内容项
 */
function parseContentItem(item) {
  if (typeof item === 'string') {
    // 判断是否是祝福图案类型
    const blessingTypes = ['goldCoin', 'moneyBag', 'luckyBag', 'redPacket'];
    if (blessingTypes.includes(item)) {
      return { type: 'blessing', content: item };
    }
    return { type: 'text', content: item };
  }
  if (typeof item === 'object' && item !== null) {
    return {
      type: item.type || 'text',
      content: item.content || ''
    };
  }
  return { type: 'text', content: String(item) };
}

function validate(params) {
  // 如果提供了 bladesData 或 words，则有效
  if ((params.bladesData && params.bladesData.length > 0) ||
      (params.words && params.words.length > 0)) {
    return { valid: true };
  }
  // 否则使用默认值
  return { valid: true };
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

  // 如果只提供了 words，自动生成 bladesData
  if (!reqParams.bladesData && result.words && result.words.length > 0) {
    const bladeCount = Math.min(6, Math.max(4, Math.ceil(result.words.length / 3)));
    const bladesData = [];
    const itemsPerBlade = Math.ceil(result.words.length / bladeCount);
    
    for (let i = 0; i < bladeCount; i++) {
      const bladeItems = [];
      for (let j = 0; j < itemsPerBlade; j++) {
        const wordIndex = i * itemsPerBlade + j;
        if (wordIndex < result.words.length) {
          bladeItems.push({ type: 'text', content: result.words[wordIndex] });
        }
      }
      if (bladeItems.length > 0) {
        bladesData.push(bladeItems);
      }
    }
    result.bladesData = bladesData;
  }

  return result;
}

module.exports = {
  config,
  params,
  validate,
  buildRenderParams
};
