/**
 * 儿童生日祝福特效配置 v6.0
 * 
 * 更新说明：
 * - 视频时长固定为 124 秒（4秒倒计时 + 120秒正片）
 * - 移除 characterSeries、characterType、characterImageSrc（被 blessingSeries 替代）
 * - 新增 blessingSeries 祝福系列参数（西游记/生肖/童话/自定义）
 * - 新增 customCharacterImages、customCharacterVideos 自定义角色资源
 * - 简化参数结构：只需 name + blessingSeries 即可生成视频
 */

const path = require('path');

// 特效基础信息
const config = {
  id: 'kids-birthday-effect',
  name: '儿童生日祝福',
  compositionId: 'KidsBirthday',
  path: path.join(__dirname, '../../project'),
  description: '专为3-10岁儿童设计的生日祝福视频，固定时长124秒（4秒倒计时+120秒正片）'
};

// 参数定义
const params = {
  // ========== 基本信息 ==========
  name: {
    type: 'string',
    defaultValue: '小明',
    required: true,
    description: '主角名字（1-10字）'
  },
  age: {
    type: 'number',
    defaultValue: 6,
    description: '年龄（1-18岁）'
  },
  message: {
    type: 'string',
    defaultValue: '愿你每天开心成长，梦想成真！',
    description: '祝福语（最多100字）'
  },
  
  // ========== 视频配置（固定 124 秒） ==========
  duration: {
    type: 'number',
    defaultValue: 124,
    description: '视频时长(秒)，固定为 124 秒（4秒倒计时 + 120秒正片）'
  },
  fps: {
    type: 'number',
    defaultValue: 24,
    description: '帧率'
  },
  width: {
    type: 'number',
    defaultValue: 720,
    description: '视频宽度'
  },
  height: {
    type: 'number',
    defaultValue: 1280,
    description: '视频高度'
  },
  
  // ========== 风格（颜色主题） ==========
  subStyle: {
    type: 'string',
    defaultValue: 'general',
    description: '风格主题：girl_unicorn(粉紫) | boy_rocket(蓝绿) | animal(绿黄) | general(黄蓝)'
  },
  
  // ========== 祝福系列（决定角色和视频资源） ==========
  blessingSeries: {
    type: 'string',
    defaultValue: 'journey_to_the_west',
    description: '祝福系列：journey_to_the_west(西游记) | zodiac(生肖守护神) | fairy_tale(童话) | custom(自定义)'
  },
  
  // ========== 自定义角色资源（可选，覆盖系列默认） ==========
  customCharacterImages: {
    type: 'array',
    defaultValue: null,
    description: '自定义角色图片路径列表，覆盖祝福系列的默认角色图片'
  },
  customCharacterVideos: {
    type: 'array',
    defaultValue: null,
    description: '自定义角色视频路径列表，覆盖祝福系列的默认角色视频'
  },
  
  // ========== 照片系统 ==========
  photos: {
    type: 'array',
    defaultValue: [],
    description: '照片列表（最多5张，每张包含 src 字段）'
  },
  
  // ========== 梦想泡泡 ==========
  dreams: {
    type: 'array',
    defaultValue: ['astronaut', 'artist', 'racer'],
    description: '梦想职业列表（最多5个）：astronaut | artist | racer | doctor | teacher | scientist | musician | athlete | chef | pilot'
  },
  
  // ========== 布局 ==========
  orientation: {
    type: 'string',
    defaultValue: 'portrait',
    description: '屏幕方向：portrait(竖屏9:16) | landscape(横屏16:9)'
  },
  
  // ========== 名字样式 ==========
  nameFontSize: {
    type: 'number',
    defaultValue: 120,
    description: '名字字体大小（60-200）'
  },
  nameColor: {
    type: 'string',
    defaultValue: null,
    description: '名字颜色（可选，默认跟随主题）'
  },
  showAge: {
    type: 'boolean',
    defaultValue: true,
    description: '是否显示年龄标签'
  },
  
  // ========== 祝福语样式 ==========
  blessingText: {
    type: 'string',
    defaultValue: '生日快乐',
    description: '主祝福文字'
  },
  blessingFontSize: {
    type: 'number',
    defaultValue: 60,
    description: '祝福语字体大小（30-100）'
  },
  
  // ========== 卡通元素 ==========
  cartoonElements: {
    type: 'array',
    defaultValue: null,
    description: '卡通元素配置（可选）'
  },
  
  // ========== 粒子效果 ==========
  confettiLevel: {
    type: 'string',
    defaultValue: 'high',
    description: '彩带粒子密度：low | medium | high'
  },
  
  // ========== 动画速度 ==========
  animationSpeed: {
    type: 'string',
    defaultValue: 'normal',
    description: '动画速度：slow | normal | fast'
  },
  
  // ========== 音频 ==========
  musicEnabled: {
    type: 'boolean',
    defaultValue: true,
    description: '是否启用背景音乐'
  },
  musicTrack: {
    type: 'string',
    defaultValue: 'kids_party_01',
    description: '背景音乐曲目'
  },
  birthdaySongSource: {
    type: 'string',
    defaultValue: null,
    description: '生日歌音频文件路径（有值时在模块G播放）'
  },
  birthdaySongVolume: {
    type: 'number',
    defaultValue: 0.6,
    description: '生日歌音量（0-1）'
  },
  
  // ========== 随机种子 ==========
  seed: {
    type: 'number',
    defaultValue: null,
    description: '随机种子（可选，用于复现效果）'
  },
  
  // ========== 自定义章节 ==========
  chapterList: {
    type: 'array',
    defaultValue: null,
    description: '自定义章节配置列表（可选，用于高级定制，按id与默认配置合并）'
  },
};

// 辅助函数：获取有效的祝福系列
function getValidBlessingSeries() {
  return ['journey_to_the_west', 'zodiac', 'fairy_tale', 'custom'];
}

// 辅助函数：获取祝福系列配置
function getBlessingSeriesConfig(series) {
  const configs = {
    journey_to_the_west: {
      name: '西游记系列',
      description: '孙悟空、唐僧、猪八戒、沙和尚、白龙马',
      characters: [
        { type: 'sun_wukong', name: '孙悟空', greeting: '俺老孙来也！祝你生日快乐！' },
        { type: 'tang_seng', name: '唐僧', greeting: '阿弥陀佛，祝你健康成长！' },
        { type: 'zhu_bajie', name: '猪八戒', greeting: '嘿嘿，生日快乐！' },
        { type: 'sha_wujing', name: '沙和尚', greeting: '祝你天天开心！' },
        { type: 'white_dragon_horse', name: '白龙马', greeting: '祝你一马当先！' }
      ]
    },
    zodiac: {
      name: '生肖守护神系列',
      description: '12生肖守护神',
      characters: [
        { type: 'tiger', name: '小老虎', greeting: '嗷呜～祝你生日快乐！' },
        { type: 'rabbit', name: '小兔子', greeting: '蹦蹦跳～祝你快乐成长！' },
        { type: 'dragon', name: '小龙龙', greeting: '吼～祝你心想事成！' }
      ]
    },
    fairy_tale: {
      name: '童话系列',
      description: '经典童话角色',
      characters: [
        { type: 'mickey', name: '米奇', greeting: '祝你生日快乐！' }
      ]
    },
    custom: {
      name: '自定义系列',
      description: '使用自定义角色资源',
      characters: []
    }
  };
  return configs[series] || configs.journey_to_the_west;
}

// 辅助函数：获取 Composition ID
function getCompositionId(orientation) {
  return 'KidsBirthday';
}

// 参数验证
function validate(params) {
  if (!params.name || params.name.trim() === '') {
    return { valid: false, error: '请提供主角名字 (name)' };
  }
  if (params.name.length > 10) {
    return { valid: false, error: '名字长度不能超过10个字符' };
  }
  if (params.age && (params.age < 1 || params.age > 18)) {
    return { valid: false, error: '年龄必须在1-18岁之间' };
  }
  if (params.message && params.message.length > 100) {
    return { valid: false, error: '祝福语长度不能超过100个字符' };
  }
  
  // 验证祝福系列
  if (params.blessingSeries) {
    const validSeries = getValidBlessingSeries();
    if (!validSeries.includes(params.blessingSeries)) {
      return { valid: false, error: `祝福系列无效，可选：${validSeries.join(', ')}` };
    }
  }
  
  // custom 系列建议提供自定义资源
  if (params.blessingSeries === 'custom' && !params.customCharacterImages && !params.customCharacterVideos) {
    return { valid: false, error: 'custom 系列需要提供 customCharacterImages 或 customCharacterVideos' };
  }
  
  if (params.photos && params.photos.length > 5) {
    return { valid: false, error: '照片数量不能超过5张' };
  }
  if (params.dreams && params.dreams.length > 5) {
    return { valid: false, error: '梦想数量不能超过5个' };
  }
  
  return { valid: true };
}

/**
 * 构建渲染参数
 * 支持嵌套参数格式
 */
function buildRenderParams(reqParams, commonParams) {
  const orientation = reqParams.orientation || params.orientation.defaultValue;
  
  const result = { ...commonParams };

  // 处理特效特有参数
  for (const [name, def] of Object.entries(params)) {
    if (reqParams[name] !== undefined && reqParams[name] !== null) {
      result[name] = reqParams[name];
    } else if (def.defaultValue !== undefined) {
      result[name] = typeof def.defaultValue === 'function' ? def.defaultValue() : def.defaultValue;
    }
  }
  
  // 固定时长为 124 秒
  result.duration = 124;
  
  // 支持嵌套参数（背景、音频等）
  if (reqParams.background) result.background = reqParams.background;
  if (reqParams.audio) result.audio = reqParams.audio;
  if (reqParams.overlay) result.overlay = reqParams.overlay;
  if (reqParams.marquee) result.marquee = reqParams.marquee;
  if (reqParams.watermark) result.watermark = reqParams.watermark;
  if (reqParams.radialBurst) result.radialBurst = reqParams.radialBurst;
  if (reqParams.foreground) result.foreground = reqParams.foreground;
  
  // 动态设置 Composition ID 和尺寸
  result._compositionId = getCompositionId(orientation);
  if (orientation === 'landscape') {
    result.width = 1280;
    result.height = 720;
  } else {
    result.width = 720;
    result.height = 1280;
  }
  
  return result;
}

// 获取预设配置
function getPresets() {
  return {
    'journey_to_the_west': {
      name: '西游记系列',
      blessingSeries: 'journey_to_the_west',
      subStyle: 'general',
      confettiLevel: 'high',
      description: '孙悟空师徒五人为你庆祝生日'
    },
    'zodiac': {
      name: '生肖守护神',
      blessingSeries: 'zodiac',
      subStyle: 'general',
      confettiLevel: 'high',
      description: '生肖守护神为你送上祝福'
    },
    'girl_unicorn': {
      name: '女孩独角兽',
      blessingSeries: 'journey_to_the_west',
      subStyle: 'girl_unicorn',
      confettiLevel: 'high',
      dreams: ['artist', 'musician', 'teacher'],
      description: '粉紫配色，适合小女孩'
    },
    'boy_rocket': {
      name: '男孩火箭',
      blessingSeries: 'journey_to_the_west',
      subStyle: 'boy_rocket',
      confettiLevel: 'high',
      dreams: ['astronaut', 'racer', 'scientist'],
      description: '蓝绿配色，适合小男孩'
    },
    'animal': {
      name: '可爱动物',
      blessingSeries: 'zodiac',
      subStyle: 'animal',
      confettiLevel: 'high',
      description: '可爱动物主题'
    },
    'general': {
      name: '通用派对',
      blessingSeries: 'journey_to_the_west',
      subStyle: 'general',
      confettiLevel: 'high',
      description: '通用派对风格'
    },
  };
}

// 获取祝福系列选项
function getBlessingSeriesOptions() {
  return {
    journey_to_the_west: {
      name: '西游记系列',
      description: '孙悟空师徒五人为你庆祝生日',
      characters: [
        { type: 'sun_wukong', name: '孙悟空', greeting: '俺老孙来也！祝你生日快乐！' },
        { type: 'tang_seng', name: '唐僧', greeting: '阿弥陀佛，祝你健康成长！' },
        { type: 'zhu_bajie', name: '猪八戒', greeting: '嘿嘿，生日快乐！' },
        { type: 'sha_wujing', name: '沙和尚', greeting: '祝你天天开心！' },
        { type: 'white_dragon_horse', name: '白龙马', greeting: '祝你一马当先！' }
      ]
    },
    zodiac: {
      name: '生肖守护神系列',
      description: '12生肖守护神，选择对应的生肖角色',
      characters: [
        { type: 'tiger', name: '小老虎', greeting: '嗷呜～祝你生日快乐！' },
        { type: 'rabbit', name: '小兔子', greeting: '蹦蹦跳～祝你快乐成长！' },
        { type: 'dragon', name: '小龙龙', greeting: '吼～祝你心想事成！' }
      ]
    },
    fairy_tale: {
      name: '童话系列',
      description: '经典童话角色，适合喜欢童话的小朋友',
      characters: [
        { type: 'mickey', name: '米奇', greeting: '祝你生日快乐！' }
      ]
    },
    custom: {
      name: '自定义系列',
      description: '使用自定义角色图片和视频',
      characters: []
    }
  };
}

// 获取模块列表
function getModules() {
  return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
}

// 获取视频时长
function getDuration() {
  return 124;
}

module.exports = {
  config,
  params,
  validate,
  buildRenderParams,
  getPresets,
  getBlessingSeriesOptions,
  getBlessingSeriesConfig,
  getModules,
  getDuration
};
