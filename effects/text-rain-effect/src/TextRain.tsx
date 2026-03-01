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
import {
  BlessingSymbol,
  BlessingSymbolType,
  getImageSrc,
} from "../../shared/components";

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
export type RainContentType = "text" | "image" | "mixed" | "blessing";

// 运动方向
export type FallDirection = "down" | "up";  // down: 从上到下, up: 从下到上

// 祝福图案样式配置
export interface BlessingStyleConfig {
  primaryColor?: string;
  secondaryColor?: string;
  enable3D?: boolean;
  enableGlow?: boolean;
  glowIntensity?: number;
  animated?: boolean;
  animationSpeed?: number;
}

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

// 祝福图案雨滴属性
interface BlessingRainDrop {
  type: "blessing";
  id: number;
  blessingType: BlessingSymbolType;
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
  scale: number;
  // 祝福图案特有样式
  primaryColor: string;
  secondaryColor: string;
  enable3D: boolean;
  enableGlow: boolean;
  glowIntensity: number;
  animated: boolean;
  animationDelay: number;
}

type RainDrop = TextRainDrop | ImageRainDrop | BlessingRainDrop;

// ==================== Props 定义 ====================

// 文字排列方向
export type TextDirection = "horizontal" | "vertical";

interface TextRainProps {
  // 内容配置
  words?: string[];              // 文字列表
  images?: string[];             // 图片路径列表 (相对于 public 目录)
  contentType?: RainContentType; // 内容类型
  imageWeight?: number;          // 图片出现权重 (0-1, mixed 模式下有效)
  
  // 祝福图案配置 (blessing 模式)
  blessingTypes?: BlessingSymbolType[];  // 祝福图案类型列表
  blessingStyle?: BlessingStyleConfig;   // 祝福图案样式配置
  
  // 文字排列方向
  textDirection?: TextDirection; // 文字排列方向：horizontal (从左到右) 或 vertical (从上到下)
  
  // 运动方向
  fallDirection?: FallDirection; // 雨滴运动方向：down (从上到下，默认) 或 up (从下到上)
  
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
    fontSize: fontSize,  // 关键：设置字体大小
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

// ==================== 性能优化说明 ====================
/**
 * 【为什么预览快但渲染慢？】
 * 
 * 1. 预览模式：只渲染当前显示的1帧，浏览器实时计算
 * 2. 渲染模式：需要逐帧生成图片（如 240帧 × 720×1280像素），再编码成视频
 * 
 * 【主要性能瓶颈】
 * 
 * 1. 雨滴数量 = duration(秒) × density × 15
 *    例如：10秒 × 2 × 15 = 300个雨滴，每个雨滴都要计算位置和动画
 * 
 * 2. 复杂的文字效果（如 gold3d）有多层 textShadow，渲染开销大
 * 
 * 3. 背景视频需要逐帧解码（如果使用了视频背景）
 * 
 * 【优化建议】
 * 
 * 1. 降低 fps（从30降到24）
 * 2. 减少 density（从3降到1-2）
 * 3. 缩短视频时长
 * 4. 使用图片背景代替视频背景
 * 5. 使用简单的文字效果（如 shadow 比 gold3d 快）
 * 6. 减少 laneCount 和总雨滴数量
 * 
 * 【并发渲染】
 * 已在 remotion.config.ts 中配置并发渲染，利用多核 CPU 加速
 */

// ==================== 雨滴生成逻辑 ====================

const generateNonOverlappingDrops = (
  words: string[],
  images: string[],
  contentType: RainContentType,
  imageWeight: number,
  textDirection: TextDirection,
  fallDirection: FallDirection,  // 运动方向
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
  minVerticalGap: number,
  // 祝福图案配置
  blessingTypes: BlessingSymbolType[] = [],
  blessingStyle: BlessingStyleConfig = {}
): RainDrop[] => {
  const drops: RainDrop[] = [];
  
  // 【优化】如果 count 为 0，直接返回空数组
  if (count <= 0) return drops;
  
  const laneOccupancy: { startY: number; endY: number; startTime: number; endTime: number }[][] = 
    Array.from({ length: laneCount }, () => []);
  const laneWidth = width / laneCount;

  const hasText = words.length > 0;
  const hasImages = images.length > 0;
  const hasBlessing = blessingTypes.length > 0;
  
  // 【优化】预先计算常量，避免在循环中重复计算
  const opacityDelta = opacityRange[1] - opacityRange[0];
  const rotationDelta = rotationRange[1] - rotationRange[0];
  const fontSizeDelta = fontSizeRange[1] - fontSizeRange[0];
  const imageSizeDelta = imageSizeRange[1] - imageSizeRange[0];
  const fpsValue = typeof fps === 'number' ? fps : 30;

  // 【修复】使用独立计数器来跟踪成功添加的文字/图片数量，确保轮询顺序正确
  let textIndex = 0;   // 文字计数器
  let imageIndex = 0;  // 图片计数器
  let blessingIndex = 0;  // 祝福图案计数器

  for (let i = 0; i < count; i++) {
    const seedValue = seed + i * 1000;
    
    // 决定内容类型
    let dropType: "text" | "image" | "blessing" = "text";
    if (contentType === "image") {
      dropType = "image";
    } else if (contentType === "blessing") {
      dropType = "blessing";
    } else if (contentType === "mixed") {
      // mixed 模式：支持文字、图片、祝福图案的自由组合
      const availableTypes: ("text" | "image" | "blessing")[] = [];
      if (hasText) availableTypes.push("text");
      if (hasImages) availableTypes.push("image");
      if (hasBlessing) availableTypes.push("blessing");
      
      if (availableTypes.length > 0) {
        // 如果有多种类型，根据 imageWeight 调整概率
        if (availableTypes.length === 1) {
          dropType = availableTypes[0];
        } else if (availableTypes.includes("text") && availableTypes.includes("image") && availableTypes.includes("blessing")) {
          // 三种类型都有：text = 1-imageWeight-blessingWeight, image = imageWeight, blessing = blessingWeight
          const blessingWeight = 0.3; // 祝福图案的默认权重
          const textWeight = 1 - imageWeight - blessingWeight;
          const rand = random(`type-${seedValue}`);
          if (rand < textWeight) {
            dropType = "text";
          } else if (rand < textWeight + imageWeight) {
            dropType = "image";
          } else {
            dropType = "blessing";
          }
        } else if (availableTypes.includes("text") && availableTypes.includes("image")) {
          // 只有文字和图片
          dropType = random(`type-${seedValue}`) < imageWeight ? "image" : "text";
        } else if (availableTypes.includes("text") && availableTypes.includes("blessing")) {
          // 只有文字和祝福
          dropType = random(`type-${seedValue}`) < 0.5 ? "blessing" : "text";
        } else if (availableTypes.includes("image") && availableTypes.includes("blessing")) {
          // 只有图片和祝福
          dropType = random(`type-${seedValue}`) < 0.5 ? "blessing" : "image";
        } else {
          dropType = availableTypes[0];
        }
      }
    }
    
    // 【优化】使用预计算的 delta 值，减少重复计算
    const opacity = opacityRange[0] + random(`opacity-${seedValue}`) * opacityDelta;
    const rotation = rotationRange[0] + random(`rotation-${seedValue}`) * rotationDelta;
    
    let itemWidth: number;
    let itemHeight: number;
    let text = "";
    let imageSrc = "";
    let currentTextIndex = -1;   // 记录当前文字索引
    let currentImageIndex = -1;  // 记录当前图片索引
    
    if (dropType === "text" && hasText) {
      // 【修复】使用独立计数器确保文字按顺序轮询
      currentTextIndex = textIndex;
      text = words[textIndex % words.length];
      textIndex++;
      // 【优化】使用预计算的 delta 值
      const fontSize = fontSizeRange[0] + random(`fontSize-${seedValue}`) * fontSizeDelta;
      
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
      // 【修复】使用独立计数器确保图片按顺序轮询
      currentImageIndex = imageIndex;
      imageSrc = images[imageIndex % images.length];
      imageIndex++;
      // 【优化】使用预计算的 delta 值
      const itemSize = imageSizeRange[0] + random(`imageSize-${seedValue}`) * imageSizeDelta;
      itemWidth = itemSize;
      itemHeight = itemSize;
      
      drops.push({
        type: "image",
        id: i, imageSrc, x: 0, lane: 0, startY: 0, endY: 0,
        delay: 0, duration: 0, width: itemSize, height: itemSize, opacity, rotation,
        swingPhase: random(`swing-${seedValue}`) * Math.PI * 2,
        spinDirection: random(`spin-${seedValue}`) > 0.5 ? 1 : -1,
      });
    } else if (dropType === "blessing" && hasBlessing) {
      // 祝福图案雨滴
      const currentBlessingIndex = blessingIndex;
      const blessingType = blessingTypes[blessingIndex % blessingTypes.length];
      blessingIndex++;
      
      // 【优化】使用预计算的 delta 值
      const itemSize = imageSizeRange[0] + random(`blessingSize-${seedValue}`) * imageSizeDelta;
      itemWidth = itemSize;
      itemHeight = itemSize;
      
      // 根据图案类型调整尺寸比例
      const sizeMultiplier = blessingType === "ingotPile" || blessingType === "coinStack" ? 1.5 : 1;
      
      drops.push({
        type: "blessing",
        id: i,
        blessingType,
        x: 0,
        lane: 0,
        startY: 0,
        endY: 0,
        delay: 0,
        duration: 0,
        width: itemSize * sizeMultiplier,
        height: itemSize * sizeMultiplier,
        opacity,
        rotation,
        scale: 1,
        primaryColor: blessingStyle.primaryColor ?? "#FFD700",
        secondaryColor: blessingStyle.secondaryColor ?? "#FFA500",
        enable3D: blessingStyle.enable3D ?? true,
        enableGlow: blessingStyle.enableGlow ?? true,
        glowIntensity: blessingStyle.glowIntensity ?? 1,
        animated: blessingStyle.animated ?? false,
        animationDelay: random(`animDelay-${seedValue}`) * 30,
      });
    } else {
      continue;
    }
    
    // 计算碰撞和位置
    const lastDrop = drops[drops.length - 1];
    
    // 【优化】使用 Fisher-Yates 洗牌算法的简化版，减少随机调用
    const shuffledLanes: number[] = [];
    const availableLanes = Array.from({ length: laneCount }, (_, idx) => idx);
    for (let j = laneCount - 1; j >= 0; j--) {
      const randIdx = Math.floor(random(`lane-${seedValue}-${j}`) * (j + 1));
      shuffledLanes.push(availableLanes[randIdx]);
      availableLanes[randIdx] = availableLanes[j];
    }
    
    let selectedLane = -1;
    let bestDelay = 0;
    let bestDuration = 0;
    
    // 【优化】使用预计算的 fps 值
    const baseDuration = Math.floor(fpsValue * 3 + random(`duration-${seedValue}`) * fpsValue * 2);
    const baseDelay = Math.floor(random(`delay-${seedValue}`) * durationInFrames * 0.9);
    const fallDistance = height + itemHeight * 2;
    const fallPixelsPerFrame = fallDistance / baseDuration;
    
    // 【修复】碰撞检测中也要根据 fallDirection 计算正确的起始位置
    const collisionStartY = fallDirection === "up" 
      ? height + itemHeight + random(`startY-${seedValue}`) * itemHeight
      : -itemHeight - random(`startY-${seedValue}`) * itemHeight;
    const collisionEndY = fallDirection === "up" 
      ? -itemHeight 
      : height + itemHeight;
    
    for (const lane of shuffledLanes) {
      let hasCollision = false;
      for (const occupied of laneOccupancy[lane]) {
        const timeOverlap = !(baseDelay + baseDuration < occupied.startTime || baseDelay > occupied.endTime);
        if (timeOverlap) {
          const frameAtOverlap = Math.max(baseDelay, occupied.startTime);
          // 【修复】根据运动方向计算当前位置
          // down: startY -> endY (从负数到正数，Y增加)
          // up: startY -> endY (从正数到负数，Y减少)
          const currentY = fallDirection === "up"
            ? collisionStartY - (frameAtOverlap - baseDelay) * fallPixelsPerFrame
            : collisionStartY + (frameAtOverlap - baseDelay) * fallPixelsPerFrame;
          const occupiedY = fallDirection === "up"
            ? occupied.startY - (frameAtOverlap - occupied.startTime) * fallPixelsPerFrame
            : occupied.startY + (frameAtOverlap - occupied.startTime) * fallPixelsPerFrame;
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
      // 【修复】碰撞检测失败时，回滚计数器，确保轮询顺序不乱
      if (currentTextIndex >= 0) {
        textIndex--;
      }
      if (currentImageIndex >= 0) {
        imageIndex--;
      }
      continue;
    }
    
    const laneX = selectedLane * laneWidth + laneWidth / 2;
    const offsetX = (random(`offset-${seedValue}-${selectedLane}`) - 0.5) * laneWidth * 0.6;
    const x = laneX + offsetX;
    
    // 【修复】使用碰撞检测中已计算的 startY 和 endY
    const startY = collisionStartY;
    const endY = collisionEndY;
    
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
        // 【修复】垂直文字使用 writingMode 实现竖排，不需要额外的 flex 布局
        // writingMode 和 flex 组合会导致渲染不稳定，文字可能先水平后垂直
        whiteSpace: isVertical ? "nowrap" : "nowrap",
        writingMode: isVertical ? "vertical-rl" : "horizontal-tb",
        textOrientation: isVertical ? "upright" : "mixed",
        pointerEvents: "none",
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
      <Img src={getImageSrc(drop.imageSrc)} style={imgStyles} />
    </div>
  );
};

const BlessingRainDropItem: React.FC<{
  drop: BlessingRainDrop;
  frame: number;
}> = ({ drop, frame }) => {
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

  // 计算动态旋转
  let dynamicRotation = drop.rotation;
  if (drop.animated) {
    dynamicRotation += currentFrame * 0.5;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: drop.x,
        top: y,
        transform: `translateX(-50%) rotate(${dynamicRotation}deg) scale(${drop.scale})`,
        opacity,
        pointerEvents: "none",
        width: drop.width,
        height: drop.height,
      }}
    >
      <BlessingSymbol
        symbols={[
          {
            type: drop.blessingType,
            x: 50,
            y: 50,
            scale: 1,
            primaryColor: drop.primaryColor,
            secondaryColor: drop.secondaryColor,
            enable3D: drop.enable3D,
            enableGlow: drop.enableGlow,
            glowIntensity: drop.glowIntensity,
          },
        ]}
        animationSpeed={0}
      />
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
  fallDirection = "down",  // 默认从上到下
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
  blessingTypes = [],
  blessingStyle = {},
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

  const mergedBlessingStyle: BlessingStyleConfig = {
    primaryColor: "#FFD700",
    secondaryColor: "#FFA500",
    enable3D: true,
    enableGlow: true,
    glowIntensity: 1,
    animated: false,
    ...blessingStyle,
  };

  // 【性能关键】计算总雨滴数量
  // 公式：duration(秒) × density × 15
  // 例如：10秒 × 2 × 15 = 300个雨滴
  // 雨滴数量直接影响渲染性能，建议控制总数量在 200 以内
  const totalDrops = useMemo(() => {
    const durationInSeconds = durationInFrames / fps;
    const count = Math.floor(durationInSeconds * density * 15);
    // 【优化】限制最大雨滴数量，避免内存溢出
    return Math.min(count, 300);
  }, [durationInFrames, fps, density]);

  // 【优化】使用 JSON 序列化作为依赖，确保数组内容变化时才重新计算
  // 这是 React 推荐的方式，用于处理数组/对象类型的依赖
  const drops = useMemo(() => {
    // 【性能提示】这是渲染的主要瓶颈，雨滴数量越多计算越慢
    return generateNonOverlappingDrops(
      words, images, contentType, imageWeight, textDirection, fallDirection, totalDrops, durationInFrames, fps / fallSpeed, seed,
      fontSizeRange, imageSizeRange, opacityRange, rotationRange, width, height,
      laneCount, minVerticalGap,
      blessingTypes, mergedBlessingStyle,
    );
    // 使用 JSON 序列化处理数组依赖，避免引用比较问题
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    JSON.stringify(words),
    JSON.stringify(images),
    JSON.stringify(blessingTypes),
    contentType,
    imageWeight,
    textDirection,
    fallDirection,
    totalDrops,
    durationInFrames,
    fps,
    fallSpeed,
    seed,
    JSON.stringify(fontSizeRange),
    JSON.stringify(imageSizeRange),
    JSON.stringify(opacityRange),
    JSON.stringify(rotationRange),
    width,
    height,
    laneCount,
    minVerticalGap,
    JSON.stringify(mergedBlessingStyle),
  ]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {drops.map((drop) => {
        if (drop.type === "text") {
          return <TextRainDropItem key={drop.id} drop={drop} frame={frame} textStyle={mergedTextStyle} />;
        } else if (drop.type === "image") {
          return <ImageRainDropItem key={drop.id} drop={drop} frame={frame} imageStyle={mergedImageStyle} />;
        } else {
          return <BlessingRainDropItem key={drop.id} drop={drop} frame={frame} />;
        }
      })}
    </AbsoluteFill>
  );
};

// 导出类型
export type { TextRainProps, RainDrop, TextRainDrop, ImageRainDrop, BlessingRainDrop };