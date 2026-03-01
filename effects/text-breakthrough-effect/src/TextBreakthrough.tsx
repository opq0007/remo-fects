import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing, Img, staticFile } from "remotion";
import { SingleBlessingSymbol, BlessingSymbolType } from "../../shared/index";

// ==================== 类型定义 ====================

export type BreakthroughContentType = "text" | "image" | "blessing";

export interface TextBreakthroughProps {
  // 内容配置
  contentType?: BreakthroughContentType;
  text?: string;
  imageSrc?: string;
  blessingType?: BlessingSymbolType;
  blessingStyle?: {
    primaryColor?: string;
    secondaryColor?: string;
    enable3D?: boolean;
    enableGlow?: boolean;
    glowIntensity?: number;
  };
  
  startFrame: number;
  // 3D位置参数
  startZ: number;
  endZ: number;
  // XY位置（相对于中心点的偏移比例）
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  // 字体样式
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  // 3D金色效果
  textColor: string;
  glowColor: string;
  secondaryGlowColor: string;
  glowIntensity: number;
  bevelDepth: number;
  // 动画参数
  approachDuration: number;
  breakthroughDuration: number;
  holdDuration: number;
  // 冲击效果
  impactScale: number;
  impactRotation: number;
  shakeIntensity: number;
  // 新增效果参数
  trailEnabled?: boolean;
  speedLinesEnabled?: boolean;
  flashEnabled?: boolean;
  afterimageEnabled?: boolean;
  // 下落消失效果参数
  enableFallDown?: boolean;
  fallDownDuration?: number;
  fallDownEndY?: number;
  
  // 图片/祝福图案特有参数
  imageSize?: number;
  blessingSize?: number;
}

// 碎片粒子接口
interface Fragment {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  vx: number;
  vy: number;
  vr: number;
  opacity: number;
  color: string;
  type: 'shard' | 'spark' | 'dust' | 'energy';
}

// 轨迹点接口
interface TrailPoint {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  rotation: number;
}

// 速度线接口
interface SpeedLine {
  id: number;
  angle: number;
  length: number;
  startOffset: number;
  width: number;
  delay: number;
}

// ==================== 辅助函数 ====================

const calculatePerspective = (
  z: number,
  width: number,
  height: number,
  focalLength: number = 800
): { scale: number; translateX: number; translateY: number } => {
  const scale = focalLength / (focalLength + z);
  return {
    scale: Math.max(0.01, scale),
    translateX: width / 2,
    translateY: height / 2,
  };
};

const generateFragments = (
  count: number,
  contentHash: number,
  textColor: string,
  glowColor: string
): Fragment[] => {
  const fragments: Fragment[] = [];
  const seededRandom = (seed: number) => {
    const x = Math.sin((contentHash + seed) * 9999) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < count; i++) {
    const angle = seededRandom(i * 7) * Math.PI * 2;
    const speed = 2 + seededRandom(i * 13) * 8;
    const randVal = seededRandom(i * 17);
    const type: 'shard' | 'spark' | 'dust' | 'energy' = 
      randVal > 0.7 ? 'shard' : randVal > 0.4 ? 'spark' : randVal > 0.2 ? 'dust' : 'energy';
    
    fragments.push({
      id: i,
      x: 0,
      y: 0,
      size: type === 'shard' ? 5 + seededRandom(i * 23) * 15 : 
            type === 'spark' ? 2 + seededRandom(i * 29) * 4 : 
            type === 'energy' ? 3 + seededRandom(i * 33) * 6 :
            1 + seededRandom(i * 31) * 2,
      rotation: seededRandom(i * 37) * 360,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      vr: (seededRandom(i * 41) - 0.5) * 20,
      opacity: 0.6 + seededRandom(i * 43) * 0.4,
      color: seededRandom(i * 47) > 0.5 ? textColor : glowColor,
      type,
    });
  }

  return fragments;
};

const generateSpeedLines = (count: number, contentHash: number): SpeedLine[] => {
  const lines: SpeedLine[] = [];
  const seededRandom = (seed: number) => {
    const x = Math.sin((contentHash + seed) * 9999) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < count; i++) {
    lines.push({
      id: i,
      angle: seededRandom(i * 3) * Math.PI * 2,
      length: 100 + seededRandom(i * 7) * 300,
      startOffset: seededRandom(i * 11) * 50,
      width: 1 + seededRandom(i * 13) * 3,
      delay: seededRandom(i * 17) * 0.3,
    });
  }

  return lines;
};

// ==================== 子组件 ====================

const FragmentParticles: React.FC<{
  fragments: Fragment[];
  centerX: number;
  centerY: number;
  progress: number;
  gravity: number;
}> = ({ fragments, centerX, centerY, progress, gravity }) => {
  return (
    <>
      {fragments.map((fragment) => {
        const x = centerX + fragment.vx * progress * 40;
        const y = centerY + fragment.vy * progress * 40 + 0.5 * gravity * Math.pow(progress * 40, 2);
        const rotation = fragment.rotation + fragment.vr * progress * 40;
        const opacity = fragment.opacity * Math.max(0, 1 - progress * 0.8);
        const scale = 1 - progress * 0.5;

        if (fragment.type === 'shard') {
          return (
            <div
              key={fragment.id}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: fragment.size,
                height: fragment.size * 0.6,
                backgroundColor: fragment.color,
                transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
                opacity,
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                boxShadow: `0 0 ${fragment.size}px ${fragment.color}`,
              }}
            />
          );
        } else if (fragment.type === 'spark') {
          return (
            <div
              key={fragment.id}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: fragment.size,
                height: fragment.size * 3,
                backgroundColor: fragment.color,
                transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
                opacity,
                borderRadius: "50%",
                boxShadow: `0 0 ${fragment.size * 2}px ${fragment.color}`,
              }}
            />
          );
        } else if (fragment.type === 'energy') {
          const pulseScale = 1 + Math.sin(progress * Math.PI * 6) * 0.3;
          return (
            <div
              key={fragment.id}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: fragment.size * pulseScale,
                height: fragment.size * pulseScale,
                background: `radial-gradient(circle, ${fragment.color} 0%, transparent 70%)`,
                transform: `translate(-50%, -50%) scale(${scale})`,
                opacity: opacity * 0.8,
                borderRadius: "50%",
                boxShadow: `0 0 ${fragment.size * 2}px ${fragment.color}, 0 0 ${fragment.size * 4}px ${fragment.color}`,
              }}
            />
          );
        } else {
          return (
            <div
              key={fragment.id}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: fragment.size,
                height: fragment.size,
                backgroundColor: fragment.color,
                transform: `translate(-50%, -50%) scale(${scale})`,
                opacity: opacity * 0.5,
                borderRadius: "50%",
                filter: "blur(1px)",
              }}
            />
          );
        }
      })}
    </>
  );
};

const TrailEffect: React.FC<{
  trailPoints: TrailPoint[];
  content: React.ReactNode;
}> = ({ trailPoints, content }) => {
  return (
    <>
      {trailPoints.map((point, index) => {
        const progress = index / trailPoints.length;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: point.x,
              top: point.y,
              transform: `translate(-50%, -50%) rotate(${point.rotation}deg) scale(${point.scale})`,
              opacity: point.opacity * (1 - progress * 0.5),
              filter: `blur(${2 + progress * 3}px)`,
            }}
          >
            {content}
          </div>
        );
      })}
    </>
  );
};

const SpeedLines: React.FC<{
  centerX: number;
  centerY: number;
  lines: SpeedLine[];
  progress: number;
  color: string;
}> = ({ centerX, centerY, lines, progress, color }) => {
  return (
    <>
      {lines.map((line) => {
        const adjustedProgress = Math.max(0, progress - line.delay);
        if (adjustedProgress <= 0) return null;
        
        const length = line.length * adjustedProgress;
        const opacity = Math.max(0, 1 - adjustedProgress * 1.5);
        const startX = centerX + Math.cos(line.angle) * line.startOffset;
        const startY = centerY + Math.sin(line.angle) * line.startOffset;

        return (
          <div
            key={line.id}
            style={{
              position: "absolute",
              left: startX,
              top: startY,
              width: length,
              height: line.width,
              background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`,
              transform: `rotate(${line.angle}rad)`,
              transformOrigin: "left center",
              opacity,
              boxShadow: `0 0 ${line.width * 2}px ${color}`,
            }}
          />
        );
      })}
    </>
  );
};

const FlashEffect: React.FC<{
  progress: number;
  intensity: number;
  color: string;
}> = ({ progress, intensity, color }) => {
  const opacity = Math.max(0, Math.pow(1 - progress, 3)) * intensity;
  const scale = 1 + progress * 2;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at center, ${color} 0%, transparent 50%)`,
        opacity,
        transform: `scale(${scale})`,
        pointerEvents: "none",
      }}
    />
  );
};

const Shockwave: React.FC<{
  centerX: number;
  centerY: number;
  progress: number;
  color: string;
  intensity: number;
}> = ({ centerX, centerY, progress, color, intensity }) => {
  const maxRadius = 300;
  const radius = progress * maxRadius;
  const opacity = Math.max(0, 1 - progress * 1.5);

  return (
    <div
      style={{
        position: "absolute",
        left: centerX,
        top: centerY,
        transform: "translate(-50%, -50%)",
        width: radius * 2,
        height: radius * 2,
        borderRadius: "50%",
        border: `3px solid ${color}`,
        opacity: opacity * intensity,
        boxShadow: `
          0 0 ${20 * intensity}px ${color},
          inset 0 0 ${30 * intensity}px ${color}
        `,
        filter: "blur(2px)",
      }}
    />
  );
};

// ==================== 主组件 ====================

export const TextBreakthrough: React.FC<TextBreakthroughProps> = ({
  contentType = "text",
  text,
  imageSrc,
  blessingType,
  blessingStyle = {},
  startFrame,
  startZ,
  endZ,
  startX,
  startY,
  endX,
  endY,
  fontSize,
  fontFamily,
  fontWeight,
  textColor,
  glowColor,
  secondaryGlowColor,
  glowIntensity,
  bevelDepth,
  approachDuration,
  breakthroughDuration,
  holdDuration,
  impactScale,
  impactRotation,
  shakeIntensity,
  trailEnabled = true,
  speedLinesEnabled = true,
  flashEnabled = true,
  afterimageEnabled = true,
  enableFallDown = true,
  fallDownDuration = 40,
  fallDownEndY = 0.2,
  imageSize,
  blessingSize,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // 计算动画阶段
  const approachEnd = startFrame + approachDuration;
  const breakthroughEnd = approachEnd + breakthroughDuration;
  const holdEnd = breakthroughEnd + holdDuration;
  const fallDownEndFrame = holdEnd + fallDownDuration;

  // 当前阶段
  const isApproaching = frame >= startFrame && frame < approachEnd;
  const isBreakingThrough = frame >= approachEnd && frame < breakthroughEnd;
  const isHolding = frame >= breakthroughEnd && frame < holdEnd;
  const isFallingDown = enableFallDown && frame >= holdEnd && frame < fallDownEndFrame;

  // 计算内容哈希
  const contentHash = contentType === "text"
    ? (text?.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0) ?? 0)
    : contentType === "image"
    ? (imageSrc?.length ?? 0) * 100
    : (blessingType?.length ?? 0) * 200;

  // 动画计算
  const approachProgress = isApproaching
    ? interpolate(frame, [startFrame, approachEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : frame >= approachEnd ? 1 : 0;

  const approachEased = Easing.bezier(0.2, 0, 0.2, 1)(approachProgress);

  const breakthroughProgress = isBreakingThrough
    ? interpolate(frame, [approachEnd, breakthroughEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : frame >= breakthroughEnd ? 1 : 0;

  const breakthroughEased = Easing.bezier(0.68, -0.55, 0.265, 1.55)(breakthroughProgress);

  const fallDownProgress = isFallingDown
    ? interpolate(frame, [holdEnd, fallDownEndFrame], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : frame >= fallDownEndFrame ? 1 : 0;

  const fallDownEased = Easing.bezier(0.55, 0.055, 0.675, 0.19)(fallDownProgress);

  // 位置和缩放计算
  const currentZ = startZ + (endZ - startZ) * approachEased;
  const currentX = interpolate(approachEased, [0, 1], [startX, endX]);
  const currentY = interpolate(approachEased, [0, 1], [startY, endY]);

  const perspective = calculatePerspective(currentZ, width, height);
  const screenX = width / 2 + currentX * width * perspective.scale;
  const screenY = height / 2 + currentY * height * perspective.scale;

  const impactScaleValue = 1 + (breakthroughEased > 0 ? Math.sin(breakthroughEased * Math.PI) * (impactScale - 1) : 0);
  const finalScale = perspective.scale * impactScaleValue;

  const shakeX = isBreakingThrough
    ? (Math.sin(frame * 2) + Math.sin(frame * 3.7)) * shakeIntensity * (1 - breakthroughProgress)
    : 0;
  const shakeY = isBreakingThrough
    ? (Math.cos(frame * 2.3) + Math.cos(frame * 4.1)) * shakeIntensity * (1 - breakthroughProgress)
    : 0;

  const rotation = isBreakingThrough
    ? Math.sin(breakthroughEased * Math.PI) * impactRotation
    : 0;

  const fallDownYOffset = isFallingDown
    ? fallDownEased * (1 - endY - fallDownEndY)
    : 0;

  const fallDownOpacity = isFallingDown
    ? Math.max(0, 1 - Math.pow(fallDownProgress, 1.5))
    : 1;

  // 生成碎片和速度线
  const fragments = React.useMemo(
    () => generateFragments(60, contentHash, textColor, glowColor),
    [contentHash, textColor, glowColor]
  );

  const speedLines = React.useMemo(
    () => generateSpeedLines(24, contentHash),
    [contentHash]
  );

  // 渲染内容
  const renderContent = (scale: number, opacity: number, contentRotation: number = 0) => {
    const baseStyle: React.CSSProperties = {
      transform: `translate(-50%, -50%) rotate(${contentRotation}deg)`,
      opacity,
    };

    if (contentType === "text" && text) {
      const scaledFontSize = fontSize * scale;
      const dynamicGlowIntensity = glowIntensity * (1 + (1 - perspective.scale) * 2);
      const textOpacity = startZ > endZ
        ? interpolate(currentZ, [endZ, startZ], [1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
        : interpolate(currentZ, [startZ, endZ], [0.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

      return (
        <div
          style={{
            ...baseStyle,
            fontSize: scaledFontSize,
            fontFamily,
            fontWeight,
            color: textColor,
            whiteSpace: "nowrap",
            letterSpacing: `${4 * scale}px`,
            textShadow: `
              0 0 ${10 * dynamicGlowIntensity}px ${glowColor},
              0 0 ${20 * dynamicGlowIntensity}px ${glowColor},
              0 0 ${40 * dynamicGlowIntensity}px ${secondaryGlowColor},
              0 0 ${80 * dynamicGlowIntensity}px ${secondaryGlowColor},
              ${bevelDepth * scale}px ${bevelDepth * scale}px 0 rgba(180, 130, 50, 0.8),
              ${bevelDepth * 2 * scale}px ${bevelDepth * 2 * scale}px 0 rgba(140, 100, 30, 0.6),
              ${bevelDepth * 3 * scale}px ${bevelDepth * 3 * scale}px 0 rgba(100, 70, 20, 0.4)
            `,
            filter: `blur(${Math.max(0, currentZ / 500)}px) drop-shadow(0 0 ${10 * dynamicGlowIntensity}px ${glowColor})`,
          }}
        >
          <span
            style={{
              display: "inline-block",
              background: `linear-gradient(180deg, #fff8dc 0%, ${textColor} 30%, #daa520 50%, #b8860b 70%, #8b6914 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "none",
            }}
          >
            {text}
          </span>
        </div>
      );
    }

    if (contentType === "image" && imageSrc) {
      const size = (imageSize ?? fontSize * 1.5) * scale;
      return (
        <div style={{ ...baseStyle, filter: `drop-shadow(0 0 ${20 * glowIntensity * scale}px ${glowColor})` }}>
          <Img
            src={staticFile(imageSrc)}
            style={{ width: size, height: size, objectFit: "contain" }}
          />
        </div>
      );
    }

    if (contentType === "blessing" && blessingType) {
      const size = (blessingSize ?? fontSize * 1.2) * scale;
      return (
        <div style={baseStyle}>
          <SingleBlessingSymbol
            type={blessingType}
            size={size}
            primaryColor={blessingStyle.primaryColor ?? textColor}
            secondaryColor={blessingStyle.secondaryColor ?? glowColor}
            enable3D={blessingStyle.enable3D ?? true}
            enableGlow={blessingStyle.enableGlow ?? true}
            glowIntensity={blessingStyle.glowIntensity ?? glowIntensity}
          />
        </div>
      );
    }

    return null;
  };

  // 轨迹点计算
  const trailPoints = React.useMemo(() => {
    if (!trailEnabled || !isApproaching) return [];
    
    const points: TrailPoint[] = [];
    const trailLength = 8;
    
    for (let i = 1; i <= trailLength; i++) {
      const pastFrame = frame - i * 2;
      if (pastFrame < startFrame) continue;
      
      const pastProgress = interpolate(pastFrame, [startFrame, approachEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const pastEased = Easing.bezier(0.2, 0, 0.2, 1)(pastProgress);
      
      const pastZ = startZ + (endZ - startZ) * pastEased;
      const pastX = interpolate(pastEased, [0, 1], [startX, endX]);
      const pastY = interpolate(pastEased, [0, 1], [startY, endY]);
      const pastPerspective = calculatePerspective(pastZ, width, height);
      
      const pastScreenX = width / 2 + pastX * width * pastPerspective.scale;
      const pastScreenY = height / 2 + pastY * height * pastPerspective.scale;
      
      points.push({
        x: pastScreenX,
        y: pastScreenY,
        scale: pastPerspective.scale,
        opacity: (1 - i / trailLength) * 0.6,
        rotation: 0,
      });
    }
    
    return points;
  }, [trailEnabled, isApproaching, frame, startFrame, approachEnd, startZ, endZ, startX, endX, startY, endY, width, height]);

  // 计算透明度
  const contentOpacity = startZ > endZ
    ? interpolate(currentZ, [endZ, startZ], [1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : interpolate(currentZ, [startZ, endZ], [0.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <>
      {/* 轨迹效果 */}
      {trailEnabled && isApproaching && (
        <TrailEffect trailPoints={trailPoints} content={renderContent(finalScale, contentOpacity * 0.5)} />
      )}

      {/* 闪光效果 */}
      {flashEnabled && isBreakingThrough && breakthroughProgress < 0.5 && (
        <FlashEffect progress={breakthroughProgress * 2} intensity={0.8} color={glowColor} />
      )}

      {/* 速度线 */}
      {speedLinesEnabled && isBreakingThrough && (
        <SpeedLines centerX={screenX} centerY={screenY} lines={speedLines} progress={breakthroughProgress} color={glowColor} />
      )}

      {/* 碎片效果 */}
      {isBreakingThrough && (
        <>
          <FragmentParticles fragments={fragments} centerX={screenX} centerY={screenY} progress={breakthroughProgress} gravity={0.15} />
          <Shockwave centerX={screenX} centerY={screenY} progress={breakthroughProgress} color={glowColor} intensity={glowIntensity} />
        </>
      )}

      {/* 主内容 */}
      {(isApproaching || isBreakingThrough || isHolding || isFallingDown) && (
        <div
          style={{
            position: "absolute",
            left: screenX + shakeX,
            top: screenY + shakeY + (isFallingDown ? fallDownYOffset * height : 0),
            zIndex: Math.floor(1000 - currentZ / 10),
          }}
        >
          {renderContent(finalScale, contentOpacity * fallDownOpacity, rotation)}
        </div>
      )}

      {/* 外发光层 */}
      {(isApproaching || isBreakingThrough || isHolding || isFallingDown) && contentType === "text" && text && (
        <div
          style={{
            position: "absolute",
            left: screenX + shakeX,
            top: screenY + shakeY + (isFallingDown ? fallDownYOffset * height : 0),
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            fontSize: fontSize * finalScale,
            fontFamily,
            fontWeight,
            color: "transparent",
            WebkitTextStroke: `${2 * finalScale}px ${glowColor}`,
            opacity: contentOpacity * 0.5 * fallDownOpacity,
            whiteSpace: "nowrap",
            letterSpacing: `${4 * finalScale}px`,
            filter: `blur(${3 * finalScale}px)`,
            zIndex: Math.floor(999 - currentZ / 10),
          }}
        >
          {text}
        </div>
      )}
    </>
  );
};