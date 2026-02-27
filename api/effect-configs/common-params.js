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
