import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

interface FireworkProps {
  text: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  launchFrame: number;
  explodeFrame: number;
  fontSize: number;
  textColor: string;
  glowColor: string;
  glowIntensity: number;
  particleCount: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  type: 'spark' | 'star' | 'ring';
  life: number;
  decay: number;
}

interface ExplosionRing {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  color: string;
}

export const Firework: React.FC<FireworkProps> = ({
  text,
  startX,
  startY,
  targetX,
  targetY,
  launchFrame,
  explodeFrame,
  fontSize,
  textColor,
  glowColor,
  glowIntensity,
  particleCount,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // 计算发射进度
  const launchProgress = Math.min(1, Math.max(0, (frame - launchFrame) / (explodeFrame - launchFrame)));
  
  // 当前火箭位置（使用缓动效果）
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
  const rocketX = interpolate(easeOut(launchProgress), [0, 1], [startX, targetX]);
  const rocketY = interpolate(easeOut(launchProgress), [0, 1], [startY, targetY]);

  // 生成增强的爆炸粒子（多种类型）
  const particles = React.useMemo(() => {
    const particles: Particle[] = [];
    
    // 使用确定性随机数生成器（基于 text 的哈希）
    const textHash = text.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
    const seededRandom = (seed: number) => {
      const x = Math.sin((textHash + seed) * 9999) * 10000;
      return x - Math.floor(x);
    };
    
    // 1. 主要爆炸粒子（火花）
    const sparkCount = Math.floor(particleCount * 0.6);
    for (let i = 0; i < sparkCount; i++) {
      const angle = (i / sparkCount) * Math.PI * 2;
      const randomSpeed = seededRandom(i * 7 + 1);
      const randomSize = seededRandom(i * 13 + 2);
      const randomColor = seededRandom(i * 17 + 3);
      const randomDecay = seededRandom(i * 23 + 4);
      const speed = 3 + randomSpeed * 4;
      particles.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + randomSize * 3,
        opacity: 1,
        color: randomColor > 0.5 ? glowColor : textColor,
        type: 'spark',
        life: 1,
        decay: 0.015 + randomDecay * 0.01,
      });
    }
    
    // 2. 星星粒子（十字星效果）
    const starCount = Math.floor(particleCount * 0.25);
    for (let i = 0; i < starCount; i++) {
      const angle = (i / starCount) * Math.PI * 2;
      const randomSpeed = seededRandom(i * 31 + 100);
      const randomSize = seededRandom(i * 37 + 101);
      const randomDecay = seededRandom(i * 41 + 102);
      const speed = 2 + randomSpeed * 3;
      particles.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + randomSize * 4,
        opacity: 1,
        color: '#ffffff',
        type: 'star',
        life: 1,
        decay: 0.02 + randomDecay * 0.01,
      });
    }
    
    // 3. 环形粒子（外圈光环）
    const ringCount = Math.floor(particleCount * 0.15);
    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2;
      const randomSpeed = seededRandom(i * 43 + 200);
      const randomSize = seededRandom(i * 47 + 201);
      const randomDecay = seededRandom(i * 53 + 202);
      const speed = 4 + randomSpeed * 2;
      particles.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + randomSize * 2,
        opacity: 1,
        color: glowColor,
        type: 'ring',
        life: 1,
        decay: 0.01 + randomDecay * 0.005,
      });
    }
    
    return particles;
  }, [particleCount, glowColor, textColor, text]);

  // 爆炸波纹效果
  const explosionRings = React.useMemo(() => {
    const rings: ExplosionRing[] = [];
    for (let i = 0; i < 3; i++) {
      rings.push({
        x: 0,
        y: 0,
        radius: 0,
        opacity: 1,
        color: glowColor,
      });
    }
    return rings;
  }, [glowColor]);

  // 计算爆炸后的粒子位置
  const explosionProgress = Math.max(0, (frame - explodeFrame) / 80); // 80帧内完成
  
  const renderedParticles = particles.map((particle, index) => {
    if (frame < explodeFrame) return null;
    
    const progress = Math.min(1, explosionProgress);
    const gravity = 0.12;
    
    // 粒子生命周期（基于进度计算，不修改原始对象）
    const life = Math.max(0, 1 - progress * (particle.decay * 80));
    if (life <= 0) return null;
    
    const x = targetX + particle.vx * progress * 60;
    const y = targetY + particle.vy * progress * 60 + 0.5 * gravity * Math.pow(progress * 60, 2);
    const opacity = life;
    const size = particle.size * (1 - progress * 0.3);
    
    // 根据粒子类型渲染不同效果
    if (particle.type === 'star') {
      // 十字星效果
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: size * 4,
            height: size,
            backgroundColor: particle.color,
            opacity: opacity,
            boxShadow: `0 0 ${size * glowIntensity * 2}px ${particle.color}`,
            filter: "blur(0.3px)",
            zIndex: 5,
          }}
        />
      );
    } else if (particle.type === 'ring') {
      // 环形粒子
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: x - size / 2,
            top: y - size / 2,
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: particle.color,
            opacity: opacity * 0.7,
            boxShadow: `0 0 ${size * glowIntensity * 1.5}px ${particle.color}`,
            filter: "blur(1px)",
            zIndex: 4,
          }}
        />
      );
    } else {
      // 普通火花
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: particle.color,
            opacity: opacity,
            boxShadow: `0 0 ${size * glowIntensity}px ${particle.color}`,
            filter: "blur(0.5px)",
            zIndex: 3,
          }}
        />
      );
    }
  });

  // 渲染爆炸波纹
  const renderedRings = explosionRings.map((ring, index) => {
    if (frame < explodeFrame) return null;
    
    const progress = Math.min(1, (frame - explodeFrame) / 30);
    const ringRadius = progress * 80 + index * 30;
    const ringOpacity = Math.max(0, 1 - progress);
    
    return (
      <div
        key={`ring-${index}`}
        style={{
          position: "absolute",
          left: targetX,
          top: targetY,
          transform: "translate(-50%, -50%)",
          width: ringRadius * 2,
          height: ringRadius * 2,
          borderRadius: "50%",
          border: `2px solid ${ring.color}`,
          opacity: ringOpacity * 0.5,
          boxShadow: `0 0 ${20 * glowIntensity}px ${ring.color}`,
          filter: "blur(1px)",
          zIndex: 2,
        }}
      />
    );
  });

  // 爆炸闪光效果
  const flashOpacity = frame >= explodeFrame && frame < explodeFrame + 5 
    ? interpolate(frame, [explodeFrame, explodeFrame + 5], [1, 0], { extrapolateRight: 'clamp' })
    : 0;

  return (
    <>
      {/* 发射火箭 */}
      {frame >= launchFrame && frame < explodeFrame && (
        <>
          <div
            style={{
              position: "absolute",
              left: rocketX - 3,
              top: rocketY - 8,
              width: 6,
              height: 16,
              background: `linear-gradient(to bottom, ${glowColor}, ${textColor})`,
              borderRadius: "3px",
              boxShadow: `0 0 ${10 * glowIntensity}px ${glowColor}, 0 0 ${20 * glowIntensity}px ${textColor}`,
              zIndex: 10,
            }}
          />
          {/* 火箭尾迹 */}
          <div
            style={{
              position: "absolute",
              left: rocketX - 2,
              top: rocketY + 8,
              width: 4,
              height: 20 * launchProgress,
              background: `linear-gradient(to bottom, transparent, ${glowColor}, ${textColor})`,
              opacity: 0.8,
              borderRadius: "2px",
              zIndex: 9,
            }}
          />
          {/* 火箭头光晕 */}
          <div
            style={{
              position: "absolute",
              left: rocketX - 4,
              top: rocketY - 10,
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: glowColor,
              opacity: 0.9,
              boxShadow: `0 0 ${15 * glowIntensity}px ${glowColor}, 0 0 ${30 * glowIntensity}px ${textColor}`,
              filter: "blur(2px)",
              zIndex: 11,
            }}
          />
        </>
      )}
      
      {/* 爆炸闪光 */}
      {flashOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            left: targetX,
            top: targetY,
            transform: "translate(-50%, -50%)",
            width: 100,
            height: 100,
            borderRadius: "50%",
            backgroundColor: glowColor,
            opacity: flashOpacity * 0.8,
            filter: "blur(30px)",
            zIndex: 1,
          }}
        />
      )}
      
      {/* 爆炸波纹 */}
      {renderedRings}
      
      {/* 爆炸文字 */}
      {frame >= explodeFrame && (
        <>
          <div
            style={{
              position: "absolute",
              left: targetX,
              top: targetY,
              transform: "translate(-50%, -50%)",
              fontSize: fontSize,
              fontWeight: "bold",
              color: textColor,
              textShadow: `
                0 0 ${20 * glowIntensity}px ${glowColor},
                0 0 ${40 * glowIntensity}px ${glowColor},
                0 0 ${60 * glowIntensity}px ${textColor},
                0 0 ${80 * glowIntensity}px ${textColor}
              `,
              opacity: Math.max(0, 1 - explosionProgress * 0.8),
              whiteSpace: "nowrap",
              fontFamily: "PingFang SC, Microsoft YaHei, SimHei, sans-serif",
              letterSpacing: "4px",
              zIndex: 10,
            }}
          >
            {text}
          </div>
          {/* 文字外发光环 */}
          <div
            style={{
              position: "absolute",
              left: targetX,
              top: targetY,
              transform: "translate(-50%, -50%)",
              fontSize: fontSize,
              fontWeight: "bold",
              color: "transparent",
              WebkitTextStroke: `2px ${glowColor}`,
              opacity: Math.max(0, (1 - explosionProgress * 0.8) * 0.5),
              whiteSpace: "nowrap",
              fontFamily: "PingFang SC, Microsoft YaHei, SimHei, sans-serif",
              letterSpacing: "4px",
              zIndex: 9,
            }}
          >
            {text}
          </div>
        </>
      )}
      
      {/* 爆炸粒子 */}
      {renderedParticles}
    </>
  );
};