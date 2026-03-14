import React, { useMemo } from 'react';
import { 
  AbsoluteFill, 
  useCurrentFrame, 
  useVideoConfig,
  interpolate,
  spring,
  random,
  Img,
  staticFile
} from 'remotion';
import { ScreenOrientation, LAYOUT_CONFIGS, PRIMARY_COLORS } from '../types';

/**
 * 照片数据类型（精简版，仅包含 src）
 */
export interface PhotoDataSimple {
  src: string;
}

/**
 * 照片外框类型
 * - none: 无外框（默认），透明背景PNG可无缝展示
 * - simple: 简单白色边框
 * - glow: 发光边框（闪烁效果）
 * - magic: 梦幻魔法边框（粒子环绕）
 * - neon: 霓虹灯效果（颜色渐变）
 * - golden: 金色奢华边框
 * - polaroid: 拍立得风格
 */
export type PhotoFrameType = 'none' | 'simple' | 'glow' | 'magic' | 'neon' | 'golden' | 'polaroid';

/**
 * 处理照片源路径
 * - 完整 URL (http://, https://, data:) 直接返回
 * - 相对路径使用 staticFile() 包装
 */
const getPhotoSrc = (src: string | undefined): string | undefined => {
  if (!src) return undefined;
  
  // 完整 URL 或 base64 数据直接返回
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }
  
  // 相对路径使用 staticFile 处理
  // 去除开头的 ./ 或 / 
  const cleanPath = src.replace(/^\.?\//, '');
  return staticFile(cleanPath);
};

/**
 * 生成外框样式
 */
const getFrameStyle = (
  frameType: PhotoFrameType, 
  frame: number, 
  primaryColor: string = '#FFD76A'
): React.CSSProperties => {
  switch (frameType) {
    case 'none':
      return {};
      
    case 'simple':
      return {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 8,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      };
      
    case 'glow': {
      // 发光闪烁效果
      const glowIntensity = 0.5 + Math.sin(frame * 0.1) * 0.3;
      const glowSize = 20 + Math.sin(frame * 0.08) * 10;
      return {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 8,
        boxShadow: `
          0 0 ${glowSize}px rgba(255, 215, 106, ${glowIntensity}),
          0 0 ${glowSize * 2}px rgba(255, 182, 106, ${glowIntensity * 0.5}),
          0 4px 20px rgba(0,0,0,0.15)
        `,
      };
    }
      
    case 'magic': {
      // 梦幻魔法边框 - 渐变光晕
      const hue1 = (frame * 2) % 360;
      const hue2 = (hue1 + 60) % 360;
      return {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 8,
        background: `
          linear-gradient(white, white) padding-box,
          linear-gradient(${hue1}deg, hsl(${hue1}, 80%, 70%), hsl(${hue2}, 80%, 70%), hsl(${hue1 + 120}, 80%, 70%)) border-box
        `,
        border: '3px solid transparent',
        boxShadow: `
          0 0 30px hsla(${hue1}, 80%, 70%, 0.5),
          0 0 60px hsla(${hue2}, 80%, 70%, 0.3),
          0 4px 20px rgba(0,0,0,0.15)
        `,
      };
    }
      
    case 'neon': {
      // 霓虹灯效果 - 呼吸发光
      const breathe = 0.6 + Math.sin(frame * 0.05) * 0.4;
      const colorShift = Math.floor(frame * 0.5) % 360;
      return {
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderRadius: 12,
        padding: 8,
        border: `2px solid hsl(${colorShift}, 100%, 50%)`,
        boxShadow: `0 0 10px hsl(${colorShift}, 100%, 50%), 0 0 20px hsl(${colorShift}, 100%, 50%), 0 0 40px hsl(${colorShift}, 100%, 50%), inset 0 0 20px rgba(0,0,0,0.5)`,
        filter: `brightness(${1 + breathe * 0.2})`,
      };
    }
      
    case 'golden': {
      // 金色奢华边框
      const shimmer = (frame * 3) % 100;
      return {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 10,
        border: '2px solid',
        borderImage: `linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c) ${shimmer}% 1`,
        boxShadow: `
          0 0 20px rgba(191, 149, 63, 0.5),
          inset 0 0 20px rgba(252, 246, 186, 0.1),
          0 4px 20px rgba(0,0,0,0.3)
        `,
      };
    }
      
    case 'polaroid':
      // 拍立得风格
      return {
        backgroundColor: '#fefefe',
        borderRadius: 4,
        padding: '12px 12px 40px 12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      };
      
    default:
      return {};
  }
};

/**
 * 生成内层图片容器样式
 */
const getInnerStyle = (frameType: PhotoFrameType): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  
  switch (frameType) {
    case 'none':
      return { ...baseStyle };
    case 'polaroid':
      return { ...baseStyle, borderRadius: 2 };
    default:
      return { ...baseStyle, borderRadius: 8 };
  }
};

// ==================== 单张照片卡片 ====================

interface PhotoCardProps {
  photo: PhotoDataSimple;
  index: number;
  totalPhotos: number;
  orientation?: ScreenOrientation;
  animationType?: 'flyIn' | 'rotateIn' | 'scaleIn' | 'fadeIn';
  visible?: boolean;
  /** 外框类型，默认 none 无外框 */
  frameType?: PhotoFrameType;
  /** 外框主色调，用于 glow/magic/neon 效果 */
  frameColor?: string;
  /** 照片尺寸比例（相对于屏幕宽度的比例） */
  sizeRatio?: number;
  /** 是否保持原始比例（不强制 1.1 倍高度） */
  keepAspectRatio?: boolean;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  index,
  totalPhotos,
  orientation = 'portrait',
  animationType = 'flyIn',
  visible = true,
  frameType = 'none',
  frameColor = '#FFD76A',
  sizeRatio = 0.5,
  keepAspectRatio = true
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  // 入场动画
  const entrance = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80, mass: 0.8 }
  });
  
  // 轻微浮动
  const floatY = Math.sin(frame * 0.05 + index) * 5;
  const floatRotation = Math.sin(frame * 0.03 + index * 0.5) * 2;
  
  // 照片卡片尺寸
  const cardWidth = orientation === 'portrait' ? width * sizeRatio : width * (sizeRatio * 0.5);
  const cardHeight = keepAspectRatio ? 'auto' as const : cardWidth * 1.1;
  
  // 位置计算 - 确保照片完整显示在画面中
  const getPosition = () => {
    const baseY = height * 0.4;
    
    if (orientation === 'landscape') {
      return { x: width * 0.65, y: baseY };
    }
    return { x: width * 0.5, y: baseY };
  };
  
  const pos = getPosition();
  
  // 动画样式
  const getAnimationStyle = (): React.CSSProperties => {
    const baseTranslateY = `translateY(${floatY}px)`;
    const baseRotate = `rotate(${floatRotation}deg)`;
    
    switch (animationType) {
      case 'flyIn':
        return {
          transform: `translateX(calc(-50% + ${interpolate(entrance, [0, 1], [width * 0.5, 0])}px)) ${baseTranslateY} ${baseRotate}`,
        };
      case 'rotateIn':
        return {
          transform: `translateX(-50%) rotate(${interpolate(entrance, [0, 1], [180, 0])}deg) scale(${entrance}) ${baseTranslateY}`,
        };
      case 'scaleIn':
        return {
          transform: `translateX(-50%) scale(${interpolate(entrance, [0, 0.5, 1], [0, 1.2, 1])}) ${baseTranslateY} ${baseRotate}`,
        };
      default:
        return {
          transform: `translateX(-50%) ${baseTranslateY} ${baseRotate}`,
          opacity: entrance,
        };
    }
  };
  
  if (!visible) return null;
  
  const frameStyle = getFrameStyle(frameType, frame, frameColor);
  const innerStyle = getInnerStyle(frameType);
  
  // 无外框时直接渲染图片
  if (frameType === 'none') {
    return (
      <div
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y,
          ...getAnimationStyle(),
          zIndex: 20 + index,
        }}
      >
        {getPhotoSrc(photo.src) ? (
          <Img
            src={getPhotoSrc(photo.src)!}
            style={{
              maxWidth: cardWidth,
              maxHeight: height * 0.6,
              objectFit: 'contain',
            }}
          />
        ) : (
          <div style={{ fontSize: 40 }}>📷</div>
        )}
      </div>
    );
  }
  
  // 有外框时的渲染
  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        ...getAnimationStyle(),
        zIndex: 20 + index,
      }}
    >
      <div
        style={{
          width: cardWidth,
          height: cardHeight,
          ...frameStyle,
        }}
      >
        <div style={innerStyle}>
          {getPhotoSrc(photo.src) ? (
            <Img
              src={getPhotoSrc(photo.src)!}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          ) : (
            <div style={{ fontSize: 40 }}>📷</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== 照片飞出效果（简化版） ====================

interface PhotoFromMagicCircleProps {
  photo: PhotoDataSimple;
  visible?: boolean;
  orientation?: ScreenOrientation;
  /** 外框类型，默认 none 无外框 */
  frameType?: PhotoFrameType;
  /** 外框主色调 */
  frameColor?: string;
  /** 目标垂直位置（0-1，相对于高度），默认 0.75 */
  targetY?: number;
}

export const PhotoFromMagicCircle: React.FC<PhotoFromMagicCircleProps> = ({
  photo,
  visible = true,
  orientation = 'portrait',
  frameType = 'none',
  frameColor = '#FFD76A',
  targetY = 0.75
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  // 照片从中心飞出
  const photoProgress = spring({
    frame: frame,
    fps,
    config: { damping: 20, stiffness: 60 }
  });
  
  // 卡片尺寸
  const cardWidth = orientation === 'portrait' ? width * 0.5 : width * 0.25;
  
  // 目标位置
  const targetX = orientation === 'portrait' ? width * 0.5 : width * 0.65;
  const targetYPosition = height * targetY;
  
  const photoX = interpolate(photoProgress, [0, 1], [width * 0.5, targetX]);
  const photoY = interpolate(photoProgress, [0, 1], [height * 0.5, targetYPosition]);
  const photoScale = interpolate(photoProgress, [0, 0.5, 1], [0.3, 0.5, 1]);
  const photoOpacity = interpolate(photoProgress, [0, 0.3, 1], [0, 0.5, 1]);
  
  if (!visible) return null;
  
  const frameStyle = getFrameStyle(frameType, frame, frameColor);
  const innerStyle = getInnerStyle(frameType);
  
  // 无外框时直接渲染图片
  if (frameType === 'none') {
    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            left: photoX,
            top: photoY,
            transform: `translate(-50%, -50%) scale(${photoScale})`,
            opacity: photoOpacity,
            zIndex: 30,
          }}
        >
          {getPhotoSrc(photo.src) ? (
            <Img
              src={getPhotoSrc(photo.src)!}
              style={{
                maxWidth: cardWidth,
                maxHeight: height * 0.6,
                objectFit: 'contain',
              }}
            />
          ) : (
            <div style={{ fontSize: 40 }}>📷</div>
          )}
        </div>
      </AbsoluteFill>
    );
  }
  
  // 有外框时的渲染
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: photoX,
          top: photoY,
          transform: `translate(-50%, -50%) scale(${photoScale})`,
          opacity: photoOpacity,
          zIndex: 30,
        }}
      >
        <div
          style={{
            width: cardWidth,
            ...frameStyle,
          }}
        >
          <div style={innerStyle}>
            {getPhotoSrc(photo.src) ? (
              <Img
                src={getPhotoSrc(photo.src)!}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <div style={{ fontSize: 40 }}>📷</div>
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==================== 爱心飘出效果 ====================

interface FloatingHeartsProps {
  count?: number;
  color?: string;
  startX?: number;
  startY?: number;
}

export const FloatingHearts: React.FC<FloatingHeartsProps> = ({
  count = 10,
  color = PRIMARY_COLORS.strawberryPink,
  startX = 0.5,
  startY = 0.6
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  const hearts = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      offsetX: (random(`heart-x-${i}`) - 0.5) * 200,
      speed: 1 + random(`heart-speed-${i}`) * 0.5,
      size: 20 + random(`heart-size-${i}`) * 20,
      delay: random(`heart-delay-${i}`) * 20,
      wobbleSpeed: random(`heart-wobble-${i}`) * 0.1 + 0.05,
    }));
  }, [count]);
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {hearts.map((heart) => {
        const localFrame = Math.max(frame - heart.delay, 0);
        const progress = Math.min(localFrame * heart.speed * 0.01, 1);
        
        const x = width * startX + heart.offsetX + Math.sin(localFrame * heart.wobbleSpeed) * 30;
        const y = height * startY - progress * 200;
        
        const opacity = interpolate(progress, [0, 0.7, 1], [0, 1, 0]);
        const scale = interpolate(progress, [0, 0.3, 1], [0.5, 1, 0.8]);
        
        return (
          <div
            key={heart.id}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              fontSize: heart.size,
              opacity,
              transform: `translate(-50%, -50%) scale(${scale})`,
            }}
          >
            ❤️
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ==================== 年龄数字气球 ====================

interface AgeBalloonProps {
  age: number;
  color?: string;
  visible?: boolean;
}

export const AgeBalloon: React.FC<AgeBalloonProps> = ({
  age,
  color = PRIMARY_COLORS.creamYellow,
  visible = true
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  // 上升动画
  const rise = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 50 }
  });
  
  // 轻微摇摆
  const wobble = Math.sin(frame * 0.08) * 10;
  
  const y = interpolate(rise, [0, 1], [height * 0.7, height * 0.2]);
  
  if (!visible) return null;
  
  return (
    <div
      style={{
        position: 'absolute',
        left: width * 0.5 + wobble,
        top: y,
        transform: 'translateX(-50%)',
        zIndex: 25,
      }}
    >
      <svg width={150} height={200} viewBox="0 0 150 200">
        {/* 气球主体 */}
        <ellipse cx="75" cy="60" rx="60" ry="70" fill={color} />
        
        {/* 高光 */}
        <ellipse cx="55" cy="40" rx="15" ry="20" fill="rgba(255,255,255,0.4)" />
        
        {/* 气球结 */}
        <path d="M70 130 L75 140 L80 130 Z" fill={color} />
        
        {/* 绳子 */}
        <path 
          d={`M75 140 Q ${65 + wobble * 0.5} 160 75 180 Q ${85 - wobble * 0.5} 190 75 200`}
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
        
        {/* 年龄数字 */}
        <text
          x="75"
          y="75"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="50"
          fontWeight="bold"
          fill="white"
          style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          {age}
        </text>
      </svg>
    </div>
  );
};

// ==================== 照片互动场景 ====================

interface PhotoInteractionSceneProps {
  photos: PhotoDataSimple[];
  currentIndex: number;
  orientation?: ScreenOrientation;
  showHearts?: boolean;
  showAgeBalloon?: boolean;
  age?: number;
  frameType?: PhotoFrameType;
  frameColor?: string;
}

export const PhotoInteractionScene: React.FC<PhotoInteractionSceneProps> = ({
  photos,
  currentIndex,
  orientation = 'portrait',
  showHearts = false,
  showAgeBalloon = false,
  age,
  frameType = 'none',
  frameColor = '#FFD76A'
}) => {
  return (
    <AbsoluteFill>
      {/* 当前照片 */}
      {photos[currentIndex] && (
        <PhotoCard
          photo={photos[currentIndex]}
          index={currentIndex}
          totalPhotos={photos.length}
          orientation={orientation}
          animationType="flyIn"
          frameType={frameType}
          frameColor={frameColor}
        />
      )}
      
      {/* 爱心效果 */}
      {showHearts && <FloatingHearts />}
      
      {/* 年龄气球 */}
      {showAgeBalloon && age && <AgeBalloon age={age} />}
    </AbsoluteFill>
  );
};

export default PhotoCard;
