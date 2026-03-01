/**
 * 文字洪水特效
 * 
 * 模拟真实洪水从远及近、奔涌而来的震撼效果
 * 仿佛要突破屏幕砸到观看者脸上、将其淹没！
 */

import React, { useMemo } from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
  random,
  spring,
} from "remotion";
import {
  MixedInputItem,
  MixedTextStyleConfig,
  MixedImageStyleConfig,
  BlessingStyleConfig,
  MixedContentType,
  MixedItemType,
} from "../../shared/types/mixed-input";
import {
  detectAvailableContent,
  determineContentType,
  getNextContent,
  createMixedInputItem,
  DEFAULT_BLESSING_TYPES,
} from "../../shared/utils/mixed-input";
import { MixedInputItemRender } from "../../shared/components/MixedInputItem";
import { BlessingSymbolType } from "../../shared/schemas";

// ==================== 类型定义 ====================

export interface FloodWaveConfig {
  /** 波浪层数 */
  waveCount: number;
  /** 波浪速度 */
  waveSpeed: number;
  /** 波浪振幅 */
  waveAmplitude: number;
  /** 波浪频率 */
  waveFrequency: number;
}

export interface FloodImpactConfig {
  /** 冲击效果开始时间（比例 0-1） */
  impactStart: number;
  /** 冲击放大倍数 */
  impactScale: number;
  /** 冲击模糊强度 */
  impactBlur: number;
  /** 冲击震动幅度 */
  impactShake: number;
}

export interface FloodStyleConfig {
  /** 文字样式 */
  textStyle?: MixedTextStyleConfig;
  /** 图片样式 */
  imageStyle?: MixedImageStyleConfig;
  /** 祝福图案样式 */
  blessingStyle?: BlessingStyleConfig;
}

export type FloodDirection = "toward" | "away";  // toward: 从远到近, away: 从近到远

// 洪水粒子类型
interface FloodParticle extends MixedInputItem {
  /** 波浪层索引 */
  waveLayer: number;
  /** 初始深度（0=近，1=远） */
  depth: number;
  /** 水平位置（0-1） */
  horizontalPos: number;
  /** 波浪相位偏移 */
  wavePhase: number;
  /** 运动速度系数 */
  speedFactor: number;
  /** 是否为冲击粒子 */
  isImpact: boolean;
  /** 诞生时间（帧） */
  birthFrame: number;
  /** 持续时间（帧） */
  lifeDuration: number;
}

// ==================== 洪水粒子生成器 ====================

const generateFloodParticles = (
  config: {
    words?: string[];
    images?: string[];
    blessingTypes?: BlessingSymbolType[];
    contentType?: MixedContentType;
    imageWeight?: number;
  },
  options: {
    count: number;
    seed: number;
    waveCount: number;
    durationInFrames: number;
    width: number;
    height: number;
    fontSizeRange: [number, number];
    imageSizeRange: [number, number];
    blessingSizeRange: [number, number];
    opacityRange: [number, number];
    textStyle?: MixedTextStyleConfig;
    imageStyle?: MixedImageStyleConfig;
    blessingStyle?: BlessingStyleConfig;
  }
): FloodParticle[] => {
  const {
    words = [],
    images = [],
    blessingTypes = [],
    contentType = "text",
    imageWeight = 0.5,
  } = config;

  const {
    count,
    seed,
    waveCount,
    durationInFrames,
    width,
    height,
    fontSizeRange,
    imageSizeRange,
    blessingSizeRange,
    opacityRange,
    textStyle,
    imageStyle,
    blessingStyle,
  } = options;

  const particles: FloodParticle[] = [];

  // 检测可用内容
  const available = detectAvailableContent({
    contentType,
    words,
    images,
    blessingTypes,
    imageWeight,
  });

  if (available.availableTypes.length === 0) {
    return particles;
  }

  // 使用计数器进行轮询
  const counters = { text: 0, image: 0, blessing: 0 };

  for (let i = 0; i < count; i++) {
    const seedValue = seed + i * 1000;

    // 决定内容类型
    const { type, content } = determineContentType(
      { contentType, words, images, blessingTypes, imageWeight },
      available,
      seedValue
    );

    // 获取轮询内容
    const { content: actualContent } = getNextContent(type, {
      words,
      images,
      blessingTypes: blessingTypes.length > 0 ? blessingTypes : DEFAULT_BLESSING_TYPES,
    }, counters[type]);
    counters[type]++;

    // 创建基础粒子
    const baseItem = createMixedInputItem(
      i,
      type,
      actualContent,
      {
        count: 1,
        seed: seedValue,
        fontSizeRange,
        imageSizeRange,
        blessingSizeRange,
        opacityRange,
        rotationRange: [-30, 30],
        textStyle,
        imageStyle,
        blessingStyle,
      },
      seedValue
    );

    // 计算波浪层和深度
    const waveLayer = Math.floor(random(`wave-${seedValue}`) * waveCount);
    const depth = waveLayer / waveCount; // 0=近（第一层），1=远（最后一层）
    
    // 计算水平位置（带有一定的聚集效果）
    const horizontalPos = random(`hpos-${seedValue}`);
    
    // 波浪相位偏移
    const wavePhase = random(`phase-${seedValue}`) * Math.PI * 2;
    
    // 速度系数（近处的粒子更快）
    const speedFactor = 0.5 + (1 - depth) * 0.8;
    
    // 诞生时间（远处的粒子先出现）
    const birthFrame = Math.floor(depth * durationInFrames * 0.3 + random(`birth-${seedValue}`) * durationInFrames * 0.2);
    
    // 持续时间
    const lifeDuration = durationInFrames - birthFrame + Math.floor(random(`life-${seedValue}`) * 60);
    
    // 是否为冲击粒子（近处的粒子有更大的几率成为冲击粒子）
    const isImpact = depth < 0.3 && random(`impact-${seedValue}`) > 0.6;

    const particle: FloodParticle = {
      ...baseItem,
      waveLayer,
      depth,
      horizontalPos,
      wavePhase,
      speedFactor,
      isImpact,
      birthFrame,
      lifeDuration,
    };

    particles.push(particle);
  }

  // 按深度排序（远的先渲染）
  return particles.sort((a, b) => b.depth - a.depth);
};

// ==================== 洪水粒子渲染组件 ====================

interface FloodParticleRenderProps {
  particle: FloodParticle;
  frame: number;
  width: number;
  height: number;
  waveConfig: FloodWaveConfig;
  impactConfig: FloodImpactConfig;
  direction: FloodDirection;
  textStyle?: MixedTextStyleConfig;
  imageStyle?: MixedImageStyleConfig;
  totalDuration: number;
}

const FloodParticleRender: React.FC<FloodParticleRenderProps> = ({
  particle,
  frame,
  width,
  height,
  waveConfig,
  impactConfig,
  direction,
  textStyle,
  imageStyle,
  totalDuration,
}) => {
  const currentFrame = frame - particle.birthFrame;
  if (currentFrame < 0) return null;

  // 计算生命周期进度（0-1）
  const lifeProgress = Math.min(currentFrame / particle.lifeDuration, 1);

  // 根据方向计算深度变化
  // toward: 从远到近（depth: 1 -> 0）
  // away: 从近到远（depth: 0 -> 1）
  const depthProgress = direction === "toward" 
    ? interpolate(lifeProgress, [0, 1], [particle.depth, 0])
    : interpolate(lifeProgress, [0, 1], [particle.depth, 1]);

  // 计算缩放（近处放大，远处缩小）
  // 使用指数函数让近处放大更剧烈
  const baseScale = particle.scale ?? 1;
  const depthScale = Math.pow(1 - depthProgress, 0.7) * 2 + 0.3; // 0.3 - 2.3
  const scale = baseScale * depthScale;

  // 计算位置
  // 水平位置：带有波浪起伏
  const waveOffset = Math.sin(
    lifeProgress * Math.PI * 2 * waveConfig.waveFrequency + particle.wavePhase
  ) * waveConfig.waveAmplitude * (1 - depthProgress);
  
  const x = particle.horizontalPos * width + waveOffset;

  // 垂直位置：从远处向近处移动
  // 远处在画面顶部，近处在画面底部
  // toward: depthProgress 从高到低，y 从顶部移到底部
  // away: depthProgress 从低到高，y 从底部移到顶部
  const y = direction === "toward"
    ? interpolate(depthProgress, [0, 1], [height + 200, -100])
    : interpolate(depthProgress, [0, 1], [height + 200, -100]);

  // 计算透明度
  // 远处淡，近处清晰（depthProgress 高 = 远 = 淡，depthProgress 低 = 近 = 清晰）
  let opacity = particle.opacity ?? 1;
  const depthOpacity = interpolate(depthProgress, [0, 1], [1, 0.3]);
  opacity *= depthOpacity;

  // 淡入淡出
  const fadeInEnd = 0.1;
  const fadeOutStart = 0.85;
  if (lifeProgress < fadeInEnd) {
    opacity *= lifeProgress / fadeInEnd;
  } else if (lifeProgress > fadeOutStart) {
    opacity *= (1 - lifeProgress) / (1 - fadeOutStart);
  }

  // 冲击效果
  let impactScale = 1;
  let impactBlur = 0;
  let impactShakeX = 0;
  let impactShakeY = 0;

  if (particle.isImpact && depthProgress < 0.2) {
    // 冲击效果：突然放大并模糊
    // depthProgress: 0 -> 0.2，impactProgress: 1 -> 0（越近冲击越强）
    const impactProgress = interpolate(depthProgress, [0, 0.2], [1, 0]);
    impactScale = interpolate(impactProgress, [0, 1], [1, impactConfig.impactScale]);
    impactBlur = interpolate(impactProgress, [0, 1], [0, impactConfig.impactBlur]);
    
    // 震动效果
    impactShakeX = Math.sin(frame * 0.5) * impactConfig.impactShake * impactProgress;
    impactShakeY = Math.cos(frame * 0.7) * impactConfig.impactShake * impactProgress;
  }

  // 计算动态旋转
  let rotation = particle.rotation ?? 0;
  // 波浪中的旋转
  rotation += Math.sin(lifeProgress * Math.PI * 2 * waveConfig.waveFrequency + particle.wavePhase) * 15;

  // 构建样式
  const containerStyle: React.CSSProperties = {
    position: "absolute",
    left: x + impactShakeX,
    top: y + impactShakeY,
    transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale * impactScale})`,
    opacity,
    filter: impactBlur > 0 ? `blur(${impactBlur}px)` : undefined,
    zIndex: Math.floor((1 - depthProgress) * 100),
    pointerEvents: "none",
  };

  return (
    <div style={containerStyle}>
      <MixedInputItemRender
        item={particle}
        textStyle={textStyle}
        imageStyle={imageStyle}
        enableAnimation={false}
      />
    </div>
  );
};

// ==================== 3D 透视容器 ====================

interface PerspectiveFloodProps {
  children: React.ReactNode;
  width: number;
  height: number;
  perspective: number;
  rotateX: number;
}

const PerspectiveFlood: React.FC<PerspectiveFloodProps> = ({
  children,
  width,
  height,
  perspective,
  rotateX,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        width,
        height,
        perspective: `${perspective}px`,
        perspectiveOrigin: "50% 100%", // 从底部看
        overflow: "visible",
      }}
    >
      <div
        style={{
          position: "absolute",
          width,
          height,
          transform: `rotateX(${rotateX}deg)`,
          transformOrigin: "50% 100%",
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ==================== 波浪背景效果 ====================

interface WaveBackgroundProps {
  frame: number;
  width: number;
  height: number;
  waveConfig: FloodWaveConfig;
  color: string;
  opacity: number;
}

const WaveBackground: React.FC<WaveBackgroundProps> = ({
  frame,
  width,
  height,
  waveConfig,
  color,
  opacity,
}) => {
  // 生成多层波浪
  const waves = [];
  const waveCount = 3;

  for (let i = 0; i < waveCount; i++) {
    const waveY = height * 0.3 + i * height * 0.25;
    const waveOpacity = opacity * (1 - i * 0.2);
    const waveHeight = 30 + i * 20;
    const waveSpeed = waveConfig.waveSpeed * (1 + i * 0.3);

    // 使用 SVG path 绘制波浪
    const pathD = useMemo(() => {
      const points: string[] = [];
      const segments = 50;
      
      for (let j = 0; j <= segments; j++) {
        const x = (j / segments) * width;
        const waveOffset = Math.sin(
          (j / segments) * Math.PI * 4 + frame * 0.05 * waveSpeed + i
        ) * waveHeight;
        const y = waveY + waveOffset;
        
        if (j === 0) {
          points.push(`M ${x} ${y}`);
        } else {
          points.push(`L ${x} ${y}`);
        }
      }
      
      // 闭合路径
      points.push(`L ${width} ${height}`);
      points.push(`L 0 ${height}`);
      points.push("Z");
      
      return points.join(" ");
    }, [frame, width, height, waveY, waveHeight, waveSpeed, i]);

    waves.push(
      <svg
        key={i}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: waveOpacity,
        }}
      >
        <defs>
          <linearGradient id={`wave-gradient-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path d={pathD} fill={`url(#wave-gradient-${i})`} />
      </svg>
    );
  }

  return <>{waves}</>;
};

// ==================== 主组件 ====================

export interface TextFloodProps {
  // 内容配置
  words?: string[];
  images?: string[];
  blessingTypes?: BlessingSymbolType[];
  contentType?: MixedContentType;
  imageWeight?: number;

  // 洪水参数
  particleCount?: number;
  waveCount?: number;
  direction?: FloodDirection;

  // 波浪配置
  waveConfig?: Partial<FloodWaveConfig>;

  // 冲击效果配置
  impactConfig?: Partial<FloodImpactConfig>;

  // 尺寸范围
  fontSizeRange?: [number, number];
  imageSizeRange?: [number, number];
  blessingSizeRange?: [number, number];

  // 透明度范围
  opacityRange?: [number, number];

  // 样式配置
  textStyle?: MixedTextStyleConfig;
  imageStyle?: MixedImageStyleConfig;
  blessingStyle?: BlessingStyleConfig;

  // 视觉效果
  enablePerspective?: boolean;
  perspectiveStrength?: number;
  enableWaveBackground?: boolean;
  waveBackgroundColor?: string;
  waveBackgroundOpacity?: number;

  // 随机种子
  seed?: number;
}

export const TextFlood: React.FC<TextFloodProps> = ({
  // 内容配置
  words = [],
  images = [],
  blessingTypes = [],
  contentType = "text",
  imageWeight = 0.5,

  // 洪水参数
  particleCount = 80,
  waveCount = 5,
  direction = "toward",

  // 波浪配置
  waveConfig: waveConfigOverride,

  // 冲击效果配置
  impactConfig: impactConfigOverride,

  // 尺寸范围
  fontSizeRange = [40, 80],
  imageSizeRange = [50, 100],
  blessingSizeRange = [50, 100],

  // 透明度范围
  opacityRange = [0.7, 1],

  // 样式配置
  textStyle,
  imageStyle,
  blessingStyle,

  // 视觉效果
  enablePerspective = true,
  perspectiveStrength = 800,
  enableWaveBackground = true,
  waveBackgroundColor = "#1a4a7a",
  waveBackgroundOpacity = 0.3,

  // 随机种子
  seed = 42,
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // 默认波浪配置
  const waveConfig: FloodWaveConfig = {
    waveCount,
    waveSpeed: 1.5,
    waveAmplitude: 50,
    waveFrequency: 2,
    ...waveConfigOverride,
  };

  // 默认冲击配置
  const impactConfig: FloodImpactConfig = {
    impactStart: 0.7,
    impactScale: 3,
    impactBlur: 5,
    impactShake: 10,
    ...impactConfigOverride,
  };

  // 默认祝福图案样式
  const mergedBlessingStyle: BlessingStyleConfig = {
    primaryColor: "#FFD700",
    secondaryColor: "#FFA500",
    enable3D: true,
    enableGlow: true,
    glowIntensity: 1.2,
    animated: false,
    ...blessingStyle,
  };

  // 生成洪水粒子
  const particles = useMemo(() => {
    return generateFloodParticles(
      { words, images, blessingTypes, contentType, imageWeight },
      {
        count: particleCount,
        seed,
        waveCount,
        durationInFrames,
        width,
        height,
        fontSizeRange,
        imageSizeRange,
        blessingSizeRange,
        opacityRange,
        textStyle,
        imageStyle,
        blessingStyle: mergedBlessingStyle,
      }
    );
  }, [
    words,
    images,
    blessingTypes,
    contentType,
    imageWeight,
    particleCount,
    seed,
    waveCount,
    durationInFrames,
    width,
    height,
    fontSizeRange,
    imageSizeRange,
    blessingSizeRange,
    opacityRange,
    textStyle,
    imageStyle,
    mergedBlessingStyle,
  ]);

  // 计算透视旋转角度
  const rotateX = enablePerspective ? 15 : 0;

  // 渲染粒子
  const renderParticles = () => {
    return particles.map((particle) => (
      <FloodParticleRender
        key={particle.id}
        particle={particle}
        frame={frame}
        width={width}
        height={height}
        waveConfig={waveConfig}
        impactConfig={impactConfig}
        direction={direction}
        textStyle={textStyle}
        imageStyle={imageStyle}
        totalDuration={durationInFrames}
      />
    ));
  };

  return (
    <AbsoluteFill>
      {/* 波浪背景 */}
      {enableWaveBackground && (
        <WaveBackground
          frame={frame}
          width={width}
          height={height}
          waveConfig={waveConfig}
          color={waveBackgroundColor}
          opacity={waveBackgroundOpacity}
        />
      )}

      {/* 洪水粒子 */}
      {enablePerspective ? (
        <PerspectiveFlood
          width={width}
          height={height}
          perspective={perspectiveStrength}
          rotateX={rotateX}
        >
          {renderParticles()}
        </PerspectiveFlood>
      ) : (
        <AbsoluteFill>{renderParticles()}</AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export default TextFlood;
