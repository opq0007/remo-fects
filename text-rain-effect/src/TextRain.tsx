import React, { useMemo } from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
  random,
  staticFile,
  Img,
} from "remotion";

// ==================== 文字样式类型定义 ====================

export interface GradientConfig {
  type: "linear" | "radial";
  colors: string[];
  angle?: number;
  positions?: number[];
}

export type TextEffectType = 
  | "none" | "3d" | "gold3d" | "shadow" | "emboss" 
  | "neon" | "metallic" | "retro" | "glow" | "outline";

export interface TextStyleConfig {
  color?: string;
  gradient?: GradientConfig;
  fontFamily?: string;
  fontWeight?: number;
  letterSpacing?: number;
  effect?: TextEffectType;
  effectIntensity?: number;
  depth3d?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffset?: [number, number];
  strokeColor?: string;
  strokeWidth?: number;
}

// ==================== 图片样式类型定义 ====================

export interface ImageStyleConfig {
  // 基础变换
  scale?: number;                  // 基础缩放
  scaleRange?: [number, number];   // 随机缩放范围
  
  // 动画效果
  swing?: boolean;                 // 是否摇摆
  swingAngle?: number;             // 摇摆角度
  swingSpeed?: number;             // 摇摆速度
  
  spin?: boolean;                  // 是否旋转
  spinSpeed?: number;              // 旋转速度 (圈/秒)
  
  // 特效
  glow?: boolean;                  // 是否发光
  glowColor?: string;              // 发光颜色
  glowIntensity?: number;          // 发光强度
  
  shadow?: boolean;                // 是否阴影
  shadowColor?: string;            // 阴影颜色
  shadowBlur?: number;             // 阴影模糊
  shadowOffset?: [number, number]; // 阴影偏移
  
  // 颜色调整
  tint?: string;                   // 着色
  brightness?: number;             // 亮度 (0-2)
  saturate?: number;               // 饱和度 (0-2)
}

// ==================== 雨滴类型定义 ====================

// 内容类型
export type RainContentType = "text" | "image" | "mixed";

// 文字雨滴属性
interface TextRainDrop {
  type: "text";
  id: number;
  text: string;
  x: number;
  lane: number;
  startY: number;
  endY: number;
  delay: number;
  duration: number;
  fontSize: number;
  opacity: number;
  rotation: number;
  textDirection: TextDirection;  // 文字排列方向
  textWidth: number;             // 文字宽度
  textHeight: number;            // 文字高度
}

// 图片雨滴属性
interface ImageRainDrop {
  type: "image";
  id: number;
  imageSrc: string;
  x: number;
  lane: number;
  startY: number;
  endY: number;
  delay: number;
  duration: number;
  width: number;
  height: number;
  opacity: number;
  rotation: number;
  // 图片特有动画
  swingPhase: number;
  spinDirection: number;
}

type RainDrop = TextRainDrop | ImageRainDrop;

// ==================== Props 定义 ====================

// 文字排列方向
export type TextDirection = "horizontal" | "vertical";

interface TextRainProps {
  // 内容配置
  words?: string[];              // 文字列表
  images?: string[];             // 图片路径列表 (相对于 public 目录)
  contentType?: RainContentType; // 内容类型
  imageWeight?: number;          // 图片出现权重 (0-1, mixed 模式下有效)
  
  // 文字排列方向
  textDirection?: TextDirection; // 文字排列方向：horizontal (从左到右) 或 vertical (从上到下)
  
  // 雨滴配置
  density?: number;
  fallSpeed?: number;
  fontSizeRange?: [number, number];
  imageSizeRange?: [number, number];  // 图片大小范围 (宽度)
  opacityRange?: [number, number];
  rotationRange?: [number, number];
  seed?: number;
  laneCount?: number;
  minVerticalGap?: number;
  
  // 样式配置
  textStyle?: TextStyleConfig;
  imageStyle?: ImageStyleConfig;
}

// ==================== 文字样式生成器 ====================

const generateGradientCSS = (gradient: GradientConfig): string => {
  const { type, colors, angle = 180, positions } = gradient;
  const colorStops = colors.map((color, i) => {
    const pos = positions?.[i] !== undefined ? positions[i] * 100 : (i / (colors.length - 1)) * 100;
    return `${color} ${pos}%`;
  }).join(", ");
  return type === "linear" ? `linear-gradient(${angle}deg, ${colorStops})` : `radial-gradient(circle, ${colorStops})`;
};

const EFFECT_PRESETS: Record<TextEffectType, (fontSize: number, intensity: number) => React.CSSProperties> = {
  none: () => ({}),
  shadow: (fontSize, intensity) => ({
    textShadow: `${fontSize * 0.05 * intensity}px ${fontSize * 0.05 * intensity}px ${fontSize * 0.15 * intensity}px rgba(0,0,0,${0.5 * intensity})`,
  }),
  "3d": (fontSize, intensity) => {
    const layers: string[] = [];
    const depth = Math.floor(fontSize * 0.15 * intensity);
    for (let i = 1; i <= depth; i++) {
      layers.push(`${i}px ${i}px 0 rgba(0,0,0,${0.15 - i * 0.01})`);
    }
    return { textShadow: layers.join(", ") };
  },
  gold3d: (fontSize, intensity) => {
    const depth = Math.floor(fontSize * 0.12 * intensity);
    const layers: string[] = [];
    for (let i = 1; i <= depth; i++) {
      const alpha = Math.max(0.1, 0.4 - i * 0.03);
      layers.push(`${i}px ${i}px 0 rgba(80, 40, 0, ${alpha * intensity})`);
    }
    layers.push(`-${fontSize * 0.02}px -${fontSize * 0.02}px ${fontSize * 0.08}px rgba(255, 215, 0, ${0.6 * intensity})`);
    layers.push(`0 0 ${fontSize * 0.15}px rgba(255, 200, 50, ${0.4 * intensity})`);
    layers.push(`0 0 ${fontSize * 0.05}px rgba(255, 255, 200, ${0.3 * intensity})`);
    return { textShadow: layers.join(", ") };
  },
  emboss: (fontSize, intensity) => ({
    textShadow: `-${fontSize * 0.03}px -${fontSize * 0.03}px 0 rgba(255,255,255,${0.7 * intensity}), ${fontSize * 0.03}px ${fontSize * 0.03}px 0 rgba(0,0,0,${0.5 * intensity}), 0 0 ${fontSize * 0.1}px rgba(0,0,0,${0.2 * intensity})`,
  }),
  neon: (fontSize, intensity) => ({
    textShadow: `0 0 ${fontSize * 0.1 * intensity}px currentColor, 0 0 ${fontSize * 0.2 * intensity}px currentColor, 0 0 ${fontSize * 0.4 * intensity}px currentColor, 0 0 ${fontSize * 0.6 * intensity}px rgba(255,0,255,${0.5 * intensity})`,
  }),
  metallic: (fontSize, intensity) => ({
    textShadow: `0 ${fontSize * 0.02}px ${fontSize * 0.05}px rgba(0,0,0,${0.8 * intensity}), 0 ${fontSize * 0.05}px ${fontSize * 0.1}px rgba(0,0,0,${0.5 * intensity})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  }),
  retro: (fontSize, intensity) => ({
    textShadow: `${fontSize * 0.04}px ${fontSize * 0.04}px 0 rgba(0,0,0,${0.8 * intensity}), ${fontSize * 0.08}px ${fontSize * 0.08}px 0 rgba(0,0,0,${0.4 * intensity}), 0 0 ${fontSize * 0.05}px rgba(139,69,19,${0.3 * intensity})`,
  }),
  glow: (fontSize, intensity) => ({
    textShadow: `0 0 ${fontSize * 0.1 * intensity}px rgba(255,255,255,${0.8 * intensity}), 0 0 ${fontSize * 0.2 * intensity}px rgba(255,255,255,${0.5 * intensity}), 0 0 ${fontSize * 0.4 * intensity}px currentColor`,
  }),
  outline: (fontSize, intensity) => ({
    WebkitTextStroke: `${fontSize * 0.02 * intensity}px rgba(0,0,0,${0.8 * intensity})`,
    textShadow: `0 0 ${fontSize * 0.05 * intensity}px rgba(0,0,0,${0.3 * intensity})`,
  }),
};

const generateTextStyle = (fontSize: number, style: TextStyleConfig): React.CSSProperties => {
  const intensity = style.effectIntensity ?? 0.8;
  const effect = style.effect ?? "gold3d";
  
  const baseStyle: React.CSSProperties = {
    fontFamily: style.fontFamily ?? "PingFang SC, Microsoft YaHei, SimHei, sans-serif",
    fontWeight: style.fontWeight ?? 700,
    letterSpacing: style.letterSpacing ?? 2,
  };
  
  if (style.gradient) {
    baseStyle.background = generateGradientCSS(style.gradient);
    baseStyle.WebkitBackgroundClip = "text";
    baseStyle.WebkitTextFillColor = "transparent";
  } else {
    baseStyle.color = style.color ?? "#ffd700";
  }
  
  const effectStyle = EFFECT_PRESETS[effect](fontSize, intensity);
  
  if (style.shadowColor && style.shadowBlur) {
    const customShadow = `${style.shadowOffset?.[0] ?? 0}px ${style.shadowOffset?.[1] ?? 0}px ${style.shadowBlur}px ${style.shadowColor}`;
    effectStyle.textShadow = effectStyle.textShadow ? `${effectStyle.textShadow}, ${customShadow}` : customShadow;
  }
  
  if (style.strokeColor && style.strokeWidth) {
    baseStyle.WebkitTextStroke = `${style.strokeWidth}px ${style.strokeColor}`;
  }
  
  return { ...baseStyle, ...effectStyle };
};

// ==================== 图片样式生成器 ====================

const generateImageStyle = (
  width: number,
  height: number,
  style: ImageStyleConfig,
  frame: number,
  duration: number,
  swingPhase: number,
  spinDirection: number
): React.CSSProperties => {
  const styles: React.CSSProperties = {
    width,
    height,
    objectFit: "contain",
  };
  
  // 发光效果
  if (style.glow) {
    const glowColor = style.glowColor ?? "#ffd700";
    const glowIntensity = style.glowIntensity ?? 0.8;
    styles.filter = `drop-shadow(0 0 ${width * 0.15 * glowIntensity}px ${glowColor})`;
  }
  
  // 阴影效果
  if (style.shadow) {
    const shadowColor = style.shadowColor ?? "rgba(0,0,0,0.5)";
    const shadowBlur = style.shadowBlur ?? 20;
    const existingFilter = styles.filter as string || "";
    styles.filter = existingFilter 
      ? `${existingFilter} drop-shadow(${style.shadowOffset?.[0] ?? 5}px ${style.shadowOffset?.[1] ?? 5}px ${shadowBlur}px ${shadowColor})`
      : `drop-shadow(${style.shadowOffset?.[0] ?? 5}px ${style.shadowOffset?.[1] ?? 5}px ${shadowBlur}px ${shadowColor})`;
  }
  
  // 颜色调整
  const filters: string[] = [];
  if (style.tint) {
    filters.push(`sepia(1) hue-rotate(${getHueRotate(style.tint)}deg)`);
  }
  if (style.brightness !== undefined) {
    filters.push(`brightness(${style.brightness})`);
  }
  if (style.saturate !== undefined) {
    filters.push(`saturate(${style.saturate})`);
  }
  if (filters.length > 0) {
    const existingFilter = styles.filter as string || "";
    styles.filter = existingFilter ? `${existingFilter} ${filters.join(" ")}` : filters.join(" ");
  }
  
  return styles;
};

// 将颜色转换为色相旋转值
const getHueRotate = (color: string): number => {
  // 简化处理，返回固定值，实际可以计算
  const colorMap: Record<string, number> = {
    "#ffd700": 45,  // 金色
    "#ff0000": 0,   // 红色
    "#00ff00": 120, // 绿色
    "#0000ff": 240, // 蓝色
    "#ff00ff": 300, // 紫色
  };
  return colorMap[color.toLowerCase()] ?? 0;
};

// ==================== 雨滴生成逻辑 ====================

const generateNonOverlappingDrops = (
  words: string[],
  images: string[],
  contentType: RainContentType,
  imageWeight: number,
  textDirection: TextDirection,
  count: number,
  durationInFrames: number,
  fps: number,
  seed: number,
  fontSizeRange: [number, number],
  imageSizeRange: [number, number],
  opacityRange: [number, number],
  rotationRange: [number, number],
  width: number,
  height: number,
  laneCount: number,
  minVerticalGap: number
): RainDrop[] => {
  const drops: RainDrop[] = [];
  const laneOccupancy: { startY: number; endY: number; startTime: number; endTime: number }[][] = 
    Array.from({ length: laneCount }, () => []);
  const laneWidth = width / laneCount;

  const hasText = words.length > 0;
  const hasImages = images.length > 0;

  for (let i = 0; i < count; i++) {
    const seedValue = seed + i * 1000;
    
    // 决定内容类型
    let dropType: "text" | "image" = "text";
    if (contentType === "image") {
      dropType = "image";
    } else if (contentType === "mixed" && hasText && hasImages) {
      dropType = random(`type-${seedValue}`) < imageWeight ? "image" : "text";
    } else if (contentType === "mixed" && hasImages) {
      dropType = "image";
    }
    
    const opacity = opacityRange[0] + random(`opacity-${seedValue}`) * (opacityRange[1] - opacityRange[0]);
    const rotation = rotationRange[0] + random(`rotation-${seedValue}`) * (rotationRange[1] - rotationRange[0]);
    
    let itemWidth: number;
    let itemHeight: number;
    let text = "";
    let imageSrc = "";
    
    if (dropType === "text" && hasText) {
      text = words[Math.floor(random(`word-${seedValue}`) * words.length)];
      const fontSize = fontSizeRange[0] + random(`fontSize-${seedValue}`) * (fontSizeRange[1] - fontSizeRange[0]);
      
      // 根据文字方向计算宽高
      if (textDirection === "vertical") {
        // 竖排：宽度为字体大小，高度为字符数*字体大小
        const charCount = text.length;
        itemWidth = fontSize * 1.2;
        itemHeight = fontSize * charCount * 1.1;
      } else {
        // 横排：宽度为字符数*字体大小，高度为字体大小
        const charCount = text.length;
        // 中文字符约为字体大小，平均估算
        itemWidth = fontSize * charCount * 0.9;
        itemHeight = fontSize * 1.2;
      }
      
      drops.push({
        type: "text",
        id: i, text, x: 0, lane: 0, startY: 0, endY: 0,
        delay: 0, duration: 0, fontSize, opacity, rotation,
        textDirection,
        textWidth: itemWidth,
        textHeight: itemHeight,
      });
    } else if (dropType === "image" && hasImages) {
      imageSrc = images[Math.floor(random(`image-${seedValue}`) * images.length)];
      const itemSize = imageSizeRange[0] + random(`imageSize-${seedValue}`) * (imageSizeRange[1] - imageSizeRange[0]);
      itemWidth = itemSize;
      itemHeight = itemSize;
      
      drops.push({
        type: "image",
        id: i, imageSrc, x: 0, lane: 0, startY: 0, endY: 0,
        delay: 0, duration: 0, width: itemSize, height: itemSize, opacity, rotation,
        swingPhase: random(`swing-${seedValue}`) * Math.PI * 2,
        spinDirection: random(`spin-${seedValue}`) > 0.5 ? 1 : -1,
      });
    } else {
      continue;
    }
    
    // 计算碰撞和位置
    const lastDrop = drops[drops.length - 1];
    const shuffledLanes = Array.from({ length: laneCount }, (_, idx) => idx)
      .sort(() => random(`lane-shuffle-${seedValue}-${i}`) - 0.5);
    
    let selectedLane = -1;
    let bestDelay = 0;
    let bestDuration = 0;
    
    const baseDuration = Math.floor(fps * 3 + random(`duration-${seedValue}`) * fps * 2);
    const baseDelay = Math.floor(random(`delay-${seedValue}`) * durationInFrames * 0.9);
    const fallDistance = height + itemHeight * 2;
    const fallPixelsPerFrame = fallDistance / baseDuration;
    
    for (const lane of shuffledLanes) {
      const startY = -itemHeight - random(`startY-${seedValue}`) * itemHeight;
      const endY = height + itemHeight;
      
      let hasCollision = false;
      for (const occupied of laneOccupancy[lane]) {
        const timeOverlap = !(baseDelay + baseDuration < occupied.startTime || baseDelay > occupied.endTime);
        if (timeOverlap) {
          const frameAtOverlap = Math.max(baseDelay, occupied.startTime);
          const currentY = startY + (frameAtOverlap - baseDelay) * fallPixelsPerFrame;
          const occupiedY = occupied.startY + (frameAtOverlap - occupied.startTime) * fallPixelsPerFrame;
          if (Math.abs(currentY - occupiedY) < itemHeight + minVerticalGap) {
            hasCollision = true;
            break;
          }
        }
      }
      
      if (!hasCollision) {
        selectedLane = lane;
        bestDelay = baseDelay;
        bestDuration = baseDuration;
        break;
      }
    }
    
    if (selectedLane === -1) {
      drops.pop();
      continue;
    }
    
    const laneX = selectedLane * laneWidth + laneWidth / 2;
    const offsetX = (random(`offset-${seedValue}-${selectedLane}`) - 0.5) * laneWidth * 0.6;
    const x = laneX + offsetX;
    const startY = -itemHeight - random(`startY-${seedValue}`) * itemHeight;
    const endY = height + itemHeight;
    
    laneOccupancy[selectedLane].push({
      startY, endY, startTime: bestDelay, endTime: bestDelay + bestDuration,
    });
    
    // 更新雨滴位置信息
    lastDrop.x = x;
    lastDrop.lane = selectedLane;
    lastDrop.startY = startY;
    lastDrop.endY = endY;
    lastDrop.delay = bestDelay;
    lastDrop.duration = bestDuration;
  }

  return drops;
};

// ==================== 雨滴组件 ====================

const TextRainDropItem: React.FC<{
  drop: TextRainDrop;
  frame: number;
  textStyle: TextStyleConfig;
}> = ({ drop, frame, textStyle }) => {
  const currentFrame = frame - drop.delay;
  if (currentFrame < 0) return null;

  const progress = interpolate(currentFrame, [0, drop.duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const easedProgress = Easing.out(Easing.quad)(progress);
  const y = interpolate(easedProgress, [0, 1], [drop.startY, drop.endY]);

  const fadeInDuration = drop.duration * 0.1;
  const fadeOutStart = drop.duration * 0.85;
  
  let opacity = drop.opacity;
  if (currentFrame < fadeInDuration) {
    opacity *= interpolate(currentFrame, [0, fadeInDuration], [0, 1], { extrapolateRight: "clamp" });
  } else if (currentFrame > fadeOutStart) {
    opacity *= interpolate(currentFrame, [fadeOutStart, drop.duration], [1, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
  }

  const textStyles = generateTextStyle(drop.fontSize, textStyle);

  // 根据文字方向决定布局
  const isVertical = drop.textDirection === "vertical";
  
  // 竖排文字时禁用旋转，保持笔直落下
  const effectiveRotation = isVertical ? 0 : drop.rotation;

  return (
    <div
      style={{
        position: "absolute",
        left: drop.x,
        top: y,
        transform: `translateX(-50%) rotate(${effectiveRotation}deg)`,
        opacity,
        whiteSpace: isVertical ? "normal" : "nowrap",
        writingMode: isVertical ? "vertical-rl" : "horizontal-tb",
        textOrientation: isVertical ? "upright" : "mixed",
        pointerEvents: "none",
        display: "flex",
        flexDirection: isVertical ? "column" : "row",
        alignItems: "center",
        justifyContent: isVertical ? "flex-start" : "center",
        lineHeight: isVertical ? 1.1 : 1.2,
        ...textStyles,
      }}
    >
      {drop.text}
    </div>
  );
};

const ImageRainDropItem: React.FC<{
  drop: ImageRainDrop;
  frame: number;
  imageStyle: ImageStyleConfig;
}> = ({ drop, frame, imageStyle }) => {
  const currentFrame = frame - drop.delay;
  if (currentFrame < 0) return null;

  const progress = interpolate(currentFrame, [0, drop.duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const easedProgress = Easing.out(Easing.quad)(progress);
  const y = interpolate(easedProgress, [0, 1], [drop.startY, drop.endY]);

  const fadeInDuration = drop.duration * 0.1;
  const fadeOutStart = drop.duration * 0.85;
  
  let opacity = drop.opacity;
  if (currentFrame < fadeInDuration) {
    opacity *= interpolate(currentFrame, [0, fadeInDuration], [0, 1], { extrapolateRight: "clamp" });
  } else if (currentFrame > fadeOutStart) {
    opacity *= interpolate(currentFrame, [fadeOutStart, drop.duration], [1, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
  }

  // 计算动态变换
  let dynamicRotation = drop.rotation;
  let dynamicX = 0;
  
  // 摇摆效果
  if (imageStyle.swing) {
    const swingAngle = imageStyle.swingAngle ?? 15;
    const swingSpeed = imageStyle.swingSpeed ?? 2;
    dynamicRotation += Math.sin(currentFrame * 0.1 * swingSpeed + drop.swingPhase) * swingAngle;
  }
  
  // 旋转效果
  if (imageStyle.spin) {
    const spinSpeed = imageStyle.spinSpeed ?? 1;
    dynamicRotation += currentFrame * (360 * spinSpeed / 30) * drop.spinDirection;
  }

  const imgStyles = generateImageStyle(
    drop.width, drop.height, imageStyle, currentFrame, drop.duration, drop.swingPhase, drop.spinDirection
  );

  return (
    <div
      style={{
        position: "absolute",
        left: drop.x,
        top: y,
        transform: `translateX(-50%) rotate(${dynamicRotation}deg)`,
        opacity,
        pointerEvents: "none",
      }}
    >
      <Img src={staticFile(drop.imageSrc)} style={imgStyles} />
    </div>
  );
};

// ==================== 主组件 ====================

export const TextRain: React.FC<TextRainProps> = ({
  words = [],
  images = [],
  contentType = "text",
  imageWeight = 0.5,
  textDirection = "horizontal",
  density = 3,
  fallSpeed = 1,
  fontSizeRange = [24, 72],
  imageSizeRange = [50, 150],
  opacityRange = [0.4, 0.9],
  rotationRange = [-15, 15],
  seed = 12345,
  laneCount = 12,
  minVerticalGap = 80,
  textStyle = {},
  imageStyle = {},
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const mergedTextStyle: TextStyleConfig = {
    color: "#ffd700",
    effect: "gold3d",
    effectIntensity: 0.8,
    fontWeight: 700,
    fontFamily: "PingFang SC, Microsoft YaHei, SimHei, sans-serif",
    ...textStyle,
  };

  const mergedImageStyle: ImageStyleConfig = {
    glow: true,
    glowColor: "#ffd700",
    glowIntensity: 0.6,
    shadow: true,
    shadowBlur: 15,
    swing: true,
    swingAngle: 10,
    swingSpeed: 2,
    ...imageStyle,
  };

  const totalDrops = useMemo(() => {
    const durationInSeconds = durationInFrames / fps;
    return Math.floor(durationInSeconds * density * 15);
  }, [durationInFrames, fps, density]);

  const drops = useMemo(() => {
    return generateNonOverlappingDrops(
      words, images, contentType, imageWeight, textDirection, totalDrops, durationInFrames, fps / fallSpeed, seed,
      fontSizeRange, imageSizeRange, opacityRange, rotationRange, width, height,
      laneCount, minVerticalGap,
    );
  }, [words, images, contentType, imageWeight, textDirection, totalDrops, durationInFrames, fps, fallSpeed, seed,
      fontSizeRange, imageSizeRange, opacityRange, rotationRange, width, height, laneCount, minVerticalGap]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {drops.map((drop) => {
        if (drop.type === "text") {
          return <TextRainDropItem key={drop.id} drop={drop} frame={frame} textStyle={mergedTextStyle} />;
        } else {
          return <ImageRainDropItem key={drop.id} drop={drop} frame={frame} imageStyle={mergedImageStyle} />;
        }
      })}
    </AbsoluteFill>
  );
};

// 导出类型
export type { TextRainProps, RainDrop, TextRainDrop, ImageRainDrop };