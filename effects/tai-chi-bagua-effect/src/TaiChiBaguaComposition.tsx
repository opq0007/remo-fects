import React, { useMemo } from "react";
import {
  AbsoluteFill,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
  Easing,
  spring,
} from "remotion";
import { z } from "zod";
import { TaiChi } from "./TaiChi";
import { Bagua } from "./Bagua";

// Schema 定义
export const TaiChiBaguaSchema = z.object({
  // 颜色配置
  yangColor: z.string().default("#FFD700"),
  yinColor: z.string().default("#1a1a1a"),
  backgroundColor: z.string().default("#FFFFFF"),
  
  // 发光效果
  glowIntensity: z.number().min(0).max(1).default(0.9),
  
  // 动画速度
  taichiRotationSpeed: z.number().min(0.1).max(5).default(1),
  baguaRotationSpeed: z.number().min(0.1).max(5).default(0.5),
  
  // 尺寸
  taichiSize: z.number().min(50).max(500).default(200),
  baguaRadius: z.number().min(100).max(600).default(280),
  
  // 显示选项
  showLabels: z.boolean().default(true),
  showParticles: z.boolean().default(true),
  showEnergyField: z.boolean().default(true),
  labelOffset: z.number().min(20).max(100).default(45),
  
  // 粒子效果
  particleCount: z.number().min(0).max(100).default(40),
  particleSpeed: z.number().min(0.1).max(3).default(1),
});

export type TaiChiBaguaProps = z.infer<typeof TaiChiBaguaSchema>;

// 能量场粒子
interface ParticleProps {
  index: number;
  total: number;
  centerX: number;
  centerY: number;
  speed: number;
  color: string;
  frame: number;
}

const EnergyParticle: React.FC<ParticleProps> = ({
  index,
  total,
  centerX,
  centerY,
  speed,
  color,
  frame,
}) => {
  const baseAngle = (index / total) * 360;
  const angleOffset = interpolate(frame * speed, [0, 360], [0, 360], {
    extrapolateRight: "extend",
  });
  const angle = (baseAngle + angleOffset) * (Math.PI / 180);
  
  // 波动半径 - 确保最小半径足够大，不会进入太极图区域
  const radiusBase = 220 + (index % 3) * 60;
  const radiusWave = interpolate(
    frame + index * 10,
    [0, 30, 60],
    [radiusBase, radiusBase + 30, radiusBase],
    { extrapolateRight: "extend" }
  );
  
  const x = centerX + Math.cos(angle) * radiusWave;
  const y = centerY + Math.sin(angle) * radiusWave;
  
  // 透明度波动
  const opacity = interpolate(
    frame + index * 5,
    [0, 15, 30],
    [0.2, 0.6, 0.2],
    { extrapolateRight: "extend" }
  );
  
  // 大小波动
  const size = interpolate(
    frame + index * 8,
    [0, 20, 40],
    [1.5, 3, 1.5],
    { extrapolateRight: "extend" }
  );

  return (
    <circle
      cx={x}
      cy={y}
      r={size}
      fill={color}
      opacity={opacity * 0.5}
    />
  );
};

// 能量场光环
const EnergyField: React.FC<{
  centerX: number;
  centerY: number;
  color: string;
  frame: number;
  intensity: number;
}> = ({ centerX, centerY, color, frame, intensity }) => {
  const rings = useMemo(() => {
    return [0, 1, 2, 3].map((i) => {
      const radius = 150 + i * 80;
      const opacity = interpolate(
        frame + i * 15,
        [0, 30, 60],
        [0.1, 0.3, 0.1],
        { extrapolateRight: "extend" }
      );
      const rotation = interpolate(frame, [0, 180], [0, 360], {
        extrapolateRight: "extend",
      });
      return { radius, opacity, rotation };
    });
  }, [frame]);

  return (
    <g>
      {rings.map((ring, i) => (
        <circle
          key={i}
          cx={centerX}
          cy={centerY}
          r={ring.radius}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={ring.opacity * intensity}
          strokeDasharray="20 10"
          transform={`rotate(${ring.rotation + i * 30}, ${centerX}, ${centerY})`}
        />
      ))}
    </g>
  );
};

// 主组合组件
export const TaiChiBaguaComposition: React.FC<TaiChiBaguaProps> = ({
  yangColor = "#FFD700",
  yinColor = "#1a1a1a",
  backgroundColor = "#FFFFFF",
  glowIntensity = 0.9,
  taichiRotationSpeed = 1,
  baguaRotationSpeed = 0.5,
  taichiSize = 200,
  baguaRadius = 280,
  showLabels = true,
  showParticles = true,
  showEnergyField = true,
  labelOffset = 45,
  particleCount = 40,
  particleSpeed = 1,
}) => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  
  const centerX = width / 2;
  const centerY = height / 2;

  // 整体入场动画
  const entranceProgress = spring({
    frame,
    fps: 30,
    config: {
      damping: 100,
      stiffness: 200,
      mass: 1,
    },
  });

  // 背景渐变动画
  const bgGradientAngle = interpolate(frame, [0, 360], [0, 360], {
    extrapolateRight: "extend",
  });

  // 八卦卦象大小
  const trigramSize = Math.min(60, taichiSize * 0.35);

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* 纯色背景 - 不使用渐变，避免在太极图区域产生杂色 */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <rect width={width} height={height} fill={backgroundColor} />
      </svg>

      {/* 主 SVG 画布 */}
      <svg
        width={width}
        height={height}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: `scale(${entranceProgress})`,
          opacity: entranceProgress,
        }}
      >
        <defs>
          {/* 全局滤镜 */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 能量场 */}
        {showEnergyField && (
          <EnergyField
            centerX={centerX}
            centerY={centerY}
            color={yangColor}
            frame={frame}
            intensity={glowIntensity}
          />
        )}

        {/* 能量粒子 */}
        {showParticles && (
          <g>
            {Array.from({ length: particleCount }).map((_, i) => (
              <EnergyParticle
                key={i}
                index={i}
                total={particleCount}
                centerX={centerX}
                centerY={centerY}
                speed={particleSpeed * (0.5 + (i % 3) * 0.3)}
                color={i % 2 === 0 ? yangColor : yinColor}
                frame={frame}
              />
            ))}
          </g>
        )}

        {/* 八卦 */}
        <g transform={`translate(${centerX}, ${centerY})`}>
          <Bagua
            radius={baguaRadius}
            trigramSize={trigramSize}
            yangColor={yangColor}
            rotationSpeed={baguaRotationSpeed}
            glowIntensity={glowIntensity}
            showLabels={showLabels}
            labelColor={yangColor}
            labelOffset={labelOffset}
          />
        </g>

        {/* 太极图 */}
        <g transform={`translate(${centerX}, ${centerY})`}>
          <TaiChi
            size={taichiSize}
            yangColor={yangColor}
            yinColor={yinColor}
            glowIntensity={glowIntensity}
            rotationSpeed={taichiRotationSpeed}
            pulseSpeed={1.5}
          />
        </g>
      </svg>

      {/* 四角装饰符文 */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <defs>
          <pattern id="runePattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1" fill={yangColor} opacity={0.3} />
          </pattern>
        </defs>
        
        {/* 边角符文 */}
        {[
          { x: 40, y: 40 },
          { x: width - 40, y: 40 },
          { x: 40, y: height - 40 },
          { x: width - 40, y: height - 40 },
        ].map((pos, i) => {
          const runeOpacity = interpolate(
            frame + i * 10,
            [0, 30, 60],
            [0.1, 0.4, 0.1],
            { extrapolateRight: "extend" }
          );
          return (
            <g key={i} transform={`translate(${pos.x}, ${pos.y})`}>
              <circle
                r={15}
                fill="none"
                stroke={yangColor}
                strokeWidth={1}
                opacity={runeOpacity * glowIntensity}
              />
              <circle
                r={8}
                fill="none"
                stroke={yangColor}
                strokeWidth={0.5}
                opacity={runeOpacity * glowIntensity * 0.7}
              />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
