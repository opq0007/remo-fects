import { z } from 'zod';
import { 
  BackgroundSchema, 
  NestedBackgroundSchema,
  type NestedBackgroundProps 
} from './background';
import { 
  OverlaySchema, 
  NestedOverlaySchema,
  type NestedOverlayProps 
} from './overlay';
import { 
  AudioSchema, 
  NestedAudioSchema,
  type NestedAudioProps 
} from './audio';
import { RadialBurstSchema } from './radial-burst';

// ==================== 字幕 Schema ====================

/**
 * 字幕位置类型
 */
export const SubtitlePositionSchema = z.enum(['bottom', 'top', 'center']);
export type SubtitlePosition = z.infer<typeof SubtitlePositionSchema>;

/**
 * 字幕动画类型
 */
export const SubtitleAnimationTypeSchema = z.enum(['fade', 'slideUp', 'typewriter', 'bounce', 'none']);
export type SubtitleAnimationType = z.infer<typeof SubtitleAnimationTypeSchema>;

/**
 * 字幕项 Schema
 */
export const SubtitleItemSchema = z.object({
  /** 字幕文本 */
  text: z.string(),
  /** 开始帧 */
  startFrame: z.number().min(0),
  /** 持续帧数 */
  durationInFrames: z.number().min(1),
  /** 字幕位置 */
  position: SubtitlePositionSchema.optional(),
  /** 字体大小 */
  fontSize: z.number().min(8).max(200).optional(),
  /** 文字颜色 */
  color: z.string().optional(),
  /** 背景色 */
  backgroundColor: z.string().optional(),
  /** 背景透明度 */
  backgroundOpacity: z.number().min(0).max(1).optional(),
  /** 对齐方式 */
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  /** 动画类型 */
  animationType: SubtitleAnimationTypeSchema.optional(),
  /** 是否显示背景框 */
  showBackground: z.boolean().optional(),
});
export type SubtitleItemProps = z.infer<typeof SubtitleItemSchema>;

/**
 * 字幕列表 Schema
 */
export const SubtitleListSchema = z.array(SubtitleItemSchema);

// ==================== 角色配置 Schema ====================

/**
 * 角色系列 Schema
 */
export const CharacterSeriesSchema = z.enum(['zodiac', 'pet', 'hero', 'image']);
export type CharacterSeriesType = z.infer<typeof CharacterSeriesSchema>;

/**
 * 生肖类型 Schema
 */
export const ZodiacTypeSchema = z.enum([
  'rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake',
  'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'
]);
export type ZodiacTypeSchemaType = z.infer<typeof ZodiacTypeSchema>;

/**
 * 萌宠类型 Schema
 */
export const PetTypeSchema = z.enum(['bunny', 'kitten', 'puppy', 'bear', 'fox', 'panda']);
export type PetTypeSchemaType = z.infer<typeof PetTypeSchema>;

/**
 * 勇气超人类型 Schema
 */
export const HeroTypeSchema = z.enum(['superhero', 'astronaut', 'knight', 'wizard', 'pirate']);
export type HeroTypeSchemaType = z.infer<typeof HeroTypeSchema>;

/**
 * 角色表情 Schema
 */
export const CharacterExpressionSchema = z.enum(['happy', 'excited', 'waving', 'hugging']);
export type CharacterExpressionType = z.infer<typeof CharacterExpressionSchema>;

/**
 * 角色位置 Schema
 */
export const CharacterPositionSchema = z.enum(['center', 'left', 'right']);
export type CharacterPositionType = z.infer<typeof CharacterPositionSchema>;

/**
 * 故事角色配置 Schema
 */
export const StoryCharacterConfigSchema = z.object({
  /** 角色系列 */
  series: CharacterSeriesSchema,
  /** 角色类型（image 模式下可忽略） */
  type: z.string().optional(), // 简化类型，实际使用时验证
  /** 位置 */
  position: CharacterPositionSchema.optional(),
  /** 表情（image 模式下可忽略） */
  expression: CharacterExpressionSchema.optional(),
  /** 大小 */
  size: z.number().min(50).max(500).optional(),
  /** 是否动画 */
  animate: z.boolean().optional(),
  /** 对话内容 */
  speech: z.string().optional(),
  /** 是否显示对话 */
  showSpeech: z.boolean().optional(),
  /** 是否内联布局 */
  inline: z.boolean().optional(),
  /** 图片资源路径（本地路径或网络URL），仅当 series='image' 时使用 */
  imageSrc: z.string().optional(),
});
export type StoryCharacterConfigProps = z.infer<typeof StoryCharacterConfigSchema>;

// ==================== 彩带效果 Schema ====================

/**
 * 彩带密度 Schema
 */
export const ConfettiLevelSchema = z.enum(['low', 'medium', 'high']);
export type ConfettiLevelType = z.infer<typeof ConfettiLevelSchema>;

/**
 * 彩带效果配置 Schema
 */
export const StoryConfettiConfigSchema = z.object({
  /** 是否启用 */
  enabled: z.boolean(),
  /** 密度级别 */
  level: ConfettiLevelSchema.optional(),
  /** 主颜色 */
  primaryColor: z.string().optional(),
  /** 次颜色 */
  secondaryColor: z.string().optional(),
  /** 触发帧 */
  triggerFrame: z.number().optional(),
});
export type StoryConfettiConfigProps = z.infer<typeof StoryConfettiConfigSchema>;

// ==================== 魔法效果 Schema ====================

/**
 * 魔法粒子配置 Schema
 */
export const StoryMagicParticlesConfigSchema = z.object({
  enabled: z.boolean(),
  particleCount: z.number().min(10).max(200).optional(),
  color: z.string().optional(),
  targetX: z.number().min(0).max(1).optional(),
  targetY: z.number().min(0).max(1).optional(),
  durationInFrames: z.number().min(10).optional(),
});
export type StoryMagicParticlesConfigProps = z.infer<typeof StoryMagicParticlesConfigSchema>;

/**
 * 魔法棒配置 Schema
 */
export const StoryMagicWandConfigSchema = z.object({
  enabled: z.boolean(),
  x: z.number().min(0).max(1).optional(),
  y: z.number().min(0).max(1).optional(),
  rotation: z.number().optional(),
  casting: z.boolean().optional(),
  color: z.string().optional(),
});
export type StoryMagicWandConfigProps = z.infer<typeof StoryMagicWandConfigSchema>;

/**
 * 魔法圆环配置 Schema
 */
export const StoryMagicCircleConfigSchema = z.object({
  enabled: z.boolean(),
  radius: z.number().min(50).max(500).optional(),
  color: z.string().optional(),
  rotationSpeed: z.number().optional(),
  pulseIntensity: z.number().min(0).max(1).optional(),
});
export type StoryMagicCircleConfigProps = z.infer<typeof StoryMagicCircleConfigSchema>;

/**
 * 烟花配置 Schema
 */
export const StoryFireworkConfigSchema = z.object({
  enabled: z.boolean(),
  x: z.number().min(0).max(1).optional(),
  y: z.number().min(0).max(1).optional(),
  particleCount: z.number().min(10).max(100).optional(),
  color: z.string().optional(),
  triggerFrame: z.number().optional(),
});
export type StoryFireworkConfigProps = z.infer<typeof StoryFireworkConfigSchema>;

/**
 * 气球爆炸配置 Schema
 */
export const StoryBalloonBurstConfigSchema = z.object({
  enabled: z.boolean(),
  x: z.number().min(0).max(1).optional(),
  y: z.number().min(0).max(1).optional(),
  balloonCount: z.number().min(3).max(20).optional(),
  colors: z.array(z.string()).optional(),
  triggerFrame: z.number().optional(),
});
export type StoryBalloonBurstConfigProps = z.infer<typeof StoryBalloonBurstConfigSchema>;

/**
 * 白闪转场配置 Schema
 */
export const StoryWhiteFlashConfigSchema = z.object({
  enabled: z.boolean(),
  durationInFrames: z.number().min(5).max(30).optional(),
  triggerFrame: z.number().min(0).optional(),
});
export type StoryWhiteFlashConfigProps = z.infer<typeof StoryWhiteFlashConfigSchema>;

/**
 * 流星配置 Schema
 */
export const StoryShootingStarConfigSchema = z.object({
  enabled: z.boolean(),
  startX: z.number().min(0).max(1).optional(),
  startY: z.number().min(0).max(1).optional(),
  endX: z.number().min(0).max(1).optional(),
  endY: z.number().min(0).max(1).optional(),
  durationInFrames: z.number().min(10).optional(),
  color: z.string().optional(),
  trailLength: z.number().min(20).max(200).optional(),
});
export type StoryShootingStarConfigProps = z.infer<typeof StoryShootingStarConfigSchema>;

/**
 * 黑屏过渡配置 Schema
 */
export const BlackScreenTransitionSchema = z.object({
  /** 是否启用 */
  enabled: z.boolean(),
  /** 持续帧数 */
  durationInFrames: z.number().min(10).max(60).optional(),
  /** 开始帧（默认为0） */
  startFrame: z.number().min(0).optional(),
});
export type BlackScreenTransitionProps = z.infer<typeof BlackScreenTransitionSchema>;

/**
 * 魔法效果集合 Schema
 */
export const StoryMagicEffectsConfigSchema = z.object({
  particles: StoryMagicParticlesConfigSchema.optional(),
  magicWand: StoryMagicWandConfigSchema.optional(),
  magicCircle: StoryMagicCircleConfigSchema.optional(),
  firework: StoryFireworkConfigSchema.optional(),
  balloonBurst: StoryBalloonBurstConfigSchema.optional(),
  whiteFlash: StoryWhiteFlashConfigSchema.optional(),
  shootingStar: StoryShootingStarConfigSchema.optional(),
  /** 黑屏过渡效果 */
  blackScreen: BlackScreenTransitionSchema.optional(),
});
export type StoryMagicEffectsConfigProps = z.infer<typeof StoryMagicEffectsConfigSchema>;

// ==================== 文字元素 Schema ====================

/**
 * 文字元素类型
 */
export const TextElementTypeSchema = z.enum(['name', 'blessing', 'age', 'custom']);
export type TextElementType = z.infer<typeof TextElementTypeSchema>;

/**
 * 文字动画类型
 */
export const TextAnimationTypeSchema = z.enum(['bounce', 'glow', 'float', 'fade', 'typewriter', 'none']);
export type TextAnimationType = z.infer<typeof TextAnimationTypeSchema>;

/**
 * 文字元素配置 Schema
 */
export const TextElementSchema = z.object({
  /** 文字类型 */
  type: TextElementTypeSchema,
  /** 自定义文字内容（type为custom时使用） */
  text: z.string().optional(),
  /** 字体大小 */
  fontSize: z.number().min(12).max(300).optional(),
  /** 颜色 */
  color: z.string().optional(),
  /** 垂直位置（0-1，相对于高度） */
  verticalPosition: z.number().min(0).max(1).optional(),
  /** 水平位置（0-1，相对于宽度） */
  horizontalPosition: z.number().min(0).max(1).optional(),
  /** 开始帧 */
  startFrame: z.number().min(0).optional(),
  /** 动画类型 */
  animationType: TextAnimationTypeSchema.optional(),
  /** 是否显示年龄 */
  showAge: z.boolean().optional(),
  /** 是否显示阴影 */
  showShadow: z.boolean().optional(),
  /** 文字对齐 */
  textAlign: z.enum(['left', 'center', 'right']).optional(),
});
export type TextElementProps = z.infer<typeof TextElementSchema>;

// ==================== 照片展示 Schema ====================

/**
 * 照片动画类型
 */
export const PhotoAnimationTypeSchema = z.enum(['flyIn', 'rotateIn', 'fadeIn', 'scaleIn', 'magicCircle']);
export type PhotoAnimationType = z.infer<typeof PhotoAnimationTypeSchema>;

/**
 * 照片外框类型 Schema
 */
export const PhotoFrameTypeSchema = z.enum(['none', 'simple', 'glow', 'magic', 'neon', 'golden', 'polaroid']);
export type PhotoFrameType = z.infer<typeof PhotoFrameTypeSchema>;

/**
 * 照片展示配置 Schema
 */
export const PhotoDisplaySchema = z.object({
  /** 是否启用 */
  enabled: z.boolean(),
  /** 照片数据 */
  photo: z.object({
    src: z.string(),
  }),
  /** 动画类型 */
  animationType: PhotoAnimationTypeSchema.optional(),
  /** 外框类型，默认 none 无外框 */
  frameType: PhotoFrameTypeSchema.optional(),
  /** 外框主色调 */
  frameColor: z.string().optional(),
  /** 开始帧 */
  startFrame: z.number().min(0).optional(),
  /** 持续帧数（0表示显示到章节结束） */
  durationInFrames: z.number().min(0).optional(),
});
export type PhotoDisplayProps = z.infer<typeof PhotoDisplaySchema>;

// ==================== 漂浮元素 Schema ====================

/**
 * 漂浮元素类型
 */
export const FloatingElementTypeSchema = z.enum(['hearts', 'stars', 'confetti', 'bubbles', 'sparkles']);
export type FloatingElementType = z.infer<typeof FloatingElementTypeSchema>;

/**
 * 漂浮元素配置 Schema
 */
export const FloatingElementsSchema = z.object({
  /** 是否启用 */
  enabled: z.boolean(),
  /** 元素类型 */
  type: FloatingElementTypeSchema,
  /** 数量 */
  count: z.number().min(5).max(50).optional(),
  /** 开始帧 */
  startFrame: z.number().min(0).optional(),
  /** 颜色 */
  color: z.string().optional(),
});
export type FloatingElementsProps = z.infer<typeof FloatingElementsSchema>;

// ==================== 星空背景 Schema ====================

/**
 * 星空背景配置 Schema
 */
export const StarFieldBackgroundSchema = z.object({
  /** 是否启用 */
  enabled: z.boolean(),
  /** 星星数量 */
  starCount: z.number().min(50).max(500).optional(),
  /** 星星颜色 */
  starColor: z.string().optional(),
  /** 星星大小范围 */
  starSizeRange: z.tuple([z.number(), z.number()]).optional(),
});
export type StarFieldBackgroundProps = z.infer<typeof StarFieldBackgroundSchema>;

// ==================== 透明视频 Schema ====================

/**
 * 透明模式类型 Schema
 */
export const TransparencyModeSchema = z.enum(['greenScreen', 'blueScreen', 'chromaKey', 'webmAlpha']);
export type TransparencyModeType = z.infer<typeof TransparencyModeSchema>;

/**
 * 色度键配置 Schema
 */
export const ChromaKeyConfigSchema = z.object({
  /** 目标颜色 */
  keyColor: z.string().optional(),
  /** 容差范围 */
  tolerance: z.number().min(0).max(255).optional(),
  /** 边缘柔和度 */
  softness: z.number().min(0).max(1).optional(),
});
export type ChromaKeyConfigProps = z.infer<typeof ChromaKeyConfigSchema>;

/**
 * 透明视频项 Schema
 */
export const TransparentVideoItemSchema = z.object({
  /** 视频源 */
  src: z.string(),
  /** 透明模式 */
  mode: TransparencyModeSchema.optional(),
  /** 色度键配置 */
  chromaKey: ChromaKeyConfigSchema.optional(),
  /** 视频透明度 */
  opacity: z.number().min(0).max(1).optional(),
  /** 缩放比例 */
  scale: z.number().min(0.1).max(2).optional(),
  /** 水平位置 */
  x: z.number().min(0).max(1).optional(),
  /** 垂直位置 */
  y: z.number().min(0).max(1).optional(),
  /** 播放速率 */
  playbackRate: z.number().min(0.1).max(4).optional(),
  /** 是否循环播放 */
  loop: z.boolean().optional(),
  /** 是否静音 */
  muted: z.boolean().optional(),
  /** 音频音量 */
  volume: z.number().min(0).max(1).optional(),
  /** 开始帧 */
  startFrame: z.number().min(0).optional(),
  /** 持续帧数 */
  durationInFrames: z.number().min(0).optional(),
  /** 水平翻转 */
  flipX: z.boolean().optional(),
  /** 垂直翻转 */
  flipY: z.boolean().optional(),
  /** 旋转角度 */
  rotation: z.number().optional(),
  /** z-index 层级 */
  zIndex: z.number().optional(),
});
export type TransparentVideoItemProps = z.infer<typeof TransparentVideoItemSchema>;

// ==================== PlusEffects 特效扩展 Schema ====================

/**
 * 支持的特效类型枚举
 * 对应 effects/ 目录下各特效项目的核心组件
 */
export const EffectTypeSchema = z.enum([
  // 文字矢量动画
  'textVector',
  // 大风车
  'windmill',
  // 太极八卦
  'taiChiBagua',
  // 文字雨
  'textRain',
  // 文字环绕
  'textRing',
  // 文字烟花
  'textFirework',
  // 文字破屏
  'textBreakthrough',
  // 文字龙卷风
  'textTornado',
  // 文字洪水
  'textFlood',
  // 文字旋涡
  'textVortex',
  // 文字万花筒
  'textKaleidoscope',
  // 文字水晶球
  'textCrystalBall',
]);
export type EffectType = z.infer<typeof EffectTypeSchema>;

/**
 * PlusEffectItem Schema
 * 
 * 基于 MixedInputSchema 扩展，添加 effectType 字段
 * 用于在 StoryChapter 中渲染额外的特效组件
 */
export const PlusEffectItemSchema = z.object({
  /** 特效类型，决定渲染哪个特效组件 */
  effectType: EffectTypeSchema,
  
  // ===== 继承自 MixedInputSchema 的字段 =====
  /** 内容类型 */
  contentType: z.enum(["text", "image", "blessing", "mixed"]).optional().default("text"),
  /** 文字列表 */
  words: z.array(z.string()).optional().default([]),
  /** 图片路径列表 */
  images: z.array(z.string()).optional().default([]),
  /** 祝福图案类型列表 */
  blessingTypes: z.array(z.enum(["goldCoin", "moneyBag", "luckyBag", "redPacket", "star", "heart", "balloon"])).optional().default([]),
  /** 图片出现权重 */
  imageWeight: z.number().min(0).max(1).optional().default(0.5),
  
  // ===== 特效特定参数 =====
  /** 核心文字/文本内容 */
  text: z.string().optional(),
  /** 字体大小 */
  fontSize: z.number().min(12).max(500).optional(),
  /** 颜色列表 */
  colors: z.array(z.string()).optional(),
  /** 主颜色 */
  primaryColor: z.string().optional(),
  /** 次颜色 */
  secondaryColor: z.string().optional(),
  /** 发光颜色 */
  glowColor: z.string().optional(),
  /** 发光强度 */
  glowIntensity: z.number().min(0).max(2).optional(),
  
  // ===== 动画配置 =====
  /** 动画速度 */
  animationSpeed: z.number().min(0.1).max(5).optional(),
  /** 入场动画时长（帧） */
  entranceDuration: z.number().min(5).max(120).optional(),
  /** 停留动画类型 */
  stayAnimation: z.enum(['pulse', 'glow', 'float', 'none']).optional(),
  
  // ===== 3D效果 =====
  /** 是否启用3D效果 */
  enable3D: z.boolean().optional(),
  /** 3D旋转角度 */
  rotation3D: z.number().optional(),
  /** 透视角度 */
  perspective: z.number().optional(),
  
  // ===== 布局配置 =====
  /** 水平位置（0-1） */
  x: z.number().min(0).max(1).optional(),
  /** 垂直位置（0-1） */
  y: z.number().min(0).max(1).optional(),
  /** 缩放比例 */
  scale: z.number().min(0.1).max(3).optional(),
  /** 透明度 */
  opacity: z.number().min(0).max(1).optional(),
  
  // ===== 额外配置（用于特定特效） =====
  /** 旋转速度（圈/秒） */
  rotationSpeed: z.number().min(0.1).max(5).optional(),
  /** 元素数量 */
  elementCount: z.number().min(1).max(500).optional(),
  /** 随机种子 */
  seed: z.number().optional(),
  
  // ===== 自定义样式 =====
  /** 祝福图案样式 */
  blessingStyle: z.object({
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    enable3D: z.boolean().optional(),
    enableGlow: z.boolean().optional(),
    glowIntensity: z.number().min(0).max(3).optional(),
  }).optional(),
});
export type PlusEffectItemProps = z.infer<typeof PlusEffectItemSchema>;

/**
 * PlusEffects 配置 Schema（数组）
 */
export const PlusEffectsSchema = z.array(PlusEffectItemSchema);
export type PlusEffectsProps = z.infer<typeof PlusEffectsSchema>;

// ==================== 倒计时 Schema ====================

/**
 * 倒计时类型 Schema
 */
export const CountdownTypeSchema = z.enum(['number', 'time']);
export type CountdownType = z.infer<typeof CountdownTypeSchema>;

/**
 * 倒计时特效类型 Schema
 */
export const CountdownEffectTypeSchema = z.enum([
  'scale', 'rotate', 'bounce', 'shake', 'glow',
  'flip3d', 'zoomIn', 'spiral', 'heartbeat', 'pulse'
]);
export type CountdownEffectType = z.infer<typeof CountdownEffectTypeSchema>;

/**
 * 倒计时文字样式 Schema
 */
export const CountdownTextStyleSchema = z.object({
  fontSize: z.number().min(20).max(500).optional(),
  fontWeight: z.union([z.number(), z.string()]).optional(),
  color: z.string().optional(),
  strokeColor: z.string().optional(),
  strokeWidth: z.number().min(0).max(20).optional(),
  glowColor: z.string().optional(),
  glowIntensity: z.number().min(0).max(3).optional(),
  depth3D: z.number().min(0).max(20).optional(),
  fontFamily: z.string().optional(),
  textShadow: z.string().optional(),
});
export type CountdownTextStyleProps = z.infer<typeof CountdownTextStyleSchema>;

/**
 * 倒计时音效配置 Schema
 */
export const CountdownAudioConfigSchema = z.object({
  enabled: z.boolean().optional(),
  tickSound: z.string().optional(),
  endSound: z.string().optional(),
  volume: z.number().min(0).max(1).optional(),
});
export type CountdownAudioConfigProps = z.infer<typeof CountdownAudioConfigSchema>;

/**
 * 倒计时最终文字特效 Schema
 */
export const CountdownFinalTextSchema = z.object({
  enabled: z.boolean().optional(),
  text: z.string().optional(),
  scaleMultiplier: z.number().min(1).max(3).optional(),
  extraGlow: z.boolean().optional(),
  colorChange: z.string().optional(),
  durationInFrames: z.number().min(10).optional(),
});
export type CountdownFinalTextProps = z.infer<typeof CountdownFinalTextSchema>;

/**
 * 故事章节倒计时配置 Schema
 * 用于在 StoryChapter 中集成倒计时
 */
export const StoryCountdownConfigSchema = z.object({
  /** 是否启用倒计时 */
  enabled: z.boolean(),
  /** 倒计时类型 */
  type: CountdownTypeSchema.optional(),
  /** 起始数字 */
  startNumber: z.number().min(1).max(60).optional(),
  /** 总秒数 */
  totalSeconds: z.number().min(1).max(3600).optional(),
  /** 每个数字持续帧数 */
  durationPerNumber: z.number().min(1).optional(),
  /** 特效类型 */
  effectType: CountdownEffectTypeSchema.optional(),
  /** 特效强度 */
  effectIntensity: z.number().min(0.1).max(2).optional(),
  /** 文字样式 */
  textStyle: CountdownTextStyleSchema.optional(),
  /** 音效配置 */
  audio: CountdownAudioConfigSchema.optional(),
  /** 最终文字 */
  finalText: CountdownFinalTextSchema.optional(),
  /** 水平位置 */
  x: z.number().min(0).max(1).optional(),
  /** 垂直位置 */
  y: z.number().min(0).max(1).optional(),
});
export type StoryCountdownConfigProps = z.infer<typeof StoryCountdownConfigSchema>;

// ==================== 故事章节 Schema ====================

/**
 * 故事章节 Schema（嵌套参数结构）
 */
export const StoryChapterSchema = z.object({
  /** 章节持续时间（帧） */
  durationInFrames: z.number().min(1),
  
  // ===== 嵌套参数配置 =====
  
  /**
   * 背景配置（嵌套结构）
   * @example
   * background={{
   *   type: 'gradient',
   *   gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
   * }}
   */
  background: NestedBackgroundSchema.optional(),
  
  /**
   * 遮罩配置（嵌套结构）
   * @example
   * overlay={{
   *   color: '#000000',
   *   opacity: 0.3
   * }}
   */
  overlay: NestedOverlaySchema.optional(),
  
  /**
   * 音频配置（嵌套结构）
   * @example
   * audio={{
   *   enabled: true,
   *   source: 'bgm.mp3',
   *   volume: 0.5
   * }}
   */
  audio: NestedAudioSchema.optional(),
  
  // ===== 章节特有配置 =====
  
  // 角色配置
  character: StoryCharacterConfigSchema.optional(),
  
  // 彩带效果
  confetti: StoryConfettiConfigSchema.optional(),
  
  // 魔法效果
  magicEffects: StoryMagicEffectsConfigSchema.optional(),
  
  // 发散粒子
  radialBurst: RadialBurstSchema.optional(),
  
  // 字幕
  subtitles: z.array(SubtitleItemSchema).optional(),
  
  // 文字元素（名字、祝福语等）
  textElements: z.array(TextElementSchema).optional(),
  
  // 照片展示
  photoDisplay: PhotoDisplaySchema.optional(),
  
  // 漂浮元素（爱心、星星等）
  floatingElements: FloatingElementsSchema.optional(),
  
  // 星空背景
  starFieldBackground: StarFieldBackgroundSchema.optional(),
  
  // 透明视频列表
  transparentVideos: z.array(TransparentVideoItemSchema).optional(),
  
  // PlusEffects 特效列表
  plusEffects: PlusEffectsSchema.optional(),
  
  // 倒计时配置
  countdown: StoryCountdownConfigSchema.optional(),
});
export type StoryChapterSchemaType = z.infer<typeof StoryChapterSchema>;

// ==================== 故事面板 Schema ====================

/**
 * 章节过渡类型 Schema
 */
export const ChapterTransitionTypeSchema = z.enum([
  'none', 'fade', 'slideLeft', 'slideRight', 'slideUp', 'slideDown', 'crossfade'
]);
export type ChapterTransitionTypeType = z.infer<typeof ChapterTransitionTypeSchema>;

/**
 * 章节过渡配置 Schema
 */
export const ChapterTransitionSchema = z.object({
  type: ChapterTransitionTypeSchema,
  durationInFrames: z.number().min(0).max(60).optional(),
});
export type ChapterTransitionProps = z.infer<typeof ChapterTransitionSchema>;

/**
 * 故事面板章节配置 Schema
 */
export const StoryPanelChapterSchema = StoryChapterSchema.extend({
  /** 章节唯一标识 */
  id: z.string(),
  /** 章节过渡配置 */
  transition: ChapterTransitionSchema.optional(),
});
export type StoryPanelChapterProps = z.infer<typeof StoryPanelChapterSchema>;

/**
 * 自定义章节输入 Schema
 * 
 * 用于用户自定义章节配置，支持部分覆盖：
 * - id: 必需，用于匹配预设章节
 * - durationInFrames: 可选，匹配预设章节时自动继承，新增章节时必需
 * - 其他字段: 可选，按需覆盖
 */
export const CustomChapterInputSchema = StoryChapterSchema.extend({
  /** 章节唯一标识（必需，用于匹配预设章节） */
  id: z.string(),
  /** 章节持续时间（可选，匹配预设章节时自动继承） */
  durationInFrames: z.number().min(1).optional(),
  /** 章节过渡配置 */
  transition: ChapterTransitionSchema.optional(),
});
export type CustomChapterInputProps = z.infer<typeof CustomChapterInputSchema>;

/**
 * 背景音乐配置 Schema
 */
export const BackgroundMusicSchema = z.object({
  enabled: z.boolean(),
  source: z.string(),
  volume: z.number().min(0).max(1).optional(),
  loop: z.boolean().optional(),
});
export type BackgroundMusicProps = z.infer<typeof BackgroundMusicSchema>;

/**
 * 故事面板 Schema（嵌套参数结构）
 */
export const StoryPanelSchema = z.object({
  /** 章节列表 */
  chapters: z.array(StoryPanelChapterSchema).min(1),
  
  /** 默认章节过渡配置 */
  defaultTransition: ChapterTransitionSchema.optional(),
  
  /** 是否自动计算起始帧 */
  autoCalculateStartFrame: z.boolean().optional(),
  
  /** 章节间距 */
  chapterGap: z.number().min(0).optional(),
  
  /** 背景音乐配置 */
  backgroundMusic: BackgroundMusicSchema.optional(),
  
  // ===== 嵌套参数配置 =====
  
  /**
   * 背景配置（嵌套结构）
   */
  background: NestedBackgroundSchema.optional(),
  
  /**
   * 遮罩配置（嵌套结构）
   */
  overlay: NestedOverlaySchema.optional(),
  
  /**
   * 音频配置（嵌套结构）
   */
  audio: NestedAudioSchema.optional(),
});
export type StoryPanelProps = z.infer<typeof StoryPanelSchema>;

// ==================== 辅助函数 ====================

/**
 * 从 props 中提取故事章节参数（嵌套结构）
 */
export function extractStoryChapterProps(props: Record<string, unknown>): StoryChapterSchemaType {
  return {
    durationInFrames: props.durationInFrames as number,
    // 嵌套参数直接传递
    background: props.background as NestedBackgroundProps,
    overlay: props.overlay as NestedOverlayProps,
    audio: props.audio as NestedAudioProps,
    // 章节特有配置
    character: props.character as StoryChapterSchemaType['character'],
    confetti: props.confetti as StoryChapterSchemaType['confetti'],
    magicEffects: props.magicEffects as StoryChapterSchemaType['magicEffects'],
    radialBurst: props.radialBurst as StoryChapterSchemaType['radialBurst'],
    subtitles: props.subtitles as SubtitleItemProps[],
    textElements: props.textElements as StoryChapterSchemaType['textElements'],
    photoDisplay: props.photoDisplay as StoryChapterSchemaType['photoDisplay'],
    floatingElements: props.floatingElements as StoryChapterSchemaType['floatingElements'],
    starFieldBackground: props.starFieldBackground as StoryChapterSchemaType['starFieldBackground'],
    transparentVideos: props.transparentVideos as StoryChapterSchemaType['transparentVideos'],
    plusEffects: props.plusEffects as StoryChapterSchemaType['plusEffects'],
    countdown: props.countdown as StoryChapterSchemaType['countdown'],
  };
}

/**
 * 从 props 中提取故事面板参数（嵌套结构）
 */
export function extractStoryPanelProps(props: Record<string, unknown>): StoryPanelProps {
  return {
    chapters: props.chapters as StoryPanelChapterProps[],
    defaultTransition: props.defaultTransition as ChapterTransitionProps,
    autoCalculateStartFrame: props.autoCalculateStartFrame as boolean,
    chapterGap: props.chapterGap as number,
    backgroundMusic: props.backgroundMusic as BackgroundMusicProps,
    // 嵌套参数直接传递
    background: props.background as NestedBackgroundProps,
    overlay: props.overlay as NestedOverlayProps,
    audio: props.audio as NestedAudioProps,
  };
}

/**
 * 倒计时组件 Schema（完整配置）
 */
export const CountdownSchema = z.object({
  // 基础配置
  type: CountdownTypeSchema.optional().default('number'),
  startNumber: z.number().min(1).max(60).optional().default(5),
  totalSeconds: z.number().min(1).max(3600).optional().default(10),
  durationPerNumber: z.number().min(1).optional(),
  durationInFrames: z.number().min(1).optional(),
  
  // 展示特效
  effectType: CountdownEffectTypeSchema.optional().default('scale'),
  effectIntensity: z.number().min(0.1).max(2).optional().default(1),
  transitionFrames: z.number().min(1).max(30).optional().default(8),
  
  // 文字样式
  textStyle: CountdownTextStyleSchema.optional(),
  
  // 音效配置
  audio: CountdownAudioConfigSchema.optional(),
  
  // 最终文字
  finalText: CountdownFinalTextSchema.optional(),
  
  // 位置配置
  x: z.number().min(0).max(1).optional().default(0.5),
  y: z.number().min(0).max(1).optional().default(0.5),
  
  // 其他配置
  showBackground: z.boolean().optional().default(false),
  backgroundColor: z.string().optional(),
  backgroundBlur: z.number().min(0).max(50).optional(),
});
export type CountdownSchemaType = z.infer<typeof CountdownSchema>;
