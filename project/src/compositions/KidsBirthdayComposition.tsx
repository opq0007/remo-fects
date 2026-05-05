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
  getModules, 
  getDuration,
  getBlessingSeriesConfig,
} from '../schemas';

export type KidsBirthdayProps = z.infer<typeof KidsBirthdaySchema>;

// ==================== 章节内部组件 ====================

const ChapterFContent: React.FC<{
  name: string;
  age?: number;
  subStyle: KidsSubStyle;
  orientation: ScreenOrientation;
}> = ({ name, age, subStyle, orientation }) => {
  return (
    <>
      <div style={{ position: 'absolute', top: '10%', width: '100%', zIndex: 20 }}>
        <BouncingName
          name={name}
          age={age}
          showAge={true}
          subStyle={subStyle}
          fontSize={orientation === 'portrait' ? 90 : 70}
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
          text="生日快乐"
          fontSize={orientation === 'portrait' ? 50 : 40}
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
 * 儿童生日祝福视频组合组件 v3.3
 * 
 * 使用 StoryPanel + StoryChapter 架构，完全配置驱动
 * 使用嵌套参数结构
 */
export const KidsBirthdayComposition: React.FC<KidsBirthdayProps> = (props) => {
  const { fps } = useVideoConfig();
  
  const {
    name,
    age,
    duration = getDuration(),
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
  
  // 构建角色资源（自定义资源覆盖默认配置）
  const characterResources = useMemo(() => {
    const defaultCharacters = seriesConfig.characters;
    
    // 如果提供了自定义图片，覆盖默认配置
    if (customCharacterImages && customCharacterImages.length > 0) {
      return defaultCharacters.map((char, index) => ({
        ...char,
        imageSrc: customCharacterImages[index] || char.imageSrc,
        videoSrc: customCharacterVideos?.[index] || char.videoSrc,
      }));
    }
    
    return defaultCharacters;
  }, [seriesConfig, customCharacterImages, customCharacterVideos]);
  
  // 获取主要角色（用于开场和模块A）
  const mainCharacter = characterResources[0];
  
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
    const modules = getModules();
    const chapterList: StoryChapterConfig[] = [];
    
    // 模块 0：倒计时开场
    chapterList.push({
      id: '0_countdown',
      durationInFrames: 4 * fps,
      background: {
        type: 'gradient',
        gradient: 'linear-gradient(180deg, #0a0a20 0%, #1a1a3e 50%, #2a2a5e 100%)',
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
          glowIntensity: 1.5,
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
    
    // 模块 A：魔法开场
    if (modules.includes('A')) {
      chapterList.push({
        id: 'A_magicOpening',
        durationInFrames: 2 * fps,
        background: {
          type: 'color',
          color: '#0a0a20',
        },
        magicEffects: {
          // particles: {
          //   enabled: true,
          //   particleCount: 80,
          //   color: PRIMARY_COLORS.violet,
          //   durationInFrames: 48,
          // },
          blackScreen: {
            enabled: true,
            durationInFrames: 24,
            startFrame: 0,
          },
        },
        character: {
          series: "image",
          type: mainCharacter?.type as ZodiacType | PetType | HeroType | undefined,
          size: 500,
          animate: true,
          imageSrc: mainCharacter?.imageSrc || "pic/孙悟空.png",
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
        },
      });
    }
    
    // 模块 F：成长庆祝高潮
    if (modules.includes('F')) {
      // 获取第一个有视频的角色
      const videoCharacter = characterResources.find(c => c.videoSrc);
      
      chapterList.push({
        id: 'F_growthCelebration',
        durationInFrames: 10 * fps,
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
          />
        ),
      });
    }

    // 模块 C：照片互动1
    if (modules.includes('C') && photos.length > 0) {
      chapterList.push({
        id: 'C_photoInteraction1',
        durationInFrames: 30 * fps,
        background: {
          type: 'gradient',
          gradient: theme.gradient,
        },
        overlay: {
          opacity: 0.05,
        },
        plusEffects: [
          {
            effectType: 'textFirework',
            contentType: 'mixed',
            words: ['生日快乐', 'Happy Birthday', '快乐成长'],
            images: [],
            imageWeight: 0.3,
            blessingTypes: ['goldCoin', 'redPacket'],
            fontSize: 60,
            colors: ['#FFD700', '#FF6B6B'],
            glowColor: '#FFD700',
            glowIntensity: 1.2,
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
            colors: ['#FFD700', '#FF6B6B'],
            glowColor: '#FFD700',
            glowIntensity: 0.8,
            x: 0.5,
            y: 0.5,
            scale: 1,
            opacity: 0.7,
            animationSpeed: 0.3,
            seed: 54321,
          },
        ],
        children: <PhotoFromMagicCircle photo={photos[0 % photos.length]} visible={true} orientation={orientation} />,
      });
    }
    
    // 模块 D：照片互动2
    if (modules.includes('D') && photos.length > 0) {
      // 构建透明视频配置（使用系列角色视频）
      const transparentVideoConfigs = characterResources
        .filter(c => c.videoSrc)
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
        durationInFrames: 30 * fps,
        background: {
          type: 'gradient',
          gradient: theme.gradient,
        },
        overlay: {
          opacity: 0.05,
        },
        children: <PhotoFromMagicCircle targetY={0.3}  photo={photos[1 % photos.length]} visible={true} orientation={orientation} />,
        floatingElements: {
          enabled: true,
          type: 'hearts',
          count: 15,
          startFrame: 30,
          color: '#FF6B6B',
        },
        transparentVideos: transparentVideoConfigs.length > 0 ? transparentVideoConfigs : undefined,
      });
    }
    
    // 模块 G：生日歌互动
    if (modules.includes('G')) {
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
        
        return {
          type: char.type as ZodiacType | PetType | HeroType,
          series: 'image' as const,
          imageSrc: char.imageSrc,
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
        durationInFrames: 35 * fps,
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
            triggerFrame: 400,
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
            durationInFrames={35 * fps}
            orientation={orientation}
          />
        ),
      });
    }
    
    // 模块 H：未来祝福
    if (modules.includes('H')) {
      chapterList.push({
        id: 'H_futureBlessing',
        durationInFrames: 10 * fps,
        background: {
          type: 'gradient',
          gradient: 'linear-gradient(180deg, #0a0a2e 0%, #1a1a4e 50%, #2a2a6e 100%)',
        },
        character: {
          type: mainCharacter?.type as ZodiacType | PetType | HeroType | undefined,
          series: 'image',
          imageSrc: mainCharacter?.imageSrc || "pic/孙悟空.png",            
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
            text: mainCharacter?.greeting || '未来的一年，我会一直守护你。',
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
    }
    
    return mergeChapterConfigs(chapterList, customChapterList as StoryChapterConfig[] | undefined);
  }, [
    fps, photos, dreams, name, age, subStyle, orientation, 
    confettiLevel, theme,
    birthdaySongSource, birthdaySongVolume, customChapterList,
    characterResources, blessingSeries, mainCharacter,
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