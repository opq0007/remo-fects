import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";

// ==================== 类型定义 ====================

export interface TextBreakthroughProps {
  text: string;
  startFrame: number;
  // 3D位置参数
  startZ: number; // 起始深度（远离镜头）
  endZ: number; // 结束深度（靠近镜头，可以是负数表示突破屏幕）
  // XY位置（相对于中心点的偏移比例）
  startX: number; // -0.5 到 0.5
  startY: number; // -0.5 到 0.5
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
  bevelDepth: number; // 3D立体深度
  // 动画参数
  approachDuration: number; // 接近动画时长（帧）
  breakthroughDuration: number; // 突破动画时长（帧）
  holdDuration: number; // 停留时长（帧）
  // 冲击效果
  impactScale: number; // 冲击时的缩放
  impactRotation: number; // 冲击时的旋转角度
  shakeIntensity: number; // 震动强度
  // 新增效果参数
  trailEnabled?: boolean; // 是否启用轨迹效果
  speedLinesEnabled?: boolean; // 是否启用速度线
  flashEnabled?: boolean; // 是否启用闪光效果
  afterimageEnabled?: boolean; // 是否启用残影效果
  // 下落消失效果参数
  enableFallDown?: boolean; // 是否启用下落消失效果
  fallDownDuration?: number; // 下落动画时长（帧）
  fallDownEndY?: number; // 下落结束位置（距底部百分比）
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
  vr: number; // 旋转速度
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

// 能量粒子接口
interface EnergyParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

// ==================== 辅助函数 ====================

// 3D透视计算
const calculatePerspective = (
  z: number,
  width: number,
  height: number,
  focalLength: number = 800
): { scale: number; translateX: number; translateY: number } => {
  // 透视公式：scale = focalLength / (focalLength + z)
  // z > 0 表示远离镜头（变小）
  // z < 0 表示靠近镜头（变大，突破屏幕）
  const scale = focalLength / (focalLength + z);
  return {
    scale: Math.max(0.01, scale), // 防止负值
    translateX: width / 2,
    translateY: height / 2,
  };
};

// 生成碎片粒子
const generateFragments = (
  count: number,
  textHash: number,
  textColor: string,
  glowColor: string
): Fragment[] => {
  const fragments: Fragment[] = [];
  const seededRandom = (seed: number) => {
    const x = Math.sin((textHash + seed) * 9999) * 10000;
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
      vy: Math.sin(angle) * speed - 2, // 稍微向上
      vr: (seededRandom(i * 41) - 0.5) * 20,
      opacity: 0.6 + seededRandom(i * 43) * 0.4,
      color: seededRandom(i * 47) > 0.5 ? textColor : glowColor,
      type,
    });
  }

  return fragments;
};

// 生成速度线
const generateSpeedLines = (count: number, textHash: number): SpeedLine[] => {
  const lines: SpeedLine[] = [];
  const seededRandom = (seed: number) => {
    const x = Math.sin((textHash + seed) * 9999) * 10000;
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

// 生成能量粒子
const generateEnergyParticles = (
  count: number,
  centerX: number,
  centerY: number,
  textHash: number,
  colors: string[]
): EnergyParticle[] => {
  const particles: EnergyParticle[] = [];
  const seededRandom = (seed: number) => {
    const x = Math.sin((textHash + seed) * 9999) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < count; i++) {
    const angle = seededRandom(i * 7) * Math.PI * 2;
    const speed = 3 + seededRandom(i * 13) * 10;
    particles.push({
      id: i,
      x: centerX,
      y: centerY,
      size: 2 + seededRandom(i * 17) * 5,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 20 + seededRandom(i * 23) * 30,
      color: colors[Math.floor(seededRandom(i * 29) * colors.length)],
    });
  }

  return particles;
};

// ==================== 子组件 ====================

// 碎片粒子组件
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
          // 多边形碎片
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
          // 火花
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
          // 能量粒子 - 带有脉冲效果
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
          // 灰尘粒子
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

// 轨迹线组件
const TrailEffect: React.FC<{
  trailPoints: TrailPoint[];
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  textColor: string;
  glowColor: string;
}> = ({ trailPoints, text, fontSize, fontFamily, fontWeight, textColor, glowColor }) => {
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
              fontSize: fontSize * point.scale,
              fontFamily,
              fontWeight,
              color: textColor,
              opacity: point.opacity * (1 - progress * 0.5),
              whiteSpace: "nowrap",
              filter: `blur(${2 + progress * 3}px)`,
              textShadow: `0 0 ${15 * point.scale}px ${glowColor}`,
            }}
          >
            {text}
          </div>
        );
      })}
    </>
  );
};

// 速度线组件
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
        const endX = startX + Math.cos(line.angle) * length;
        const endY = startY + Math.sin(line.angle) * length;

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

// 闪光效果组件
const FlashEffect: React.FC<{
  progress: number;
  intensity: number;
  color: string;
}> = ({ progress, intensity, color }) => {
  // 闪光在开始时最亮，快速衰减
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

// 文字残影组件
const TextAfterimage: React.FC<{
  text: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  opacity: number;
  glowColor: string;
}> = ({ text, x, y, rotation, scale, fontSize, fontFamily, fontWeight, opacity, glowColor }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
        fontSize,
        fontFamily,
        fontWeight,
        color: "transparent",
        opacity,
        whiteSpace: "nowrap",
        WebkitTextStroke: `2px ${glowColor}`,
        filter: `blur(3px)`,
        textShadow: `0 0 20px ${glowColor}`,
      }}
    >
      {text}
    </div>
  );
};

// 冲击波组件
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

// 屏幕裂纹效果
const ScreenCrack: React.FC<{
  centerX: number;
  centerY: number;
  progress: number;
  opacity: number;
}> = ({ centerX, centerY, progress, opacity }) => {
  const crackLines = React.useMemo(() => {
    const lines = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const length = 100 + Math.random() * 200;
      lines.push({
        x1: centerX,
        y1: centerY,
        x2: centerX + Math.cos(angle) * length * progress,
        y2: centerY + Math.sin(angle) * length * progress,
        width: 1 + Math.random() * 2,
      });
    }
    return lines;
  }, [centerX, centerY, progress]);

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: opacity * Math.max(0, 1 - progress * 0.5),
        pointerEvents: "none",
      }}
    >
      {crackLines.map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="white"
          strokeWidth={line.width}
          opacity={0.8}
        />
      ))}
    </svg>
  );
};

// ==================== 主组件 ====================

export const TextBreakthrough: React.FC<TextBreakthroughProps> = ({
  text,
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
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // 计算动画阶段
  const approachEnd = startFrame + approachDuration;
  const breakthroughEnd = approachEnd + breakthroughDuration;
  const holdEnd = breakthroughEnd + holdDuration;
  const fallDownEnd = holdEnd + fallDownDuration;

  // 当前阶段
  const isApproaching = frame >= startFrame && frame < approachEnd;
  const isBreakingThrough = frame >= approachEnd && frame < breakthroughEnd;
  const isHolding = frame >= breakthroughEnd && frame < holdEnd;
  const isFallingDown = enableFallDown && frame >= holdEnd && frame < fallDownEnd;

  // 计算文本哈希（用于确定性随机）
  const textHash = text.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);

  // ==================== 动画计算 ====================

  // 接近阶段：从远处快速靠近
  const approachProgress = isApproaching
    ? interpolate(
        frame,
        [startFrame, approachEnd],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : frame >= approachEnd ? 1 : 0;

  // 使用缓动函数使运动更有冲击感
  const approachEased = Easing.bezier(0.2, 0, 0.2, 1)(approachProgress);

  // 突破阶段：冲破屏幕
  const breakthroughProgress = isBreakingThrough
    ? interpolate(
        frame,
        [approachEnd, breakthroughEnd],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : frame >= breakthroughEnd ? 1 : 0;

  // 突破时使用弹性缓动
  const breakthroughEased = Easing.bezier(0.68, -0.55, 0.265, 1.55)(breakthroughProgress);

  // 持续阶段
  const holdProgress = isHolding
    ? interpolate(
        frame,
        [breakthroughEnd, holdEnd],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : frame >= holdEnd ? 1 : 0;

  // 下落阶段：自由落体效果
  const fallDownProgress = isFallingDown
    ? interpolate(
        frame,
        [holdEnd, fallDownEnd],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : frame >= fallDownEnd ? 1 : 0;

  // 使用加速缓动模拟重力效果
  const fallDownEased = Easing.bezier(0.55, 0.055, 0.675, 0.19)(fallDownProgress);

  // ==================== 位置和缩放计算 ====================

  // Z轴位置（直接线性插值，避免 interpolate 的单调递增限制）
  // approachEased 从 0 到 1，Z 从 startZ 到 endZ（可能是递减的）
  const currentZ = startZ + (endZ - startZ) * approachEased;

  // XY位置（这些是递增的，可以使用 interpolate）
  const currentX = interpolate(approachEased, [0, 1], [startX, endX]);
  const currentY = interpolate(approachEased, [0, 1], [startY, endY]);

  // 透视计算
  const perspective = calculatePerspective(currentZ, width, height);
  
  // 计算实际屏幕位置
  const screenX = width / 2 + currentX * width * perspective.scale;
  const screenY = height / 2 + currentY * height * perspective.scale;

  // 突破时的冲击缩放
  const impactScaleValue = 1 + (breakthroughEased > 0 ? Math.sin(breakthroughEased * Math.PI) * (impactScale - 1) : 0);
  
  // 最终缩放
  const finalScale = perspective.scale * impactScaleValue;

  // 震动效果
  const shakeX = isBreakingThrough
    ? (Math.sin(frame * 2) + Math.sin(frame * 3.7)) * shakeIntensity * (1 - breakthroughProgress)
    : 0;
  const shakeY = isBreakingThrough
    ? (Math.cos(frame * 2.3) + Math.cos(frame * 4.1)) * shakeIntensity * (1 - breakthroughProgress)
    : 0;

  // 旋转效果
  const rotation = isBreakingThrough
    ? Math.sin(breakthroughEased * Math.PI) * impactRotation
    : 0;

  // 下落时的位置偏移（从当前位置下落到距底部 fallDownEndY 处）
  const fallDownYOffset = isFallingDown
    ? fallDownEased * (1 - endY - fallDownEndY)
    : 0;

  // 下落时的透明度（接近终点时逐渐消失）
  const fallDownOpacity = isFallingDown
    ? Math.max(0, 1 - Math.pow(fallDownProgress, 1.5))
    : 1;

  // ==================== 样式计算 ====================

  // 基础字体大小（根据透视调整）
  const scaledFontSize = fontSize * finalScale;

  // 文字透明度（远处模糊，近处清晰）
  // interpolate 要求输入范围必须单调递增
  // 所以我们需要根据 startZ 和 endZ 的关系来决定顺序
  const textOpacity = startZ > endZ
    ? interpolate(currentZ, [endZ, startZ], [1, 0.3], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : interpolate(currentZ, [startZ, endZ], [0.3, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  // 发光强度（近处更强）
  const dynamicGlowIntensity = glowIntensity * (1 + (1 - perspective.scale) * 2);

  // ==================== 生成碎片 ====================

  const fragments = React.useMemo(
    () => generateFragments(60, textHash, textColor, glowColor),
    [textHash, textColor, glowColor]
  );

  // 生成速度线
  const speedLines = React.useMemo(
    () => generateSpeedLines(24, textHash),
    [textHash]
  );

  // ==================== 轨迹点计算 ====================

  // 生成轨迹点（记录历史位置）
  const trailPoints = React.useMemo(() => {
    if (!trailEnabled || !isApproaching) return [];
    
    const points: TrailPoint[] = [];
    const trailLength = 8; // 轨迹长度
    
    for (let i = 1; i <= trailLength; i++) {
      const pastFrame = frame - i * 2; // 每隔2帧记录一个点
      if (pastFrame < startFrame) continue;
      
      const pastProgress = interpolate(
        pastFrame,
        [startFrame, approachEnd],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
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

  // ==================== 残影计算 ====================

  const afterimages = React.useMemo(() => {
    if (!afterimageEnabled || !isBreakingThrough) return [];
    
    const images: { x: number; y: number; rotation: number; scale: number; opacity: number }[] = [];
    const afterimageCount = 5;
    
    for (let i = 1; i <= afterimageCount; i++) {
      const pastFrame = frame - i;
      if (pastFrame < approachEnd) continue;
      
      const pastProgress = interpolate(
        pastFrame,
        [approachEnd, breakthroughEnd],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      const pastEased = Easing.bezier(0.68, -0.55, 0.265, 1.55)(pastProgress);
      
      const pastZ = endZ; // 突破阶段Z位置基本不变
      const pastPerspective = calculatePerspective(pastZ, width, height);
      const pastImpactScale = 1 + Math.sin(pastEased * Math.PI) * (impactScale - 1);
      const pastScale = pastPerspective.scale * pastImpactScale;
      const pastRotation = Math.sin(pastEased * Math.PI) * impactRotation;
      
      images.push({
        x: width / 2 + endX * width * pastPerspective.scale,
        y: height / 2 + endY * height * pastPerspective.scale,
        rotation: pastRotation,
        scale: pastScale,
        opacity: (1 - i / afterimageCount) * 0.4,
      });
    }
    
    return images;
  }, [afterimageEnabled, isBreakingThrough, frame, approachEnd, breakthroughEnd, endZ, endX, endY, width, height, impactScale, impactRotation]);

  // ==================== 渲染 ====================

  return (
    <>
      {/* 轨迹效果 - 接近阶段 */}
      {trailEnabled && isApproaching && (
        <TrailEffect
          trailPoints={trailPoints}
          text={text}
          fontSize={fontSize}
          fontFamily={fontFamily}
          fontWeight={fontWeight}
          textColor={textColor}
          glowColor={glowColor}
        />
      )}

      {/* 闪光效果 - 突破瞬间 */}
      {flashEnabled && isBreakingThrough && breakthroughProgress < 0.5 && (
        <FlashEffect
          progress={breakthroughProgress * 2}
          intensity={0.8}
          color={glowColor}
        />
      )}

      {/* 速度线 - 突破阶段 */}
      {speedLinesEnabled && isBreakingThrough && (
        <SpeedLines
          centerX={screenX}
          centerY={screenY}
          lines={speedLines}
          progress={breakthroughProgress}
          color={glowColor}
        />
      )}

      {/* 突破阶段的碎片效果 */}
      {isBreakingThrough && (
        <>
          <FragmentParticles
            fragments={fragments}
            centerX={screenX}
            centerY={screenY}
            progress={breakthroughProgress}
            gravity={0.15}
          />
          <Shockwave
            centerX={screenX}
            centerY={screenY}
            progress={breakthroughProgress}
            color={glowColor}
            intensity={glowIntensity}
          />
          <ScreenCrack
            centerX={screenX}
            centerY={screenY}
            progress={breakthroughProgress}
            opacity={0.6}
          />
        </>
      )}

      {/* 残影效果 - 突破阶段 */}
      {afterimageEnabled && isBreakingThrough && afterimages.map((img, i) => (
        <TextAfterimage
          key={i}
          text={text}
          x={img.x}
          y={img.y}
          rotation={img.rotation}
          scale={img.scale}
          fontSize={fontSize}
          fontFamily={fontFamily}
          fontWeight={fontWeight}
          opacity={img.opacity}
          glowColor={glowColor}
        />
      ))}

      {/* 主文字 */}
      {(isApproaching || isBreakingThrough || isHolding || isFallingDown) && (
        <div
          style={{
            position: "absolute",
            left: screenX + shakeX,
            top: screenY + shakeY + (isFallingDown ? fallDownYOffset * height : 0),
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            fontSize: scaledFontSize,
            fontFamily,
            fontWeight,
            color: textColor,
            opacity: textOpacity * fallDownOpacity,
            whiteSpace: "nowrap",
            letterSpacing: `${4 * finalScale}px`,
            textShadow: `
              0 0 ${10 * dynamicGlowIntensity}px ${glowColor},
              0 0 ${20 * dynamicGlowIntensity}px ${glowColor},
              0 0 ${40 * dynamicGlowIntensity}px ${secondaryGlowColor},
              0 0 ${80 * dynamicGlowIntensity}px ${secondaryGlowColor},
              ${bevelDepth * finalScale}px ${bevelDepth * finalScale}px 0 rgba(180, 130, 50, 0.8),
              ${bevelDepth * 2 * finalScale}px ${bevelDepth * 2 * finalScale}px 0 rgba(140, 100, 30, 0.6),
              ${bevelDepth * 3 * finalScale}px ${bevelDepth * 3 * finalScale}px 0 rgba(100, 70, 20, 0.4)
            `,
            // 3D变换
            transformStyle: "preserve-3d",
            perspective: 1000,
            filter: `blur(${Math.max(0, currentZ / 500)}px)`,
            zIndex: Math.floor(1000 - currentZ / 10), // 根据深度排序
          }}
        >
          {/* 文字主体 */}
          <span
            style={{
              display: "inline-block",
              background: `linear-gradient(180deg, 
                #fff8dc 0%, 
                ${textColor} 30%, 
                #daa520 50%, 
                #b8860b 70%, 
                #8b6914 100%
              )`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "none",
              filter: `drop-shadow(0 0 ${10 * dynamicGlowIntensity}px ${glowColor}) 
                       drop-shadow(${bevelDepth * finalScale}px ${bevelDepth * finalScale}px 0 rgba(180, 130, 50, 0.8))`,
            }}
          >
            {text}
          </span>
        </div>
      )}

      {/* 外发光层 */}
      {(isApproaching || isBreakingThrough || isHolding || isFallingDown) && (
        <div
          style={{
            position: "absolute",
            left: screenX + shakeX,
            top: screenY + shakeY + (isFallingDown ? fallDownYOffset * height : 0),
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            fontSize: scaledFontSize,
            fontFamily,
            fontWeight,
            color: "transparent",
            WebkitTextStroke: `${2 * finalScale}px ${glowColor}`,
            opacity: textOpacity * 0.5 * fallDownOpacity,
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
