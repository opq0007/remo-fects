/**
 * 公共参数配置
 * 
 * 定义所有特效项目共享的公共参数（背景、遮罩、音频等）
 * 这些参数会被自动合并到每个特效的参数中
 */

/**
 * 公共参数定义
 * 包括：
 * - 背景配置（背景类型、颜色、源文件）
 * - 遮罩配置（遮罩颜色、透明度）
 * - 音频配置（启用、音量、循环）
 * - 基础视频参数（宽度、高度、帧率、时长）
 */
const commonParams = {
  // ===== 基础视频参数 =====
  width: {
    type: 'number',
    defaultValue: 720,
    parser: (v) => parseInt(v) || 720,
    description: '视频宽度'
  },
  height: {
    type: 'number',
    defaultValue: 1280,
    parser: (v) => parseInt(v) || 1280,
    description: '视频高度'
  },
  fps: {
    type: 'number',
    defaultValue: 24,
    parser: (v) => parseInt(v) || 24,
    description: '帧率'
  },
  duration: {
    type: 'number',
    defaultValue: 10,
    parser: (v) => parseFloat(v) || 10,
    description: '视频时长（秒）'
  },

  // ===== 背景配置 =====
  backgroundType: {
    type: 'string',
    defaultValue: 'color',
    description: '背景类型：color | image | video'
  },
  backgroundColor: {
    type: 'string',
    defaultValue: '#1a1a2e',
    description: '背景颜色'
  },
  backgroundSource: {
    type: 'string',
    defaultValue: null,
    description: '背景源文件（图片或视频）'
  },
  backgroundVideoLoop: {
    type: 'boolean',
    defaultValue: true,
    description: '背景视频是否循环'
  },
  backgroundVideoMuted: {
    type: 'boolean',
    defaultValue: true,
    description: '背景视频是否静音'
  },

  // ===== 遮罩配置 =====
  overlayColor: {
    type: 'string',
    defaultValue: '#000000',
    description: '遮罩颜色'
  },
  overlayOpacity: {
    type: 'number',
    defaultValue: 0.2,
    parser: (v) => parseFloat(v) || 0.2,
    description: '遮罩透明度'
  },

  // ===== 音频配置 =====
  audioEnabled: {
    type: 'boolean',
    defaultValue: false,
    parser: (v) => v === 'true' || v === true,
    description: '是否启用音频'
  },
  audioSource: {
    type: 'string',
    defaultValue: 'coin-sound.mp3',
    description: '音频源文件'
  },
  audioVolume: {
    type: 'number',
    defaultValue: 0.5,
    parser: (v) => parseFloat(v) || 0.5,
    description: '音量（0-1）'
  },
  audioLoop: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v !== 'false' && v !== false,
    description: '音频是否循环'
  },

  // ===== 随机种子 =====
  seed: {
    type: 'number',
    defaultValue: () => Math.floor(Math.random() * 10000),
    parser: (v) => parseInt(v) || Math.floor(Math.random() * 10000),
    description: '随机种子'
  },

  // ===== 水印配置 =====
  watermarkEnabled: {
    type: 'boolean',
    defaultValue: false,
    parser: (v) => v === 'true' || v === true,
    description: '是否启用水印'
  },
  watermarkText: {
    type: 'string',
    defaultValue: '© Remo-Fects',
    description: '水印文字'
  },
  watermarkFontSize: {
    type: 'number',
    defaultValue: 24,
    parser: (v) => parseInt(v) || 24,
    description: '水印字体大小'
  },
  watermarkColor: {
    type: 'string',
    defaultValue: '#ffffff',
    description: '水印颜色'
  },
  watermarkOpacity: {
    type: 'number',
    defaultValue: 0.35,
    parser: (v) => parseFloat(v) || 0.35,
    description: '水印透明度（0-1）'
  },
  watermarkSpeed: {
    type: 'number',
    defaultValue: 1,
    parser: (v) => parseFloat(v) || 1,
    description: '水印动画速度'
  },
  watermarkIntensity: {
    type: 'number',
    defaultValue: 0.8,
    parser: (v) => parseFloat(v) || 0.8,
    description: '水印效果强度（0-1）'
  },
  watermarkVelocityX: {
    type: 'number',
    defaultValue: 180,
    parser: (v) => parseFloat(v) || 180,
    description: '水印X方向速度（像素/秒）'
  },
  watermarkVelocityY: {
    type: 'number',
    defaultValue: 120,
    parser: (v) => parseFloat(v) || 120,
    description: '水印Y方向速度（像素/秒）'
  },

  // ===== 走马灯配置 =====
  marqueeEnabled: {
    type: 'boolean',
    defaultValue: false,
    parser: (v) => v === 'true' || v === true,
    description: '是否启用走马灯'
  },
  marqueeForegroundTexts: {
    type: 'array',
    defaultValue: ['新年快乐', '万事如意', '恭喜发财'],
    parser: (v) => {
      if (Array.isArray(v)) return v;
      if (typeof v === 'string') {
        try {
          const parsed = JSON.parse(v);
          return Array.isArray(parsed) ? parsed : [v];
        } catch {
          return v.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      return ['新年快乐', '万事如意', '恭喜发财'];
    },
    description: '前景文字列表'
  },
  marqueeForegroundFontSize: {
    type: 'number',
    defaultValue: 32,
    parser: (v) => parseInt(v) || 32,
    description: '前景文字字体大小'
  },
  marqueeForegroundOpacity: {
    type: 'number',
    defaultValue: 0.9,
    parser: (v) => parseFloat(v) || 0.9,
    description: '前景文字透明度（0-1）'
  },
  marqueeForegroundColor: {
    type: 'string',
    defaultValue: '#ffd700',
    description: '前景文字颜色'
  },
  marqueeForegroundEffect: {
    type: 'string',
    defaultValue: 'none',
    description: '前景文字效果：none | glow | shadow'
  },
  marqueeBackgroundTexts: {
    type: 'array',
    defaultValue: ['新春大吉', '财源广进', '龙年行大运'],
    parser: (v) => {
      if (Array.isArray(v)) return v;
      if (typeof v === 'string') {
        try {
          const parsed = JSON.parse(v);
          return Array.isArray(parsed) ? parsed : [v];
        } catch {
          return v.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      return ['新春大吉', '财源广进', '龙年行大运'];
    },
    description: '背景文字列表'
  },
  marqueeBackgroundFontSize: {
    type: 'number',
    defaultValue: 24,
    parser: (v) => parseInt(v) || 24,
    description: '背景文字字体大小'
  },
  marqueeBackgroundOpacity: {
    type: 'number',
    defaultValue: 0.5,
    parser: (v) => parseFloat(v) || 0.5,
    description: '背景文字透明度（0-1）'
  },
  marqueeBackgroundColor: {
    type: 'string',
    defaultValue: '#ffffff',
    description: '背景文字颜色'
  },
  marqueeBackgroundEffect: {
    type: 'string',
    defaultValue: 'none',
    description: '背景文字效果：none | glow | shadow'
  },
  marqueeOrientation: {
    type: 'string',
    defaultValue: 'horizontal',
    description: '文字项排列方向：horizontal | vertical'
  },
  marqueeTextOrientation: {
    type: 'string',
    defaultValue: 'horizontal',
    description: '单个文字内部字符排列方向：horizontal（水平）或 vertical（垂直）'
  },
  marqueeDirection: {
    type: 'string',
    defaultValue: 'left-to-right',
    description: '运动方向：left-to-right | right-to-left | top-to-bottom | bottom-to-top'
  },
  marqueeSpeed: {
    type: 'number',
    defaultValue: 50,
    parser: (v) => parseFloat(v) || 50,
    description: '走马灯速度（像素/帧）'
  },
  marqueeSpacing: {
    type: 'number',
    defaultValue: 80,
    parser: (v) => parseInt(v) || 80,
    description: '文字间距'
  },
  marqueeForegroundOffsetY: {
    type: 'number',
    defaultValue: 0,
    parser: (v) => parseInt(v) || 0,
    description: '前景层垂直偏移'
  },
  marqueeBackgroundOffsetY: {
    type: 'number',
    defaultValue: 0,
    parser: (v) => parseInt(v) || 0,
    description: '背景层垂直偏移'
  }
};

/**
 * 公共参数名称列表
 * 用于快速检查参数是否为公共参数
 */
const commonParamNames = Object.keys(commonParams);

/**
 * 检查参数名是否为公共参数
 * @param {string} paramName - 参数名
 * @returns {boolean}
 */
function isCommonParam(paramName) {
  return commonParamNames.includes(paramName);
}

/**
 * 获取公共参数的默认值
 * @param {string} paramName - 参数名
 * @returns {*}
 */
function getCommonParamDefault(paramName) {
  const param = commonParams[paramName];
  if (!param) return undefined;
  
  // 支持函数形式的默认值（如随机种子）
  if (typeof param.defaultValue === 'function') {
    return param.defaultValue();
  }
  return param.defaultValue;
}

/**
 * 解析公共参数值
 * @param {string} paramName - 参数名
 * @param {*} value - 原始值
 * @returns {*}
 */
function parseCommonParam(paramName, value) {
  const param = commonParams[paramName];
  if (!param) return value;
  
  if (value === undefined || value === null || value === '') {
    return getCommonParamDefault(paramName);
  }
  
  if (param.parser) {
    return param.parser(value);
  }
  
  return value;
}

/**
 * 构建公共参数对象
 * 从请求参数中提取并解析所有公共参数
 * @param {Object} params - 原始请求参数
 * @returns {Object} - 解析后的公共参数对象
 */
function buildCommonParams(params) {
  const result = {};
  
  for (const [name, def] of Object.entries(commonParams)) {
    if (params[name] !== undefined) {
      result[name] = parseCommonParam(name, params[name]);
    } else {
      result[name] = getCommonParamDefault(name);
    }
  }
  
  return result;
}

module.exports = {
  commonParams,
  commonParamNames,
  isCommonParam,
  getCommonParamDefault,
  parseCommonParam,
  buildCommonParams
};
