import React, { useMemo } from 'react';
import { 
  AbsoluteFill, 
  useCurrentFrame, 
  useVideoConfig,
  interpolate,
  spring,
  random
} from 'remotion';
import { 
  DreamJob, 
  DreamConfig, 
  DREAM_JOBS,
  PRIMARY_COLORS 
} from '../types';
import { colorWithOpacity } from '../utils/colors';

// ==================== 单个梦想泡泡 ====================

interface DreamBubbleProps {
  dream: DreamConfig;
  x: number;
  y: number;
  size: number;
  delay: number;
  visible: boolean;
}

const DreamBubble: React.FC<DreamBubbleProps> = ({
  dream,
  x,
  y,
  size,
  delay,
  visible
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const localFrame = Math.max(frame - delay, 0);
  
  // 入场动画
  const entrance = spring({
    frame: localFrame,
    fps,
    config: { damping: 15, stiffness: 80 }
  });
  
  // 浮动效果
  const floatY = Math.sin(localFrame * 0.05) * 10;
  const floatX = Math.cos(localFrame * 0.03) * 5;
  
  // 缩放呼吸
  const breathe = 1 + Math.sin(localFrame * 0.08) * 0.05;
  
  // 旋转
  const rotation = Math.sin(localFrame * 0.02) * 5;
  
  if (!visible) return null;
  
  return (
    <div
      style={{
        position: 'absolute',
        left: x + floatX,
        top: y + floatY,
        transform: `translate(-50%, -50%) scale(${entrance * breathe}) rotate(${rotation}deg)`,
        opacity: entrance,
      }}
    >
      {/* 泡泡主体 */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(255,255,255,0.3) 0%, transparent 30%),
            linear-gradient(135deg, ${colorWithOpacity(dream.color, 0.3)} 0%, ${colorWithOpacity(dream.color, 0.1)} 100%)
          `,
          border: `3px solid ${colorWithOpacity(dream.color, 0.5)}`,
          boxShadow: `
            0 8px 32px ${colorWithOpacity(dream.color, 0.3)},
            inset 0 -10px 30px rgba(255,255,255,0.3),
            0 0 20px ${colorWithOpacity(dream.color, 0.2)}
          `,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 图标 */}
        <span style={{
          fontSize: size * 0.35,
          marginBottom: 5,
        }}>
          {dream.icon}
        </span>
        
        {/* 名称 */}
        <span style={{
          fontSize: size * 0.12,
          fontWeight: 700,
          color: '#333',
          textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
        }}>
          {dream.name}
        </span>
      </div>
      
      {/* 泡泡高光 */}
      <div
        style={{
          position: 'absolute',
          top: size * 0.15,
          left: size * 0.25,
          width: size * 0.2,
          height: size * 0.15,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.6)',
          transform: 'rotate(-30deg)',
        }}
      />
    </div>
  );
};

// ==================== 梦想泡泡场景 ====================

interface DreamBubblesSceneProps {
  dreams: DreamJob[];
  visible?: boolean;
  showText?: boolean;
  text?: string;
}

export const DreamBubblesScene: React.FC<DreamBubblesSceneProps> = ({
  dreams,
  visible = true,
  showText = true,
  text = '你的梦想一定会发光！'
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  
  // 获取梦想配置
  const dreamConfigs = useMemo(() => {
    return dreams.map(d => DREAM_JOBS[d] || DREAM_JOBS.astronaut);
  }, [dreams]);
  
  // 计算泡泡位置（扇形分布）
  const bubblePositions = useMemo(() => {
    const count = dreamConfigs.length;
    const positions: Array<{ x: number; y: number; size: number; delay: number }> = [];
    
    dreamConfigs.forEach((_, i) => {
      // 扇形分布
      const angle = -Math.PI / 3 + (i / (count - 1 || 1)) * (Math.PI * 2 / 3);
      const radius = Math.min(width, height) * 0.3;
      
      positions.push({
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius * 0.8 - 50,
        size: 120 + random(`size-${i}`) * 30,
        delay: i * 15 + random(`delay-${i}`) * 10,
      });
    });
    
    return positions;
  }, [dreamConfigs, width, height]);
  
  // 文字动画
  const textEntrance = spring({
    frame: Math.max(frame - 30, 0),
    fps,
    config: { damping: 15, stiffness: 100 }
  });
  
  // 背景星光
  const sparkles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      x: random(`sparkle-x-${i}`) * width,
      y: random(`sparkle-y-${i}`) * height,
      size: random(`sparkle-size-${i}`) * 3 + 1,
      twinkleOffset: random(`sparkle-twinkle-${i}`) * Math.PI * 2,
    }));
  }, [width, height]);
  
  if (!visible) return null;
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* 背景星光 */}
      {sparkles.map((sparkle, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
            borderRadius: '50%',
            backgroundColor: 'white',
            opacity: 0.3 + Math.sin(frame * 0.1 + sparkle.twinkleOffset) * 0.3,
            boxShadow: '0 0 10px white',
          }}
        />
      ))}
      
      {/* 梦想泡泡 */}
      {dreamConfigs.map((dream, i) => (
        <DreamBubble
          key={dream.type}
          dream={dream}
          x={bubblePositions[i].x}
          y={bubblePositions[i].y}
          size={bubblePositions[i].size}
          delay={bubblePositions[i].delay}
          visible={frame > bubblePositions[i].delay}
        />
      ))}
      
      {/* 鼓励文字 */}
      {showText && frame > 45 && (
        <div
          style={{
            position: 'absolute',
            bottom: height * 0.15,
            left: '50%',
            transform: `translateX(-50%) translateY(${interpolate(textEntrance, [0, 1], [30, 0])}px)`,
            opacity: textEntrance,
          }}
        >
          <span
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: PRIMARY_COLORS.creamYellow,
              textShadow: `
                2px 2px 0 white,
                -2px -2px 0 white,
                2px -2px 0 white,
                -2px 2px 0 white,
                0 0 30px ${PRIMARY_COLORS.creamYellow}
              `,
              fontFamily: '"Comic Sans MS", "PingFang SC", cursive',
              textAlign: 'center',
              whiteSpace: 'pre-wrap',
            }}
          >
            ✨ {text} ✨
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ==================== 梦想图标（独立使用） ====================

interface DreamIconProps {
  type: DreamJob;
  size?: number;
  animated?: boolean;
}

export const DreamIcon: React.FC<DreamIconProps> = ({
  type,
  size = 60,
  animated = true
}) => {
  const frame = useCurrentFrame();
  const dream = DREAM_JOBS[type] || DREAM_JOBS.astronaut;
  
  // 浮动动画
  const floatY = animated ? Math.sin(frame * 0.05) * 5 : 0;
  const scale = animated ? 1 + Math.sin(frame * 0.08) * 0.05 : 1;
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `translateY(${floatY}px) scale(${scale})`,
      }}
    >
      <span style={{ fontSize: size }}>{dream.icon}</span>
      <span style={{
        fontSize: size * 0.25,
        fontWeight: 600,
        color: dream.color,
        marginTop: 5,
      }}>
        {dream.name}
      </span>
    </div>
  );
};

export default DreamBubblesScene;
