import React, { useMemo } from 'react';
import { 
  AbsoluteFill, 
  useCurrentFrame, 
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  Audio,
  staticFile,
  Img
} from 'remotion';
import { PRIMARY_COLORS, KidsSubStyle, PhotoData } from '../types';
import { getColorTheme, generateGlow, generate3DTextShadow } from '../utils/colors';

/**
 * 处理照片源路径
 */
const getPhotoSrc = (src: string | undefined): string | undefined => {
  if (!src) return undefined;
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }
  const cleanPath = src.replace(/^\.?\//, '');
  return staticFile(cleanPath);
};

// ==================== 生日蛋糕 ====================

interface BirthdayCakeProps {
  candles?: number;
  age?: number;
  lit?: boolean;
  size?: number;
  showFlame?: boolean;
}

export const BirthdayCake: React.FC<BirthdayCakeProps> = ({
  candles = 5,
  age,
  lit = true,
  size = 200,
  showFlame = true
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // 蛋糕升起动画
  const rise = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 50 }
  });
  
  // 火焰闪烁
  const flicker = 0.8 + Math.sin(frame * 0.3) * 0.2;
  
  // 烛光摇曳
  const candleGlow = 0.5 + Math.sin(frame * 0.2) * 0.3;
  
  const candleCount = age || candles;
  const candlePositions = useMemo(() => {
    return Array.from({ length: Math.min(candleCount, 10) }, (_, i) => ({
      x: 80 + (i % 5) * 20,
      y: i < 5 ? -15 : -25,
    }));
  }, [candleCount]);
  
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size * 1.2,
        transform: `translateY(${interpolate(rise, [0, 1], [100, 0])}px)`,
        opacity: rise,
      }}
    >
      <svg width={size} height={size * 1.2} viewBox="0 0 200 240">
        {/* 蛋糕盘 */}
        <ellipse cx="100" cy="220" rx="90" ry="15" fill="#E8E8E8" />
        <ellipse cx="100" cy="215" rx="85" ry="12" fill="#F5F5F5" />
        
        {/* 第一层蛋糕 */}
        <rect x="30" y="150" width="140" height="60" rx="10" fill="#FFB6C1" />
        <rect x="30" y="150" width="140" height="20" rx="10" fill="#FFC0CB" />
        
        {/* 奶油装饰 - 第一层 */}
        {Array.from({ length: 7 }).map((_, i) => (
          <ellipse
            key={`cream1-${i}`}
            cx={35 + i * 22}
            cy="155"
            rx="12"
            ry="8"
            fill="white"
          />
        ))}
        
        {/* 第二层蛋糕 */}
        <rect x="50" y="90" width="100" height="65" rx="8" fill="#FFE4E1" />
        <rect x="50" y="90" width="100" height="18" rx="8" fill="#FFF0F5" />
        
        {/* 奶油装饰 - 第二层 */}
        {Array.from({ length: 5 }).map((_, i) => (
          <ellipse
            key={`cream2-${i}`}
            cx={60 + i * 22}
            cy="95"
            rx="10"
            ry="6"
            fill="white"
          />
        ))}
        
        {/* 第三层蛋糕（顶层） */}
        <rect x="65" y="50" width="70" height="45" rx="6" fill="#FFF8DC" />
        <rect x="65" y="50" width="70" height="15" rx="6" fill="#FFFEF0" />
        
        {/* 顶部奶油花 */}
        <circle cx="100" cy="55" r="15" fill="white" />
        <circle cx="100" cy="50" r="10" fill="white" />
        <circle cx="100" cy="46" r="6" fill="#FFB6C1" />
        
        {/* 蜡烛 */}
        {candlePositions.map((pos, i) => (
          <g key={`candle-${i}`}>
            {/* 蜡烛身体 */}
            <rect
              x={pos.x - 2}
              y={pos.y}
              width="4"
              height="20"
              fill={`hsl(${(i * 40) % 360}, 80%, 70%)`}
              rx="1"
            />
            {/* 蜡烛条纹 */}
            <rect
              x={pos.x - 2}
              y={pos.y + 3}
              width="4"
              height="3"
              fill="white"
              opacity="0.5"
            />
            <rect
              x={pos.x - 2}
              y={pos.y + 10}
              width="4"
              height="3"
              fill="white"
              opacity="0.5"
            />
            {/* 火焰 */}
            {lit && showFlame && (
              <g style={{ opacity: flicker }}>
                <ellipse
                  cx={pos.x}
                  cy={pos.y - 8}
                  rx="4"
                  ry="8"
                  fill="#FFD700"
                  style={{
                    filter: `drop-shadow(0 0 ${5 * candleGlow}px #FF6B00)`,
                  }}
                />
                <ellipse
                  cx={pos.x}
                  cy={pos.y - 6}
                  rx="2"
                  ry="5"
                  fill="#FF6B00"
                />
                <ellipse
                  cx={pos.x}
                  cy={pos.y - 4}
                  rx="1"
                  ry="3"
                  fill="#FFF"
                />
              </g>
            )}
          </g>
        ))}
        
        {/* 樱桃装饰 */}
        <circle cx="80" cy="115" r="6" fill="#DC143C" />
        <circle cx="120" cy="115" r="6" fill="#DC143C" />
        <circle cx="78" cy="113" r="2" fill="white" opacity="0.6" />
        <circle cx="118" cy="113" r="2" fill="white" opacity="0.6" />
      </svg>
    </div>
  );
};

// ==================== 生日快乐跳动文字 ====================

interface BouncingBirthdayTextProps {
  color?: string;
  fontSize?: number;
  subStyle?: KidsSubStyle;
}

export const BouncingBirthdayText: React.FC<BouncingBirthdayTextProps> = ({
  color,
  fontSize = 72,
  subStyle = 'general'
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = getColorTheme(subStyle);
  const textColor = color || theme.primary;
  
  const chars = ['生', '日', '快', '乐'];
  
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      {chars.map((char, index) => {
        // 每个字符有独立的弹跳动画，错开时间
        const bounce = spring({
          frame: Math.max(frame - index * 6, 0),
          fps,
          config: { damping: 8, stiffness: 150, mass: 0.5 }
        });
        
        // 持续的跳动效果
        const continuousBounce = Math.sin(frame * 0.15 + index * 0.8) * 0.1;
        
        const scale = interpolate(bounce, [0, 0.5, 1], [0.5, 1.3, 1]) + continuousBounce;
        const y = interpolate(bounce, [0, 0.3, 0.6, 1], [50, -30, 10, 0]) + Math.sin(frame * 0.1 + index) * 8;
        const rotation = Math.sin(frame * 0.08 + index * 1.5) * 5;
        
        // 颜色变化（每个字有轻微不同的色调）
        const hue = parseInt(textColor.slice(1), 16);
        const charHueOffset = (index * 30) % 360;
        
        return (
          <span
            key={index}
            style={{
              display: 'inline-block',
              fontSize,
              fontWeight: 800,
              color: textColor,
              transform: `translateY(${y}px) scale(${scale}) rotate(${rotation}deg)`,
              textShadow: `
                3px 3px 0 white,
                -3px -3px 0 white,
                3px -3px 0 white,
                -3px 3px 0 white,
                0 0 30px ${colorWithOpacity(textColor, 0.6)},
                0 0 60px ${colorWithOpacity(textColor, 0.3)}
              `,
              fontFamily: '"Comic Sans MS", "PingFang SC", cursive',
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};

// 辅助函数
function colorWithOpacity(color: string, opacity: number): string {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// ==================== 照片显示（带发光效果） ====================

interface PhotoWithGlowProps {
  photoSrc?: string;
  size?: number;
  delay?: number;
  /** 照片垂直位置（0-1） */
  verticalPosition?: number;
  /** 屏幕方向 */
  orientation?: 'portrait' | 'landscape';
}

const PhotoWithGlow: React.FC<PhotoWithGlowProps> = ({
  photoSrc,
  size = 160,
  delay = 0,
  verticalPosition = 0.32,
  orientation = 'portrait'
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  // 飞入动画（从上方飞入）
  const flyIn = spring({
    frame: Math.max(frame - delay, 0),
    fps,
    config: { damping: 15, stiffness: 80 }
  });
  
  // 处理照片源
  const src = getPhotoSrc(photoSrc);
  
  // 位置计算：从上方飞入到目标位置
  const startY = -size;
  const targetY = height * verticalPosition;
  const y = interpolate(flyIn, [0, 1], [startY, targetY]);
  
  // 轻微浮动
  const floatY = Math.sin(frame * 0.05) * 5;
  const rotation = Math.sin(frame * 0.03) * 2;
  
  // 发光脉冲
  const glowPulse = 0.8 + Math.sin(frame * 0.1) * 0.2;
  
  // 装饰光晕尺寸
  const glowSize = size * 1.5;
  
  if (!src) return null;
  
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        transform: `translate(-50%, ${y + floatY}px) rotate(${rotation}deg)`,
        opacity: flyIn,
        zIndex: 10,
      }}
    >
      {/* 发光背景 - 更大的光晕效果 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: glowSize,
          height: glowSize,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colorWithOpacity(PRIMARY_COLORS.creamYellow, 0.35 * glowPulse)} 0%, transparent 70%)`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      
      {/* 外圈光环 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: size * 1.15,
          height: size * 1.15,
          borderRadius: '50%',
          border: `3px solid ${colorWithOpacity(PRIMARY_COLORS.creamYellow, 0.6)}`,
          transform: 'translate(-50%, -50%)',
          boxShadow: `0 0 20px ${colorWithOpacity(PRIMARY_COLORS.creamYellow, 0.4)}`,
        }}
      />
      
      {/* 照片容器 */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          border: `5px solid white`,
          boxShadow: `
            0 10px 35px rgba(0,0,0,0.3),
            0 0 40px ${colorWithOpacity(PRIMARY_COLORS.strawberryPink, 0.35 * glowPulse)},
            inset 0 0 20px rgba(255,255,255,0.1)
          `,
          backgroundColor: '#f0f0f0',
        }}
      >
        <Img
          src={src}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
      
      {/* 装饰星星 - 环绕照片 */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2 + frame * 0.04;
        const radius = size * 0.75;
        const starX = Math.cos(angle) * radius;
        const starY = Math.sin(angle) * radius;
        const starOpacity = 0.4 + Math.sin(frame * 0.15 + i * 0.8) * 0.6;
        const starScale = 0.8 + Math.sin(frame * 0.2 + i) * 0.3;
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: size / 2 + starX,
              top: size / 2 + starY,
              fontSize: 18,
              opacity: starOpacity,
              transform: `translate(-50%, -50%) scale(${starScale})`,
            }}
          >
            ✨
          </div>
        );
      })}
    </div>
  );
};

// ==================== 许愿界面（独立使用） ====================

interface MakeWishProps {
  visible?: boolean;
  name?: string;
}

export const MakeWish: React.FC<MakeWishProps> = ({
  visible = true,
  name = '小朋友'
}) => {
  if (!visible) return null;
  
  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <MakeWishContent name={name} />
    </AbsoluteFill>
  );
};

// ==================== 完整生日歌场景 ====================

interface BirthdaySongSceneProps {
  age?: number;
  name?: string;
  durationInFrames: number;
  /** 生日歌音频文件路径（相对于 public 目录），有值时才渲染音频 */
  birthdaySongSource?: string;
  /** 音频音量 (0-1) */
  birthdaySongVolume?: number;
  /** 主角照片列表（只显示第一张作为主体） */
  photos?: PhotoData[];
  /** 风格主题 */
  subStyle?: KidsSubStyle;
  /** 屏幕方向 */
  orientation?: 'portrait' | 'landscape';
}

export const BirthdaySongScene: React.FC<BirthdaySongSceneProps> = ({
  age = 1,
  name = '小朋友',
  durationInFrames,
  birthdaySongSource,
  birthdaySongVolume = 0.6,
  photos = [],
  subStyle = 'general',
  orientation = 'portrait'
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const theme = getColorTheme(subStyle);
  
  // 许愿阶段（最后5秒）
  const showWish = frame > durationInFrames - 120;
  
  // 许愿阶段的动画过渡
  const wishTransition = showWish 
    ? spring({
        frame: frame - (durationInFrames - 120),
        fps,
        config: { damping: 15, stiffness: 60 }
      })
    : 0;
  
  // 是否播放音频：只看 birthdaySongSource 是否有值
  const shouldPlayAudio = Boolean(birthdaySongSource);
  
  // 照片数据（只取第一张作为主体）
  const mainPhoto = photos[0];
  const hasPhoto = Boolean(mainPhoto?.src);
  
  // 根据屏幕方向调整尺寸和位置
  const isPortrait = orientation === 'portrait';
  
  // 蛋糕尺寸：缩小以避免占据过多空间
  const cakeSize = isPortrait ? 150 : 140;
  
  // 照片尺寸：放大以突出主体
  const photoSize = isPortrait ? 300 : 240;
  
  // 照片垂直位置
  const photoVerticalPosition = isPortrait ? 0.3 : 0.2;
  
  // 蛋糕垂直位置
  const cakeVerticalPosition = isPortrait ? 0.62 : 0.65;
  
  // 蛋糕位置和大小（许愿时上移并缩小）
  const cakeScale = showWish ? interpolate(wishTransition, [0, 1], [1, 0.65]) : 1;
  const cakeY = showWish ? interpolate(wishTransition, [0, 1], [0, -60]) : 0;
  
  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      {/* 音频播放 - 生日歌（仅当 birthdaySongSource 有值时渲染） */}
      {shouldPlayAudio && birthdaySongSource && (
        <Audio
          src={staticFile(birthdaySongSource)}
          volume={birthdaySongVolume}
          loop={false}
        />
      )}
      
      {/* 照片显示（中央上方，作为主体） */}
      {!showWish && hasPhoto && (
        <PhotoWithGlow
          photoSrc={mainPhoto.src}
          size={photoSize}
          delay={10}
          verticalPosition={photoVerticalPosition}
          orientation={orientation}
        />
      )}
      
      {/* 蛋糕（放在照片下方） */}
      <div style={{ 
        position: 'absolute',
        top: `${cakeVerticalPosition * 100}%`,
        left: '50%',
        transform: `translate(-50%, -50%) translateY(${cakeY}px) scale(${cakeScale})`,
        zIndex: 20,
      }}>
        <BirthdayCake
          candles={5}
          age={age}
          lit={!showWish}
          size={cakeSize}
        />
      </div>
      
      {/* 生日快乐跳动文字 */}
      {!showWish && (
        <div style={{
          position: 'absolute',
          bottom: isPortrait ? height * 0.12 : height * 0.15,
          width: '100%',
          zIndex: 25,
        }}>
          <BouncingBirthdayText
            color={theme.primary}
            fontSize={isPortrait ? 56 : 48}
            subStyle={subStyle}
          />
        </div>
      )}
      
      {/* 许愿界面 - 放在画面下方，确保不被遮挡 */}
      {showWish && (
        <div style={{
          position: 'absolute',
          top: isPortrait ? '50%' : '52%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 30,
          opacity: wishTransition,
          transform: `translateY(${interpolate(wishTransition, [0, 1], [30, 0])}px)`,
        }}>
          <MakeWishContent name={name} fontSize={isPortrait ? 48 : 40} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ==================== 许愿内容组件 ====================

interface MakeWishContentProps {
  name?: string;
  fontSize?: number;
}

const MakeWishContent: React.FC<MakeWishContentProps> = ({
  name = '小朋友',
  fontSize = 52
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  // 脉冲效果
  const pulse = 1 + Math.sin(frame * 0.1) * 0.05;
  
  // 闪烁星星
  const sparkle = 0.5 + Math.sin(frame * 0.3) * 0.5;
  
  // 响应式字体大小
  const mainFontSize = fontSize;
  const subFontSize = Math.round(fontSize * 0.46);
  const starFontSize = Math.round(fontSize * 0.35);
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 40px',
        background: `linear-gradient(135deg, ${colorWithOpacity(PRIMARY_COLORS.strawberryPink, 0.9)} 0%, ${colorWithOpacity(PRIMARY_COLORS.violet, 0.9)} 100%)`,
        borderRadius: 30,
        boxShadow: `
          0 10px 40px rgba(0,0,0,0.3),
          0 0 60px ${colorWithOpacity(PRIMARY_COLORS.creamYellow, 0.4)},
          inset 0 1px 0 rgba(255,255,255,0.3)
        `,
      }}
    >
      {/* 主文字 */}
      <div
        style={{
          fontSize: mainFontSize,
          fontWeight: 700,
          color: 'white',
          textShadow: `
            0 2px 4px rgba(0,0,0,0.2),
            0 0 20px rgba(255,255,255,0.5)
          `,
          transform: `scale(${pulse})`,
          fontFamily: '"Comic Sans MS", "PingFang SC", cursive',
          textAlign: 'center',
          letterSpacing: 2,
        }}
      >
        ✨ 快许个愿吧！✨
      </div>
      
      {/* 副文字 */}
      <div
        style={{
          fontSize: subFontSize,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.9)',
          marginTop: 10,
          fontFamily: '"PingFang SC", cursive',
        }}
      >
        {name}，闭上眼睛许个愿望吧~
      </div>
      
      {/* 装饰星星 */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2 + frame * 0.03;
        const radius = mainFontSize * 2.3 + Math.sin(frame * 0.05 + i) * 15;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.4;
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              fontSize: starFontSize,
              opacity: sparkle,
              transform: 'translate(-50%, -50%)',
            }}
          >
            ⭐
          </div>
        );
      })}
    </div>
  );
};

export default BirthdayCake;
