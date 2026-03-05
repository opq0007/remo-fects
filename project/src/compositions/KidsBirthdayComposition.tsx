import React, { useMemo } from 'react';
import { useVideoConfig } from 'remotion';
import { z } from 'zod';
import { 
  StoryPanel,
  StoryChapterConfig,
  StoryCharacterConfig,
  StarFieldBackground,
} from '../../../effects/shared/index';
import {
  CartoonElements,
  PhotoFromMagicCircle,
  BirthdaySongScene,
  DreamBubblesScene,
  BouncingName,
  BlessingText,
} from '../components';
import { getColorTheme } from '../utils/colors';
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

// ==================== 章节内部组件（仅保留需要复杂动画的部分） ====================

/**
 * 模块 F：成长庆祝高潮 - 内部内容
 * 注：已通过配置实现烟花和彩带效果
 * 这里仅处理名字和祝福文字
 */
const ChapterFContent: React.FC<{
  name: string;
  age?: number;
  subStyle: KidsSubStyle;
  orientation: ScreenOrientation;
}> = ({ name, age, subStyle, orientation }) => {
  return (
    <>
      {/* 名字+年龄大字 */}
      <div style={{ position: 'absolute', top: '30%', width: '100%', zIndex: 20 }}>
        <BouncingName
          name={name}
          age={age}
          showAge={true}
          subStyle={subStyle}
          fontSize={orientation === 'portrait' ? 90 : 70}
        />
      </div>
      
      {/* 生日快乐文字 */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
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

/**
 * 模块 G：生日歌 - 内部内容
 * 保留完整场景组件，因为是复杂的交互场景
 */
const ChapterGContent: React.FC<{
  age?: number;
  name?: string;
  birthdaySongSource?: string;
  birthdaySongVolume: number;
  photos: PhotoData[];
  subStyle: KidsSubStyle;
  durationInFrames: number;
}> = ({ age, name, birthdaySongSource, birthdaySongVolume, photos, subStyle, durationInFrames }) => {
  return (
    <BirthdaySongScene
      age={age}
      name={name}
      durationInFrames={durationInFrames}
      birthdaySongSource={birthdaySongSource}
      birthdaySongVolume={birthdaySongVolume}
      photos={photos}
      subStyle={subStyle}
    />
  );
};

// ==================== 主组件 ====================

/**
 * 儿童生日祝福视频组合组件 v3.2
 * 
 * 使用 StoryPanel + StoryChapter 架构，完全配置驱动
 * 
 * 重构要点：
 * - 角色入场动画：使用 character.entrance 配置
 * - 对话时序：使用 character.speechTimeline 配置
 * - 表情变化：使用 character.expressionTimeline 配置
 * - 黑屏过渡：使用 magicEffects.blackScreen 配置
 * - 文字元素：使用 textElements 配置
 * - 漂浮元素：使用 floatingElements 配置
 * - 照片展示：使用 photoDisplay 配置
 * - 星空背景：使用 starFieldBackground 配置
 * 
 * 保留的 children 组件：
 * - 复杂场景组件（BirthdaySongScene、DreamBubblesScene）
 * - 复杂文字效果（BouncingName、BlessingText）
 */
export const KidsBirthdayComposition: React.FC<KidsBirthdayProps> = (props) => {
  const { fps } = useVideoConfig();
  
  // 解构属性
  const {
    name,
    age,
    videoVersion = '120s',
    duration,
    subStyle = 'general',
    characterSeries = 'zodiac',
    characterType = 'tiger',
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
    // 背景参数
    backgroundType = 'gradient',
    backgroundColor,
    backgroundGradient,
    backgroundSource,
    backgroundVideoLoop,
    backgroundVideoMuted,
    // 遮罩参数
    overlayColor,
    overlayOpacity = 0.1,
    // 音频参数
    audioEnabled,
    audioSource,
    audioVolume,
    audioLoop = true,
  } = props;
  
  const theme = getColorTheme(subStyle);
  
  // 计算时长
  const effectiveDuration = duration ?? getDurationByVersion(videoVersion);
  
  // 确定背景
  const effectiveGradient = backgroundGradient || theme.gradient;
  const effectiveBackgroundColor = backgroundColor || theme.background;
  
  // 音频配置
  const effectiveAudioEnabled = audioEnabled;
  const effectiveAudioSource = audioSource || `${musicTrack}.mp3`;
  
  // 类型断言
  const typedCharacterType = characterType as ZodiacType & PetType & HeroType;
  
  // 构建章节配置
  const chapters = useMemo((): StoryChapterConfig[] => {
    const chapterList: StoryChapterConfig[] = [];
    const modules = getModulesByVersion(videoVersion);
    
    // 模块 A：魔法开场（2秒 = 48帧）
    // 完全配置驱动：黑屏过渡 + 角色入场 + 对话时序
    if (modules.includes('A')) {
      chapterList.push({
        id: 'A_magicOpening',
        durationInFrames: 2 * fps,
        backgroundType: 'color',
        backgroundColor: '#0a0a20',
        magicEffects: {
          particles: {
            enabled: true,
            particleCount: 80,
            color: PRIMARY_COLORS.violet,
            durationInFrames: 48,
          },
          blackScreen: {
            enabled: true,
            durationInFrames: 24,
            startFrame: 0,
          },
        },
        character: {
          series: characterSeries,
          type: typedCharacterType,
          size: 180,
          animate: true,
          // 入场动画配置
          entrance: {
            enabled: true,
            direction: 'bottom',
            delay: 20,
            distance: 100,
            springConfig: { damping: 12, stiffness: 80 },
            verticalPosition: 0.45,
            horizontalPosition: 0.5,
          },
          // 对话时序配置
          speechTimeline: [
            {
              text: `亲爱的${name}小朋友——\n生日快乐呀！`,
              startFrame: 35,
              animationType: 'scale',
              bubbleColor: '#FFFFFF',
            },
          ],
          // 表情配置
          expression: 'happy',
        },
      });
    }
    
    // 模块 B：角色入场（10秒 = 240帧）
    // 完全配置驱动：角色入场 + 自我介绍 + 名字弹跳
    if (modules.includes('B')) {
      chapterList.push({
        id: 'B_characterEntrance',
        durationInFrames: 10 * fps,
        backgroundType: 'gradient',
        backgroundGradient: effectiveGradient,
        magicEffects: {
          balloonBurst: {
            enabled: true,
            x: 0.5,
            y: 0.5,
            balloonCount: 12,
            triggerFrame: 192,
          },
          whiteFlash: {
            enabled: true,
            durationInFrames: 20,
            triggerFrame: 200,
          },
        },
        character: {
          series: characterSeries,
          type: typedCharacterType,
          size: orientation === 'portrait' ? 180 : 150,
          animate: true,
          // 入场动画配置
          entrance: {
            enabled: true,
            direction: 'bottom',
            delay: 0,
            distance: 200,
            springConfig: { damping: 12, stiffness: 80 },
            verticalPosition: 0.45,
            horizontalPosition: 0.5,
          },
          // 对话时序配置（第3-5秒显示介绍）
          speechTimeline: [
            {
              text: '我是你的生肖守护神小老虎！',
              startFrame: 72,
              endFrame: 120,
              animationType: 'scale',
            },
          ],
          // 表情变化时序（介绍时挥手）
          expressionTimeline: [
            { expression: 'happy', startFrame: 0 },
            { expression: 'waving', startFrame: 72 },
            { expression: 'happy', startFrame: 120 },
          ],
        },
        // 名字弹跳文字
        textElements: [
          {
            type: 'name',
            showAge: false,
            fontSize: orientation === 'portrait' ? 100 : 80,
            color: theme.primary,
            verticalPosition: 0.2,
            startFrame: 120,
            animationType: 'bounce',
          },
        ],
        name,
        age,
        subStyle,
        orientation,
      });
    }
    
    // 模块 C：照片互动1（13秒 = 312帧）
    // 复杂魔法圆环效果，保留自定义组件
    if (modules.includes('C') && photos[0]) {
      chapterList.push({
        id: 'C_photoInteraction1',
        durationInFrames: 13 * fps,
        backgroundType: 'gradient',
        backgroundGradient: effectiveGradient,
        overlayOpacity: 0.05,
        children: <PhotoFromMagicCircle photo={photos[0]} visible={true} orientation={orientation} />,
      });
    }
    
    // 模块 D：照片互动2（13秒 = 312帧）
    // 完全配置驱动
    if (modules.includes('D') && photos[1]) {
      chapterList.push({
        id: 'D_photoInteraction2',
        durationInFrames: 13 * fps,
        backgroundType: 'gradient',
        backgroundGradient: effectiveGradient,
        overlayOpacity: 0.05,
        photoDisplay: {
          enabled: true,
          photo: photos[1],
          animationType: 'flyIn',
          showCaption: true,
        },
        floatingElements: {
          enabled: true,
          type: 'hearts',
          count: 15,
          startFrame: 30,
          color: '#FF6B6B',
        },
      });
    }
    
    // 模块 E：照片互动3（12秒 = 288帧）
    // 完全配置驱动
    if (modules.includes('E') && photos[2]) {
      chapterList.push({
        id: 'E_photoInteraction3',
        durationInFrames: 12 * fps,
        backgroundType: 'gradient',
        backgroundGradient: effectiveGradient,
        overlayOpacity: 0.05,
        photoDisplay: {
          enabled: true,
          photo: photos[2],
          animationType: 'rotateIn',
          showCaption: false,
        },
      });
    }
    
    // 模块 F：成长庆祝高潮（10秒 = 240帧）
    if (modules.includes('F')) {
      chapterList.push({
        id: 'F_growthCelebration',
        durationInFrames: 10 * fps,
        backgroundType: 'gradient',
        backgroundGradient: effectiveGradient,
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
    
    // 模块 G：生日歌互动（30秒 = 720帧）
    // 复杂场景组件，保留 children
    if (modules.includes('G')) {
      chapterList.push({
        id: 'G_birthdaySong',
        durationInFrames: 30 * fps,
        backgroundType: 'gradient',
        backgroundGradient: effectiveGradient,
        children: (
          <ChapterGContent
            age={age}
            name={name}
            birthdaySongSource={birthdaySongSource}
            birthdaySongVolume={birthdaySongVolume}
            photos={photos}
            subStyle={subStyle}
            durationInFrames={30 * fps}
          />
        ),
      });
    }
    
    // 模块 H：未来祝福（15秒 = 360帧）
    // 完全配置驱动
    if (modules.includes('H')) {
      chapterList.push({
        id: 'H_futureBlessing',
        durationInFrames: 15 * fps,
        backgroundType: 'gradient',
        backgroundGradient: 'linear-gradient(180deg, #0a0a2e 0%, #1a1a4e 50%, #2a2a6e 100%)',
        character: {
          series: characterSeries,
          type: typedCharacterType,
          size: orientation === 'portrait' ? 180 : 150,
          animate: true,
          // 入场动画（静态居中）
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
    
    // 模块 I：梦想种子（10秒 = 240帧）
    // 复杂场景组件，保留 children
    if (modules.includes('I')) {
      chapterList.push({
        id: 'I_dreamSeeds',
        durationInFrames: 10 * fps,
        backgroundType: 'gradient',
        backgroundGradient: 'linear-gradient(180deg, #1a1a4e 0%, #2a2a6e 50%, #3a3a8e 100%)',
        children: (
          <DreamBubblesScene
            dreams={dreams}
            visible={true}
            showText={true}
            text="你的梦想一定会发光！"
          />
        ),
      });
    }
    
    // 模块 J：温暖收尾（5秒 = 120帧）
    // 完全配置驱动
    if (modules.includes('J')) {
      chapterList.push({
        id: 'J_warmClosing',
        durationInFrames: 5 * fps,
        backgroundType: 'gradient',
        backgroundGradient: effectiveGradient,
        character: {
          series: characterSeries,
          type: typedCharacterType,
          size: orientation === 'portrait' ? 180 : 150,
          animate: true,
          entrance: {
            enabled: true,
            direction: 'bottom',
            distance: 0,
            verticalPosition: 0.6,
            horizontalPosition: 0.5,
          },
          expression: 'waving',
        },
        subtitles: [
          {
            text: `生日快乐，${name}！`,
            startFrame: 30,
            durationInFrames: 90,
            position: 'top',
            fontSize: 40,
            color: PRIMARY_COLORS.creamYellow,
            animationType: 'bounce',
          },
        ],
        textElements: [
          {
            type: 'custom',
            text: '✨ Remo-Fects ✨',
            fontSize: 24,
            color: PRIMARY_COLORS.violet,
            verticalPosition: 0.95,
            startFrame: 60,
            animationType: 'fade',
          },
        ],
        name,
        age,
        subStyle,
        orientation,
      });
    }
    
    return chapterList;
  }, [
    videoVersion, fps, photos, dreams, name, age, subStyle, orientation, 
    confettiLevel, theme, characterSeries, typedCharacterType, effectiveGradient,
    birthdaySongSource, birthdaySongVolume
  ]);
  
  return (
    <StoryPanel
      chapters={chapters}
      defaultTransition={{ type: 'fade', durationInFrames: 12 }}
      chapterGap={0}
      backgroundType={backgroundType}
      backgroundColor={effectiveBackgroundColor}
      backgroundGradient={effectiveGradient}
      backgroundSource={backgroundSource}
      backgroundVideoLoop={backgroundVideoLoop}
      backgroundVideoMuted={backgroundVideoMuted}
      overlayColor={overlayColor}
      overlayOpacity={overlayOpacity}
      audioEnabled={effectiveAudioEnabled}
      audioSource={effectiveAudioSource}
      audioVolume={audioVolume}
      audioLoop={audioLoop}
      // 面板级覆盖内容：卡通元素
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