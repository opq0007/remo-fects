/**
 * 儿童生日祝福特效配置 v7.0（L0 精简参数 + 动态时长）
 *
 * Breaking：仅接受 L0 白名单字段；旧字段整表删除；时长由模板 slots 估算。
 */

const path = require('path');
const timelineDefaults = require('./kids-birthday-timeline.json');

const config = {
  id: 'kids-birthday-effect',
  name: '儿童生日祝福',
  compositionId: 'KidsBirthday',
  path: path.join(__dirname, '../../project'),
  description:
    '儿童生日祝福视频（动态时长）。最少只需 name；可选 photos / blessingSeries / preset / orientation。',
  paramMode: 'simplified',
};

/** L0 参数定义（对外唯一） */
const params = {
  name: {
    type: 'string',
    defaultValue: '小明',
    required: true,
    description: '主角名字（1-10字）',
    group: 'essential',
  },
  age: {
    type: 'number',
    defaultValue: 6,
    description: '年龄（1-18）',
    group: 'essential',
  },
  photos: {
    type: 'array',
    defaultValue: [],
    description: '照片列表（最多5张，{ src }）',
    group: 'essential',
  },
  blessingSeries: {
    type: 'string',
    defaultValue: null,
    description:
      '祝福系列：journey_to_the_west | zodiac | fairy_tale | custom（优先于 preset）',
    group: 'essential',
  },
  preset: {
    type: 'string',
    defaultValue: 'general',
    description:
      '风格预设：journey_to_the_west | zodiac | girl_unicorn | boy_rocket | animal | general',
    group: 'essential',
  },
  orientation: {
    type: 'string',
    defaultValue: 'portrait',
    description: 'portrait | landscape',
    group: 'essential',
  },
  message: {
    type: 'string',
    defaultValue: '愿你每天开心成长',
    description: '祝福语（最多100字）',
    group: 'personalization',
  },
  musicEnabled: {
    type: 'boolean',
    defaultValue: true,
    description: '是否启用背景音乐',
    group: 'personalization',
  },
  birthdaySongSource: {
    type: 'string',
    defaultValue: null,
    description: '生日歌路径（相对 public）',
    group: 'personalization',
  },
  customCharacterImages: {
    type: 'array',
    defaultValue: null,
    description: '自定义角色图片列表',
    group: 'advanced',
  },
  customCharacterVideos: {
    type: 'array',
    defaultValue: null,
    description: '自定义角色视频列表',
    group: 'advanced',
  },
  chapterOverrides: {
    type: 'array',
    defaultValue: null,
    description: '高级：按章节 id 深合并覆盖',
    group: 'advanced',
  },
  seed: {
    type: 'number',
    defaultValue: null,
    description: '随机种子',
    group: 'advanced',
  },
  fps: {
    type: 'number',
    defaultValue: timelineDefaults.fpsDefault,
    description: '帧率（高级）',
    group: 'advanced',
  },
};

const L0_KEYS = Object.keys(params);

const PRESETS = {
  journey_to_the_west: {
    name: '西游记系列',
    blessingSeries: 'journey_to_the_west',
    description: '孙悟空师徒五人为你庆祝生日',
  },
  zodiac: {
    name: '生肖守护神',
    blessingSeries: 'zodiac',
    description: '生肖守护神为你送上祝福',
  },
  girl_unicorn: {
    name: '女孩独角兽',
    blessingSeries: 'journey_to_the_west',
    description: '粉紫配色，适合小女孩',
  },
  boy_rocket: {
    name: '男孩火箭',
    blessingSeries: 'journey_to_the_west',
    description: '蓝绿配色，适合小男孩',
  },
  animal: {
    name: '可爱动物',
    blessingSeries: 'zodiac',
    description: '可爱动物主题',
  },
  general: {
    name: '通用派对',
    blessingSeries: 'journey_to_the_west',
    description: '通用派对风格',
  },
};

const VALID_SERIES = ['journey_to_the_west', 'zodiac', 'fairy_tale', 'custom'];
const VALID_PRESETS = Object.keys(PRESETS);

function pickL0(reqParams) {
  const out = {};
  for (const key of L0_KEYS) {
    if (reqParams[key] !== undefined && reqParams[key] !== null && reqParams[key] !== '') {
      out[key] = reqParams[key];
    }
  }
  return out;
}

function hasPhotos(photos) {
  return Array.isArray(photos) && photos.length > 0;
}

function estimateDuration(user) {
  const fps = user.fps && user.fps > 0 ? user.fps : timelineDefaults.fpsDefault;
  const withPhotos = hasPhotos(user.photos);
  const active = timelineDefaults.slots.filter((s) => !s.requiresPhotos || withPhotos);
  const durationSeconds = active.reduce((sum, s) => sum + s.seconds, 0);
  return {
    durationSeconds,
    durationInFrames: Math.round(durationSeconds * fps),
    fps,
    chapterIds: active.map((s) => s.id),
  };
}

function resolveSize(orientation) {
  if (orientation === 'landscape') {
    return { width: 1280, height: 720 };
  }
  return { width: 720, height: 1280 };
}

function validate(reqParams) {
  const p = pickL0(reqParams || {});
  if (!p.name || String(p.name).trim() === '') {
    return { valid: false, error: '请提供主角名字 (name)' };
  }
  if (String(p.name).length > 10) {
    return { valid: false, error: '名字长度不能超过10个字符' };
  }
  if (p.age !== undefined && p.age !== null && (p.age < 1 || p.age > 18)) {
    return { valid: false, error: '年龄必须在1-18岁之间' };
  }
  if (p.message && String(p.message).length > 100) {
    return { valid: false, error: '祝福语长度不能超过100个字符' };
  }
  if (p.blessingSeries && !VALID_SERIES.includes(p.blessingSeries)) {
    return { valid: false, error: `祝福系列无效，可选：${VALID_SERIES.join(', ')}` };
  }
  if (p.preset && !VALID_PRESETS.includes(p.preset)) {
    return { valid: false, error: `预设无效，可选：${VALID_PRESETS.join(', ')}` };
  }
  if (
    p.blessingSeries === 'custom' &&
    !p.customCharacterImages &&
    !p.customCharacterVideos
  ) {
    return {
      valid: false,
      error: 'custom 系列需要提供 customCharacterImages 或 customCharacterVideos',
    };
  }
  if (p.photos && p.photos.length > 5) {
    return { valid: false, error: '照片数量不能超过5张' };
  }
  if (p.orientation && !['portrait', 'landscape'].includes(p.orientation)) {
    return { valid: false, error: 'orientation 必须是 portrait 或 landscape' };
  }
  return { valid: true };
}

function buildRenderParams(reqParams, commonParams) {
  const user = pickL0(reqParams || {});

  // defaults
  if (user.name === undefined) user.name = params.name.defaultValue;
  if (user.photos === undefined) user.photos = [];
  if (user.preset === undefined) user.preset = params.preset.defaultValue;
  if (user.orientation === undefined) user.orientation = params.orientation.defaultValue;
  if (user.message === undefined) user.message = params.message.defaultValue;
  if (user.musicEnabled === undefined) user.musicEnabled = params.musicEnabled.defaultValue;
  if (user.fps === undefined) user.fps = timelineDefaults.fpsDefault;

  // preset 默认 series（用户显式 blessingSeries 优先，由 Remotion resolve 处理；
  // 这里仅在用户未传 series 时填入 preset 默认，便于 props 完整）
  if (!user.blessingSeries && user.preset && PRESETS[user.preset]) {
    user.blessingSeries = PRESETS[user.preset].blessingSeries;
  }
  if (!user.blessingSeries) {
    user.blessingSeries = 'journey_to_the_west';
  }

  const { durationSeconds, fps } = estimateDuration(user);
  const { width, height } = resolveSize(user.orientation);

  // 不向 Remotion 塞 common 的嵌套引擎参数（L0 不暴露）；保留 seed 等基础若在 common
  const result = {
    name: user.name,
    age: user.age,
    photos: user.photos,
    blessingSeries: user.blessingSeries,
    preset: user.preset,
    orientation: user.orientation,
    message: user.message,
    musicEnabled: user.musicEnabled,
    birthdaySongSource: user.birthdaySongSource,
    customCharacterImages: user.customCharacterImages,
    customCharacterVideos: user.customCharacterVideos,
    chapterOverrides: user.chapterOverrides,
    seed: user.seed,
    fps,
    width,
    height,
    duration: durationSeconds,
    _compositionId: config.compositionId,
  };

  // 去掉 undefined
  for (const key of Object.keys(result)) {
    if (result[key] === undefined || result[key] === null) {
      delete result[key];
    }
  }

  return result;
}

function getPresets() {
  return PRESETS;
}

function getBlessingSeriesOptions() {
  return {
    journey_to_the_west: {
      name: '西游记系列',
      description: '孙悟空师徒五人为你庆祝生日',
    },
    zodiac: {
      name: '生肖守护神系列',
      description: '12生肖守护神',
    },
    fairy_tale: {
      name: '童话系列',
      description: '经典童话角色',
    },
    custom: {
      name: '自定义系列',
      description: '使用自定义角色图片和视频',
    },
  };
}

function getParamMeta() {
  return {
    paramMode: 'simplified',
    required: ['name'],
    recommended: ['age', 'photos', 'blessingSeries', 'preset', 'orientation'],
    advanced: [
      'chapterOverrides',
      'seed',
      'customCharacterImages',
      'customCharacterVideos',
      'fps',
    ],
    fields: params,
    presets: getPresets(),
    blessingSeries: getBlessingSeriesOptions(),
    timeline: timelineDefaults,
  };
}

function getDuration(userLike) {
  return estimateDuration(userLike || { photos: [] }).durationSeconds;
}

module.exports = {
  config,
  params,
  validate,
  buildRenderParams,
  getPresets,
  getBlessingSeriesOptions,
  getParamMeta,
  getDuration,
  estimateDuration,
  L0_KEYS,
};
