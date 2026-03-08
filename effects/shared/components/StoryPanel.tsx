import React, { useMemo, ReactNode } from 'react';
import { AbsoluteFill, Sequence, useVideoConfig, Audio, staticFile, interpolate, useCurrentFrame } from 'remotion';
import { BaseComposition, BaseCompositionComponentProps } from './BaseComposition';
import { StoryChapter, StoryChapterProps } from './StoryChapter';
import { Watermark as WatermarkComponent, WatermarkProps } from './Watermark';
import { Marquee as MarqueeComponent, MarqueeProps } from './Marquee';
import { RadialBurst } from './RadialBurst';
import { Foreground } from './Foreground';
import { PlusEffectItemProps } from '../schemas/story';
import { BackgroundType, NestedBackgroundProps, NestedOverlayProps, NestedAudioProps } from '../schemas';

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
 * 故事面板 Props（嵌套参数结构）
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
   */
  renderPlusEffects?: (effects: PlusEffectItemProps[], fallbackWords: string[]) => ReactNode;
}

/**
 * 故事面板组件
 * 
 * 基于 BaseComposition，支持嵌入多个故事章节，每个章节的时长和效果可独立控制。
 * 
 * @example
 * ```tsx
 * <StoryPanel
 *   chapters={[
 *     {
 *       id: 'chapter1',
 *       durationInFrames: 120,
 *       background: {
 *         type: 'gradient',
 *         gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
 *       },
 *       character: {
 *         series: 'zodiac',
 *         type: 'tiger',
 *         speech: '欢迎来到魔法世界！',
 *         showSpeech: true,
 *       },
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
  renderPlusEffects,
  // BaseComposition 参数
  showBackground = true,
  showOverlay = true,
  overlayPosition = 'before',
  extraLayers,
  extraLayersPosition = 'before-content',
  background,
  overlay,
  audio,
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
    return chapterTimings.map(({ chapter, from, durationInFrames, transition }) => {
      const { id, children, transition: _, ...chapterProps } = chapter;
      
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
      background={background}
      overlay={overlay}
      audio={audio}
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
  
  if (transition.type === 'none') {
    return <>{children}</>;
  }
  
  const transitionDuration = transition.durationInFrames ?? 15;
  
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
  
  let opacity = 1;
  let translateX = 0;
  let translateY = 0;
  
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
