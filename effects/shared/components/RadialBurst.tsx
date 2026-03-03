/**
 * 中心发散粒子效果组件
 * 
 * 支持多种酷炫效果：佛光普照、金色光线、放射性流星雨等
 */

import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, random } from "remotion";

// ==================== 类型定义 ====================

/**
 * 发散效果类型
 */
export type RadialBurstEffectType = 
  | "buddhaLight"      // 佛光普照：多层光环向外扩散
  | "goldenRays"       // 金色光线：从中心发射的光束
  | "meteorShower"     // 放射性流星雨：粒子从中心向外飞散
  | "sparkleBurst";    // 闪光爆发：闪烁的粒子爆发

/**
 * RadialBurst 组件 Props
 */
export interface RadialBurstProps {
  /** 是否启用效果 */
  enabled?: boolean;
  
  /** 效果类型 */
  effectType?: RadialBurstEffectType;
  
  /** 主颜色 */
  color?: string;
  
  /** 次颜色（用于渐变或多色效果） */
  secondaryColor?: string;
  
  /** 效果强度 (0-2) */
  intensity?: number;
  
  /** 垂直偏移 (0=顶部, 0.5=居中, 1=底部) */
  verticalOffset?: number;
  
  /** 粒子/光线数量 */
  count?: number;
  
  /** 动画速度系数 */
  speed?: number;
  
  /** 整体透明度 (0-1) */
  opacity?: number;
  
  /** 随机种子 */
  seed?: number;
  
  /** 是否旋转 */
  rotate?: boolean;
  
  /** 旋转速度 */
  rotationSpeed?: number;
}

// ==================== 工具函数 ====================

/**
 * 确定性伪随机数生成器
 */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

/**
 * 颜色透明度处理
 */
function colorWithAlpha(color: string, alpha: number): string {
  // 移除 # 号
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ==================== 效果组件 ====================

/**
 * 佛光普照效果
 * 多层光环从中心向外扩散
 */
const BuddhaLightEffect: React.FC<{
  color: string;
  secondaryColor: string;
  intensity: number;
  speed: number;
  opacity: number;
  count: number;
  centerY: number;
}> = ({ color, secondaryColor, intensity, speed, opacity, count, centerY }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const centerX = width / 2;

  const rings = useMemo(() => {
    const result: Array<{
      radius: number;
      opacity: number;
      speed: number;
    }> = [];
    for (let i = 0; i < count; i++) {
      result.push({
        radius: 50 + i * 40,
        opacity: 0.8 - i * 0.1,
        speed: 0.5 + i * 0.2,
      });
    }
    return result;
  }, [count]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {rings.map((ring, i) => {
        const progress = (frame * speed * ring.speed * 0.02) % 1;
        const currentRadius = ring.radius + progress * Math.max(width, height) * 0.5;
        const ringOpacity = ring.opacity * (1 - progress) * intensity * opacity;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: centerX,
              top: centerY,
              width: currentRadius * 2,
              height: currentRadius * 2,
              borderRadius: "50%",
              border: `2px solid ${colorWithAlpha(color, ringOpacity)}`,
              transform: "translate(-50%, -50%)",
              boxShadow: `
                0 0 ${20 * intensity}px ${colorWithAlpha(color, ringOpacity * 0.5)},
                inset 0 0 ${30 * intensity}px ${colorWithAlpha(secondaryColor, ringOpacity * 0.3)}
              `,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * 金色光线效果
 * 从中心发射的光束
 */
const GoldenRaysEffect: React.FC<{
  color: string;
  secondaryColor: string;
  intensity: number;
  speed: number;
  opacity: number;
  count: number;
  centerY: number;
  rotate: boolean;
  rotationSpeed: number;
}> = ({ color, secondaryColor, intensity, speed, opacity, count, centerY, rotate, rotationSpeed }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const centerX = width / 2;

  const rotation = rotate ? frame * rotationSpeed * 0.5 : 0;

  const rays = useMemo(() => {
    const result: Array<{ angle: number; length: number; width: number }> = [];
    for (let i = 0; i < count; i++) {
      result.push({
        angle: (i / count) * 360,
        length: 0.6 + Math.random() * 0.4,
        width: 2 + Math.random() * 4,
      });
    }
    return result;
  }, [count]);

  const maxLength = Math.max(width, height);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: centerX,
          top: centerY,
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        }}
      >
        {rays.map((ray, i) => {
          const pulseOpacity = 0.5 + Math.sin(frame * speed * 0.05 + i * 0.5) * 0.3;
          
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: ray.width,
                height: maxLength * ray.length,
                background: `linear-gradient(to top, 
                  ${colorWithAlpha(color, pulseOpacity * intensity * opacity)} 0%, 
                  ${colorWithAlpha(secondaryColor, pulseOpacity * intensity * opacity * 0.5)} 50%,
                  transparent 100%
                )`,
                transformOrigin: "bottom center",
                transform: `translate(-50%, -100%) rotate(${ray.angle}deg)`,
                filter: `blur(${ray.width > 3 ? 2 : 1}px)`,
              }}
            />
          );
        })}
      </div>
      
      {/* 中心光点 */}
      <div
        style={{
          position: "absolute",
          left: centerX,
          top: centerY,
          width: 30 * intensity,
          height: 30 * intensity,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color} 0%, ${secondaryColor} 50%, transparent 70%)`,
          transform: "translate(-50%, -50%)",
          opacity: opacity * intensity,
          filter: `blur(${5 * intensity}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * 放射性流星雨效果
 * 粒子从中心向外飞散
 */
const MeteorShowerEffect: React.FC<{
  color: string;
  secondaryColor: string;
  intensity: number;
  speed: number;
  opacity: number;
  count: number;
  centerY: number;
  seed: number;
}> = ({ color, secondaryColor, intensity, speed, opacity, count, centerY, seed }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const centerX = width / 2;

  const particles = useMemo(() => {
    const rand = seededRandom(seed);
    const result: Array<{
      angle: number;
      size: number;
      speed: number;
      delay: number;
      length: number;
    }> = [];
    for (let i = 0; i < count; i++) {
      result.push({
        angle: rand() * 360,
        size: 2 + rand() * 4,
        speed: 0.5 + rand() * 0.5,
        delay: rand() * 100,
        length: 20 + rand() * 40,
      });
    }
    return result;
  }, [count, seed]);

  const maxRadius = Math.max(width, height) * 0.6;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {particles.map((particle, i) => {
        const adjustedFrame = Math.max(0, frame - particle.delay);
        const progress = (adjustedFrame * speed * particle.speed * 0.01) % 1;
        const distance = progress * maxRadius;
        
        const rad = (particle.angle * Math.PI) / 180;
        const x = centerX + Math.cos(rad) * distance;
        const y = centerY + Math.sin(rad) * distance;
        
        const particleOpacity = (1 - progress * progress) * intensity * opacity;
        const tailOpacity = particleOpacity * 0.3;

        return (
          <div key={i}>
            {/* 流星尾巴 */}
            <div
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: particle.length,
                height: particle.size,
                background: `linear-gradient(to left, 
                  ${colorWithAlpha(color, particleOpacity)} 0%, 
                  ${colorWithAlpha(secondaryColor, tailOpacity)} 50%,
                  transparent 100%
                )`,
                transform: `translate(-${particle.length}px, -${particle.size / 2}px) rotate(${particle.angle + 180}deg)`,
                borderRadius: particle.size,
              }}
            />
            {/* 流星头部 */}
            <div
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: particle.size,
                height: particle.size,
                borderRadius: "50%",
                backgroundColor: color,
                opacity: particleOpacity,
                transform: "translate(-50%, -50%)",
                boxShadow: `0 0 ${particle.size * 2}px ${colorWithAlpha(color, particleOpacity)}`,
              }}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * 闪光爆发效果
 */
const SparkleBurstEffect: React.FC<{
  color: string;
  secondaryColor: string;
  intensity: number;
  speed: number;
  opacity: number;
  count: number;
  centerY: number;
  seed: number;
}> = ({ color, secondaryColor, intensity, speed, opacity, count, centerY, seed }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const centerX = width / 2;

  const sparkles = useMemo(() => {
    const rand = seededRandom(seed);
    const result: Array<{
      angle: number;
      distance: number;
      size: number;
      twinkleSpeed: number;
      twinkleOffset: number;
    }> = [];
    for (let i = 0; i < count; i++) {
      result.push({
        angle: rand() * 360,
        distance: 50 + rand() * 300,
        size: 3 + rand() * 8,
        twinkleSpeed: 0.5 + rand() * 2,
        twinkleOffset: rand() * Math.PI * 2,
      });
    }
    return result;
  }, [count, seed]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {sparkles.map((sparkle, i) => {
        const rad = (sparkle.angle * Math.PI) / 180;
        const x = centerX + Math.cos(rad) * sparkle.distance;
        const y = centerY + Math.sin(rad) * sparkle.distance;
        
        const twinkle = Math.sin(frame * speed * 0.1 * sparkle.twinkleSpeed + sparkle.twinkleOffset);
        const sparkleOpacity = (0.5 + twinkle * 0.5) * intensity * opacity;
        const scale = 0.8 + twinkle * 0.4;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: sparkle.size,
              height: sparkle.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, 
                ${color} 0%, 
                ${secondaryColor} 40%, 
                transparent 70%
              )`,
              opacity: sparkleOpacity,
              transform: `translate(-50%, -50%) scale(${scale})`,
              boxShadow: `
                0 0 ${sparkle.size * 2}px ${colorWithAlpha(color, sparkleOpacity)},
                0 0 ${sparkle.size * 4}px ${colorWithAlpha(secondaryColor, sparkleOpacity * 0.5)}
              `,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ==================== 主组件 ====================

/**
 * 中心发散粒子效果组件
 * 
 * 支持多种酷炫效果：佛光普照、金色光线、放射性流星雨等
 * 
 * @example
 * // 佛光普照效果
 * <RadialBurst
 *   enabled
 *   effectType="buddhaLight"
 *   color="#FFD700"
 *   intensity={1}
 * />
 * 
 * // 金色光线效果
 * <RadialBurst
 *   enabled
 *   effectType="goldenRays"
 *   color="#FFA500"
 *   count={12}
 *   rotate
 * />
 * 
 * // 放射性流星雨
 * <RadialBurst
 *   enabled
 *   effectType="meteorShower"
 *   color="#FF6B6B"
 *   count={50}
 *   speed={1.5}
 * />
 */
export const RadialBurst: React.FC<RadialBurstProps> = ({
  enabled = true,
  effectType = "goldenRays",
  color = "#FFD700",
  secondaryColor = "#FFA500",
  intensity = 1,
  verticalOffset = 0.5,
  count = 8,
  speed = 1,
  opacity = 1,
  seed = 42,
  rotate = true,
  rotationSpeed = 1,
}) => {
  const { height } = useVideoConfig();

  if (!enabled) return null;

  // 计算中心点 Y 坐标
  const centerY = verticalOffset * height;

  // 通用 props
  const commonProps = {
    color,
    secondaryColor,
    intensity: Math.min(2, Math.max(0, intensity)),
    speed,
    opacity: Math.min(1, Math.max(0, opacity)),
    count,
    centerY,
  };

  // 根据效果类型渲染对应组件
  switch (effectType) {
    case "buddhaLight":
      return <BuddhaLightEffect {...commonProps} />;
    
    case "goldenRays":
      return (
        <GoldenRaysEffect
          {...commonProps}
          rotate={rotate}
          rotationSpeed={rotationSpeed}
        />
      );
    
    case "meteorShower":
      return <MeteorShowerEffect {...commonProps} seed={seed} />;
    
    case "sparkleBurst":
      return <SparkleBurstEffect {...commonProps} seed={seed} />;
    
    default:
      return <GoldenRaysEffect {...commonProps} rotate={rotate} rotationSpeed={rotationSpeed} />;
  }
};

export default RadialBurst;
