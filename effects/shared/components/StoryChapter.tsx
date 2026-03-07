import React, { ReactNode, useMemo, useRef, useCallback, lazy, Suspense } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Sequence, interpolate, spring, staticFile, OffthreadVideo } from 'remotion';
import { Background, Overlay, RadialBurst } from './index';
import { BackgroundType } from '../schemas';
import { 
  Character, 
  CharacterWithSpeech, 
  SpeechBubble,
  getCharacterConfig,
  ConfettiBurst,
  MagicParticles,
  MagicWand,
  MagicCircle,
  Firework,
  BalloonBurst,
  WhiteFlashTransition,
  ShootingStar,
  StarFieldBackground,
  TransparentVideo,
} from './index';
import { 
  TransparentVideoConfig,
  TransparencyMode,
  ChromaKeyConfig,
} from './TransparentVideo';
import { SubtitleList, SubtitleItem } from './Subtitle';
import { 
  CharacterSeries,
  ZodiacType,
  PetType,
  HeroType,
} from '../types/character';
import { PlusEffectItemProps } from '../schemas/story';

// ==================== 类型定义 ====================

/**
 * 文字元素类型
 */
export type TextElementType = 'name' | 'blessing' | 'age' | 'custom';

/**
 * 文字动画类型
 */
export type TextAnimationType = 'bounce' | 'glow' | 'float' | 'fade' | 'typewriter' | 'none';

/**
 * 文字元素配置
 */
export interface TextElementConfig {
  /** 文字类型 */
  type: TextElementType;
  /** 自定义文字内容 */
  text?: string;
  /** 字体大小 */
  fontSize?: number;
  /** 颜色 */
  color?: string;
  /** 垂直位置（0-1） */
  verticalPosition?: number;
  /** 水平位置（0-1） */
  horizontalPosition?: number;
  /** 开始帧 */
  startFrame?: number;
  /** 动画类型 */
  animationType?: TextAnimationType;
  /** 是否显示年龄 */
  showAge?: boolean;
  /** 是否显示阴影 */
  showShadow?: boolean;
  /** 文字对齐 */
  textAlign?: 'left' | 'center' | 'right';
}

/**
 * 照片动画类型
 */
export type PhotoAnimationType = 'flyIn' | 'rotateIn' | 'fadeIn' | 'scaleIn' | 'magicCircle';

/**
 * 照片展示配置
 */
export interface PhotoDisplayConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 照片数据 */
  photo: {
    src: string;
    caption?: string;
  };
  /** 动画类型 */
  animationType?: PhotoAnimationType;
  /** 是否显示标题 */
  showCaption?: boolean;
  /** 开始帧 */
  startFrame?: number;
  /** 持续帧数 */
  durationInFrames?: number;
}

/**
 * 漂浮元素类型
 */
export type FloatingElementType = 'hearts' | 'stars' | 'confetti' | 'bubbles' | 'sparkles';

/**
 * 漂浮元素配置
 */
export interface FloatingElementsConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 元素类型 */
  type: FloatingElementType;
  /** 数量 */
  count?: number;
  /** 开始帧 */
  startFrame?: number;
  /** 颜色 */
  color?: string;
}

/**
 * 星空背景配置
 */
export interface StarFieldBackgroundConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 星星数量 */
  starCount?: number;
  /** 星星颜色 */
  starColor?: string;
}

/**
 * 黑屏过渡配置
 */
export interface BlackScreenTransitionConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 持续帧数 */
  durationInFrames?: number;
  /** 开始帧 */
  startFrame?: number;
}

// ==================== 透明视频配置 ====================

/**
 * 透明视频项配置（用于 StoryChapter）
 */
export interface TransparentVideoItem {
  /** 视频源（本地路径或网络 URL） */
  src: string;
  /** 透明模式：greenScreen（绿幕）、blueScreen（蓝幕）、chromaKey（自定义色度键）、webmAlpha（WebM透明） */
  mode?: TransparencyMode;
  /** 色度键配置（仅 mode 为 'chromaKey' 时使用） */
  chromaKey?: ChromaKeyConfig;
  /** 视频透明度（0-1），默认 1 */
  opacity?: number;
  /** 缩放比例（0.1-2），默认 1 */
  scale?: number;
  /** 水平位置（0-1），默认 0.5 */
  x?: number;
  /** 垂直位置（0-1），默认 0.5 */
  y?: number;
  /** 播放速率，默认 1 */
  playbackRate?: number;
  /** 是否循环播放，默认 false */
  loop?: boolean;
  /** 是否静音，默认 false（允许音频播放） */
  muted?: boolean;
  /** 音频音量（0-1），默认 1 */
  volume?: number;
  /** 开始帧（相对于章节开始） */
  startFrame?: number;
  /** 持续帧数（0 表示播放到章节结束） */
  durationInFrames?: number;
  /** 水平翻转 */
  flipX?: boolean;
  /** 垂直翻转 */
  flipY?: boolean;
  /** 旋转角度 */
  rotation?: number;
  /** z-index 层级，默认 20 */
  zIndex?: number;
}

// ==================== 角色动画配置 ====================

/**
 * 入场动画方向
 */
export type CharacterEntranceDirection = 'top' | 'bottom' | 'left' | 'right';

/**
 * 角色入场动画配置
 */
export interface CharacterEntranceConfig {
  /** 是否启用入场动画 */
  enabled: boolean;
  /** 入场方向 */
  direction?: CharacterEntranceDirection;
  /** 延迟帧数（开始动画前等待） */
  delay?: number;
  /** 移动距离（像素） */
  distance?: number;
  /** Spring 配置 */
  springConfig?: {
    damping?: number;
    stiffness?: number;
  };
  /** 垂直位置（0-1，相对于高度） */
  verticalPosition?: number;
  /** 水平位置（0-1，相对于宽度） */
  horizontalPosition?: number;
}

/**
 * 对话气泡动画类型
 */
export type SpeechBubbleAnimationType = 'scale' | 'fade' | 'slideUp' | 'none';

/**
 * 对话时序配置
 */
export interface SpeechTimelineItem {
  /** 对话内容 */
  text: string;
  /** 开始帧 */
  startFrame: number;
  /** 结束帧（可选，不设置则持续到章节结束） */
  endFrame?: number;
  /** 气泡动画类型 */
  animationType?: SpeechBubbleAnimationType;
  /** 气泡颜色 */
  bubbleColor?: string;
  /** 文字颜色 */
  textColor?: string;
}

/**
 * 表情变化时序配置
 */
export interface ExpressionTimelineItem {
  /** 表情 */
  expression: 'happy' | 'excited' | 'waving' | 'hugging';
  /** 开始帧 */
  startFrame: number;
}

/**
 * 角色配置
 */
export interface StoryCharacterConfig {
  /** 角色系列 */
  series: CharacterSeries;
  /** 角色类型（image 模式下可忽略） */
  type?: ZodiacType | PetType | HeroType;
  /** 位置 */
  position?: 'center' | 'left' | 'right';
  /** 表情（image 模式下可忽略） */
  expression?: 'happy' | 'excited' | 'waving' | 'hugging';
  /** 大小 */
  size?: number;
  /** 是否动画 */
  animate?: boolean;
  /** 对话内容（简单模式，使用 speechTimeline 替代） */
  speech?: string;
  /** 是否显示对话 */
  showSpeech?: boolean;
  /** 是否内联布局 */
  inline?: boolean;
  /** 自定义样式 */
  style?: React.CSSProperties;
  
  // ===== 新增：入场动画配置 =====
  /** 入场动画配置 */
  entrance?: CharacterEntranceConfig;
  
  // ===== 新增：对话时序配置 =====
  /** 对话时序列表（支持多段对话） */
  speechTimeline?: SpeechTimelineItem[];
  
  // ===== 新增：表情变化时序 =====
  /** 表情变化时序列表 */
  expressionTimeline?: ExpressionTimelineItem[];
  
  // ===== 新增：图片角色配置 =====
  /** 图片资源路径（本地路径或网络URL），仅当 series='image' 时使用 */
  imageSrc?: string;
}

/**
 * 彩带效果配置
 */
export interface StoryConfettiConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 密度级别 */
  level?: 'low' | 'medium' | 'high';
  /** 主颜色 */
  primaryColor?: string;
  /** 次颜色 */
  secondaryColor?: string;
  /** 触发帧 */
  triggerFrame?: number;
}

/**
 * 魔法粒子配置
 */
export interface StoryMagicParticlesConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 粒子数量 */
  particleCount?: number;
  /** 颜色 */
  color?: string;
  /** 目标X（比例） */
  targetX?: number;
  /** 目标Y（比例） */
  targetY?: number;
  /** 持续帧数 */
  durationInFrames?: number;
}

/**
 * 魔法棒配置
 */
export interface StoryMagicWandConfig {
  /** 是否启用 */
  enabled: boolean;
  /** X位置（比例） */
  x?: number;
  /** Y位置（比例） */
  y?: number;
  /** 旋转角度 */
  rotation?: number;
  /** 是否施法中 */
  casting?: boolean;
  /** 颜色 */
  color?: string;
}

/**
 * 魔法圆环配置
 */
export interface StoryMagicCircleConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 半径 */
  radius?: number;
  /** 颜色 */
  color?: string;
  /** 旋转速度 */
  rotationSpeed?: number;
  /** 脉冲强度 */
  pulseIntensity?: number;
}

/**
 * 烟花配置
 */
export interface StoryFireworkConfig {
  /** 是否启用 */
  enabled: boolean;
  /** X位置（比例） */
  x?: number;
  /** Y位置（比例） */
  y?: number;
  /** 粒子数量 */
  particleCount?: number;
  /** 颜色 */
  color?: string;
  /** 触发帧 */
  triggerFrame?: number;
}

/**
 * 气球爆炸配置
 */
export interface StoryBalloonBurstConfig {
  /** 是否启用 */
  enabled: boolean;
  /** X位置（比例） */
  x?: number;
  /** Y位置（比例） */
  y?: number;
  /** 气球数量 */
  balloonCount?: number;
  /** 颜色列表 */
  colors?: string[];
  /** 触发帧 */
  triggerFrame?: number;
}

/**
 * 白闪转场配置
 */
export interface StoryWhiteFlashConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 持续帧数 */
  durationInFrames?: number;
  /** 触发帧数（相对于章节开始） */
  triggerFrame?: number;
}

/**
 * 流星配置
 */
export interface StoryShootingStarConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 开始X（比例） */
  startX?: number;
  /** 开始Y（比例） */
  startY?: number;
  /** 结束X（比例） */
  endX?: number;
  /** 结束Y（比例） */
  endY?: number;
  /** 持续帧数 */
  durationInFrames?: number;
  /** 颜色 */
  color?: string;
  /** 尾迹长度 */
  trailLength?: number;
}

/**
 * 魔法效果集合配置
 */
export interface StoryMagicEffectsConfig {
  /** 魔法粒子 */
  particles?: StoryMagicParticlesConfig;
  /** 魔法棒 */
  magicWand?: StoryMagicWandConfig;
  /** 魔法圆环 */
  magicCircle?: StoryMagicCircleConfig;
  /** 烟花 */
  firework?: StoryFireworkConfig;
  /** 气球爆炸 */
  balloonBurst?: StoryBalloonBurstConfig;
  /** 白闪转场 */
  whiteFlash?: StoryWhiteFlashConfig;
  /** 流星 */
  shootingStar?: StoryShootingStarConfig;
  /** 黑屏过渡 */
  blackScreen?: BlackScreenTransitionConfig;
}

/**
 * 发散粒子配置（简化版）
 */
export interface StoryRadialBurstConfig {
  enabled?: boolean;
  effectType?: 'buddhaLight' | 'goldenRays' | 'meteorShower' | 'sparkleBurst';
  color?: string;
  secondaryColor?: string;
  intensity?: number;
  verticalOffset?: number;
  count?: number;
  speed?: number;
  opacity?: number;
}

/**
 * 故事章节 Props
 */
export interface StoryChapterProps {
  /** 章节持续时间（帧） */
  durationInFrames?: number;
  
  // ===== 背景配置 =====
  /** 背景类型 */
  backgroundType?: BackgroundType;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 背景渐变 */
  backgroundGradient?: string;
  /** 背景源 */
  backgroundSource?: string;
  /** 背景视频循环 */
  backgroundVideoLoop?: boolean;
  /** 背景视频静音 */
  backgroundVideoMuted?: boolean;
  
  // ===== 遮罩配置 =====
  /** 遮罩颜色 */
  overlayColor?: string;
  /** 遮罩透明度 */
  overlayOpacity?: number;
  /** 是否显示遮罩 */
  showOverlay?: boolean;
  
  // ===== 角色配置 =====
  /** 角色配置 */
  character?: StoryCharacterConfig;
  
  // ===== 彩带效果配置 =====
  /** 彩带效果配置 */
  confetti?: StoryConfettiConfig;
  
  // ===== 魔法效果配置 =====
  /** 魔法效果配置 */
  magicEffects?: StoryMagicEffectsConfig;
  
  // ===== 发散粒子配置 =====
  /** 发散粒子配置 */
  radialBurst?: StoryRadialBurstConfig;
  
  // ===== 字幕配置 =====
  /** 字幕列表 */
  subtitles?: SubtitleItem[];
  
  // ===== 内容配置 =====
  /** 自定义内容 */
  children?: ReactNode;
  
  // ===== 额外层配置 =====
  /** 额外层 */
  extraLayers?: ReactNode;
  /** 额外层位置 */
  extraLayersPosition?: 'before-content' | 'after-content';
  
  // ===== 音频配置 =====
  /** 音频元素 */
  audioElement?: ReactNode;
  
  // ===== 新增配置项 =====
  
  /** 
   * 文字元素配置（名字、祝福语等）
   * 支持配置驱动的文字显示，无需自定义 children
   */
  textElements?: TextElementConfig[];
  
  /** 
   * 照片展示配置
   * 支持照片卡片动画展示
   */
  photoDisplay?: PhotoDisplayConfig;
  
  /** 
   * 漂浮元素配置（爱心、星星等）
   */
  floatingElements?: FloatingElementsConfig;
  
  /** 
   * 星空背景配置
   */
  starFieldBackground?: StarFieldBackgroundConfig;
  
  // ===== 上下文数据（用于文字元素渲染）=====
  
  /** 名字（用于 textElements 中 type='name' 的渲染） */
  name?: string;
  
  /** 年龄（用于 textElements 中 showAge=true 的渲染） */
  age?: number;
  
  /** 风格（用于文字样式） */
  subStyle?: string;
  
  /** 屏幕方向 */
  orientation?: 'portrait' | 'landscape';
  
  // ===== 透明视频配置 =====
  
  /** 
   * 透明视频列表
   * 支持绿幕、蓝幕、自定义色度键和 WebM 透明视频
   * 可叠加多个透明视频层
   */
  transparentVideos?: TransparentVideoItem[];
  
  // ===== PlusEffects 特效扩展配置 =====
  
  /**
   * 额外特效列表
   * 支持在章节中渲染多个特效组件（如文字矢量动画、大风车等）
   * 每个特效项包含 MixedInput 属性 + effectType
   */
  plusEffects?: PlusEffectItemProps[];
  
  /**
   * 渲染 PlusEffects 的回调函数
   * 用于渲染委托，在 project 层实现具体的特效渲染逻辑
   * 
   * @param effects - PlusEffectItemProps 数组
   * @param fallbackWords - 默认文字列表（当 effect.words 为空时使用）
   * @param options - 渲染选项（包含 width 和 height）
   * @returns ReactNode
   */
  renderPlusEffects?: (
    effects: PlusEffectItemProps[],
    fallbackWords: string[],
    options?: { width: number; height: number }
  ) => ReactNode;
}

/**
 * 故事章节组件
 * 
 * 用于渲染一个相对短的故事片段动画，支持：
 * - 背景、遮罩
 * - 角色（带对话气泡）
 * - 彩带效果
 * - 魔法效果（粒子、魔法棒、圆环、烟花、气球等）
 * - 字幕系统
 * - 自定义内容
 * 
 * @example
 * ```tsx
 * <StoryChapter
 *   durationInFrames={120}
 *   backgroundType="gradient"
 *   backgroundGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
 *   character={{
 *     series: 'zodiac',
 *     type: 'tiger',
 *     position: 'center',
 *     expression: 'happy',
 *     speech: '你好呀！',
 *     showSpeech: true,
 *   }}
 *   confetti={{ enabled: true, level: 'medium' }}
 *   subtitles={[
 *     { text: '欢迎来到魔法世界', startFrame: 0, durationInFrames: 60 }
 *   ]}
 * >
 *   <CustomContent />
 * </StoryChapter>
 * ```
 */
export const StoryChapter: React.FC<StoryChapterProps> = ({
  durationInFrames,
  
  // 背景配置
  backgroundType = 'color',
  backgroundColor = '#1a1a2e',
  backgroundGradient,
  backgroundSource,
  backgroundVideoLoop = true,
  backgroundVideoMuted = true,
  
  // 遮罩配置
  overlayColor = '#000000',
  overlayOpacity = 0.2,
  showOverlay = true,
  
  // 角色配置
  character,
  
  // 彩带配置
  confetti,
  
  // 魔法效果配置
  magicEffects,
  
  // 发散粒子配置
  radialBurst,
  
  // 字幕配置
  subtitles = [],
  
  // 内容配置
  children,
  
  // 额外层配置
  extraLayers,
  extraLayersPosition = 'before-content',
  
  // 音频
  audioElement,
  
  // ===== 新增配置项 =====
  textElements,
  photoDisplay,
  floatingElements,
  starFieldBackground,
  // 透明视频配置
  transparentVideos,
  // PlusEffects 特效扩展配置
  plusEffects,
  renderPlusEffects,
  // 上下文数据
  name,
  age,
  subStyle,
  orientation = 'portrait',
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  
  // 渲染角色（支持入场动画、对话时序、表情变化）
  const renderCharacter = () => {
    if (!character) return null;
    
    // 计算入场动画
    let entranceTransform = '';
    let entranceOpacity = 1;
    let entranceTranslateY = 0;
    let entranceTranslateX = 0;
    
    if (character.entrance?.enabled) {
      const { 
        direction = 'bottom',
        delay = 0,
        distance = 200,
        springConfig = { damping: 12, stiffness: 80 },
        verticalPosition = 0.45,
        horizontalPosition = 0.5,
      } = character.entrance;
      
      const entranceFrame = Math.max(frame - delay, 0);
      const entranceProgress = spring({
        frame: entranceFrame,
        fps,
        config: springConfig,
      });
      
      entranceOpacity = entranceProgress;
      
      switch (direction) {
        case 'bottom':
          entranceTranslateY = interpolate(entranceProgress, [0, 1], [distance, 0]);
          break;
        case 'top':
          entranceTranslateY = interpolate(entranceProgress, [0, 1], [-distance, 0]);
          break;
        case 'left':
          entranceTranslateX = interpolate(entranceProgress, [0, 1], [-distance, 0]);
          break;
        case 'right':
          entranceTranslateX = interpolate(entranceProgress, [0, 1], [distance, 0]);
          break;
      }
    }
    
    // 计算当前表情（支持时序变化）
    let currentExpression = character.expression ?? 'happy';
    if (character.expressionTimeline && character.expressionTimeline.length > 0) {
      // 找到当前帧应该显示的表情
      const sortedTimeline = [...character.expressionTimeline].sort((a, b) => a.startFrame - b.startFrame);
      for (const item of sortedTimeline) {
        if (frame >= item.startFrame) {
          currentExpression = item.expression;
        }
      }
    }
    
    // 计算当前对话（支持时序）
    let currentSpeech: { text: string; bubbleColor?: string; textColor?: string; animationType?: SpeechBubbleAnimationType } | null = null;
    let speechBubbleScale = 1;
    let speechBubbleOpacity = 1;
    
    if (character.speechTimeline && character.speechTimeline.length > 0) {
      // 找到当前帧应该显示的对话
      for (const item of character.speechTimeline) {
        const startFrame = item.startFrame;
        const endFrame = item.endFrame ?? Infinity;
        
        if (frame >= startFrame && frame < endFrame) {
          currentSpeech = {
            text: item.text,
            bubbleColor: item.bubbleColor,
            textColor: item.textColor,
            animationType: item.animationType ?? 'scale',
          };
          
          // 计算气泡动画
          const speechFrame = frame - startFrame;
          if (currentSpeech.animationType === 'scale') {
            speechBubbleScale = spring({
              frame: speechFrame,
              fps,
              config: { damping: 10, stiffness: 200 },
            });
          } else if (currentSpeech.animationType === 'fade') {
            speechBubbleOpacity = interpolate(speechFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
          } else if (currentSpeech.animationType === 'slideUp') {
            speechBubbleScale = spring({
              frame: speechFrame,
              fps,
              config: { damping: 10, stiffness: 200 },
            });
          }
          break;
        }
      }
    } else if (character.speech && character.showSpeech) {
      // 简单模式：单一对话
      currentSpeech = {
        text: character.speech,
        animationType: 'scale',
      };
      speechBubbleScale = spring({
        frame,
        fps,
        config: { damping: 10, stiffness: 200 },
      });
    }
    
    // 计算角色位置
    const verticalPosition = character.entrance?.verticalPosition ?? 0.45;
    const horizontalPosition = character.entrance?.horizontalPosition ?? 0.5;
    
    // 渲染角色和对话组合
    return (
      <div
        style={{
          position: 'absolute',
          left: `${horizontalPosition * 100}%`,
          top: `${verticalPosition * 100}%`,
          transform: `translateX(-50%) translateX(${entranceTranslateX}px) translateY(${entranceTranslateY}px)`,
          opacity: entranceOpacity,
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* 对话气泡 */}
        {currentSpeech && (
          <div 
            style={{ 
              marginBottom: 25, 
              transform: `scale(${speechBubbleScale})`,
              opacity: speechBubbleOpacity,
            }}
          >
            <SpeechBubble
              text={currentSpeech.text}
              visible={true}
              color={currentSpeech.bubbleColor ?? '#FFFFFF'}
            />
          </div>
        )}
        
        {/* 角色 */}
        <Character
          series={character.series}
          type={character.type}
          size={character.size ?? 200}
          expression={currentExpression}
          inline={true}
          animate={character.animate ?? true}
          imageSrc={character.imageSrc}
        />
      </div>
    );
  };
  
  // 渲染彩带
  const renderConfetti = () => {
    if (!confetti || !confetti.enabled) return null;
    
    return (
      <ConfettiBurst
        primaryColor={confetti.primaryColor}
        secondaryColor={confetti.secondaryColor}
        level={confetti.level ?? 'medium'}
        seed={confetti.triggerFrame ?? 0}
      />
    );
  };
  
  // 渲染魔法效果
  const renderMagicEffects = () => {
    if (!magicEffects) return null;
    
    return (
      <>
        {/* 魔法粒子 */}
        {magicEffects.particles?.enabled && (
          <MagicParticles
            particleCount={magicEffects.particles.particleCount ?? 50}
            color={magicEffects.particles.color ?? '#B892FF'}
            targetX={magicEffects.particles.targetX ?? 0.5}
            targetY={magicEffects.particles.targetY ?? 0.5}
            durationInFrames={magicEffects.particles.durationInFrames ?? 48}
          />
        )}
        
        {/* 魔法棒 */}
        {magicEffects.magicWand?.enabled && (
          <MagicWand
            x={magicEffects.magicWand.x ?? 0.5}
            y={magicEffects.magicWand.y ?? 0.6}
            rotation={magicEffects.magicWand.rotation ?? -30}
            casting={magicEffects.magicWand.casting ?? false}
            color={magicEffects.magicWand.color ?? '#B892FF'}
          />
        )}
        
        {/* 魔法圆环 */}
        {magicEffects.magicCircle?.enabled && (
          <MagicCircle
            radius={magicEffects.magicCircle.radius ?? 150}
            color={magicEffects.magicCircle.color ?? '#B892FF'}
            rotationSpeed={magicEffects.magicCircle.rotationSpeed ?? 1}
            pulseIntensity={magicEffects.magicCircle.pulseIntensity ?? 0.1}
          />
        )}
        
        {/* 烟花 */}
        {magicEffects.firework?.enabled && (
          <Firework
            x={magicEffects.firework.x ?? 0.5}
            y={magicEffects.firework.y ?? 0.4}
            particleCount={magicEffects.firework.particleCount ?? 30}
            color={magicEffects.firework.color ?? '#FFD76A'}
            triggerFrame={magicEffects.firework.triggerFrame ?? 0}
          />
        )}
        
        {/* 气球爆炸 */}
        {magicEffects.balloonBurst?.enabled && (
          <BalloonBurst
            x={magicEffects.balloonBurst.x ?? 0.5}
            y={magicEffects.balloonBurst.y ?? 0.5}
            balloonCount={magicEffects.balloonBurst.balloonCount ?? 8}
            colors={magicEffects.balloonBurst.colors}
            triggerFrame={magicEffects.balloonBurst.triggerFrame ?? 0}
          />
        )}
        
        {/* 白闪转场 */}
        {magicEffects.whiteFlash?.enabled && (
          <WhiteFlashTransition
            durationInFrames={magicEffects.whiteFlash.durationInFrames ?? 12}
            triggerFrame={magicEffects.whiteFlash.triggerFrame ?? 0}
          />
        )}
        
        {/* 流星 */}
        {magicEffects.shootingStar?.enabled && (
          <ShootingStar
            startX={magicEffects.shootingStar.startX ?? 0.8}
            startY={magicEffects.shootingStar.startY ?? 0.1}
            endX={magicEffects.shootingStar.endX ?? 0.2}
            endY={magicEffects.shootingStar.endY ?? 0.5}
            durationInFrames={magicEffects.shootingStar.durationInFrames ?? 30}
            color={magicEffects.shootingStar.color ?? '#FFFFFF'}
            trailLength={magicEffects.shootingStar.trailLength ?? 80}
          />
        )}
      </>
    );
  };
  
  // 渲染发散粒子
  const renderRadialBurst = () => {
    if (!radialBurst || !radialBurst.enabled) return null;
    
    return (
      <RadialBurst
        enabled={true}
        effectType={radialBurst.effectType ?? 'sparkleBurst'}
        color={radialBurst.color}
        secondaryColor={radialBurst.secondaryColor}
        intensity={radialBurst.intensity}
        verticalOffset={radialBurst.verticalOffset}
        count={radialBurst.count}
        speed={radialBurst.speed}
        opacity={radialBurst.opacity}
      />
    );
  };
  
  // 渲染字幕
  const renderSubtitles = () => {
    if (!subtitles || subtitles.length === 0) return null;
    
    return <SubtitleList subtitles={subtitles} />;
  };
  
  // ===== 新增渲染函数 =====
  
  // 渲染黑屏过渡
  const renderBlackScreen = () => {
    if (!magicEffects?.blackScreen?.enabled) return null;
    
    const { durationInFrames: duration = 24, startFrame = 0 } = magicEffects.blackScreen;
    const endFrame = startFrame + duration;
    
    const opacity = interpolate(
      frame,
      [startFrame, endFrame],
      [1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    
    if (opacity <= 0) return null;
    
    return (
      <AbsoluteFill 
        style={{ 
          backgroundColor: 'black', 
          opacity,
          zIndex: 100 
        }} 
      />
    );
  };
  
  // 渲染文字元素
  const renderTextElements = () => {
    if (!textElements || textElements.length === 0) return null;
    
    return (
      <>
        {textElements.map((element, index) => {
          const startFrame = element.startFrame ?? 0;
          const isVisible = frame >= startFrame;
          
          if (!isVisible) return null;
          
          // 计算动画
          const elementFrame = frame - startFrame;
          let animatedStyle: React.CSSProperties = {};
          
          if (element.animationType === 'bounce') {
            const bounce = spring({
              frame: elementFrame,
              fps,
              config: { damping: 10, stiffness: 100 }
            });
            animatedStyle = {
              transform: `scale(${bounce})`,
              opacity: bounce,
            };
          } else if (element.animationType === 'fade') {
            const fadeProgress = interpolate(elementFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
            animatedStyle = {
              opacity: fadeProgress,
            };
          } else if (element.animationType === 'glow') {
            const glowProgress = interpolate(elementFrame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
            animatedStyle = {
              textShadow: `0 0 ${20 + glowProgress * 30}px ${element.color ?? '#FFD76A'}`,
            };
          }
          
          // 获取文字内容
          let text = element.text ?? '';
          if (element.type === 'name' && name) {
            text = name;
          }
          if (element.showAge && age !== undefined) {
            text = `${text} ${age}岁`;
          }
          if (element.type === 'blessing') {
            text = element.text ?? '生日快乐';
          }
          
          const fontSize = element.fontSize ?? (orientation === 'portrait' ? 80 : 60);
          const verticalPosition = element.verticalPosition ?? 0.3;
          const horizontalPosition = element.horizontalPosition ?? 0.5;
          
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: `${verticalPosition * 100}%`,
                left: `${horizontalPosition * 100}%`,
                transform: `translate(-50%, -50%) ${animatedStyle.transform ?? ''}`,
                fontSize,
                fontWeight: 700,
                color: element.color ?? '#FFD76A',
                textAlign: element.textAlign ?? 'center',
                zIndex: 30,
                ...animatedStyle,
              }}
            >
              {text}
            </div>
          );
        })}
      </>
    );
  };
  
  // 渲染照片展示
  const renderPhotoDisplay = () => {
    if (!photoDisplay?.enabled || !photoDisplay.photo) return null;
    
    const startFrame = photoDisplay.startFrame ?? 0;
    const isVisible = frame >= startFrame;
    
    if (!isVisible) return null;
    
    // 简单的照片展示（基础实现）
    const elementFrame = frame - startFrame;
    const fadeIn = interpolate(elementFrame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
    const scale = photoDisplay.animationType === 'scaleIn' 
      ? spring({ frame: elementFrame, fps, config: { damping: 12, stiffness: 80 } })
      : 1;
    
    const rotation = photoDisplay.animationType === 'rotateIn'
      ? interpolate(elementFrame, [0, 30], [-15, 0], { extrapolateRight: 'clamp' })
      : 0;
    
    return (
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
          opacity: fadeIn,
          zIndex: 25,
        }}
      >
        <img 
          src={photoDisplay.photo.src}
          alt={photoDisplay.photo.caption ?? ''}
          style={{
            maxWidth: '70%',
            maxHeight: '50%',
            borderRadius: 16,
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          }}
        />
        {photoDisplay.showCaption && photoDisplay.photo.caption && (
          <div style={{
            textAlign: 'center',
            marginTop: 16,
            fontSize: 24,
            color: '#FFFFFF',
          }}>
            {photoDisplay.photo.caption}
          </div>
        )}
      </div>
    );
  };
  
  // 渲染漂浮元素
  const renderFloatingElements = () => {
    if (!floatingElements?.enabled) return null;
    
    const startFrame = floatingElements.startFrame ?? 0;
    const isVisible = frame >= startFrame;
    
    if (!isVisible) return null;
    
    const count = floatingElements.count ?? 15;
    const color = floatingElements.color ?? '#FF6B6B';
    
    // 生成漂浮元素
    const elements = Array.from({ length: count }, (_, i) => {
      const elementFrame = frame - startFrame - i * 3;
      if (elementFrame < 0) return null;
      
      const x = ((i * 137.5) % 100) / 100; // 伪随机分布
      const y = interpolate(elementFrame, [0, 120], [1.2, -0.2], { extrapolateRight: 'clamp' });
      const opacity = elementFrame < 10 ? elementFrame / 10 : 1;
      
      let content = '❤️';
      if (floatingElements.type === 'stars') content = '⭐';
      if (floatingElements.type === 'sparkles') content = '✨';
      if (floatingElements.type === 'bubbles') content = '🫧';
      
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${x * 100}%`,
            top: `${y * 100}%`,
            fontSize: 24 + (i % 3) * 8,
            opacity: Math.min(opacity, y > 0 ? 1 : 0),
            transform: `rotate(${elementFrame * 2}deg)`,
            zIndex: 15,
          }}
        >
          {content}
        </div>
      );
    });
    
    return <>{elements}</>;
  };
  
  // 渲染星空背景
  const renderStarFieldBackground = () => {
    if (!starFieldBackground?.enabled) return null;
    
    return (
      <StarFieldBackground 
        starCount={starFieldBackground.starCount ?? 150}
        color={starFieldBackground.starColor}
      />
    );
  };
  
  // 渲染透明视频
  const renderTransparentVideos = () => {
    if (!transparentVideos || transparentVideos.length === 0) return null;
    
    return (
      <>
        {transparentVideos.map((videoConfig, index) => {
          const videoStartFrame = videoConfig.startFrame ?? 0;
          const videoDuration = videoConfig.durationInFrames ?? 0;
          
          // 如果当前帧未到达视频开始帧，不渲染
          if (frame < videoStartFrame) return null;
          
          // 如果设置了持续时间且已超时，不渲染
          if (videoDuration > 0 && frame >= videoStartFrame + videoDuration) return null;
          
          return (
            <TransparentVideo
              key={`transparent-video-${index}`}
              enabled={true}
              src={videoConfig.src}
              mode={videoConfig.mode ?? 'greenScreen'}
              chromaKey={videoConfig.chromaKey}
              opacity={videoConfig.opacity ?? 1}
              scale={videoConfig.scale ?? 1}
              x={videoConfig.x ?? 0.5}
              y={videoConfig.y ?? 0.5}
              playbackRate={videoConfig.playbackRate ?? 1}
              loop={videoConfig.loop ?? false}
              muted={videoConfig.muted ?? false}
              volume={videoConfig.volume ?? 1}
              startFrame={videoStartFrame}
              durationInFrames={videoDuration}
              flipX={videoConfig.flipX ?? false}
              flipY={videoConfig.flipY ?? false}
              rotation={videoConfig.rotation ?? 0}
              zIndex={videoConfig.zIndex ?? 20}
            />
          );
        })}
      </>
    );
  };
  
  // 渲染 PlusEffects 特效（通过渲染委托回调）
  const renderPlusEffectsContent = () => {
    if (!plusEffects || plusEffects.length === 0) return null;
    if (!renderPlusEffects) {
      console.warn('StoryChapter: plusEffects provided but renderPlusEffects callback is missing');
      return null;
    }
    
    // 回退文字
    const fallbackText = name ?? '福';
    const fallbackWords = [fallbackText, '禄', '寿', '喜'];
    
    return renderPlusEffects(plusEffects, fallbackWords, { width, height });
  };
  
  return (
    <AbsoluteFill>
      {/* 背景层 */}
      <Background
        type={backgroundType}
        source={backgroundSource}
        color={backgroundColor}
        gradient={backgroundGradient}
        videoLoop={backgroundVideoLoop}
        videoMuted={backgroundVideoMuted}
      />
      
      {/* 星空背景层 */}
      {renderStarFieldBackground()}
      
      {/* 发散粒子效果层 */}
      {renderRadialBurst()}
      
      {/* 额外层（内容前） */}
      {extraLayersPosition === 'before-content' && extraLayers}
      
      {/* 遮罩层 */}
      {showOverlay && overlayOpacity > 0 && (
        <Overlay color={overlayColor} opacity={overlayOpacity} />
      )}
      
      {/* 魔法效果层 */}
      {renderMagicEffects()}
      
      {/* 透明视频层 */}
      {renderTransparentVideos()}
      
      {/* PlusEffects 特效层 */}
      {renderPlusEffectsContent()}
      
      {/* 漂浮元素层 */}
      {renderFloatingElements()}
      
      {/* 照片展示层 */}
      {renderPhotoDisplay()}
      
      {/* 自定义内容 */}
      {children}
      
      {/* 文字元素层 */}
      {renderTextElements()}
      
      {/* 角色层 */}
      {renderCharacter()}
      
      {/* 彩带层 */}
      {renderConfetti()}
      
      {/* 额外层（内容后） */}
      {extraLayersPosition === 'after-content' && extraLayers}
      
      {/* 字幕层 */}
      {renderSubtitles()}
      
      {/* 黑屏过渡层（最上层） */}
      {renderBlackScreen()}
      
      {/* 音频层 */}
      {audioElement}
    </AbsoluteFill>
  );
};

export default StoryChapter;
