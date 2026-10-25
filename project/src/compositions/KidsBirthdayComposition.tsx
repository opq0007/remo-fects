import React, { useMemo } from 'react';
import { useVideoConfig } from 'remotion';
import { z } from 'zod';
import {
  StoryPanel,
  StoryChapterConfig,
  StoryCharacterConfig,
  NestedBackgroundProps,
  NestedOverlayProps,
  NestedAudioProps,
  NestedMarqueeProps,
  NestedWatermarkProps,
  NestedRadialBurstProps,
  NestedForegroundProps,
} from '../../../effects/shared/index';
import {
  CartoonElements,
  PhotoFromMagicCircle,
  BirthdaySongScene,
  DreamBubblesScene,
  BouncingName,
  BlessingText,
} from '../components';
import { renderPlusEffects } from '../components/EffectRenderer';
import { getColorTheme } from '../utils/colors';
import { mergeChapterConfigs } from '../utils/mergeChapterConfig';
import {
  KidsSubStyle,
  ZodiacType,
  PetType,
  HeroType,
  PhotoData,
  ScreenOrientation,
  PRIMARY_COLORS,
} from '../types';
import {
  KidsBirthdaySchema,
  getBlessingSeriesConfig,
  computeContentPlan,
  AVAILABLE_PUBLIC_ASSETS,
} from '../schemas';

export type KidsBirthdayProps = z.infer<typeof KidsBirthdaySchema>;

/**
 * 规范化后的角色资源：series 决定渲染方式
 * - 'image'：用 imageSrc 图片渲染
 * - 'zodiac' | 'pet' | 'hero'：用内置卡通角色渲染（零资源依赖）
 */
interface CharacterResource {
  type: string;
  name: string;
  greeting: string;
  series: 'image' | 'zodiac' | 'pet' | 'hero';
  imageSrc?: string;
  videoSrc?: string;
}

// ==================== 章节内部组件 ====================

const ChapterFContent: React.FC<{
  name: string;
  age?: number;
  subStyle: KidsSubStyle;
  orientation: ScreenOrientation;
  nameFontSize: number;
  nameColor?: string;
  showAge: boolean;
  blessingText: string;
  blessingFontSize: number;
}> = ({ name, age, subStyle, orientation, nameFontSize, nameColor, showAge, blessingText, blessingFontSize }) => {
  // 名字字号：用户指定值 + 横竖屏适配（横屏按比例缩小）
  const effectiveNameFontSize = orientation === 'portrait' ? nameFontSize : Math.round(nameFontSize * 0.75);

  return (
    <>
      <div style={{ position: 'absolute', top: '10%', width: '100%', zIndex: 20 }}>
        <BouncingName
          name={name}
          age={age}
          showAge={showAge}
          subStyle={subStyle}
          fontSize={effectiveNameFontSize}
          color={nameColor}
        />
      </div>

      <div style={{
        position: 'absolute',
        top: '30%',
        width: '100%',
        zIndex: 15,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <BlessingText
          text={blessingText}
          fontSize={orientation === 'portrait' ? blessingFontSize : Math.round(blessingFontSize * 0.75)}
          subStyle={subStyle}
        />
      </div>
    </>
  );
};

const ChapterGContent: React.FC<{
  age?: number;
  name?: string;
  birthdaySongSource?: string;
  birthdaySongVolume: number;
  photos: PhotoData[];
  subStyle: KidsSubStyle;
  durationInFrames: number;
  orientation: ScreenOrientation;
}> = ({ age, name, birthdaySongSource, birthdaySongVolume, photos, subStyle, durationInFrames, orientation }) => {
  return (
    <BirthdaySongScene
      age={age}
      name={name}
      durationInFrames={durationInFrames}
      birthdaySongSource={birthdaySongSource}
      birthdaySongVolume={birthdaySongVolume}
      photos={photos}
      subStyle={subStyle}
      orientation={orientation}
    />
  );
};

// ==================== 主组件 ====================

/**
 * 儿童生日祝福视频组合组件 v4.0
 *
 * 使用 StoryPanel + StoryChapter 架构，完全配置驱动
 *
 * 易用性保证：
 * - 所有对外参数均真实生效（message/blessingText/nameFontSize/nameColor/showAge/dreams…）
 * - 角色图片缺失时自动回退到内置卡通形象，开箱即渲染
 * - 视频总时长随照片数量自动伸缩（无照片 74s / 1 张 99s / 2 张以上 124s）
 */
export const KidsBirthdayComposition: React.FC<KidsBirthdayProps> = (props) => {
  const { fps } = useVideoConfig();

  const {
    name,
    age,
    subStyle = 'general',
    photos = [],
    dreams = ['astronaut', 'artist', 'racer'],
    orientation = 'portrait',
    cartoonElements,
    confettiLevel = 'high',
    musicEnabled = true,
    musicTrack = 'JoyfulChildren',
    birthdaySongSource,
    birthdaySongVolume = 0.6,
    seed,
    chapterList: customChapterList,
    // 样式参数（v4.0 起全部生效）
    nameFontSize = 120,
    nameColor,
    showAge = true,
    blessingText = '生日快乐',
    blessingFontSize = 60,
    message = '愿你每天开心成长',
    // 简化参数：祝福系列
    blessingSeries = 'journey_to_the_west',
    customCharacterImages,
    customCharacterVideos,
    // 嵌套参数
    marquee,
    watermark,
    radialBurst,
    foreground,
  } = props;

  const theme = getColorTheme(subStyle);

  // 获取祝福系列配置
  const seriesConfig = useMemo(() => getBlessingSeriesConfig(blessingSeries), [blessingSeries]);

  // 构建角色资源：
  // 1. 自定义资源优先（显式提供即信任）
  // 2. 默认资源若不在 public 资产清单中，自动回退到内置卡通形象（不产生 broken image）
  const characterResources = useMemo<CharacterResource[]>(() => {
    const defaultCharacters = seriesConfig.characters;

    const withFallback: CharacterResource[] = defaultCharacters.map((char) => {
      const imageAvailable = !!char.imageSrc && AVAILABLE_PUBLIC_ASSETS.has(char.imageSrc);
      const fallback = char.cartoonFallback;
      if (!imageAvailable && fallback) {
        return {
          type: char.type,
          name: char.name,
          greeting: char.greeting,
          series: fallback.series,
          imageSrc: undefined,
          videoSrc: char.videoSrc,
        };
      }
      return {
        type: char.type,
        name: char.name,
        greeting: char.greeting,
        series: 'image',
        imageSrc: char.imageSrc,
        videoSrc: char.videoSrc,
      };
    });

    // 自定义图片覆盖（按索引对位，缺省沿用回退结果）
    if (customCharacterImages && customCharacterImages.length > 0) {
      return withFallback.map((char, index) => ({
        ...char,
        series: 'image' as const,
        imageSrc: customCharacterImages[index] || char.imageSrc,
        videoSrc: customCharacterVideos?.[index] || char.videoSrc,
      }));
    }

    return withFallback;
  }, [seriesConfig, customCharacterImages, customCharacterVideos]);

  // 获取主要角色（用于开场和收尾模块）
  const mainCharacter = characterResources[0];

  // 陪伴角色：照片/梦想模块的小尺寸主持人，用台词把章节串成连续的故事
  const buildCompanion = (options: {
    speech: string;
    speechStartFrame: number;
    position: { horizontal: number; vertical: number };
    size?: number;
    direction?: 'left' | 'right' | 'bottom';
  }): StoryCharacterConfig | undefined => {
    if (!mainCharacter) return undefined;
    const isImage = mainCharacter.series === 'image' && !!mainCharacter.imageSrc;
    return {
      type: mainCharacter.type as ZodiacType | PetType | HeroType,
      series: (isImage ? 'image' : mainCharacter.series) as 'image' | 'zodiac' | 'pet' | 'hero',
      imageSrc: isImage ? mainCharacter.imageSrc : undefined,
      size: options.size ?? (orientation === 'portrait' ? 170 : 140),
      animate: true,
      entrance: {
        enabled: true,
        direction: options.direction ?? 'bottom',
        delay: 8,
        distance: 80,
        springConfig: { damping: 12, stiffness: 90 },
        horizontalPosition: options.position.horizontal,
        verticalPosition: options.position.vertical,
      },
      expression: 'happy',
      speechTimeline: [{
        text: options.speech,
        startFrame: options.speechStartFrame,
        animationType: 'scale' as const,
        bubbleColor: theme.secondary,
      }],
    };
  };

  // 构建面板级嵌套参数配置
  const panelBackground: NestedBackgroundProps = {
    type: 'gradient',
    gradient: theme.gradient,
    color: theme.background,
  };

  const panelOverlay: NestedOverlayProps = {
    opacity: 0.1,
  };

  const panelAudio: NestedAudioProps = {
    enabled: musicEnabled,
    source: `${musicTrack}.mp3`,
    volume: 0.5,
    loop: true,
  };

  // 构建章节配置
  const chapters = useMemo((): StoryChapterConfig[] => {
    const plan = computeContentPlan(photos.length, fps);
    const chapterList: StoryChapterConfig[] = [];

    // 模块 0：倒计时开场（魔法夜空紫罗兰，明亮不压抑）
    chapterList.push({
      id: '0_countdown',
      durationInFrames: plan.countdown,
      transition: { type: 'slideUp', durationInFrames: 14 },
      background: {
        type: 'gradient',
        gradient: 'linear-gradient(180deg, #2B2650 0%, #453B7A 55%, #5D50A8 100%)',
      },
      countdown: {
        enabled: true,
        type: 'number',
        startNumber: 3,
        durationPerNumber: fps,
        effectType: 'bounce',
        effectIntensity: 1.2,
        audio: {
          enabled: true,
          tickSound: 'countDown_common.mp3',
          endSound: 'countDown_game.mp3',
        },
        textStyle: {
          fontSize: orientation === 'portrait' ? 280 : 200,
          fontWeight: 900,
          color: '#FFFFFF',
          strokeColor: theme.primary,
          strokeWidth: 6,
          glowColor: theme.primary,
          glowIntensity: 0.8,
        },
        finalText: {
          enabled: true,
          text: '开始!',
          scaleMultiplier: 1.8,
          extraGlow: true,
          colorChange: theme.primary,
          durationInFrames: fps,
        },
        x: 0.5,
        y: 0.5,
      },
      magicEffects: {
        particles: {
          enabled: true,
          particleCount: 60,
          color: theme.primary,
          durationInFrames: 3 * fps,
        },
      },
      starFieldBackground: {
        enabled: true,
        starCount: 100,
      },
    });

    // 模块 A：魔法开场（4s：让入场弹簧完整落定，角色说开场白引出照片回忆）
    chapterList.push({
      id: 'A_magicOpening',
      durationInFrames: plan.opening,
      transition: { type: 'slideRight', durationInFrames: 16 },
      background: {
        type: 'gradient',
        gradient: 'linear-gradient(180deg, #2B2650 0%, #453B7A 60%, #5D50A8 100%)',
      },
      magicEffects: {
        blackScreen: {
          enabled: true,
          durationInFrames: 24,
          startFrame: 0,
        },
      },
      character: mainCharacter.series === 'image' ? {
        series: 'image',
        type: mainCharacter.type as ZodiacType | PetType | HeroType,
        size: 500,
        animate: true,
        imageSrc: mainCharacter.imageSrc!,
        entrance: {
          enabled: true,
          direction: 'bottom',
          delay: 20,
          distance: 100,
          springConfig: { damping: 12, stiffness: 80 },
          verticalPosition: 0.3,
          horizontalPosition: 0.5,
        },
        expression: 'happy',
        speechTimeline: [
          {
            text: `${name}，今天是个特别的日子！`,
            startFrame: 55,
            animationType: 'scale' as const,
            bubbleColor: theme.secondary,
          },
        ],
      } : {
        series: mainCharacter.series,
        type: mainCharacter.type as ZodiacType | PetType | HeroType,
        size: 500,
        animate: true,
        entrance: {
          enabled: true,
          direction: 'bottom',
          delay: 20,
          distance: 100,
          springConfig: { damping: 12, stiffness: 80 },
          verticalPosition: 0.3,
          horizontalPosition: 0.5,
        },
        expression: 'happy',
        speechTimeline: [
          {
            text: `${name}，今天是个特别的日子！`,
            startFrame: 55,
            animationType: 'scale' as const,
            bubbleColor: theme.secondary,
          },
        ],
      },
    });

    // 模块 C：照片互动 1（有照片才渲染；角色在右下角当"照片讲解员"）
    if (photos.length >= 1) {
      chapterList.push({
        id: 'C_photoInteraction1',
        durationInFrames: plan.photo1,
        transition: { type: 'slideLeft', durationInFrames: 16 },
        background: {
          type: 'gradient',
          gradient: theme.gradient,
        },
        overlay: {
          opacity: 0.05,
        },
        character: buildCompanion({
          speech: '一起看看你的照片吧！',
          speechStartFrame: 12,
          position: { horizontal: 0.82, vertical: 0.78 },
        }),
        plusEffects: [
          {
            effectType: 'textFirework',
            contentType: 'mixed',
            words: [blessingText, 'Happy Birthday', '快乐成长'],
            images: [],
            imageWeight: 0.3,
            blessingTypes: ['goldCoin', 'redPacket'],
            fontSize: 60,
            colors: [theme.primary, theme.secondary],
            glowColor: theme.primary,
            glowIntensity: 0.9,
            x: 0.5,
            y: 0.4,
            scale: 1,
            opacity: 0.9,
            animationSpeed: 2,
            seed: 12345,
          },
          {
            effectType: 'textRain',
            contentType: 'mixed',
            words: ['健康', '快乐', '成长', '平安'],
            images: [],
            imageWeight: 0.3,
            blessingTypes: ['goldCoin', 'star', 'redPacket'],
            fontSize: 60,
            colors: [theme.primary, theme.secondary],
            glowColor: theme.primary,
            glowIntensity: 0.6,
            x: 0.5,
            y: 0.5,
            scale: 1,
            opacity: 0.7,
            animationSpeed: 0.3,
            seed: 54321,
          },
        ],
        children: <PhotoFromMagicCircle photo={photos[0]} visible={true} orientation={orientation} />,
      });
    }

    // 模块 D：照片互动 2（需要 2 张及以上照片；角色在左下角继续讲解）
    if (photos.length >= 2) {
      // 构建透明视频配置（使用系列角色视频，仅使用确实存在的资源）
      const availableVideos = characterResources.filter(c => c.videoSrc && AVAILABLE_PUBLIC_ASSETS.has(c.videoSrc));
      const transparentVideoConfigs = availableVideos
        .slice(0, 5)
        .map((char, index) => ({
          src: char.videoSrc!,
          mode: 'greenScreen' as const,
          startFrame: index * 120,
          durationInFrames: index === 4 ? 144 : 120,
          scale: 0.6,
          x: 0.5,
          y: 0.7,
          flipX: index % 2 === 0,
        }));

      chapterList.push({
        id: 'D_photoInteraction2',
        durationInFrames: plan.photo2,
        transition: { type: 'slideUp', durationInFrames: 14 },
        background: {
          type: 'gradient',
          gradient: theme.gradient,
        },
        overlay: {
          opacity: 0.05,
        },
        character: buildCompanion({
          speech: '哇，更多精彩回忆！',
          speechStartFrame: 15,
          position: { horizontal: 0.16, vertical: 0.78 },
        }),
        children: <PhotoFromMagicCircle targetY={0.3} photo={photos[1]} visible={true} orientation={orientation} />,
        floatingElements: {
          enabled: true,
          type: 'hearts',
          count: 15,
          startFrame: 30,
          color: theme.secondary,
        },
        transparentVideos: transparentVideoConfigs.length > 0 ? transparentVideoConfigs : undefined,
      });
    }

    // 模块 F：成长庆祝高潮
    {
      // 获取第一个有视频的角色
      const videoCharacter = characterResources.find(c => c.videoSrc && AVAILABLE_PUBLIC_ASSETS.has(c.videoSrc));

      chapterList.push({
        id: 'F_growthCelebration',
        durationInFrames: plan.celebration,
        transition: { type: 'crossfade', durationInFrames: 16 },
        background: {
          type: 'gradient',
          gradient: theme.gradient,
        },
        confetti: {
          enabled: true,
          level: confettiLevel,
          primaryColor: theme.primary,
          secondaryColor: theme.secondary,
        },
        magicEffects: {
          firework: {
            enabled: true,
            x: 0.5,
            y: 0.3,
            particleCount: 50,
            color: theme.primary,
            triggerFrame: 20,
          },
        },
        transparentVideos: videoCharacter?.videoSrc ? [
          {
            src: videoCharacter.videoSrc,
            mode: 'greenScreen',
            scale: 0.6,
            x: 0.5,
            y: 0.7,
          },
        ] : undefined,
        children: (
          <ChapterFContent
            name={name}
            age={age}
            subStyle={subStyle}
            orientation={orientation}
            nameFontSize={nameFontSize}
            nameColor={nameColor}
            showAge={showAge}
            blessingText={blessingText}
            blessingFontSize={blessingFontSize}
          />
        ),
      });
    }

    // 模块 G：生日歌互动
    {
      // 构建庆祝角色（使用系列角色）
      const celebrationCharacters: StoryCharacterConfig[] = characterResources.slice(0, 4).map((char, index) => {
        const positions = [
          { direction: 'left', horizontalPosition: 0.15, verticalPosition: 0.1 },
          { direction: 'right', horizontalPosition: 0.85, verticalPosition: 0.1 },
          { direction: 'bottom', horizontalPosition: 0.15, verticalPosition: 0.65 },
          { direction: 'bottom', horizontalPosition: 0.85, verticalPosition: 0.65 },
        ];
        const greetings = ['生日快乐！', '天天开心！', '健康成长！', '万事如意！'];
        const bubbleColors = ['#FFD76A', '#FF8FA3', '#7EC8FF', '#B892FF'];
        const isImage = char.series === 'image' && !!char.imageSrc;

        return {
          type: char.type as ZodiacType | PetType | HeroType,
          series: (isImage ? 'image' : char.series) as 'image' | 'zodiac' | 'pet' | 'hero',
          imageSrc: isImage ? char.imageSrc : undefined,
          size: orientation === 'portrait' ? 120 : 100,
          animate: true,
          entrance: {
            enabled: true,
            direction: positions[index].direction as 'left' | 'right' | 'bottom',
            delay: index * 20,
            distance: 150,
            springConfig: { damping: 12, stiffness: 80 },
            horizontalPosition: positions[index].horizontalPosition,
            verticalPosition: positions[index].verticalPosition,
          },
          expressionTimeline: [
            { expression: 'happy', startFrame: 0 },
            { expression: 'excited', startFrame: 120 + index * 20 },
            { expression: 'waving', startFrame: 300 + index * 20 },
          ],
          speechTimeline: [
            {
              text: char.greeting || greetings[index],
              startFrame: 60 + index * 40,
              animationType: 'scale' as const,
              bubbleColor: bubbleColors[index],
            },
          ],
        };
      });

      chapterList.push({
        id: 'G_birthdaySong',
        durationInFrames: plan.birthdaySong,
        transition: { type: 'fade', durationInFrames: 18 },
        background: {
          type: 'gradient',
          gradient: theme.gradient,
        },
        // 多个角色围绕四周，先后入场为孩童庆祝
        characters: celebrationCharacters,
        confetti: {
          enabled: true,
          level: 'high',
          primaryColor: theme.primary,
          secondaryColor: theme.secondary,
        },
        magicEffects: {
          firework: {
            enabled: true,
            x: 0.5,
            y: 0.15,
            particleCount: 40,
            color: theme.primary,
            triggerFrame: 280,
          },
        },
        children: (
          <ChapterGContent
            age={age}
            name={name}
            birthdaySongSource={birthdaySongSource}
            birthdaySongVolume={birthdaySongVolume}
            photos={photos}
            subStyle={subStyle}
            durationInFrames={plan.birthdaySong}
            orientation={orientation}
          />
        ),
      });
    }

    // 模块 H：未来祝福（暮光紫，保留星空意象但不再近黑）
    chapterList.push({
      id: 'H_futureBlessing',
      durationInFrames: plan.futureBlessing,
      transition: { type: 'slideRight', durationInFrames: 14 },
      background: {
        type: 'gradient',
        gradient: 'linear-gradient(180deg, #3A2E6E 0%, #4A3F8C 55%, #5D4FA8 100%)',
      },
      character: mainCharacter.series === 'image' ? {
        type: mainCharacter.type as ZodiacType | PetType | HeroType,
        series: 'image',
        imageSrc: mainCharacter.imageSrc!,
        size: orientation === 'portrait' ? 500 : 450,
        animate: true,
        entrance: {
          enabled: true,
          direction: 'top',
          delay: 0,
          distance: 400,
          verticalPosition: 0.2,
          horizontalPosition: 0.5,
        },
        expression: 'happy',
      } : {
        type: mainCharacter.type as ZodiacType | PetType | HeroType,
        series: mainCharacter.series,
        size: orientation === 'portrait' ? 500 : 450,
        animate: true,
        entrance: {
          enabled: true,
          direction: 'top',
          delay: 0,
          distance: 400,
          verticalPosition: 0.2,
          horizontalPosition: 0.5,
        },
        expression: 'happy',
      },
      subtitles: [
        {
          text: mainCharacter.greeting || '未来的一年，我会一直守护你。',
          startFrame: 24,
          durationInFrames: 180,
          position: 'bottom',
          fontSize: 28,
          color: '#FFFFFF',
          backgroundColor: PRIMARY_COLORS.violet,
          backgroundOpacity: 0.8,
        },
      ],
      magicEffects: {
        shootingStar: {
          enabled: true,
          startX: 0.9,
          startY: 0.1,
          endX: 0.3,
          endY: 0.5,
          durationInFrames: 40,
        },
      },
      starFieldBackground: {
        enabled: true,
        starCount: 150,
      },
    });

    // 模块 I：梦想种子（dreams 参数在此生效；角色在底部为梦想"盖章"）
    chapterList.push({
      id: 'I_dreamSeeds',
      durationInFrames: plan.dreams,
      transition: { type: 'crossfade', durationInFrames: 14 },
      background: {
        type: 'gradient',
        gradient: theme.gradient,
      },
      character: buildCompanion({
        speech: '未来的你，一定了不起！',
        speechStartFrame: 60,
        position: { horizontal: 0.5, vertical: 0.82 },
        size: orientation === 'portrait' ? 150 : 120,
      }),
      floatingElements: {
        enabled: true,
        type: 'stars',
        count: 12,
        startFrame: 20,
        color: theme.primary,
      },
      children: (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <DreamBubblesScene dreams={dreams} visible={true} showText={true} />
        </div>
      ),
    });

    // 模块 J：温暖收尾（message 参数在此生效；日落暖光收束全片）
    chapterList.push({
      id: 'J_warmClosing',
      durationInFrames: plan.closing,
      transition: { type: 'fade', durationInFrames: 20 },
      background: {
        type: 'gradient',
        gradient: 'linear-gradient(180deg, #5D4FA8 0%, #9B7ED9 55%, #FFD76A 100%)',
      },
      confetti: {
        enabled: true,
        level: confettiLevel === 'low' ? 'low' : 'medium',
        primaryColor: theme.primary,
        secondaryColor: theme.secondary,
      },
      starFieldBackground: {
        enabled: true,
        starCount: 80,
      },
      children: (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          padding: '0 48px',
          textAlign: 'center',
        }}>
          <BouncingName
            name={name}
            showAge={false}
            subStyle={subStyle}
            fontSize={orientation === 'portrait' ? 72 : 56}
            color={nameColor}
          />
          <div style={{
            fontSize: orientation === 'portrait' ? 36 : 30,
            fontWeight: 600,
            color: '#FFFFFF',
            textShadow: `0 2px 12px rgba(0,0,0,0.4), 0 0 ${20}px ${theme.primary}55`,
            lineHeight: 1.5,
            letterSpacing: 2,
          }}>
            {message}
          </div>
        </div>
      ),
    });

    return mergeChapterConfigs(chapterList, customChapterList as StoryChapterConfig[] | undefined);
  }, [
    fps, photos, dreams, name, age, subStyle, orientation,
    confettiLevel, theme, nameFontSize, nameColor, showAge, blessingText, blessingFontSize, message,
    birthdaySongSource, birthdaySongVolume, customChapterList,
    characterResources, mainCharacter,
  ]);

  return (
    <StoryPanel
      chapters={chapters}
      defaultTransition={{ type: 'fade', durationInFrames: 12 }}
      chapterGap={0}
      background={panelBackground}
      overlay={panelOverlay}
      audio={panelAudio}
      marquee={marquee}
      watermark={watermark}
      radialBurst={radialBurst}
      foreground={foreground}
      renderPlusEffects={renderPlusEffects}
      overlayContent={
        cartoonElements ? (
          <CartoonElements
            defaultColor={theme.primary}
            elements={cartoonElements}
            seed={seed ?? 0}
          />
        ) : undefined
      }
    />
  );
};

export default KidsBirthdayComposition;
