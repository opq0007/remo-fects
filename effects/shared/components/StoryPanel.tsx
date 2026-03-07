import React, { useMemo, ReactNode } from 'react';
import { AbsoluteFill, Sequence, useVideoConfig, Audio, staticFile, interpolate, useCurrentFrame } from 'remotion';
import { BaseComposition, BaseCompositionComponentProps } from './BaseComposition';
import { StoryChapter, StoryChapterProps } from './StoryChapter';
import { Watermark as WatermarkComponent, WatermarkProps } from './Watermark';
import { Marquee as MarqueeComponent, MarqueeProps } from './Marquee';
import { RadialBurst } from './RadialBurst';
import { Foreground } from './Foreground';
import { PlusEffectItemProps } from '../schemas/story';

// ==================== 类型定义 ====================

/**
 * 章节过渡类型
 */
export type ChapterTransitionType = 'none' | 'fade' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'crossfade';

/**
 * 章节过渡配置
 */
export interface ChapterTransition {
  /** 过渡类型 */
  type: ChapterTransitionType;
  /** 过渡持续时间（帧） */
  durationInFrames?: number;
}

/**
 * 故事章节配置（用于面板）
 * 
 * 扩展 StoryChapterProps，添加面板所需的额外配置
 */
export interface StoryChapterConfig extends Omit<StoryChapterProps, 'children'> {
  /** 章节唯一标识 */
  id: string;
  /** 章节持续时间（帧） */
  durationInFrames: number;
  /** 自定义内容 */
  children?: ReactNode;
  /** 章节过渡配置（覆盖面板默认配置） */
  transition?: ChapterTransition;
}

/**
 * 故事面板 Props
 * 
 * 继承 BaseComposition 的所有能力，并添加章节管理功能
 */
export interface StoryPanelProps extends Omit<BaseCompositionComponentProps, 'children'> {
  /** 章节列表 */
  chapters: StoryChapterConfig[];
  
  /** 默认章节过渡配置 */
  defaultTransition?: ChapterTransition;
  
  /** 是否自动计算起始帧（默认 true） */
  autoCalculateStartFrame?: boolean;
  
  /** 章节间距（帧），仅在 autoCalculateStartFrame 为 true 时有效 */
  chapterGap?: number;
  
  /** 面板级自定义内容（显示在所有章节之上） */
  overlayContent?: ReactNode;
  
  /** 是否启用全局水印 */
  watermark?: {
    enabled: boolean;
  } & Partial<WatermarkProps>;
  
  /** 是否启用全局走马灯 */
  marquee?: {
    enabled: boolean;
  } & Partial<MarqueeProps>;
  
  /** 背景音乐配置 */
  backgroundMusic?: {
    enabled: boolean;
    source: string;
    volume?: number;
    loop?: boolean;
  };
  
  /**
   * 渲染 PlusEffects 的回调函数
   * 用于渲染委托，在 project 层实现具体的特效渲染逻辑
   * 
   * @param effects - PlusEffectItemProps 数组
   * @param fallbackWords - 默认文字列表（当 effect.words 为空时使用）
   * @returns ReactNode
   */
  renderPlusEffects?: (effects: PlusEffectItemProps[], fallbackWords: string[]) => ReactNode;
}

/**
 * 章节过渡效果组件
 */
interface ChapterTransitionEffectProps {
  type: ChapterTransitionType;
  durationInFrames: number;
  isActive: boolean;
  isExiting: boolean;
  children: ReactNode;
}

const ChapterTransitionEffect: React.FC<ChapterTransitionEffectProps> = ({
  type,
  durationInFrames,
  isActive,
  isExiting,
  children,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  // 计算过渡进度
  let opacity = 1;
  let translateX = 0;
  let translateY = 0;
  
  if (type !== 'none') {
    const transitionFrame = isExiting ? frame : (durationInFrames - frame);
    const progress = interpolate(
      transitionFrame,
      [0, durationInFrames],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    
    switch (type) {
      case 'fade':
        opacity = isExiting ? 1 - progress : progress;
        break;
        
      case 'crossfade':
        opacity = isExiting ? 1 - progress : progress;
        break;
        
      case 'slideLeft':
        translateX = isExiting ? -width * progress : width * (1 - progress);
        opacity = 0.9 + 0.1 * (isExiting ? 1 - progress : progress);
        break;
        
      case 'slideRight':
        translateX = isExiting ? width * progress : -width * (1 - progress);
        opacity = 0.9 + 0.1 * (isExiting ? 1 - progress : progress);
        break;
        
      case 'slideUp':
        translateY = isExiting ? -height * progress : height * (1 - progress);
        opacity = 0.9 + 0.1 * (isExiting ? 1 - progress : progress);
        break;
        
      case 'slideDown':
        translateY = isExiting ? height * progress : -height * (1 - progress);
        opacity = 0.9 + 0.1 * (isExiting ? 1 - progress : progress);
        break;
    }
  }
  
  return (
    <AbsoluteFill
      style={{
        opacity: Math.max(0, Math.min(1, opacity)),
        transform: `translateX(${translateX}px) translateY(${translateY}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * 故事面板组件
 * 
 * 基于 BaseComposition，支持嵌入多个故事章节，每个章节的时长和效果可独立控制。
 * 
 * 特性：
 * - 继承 BaseComposition 所有能力（背景、遮罩、音频等）
 * - 支持多个故事章节按顺序播放
 * - 支持章节间过渡效果（淡入淡出、滑动等）
 * - 支持全局水印和走马灯
 * - 支持背景音乐
 * 
 * @example
 * ```tsx
 * <StoryPanel
 *   chapters={[
 *     {
 *       id: 'chapter1',
 *       durationInFrames: 120,
 *       backgroundType: 'gradient',
 *       backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
 *       character: {
 *         series: 'zodiac',
 *         type: 'tiger',
 *         speech: '欢迎来到魔法世界！',
 *         showSpeech: true,
 *       },
 *       subtitles: [
 *         { text: '第一章：魔法开场', startFrame: 0, durationInFrames: 60 }
 *       ],
 *     },
 *     {
 *       id: 'chapter2',
 *       durationInFrames: 180,
 *       backgroundType: 'color',
 *       backgroundColor: '#1a1a2e',
 *       confetti: { enabled: true, level: 'high' },
 *       subtitles: [
 *         { text: '第二章：欢乐时光', startFrame: 0, durationInFrames: 60 }
 *       ],
 *     },
 *   ]}
 *   defaultTransition={{ type: 'fade', durationInFrames: 15 }}
 *   backgroundMusic={{
 *     enabled: true,
 *     source: 'background.mp3',
 *     volume: 0.3,
 *   }}
 * />
 * ```
 */
export const StoryPanel: React.FC<StoryPanelProps> = ({
  chapters,
  defaultTransition = { type: 'none', durationInFrames: 0 },
  autoCalculateStartFrame = true,
  chapterGap = 0,
  overlayContent,
  watermark,
  marquee,
  backgroundMusic,
  // PlusEffects 渲染委托
  renderPlusEffects,
  // BaseComposition 参数
  showBackground = true,
  showOverlay = true,
  overlayPosition = 'before',
  extraLayers,
  extraLayersPosition = 'before-content',
  backgroundType = 'color',
  backgroundSource,
  backgroundColor = '#1a1a2e',
  backgroundGradient,
  backgroundVideoLoop = true,
  backgroundVideoMuted = true,
  overlayColor = '#000000',
  overlayOpacity = 0.2,
  audioEnabled = false,
  audioSource,
  audioVolume = 0.5,
  audioLoop = true,
  radialBurst,
  foreground,
}) => {
  const { fps } = useVideoConfig();
  
  // 计算各章节的时间配置
  const chapterTimings = useMemo(() => {
    const timings: Array<{
      chapter: StoryChapterConfig;
      from: number;
      durationInFrames: number;
      transition: ChapterTransition;
    }> = [];
    
    let currentFrame = 0;
    
    for (const chapter of chapters) {
      const transition = chapter.transition ?? defaultTransition;
      const transitionDuration = transition.type !== 'none' ? (transition.durationInFrames ?? 15) : 0;
      
      timings.push({
        chapter,
        from: currentFrame,
        durationInFrames: chapter.durationInFrames,
        transition,
      });
      
      currentFrame += chapter.durationInFrames + chapterGap;
    }
    
    return timings;
  }, [chapters, defaultTransition, chapterGap]);
  
  // 计算总时长
  const totalDuration = useMemo(() => {
    if (chapterTimings.length === 0) return 0;
    const last = chapterTimings[chapterTimings.length - 1];
    return last.from + last.durationInFrames;
  }, [chapterTimings]);
  
  // 渲染水印
  const renderWatermark = () => {
    if (!watermark || !watermark.enabled || !watermark.text) return null;
    return <WatermarkComponent {...watermark} text={watermark.text} />;
  };
  
  // 渲染走马灯
  const renderMarquee = () => {
    if (!marquee || !marquee.enabled) return null;
    return <MarqueeComponent {...marquee} />;
  };
  
  // 渲染背景音乐
  const renderBackgroundMusic = () => {
    if (!backgroundMusic || !backgroundMusic.enabled || !backgroundMusic.source) {
      return null;
    }
    
    return (
      <Audio
        src={staticFile(backgroundMusic.source)}
        volume={backgroundMusic.volume ?? 0.3}
        loop={backgroundMusic.loop ?? true}
      />
    );
  };
  
  // 渲染章节
  const renderChapters = () => {
    return chapterTimings.map(({ chapter, from, durationInFrames, transition }, index) => {
      const { id, children, transition: _, ...chapterProps } = chapter;
      
      // 检查是否需要过渡效果
      const needsTransition = transition.type !== 'none';
      const transitionDuration = transition.durationInFrames ?? 15;
      
      // 计算是否是最后一个章节
      const isLastChapter = index === chapterTimings.length - 1;
      
      return (
        <Sequence
          key={id}
          from={from}
          durationInFrames={durationInFrames}
          name={`章节: ${id}`}
        >
          <ChapterWrapper
            transition={transition}
            durationInFrames={durationInFrames}
          >
            <StoryChapter
              {...chapterProps}
              durationInFrames={durationInFrames}
              renderPlusEffects={chapterProps.renderPlusEffects ?? renderPlusEffects}
            >
              {children}
            </StoryChapter>
          </ChapterWrapper>
        </Sequence>
      );
    });
  };
  
  return (
    <BaseComposition
      showBackground={showBackground}
      showOverlay={showOverlay}
      overlayPosition={overlayPosition}
      extraLayers={extraLayers}
      extraLayersPosition={extraLayersPosition}
      backgroundType={backgroundType}
      backgroundSource={backgroundSource}
      backgroundColor={backgroundColor}
      backgroundGradient={backgroundGradient}
      backgroundVideoLoop={backgroundVideoLoop}
      backgroundVideoMuted={backgroundVideoMuted}
      overlayColor={overlayColor}
      overlayOpacity={overlayOpacity}
      audioEnabled={audioEnabled}
      audioSource={audioSource}
      audioVolume={audioVolume}
      audioLoop={audioLoop}
      radialBurst={radialBurst}
      foreground={foreground}
    >
      {/* 章节序列 */}
      {renderChapters()}
      
      {/* 面板级覆盖内容 */}
      {overlayContent}
      
      {/* 水印层 */}
      {renderWatermark()}
      
      {/* 走马灯层 */}
      {renderMarquee()}
      
      {/* 背景音乐 */}
      {renderBackgroundMusic()}
    </BaseComposition>
  );
};

/**
 * 章节包装器（处理过渡效果）
 */
interface ChapterWrapperProps {
  transition: ChapterTransition;
  durationInFrames: number;
  children: ReactNode;
}

const ChapterWrapper: React.FC<ChapterWrapperProps> = ({
  transition,
  durationInFrames,
  children,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  // 如果不需要过渡，直接返回
  if (transition.type === 'none') {
    return <>{children}</>;
  }
  
  const transitionDuration = transition.durationInFrames ?? 15;
  
  // 计算入场和出场进度
  const entranceProgress = interpolate(
    frame,
    [0, transitionDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const exitProgress = interpolate(
    frame,
    [durationInFrames - transitionDuration, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  // 计算样式
  let opacity = 1;
  let translateX = 0;
  let translateY = 0;
  
  // 入场效果
  if (frame < transitionDuration) {
    switch (transition.type) {
      case 'fade':
      case 'crossfade':
        opacity = entranceProgress;
        break;
      case 'slideLeft':
        translateX = width * (1 - entranceProgress);
        opacity = entranceProgress;
        break;
      case 'slideRight':
        translateX = -width * (1 - entranceProgress);
        opacity = entranceProgress;
        break;
      case 'slideUp':
        translateY = height * (1 - entranceProgress);
        opacity = entranceProgress;
        break;
      case 'slideDown':
        translateY = -height * (1 - entranceProgress);
        opacity = entranceProgress;
        break;
    }
  }
  
  // 出场效果
  if (frame >= durationInFrames - transitionDuration) {
    switch (transition.type) {
      case 'fade':
      case 'crossfade':
        opacity = 1 - exitProgress;
        break;
      case 'slideLeft':
        translateX = -width * exitProgress;
        opacity = 1 - exitProgress;
        break;
      case 'slideRight':
        translateX = width * exitProgress;
        opacity = 1 - exitProgress;
        break;
      case 'slideUp':
        translateY = -height * exitProgress;
        opacity = 1 - exitProgress;
        break;
      case 'slideDown':
        translateY = height * exitProgress;
        opacity = 1 - exitProgress;
        break;
    }
  }
  
  return (
    <AbsoluteFill
      style={{
        opacity: Math.max(0, Math.min(1, opacity)),
        transform: `translateX(${translateX}px) translateY(${translateY}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export default StoryPanel;
