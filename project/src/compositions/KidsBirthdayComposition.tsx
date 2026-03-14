import React, { useMemo } from 'react';
import { useVideoConfig } from 'remotion';
import { z } from 'zod';
import { 
  StoryPanel,
  StoryChapterConfig,
  NestedBackgroundProps,
  NestedOverlayProps,
  NestedAudioProps,
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
  CharacterSeries,
  ZodiacType,
  PetType,
  HeroType,
  PhotoData,
  ScreenOrientation,
  PRIMARY_COLORS,
} from '../types';
import { 
  KidsBirthdaySchema, 
  getModulesByVersion, 
  getDurationByVersion 
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
    videoVersion = '120s',
    duration,
    subStyle = 'general',
    characterSeries = 'zodiac',
    characterType = 'tiger',
    characterImageSrc,
    photos = [],
    dreams = ['astronaut', 'artist', 'racer'],
    orientation = 'portrait',
    cartoonElements,
    confettiLevel = 'high',
    musicEnabled = true,
    musicTrack = 'kids_party_01',
    birthdaySongSource,
    birthdaySongVolume = 0.6,
    seed,
    chapterList: customChapterList,
  } = props;
  
  const theme = getColorTheme(subStyle);
  
  // 计算时长
  const effectiveDuration = duration ?? getDurationByVersion(videoVersion);
  
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
  
  // 类型断言
  const typedCharacterType = characterType as ZodiacType & PetType & HeroType;
  
  // 构建章节配置
  const chapters = useMemo((): StoryChapterConfig[] => {
    const modules = getModulesByVersion(videoVersion);
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
    
    // // 模块 A：魔法开场
    // if (modules.includes('A')) {
    //   chapterList.push({
    //     id: 'A_magicOpening',
    //     durationInFrames: 2 * fps,
    //     background: {
    //       type: 'color',
    //       color: '#0a0a20',
    //     },
    //     magicEffects: {
    //       particles: {
    //         enabled: true,
    //         particleCount: 80,
    //         color: PRIMARY_COLORS.violet,
    //         durationInFrames: 48,
    //       },
    //       blackScreen: {
    //         enabled: true,
    //         durationInFrames: 24,
    //         startFrame: 0,
    //       },
    //     },
    //     character: {
    //       series: characterSeries,
    //       type: typedCharacterType,
    //       size: 180,
    //       animate: true,
    //       imageSrc: characterImageSrc,
    //       entrance: {
    //         enabled: true,
    //         direction: 'bottom',
    //         delay: 20,
    //         distance: 100,
    //         springConfig: { damping: 12, stiffness: 80 },
    //         verticalPosition: 0.45,
    //         horizontalPosition: 0.5,
    //       },
    //       speechTimeline: [
    //         {
    //           text: `亲爱的${name}小朋友——\n生日快乐呀！`,
    //           startFrame: 35,
    //           animationType: 'scale',
    //           bubbleColor: '#FFFFFF',
    //         },
    //       ],
    //       expression: 'happy',
    //     },
    //   });
    // }
    
    // // 模块 B：角色入场
    // if (modules.includes('B')) {
    //   chapterList.push({
    //     id: 'B_characterEntrance',
    //     durationInFrames: 10 * fps,
    //     background: {
    //       type: 'gradient',
    //       gradient: theme.gradient,
    //     },
    //     magicEffects: {
    //       balloonBurst: {
    //         enabled: true,
    //         x: 0.5,
    //         y: 0.5,
    //         balloonCount: 12,
    //         triggerFrame: 192,
    //       },
    //       whiteFlash: {
    //         enabled: true,
    //         durationInFrames: 20,
    //         triggerFrame: 200,
    //       },
    //     },
    //     character: {
    //       series: characterSeries,
    //       type: typedCharacterType,
    //       size: orientation === 'portrait' ? 180 : 150,
    //       animate: true,
    //       imageSrc: characterImageSrc,
    //       entrance: {
    //         enabled: true,
    //         direction: 'bottom',
    //         delay: 0,
    //         distance: 200,
    //         springConfig: { damping: 12, stiffness: 80 },
    //         verticalPosition: 0.45,
    //         horizontalPosition: 0.5,
    //       },
    //       speechTimeline: [
    //         {
    //           text: '我是你的生肖守护神小老虎！',
    //           startFrame: 72,
    //           endFrame: 120,
    //           animationType: 'scale',
    //         },
    //       ],
    //       expressionTimeline: [
    //         { expression: 'happy', startFrame: 0 },
    //         { expression: 'waving', startFrame: 72 },
    //         { expression: 'happy', startFrame: 120 },
    //       ],
    //     },
    //     textElements: [
    //       {
    //         type: 'name',
    //         showAge: false,
    //         fontSize: orientation === 'portrait' ? 100 : 80,
    //         color: theme.primary,
    //         verticalPosition: 0.2,
    //         startFrame: 120,
    //         animationType: 'bounce',
    //       },
    //     ],
    //     name,
    //     age,
    //     subStyle,
    //     orientation,
    //   });
    // }
 // 模块 F：成长庆祝高潮
    if (modules.includes('F')) {
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
        transparentVideos: [
          {
            src: '孙悟空.mp4',
            mode: 'greenScreen',
            scale: 0.6,
            x: 0.5,
            y: 0.7,
          },
        ],
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
        // photoDisplay: {
        //   enabled: true,
        //   photo: photos[1 % photos.length],
        //   animationType: 'flyIn',
        //   frameType: 'magic',
        //   frameColor: theme.primary,
        // },
        floatingElements: {
          enabled: true,
          type: 'hearts',
          count: 15,
          startFrame: 30,
          color: '#FF6B6B',
        },
        transparentVideos: [
          {
            src: '孙悟空.mp4',
            mode: 'greenScreen',
            startFrame: 0,
            durationInFrames:120,
            scale: 0.6,
            x: 0.5,
            y: 0.7,
            flipX:true,
          },
          {
            src: '唐僧.mp4',
            mode: 'greenScreen',
            startFrame: 120,
            durationInFrames:120,
            scale: 0.6,
            x: 0.5,
            y: 0.7,
          },
          {
            src: '猪八戒.mp4',
            mode: 'greenScreen',
            startFrame: 240,
            durationInFrames:120,
            scale: 0.6,
            x: 0.5,
            y: 0.7,
            flipX:true,
          },
          {
            src: '沙和尚.mp4',
            mode: 'greenScreen',
            startFrame: 360,
            durationInFrames: 120,
            scale: 0.6,
            x: 0.5,
            y: 0.7,
            flipX:true,
          },
          {
            src: '白龙马.mp4',
            mode: 'greenScreen',
            startFrame: 480,
            durationInFrames: 144,
            scale: 0.6,
            x: 0.5,
            y: 0.7,
            flipX:true,           
          },
        ],
      });
    }
    
    // 模块 G：生日歌互动
    if (modules.includes('G')) {
      chapterList.push({
        id: 'G_birthdaySong',
        durationInFrames: 35 * fps,
        background: {
          type: 'gradient',
          gradient: theme.gradient,
        },
        // 多个角色围绕四周，先后入场为孩童庆祝
        characters: [
          // 角色1：左上角 - 小老虎（位置调整避免遮挡照片）
          {
            series: 'zodiac',
            type: 'tiger',
            size: orientation === 'portrait' ? 120 : 100,
            animate: true,
            entrance: {
              enabled: true,
              direction: 'left',
              delay: 0,
              distance: 150,
              springConfig: { damping: 12, stiffness: 80 },
              horizontalPosition: 0.15,
              verticalPosition: 0.1,
            },
            expressionTimeline: [
              { expression: 'happy', startFrame: 0 },
              { expression: 'excited', startFrame: 120 },
              { expression: 'waving', startFrame: 300 },
            ],
            speechTimeline: [
              {
                text: '生日快乐！',
                startFrame: 60,
                animationType: 'scale',
                bubbleColor: '#FFD76A',
              },
            ],
          },
          // 角色2：右上角 - 小兔子
          {
            series: 'zodiac',
            type: 'rabbit',
            size: orientation === 'portrait' ? 120 : 100,
            animate: true,
            entrance: {
              enabled: true,
              direction: 'right',
              delay: 20,
              distance: 150,
              springConfig: { damping: 12, stiffness: 80 },
              horizontalPosition: 0.85,
              verticalPosition: 0.1,
            },
            expressionTimeline: [
              { expression: 'happy', startFrame: 0 },
              { expression: 'excited', startFrame: 140 },
              { expression: 'waving', startFrame: 320 },
            ],
            speechTimeline: [
              {
                text: '天天开心！',
                startFrame: 100,
                animationType: 'scale',
                bubbleColor: '#FF8FA3',
              },
            ],
          },
          // 角色3：左下角 - 小龙（位置调整到更底部）
          {
            series: 'zodiac',
            type: 'dragon',
            size: orientation === 'portrait' ? 120 : 100,
            animate: true,
            entrance: {
              enabled: true,
              direction: 'bottom',
              delay: 40,
              distance: 150,
              springConfig: { damping: 12, stiffness: 80 },
              horizontalPosition: 0.15,
              verticalPosition: 0.65,
            },
            expressionTimeline: [
              { expression: 'happy', startFrame: 0 },
              { expression: 'excited', startFrame: 160 },
              { expression: 'waving', startFrame: 340 },
            ],
            speechTimeline: [
              {
                text: '健康成长！',
                startFrame: 140,
                animationType: 'scale',
                bubbleColor: '#7EC8FF',
              },
            ],
          },
          // 角色4：右下角 - 小蛇
          {
            series: 'zodiac',
            type: 'snake',
            size: orientation === 'portrait' ? 120 : 100,
            animate: true,
            entrance: {
              enabled: true,
              direction: 'bottom',
              delay: 60,
              distance: 150,
              springConfig: { damping: 12, stiffness: 80 },
              horizontalPosition: 0.85,
              verticalPosition: 0.65,
            },
            expressionTimeline: [
              { expression: 'happy', startFrame: 0 },
              { expression: 'excited', startFrame: 180 },
              { expression: 'waving', startFrame: 360 },
            ],
            speechTimeline: [
              {
                text: '万事如意！',
                startFrame: 180,
                animationType: 'scale',
                bubbleColor: '#B892FF',
              },
            ],
          },
        ],
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
            durationInFrames={30 * fps}
            orientation={orientation}
          />
        ),
      });
    }
    
    // 模块 H：未来祝福
    if (modules.includes('H')) {
      chapterList.push({
        id: 'H_futureBlessing',
        durationInFrames: 15 * fps,
        background: {
          type: 'gradient',
          gradient: 'linear-gradient(180deg, #0a0a2e 0%, #1a1a4e 50%, #2a2a6e 100%)',
        },
        character: {
          series: characterSeries,
          type: typedCharacterType,
          size: orientation === 'portrait' ? 180 : 150,
          animate: true,
          imageSrc: characterImageSrc,
          entrance: {
            enabled: true,
            direction: 'bottom',
            delay: 0,
            distance: 0,
            verticalPosition: 0.4,
            horizontalPosition: 0.5,
          },
          expression: 'happy',
        },
        subtitles: [
          {
            text: '未来的一年，我会一直守护你。',
            startFrame: 60,
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
    
    // // 模块 J：温暖收尾
    // if (modules.includes('J')) {
    //   chapterList.push({
    //     id: 'J_warmClosing',
    //     durationInFrames: 5 * fps,
    //     background: {
    //       type: 'gradient',
    //       gradient: theme.gradient,
    //     },
    //     character: {
    //       series: characterSeries,
    //       type: typedCharacterType,
    //       size: orientation === 'portrait' ? 180 : 150,
    //       animate: true,
    //       imageSrc: characterImageSrc,
    //       entrance: {
    //         enabled: true,
    //         direction: 'bottom',
    //         distance: 0,
    //         verticalPosition: 0.6,
    //         horizontalPosition: 0.5,
    //       },
    //       expression: 'waving',
    //     },
    //     subtitles: [
    //       {
    //         text: `生日快乐，${name}！`,
    //         startFrame: 30,
    //         durationInFrames: 90,
    //         position: 'top',
    //         fontSize: 40,
    //         color: PRIMARY_COLORS.creamYellow,
    //         animationType: 'bounce',
    //       },
    //     ],
    //     textElements: [
    //       {
    //         type: 'custom',
    //         text: '✨ Remo-Fects ✨',
    //         fontSize: 24,
    //         color: PRIMARY_COLORS.violet,
    //         verticalPosition: 0.95,
    //         startFrame: 60,
    //         animationType: 'fade',
    //       },
    //     ],
    //     name,
    //     age,
    //     subStyle,
    //     orientation,
    //   });
    // }
    
    return mergeChapterConfigs(chapterList, customChapterList as StoryChapterConfig[] | undefined);
  }, [
    videoVersion, fps, photos, dreams, name, age, subStyle, orientation, 
    confettiLevel, theme, characterSeries, typedCharacterType,
    birthdaySongSource, birthdaySongVolume, characterImageSrc, customChapterList
  ]);
  
  return (
    <StoryPanel
      chapters={chapters}
      defaultTransition={{ type: 'fade', durationInFrames: 12 }}
      chapterGap={0}
      background={panelBackground}
      overlay={panelOverlay}
      audio={panelAudio}
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