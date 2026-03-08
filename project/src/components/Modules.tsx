import React from 'react';
import { 
  AbsoluteFill, 
  useCurrentFrame, 
  useVideoConfig,
  Sequence,
  interpolate,
  spring
} from 'remotion';
import { 
  ModuleType, 
  MODULE_CONFIGS, 
  CharacterSeries,
  ZodiacType,
  PetType,
  HeroType,
  PhotoData,
  DreamJob,
  ScreenOrientation,
  KidsSubStyle,
  PRIMARY_COLORS
} from '../types';
import { getColorTheme } from '../utils/colors';

// ==================== 从 shared 导入迁移后的公共组件 ====================
import { 
  Character, 
  CharacterWithSpeech,
  SpeechBubble 
} from '../../../effects/shared/components/Character';
import { 
  MagicParticles, 
  WhiteFlashTransition,
  Firework,
  BalloonBurst,
  ShootingStar,
  StarFieldBackground
} from '../../../effects/shared/components/MagicEffects';
import { ConfettiBurst } from '../../../effects/shared/components/ConfettiBurst';

// ==================== 本地组件 ====================
import { 
  PhotoCard, 
  PhotoFromMagicCircle, 
  FloatingHearts, 
  AgeBalloon,
  PhotoInteractionScene 
} from './PhotoInteraction';
import { BirthdaySongScene } from './BirthdaySong';
import { DreamBubblesScene } from './DreamBubbles';
import { BouncingName, BlessingText, AgeCelebration } from './index';

// ==================== 模块 A：魔法开场 ====================

interface ModuleAProps {
  name: string;
  characterSeries: CharacterSeries;
  characterType: ZodiacType | PetType | HeroType;
}

export const ModuleA_MagicOpening: React.FC<ModuleAProps> = ({
  name,
  characterSeries,
  characterType
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  
  // 黑屏渐隐
  const blackOpacity = interpolate(frame, [0, 24], [1, 0], { extrapolateRight: 'clamp' });
  
  // 光粒聚集进度
  const particlesProgress = Math.min(frame / 48, 1);
  
  // 角色入场动画
  const characterEntrance = spring({
    frame: Math.max(frame - 20, 0),
    fps,
    config: { damping: 12, stiffness: 80 }
  });
  
  // 气泡显示
  const showGreeting = frame > 35;
  
  // 气泡动画
  const bubbleScale = showGreeting 
    ? spring({
        frame: frame - 35,
        fps,
        config: { damping: 10, stiffness: 200 }
      })
    : 0;
  
  return (
    <AbsoluteFill>
      {/* 黑屏 */}
      <AbsoluteFill 
        style={{ 
          backgroundColor: 'black', 
          opacity: blackOpacity,
          zIndex: 50 
        }} 
      />
      
      {/* 魔法光粒聚集 */}
      <MagicParticles
        durationInFrames={48}
        particleCount={80}
        color={PRIMARY_COLORS.violet}
      />
      
      {/* 角色和气泡组合 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '45%',
          transform: `translateX(-50%) translateY(${interpolate(characterEntrance, [0, 1], [100, 0])}px)`,
          opacity: characterEntrance,
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* 气泡 - 在角色上方 */}
        {showGreeting && (
          <div
            style={{
              marginBottom: 25,
              transform: `scale(${bubbleScale})`,
            }}
          >
            <SpeechBubble
              text={`亲爱的${name}小朋友——\n生日快乐呀！`}
              visible={true}
              color="#FFFFFF"
            />
          </div>
        )}
        
        {/* 角色 - 使用 inline 模式 */}
        <Character
          series={characterSeries}
          type={characterType}
          size={180}
          expression="happy"
          inline={true}
          animate={true}
        />
      </div>
    </AbsoluteFill>
  );
};

// ==================== 模块 B：角色入场 ====================

interface ModuleBProps {
  name: string;
  age?: number;
  characterSeries: CharacterSeries;
  characterType: ZodiacType | PetType | HeroType;
  subStyle: KidsSubStyle;
  orientation: ScreenOrientation;
}

export const ModuleB_CharacterEntrance: React.FC<ModuleBProps> = ({
  name,
  age,
  characterSeries,
  characterType,
  subStyle,
  orientation
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const theme = getColorTheme(subStyle);
  
  // 角色入场（0-3秒）
  const characterEntrance = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 }
  });
  
  // 角色自我介绍（3-5秒）
  const showIntroduction = frame > 72;
  
  // 名字弹跳（5-8秒）
  const showNameBounce = frame > 120;
  
  // 气球爆炸+白闪（8-12秒）
  const triggerBalloon = frame > 192;
  const showFlash = frame > 200 && frame < 220;
  
  return (
    <AbsoluteFill>
      {/* 角色和气泡组合容器 - 整体居中 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '45%',
          transform: `translateX(-50%) translateY(${interpolate(characterEntrance, [0, 1], [200, 0])}px)`,
          opacity: characterEntrance,
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* 角色自我介绍气泡 - 在角色上方 */}
        {showIntroduction && !showNameBounce && (
          <div
            style={{
              marginBottom: 25,
            }}
          >
            <SpeechBubble
              text={`我是你的生肖守护神小老虎！`}
              visible={true}
            />
          </div>
        )}
        
        {/* 角色 - 使用 inline 模式，由父容器控制位置 */}
        <Character
          series={characterSeries}
          type={characterType}
          size={orientation === 'portrait' ? 180 : 150}
          expression={showIntroduction ? 'waving' : 'happy'}
          inline={true}
          animate={true}
        />
      </div>
      
      {/* 名字发光弹跳 */}
      {showNameBounce && (
        <div style={{ position: 'absolute', top: '20%', width: '100%', zIndex: 15 }}>
          <BouncingName
            name={name}
            age={age}
            showAge={false}
            subStyle={subStyle}
            fontSize={orientation === 'portrait' ? 100 : 80}
          />
        </div>
      )}
      
      {/* 气球爆炸 */}
      {triggerBalloon && (
        <BalloonBurst
          x={0.5}
          y={0.5}
          balloonCount={12}
          triggerFrame={0}
        />
      )}
      
      {/* 白闪转场 */}
      {showFlash && <WhiteFlashTransition durationInFrames={20} />}
    </AbsoluteFill>
  );
};

// ==================== 模块 C-E：照片互动 ====================

interface ModulePhotoProps {
  photo: PhotoData;
  photoIndex: number;
  characterText?: string;
  showHearts?: boolean;
  orientation: ScreenOrientation;
}

export const ModuleC_PhotoInteraction1: React.FC<ModulePhotoProps> = ({
  photo,
  photoIndex,
  characterText,
  orientation
}) => {
  return (
    <AbsoluteFill>
      <PhotoFromMagicCircle
        photo={photo}
        visible={true}
        orientation={orientation}
      />
    </AbsoluteFill>
  );
};

export const ModuleD_PhotoInteraction2: React.FC<ModulePhotoProps> = ({
  photo,
  characterText,
  showHearts = true,
  orientation
}) => {
  const frame = useCurrentFrame();
  
  return (
    <AbsoluteFill>
      {/* 照片飞入 */}
      <PhotoCard
        photo={photo}
        index={0}
        totalPhotos={1}
        orientation={orientation}
        animationType="flyIn"
        visible={true}
        frameType = "glow"
        frameColor = "#FFD76A"
      />
      
      {/* 爱心飘出 */}
      {showHearts && frame > 30 && <FloatingHearts count={15} />}
    </AbsoluteFill>
  );
};

export const ModuleE_PhotoInteraction3: React.FC<ModulePhotoProps> = ({
  photo,
  orientation
}) => {
  const frame = useCurrentFrame();
  
  return (
    <AbsoluteFill>
      {/* 照片旋转入场 */}
      <PhotoCard
        photo={photo}
        index={0}
        totalPhotos={1}
        orientation={orientation}
        animationType="rotateIn"
        visible={true}
      />
    </AbsoluteFill>
  );
};

// ==================== 模块 F：成长庆祝高潮 ====================

interface ModuleFProps {
  name: string;
  age?: number;
  subStyle: KidsSubStyle;
  orientation: ScreenOrientation;
}

export const ModuleF_GrowthCelebration: React.FC<ModuleFProps> = ({
  name,
  age,
  subStyle,
  orientation
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const theme = getColorTheme(subStyle);
  
  // 烟花绽放
  const showFirework = frame > 20;
  
  return (
    <AbsoluteFill>
      {/* 烟花 */}
      {showFirework && (
        <>
          <Firework x={0.3} y={0.3} color={theme.primary} triggerFrame={0} />
          <Firework x={0.7} y={0.3} color={theme.secondary} triggerFrame={15} />
          <Firework x={0.5} y={0.2} color={theme.accent} triggerFrame={30} />
        </>
      )}
      
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
      
      {/* 生日快乐文字 - 调整位置确保完整显示 */}
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
      
      {/* 彩带背景 */}
      <ConfettiBurst primaryColor={theme.primary} secondaryColor={theme.secondary} level="high" seed={123} />
    </AbsoluteFill>
  );
};

// ==================== 模块 G：生日歌互动 ====================

interface ModuleGProps {
  age?: number;
  name?: string;
  birthdaySongSource?: string;
  birthdaySongVolume?: number;
  photos?: PhotoData[];
  subStyle: KidsSubStyle;
}

export const ModuleG_BirthdaySong: React.FC<ModuleGProps> = ({
  age,
  name,
  birthdaySongSource,
  birthdaySongVolume = 0.6,
  photos = [],
  subStyle
}) => {
  return (
    <AbsoluteFill>
      <BirthdaySongScene
        age={age}
        name={name}
        durationInFrames={720}  // 30秒
        birthdaySongSource={birthdaySongSource}
        birthdaySongVolume={birthdaySongVolume}
        photos={photos}
        subStyle={subStyle}
      />
    </AbsoluteFill>
  );
};

// ==================== 模块 H：未来祝福 ====================

interface ModuleHProps {
  characterSeries: CharacterSeries;
  characterType: ZodiacType | PetType | HeroType;
  orientation: ScreenOrientation;
}

export const ModuleH_FutureBlessing: React.FC<ModuleHProps> = ({
  characterSeries,
  characterType,
  orientation
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  // 流星效果
  const showShootingStar = frame > 60;
  
  return (
    <AbsoluteFill style={{ 
      background: 'linear-gradient(180deg, #0a0a2e 0%, #1a1a4e 50%, #2a2a6e 100%)' 
    }}>
      {/* 星空背景 */}
      <StarFieldBackground starCount={150} />
      
      {/* 角色飞行 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '40%',
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
        }}
      >
        <Character
          series={characterSeries}
          type={characterType}
          size={150}
          expression="happy"
        />
      </div>
      
      {/* 祝福文字 */}
      <div
        style={{
          position: 'absolute',
          top: '65%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 25,
        }}
      >
        <SpeechBubble
          text="未来的一年，我会一直守护你。"
          visible={true}
          color={PRIMARY_COLORS.violet}
          textColor="white"
        />
      </div>
      
      {/* 流星 */}
      {showShootingStar && (
        <ShootingStar
          startX={0.9}
          startY={0.1}
          endX={0.3}
          endY={0.5}
          durationInFrames={40}
        />
      )}
    </AbsoluteFill>
  );
};

// ==================== 模块 I：梦想种子 ====================

interface ModuleIProps {
  dreams: DreamJob[];
}

export const ModuleI_DreamSeeds: React.FC<ModuleIProps> = ({
  dreams
}) => {
  return (
    <AbsoluteFill>
      <DreamBubblesScene
        dreams={dreams}
        visible={true}
        showText={true}
        text="你的梦想一定会发光！"
      />
    </AbsoluteFill>
  );
};

// ==================== 模块 J：温暖收尾 ====================

interface ModuleJProps {
  name: string;
  characterSeries: CharacterSeries;
  characterType: ZodiacType | PetType | HeroType;
  orientation: ScreenOrientation;
}

export const ModuleJ_WarmClosing: React.FC<ModuleJProps> = ({
  name,
  characterSeries,
  characterType,
  orientation
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // LOGO 渐入
  const logoOpacity = interpolate(frame, [60, 100], [0, 1], { extrapolateRight: 'clamp' });
  
  return (
    <AbsoluteFill>
      {/* 角色挥手 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '15%',
          transform: 'translateX(-50%)',
          zIndex: 20,
        }}
      >
        <Character
          series={characterSeries}
          type={characterType}
          size={180}
          expression="waving"
        />
      </div>
      
      {/* 生日快乐大字 */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 25,
        }}
      >
        <div
          style={{
            fontSize: 60,
            fontWeight: 700,
            color: PRIMARY_COLORS.creamYellow,
            textShadow: `
              3px 3px 0 white,
              -3px -3px 0 white,
              0 0 30px ${PRIMARY_COLORS.creamYellow}
            `,
            fontFamily: '"Comic Sans MS", "PingFang SC", cursive',
          }}
        >
          生日快乐，{name}！
        </div>
      </div>
      
      {/* LOGO */}
      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: logoOpacity,
          zIndex: 30,
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: PRIMARY_COLORS.violet,
            textShadow: '0 0 10px rgba(255,255,255,0.5)',
          }}
        >
          ✨ Remo-Fects ✨
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==================== 模块工厂 ====================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createModule = (
  moduleType: ModuleType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any
): React.ReactElement | null => {
  switch (moduleType) {
    case 'A':
      return <ModuleA_MagicOpening {...props as ModuleAProps} />;
    case 'B':
      return <ModuleB_CharacterEntrance {...props as ModuleBProps} />;
    case 'C':
      return <ModuleC_PhotoInteraction1 {...props as ModulePhotoProps} />;
    case 'D':
      return <ModuleD_PhotoInteraction2 {...props as ModulePhotoProps} />;
    case 'E':
      return <ModuleE_PhotoInteraction3 {...props as ModulePhotoProps} />;
    case 'F':
      return <ModuleF_GrowthCelebration {...props as ModuleFProps} />;
    case 'G':
      return <ModuleG_BirthdaySong {...props as ModuleGProps} />;
    case 'H':
      return <ModuleH_FutureBlessing {...props as ModuleHProps} />;
    case 'I':
      return <ModuleI_DreamSeeds {...props as ModuleIProps} />;
    case 'J':
      return <ModuleJ_WarmClosing {...props as ModuleJProps} />;
    default:
      return null;
  }
};

export default createModule;