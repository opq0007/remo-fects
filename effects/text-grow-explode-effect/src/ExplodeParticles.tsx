import React, { useMemo, memo } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { easing, Particle } from "./imageUtils";

// 爆炸粒子动画配置
export interface ExplodeParticlesConfig {
  particles: Particle[];
  explodeDuration: number;
  fallDuration: number;
  startFrame: number;
  gravity: number;
  wind: number;
  explosionRadius: number;
}

/**
 * 确定性随机数生成器
 */
const seededRandom = (seed: number, index: number, offset: number = 0): number => {
  const x = Math.sin(seed + index * 0.1 + offset) * 10000;
  return x - Math.floor(x);
};

/**
 * 生成爆炸粒子数据（优化版）
 */
export function generateParticles(
  centerX: number,
  centerY: number,
  textPool: string[],
  count: number,
  baseFontSize: number,
  seed: number
): Particle[] {
  const particles: Particle[] = [];
  const colors = [
    "#ffd700", "#ff6b6b", "#4ecdc4", "#45b7d1",
    "#96ceb4", "#ffeaa7", "#ff9ff3", "#54a0ff",
    "#5f27cd", "#00d2d3", "#ff9f43", "#ee5253"
  ];
  const poolLength = textPool.length;
  const colorsLength = colors.length;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (seededRandom(seed, i, 1) - 0.5) * 0.3;
    const speed = 8 + seededRandom(seed, i, 2) * 12;

    particles.push({
      id: i,
      text: textPool[Math.floor(seededRandom(seed, i, 3) * poolLength)] || "福",
      x: centerX + (seededRandom(seed, i, 4) - 0.5) * 60,
      y: centerY + (seededRandom(seed, i, 5) - 0.5) * 60,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed * 0.6 - 5,
      rotation: seededRandom(seed, i, 6) * 360,
      rotationSpeed: (seededRandom(seed, i, 7) - 0.5) * 15,
      scale: 0.7 + seededRandom(seed, i, 8) * 0.5,
      opacity: 0.7 + seededRandom(seed, i, 9) * 0.3,
      color: colors[Math.floor(seededRandom(seed, i, 10) * colorsLength)],
      fontSize: baseFontSize * (0.5 + seededRandom(seed, i, 11) * 0.6),
    });
  }

  return particles;
}

/**
 * 单个粒子组件（优化版）
 * 使用 memo 避免不必要的重渲染
 */
const ParticleComponent = memo<{
  particle: Particle;
  progress: number;
  explodeProgress: number;
  fallProgress: number;
  gravity: number;
  wind: number;
}>(({ particle, progress, explodeProgress, fallProgress, gravity, wind }) => {
  // 爆炸阶段位置
  const baseX = particle.x + particle.velocityX * explodeProgress * 8;
  const baseY = particle.y + particle.velocityY * explodeProgress * 8;

  // 下落阶段偏移
  const fallTime = fallProgress * 60;
  const fallOffsetX = wind * fallTime * fallTime * 0.5;
  const fallOffsetY = gravity * fallTime * fallTime * 0.5;

  // 最终位置
  const x = baseX + fallOffsetX + particle.velocityX * fallProgress * 2;
  const y = baseY + fallOffsetY + particle.velocityY * fallProgress * 0.5 + fallProgress * fallProgress * gravity * 100;

  // 旋转
  const rotation = particle.rotation +
    particle.rotationSpeed * explodeProgress * 3 +
    particle.rotationSpeed * fallProgress * 0.5;

  // 缩放和透明度（简化插值）
  const scale = progress < 0.1
    ? 0.3 + progress * 12 // 快速放大
    : progress < 0.3
      ? particle.scale * 1.5 - (progress - 0.1) * particle.scale * 2.5
      : particle.scale * (1.5 - progress);

  const opacity = progress < 0.85
    ? particle.opacity * (progress < 0.5 ? 1 : 1 - (progress - 0.5) * 0.4)
    : particle.opacity * (1 - (progress - 0.85) / 0.15);

  if (opacity <= 0.01) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontSize: particle.fontSize,
        fontFamily: "'PingFang SC', 'Microsoft YaHei', 'SimHei', sans-serif",
        fontWeight: 700,
        color: particle.color,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        textShadow: `0 0 3px ${particle.color}, 0 0 6px ${particle.color}`,
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      {particle.text}
    </div>
  );
});

ParticleComponent.displayName = 'ParticleComponent';

/**
 * 爆炸粒子动画组件（优化版）
 */
export const ExplodeParticles: React.FC<ExplodeParticlesConfig> = memo(({
  particles,
  explodeDuration,
  fallDuration,
  startFrame,
  gravity,
  wind,
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;
  const totalDuration = explodeDuration + fallDuration;

  // 如果还没开始或已经结束，不渲染
  if (relativeFrame < 0 || relativeFrame > totalDuration) {
    return null;
  }

  // 预计算进度值
  const progress = relativeFrame / totalDuration;
  const explodeProgress = Math.min(1, relativeFrame / explodeDuration);
  const easedExplodeProgress = easing.easeOutCubic(explodeProgress);
  const fallProgress = Math.max(0, (relativeFrame - explodeDuration) / fallDuration);
  const easedFallProgress = easing.easeInOutCubic(fallProgress);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {particles.map((particle) => (
        <ParticleComponent
          key={particle.id}
          particle={particle}
          progress={progress}
          explodeProgress={easedExplodeProgress}
          fallProgress={easedFallProgress}
          gravity={gravity}
          wind={wind}
        />
      ))}
    </AbsoluteFill>
  );
});

ExplodeParticles.displayName = 'ExplodeParticles';

/**
 * 冲击波效果（优化版）
 */
export const ShockWave: React.FC<{
  centerX: number;
  centerY: number;
  startFrame: number;
  duration: number;
  maxRadius: number;
  color?: string;
}> = memo(({ centerX, centerY, startFrame, duration, maxRadius, color = "#ffd700" }) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  if (relativeFrame < 0 || relativeFrame > duration) {
    return null;
  }

  const progress = relativeFrame / duration;
  const radius = progress * maxRadius;
  const opacity = progress < 0.3 ? 0.8 - progress : 0.4 * (1 - progress / duration);
  const borderWidth = 20 - progress * 18;

  return (
    <div
      style={{
        position: "absolute",
        left: centerX - radius,
        top: centerY - radius,
        width: radius * 2,
        height: radius * 2,
        borderRadius: "50%",
        border: `${borderWidth}px solid ${color}`,
        opacity,
        boxShadow: `0 0 30px ${color}`,
        pointerEvents: "none",
      }}
    />
  );
});

ShockWave.displayName = 'ShockWave';

export default ExplodeParticles;