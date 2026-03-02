import React from "react";
import { 
  AbsoluteFill, 
  useCurrentFrame, 
  useVideoConfig, 
  interpolate,
  spring,
  Easing
} from "remotion";

interface FocusTextProps {
  text: string;
  fontSize: number;
  color: string;
  glowColor: string;
  appearFrame: number;
  stayDuration: number;
  enableGlow: boolean;
  glowIntensity: number;
  enablePulse: boolean;
}

/**
 * 焦点文字组件
 * 在万花筒中央显示，吸引注意力，增加冲击感
 */
export const FocusText: React.FC<FocusTextProps> = ({
  text,
  fontSize,
  color,
  glowColor,
  appearFrame,
  stayDuration,
  enableGlow,
  glowIntensity,
  enablePulse,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  const centerX = width / 2;
  const centerY = height / 2;
  
  const elementFrame = frame - appearFrame;
  
  if (elementFrame < 0 || elementFrame > stayDuration) return null;
  
  // 缩放动画：从小到大，有弹性效果
  const springScale = spring({
    frame: elementFrame,
    fps: 24,
    config: {
      damping: 12,
      stiffness: 100,
      mass: 0.8,
    },
  });
  
  const fadeOutScale = interpolate(elementFrame, [stayDuration - 20, stayDuration], [1, 0], { extrapolateLeft: "extend" as const, extrapolateRight: "clamp" as const });
  const scale = springScale * fadeOutScale;
  
  // 透明度
  const fadeIn = interpolate(elementFrame, [0, 10], [0, 1], { extrapolateRight: "extend" as const, extrapolateLeft: "clamp" as const });
  const fadeOut = interpolate(elementFrame, [stayDuration - 20, stayDuration], [1, 0], { extrapolateLeft: "extend" as const, extrapolateRight: "clamp" as const });
  const opacity = fadeIn * fadeOut;
  
  // 脉冲效果
  const pulseScale = enablePulse
    ? 1 + Math.sin(frame * 0.15) * 0.05
    : 1;
  
  // 旋转（轻微）
  const rotation = Math.sin(frame * 0.08) * 3;
  
  // 发光效果（优化强度）
  const adjustedGlow = glowIntensity * 1.2;
  const textShadow = enableGlow
    ? `
        0 0 ${10 * adjustedGlow}px ${glowColor},
        0 0 ${20 * adjustedGlow}px ${glowColor},
        0 0 ${40 * adjustedGlow}px ${glowColor},
        0 0 ${60 * adjustedGlow}px ${glowColor}
      `
    : 'none';
  
  // 文字描边
  const webkitTextStroke = `1px ${glowColor}`;
  
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: centerX,
          top: centerY,
          transform: `translate(-50%, -50%) scale(${scale * pulseScale}) rotate(${rotation}deg)`,
          fontSize,
          fontWeight: "bold",
          color,
          textShadow,
          WebkitTextStroke: webkitTextStroke,
          opacity,
          whiteSpace: "nowrap",
          fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
          textAlign: "center",
          willChange: "transform, opacity",
          letterSpacing: "0.1em",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export default FocusText;