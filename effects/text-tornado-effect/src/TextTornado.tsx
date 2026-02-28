import React, { useMemo } from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  Img,
  staticFile,
} from "remotion";
import { SingleBlessingSymbol, BlessingSymbolType } from "../../shared/components/BlessingSymbol";
import { generateTextStyle } from "../../shared/utils";

/**
 * 内容类型
 */
type ContentType = "text" | "image" | "blessing" | "mixed";

/**
 * 单个粒子数据
 */
interface TornadoParticle {
  id: number;
  type: "text" | "image" | "blessing";
  content: string;
  // 初始角度（0-2π）
  initialAngle: number;
  // 初始半径
  initialRadius: number;
  // 高度位置（0=底部，1=顶部）
  heightRatio: number;
  // 大小
  size: number;
  // 旋转速度倍数
  rotationMultiplier: number;
  // 透明度
  opacity: number;
  // 入场延迟
  delay: number;
}

/**
 * TextTornado 组件属性
 */
export interface TextTornadoProps {
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

  // 龙卷风配置
  particleCount?: number;
  baseRadius?: number;
  topRadius?: number;
  rotationSpeed?: number;
  liftSpeed?: number;
  funnelHeight?: number;

  // 尺寸配置
  fontSizeRange?: [number, number];
  imageSizeRange?: [number, number];
  blessingSizeRange?: [number, number];

  // 动画配置
  zoomIntensity?: number;
  entranceDuration?: number;
  swirlIntensity?: number;

  // 样式配置
  textStyle?: {
    color?: string;
    effect?: "gold3d" | "glow" | "shadow" | "none";
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
 * 文字龙卷风组件
 */
export const TextTornado: React.FC<TextTornadoProps> = ({
  contentType = "text",
  words = [],
  images = [],
  imageWeight = 0.5,
  blessingTypes = [],
  blessingStyle = {},
  particleCount = 60,
  baseRadius = 300,
  topRadius = 50,
  rotationSpeed = 2,
  liftSpeed = 0.3,
  funnelHeight = 0.85,
  fontSizeRange = [40, 80],
  imageSizeRange = [50, 100],
  blessingSizeRange = [40, 80],
  zoomIntensity = 0.5,
  entranceDuration = 30,
  swirlIntensity = 1,
  textStyle = {},
  seed = 42,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const random = useMemo(() => seededRandom(seed), [seed]);

  // 默认祝福图案类型
  const DEFAULT_BLESSING_TYPES: BlessingSymbolType[] = ["goldCoin", "moneyBag", "luckyBag", "redPacket"];
  
  // 实际使用的祝福图案类型（如果为空则使用默认值）
  const effectiveBlessingTypes = blessingTypes.length > 0 ? blessingTypes : DEFAULT_BLESSING_TYPES;

  // 判断可用内容
  const hasText = words.length > 0;
  const hasImages = images.length > 0;
  const hasBlessing = effectiveBlessingTypes.length > 0; // 始终为 true

  // 根据内容类型生成可用类型列表
  const availableTypes: ("text" | "image" | "blessing")[] = useMemo(() => {
    if (contentType !== "mixed") {
      if (contentType === "text") return hasText ? ["text"] : ["blessing"]; // 如果没有文字则回退到祝福
      if (contentType === "image") return hasImages ? ["image"] : ["blessing"]; // 如果没有图片则回退到祝福
      if (contentType === "blessing") return ["blessing"]; // blessing 模式始终可用
      return ["blessing"];
    }
    // mixed 模式
    const types: ("text" | "image" | "blessing")[] = [];
    if (hasText) types.push("text");
    if (hasImages) types.push("image");
    types.push("blessing"); // blessing 始终可用
    return types.length > 0 ? types : ["blessing"];
  }, [contentType, hasText, hasImages]);

  // 生成粒子数据
  const particles = useMemo<TornadoParticle[]>(() => {
    if (availableTypes.length === 0) return [];

    const result: TornadoParticle[] = [];
    for (let i = 0; i < particleCount; i++) {
      // 随机选择内容类型
      let type: "text" | "image" | "blessing";
      if (contentType === "mixed") {
        // 考虑图片权重
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
        // 使用有效的祝福图案类型列表
        content = effectiveBlessingTypes[Math.floor(random() * effectiveBlessingTypes.length)];
        sizeRange = blessingSizeRange;
      }

      // 高度分布 - 底部更密集
      const heightRatio = Math.pow(random(), 0.7);

      // 计算该高度对应的半径（锥形）
      const radiusAtHeight = baseRadius - (baseRadius - topRadius) * heightRatio;

      result.push({
        id: i,
        type,
        content,
        initialAngle: random() * Math.PI * 2,
        initialRadius: radiusAtHeight * (0.3 + random() * 0.7),
        heightRatio,
        size: sizeRange[0] + random() * (sizeRange[1] - sizeRange[0]),
        rotationMultiplier: 0.8 + random() * 0.4,
        opacity: 0.6 + random() * 0.4,
        delay: random() * entranceDuration,
      });
    }
    return result;
  }, [availableTypes, particleCount, words, images, effectiveBlessingTypes, random, contentType, imageWeight, hasImages, hasText, fontSizeRange, imageSizeRange, blessingSizeRange, baseRadius, topRadius, entranceDuration]);

  // 镜头拉近效果
  const zoomProgress = interpolate(frame, [0, fps * 8], [0, 1], {
    extrapolateRight: "clamp",
  });
  const currentScale = 1 + zoomProgress * zoomIntensity;

  // 龙卷风整体旋转
  const tornadoRotation = frame * rotationSpeed * 0.1;

  // 中心点（屏幕中心偏下）
  const centerX = width / 2;
  const centerY = height * 0.55;

  // 渲染单个粒子
  const renderParticle = (particle: TornadoParticle) => {
    // 入场动画
    const entranceProgress = spring({
      frame: frame - particle.delay,
      fps,
      config: {
        damping: 15,
        stiffness: 100,
      },
    });

    if (entranceProgress <= 0) return null;

    // 当前高度（向上飘动）
    const heightOffset = interpolate(
      frame,
      [0, fps * 10],
      [0, liftSpeed * height * 0.5],
      { extrapolateRight: "clamp" }
    );
    const currentHeightRatio = Math.min(1, particle.heightRatio + heightOffset / height);

    // 计算当前半径（锥形）
    const currentRadius = baseRadius - (baseRadius - topRadius) * currentHeightRatio;

    // 螺旋运动
    const spiralAngle = particle.initialAngle + tornadoRotation * particle.rotationMultiplier * swirlIntensity;
    const particleRadius = particle.initialRadius * (currentRadius / baseRadius);

    // 计算位置
    const x = centerX + Math.cos(spiralAngle) * particleRadius * entranceProgress;
    const y = centerY + (currentHeightRatio - 0.5) * height * funnelHeight;

    // 透明度
    const opacity = particle.opacity * entranceProgress * (1 - currentHeightRatio * 0.3);

    // 粒子自身旋转
    const selfRotation = spiralAngle * 30;

    // 根据类型渲染
    if (particle.type === "text") {
      const textStyles = generateTextStyle(particle.size, {
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
            transform: `translate(-50%, -50%) rotate(${selfRotation}deg) scale(${currentScale})`,
            opacity,
            whiteSpace: "nowrap",
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
            transform: `translate(-50%, -50%) rotate(${selfRotation}deg) scale(${currentScale})`,
            opacity,
            width: particle.size,
            height: particle.size,
          }}
        >
          <Img
            src={staticFile(particle.content)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
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
            transform: `translate(-50%, -50%) rotate(${selfRotation}deg) scale(${currentScale})`,
            opacity,
          }}
        >
          <SingleBlessingSymbol
            type={particle.content as BlessingSymbolType}
            size={particle.size}
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

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        perspective: "1000px",
      }}
    >
      {/* 龙卷风主体 */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          transform: `scale(${currentScale})`,
          transformOrigin: "center center",
        }}
      >
        {particles.map(renderParticle)}
      </div>

      {/* 中心吸力效果 - 发光核心 */}
      <div
        style={{
          position: "absolute",
          left: centerX,
          top: centerY - height * 0.1,
          transform: `translate(-50%, -50%) scale(${currentScale})`,
          width: 100 + interpolate(frame, [0, fps * 5], [0, 50], { extrapolateRight: "clamp" }),
          height: 100 + interpolate(frame, [0, fps * 5], [0, 50], { extrapolateRight: "clamp" }),
          background: `radial-gradient(circle, rgba(255, 215, 0, ${0.3 + zoomProgress * 0.3}) 0%, transparent 70%)`,
          borderRadius: "50%",
          filter: `blur(${20 + zoomProgress * 10}px)`,
          pointerEvents: "none",
        }}
      />

      {/* 龙卷风底部光晕 */}
      <div
        style={{
          position: "absolute",
          left: centerX,
          top: centerY + height * 0.25,
          transform: `translate(-50%, -50%) scale(${currentScale})`,
          width: baseRadius * 2,
          height: baseRadius * 0.8,
          background: `radial-gradient(ellipse, rgba(255, 200, 100, ${0.2 + zoomProgress * 0.2}) 0%, transparent 60%)`,
          filter: `blur(${30 + zoomProgress * 20}px)`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
