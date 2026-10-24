import { z } from 'zod';
import { CompleteCompositionSchema, CustomChapterInputSchema } from '../../../effects/shared/schemas';

// ==================== 枚举类型 Schema ====================

// 祝福系列
export const BlessingSeriesSchema = z.enum(['journey_to_the_west', 'zodiac', 'fairy_tale', 'custom']).meta({
  description: '祝福系列：西游记/生肖守护神/童话/自定义'
});

// 生肖类型（用于类型定义，Schema 中已移除相关参数）
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
 * 儿童生日祝福 Schema v2.1
 * 支持模块化分镜、角色系统、照片互动、祝福系列等新功能
 * 支持"简化参数"模式：只传核心参数，其余使用默认配置
 */
export const KidsBirthdaySchema = CompleteCompositionSchema.extend({
  // ========== 核心参数（简化模式必填） ==========
  name: z.string().min(1).max(10).meta({ description: '主角名字' }),
  age: z.number().min(1).max(18).optional().meta({ description: '年龄' }),
  photos: z.array(PhotoDataSchema).max(5).default([]).meta({
    description: '照片列表（最多5张）。视频时长随照片数量自动伸缩：无照片74s / 1张99s / 2张及以上124s'
  }),
  orientation: ScreenOrientationSchema.default('portrait').meta({
    description: '屏幕方向'
  }),
  
  // ========== 祝福系列（新增，简化模式核心参数） ==========
  blessingSeries: BlessingSeriesSchema.default('journey_to_the_west').meta({
    description: '祝福系列（如西游记系列），决定使用的角色和视频资源'
  }),
  
  // ========== 自定义角色资源（可选，覆盖系列默认） ==========
  customCharacterImages: z.array(z.string()).optional().meta({
    description: '自定义角色图片路径列表，覆盖祝福系列的默认角色图片'
  }),
  customCharacterVideos: z.array(z.string()).optional().meta({
    description: '自定义角色视频路径列表，覆盖祝福系列的默认角色视频'
  }),
  
  // ========== 基本信息 ==========
  message: z.string().max(100).default('愿你每天开心成长').meta({ description: '祝福语（显示在片尾收尾模块）' }),
  
  // ========== 视频配置 ==========
  // duration 是期望输出时长；实际内容时长由照片数量决定（无照片74s/1张99s/2张及以上124s），
  // 渲染端按 min(duration, 内容时长) 截断：传短了输出短片，传大了输出完整视频
  duration: z.number().min(10).max(124).default(124).meta({
    description: '期望输出时长(秒)，上限124。实际按照片数量伸缩后截断'
  }),
  fps: z.number().default(24),
  width: z.number().default(720),
  height: z.number().default(1280),
  
  // ========== 风格（颜色主题） ==========
  subStyle: KidsSubStyleSchema.default('general').meta({
    description: '风格子类型：girl_unicorn（粉紫）/ boy_rocket（蓝绿）/ animal（绿黄）/ general（黄蓝）'
  }),
  
  // ========== 梦想泡泡 ==========
  dreams: z.array(DreamJobSchema).max(5).default(['astronaut', 'artist', 'racer']).meta({
    description: '梦想职业列表（最多5个）'
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

// ==================== 常量与辅助函数 ====================

/**
 * public 目录实际存在的资源清单
 * 角色图片/视频若不在此清单中，渲染时自动回退到内置卡通形象，
 * 避免默认配置产生 broken image。往 public 添加文件后同步更新此清单。
 */
export const AVAILABLE_PUBLIC_ASSETS = new Set<string>([
  '孙悟空.mp4',
  '熊猫.png',
  'birthday_audio.mp3',
  'countDown_clock.mp3',
  'countDown_common.mp3',
  'countDown_game.mp3',
  'JoyfulChildren.mp3',
]);

/**
 * 模块时长规划（帧）
 * 按照片数量计算实际内容时长，供 composition 与 calculateMetadata 使用
 * - 倒计时 4s + 开场 A 2s + 庆祝 F 10s + 生日歌 G 35s + 未来祝福 H 10s + 梦想 I 10s + 收尾 J 3s = 74s
 * - 照片互动 C（1张照片起）+25s → 99s
 * - 照片互动 D（2张照片起）+25s → 124s
 */
export const computeContentPlan = (photoCount: number, fps: number) => {
  const photo1 = photoCount >= 1 ? 25 * fps : 0;
  const photo2 = photoCount >= 2 ? 25 * fps : 0;
  return {
    countdown: 4 * fps,
    opening: 2 * fps,
    photo1,
    photo2,
    celebration: 10 * fps,
    birthdaySong: 35 * fps,
    futureBlessing: 10 * fps,
    dreams: 10 * fps,
    closing: 3 * fps,
    totalFrames: (74 + photo1 / fps + photo2 / fps) * fps,
  };
};

/**
 * 根据照片数量计算实际内容总时长（秒）
 */
export const computeContentDuration = (photoCount: number): number => {
  return 74 + (photoCount >= 1 ? 25 : 0) + (photoCount >= 2 ? 25 : 0);
};

/**
 * 获取 120s 版本的模块列表（固定）
 */
export const getModules = (): string[] => {
  return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
};

/**
 * 获取视频总时长（固定 124 秒：4秒倒计时 + 120秒正片）
 */
export const getDuration = (): number => {
  return 124;
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

/**
 * 卡通回退形象：角色图片缺失时用内置卡通角色顶替（与祝福角色气质对位）
 */
interface CartoonFallback {
  series: 'zodiac' | 'pet' | 'hero';
  type: string;
}

/**
 * 获取祝福系列配置
 * imageSrc 均相对于 public 目录；缺失的资源在渲染时自动回退到 cartoonFallback
 */
export const getBlessingSeriesConfig = (series: 'journey_to_the_west' | 'zodiac' | 'fairy_tale' | 'custom') => {
  const configs: Record<string, {
    name: string;
    characters: {
      type: string;
      imageSrc?: string;
      videoSrc?: string;
      name: string;
      greeting: string;
      cartoonFallback?: CartoonFallback;
    }[];
  }> = {
    journey_to_the_west: {
      name: '西游记系列',
      characters: [
        { type: 'sun_wukong', imageSrc: 'pic/孙悟空.png', videoSrc: '孙悟空.mp4', name: '孙悟空', greeting: '俺老孙来也！祝你生日快乐！', cartoonFallback: { series: 'zodiac', type: 'monkey' } },
        { type: 'tang_seng', imageSrc: 'pic/唐僧.png', videoSrc: '唐僧.mp4', name: '唐僧', greeting: '阿弥陀佛，祝你健康成长！', cartoonFallback: { series: 'hero', type: 'wizard' } },
        { type: 'zhu_bajie', imageSrc: 'pic/猪八戒.png', videoSrc: '猪八戒.mp4', name: '猪八戒', greeting: '嘿嘿，生日快乐！', cartoonFallback: { series: 'zodiac', type: 'pig' } },
        { type: 'sha_wujing', imageSrc: 'pic/沙和尚.png', videoSrc: '沙和尚.mp4', name: '沙和尚', greeting: '祝你天天开心！', cartoonFallback: { series: 'hero', type: 'knight' } },
        { type: 'white_dragon_horse', imageSrc: 'pic/白龙马.png', videoSrc: '白龙马.mp4', name: '白龙马', greeting: '祝你一马当先！', cartoonFallback: { series: 'zodiac', type: 'horse' } },
      ],
    },
    zodiac: {
      name: '生肖守护神系列',
      characters: [
        { type: 'tiger', imageSrc: 'pic/小老虎.png', name: '小老虎', greeting: '嗷呜～祝你生日快乐！', cartoonFallback: { series: 'zodiac', type: 'tiger' } },
        { type: 'rabbit', imageSrc: 'pic/小兔子.png', name: '小兔子', greeting: '蹦蹦跳～祝你快乐成长！', cartoonFallback: { series: 'zodiac', type: 'rabbit' } },
        { type: 'dragon', imageSrc: 'pic/小龙龙.png', name: '小龙龙', greeting: '吼～祝你心想事成！', cartoonFallback: { series: 'zodiac', type: 'dragon' } },
      ],
    },
    fairy_tale: {
      name: '童话系列',
      characters: [
        { type: 'mickey', imageSrc: 'pic/米奇.png', name: '米奇', greeting: '祝你生日快乐！', cartoonFallback: { series: 'zodiac', type: 'rat' } },
      ],
    },
    custom: {
      name: '自定义系列',
      characters: [],
    },
  };
  return configs[series] || configs.journey_to_the_west;
};