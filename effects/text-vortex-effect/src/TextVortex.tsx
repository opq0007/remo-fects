import React, { useMemo } from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  Img,
} from "remotion";
import { SingleBlessingSymbol, getImageSrc } from "../../shared/components";
import { BlessingSymbolType } from "../../shared/schemas";
import { generateTextStyle } from "../../shared/utils";

/**
 * 内容类型
 */
type ContentType = "text" | "image" | "blessing" | "mixed";

/**
 * 旋转方向
 */
type RotationDirection = "clockwise" | "counterclockwise";

/**
 * 单个粒子数据
 */
interface VortexParticle {
  id: number;
  type: "text" | "image" | "blessing";
  content: string;
  // 初始角度（0-2π）
  initialAngle: number;
  // 所在环层（0=最内层）
  ring: number;
  // 该环上的偏移角度
  angleOffset: number;
  // 大小
  size: number;
  // 透明度基础值
  baseOpacity: number;
  // 入场延迟
  delay: number;
  // 深度层级（用于3D效果）
  depthLayer: number;
  // 初始半径（开始时的半径）
  initialRadius: number;
  // 目标半径（最终散开到的半径）
  targetRadius: number;
  // 旋转速度系数
  rotationFactor: number;
}

/**
 * TextVortex 组件属性
 */
export interface TextVortexProps {
  // 内容配置
  contentType?: ContentType;
  words?: string[];
  images?: string[];
  imageWeight?: number;
  blessingTypes?: BlessingSymbolType[];
  blessingStyle?: {
    primaryColor?: string;
    secondaryColor?: string;
    enable3D?: boolean;
    enableGlow?: boolean;
    glowIntensity?: number;
  };

  // 旋涡配置
  particleCount?: number;
  ringCount?: number;          // 环的数量
  rotationDirection?: RotationDirection;  // 旋转方向
  rotationSpeed?: number;      // 旋转速度
  expansionDuration?: number;  // 散开动画时长（秒）
  initialRadius?: number;      // 初始中心半径
  maxRadius?: number;          // 最大扩散半径
  
  // 3D效果配置
  depth3D?: boolean;           // 是否启用3D效果
  depthIntensity?: number;     // 3D深度强度
  perspective?: number;        // 透视距离
  
  // 尺寸配置
  fontSizeRange?: [number, number];
  imageSizeRange?: [number, number];
  blessingSizeRange?: [number, number];

  // 动画配置
  entranceDuration?: number;   // 入场动画时长（帧）
  fadeInEnabled?: boolean;     // 是否启用淡入
  spiralTightness?: number;    // 螺旋紧密程度
  pulseEnabled?: boolean;      // 是否启用脉冲效果
  pulseIntensity?: number;     // 脉冲强度

  // 震撼效果
  shockwaveEnabled?: boolean;  // 是否启用冲击波
  shockwaveTiming?: number;    // 冲击波触发时机（秒）
  suctionEffect?: boolean;     // 是否启用吸入效果
  suctionIntensity?: number;   // 吸入效果强度

  // 样式配置
  textStyle?: {
    color?: string;
    effect?: "gold3d" | "glow" | "shadow" | "neon" | "none";
    effectIntensity?: number;
    fontWeight?: number;
  };

  // 其他
  seed?: number;
}

/**
 * 伪随机数生成器
 */
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

/**
 * 文字旋涡组件
 * 
 * 创建从中心向外旋转散开的震撼3D旋涡效果
 */
export const TextVortex: React.FC<TextVortexProps> = ({
  contentType = "text",
  words = [],
  images = [],
  imageWeight = 0.5,
  blessingTypes = [],
  blessingStyle = {},
  
  // 旋涡配置
  particleCount = 80,
  ringCount = 6,
  rotationDirection = "clockwise",
  rotationSpeed = 1.5,
  expansionDuration = 6,
  initialRadius = 30,
  maxRadius = 350,
  
  // 3D效果
  depth3D = true,
  depthIntensity = 0.4,
  perspective = 800,
  
  // 尺寸配置
  fontSizeRange = [30, 70],
  imageSizeRange = [40, 90],
  blessingSizeRange = [30, 70],
  
  // 动画配置
  entranceDuration = 25,
  fadeInEnabled = true,
  spiralTightness = 1.2,
  pulseEnabled = true,
  pulseIntensity = 0.15,
  
  // 震撼效果
  shockwaveEnabled = true,
  shockwaveTiming = 3,
  suctionEffect = true,
  suctionIntensity = 0.3,
  
  // 样式
  textStyle = {},
  seed = 42,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const random = useMemo(() => seededRandom(seed), [seed]);

  // 默认祝福图案类型
  const DEFAULT_BLESSING_TYPES: BlessingSymbolType[] = ["goldCoin", "moneyBag", "luckyBag", "redPacket"];
  const effectiveBlessingTypes = blessingTypes.length > 0 ? blessingTypes : DEFAULT_BLESSING_TYPES;

  // 判断可用内容
  const hasText = words.length > 0;
  const hasImages = images.length > 0;
  const hasBlessing = effectiveBlessingTypes.length > 0;

  // 旋转方向系数
  const directionFactor = rotationDirection === "clockwise" ? 1 : -1;

  // 根据内容类型生成可用类型列表
  const availableTypes: ("text" | "image" | "blessing")[] = useMemo(() => {
    if (contentType !== "mixed") {
      if (contentType === "text") return hasText ? ["text"] : ["blessing"];
      if (contentType === "image") return hasImages ? ["image"] : ["blessing"];
      if (contentType === "blessing") return ["blessing"];
      return ["blessing"];
    }
    const types: ("text" | "image" | "blessing")[] = [];
    if (hasText) types.push("text");
    if (hasImages) types.push("image");
    types.push("blessing");
    return types.length > 0 ? types : ["blessing"];
  }, [contentType, hasText, hasImages]);

  // 生成粒子数据
  const particles = useMemo<VortexParticle[]>(() => {
    if (availableTypes.length === 0) return [];

    const result: VortexParticle[] = [];
    const particlesPerRing = Math.ceil(particleCount / ringCount);

    for (let i = 0; i < particleCount; i++) {
      // 确定环层
      const ring = Math.floor(i / particlesPerRing);
      const indexInRing = i % particlesPerRing;
      
      // 随机选择内容类型
      let type: "text" | "image" | "blessing";
      if (contentType === "mixed") {
        if (hasImages && hasText && !hasBlessing) {
          type = random() < imageWeight ? "image" : "text";
        } else {
          type = availableTypes[Math.floor(random() * availableTypes.length)];
        }
      } else {
        type = availableTypes[0] || "text";
      }

      // 随机选择内容
      let content = "";
      let sizeRange: [number, number] = fontSizeRange;

      if (type === "text" && words.length > 0) {
        content = words[Math.floor(random() * words.length)];
        sizeRange = fontSizeRange;
      } else if (type === "image" && images.length > 0) {
        content = images[Math.floor(random() * images.length)];
        sizeRange = imageSizeRange;
      } else if (type === "blessing") {
        content = effectiveBlessingTypes[Math.floor(random() * effectiveBlessingTypes.length)];
        sizeRange = blessingSizeRange;
      }

      // 计算初始和目标半径
      const ringInitialRadius = initialRadius + ring * 20;
      const ringTargetRadius = initialRadius + (ring + 1) * (maxRadius - initialRadius) / ringCount;
      
      // 角度分布 - 螺旋分布
      const angleOffset = (indexInRing / particlesPerRing) * Math.PI * 2 * spiralTightness;
      
      // 深度层级
      const depthLayer = ring % 3;

      result.push({
        id: i,
        type,
        content,
        initialAngle: random() * Math.PI * 2,
        ring,
        angleOffset,
        size: sizeRange[0] + random() * (sizeRange[1] - sizeRange[0]),
        baseOpacity: 0.7 + random() * 0.3,
        delay: ring * 3 + random() * entranceDuration * 0.5,
        depthLayer,
        initialRadius: ringInitialRadius,
        targetRadius: ringTargetRadius,
        rotationFactor: 0.8 + random() * 0.4,
      });
    }
    return result;
  }, [availableTypes, particleCount, ringCount, words, images, effectiveBlessingTypes, random, contentType, imageWeight, hasImages, hasText, fontSizeRange, imageSizeRange, blessingSizeRange, initialRadius, maxRadius, entranceDuration, spiralTightness]);

  // 中心点
  const centerX = width / 2;
  const centerY = height / 2;

  // 当前时间（秒）
  const currentTime = frame / fps;
  
  // 扩散进度（0-1）
  const expansionProgress = Math.min(1, currentTime / expansionDuration);
  
  // 整体旋转角度
  const globalRotation = frame * rotationSpeed * 0.08 * directionFactor;
  
  // 脉冲效果
  const pulseValue = pulseEnabled 
    ? Math.sin(frame * 0.1) * pulseIntensity 
    : 0;
  
  // 冲击波效果
  const shockwaveProgress = shockwaveEnabled && currentTime > shockwaveTiming
    ? Math.min(1, (currentTime - shockwaveTiming) / 0.8)
    : 0;
  
  // 吸入效果（开始时从外向内吸入）
  const suctionProgress = suctionEffect
    ? Math.max(0, 1 - currentTime / 1.5) * suctionIntensity
    : 0;

  // 中心光晕强度
  const centerGlowIntensity = interpolate(
    expansionProgress,
    [0, 0.3, 1],
    [1.2, 0.8, 0.4],
    { extrapolateRight: "clamp" }
  );

  // 渲染单个粒子
  const renderParticle = (particle: VortexParticle) => {
    // 入场动画
    const entranceProgress = spring({
      frame: frame - particle.delay,
      fps,
      config: {
        damping: 12,
        stiffness: 80,
        mass: 0.8,
      },
    });

    if (entranceProgress <= 0) return null;

    // 计算当前半径 - 从中心向外扩散
    // 使用缓动函数使扩散更自然
    const easedExpansion = expansionProgress < 0.5
      ? 2 * expansionProgress * expansionProgress
      : 1 - Math.pow(-2 * expansionProgress + 2, 2) / 2;
    
    let currentRadius = interpolate(
      easedExpansion,
      [0, 1],
      [particle.initialRadius, particle.targetRadius]
    );
    
    // 应用脉冲效果
    currentRadius += pulseValue * currentRadius * 0.2;
    
    // 应用冲击波效果
    if (shockwaveProgress > 0 && shockwaveProgress < 1) {
      const shockwaveRadius = shockwaveProgress * maxRadius * 1.5;
      const distanceFromShockwave = Math.abs(currentRadius - shockwaveRadius);
      if (distanceFromShockwave < 80) {
        const shockwaveInfluence = 1 - distanceFromShockwave / 80;
        currentRadius += shockwaveInfluence * 30 * Math.sin(shockwaveProgress * Math.PI);
      }
    }
    
    // 应用吸入效果
    if (suctionProgress > 0) {
      currentRadius *= (1 - suctionProgress * 0.7);
    }

    // 计算角度 - 旋转 + 螺旋展开
    const angle = particle.initialAngle + globalRotation * particle.rotationFactor + particle.angleOffset;
    
    // 计算半径比例（0-1），用于透视效果
    const radiusRatio = currentRadius / maxRadius;
    
    // ===== 核心3D透视效果 =====
    // 关键原理：粒子越靠外（半径越大），距离屏幕越近，应该越大
    // 这符合"近大远小"的透视规律，产生震撼的冲击感
    
    let perspectiveScale = 1;
    let depthZ = 0;
    let opacity = particle.baseOpacity * entranceProgress;
    
    if (depth3D) {
      // 1. 基于半径的深度计算：半径越大，Z值越大（越靠近屏幕）
      // 半径小 = 在深处（远），半径大 = 在近处（近）
      depthZ = interpolate(
        radiusRatio,
        [0, 1],
        [-perspective * depthIntensity, 0]  // 中心深处，边缘近屏幕
      );
      
      // 2. 透视缩放：近大远小
      // 公式：scale = perspective / (perspective - z)
      // 当 z 为负（远），分母大，scale 小
      // 当 z 为 0（近），scale = 1
      perspectiveScale = perspective / (perspective - depthZ);
      
      // 3. 额外的旋转深度变化（让旋涡更有立体感）
      const rotationDepthFactor = (Math.sin(angle * 2 + frame * 0.03) + 1) / 2;
      const rotationDepthOffset = interpolate(
        rotationDepthFactor,
        [0, 1],
        [-depthIntensity * 30, depthIntensity * 30]
      );
      perspectiveScale *= perspective / (perspective - rotationDepthOffset);
      
      // 4. 根据深度调整透明度（远处略暗，近处明亮）
      opacity *= interpolate(radiusRatio, [0, 1], [0.6, 1]);
    }
    
    // 计算3D位置
    let x = centerX + Math.cos(angle) * currentRadius;
    let y = centerY + Math.sin(angle) * currentRadius;
    
    // 应用透视Y偏移（模拟深度感）
    if (depth3D) {
      y += depthZ * 0.15;
    }
    
    // 最终大小：基础大小 × 透视缩放 × 入场进度
    // 关键：perspectiveScale 已经包含了"越散开越大"的效果
    const finalSize = particle.size * perspectiveScale * entranceProgress;
    
    // 淡入效果
    if (fadeInEnabled) {
      opacity *= Math.min(1, entranceProgress * 1.5);
    }
    
    // 粒子自身旋转（跟随旋涡方向）
    const selfRotation = angle * (180 / Math.PI) * 0.5;
    
    // z-index 基于透视缩放（近处的在前面）
    const zIndex = Math.floor(perspectiveScale * 100);

    // 根据类型渲染
    if (particle.type === "text") {
      const textStyles = generateTextStyle(finalSize, {
        color: textStyle.color || "#FFD700",
        effect: textStyle.effect || "gold3d",
        effectIntensity: textStyle.effectIntensity ?? 0.9,
        fontWeight: textStyle.fontWeight || 700,
      });

      return (
        <div
          key={particle.id}
          style={{
            position: "absolute",
            left: x,
            top: y,
            transform: `translate(-50%, -50%) rotate(${selfRotation}deg)`,
            opacity,
            whiteSpace: "nowrap",
            zIndex,
            ...textStyles,
          }}
        >
          {particle.content}
        </div>
      );
    }

    if (particle.type === "image") {
      return (
        <div
          key={particle.id}
          style={{
            position: "absolute",
            left: x,
            top: y,
            transform: `translate(-50%, -50%) rotate(${selfRotation}deg)`,
            opacity,
            width: finalSize,
            height: finalSize,
            zIndex,
          }}
        >
          <Img
            src={getImageSrc(particle.content)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: `drop-shadow(0 0 ${finalSize * 0.15}px rgba(255, 215, 0, 0.6))`,
            }}
          />
        </div>
      );
    }

    if (particle.type === "blessing") {
      return (
        <div
          key={particle.id}
          style={{
            position: "absolute",
            left: x,
            top: y,
            transform: `translate(-50%, -50%) rotate(${selfRotation}deg)`,
            opacity,
            zIndex,
          }}
        >
          <SingleBlessingSymbol
            type={particle.content as BlessingSymbolType}
            size={finalSize}
            primaryColor={blessingStyle.primaryColor || "#FFD700"}
            secondaryColor={blessingStyle.secondaryColor || "#FFA500"}
            enable3D={blessingStyle.enable3D !== false}
            enableGlow={blessingStyle.enableGlow !== false}
            glowIntensity={blessingStyle.glowIntensity ?? 1}
          />
        </div>
      );
    }

    return null;
  };

  // 中心漩涡效果
  const renderVortexCenter = () => {
    const centerRotation = frame * rotationSpeed * 0.15 * directionFactor;
    
    return (
      <>
        {/* 中心旋转光晕 */}
        <div
          style={{
            position: "absolute",
            left: centerX,
            top: centerY,
            transform: `translate(-50%, -50%) rotate(${centerRotation}deg)`,
            width: 200 + pulseValue * 40,
            height: 200 + pulseValue * 40,
            background: `radial-gradient(circle, 
              rgba(255, 215, 0, ${centerGlowIntensity * 0.8}) 0%, 
              rgba(255, 165, 0, ${centerGlowIntensity * 0.4}) 30%, 
              rgba(255, 100, 0, ${centerGlowIntensity * 0.2}) 50%, 
              transparent 70%)`,
            borderRadius: "50%",
            filter: `blur(${15 + pulseValue * 10}px)`,
            pointerEvents: "none",
            zIndex: 100,
          }}
        />
        
        {/* 内部旋转线条 */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`line-${i}`}
            style={{
              position: "absolute",
              left: centerX,
              top: centerY,
              transform: `translate(-50%, -50%) rotate(${centerRotation + i * 90}deg)`,
              width: 80,
              height: 3,
              background: `linear-gradient(90deg, 
                transparent 0%, 
                rgba(255, 215, 0, ${centerGlowIntensity * 0.6}) 50%, 
                transparent 100%)`,
              filter: `blur(3px)`,
              pointerEvents: "none",
              zIndex: 99,
            }}
          />
        ))}
        
        {/* 吸入效果指示器 */}
        {suctionEffect && suctionProgress > 0 && (
          <div
            style={{
              position: "absolute",
              left: centerX,
              top: centerY,
              transform: `translate(-50%, -50%) rotate(${-centerRotation * 2}deg)`,
              width: 300 * (1 - suctionProgress * 0.5),
              height: 300 * (1 - suctionProgress * 0.5),
              border: `2px solid rgba(255, 215, 0, ${suctionProgress * 0.5})`,
              borderRadius: "50%",
              pointerEvents: "none",
              zIndex: 98,
            }}
          />
        )}
      </>
    );
  };

  // 冲击波效果
  const renderShockwave = () => {
    if (!shockwaveEnabled || shockwaveProgress <= 0 || shockwaveProgress >= 1) return null;
    
    const shockwaveRadius = shockwaveProgress * maxRadius * 2;
    const shockwaveOpacity = 1 - shockwaveProgress;
    
    return (
      <div
        style={{
          position: "absolute",
          left: centerX,
          top: centerY,
          transform: "translate(-50%, -50%)",
          width: shockwaveRadius * 2,
          height: shockwaveRadius * 2,
          border: `3px solid rgba(255, 215, 0, ${shockwaveOpacity * 0.8})`,
          borderRadius: "50%",
          boxShadow: `0 0 20px rgba(255, 215, 0, ${shockwaveOpacity * 0.5}),
                      inset 0 0 20px rgba(255, 215, 0, ${shockwaveOpacity * 0.3})`,
          pointerEvents: "none",
          zIndex: 200,
        }}
      />
    );
  };

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        perspective: depth3D ? `${perspective}px` : undefined,
      }}
    >
      {/* 外围光晕 */}
      <div
        style={{
          position: "absolute",
          left: centerX,
          top: centerY,
          transform: "translate(-50%, -50%)",
          width: maxRadius * 2.5,
          height: maxRadius * 2.5,
          background: `radial-gradient(circle, 
            rgba(255, 180, 50, ${0.1 + expansionProgress * 0.1}) 0%, 
            rgba(255, 100, 0, ${0.05 + expansionProgress * 0.05}) 30%, 
            transparent 60%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      
      {/* 旋涡主体 */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          transformStyle: depth3D ? "preserve-3d" : undefined,
        }}
      >
        {particles.map(renderParticle)}
      </div>
      
      {/* 中心漩涡效果 */}
      {renderVortexCenter()}
      
      {/* 冲击波效果 */}
      {renderShockwave()}
    </div>
  );
};
