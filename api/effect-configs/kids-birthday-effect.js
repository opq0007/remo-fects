const path = require('path');

/**
 * 儿童生日祝福特效配置 v3.0
 * 支持模块化分镜、角色系统、照片互动等功能
 * 使用嵌套参数结构 - 配置驱动架构
 */

// 1. 特效基础信息
const config = {
  id: 'kids-birthday-effect',
  name: '儿童生日祝福',
  compositionId: 'KidsBirthday120s',  // 默认使用120秒完整版
  path: path.join(__dirname, '../../project'),
  description: '专为3-10岁儿童设计的生日祝福视频，支持模块化分镜、角色系统和照片互动'
};

// 2. 参数定义（扁平结构，用于 API 输入）
const params = {
  // ========== 基本信息 ==========
  name: {
    type: 'string',
    defaultValue: '小明',
    parser: (v) => typeof v === 'string' ? v.slice(0, 10) : '小明',
    required: true,
    description: '主角名字（最多10字）'
  },
  age: {
    type: 'number',
    defaultValue: 6,
    parser: (v) => {
      const num = parseInt(v);
      return num >= 1 && num <= 18 ? num : 6;
    },
    description: '年龄（1-18岁）'
  },
  message: {
    type: 'string',
    defaultValue: '愿你每天开心成长，梦想成真！',
    parser: (v) => typeof v === 'string' ? v.slice(0, 100) : '愿你每天开心成长，梦想成真！',
    description: '祝福语（最多100字）'
  },
  
  // ========== 视频版本 ==========
  videoVersion: {
    type: 'enum',
    defaultValue: '120s',
    parser: (v) => ['60s', '90s', '120s'].includes(v) ? v : '120s',
    description: '视频时长版本：60s（短视频版）| 90s（分享版）| 120s（完整版）'
  },
  duration: {
    type: 'number',
    defaultValue: 120,
    parser: (v) => {
      const num = parseInt(v);
      return num >= 5 && num <= 180 ? num : 120;
    },
    description: '视频时长（秒），会根据videoVersion自动调整'
  },
  
  // ========== 风格设置 ==========
  subStyle: {
    type: 'enum',
    defaultValue: 'general',
    parser: (v) => ['girl_unicorn', 'boy_rocket', 'animal', 'general'].includes(v) ? v : 'general',
    description: '风格主题：girl_unicorn(女孩独角兽) | boy_rocket(男孩火箭) | animal(可爱动物) | general(通用派对)'
  },
  
  // ========== 角色系统 ==========
  characterSeries: {
    type: 'enum',
    defaultValue: 'zodiac',
    parser: (v) => ['zodiac', 'pet', 'hero'].includes(v) ? v : 'zodiac',
    description: '角色系列：zodiac(生肖守护神) | pet(萌宠精灵) | hero(勇气超人)'
  },
  characterType: {
    type: 'string',
    defaultValue: 'tiger',
    parser: (v, allParams) => {
      const series = allParams?.characterSeries || 'zodiac';
      const validTypes = getValidCharacterTypes(series);
      return validTypes.includes(v) ? v : validTypes[0];
    },
    description: '角色类型（根据series选择：生肖12种/萌宠6种/超人5种）'
  },
  characterImageSrc: {
    type: 'string',
    defaultValue: null,
    description: '自定义角色图片路径（可选）'
  },
  
  // ========== 照片系统 ==========
  photos: {
    type: 'array',
    defaultValue: [],
    parser: (v) => {
      if (!Array.isArray(v)) return [];
      return v.slice(0, 5).map((p, i) => ({
        id: p.id || `photo-${i}`,
        src: p.src || '',
        caption: p.caption || '',
        memory: p.memory || ''
      }));
    },
    description: '照片列表（最多5张，每张包含src/caption/memory）'
  },
  
  // ========== 梦想泡泡 ==========
  dreams: {
    type: 'array',
    defaultValue: ['astronaut', 'artist', 'racer'],
    parser: (v) => {
      const validJobs = ['astronaut', 'artist', 'racer', 'doctor', 'teacher', 'scientist', 'musician', 'athlete', 'chef', 'pilot'];
      if (!Array.isArray(v)) return ['astronaut', 'artist', 'racer'];
      return v.filter(j => validJobs.includes(j)).slice(0, 5);
    },
    description: '梦想职业列表（最多5个）'
  },
  
  // ========== 布局 ==========
  orientation: {
    type: 'enum',
    defaultValue: 'portrait',
    parser: (v) => ['portrait', 'landscape'].includes(v) ? v : 'portrait',
    description: '屏幕方向：portrait(竖屏9:16) | landscape(横屏16:9)'
  },
  
  // ========== 名字样式 ==========
  nameFontSize: {
    type: 'number',
    defaultValue: 120,
    parser: (v) => {
      const num = parseInt(v);
      return num >= 60 && num <= 200 ? num : 120;
    },
    description: '名字字体大小（60-200）'
  },
  showAge: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v === 'true' || v === true,
    description: '是否显示年龄标签'
  },
  nameColor: {
    type: 'string',
    defaultValue: null,
    parser: (v) => v || null,
    description: '名字颜色（可选，默认跟随主题）'
  },
  
  // ========== 祝福语样式 ==========
  blessingText: {
    type: 'string',
    defaultValue: '生日快乐',
    parser: (v) => v || '生日快乐',
    description: '主祝福文字'
  },
  blessingFontSize: {
    type: 'number',
    defaultValue: 60,
    parser: (v) => {
      const num = parseInt(v);
      return num >= 30 && num <= 100 ? num : 60;
    },
    description: '祝福语字体大小（30-100）'
  },
  
  // ========== 特效强度 ==========
  confettiLevel: {
    type: 'enum',
    defaultValue: 'high',
    parser: (v) => ['low', 'medium', 'high'].includes(v) ? v : 'high',
    description: '彩带粒子密度：low | medium | high'
  },
  animationSpeed: {
    type: 'enum',
    defaultValue: 'normal',
    parser: (v) => ['slow', 'normal', 'fast'].includes(v) ? v : 'normal',
    description: '动画速度：slow | normal | fast'
  },
  
  // ========== 音频设置 ==========
  musicEnabled: {
    type: 'boolean',
    defaultValue: true,
    parser: (v) => v === 'true' || v === true,
    description: '是否启用背景音乐'
  },
  musicTrack: {
    type: 'string',
    defaultValue: 'kids_party_01',
    parser: (v) => v || 'kids_party_01',
    description: '背景音乐曲目'
  },
  birthdaySongSource: {
    type: 'string',
    defaultValue: null,
    description: '自定义生日歌路径（可选）'
  },
  birthdaySongVolume: {
    type: 'number',
    defaultValue: 0.6,
    parser: (v) => {
      const num = parseFloat(v);
      return num >= 0 && num <= 1 ? num : 0.6;
    },
    description: '生日歌音量（0-1）'
  },
  
  // ========== 卡通元素 ==========
  cartoonElements: {
    type: 'array',
    defaultValue: null,
    parser: (v) => v || null,
    description: '卡通元素配置（可选）'
  },
  
  // ========== 随机种子 ==========
  seed: {
    type: 'number',
    defaultValue: null,
    parser: (v) => v ? parseInt(v) : null,
    description: '随机种子（可选，用于复现效果）'
  },
  
  // ========== 自定义章节列表 ==========
  chapterList: {
    type: 'array',
    defaultValue: null,
    parser: (v) => v || null,
    description: '自定义章节配置列表（可选，用于高级定制）'
  },
};

// 辅助函数：获取有效的角色类型
function getValidCharacterTypes(series) {
  switch (series) {
    case 'zodiac':
      return ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'];
    case 'pet':
      return ['bunny', 'kitten', 'puppy', 'bear', 'fox', 'panda'];
    case 'hero':
      return ['superhero', 'astronaut', 'knight', 'wizard', 'pirate'];
    default:
      return ['tiger'];
  }
}

// 辅助函数：根据视频版本获取Composition ID
function getCompositionId(videoVersion, orientation) {
  if (orientation === 'landscape') {
    return 'KidsBirthdayLandscape';
  }
  switch (videoVersion) {
    case '60s': return 'KidsBirthday60s';
    case '90s': return 'KidsBirthday90s';
    case '120s': return 'KidsBirthday120s';
    default: return 'KidsBirthday120s';
  }
}

// 辅助函数：根据视频版本获取时长
function getDurationByVersion(version) {
  switch (version) {
    case '60s': return 60;
    case '90s': return 90;
    case '120s': return 120;
    default: return 120;
  }
}

// 3. 参数验证函数
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
  
  // 验证角色类型
  if (params.characterType) {
    const validTypes = getValidCharacterTypes(params.characterSeries || 'zodiac');
    if (!validTypes.includes(params.characterType)) {
      return { valid: false, error: `角色类型无效，${params.characterSeries}系列可选：${validTypes.join(', ')}` };
    }
  }
  
  // 验证照片
  if (params.photos && params.photos.length > 5) {
    return { valid: false, error: '照片数量不能超过5张' };
  }
  
  // 验证梦想
  if (params.dreams && params.dreams.length > 5) {
    return { valid: false, error: '梦想数量不能超过5个' };
  }
  
  return { valid: true };
}

/**
 * 4. 构建渲染参数
 * 将扁平的 API 参数转换为组件需要的格式
 * 注意：KidsBirthdayComposition 内部处理嵌套参数结构
 */
function buildRenderParams(reqParams, commonParams) {
  const videoVersion = reqParams.videoVersion || params.videoVersion.defaultValue;
  const orientation = reqParams.orientation || params.orientation.defaultValue;
  const characterSeries = reqParams.characterSeries || params.characterSeries.defaultValue;
  
  const result = {
    ...commonParams,
    
    // 基本信息
    name: reqParams.name || params.name.defaultValue,
    age: reqParams.age ?? params.age.defaultValue,
    message: reqParams.message || params.message.defaultValue,
    
    // 视频版本
    videoVersion,
    duration: reqParams.duration ?? getDurationByVersion(videoVersion),
    
    // 风格设置
    subStyle: reqParams.subStyle || params.subStyle.defaultValue,
    
    // 角色系统
    characterSeries,
    characterType: reqParams.characterType || getValidCharacterTypes(characterSeries)[0],
    characterImageSrc: reqParams.characterImageSrc || null,
    
    // 照片系统
    photos: params.photos.parser(reqParams.photos),
    
    // 梦想泡泡
    dreams: params.dreams.parser(reqParams.dreams),
    
    // 布局
    orientation,
    
    // 名字样式
    nameFontSize: reqParams.nameFontSize ?? params.nameFontSize.defaultValue,
    showAge: reqParams.showAge ?? params.showAge.defaultValue,
    nameColor: reqParams.nameColor || null,
    
    // 祝福语
    blessingText: reqParams.blessingText || params.blessingText.defaultValue,
    blessingFontSize: reqParams.blessingFontSize ?? params.blessingFontSize.defaultValue,
    
    // 特效设置
    confettiLevel: reqParams.confettiLevel || params.confettiLevel.defaultValue,
    animationSpeed: reqParams.animationSpeed || params.animationSpeed.defaultValue,
    
    // 音频设置
    musicEnabled: reqParams.musicEnabled ?? params.musicEnabled.defaultValue,
    musicTrack: reqParams.musicTrack || params.musicTrack.defaultValue,
    birthdaySongSource: reqParams.birthdaySongSource || null,
    birthdaySongVolume: reqParams.birthdaySongVolume ?? params.birthdaySongVolume.defaultValue,
    
    // 卡通元素
    cartoonElements: reqParams.cartoonElements || null,
    
    // 随机种子
    seed: reqParams.seed || null,
    
    // 自定义章节
    chapterList: reqParams.chapterList || null,
  };
  
  // 动态设置 Composition ID
  result._compositionId = getCompositionId(videoVersion, orientation);
  
  // 动态设置尺寸
  if (orientation === 'landscape') {
    result.width = 1280;
    result.height = 720;
  } else {
    result.width = 720;
    result.height = 1280;
  }
  
  return result;
}

// 5. 获取默认参数组合（用于预览）
function getPresets() {
  return {
    'general_120s': {
      name: '通用派对（完整版）',
      videoVersion: '120s',
      subStyle: 'general',
      characterSeries: 'zodiac',
      characterType: 'tiger',
      confettiLevel: 'high'
    },
    'girl_unicorn_120s': {
      name: '女孩独角兽（完整版）',
      videoVersion: '120s',
      subStyle: 'girl_unicorn',
      characterSeries: 'pet',
      characterType: 'bunny',
      confettiLevel: 'high',
      dreams: ['artist', 'musician', 'teacher']
    },
    'boy_rocket_120s': {
      name: '男孩火箭（完整版）',
      videoVersion: '120s',
      subStyle: 'boy_rocket',
      characterSeries: 'hero',
      characterType: 'astronaut',
      confettiLevel: 'high',
      dreams: ['astronaut', 'racer', 'scientist']
    },
    'short_60s': {
      name: '短视频版（60秒）',
      videoVersion: '60s',
      subStyle: 'general',
      characterSeries: 'zodiac',
      characterType: 'tiger',
      confettiLevel: 'medium'
    },
    'landscape': {
      name: '横屏版（电视投屏）',
      videoVersion: '120s',
      orientation: 'landscape',
      subStyle: 'general',
      characterSeries: 'zodiac',
      characterType: 'tiger',
      confettiLevel: 'high'
    }
  };
}

// 6. 获取角色列表（用于前端选择）
function getCharacterOptions() {
  return {
    zodiac: {
      name: '生肖守护神',
      description: '根据小朋友的生肖选择守护神',
      characters: [
        { type: 'rat', name: '小老鼠', description: '聪明机灵' },
        { type: 'ox', name: '小牛牛', description: '勤恳踏实' },
        { type: 'tiger', name: '小老虎', description: '勇敢威武' },
        { type: 'rabbit', name: '小兔子', description: '温柔可爱' },
        { type: 'dragon', name: '小龙龙', description: '神气活现' },
        { type: 'snake', name: '小蛇蛇', description: '灵动优雅' },
        { type: 'horse', name: '小马驹', description: '自由奔放' },
        { type: 'goat', name: '小山羊', description: '温和善良' },
        { type: 'monkey', name: '小猴子', description: '活泼好动' },
        { type: 'rooster', name: '小公鸡', description: '自信美丽' },
        { type: 'dog', name: '小狗汪', description: '忠诚可靠' },
        { type: 'pig', name: '小猪猪', description: '可爱福气' }
      ]
    },
    pet: {
      name: '萌宠精灵',
      description: '可爱的小动物精灵',
      characters: [
        { type: 'bunny', name: '蹦蹦兔', description: '蹦蹦跳跳' },
        { type: 'kitten', name: '喵喵猫', description: '温柔粘人' },
        { type: 'puppy', name: '汪汪狗', description: '活泼忠诚' },
        { type: 'bear', name: '小熊熊', description: '温暖抱抱' },
        { type: 'fox', name: '小狐狸', description: '机智聪明' },
        { type: 'panda', name: '盼盼熊', description: '国宝萌宠' }
      ]
    },
    hero: {
      name: '勇气超人',
      description: '勇敢的小英雄',
      characters: [
        { type: 'superhero', name: '超级小英雄', description: '保护世界' },
        { type: 'astronaut', name: '小小宇航员', description: '探索宇宙' },
        { type: 'knight', name: '勇敢小骑士', description: '守护正义' },
        { type: 'wizard', name: '魔法小巫师', description: '神奇魔法' },
        { type: 'pirate', name: '冒险小海盗', description: '勇敢探险' }
      ]
    }
  };
}

module.exports = {
  config,
  params,
  validate,
  buildRenderParams,
  getPresets,
  getCharacterOptions,
  getValidCharacterTypes
};
