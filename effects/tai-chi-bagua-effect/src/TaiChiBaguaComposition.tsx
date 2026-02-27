import React, { useMemo } from "react";
import {
  AbsoluteFill,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
  Easing,
  spring,
  Audio,
  staticFile,
} from "remotion";
import { z } from "zod";
import { TaiChi } from "./TaiChi";
import { Bagua } from "./Bagua";
import {
  Background,
  BackgroundType,
  BackgroundSchema,
  OverlaySchema,
  AudioSchema,
  WatermarkSchema,
  Watermark,
} from "../../shared/index";

// ==================== Schema 定义（使用公共 Schema）====================

export const TaiChiBaguaSchema = BackgroundSchema.extend({
  // 颜色配置
  yangColor: z.string().default("#FFD700"),
  yinColor: z.string().default("#1a1a1a"),
  
  // 发光效果
  glowIntensity: z.number().min(0).max(1).default(0.9),
  
  // 动画速度
  taichiRotationSpeed: z.number().min(0.1).max(5).default(1),
  baguaRotationSpeed: z.number().min(0.1).max(5).default(0.8),
  
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
  
  // 3D视角
  viewAngle: z.number().min(0).max(90).default(30),
  perspectiveDistance: z.number().min(200).max(2000).default(800),

  // 垂直位置
  verticalPosition: z.number().min(0).max(1).step(0.01).default(0.5),
  verticalMargin: z.number().min(0).max(300).step(1).default(50),
  
  // 3D立体效果
  enable3D: z.boolean().default(false),
  depth3D: z.number().min(5).max(50).default(15),
  
  // 金光闪闪效果
  enableGoldenSparkle: z.boolean().default(true),
  sparkleDensity: z.number().min(10).max(100).default(30),
  
  // 神秘氛围效果
  enableMysticalAura: z.boolean().default(true),
  auraIntensity: z.number().min(0).max(1).default(0.6),

  // 遮罩效果（从 OverlaySchema 继承）
  ...OverlaySchema.shape,

  // 音效配置（使用公共 Schema）
  ...AudioSchema.shape,

  // 水印配置（使用公共 Schema）
  ...WatermarkSchema.shape,
});

export type TaiChiBaguaProps = z.infer<typeof TaiChiBaguaSchema>;

// ==================== 子组件 ====================

// 金光闪闪粒子
const GoldenSparkle: React.FC<{
  index: number;
  centerX: number;
  centerY: number;
  maxRadius: number;
  color: string;
  frame: number;
}> = ({ index, centerX, centerY, maxRadius, color, frame }) => {
  const seed = index * 137.5;
  const angleRad = (seed % 360) * (Math.PI / 180);
  const radiusOffset = (seed % 100) / 100;
  const baseRadius = maxRadius * 0.3 + maxRadius * 0.7 * radiusOffset;
  
  const x = centerX + Math.cos(angleRad) * baseRadius;
  const y = centerY + Math.sin(angleRad) * baseRadius;
  
  const frequency = 15 + (index % 10) * 2;
  const phase = index * 13;
  const twinkle = interpolate(
    (frame + phase) % frequency,
    [0, frequency / 2, frequency],
    [0, 1, 0],
    { extrapolateRight: "extend" }
  );
  
  const size = interpolate(twinkle, [0, 1], [1, 4]);
  const opacity = interpolate(twinkle, [0, 1], [0, 0.9]);

  return (
    <g>
      <circle cx={x} cy={y} r={size} fill={color} opacity={opacity} />
      {twinkle > 0.5 && (
        <>
          <line x1={x - size * 3} y1={y} x2={x + size * 3} y2={y} stroke={color} strokeWidth={0.5} opacity={opacity * 0.5} />
          <line x1={x} y1={y - size * 3} x2={x} y2={y + size * 3} stroke={color} strokeWidth={0.5} opacity={opacity * 0.5} />
        </>
      )}
    </g>
  );
};

// 神秘氛围效果
const MysticalAura: React.FC<{
  centerX: number;
  centerY: number;
  color: string;
  frame: number;
  intensity: number;
  size: number;
}> = ({ centerX, centerY, color, frame, intensity, size }) => {
  const haloPulse = interpolate(frame, [0, 60, 120], [0.8, 1, 0.8], { extrapolateRight: "extend", easing: Easing.inOut(Easing.sin) });
  const beamRotation = interpolate(frame, [0, 180], [0, 360], { extrapolateRight: "extend" });

  return (
    <g>
      <circle cx={centerX} cy={centerY} r={size * 2.5 * haloPulse} fill="none" stroke={color} strokeWidth={2} opacity={0.15 * intensity} filter="url(#glow)" />
      <circle cx={centerX} cy={centerY} r={size * 1.8 * haloPulse} fill="none" stroke={color} strokeWidth={3} opacity={0.25 * intensity} filter="url(#glow)" />
      <circle cx={centerX} cy={centerY} r={size * 1.2} fill={color} opacity={0.08 * intensity} filter="blur(20px)" />
      <g transform={`rotate(${beamRotation}, ${centerX}, ${centerY})`}>
        {[0, 45, 90, 135].map((angle, i) => (
          <line
            key={i}
            x1={centerX}
            y1={centerY}
            x2={centerX + Math.cos((angle * Math.PI) / 180) * size * 3}
            y2={centerY + Math.sin((angle * Math.PI) / 180) * size * 3}
            stroke={color}
            strokeWidth={1}
            opacity={0.2 * intensity}
            filter="blur(2px)"
          />
        ))}
      </g>
      <circle cx={centerX} cy={centerY} r={size * 2} fill="none" stroke={color} strokeWidth={0.5} opacity={0.3 * intensity} strokeDasharray="15 10 5 10" transform={`rotate(${-beamRotation * 0.5}, ${centerX}, ${centerY})`} />
    </g>
  );
};

// 能量场粒子
const EnergyParticle: React.FC<{
  index: number;
  total: number;
  centerX: number;
  centerY: number;
  speed: number;
  color: string;
  frame: number;
}> = ({ index, total, centerX, centerY, speed, color, frame }) => {
  const baseAngle = (index / total) * 360;
  const angleOffset = interpolate(frame * speed, [0, 360], [0, 360], { extrapolateRight: "extend" });
  const angle = (baseAngle + angleOffset) * (Math.PI / 180);
  
  const radiusBase = 220 + (index % 3) * 60;
  const radiusWave = interpolate(frame + index * 10, [0, 30, 60], [radiusBase, radiusBase + 30, radiusBase], { extrapolateRight: "extend" });
  
  const x = centerX + Math.cos(angle) * radiusWave;
  const y = centerY + Math.sin(angle) * radiusWave;
  const opacity = interpolate(frame + index * 5, [0, 15, 30], [0.2, 0.6, 0.2], { extrapolateRight: "extend" });
  const size = interpolate(frame + index * 8, [0, 20, 40], [1.5, 3, 1.5], { extrapolateRight: "extend" });

  return <circle cx={x} cy={y} r={size} fill={color} opacity={opacity * 0.5} />;
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
      const opacity = interpolate(frame + i * 15, [0, 30, 60], [0.1, 0.3, 0.1], { extrapolateRight: "extend" });
      const rotation = interpolate(frame, [0, 180], [0, 360], { extrapolateRight: "extend" });
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

// 3D 立体效果层
const Depth3DLayer: React.FC<{
  centerX: number;
  centerY: number;
  size: number;
  yangColor: string;
  yinColor: string;
  depth: number;
  rotation: number;
  layerIndex: number;
  totalLayers: number;
}> = ({ centerX, centerY, size, yangColor, yinColor, depth, rotation, layerIndex, totalLayers }) => {
  const R = size / 2;
  const r = R / 2;
  const eyeR = R / 8;
  const colorMultiplier = 1 - (layerIndex / totalLayers) * 0.3;
  
  const adjustColor = (color: string, factor: number): string => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
  };
  
  const layerYangColor = adjustColor(yangColor, colorMultiplier);
  const layerYinColor = adjustColor(yinColor, Math.max(0.3, colorMultiplier - 0.2));
  const zOffset = (layerIndex + 1) * depth;
  const scale = 1 - layerIndex * 0.01;
  
  return (
    <g transform={`translate(${centerX}, ${centerY - zOffset}) scale(${scale})`} opacity={0.7 - layerIndex * 0.1}>
      <g transform={`rotate(${rotation})`}>
        <circle cx={0} cy={0} r={R} fill={layerYinColor} />
        <path d={`M 0 ${-R} A ${R} ${R} 0 0 1 0 ${R} L 0 0 Z`} fill={layerYangColor} />
        <circle cx={0} cy={-r} r={r} fill={layerYangColor} />
        <circle cx={0} cy={r} r={r} fill={layerYinColor} />
        <circle cx={0} cy={-r} r={eyeR} fill={layerYinColor} />
        <circle cx={0} cy={r} r={eyeR} fill={layerYangColor} />
      </g>
    </g>
  );
};

// ==================== 主组件 ====================

export const TaiChiBaguaComposition: React.FC<TaiChiBaguaProps> = ({
  yangColor = "#FFD700",
  yinColor = "#1a1a1a",
  backgroundColor = "#FFFFFF",
  backgroundType = "color",
  backgroundSource,
  backgroundVideoLoop = true,
  backgroundVideoMuted = true,
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
  viewAngle = 90,
  perspectiveDistance = 800,
  verticalPosition = 0.5,
  verticalMargin = 50,
  enable3D = false,
  depth3D = 15,
  enableGoldenSparkle = true,
  sparkleDensity = 30,
  enableMysticalAura = true,
  auraIntensity = 0.6,
  overlayColor = "#000000",
  overlayOpacity = 0,
  audioEnabled = false,
  audioSource = "coin-sound.mp3",
  audioVolume = 0.5,
  audioLoop = true,
  // 水印参数
  watermarkEnabled = false,
  watermarkText,
  watermarkFontSize,
  watermarkColor,
  watermarkOpacity,
  watermarkSpeed,
  watermarkIntensity,
  watermarkVelocityX,
  watermarkVelocityY,
}) => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  
  const centerX = width / 2;
  const minTop = verticalMargin + baguaRadius;
  const minBottom = height - verticalMargin - baguaRadius;
  const centerY = interpolate(verticalPosition, [0, 1], [minTop, minBottom]);

  const entranceProgress = spring({
    frame,
    fps: 30,
    config: { damping: 100, stiffness: 200, mass: 1 },
  });

  const taichiRotation = interpolate(frame, [0, 360 / taichiRotationSpeed], [0, 360], {
    extrapolateRight: "extend",
    easing: Easing.linear,
  });

  const trigramSize = Math.min(60, taichiSize * 0.35);
  const rotateX = 90 - viewAngle;
  const isPerspective = viewAngle < 90;
  
  const perspective3D = isPerspective ? {
    perspective: `${perspectiveDistance}px`,
    perspectiveOrigin: `${centerX}px ${centerY}px`,
  } : {};

  const transform3D = isPerspective ? {
    transform: `rotateX(${rotateX}deg) scale(${entranceProgress})`,
    transformStyle: "preserve-3d" as const,
    transformOrigin: `${centerX}px ${centerY}px`,
  } : {
    transform: `scale(${entranceProgress})`,
    transformOrigin: `${centerX}px ${centerY}px`,
  };

  const depthLayers = enable3D ? 5 : 0;

  return (
    <AbsoluteFill>
      <Background
        type={backgroundType as BackgroundType}
        source={backgroundSource}
        color={backgroundColor}
        videoLoop={backgroundVideoLoop}
        videoMuted={backgroundVideoMuted}
      />

      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", ...perspective3D }}>
        <svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0, ...transform3D, opacity: entranceProgress }}>
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="depth-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
            </filter>
          </defs>

          {enableMysticalAura && (
            <MysticalAura centerX={centerX} centerY={centerY} color={yangColor} frame={frame} intensity={auraIntensity} size={taichiSize} />
          )}

          {showEnergyField && (
            <EnergyField centerX={centerX} centerY={centerY} color={yangColor} frame={frame} intensity={glowIntensity} />
          )}

          {showParticles && (
            <g>
              {Array.from({ length: particleCount }).map((_, i) => (
                <EnergyParticle key={i} index={i} total={particleCount} centerX={centerX} centerY={centerY} speed={particleSpeed * (0.5 + (i % 3) * 0.3)} color={i % 2 === 0 ? yangColor : yinColor} frame={frame} />
              ))}
            </g>
          )}

          {enable3D && depthLayers > 0 && (
            <g filter="url(#depth-shadow)">
              {Array.from({ length: depthLayers }).map((_, i) => (
                <Depth3DLayer key={`depth-${i}`} centerX={centerX} centerY={centerY} size={taichiSize} yangColor={yangColor} yinColor={yinColor} depth={depth3D / depthLayers} rotation={taichiRotation} layerIndex={i} totalLayers={depthLayers} />
              ))}
            </g>
          )}

          <g transform={`translate(${centerX}, ${centerY})`}>
            <Bagua radius={baguaRadius} trigramSize={trigramSize} yangColor={yangColor} rotationSpeed={baguaRotationSpeed} glowIntensity={glowIntensity} showLabels={showLabels} labelColor={yangColor} labelOffset={labelOffset} />
          </g>

          <g transform={`translate(${centerX}, ${centerY})`}>
            <TaiChi size={taichiSize} yangColor={yangColor} yinColor={yinColor} glowIntensity={glowIntensity} rotationSpeed={taichiRotationSpeed} pulseSpeed={1.5} />
          </g>

          {enableGoldenSparkle && (
            <g>
              {Array.from({ length: sparkleDensity }).map((_, i) => (
                <GoldenSparkle key={`sparkle-${i}`} index={i} centerX={centerX} centerY={centerY} maxRadius={baguaRadius + 50} color={yangColor} frame={frame} />
              ))}
            </g>
          )}
        </svg>
      </div>

      <svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
        <defs>
          <pattern id="runePattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1" fill={yangColor} opacity={0.3} />
          </pattern>
        </defs>
        {[
          { x: 40, y: 40 },
          { x: width - 40, y: 40 },
          { x: 40, y: height - 40 },
          { x: width - 40, y: height - 40 },
        ].map((pos, i) => {
          const runeOpacity = interpolate(frame + i * 10, [0, 30, 60], [0.1, 0.4, 0.1], { extrapolateRight: "extend" });
          return (
            <g key={i} transform={`translate(${pos.x}, ${pos.y})`}>
              <circle r={15} fill="none" stroke={yangColor} strokeWidth={1} opacity={runeOpacity * glowIntensity} />
              <circle r={8} fill="none" stroke={yangColor} strokeWidth={0.5} opacity={runeOpacity * glowIntensity * 0.7} />
            </g>
          );
        })}
      </svg>

      {audioEnabled && (
        <Audio
          src={staticFile(audioSource)}
          volume={audioVolume}
          loop={audioLoop}
        />
      )}

      {watermarkEnabled && (
        <Watermark
          text={watermarkText ?? "© Remo-Fects"}
          fontSize={watermarkFontSize ?? 24}
          color={watermarkColor ?? "#ffffff"}
          opacity={watermarkOpacity ?? 0.35}
          speed={watermarkSpeed ?? 1}
          intensity={watermarkIntensity ?? 0.8}
          velocityX={watermarkVelocityX ?? 180}
          velocityY={watermarkVelocityY ?? 120}
        />
      )}
    </AbsoluteFill>
  );
};