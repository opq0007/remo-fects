import React, { useMemo } from "react";
import { 
  AbsoluteFill, 
  useCurrentFrame, 
  useVideoConfig, 
  interpolate,
  Easing
} from "remotion";
import { seededRandom } from "../../shared/index";

/**
 * 爆发粒子
 */
interface BurstParticle {
  id: number;
  text: string;
  angle: number;        // 发射角度
  speed: number;        // 发射速度
  startFrame: number;   // 出现帧
  size: number;         // 大小
  color: string;        // 颜色
  glowColor: string;    // 发光颜色
}

interface CenterBurstProps {
  words: string[];
  colors: string[];
  glowColor: string;
  baseFontSize: number;
  particleCount: number;
  burstInterval: number;    // 爆发间隔（帧）
  burstDuration: number;    // 单次爆发持续时间
  maxRadius: number;        // 最大扩散半径
  startFrame: number;
  enableGlow: boolean;
  glowIntensity: number;
}

/**
 * 中心爆发效果组件
 * 文字从中心爆发，向四周扩散，营造冲击感
 */
export const CenterBurst: React.FC<CenterBurstProps> = ({
  words,
  colors,
  glowColor,
  baseFontSize,
  particleCount,
  burstInterval,
  burstDuration,
  maxRadius,
  startFrame,
  enableGlow,
  glowIntensity,
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  
  const centerX = width / 2;
  const centerY = height / 2;
  
  // 生成所有爆发粒子 - 使用 durationInFrames 替代硬编码
  const bursts = useMemo(() => {
    const allBursts: BurstParticle[][] = [];
    const burstCount = Math.ceil(durationInFrames / burstInterval) + 1;
    
    for (let b = 0; b < burstCount; b++) {
      const burstStartFrame = startFrame + b * burstInterval;
      
      // 如果爆发开始时间超过视频时长，跳过
      if (burstStartFrame > durationInFrames) break;
      
      const particles: BurstParticle[] = [];
      
      // 每次爆发的粒子数量变化
      const particlesInBurst = Math.floor(particleCount * (0.5 + seededRandom(`burst-count-${b}`) * 0.5));
      
      for (let i = 0; i < particlesInBurst; i++) {
        const angle = (i / particlesInBurst) * Math.PI * 2 + seededRandom(`burst-angle-${b}-${i}`) * 0.5;
        const speed = 0.5 + seededRandom(`burst-speed-${b}-${i}`) * 0.5;
        
        particles.push({
          id: i,
          text: words[i % words.length],
          angle,
          speed,
          startFrame: burstStartFrame,
          size: baseFontSize * (0.4 + seededRandom(`burst-size-${b}-${i}`) * 0.6),
          color: colors[i % colors.length],
          glowColor,
        });
      }
      
      allBursts.push(particles);
    }
    
    return allBursts;
  }, [words, colors, glowColor, baseFontSize, particleCount, burstInterval, startFrame, durationInFrames]);
  
  return (
    <AbsoluteFill>
      {bursts.flatMap((burst, burstIndex) => 
        burst.map((particle) => {
          const elementFrame = frame - particle.startFrame;
          
          if (elementFrame < 0 || elementFrame > burstDuration) return null;
          
          // 使用缓动函数：先快后慢（爆发效果）
          const progress = Easing.out(Easing.cubic)(
            interpolate(elementFrame, [0, burstDuration], [0, 1], { extrapolateRight: "clamp" as const, extrapolateLeft: "clamp" as const })
          );
          
          // 计算位置（从中心向外扩散）
          const distance = progress * maxRadius * particle.speed;
          const x = centerX + Math.cos(particle.angle) * distance;
          const y = centerY + Math.sin(particle.angle) * distance;
          
          // 透明度变化：先出现，再消失
          const opacity = interpolate(
            elementFrame,
            [0, burstDuration * 0.3, burstDuration * 0.7, burstDuration],
            [0, 1, 1, 0],
            { extrapolateRight: "clamp" as const, extrapolateLeft: "clamp" as const }
          );
          
          // 缩放变化：先放大，再缩小
          const scale = interpolate(
            elementFrame,
            [0, burstDuration * 0.2, burstDuration],
            [0.5, 1.2, 0.8],
            { extrapolateRight: "clamp" as const, extrapolateLeft: "clamp" as const }
          );
          
          // 旋转
          const rotation = particle.angle * (180 / Math.PI) + progress * 90;
          
          // 发光效果
          const textShadow = enableGlow
            ? `
                0 0 ${5 * glowIntensity}px ${particle.glowColor},
                0 0 ${15 * glowIntensity}px ${particle.glowColor},
                0 0 ${30 * glowIntensity}px ${particle.glowColor}
              `
            : 'none';
          
          return (
            <div
              key={`${burstIndex}-${particle.id}`}
              style={{
                position: "absolute",
                left: x,
                top: y,
                transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
                fontSize: particle.size,
                fontWeight: "bold",
                color: particle.color,
                textShadow,
                opacity,
                whiteSpace: "nowrap",
                fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
                willChange: "transform, opacity",
              }}
            >
              {particle.text}
            </div>
          );
        })
      )}
    </AbsoluteFill>
  );
};

export default CenterBurst;
