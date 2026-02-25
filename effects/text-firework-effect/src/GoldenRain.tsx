import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

interface CoinParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  sparkle: boolean;
  sparklePhase: number;
}

interface GoldenRainProps {
  particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    color: string;
  }>;
  startFrame: number;
  duration: number;
  gravity: number;
  wind: number;
  color: string;
  glowColor: string;
  glowIntensity: number;
}

// 使用确定性随机数生成器（移到组件外部）
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

export const GoldenRain: React.FC<GoldenRainProps> = ({
  particles,
  startFrame,
  duration,
  gravity,
  wind,
  color,
  glowColor,
  glowIntensity,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // 所有 Hooks 必须在条件语句之前调用
  // 计算经过的帧数
  const elapsedFrames = Math.max(0, frame - startFrame);
  const progress = Math.min(1, elapsedFrames / duration);

  // 转换粒子为金币粒子（使用确定性随机数）
  // 注意：useMemo 必须在条件返回之前调用
  const coins = React.useMemo(() => {
    return particles.map((particle, index) => ({
      ...particle,
      rotation: seededRandom(index * 7 + 1) * 360,
      rotationSpeed: (seededRandom(index * 13 + 2) - 0.5) * 5,
      sparkle: seededRandom(index * 17 + 3) > 0.6,
      sparklePhase: seededRandom(index * 23 + 4) * Math.PI * 2,
    }));
  }, [particles]);

  // 在 startFrame 之前不渲染任何粒子
  // 注意：这个条件判断必须在所有 Hooks 之后
  if (frame < startFrame) {
    return null;
  }

  const renderedCoins = coins.map((coin, index) => {
    // 简化的物理模拟
    // 每帧移动距离：速度 + 重力加速度
    const t = elapsedFrames;
    
    // X轴：初始速度 + 风力影响
    const x = coin.x + coin.vx * t + wind * t * t * 0.01;
    
    // Y轴：初始速度（向上）+ 重力向下加速
    // 重力让金币先上升后下落
    const y = coin.y + coin.vy * t + gravity * t * t * 0.5;
    
    // 金币旋转
    const rotation = coin.rotation + coin.rotationSpeed * t;
    
    // 闪烁效果
    let sparkleOpacity = 1;
    if (coin.sparkle) {
      const sparkleWave = Math.sin(coin.sparklePhase + t * 0.1);
      sparkleOpacity = 0.6 + sparkleWave * 0.4;
    }
    
    // 计算透明度（逐渐消失）
    const opacity = coin.opacity * sparkleOpacity * Math.max(0, 1 - progress * 0.5);
    
    // 检查是否在屏幕内
    const isVisible = x >= -30 && x <= width + 30 && y >= -30 && y <= height + 30;
    
    // 超出屏幕或完全透明则不渲染
    if (!isVisible || opacity < 0.05) return null;
    
    const size = Math.max(3, coin.size * Math.max(0.6, 1 - progress * 0.2));
    
    return (
      <div
        key={index}
        style={{
          position: "absolute",
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          opacity: opacity,
          zIndex: 5,
        }}
      >
        {/* 金币主体 */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, #fff7e6 0%, ${color} 25%, ${glowColor} 60%, #b8860b 100%)`,
            boxShadow: `
              0 0 ${size * glowIntensity * 0.8}px ${color},
              0 0 ${size * glowIntensity * 1.5}px ${glowColor},
              inset 0 0 ${size * 0.4}px rgba(255, 255, 255, 0.6),
              inset 0 0 ${size * 0.6}px rgba(0, 0, 0, 0.3)
            `,
            transform: `rotate(${rotation}deg)`,
            position: "relative",
          }}
        >
          {/* 金币边缘高光 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: "50%",
              border: `${size * 0.1}px solid rgba(255, 255, 255, 0.5)`,
              boxSizing: "border-box",
            }}
          />
          {/* 金币内圈 */}
          <div
            style={{
              position: "absolute",
              top: size * 0.2,
              left: size * 0.2,
              right: size * 0.2,
              bottom: size * 0.2,
              borderRadius: "50%",
              border: `${size * 0.06}px solid rgba(255, 215, 0, 0.7)`,
            }}
          />
          {/* 金币中心闪光 */}
          {coin.sparkle && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: size * 0.5,
                height: size * 0.5,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, transparent 80%)",
              }}
            />
          )}
        </div>
      </div>
    );
  });

  return <>{renderedCoins}</>;
};

// 生成金币粒子的工具函数（使用确定性随机数）
export const generateGoldenParticles = (
  centerX: number,
  centerY: number,
  count: number,
  baseSize: number = 3,
  color: string = "#ffd700",
  glowColor: string = "#ffaa00",
  seed: number = 42
) => {
  const particles = [];
  
  for (let i = 0; i < count; i++) {
    const randomAngle = seededRandom(i * 7 + 1 + seed);
    const randomSpeed = seededRandom(i * 13 + 2 + seed);
    const randomSize = seededRandom(i * 17 + 3 + seed);
    const randomOpacity = seededRandom(i * 23 + 4 + seed);
    const randomColor = seededRandom(i * 29 + 5 + seed);
    
    const angle = randomAngle * Math.PI * 2;
    const speed = 0.8 + randomSpeed * 1.5;
    
    particles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5, // 向上爆发，速度更快
      size: baseSize + randomSize * baseSize,
      opacity: 0.8 + randomOpacity * 0.2,
      color: randomColor > 0.5 ? glowColor : color,
    });
  }
  
  return particles;
};