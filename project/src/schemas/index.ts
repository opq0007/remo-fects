import { z } from 'zod';
import { CompleteCompositionSchema, CustomChapterInputSchema } from '../../../effects/shared/schemas';

// ==================== 枚举类型 Schema ====================

// 视频版本
export const VideoVersionSchema = z.enum(['60s', '90s', '120s']).meta({
  description: '视频时长版本：60秒/90秒/120秒'
});

// 角色系列
export const CharacterSeriesSchema = z.enum(['zodiac', 'pet', 'hero', 'image']).meta({
  description: '角色系列：生肖守护神/萌宠精灵/勇气超人/自定义图片'
});

// 生肖类型
export const ZodiacTypeSchema = z.enum([
  'rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake',
  'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'
]).meta({
  description: '生肖类型（12生肖）'
});

// 萌宠类型
export const PetTypeSchema = z.enum([
  'bunny', 'kitten', 'puppy', 'bear', 'fox', 'panda'
]).meta({
  description: '萌宠精灵类型'
});

// 勇气超人类型
export const HeroTypeSchema = z.enum([
  'superhero', 'astronaut', 'knight', 'wizard', 'pirate'
]).meta({
  description: '勇气超人类型'
});

// 儿童风格子类型
export const KidsSubStyleSchema = z.enum(['girl_unicorn', 'boy_rocket', 'animal', 'general']).meta({
  description: '儿童风格子类型'
});

// 屏幕方向
export const ScreenOrientationSchema = z.enum(['portrait', 'landscape']).meta({
  description: '屏幕方向：竖屏/横屏'
});

// 卡通元素类型
export const CartoonElementTypeSchema = z.enum(['star', 'balloon', 'cake', 'rocket', 'unicorn', 'heart', 'crown']).meta({
  description: '卡通元素类型'
});

// 梦想职业类型
export const DreamJobSchema = z.enum([
  'astronaut', 'artist', 'racer', 'doctor', 'teacher',
  'scientist', 'musician', 'athlete', 'chef', 'pilot'
]).meta({
  description: '梦想职业类型'
});

// ==================== 复合类型 Schema ====================

// 照片数据
export const PhotoDataSchema = z.object({
  id: z.string().optional(),
  src: z.string().meta({ description: '照片URL或路径' }),
});

// 卡通元素
export const CartoonElementSchema = z.object({
  type: CartoonElementTypeSchema,
  position: z.enum(['top', 'left', 'right', 'bottom', 'around']),
  count: z.number().min(1).max(20).default(5),
  color: z.string().default('#FFD93D')
});

// ==================== 主 Schema ====================

/**
 * 儿童生日祝福 Schema v2.0
 * 支持模块化分镜、角色系统、照片互动等新功能
 */
export const KidsBirthdaySchema = CompleteCompositionSchema.extend({
  // ========== 基本信息 ==========
  name: z.string().min(1).max(10).meta({ description: '主角名字' }),
  age: z.number().min(1).max(18).optional().meta({ description: '年龄' }),
  message: z.string().max(100).default('愿你每天开心成长').meta({ description: '祝福语' }),
  
  // ========== 视频版本 ==========
  videoVersion: VideoVersionSchema.default('120s').meta({ 
    description: '视频时长版本' 
  }),
  duration: z.number().min(5).max(180).default(120).meta({ 
    description: '视频时长(秒)，会根据videoVersion自动调整' 
  }),
  fps: z.number().default(24),
  width: z.number().default(720),
  height: z.number().default(1280),
  
  // ========== 风格 ==========
  subStyle: KidsSubStyleSchema.default('general'),
  
  // ========== 角色系统 ==========
  characterSeries: CharacterSeriesSchema.default('zodiac').meta({
    description: '角色系列'
  }),
  characterType: z.string().default('tiger').meta({
    description: '角色类型（根据series选择对应的生肖/萌宠/超人类型，image模式下可忽略）'
  }),
  characterImageSrc: z.string().optional().meta({
    description: '自定义角色图片路径（本地路径或网络URL），仅当 characterSeries="image" 时使用'
  }),
  
  // ========== 照片系统 ==========
  photos: z.array(PhotoDataSchema).max(5).default([]).meta({
    description: '照片列表（最多5张）'
  }),
  
  // ========== 梦想泡泡 ==========
  dreams: z.array(DreamJobSchema).max(5).default(['astronaut', 'artist', 'racer']).meta({
    description: '梦想职业列表（最多5个）'
  }),
  
  // ========== 布局 ==========
  orientation: ScreenOrientationSchema.default('portrait').meta({
    description: '屏幕方向'
  }),
  
  // ========== 名字样式 ==========
  nameFontSize: z.number().min(60).max(200).default(120),
  nameColor: z.string().optional(),
  showAge: z.boolean().default(true),
  
  // ========== 祝福语样式 ==========
  blessingText: z.string().default('生日快乐'),
  blessingFontSize: z.number().min(30).max(100).default(60),
  
  // ========== 卡通元素 ==========
  cartoonElements: z.array(CartoonElementSchema).optional(),
  
  // ========== 粒子效果 ==========
  confettiLevel: z.enum(['low', 'medium', 'high']).default('high'),
  
  // ========== 动画速度 ==========
  animationSpeed: z.enum(['slow', 'normal', 'fast']).default('normal'),
  
  // ========== 音频 ==========
  musicEnabled: z.boolean().default(true).meta({ description: '是否启用背景音乐' }),
  musicTrack: z.string().default('kids_party_01').meta({ description: '音乐轨道' }),
  
  // ========== 生日歌音频（独立控制） ==========
  birthdaySongSource: z.string().optional().meta({ 
    description: '生日歌音频文件路径（相对于 public 目录），有值时才在模块G播放生日歌' 
  }),
  birthdaySongVolume: z.number().min(0).max(1).default(0.6).meta({ 
    description: '生日歌音量 (0-1)' 
  }),
  
  // ========== 随机种子 ==========
  seed: z.number().optional(),
  
  // ========== 自定义章节列表 ==========
  chapterList: z.array(CustomChapterInputSchema).optional().meta({
    description: '自定义章节配置列表。如果提供，将与默认模块配置按 id 合并，实现部分覆盖。'
  }),
});

export type KidsBirthdayProps = z.infer<typeof KidsBirthdaySchema>;

// ==================== 模块配置 Schema ====================

// 单个模块配置
export const ModuleConfigSchema = z.object({
  id: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']),
  enabled: z.boolean().default(true),
  customDuration: z.number().optional().meta({ description: '自定义时长（帧）' }),
});

// 模块配置列表
export const ModuleConfigsSchema = z.array(ModuleConfigSchema);

// ==================== 导出组合 Schema ====================

export const BirthdayBlessingSchema = z.discriminatedUnion('audience', [
  KidsBirthdaySchema.extend({ audience: z.literal('kids') })
]);

export type BirthdayBlessingProps = z.infer<typeof BirthdayBlessingSchema>;

// ==================== 辅助函数 ====================

/**
 * 根据视频版本获取模块列表
 */
export const getModulesByVersion = (version: '60s' | '90s' | '120s'): string[] => {
  switch (version) {
    case '60s':
      return ['A', 'B', 'C', 'G'];
    case '90s':
      return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    case '120s':
      return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    default:
      return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  }
};

/**
 * 根据视频版本获取总时长（秒）
 * 注意：倒计时章节占用 4 秒（3秒倒计时 + 1秒最终文字）
 */
export const getDurationByVersion = (version: '60s' | '90s' | '120s'): number => {
  const countdownDuration = 4; // 倒计时章节时长
  switch (version) {
    case '60s': return 60 + countdownDuration;
    case '90s': return 90 + countdownDuration;
    case '120s': return 120 + countdownDuration;
    default: return 120 + countdownDuration;
  }
};

/**
 * 根据角色系列获取可选的角色类型
 */
export const getCharacterTypes = (series: 'zodiac' | 'pet' | 'hero' | 'image'): string[] => {
  switch (series) {
    case 'zodiac':
      return ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'];
    case 'pet':
      return ['bunny', 'kitten', 'puppy', 'bear', 'fox', 'panda'];
    case 'hero':
      return ['superhero', 'astronaut', 'knight', 'wizard', 'pirate'];
    case 'image':
      return []; // image 模式不需要类型，使用 characterImageSrc 指定图片
    default:
      return ['tiger'];
  }
};