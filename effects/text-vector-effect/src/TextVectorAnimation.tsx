/**
 * 文字矢量动画组件
 * 
 * 核心组件：将文字转为SVG路径轮廓，然后用混合输入元素填充轨迹
 */

import React, { useMemo, useRef, useEffect, useState } from "react";
import { useCurrentFrame, useVideoConfig, random, Easing, interpolate, spring } from "remotion";
import {
  MixedInputItem,
  MixedItemType,
  MixedTextStyleConfig,
  MixedImageStyleConfig,
  BlessingStyleConfig,
  detectAvailableContent,
  determineContentType,
  getNextContent,
  getSizeRange,
  createMixedInputItem,
} from "../../shared/index";
import { PathPoint, textToFillPoints, normalizePoints } from "./textToPath";

// ==================== 类型定义 ====================

export interface TextVectorAnimationProps {
  /** 要显示的核心文字 */
  text: string;
  
  // ===== 混合输入配置 =====
  /** 内容类型 */
  contentType?: "text" | "image" | "blessing" | "mixed";
  /** 文字列表 */
  words?: string[];
  /** 图片列表 */
  images?: string[];
  /** 祝福图案类型列表 */
  blessingTypes?: Array<"goldCoin" | "moneyBag" | "luckyBag" | "redPacket">;
  /** 图片出现权重 */
  imageWeight?: number;
  
  // ===== 字体配置 =====
  /** 字体大小 */
  fontSize?: number;
  /** 字体家族 */
  fontFamily?: string;
  /** 字重 */
  fontWeight?: number;
  
  // ===== 元素配置 =====
  /** 填充元素大小 */
  elementSize?: number;
  /** 元素大小范围 */
  elementSizeRange?: [number, number];
  /** 元素间距 */
  elementSpacing?: number;
  
  // ===== 颜色配置 =====
  /** 文字颜色 */
  textColor?: string;
  /** 发光颜色 */
  glowColor?: string;
  /** 发光强度 */
  glowIntensity?: number;
  /** 颜色列表 */
  colors?: string[];
  
  // ===== 样式配置 =====
  /** 文字样式 */
  textStyle?: MixedTextStyleConfig;
  /** 图片样式 */
  imageStyle?: MixedImageStyleConfig;
  /** 祝福图案样式 */
  blessingStyle?: BlessingStyleConfig;
  
  // ===== 文字排列配置 =====
  /** 文字排列方向 */
  textOrientation?: "horizontal" | "vertical";
  
  // ===== 多字动画配置 =====
  /** 多字动画模式：together（同时）| sequential（依次） */
  charAnimationMode?: "together" | "sequential";
  /** 依次展示时每字间隔（帧） */
  charInterval?: number;
  /** 依次展示时每字停留时长（帧） */
  charStayDuration?: number;
  
  // ===== 动画配置 =====
  /** 入场动画时长（帧） */
  entranceDuration?: number;
  /** 入场动画类型 */
  entranceType?: "fade" | "scale" | "fly" | "wave";
  /** 填充动画时长（帧） */
  fillDuration?: number;
  /** 填充动画类型 */
  fillType?: "sequential" | "random" | "radial" | "wave";
  /** 完成后的停留动画 */
  stayAnimation?: "pulse" | "glow" | "float" | "none";
  /** 脉冲速度 */
  pulseSpeed?: number;
  /** 发光脉冲速度 */
  glowPulseSpeed?: number;
  /** 漂浮幅度 */
  floatAmplitude?: number;
  /** 漂浮速度 */
  floatSpeed?: number;
  
  // ===== 3D 效果 =====
  /** 是否启用3D效果 */
  enable3D?: boolean;
  /** 3D旋转角度 */
  rotation3D?: number;
  
  // ===== 其他 =====
  /** 随机种子 */
  seed?: number;
}

// ==================== 默认值 ====================

const DEFAULT_COLORS = [
  "#FFD700", // 金色
  "#FF6B6B", // 珊瑚红
  "#4ECDC4", // 青绿
  "#45B7D1", // 天蓝
  "#96CEB4", // 薄荷绿
  "#FFEAA7", // 淡金
];

const DEFAULT_BLESSING_TYPES: Array<"goldCoin" | "moneyBag" | "luckyBag" | "redPacket"> = [
  "goldCoin",
  "moneyBag",
  "luckyBag",
  "redPacket",
];

// ==================== 工具函数 ====================

/**
 * 在浏览器环境中获取文字填充点
 * 支持水平和垂直排列
 */
function getTextFillPoints(
  text: string,
  fontSize: number,
  fontFamily: string,
  fontWeight: number,
  spacing: number,
  orientation: "horizontal" | "vertical" = "horizontal"
): PathPoint[] {
  // 检查是否在浏览器环境中
  if (typeof document === "undefined") {
    return generateApproximatePoints(text, fontSize, spacing, orientation);
  }
  
  try {
    // 对于垂直排列，逐字获取填充点并垂直偏移
    if (orientation === "vertical") {
      const allPoints: PathPoint[] = [];
      const charHeight = fontSize;
      const totalHeight = text.length * charHeight;
      
      for (let i = 0; i < text.length; i++) {
        const charPoints = textToFillPoints(text[i], {
          fontSize,
          fontFamily,
          fontWeight,
          sampleDensity: spacing,
        });
        
        if (charPoints.length > 0) {
          const { points: normalized } = normalizePoints(charPoints);
          const offsetY = i * charHeight - totalHeight / 2 + charHeight / 2;
          
          for (const p of normalized) {
            allPoints.push({
              x: p.x,
              y: p.y + offsetY,
            });
          }
        }
      }
      
      return allPoints;
    }
    
    // 水平排列
    const points = textToFillPoints(text, {
      fontSize,
      fontFamily,
      fontWeight,
      sampleDensity: spacing,
    });
    
    if (points.length > 0) {
      const { points: normalized } = normalizePoints(points);
      return normalized;
    }
  } catch (e) {
    console.warn("textToFillPoints failed, using approximation:", e);
  }
  
  return generateApproximatePoints(text, fontSize, spacing, orientation);
}

/**
 * 生成近似的文字填充点（服务端/降级方案）
 * 支持水平和垂直排列
 */
function generateApproximatePoints(
  text: string, 
  fontSize: number, 
  spacing: number,
  orientation: "horizontal" | "vertical" = "horizontal"
): PathPoint[] {
  const points: PathPoint[] = [];
  const charWidth = fontSize * 0.8;
  const charHeight = fontSize;
  
  // 根据排列方向计算总尺寸
  const isVertical = orientation === "vertical";
  const totalWidth = isVertical ? charWidth : text.length * charWidth;
  const totalHeight = isVertical ? text.length * charHeight : charHeight;
  
  // 为每个字符生成近似填充点
  for (let i = 0; i < text.length; i++) {
    // 根据排列方向计算字符偏移
    const charOffsetX = isVertical 
      ? 0  // 垂直排列时 X 不偏移
      : i * charWidth - totalWidth / 2 + charWidth / 2;
    const charOffsetY = isVertical 
      ? i * charHeight - totalHeight / 2 + charHeight / 2  // 垂直排列时 Y 递增
      : 0;  // 水平排列时 Y 不偏移
    
    // 简化的字符形状：使用矩形区域内的随机分布
    const charPoints = generateCharApproximation(text[i], charWidth, charHeight, spacing);
    
    for (const p of charPoints) {
      points.push({
        x: p.x + charOffsetX,
        y: p.y + charOffsetY,
      });
    }
  }
  
  return points;
}

/**
 * 为单个字符生成近似填充点
 */
function generateCharApproximation(char: string, width: number, height: number, spacing: number): PathPoint[] {
  const points: PathPoint[] = [];
  
  // 根据字符类型调整填充区域
  let fillRatio = 0.7; // 默认填充比例
  
  // 中文汉字通常更方正
  if (/[\u4e00-\u9fa5]/.test(char)) {
    fillRatio = 0.85;
  } else if (/[a-zA-Z]/.test(char)) {
    fillRatio = 0.6;
  } else if (/[0-9]/.test(char)) {
    fillRatio = 0.65;
  }
  
  const actualWidth = width * fillRatio;
  const actualHeight = height * fillRatio;
  const offsetX = (width - actualWidth) / 2;
  const offsetY = (height - actualHeight) / 2;
  
  // 在字符区域内生成均匀分布的点
  const cols = Math.floor(actualWidth / spacing);
  const rows = Math.floor(actualHeight / spacing);
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // 添加一些随机偏移使分布更自然
      const jitterX = (Math.sin(row * 0.5 + col * 0.3) * spacing * 0.2);
      const jitterY = (Math.cos(row * 0.3 + col * 0.5) * spacing * 0.2);
      
      const x = offsetX + col * spacing + spacing / 2 + jitterX;
      const y = offsetY + row * spacing + spacing / 2 + jitterY - height / 2;
      
      // 使用简单的形状判断来模拟字符轮廓
      const relX = (col / cols - 0.5) * 2;
      const relY = (row / rows - 0.5) * 2;
      
      // 简单的椭圆形状遮罩
      if (relX * relX + relY * relY < 1.2) {
        points.push({ x, y });
      }
    }
  }
  
  return points;
}

// ==================== 动画计算函数 ====================

interface ElementAnimState {
  opacity: number;
  scale: number;
  x: number;
  y: number;
  rotation: number;
  glowOpacity: number;
}

/**
 * 计算单个元素的动画状态
 */
function calculateElementAnimation(
  index: number,
  totalPoints: number,
  frame: number,
  entranceDuration: number,
  fillDuration: number,
  fillType: string,
  stayAnimation: string,
  pulseSpeed: number,
  glowPulseSpeed: number,
  floatAmplitude: number,
  floatSpeed: number,
  baseX: number,
  baseY: number,
  seed: number
): ElementAnimState {
  // 计算入场延迟
  let delay = 0;
  
  switch (fillType) {
    case "sequential":
      delay = (index / totalPoints) * fillDuration;
      break;
    case "random":
      delay = random(`delay-${seed}-${index}`) * fillDuration * 0.8;
      break;
    case "radial":
      // 从中心向外扩散
      const distanceRatio = Math.sqrt(baseX * baseX + baseY * baseY) / 500;
      delay = distanceRatio * fillDuration;
      break;
    case "wave":
      // 波浪式填充
      delay = ((baseX + baseY) / 1000 + 1) * fillDuration * 0.5;
      break;
    default:
      delay = (index / totalPoints) * fillDuration;
  }
  
  const localFrame = frame - delay;
  const result: ElementAnimState = {
    opacity: 0,
    scale: 0,
    x: baseX,
    y: baseY,
    rotation: 0,
    glowOpacity: 0,
  };
  
  // 入场阶段
  if (localFrame < 0) {
    return result;
  }
  
  if (localFrame < entranceDuration) {
    const progress = localFrame / entranceDuration;
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    
    result.opacity = eased;
    result.scale = eased;
    result.glowOpacity = eased;
    
    // 入场动画效果
    if (fillType === "radial") {
      // 从中心飞入
      result.x = baseX * eased;
      result.y = baseY * eased;
    }
  } else {
    // 停留阶段
    result.opacity = 1;
    result.scale = 1;
    result.glowOpacity = 1;
    
    // 停留动画
    const stayFrame = localFrame - entranceDuration;
    
    switch (stayAnimation) {
      case "pulse":
        const pulsePhase = Math.sin(stayFrame * 0.1 * pulseSpeed);
        result.scale = 1 + pulsePhase * 0.05;
        result.glowOpacity = 0.8 + pulsePhase * 0.2;
        break;
        
      case "glow":
        const glowPhase = Math.sin(stayFrame * 0.08 * glowPulseSpeed);
        result.glowOpacity = 0.6 + glowPhase * 0.4;
        break;
        
      case "float":
        const floatPhaseX = Math.sin(stayFrame * 0.05 * floatSpeed + index * 0.1);
        const floatPhaseY = Math.cos(stayFrame * 0.07 * floatSpeed + index * 0.15);
        result.x = baseX + floatPhaseX * floatAmplitude;
        result.y = baseY + floatPhaseY * floatAmplitude;
        result.rotation = floatPhaseX * 3;
        break;
        
      case "none":
      default:
        break;
    }
  }
  
  return result;
}

// ==================== 主组件 ====================

export const TextVectorAnimation: React.FC<TextVectorAnimationProps> = ({
  text,
  // 混合输入
  contentType = "text",
  words = [],
  images = [],
  blessingTypes = [],
  imageWeight = 0.5,
  // 字体配置
  fontSize = 200,
  fontFamily = "Arial, sans-serif",
  fontWeight = 700,
  // 元素配置
  elementSize = 24,
  elementSizeRange,
  elementSpacing = 20,
  // 颜色配置
  textColor = "#FFD700",
  glowColor = "#FFD700",
  glowIntensity = 0.8,
  colors,
  // 样式配置
  textStyle,
  imageStyle,
  blessingStyle,
  // 文字排列配置
  textOrientation = "horizontal",
  // 多字动画配置
  charAnimationMode = "together",
  charInterval = 60,
  charStayDuration = 120,
  // 动画配置
  entranceDuration = 20,
  entranceType = "fade",
  fillDuration = 60,
  fillType = "sequential",
  stayAnimation = "pulse",
  pulseSpeed = 1,
  glowPulseSpeed = 1,
  floatAmplitude = 3,
  floatSpeed = 1,
  // 3D效果
  enable3D = true,
  rotation3D = 15,
  // 其他
  seed = 12345,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  // 容器引用
  const containerRef = useRef<HTMLDivElement>(null);
  const [pathPoints, setPathPoints] = useState<PathPoint[]>([]);
  
  // 有效颜色
  const effectiveColors = colors && colors.length > 0 ? colors : DEFAULT_COLORS;
  
  // 计算当前应该显示的字符索引（依次展示模式）
  const currentCharInfo = useMemo(() => {
    if (charAnimationMode === "together" || text.length <= 1) {
      return { charIndex: -1, char: text, showAll: true };
    }
    
    // 依次展示模式
    const cycleDuration = charInterval + charStayDuration;
    const totalDuration = text.length * charInterval + charStayDuration;
    
    // 计算当前应该显示第几个字
    let accumulatedTime = 0;
    for (let i = 0; i < text.length; i++) {
      const charStart = i * charInterval;
      const charEnd = charStart + charStayDuration;
      
      if (frame >= charStart && frame < charEnd) {
        return { charIndex: i, char: text[i], showAll: false };
      }
    }
    
    // 如果超出范围，显示最后一个字
    if (frame >= (text.length - 1) * charInterval) {
      return { charIndex: text.length - 1, char: text[text.length - 1], showAll: false };
    }
    
    return { charIndex: 0, char: text[0], showAll: false };
  }, [charAnimationMode, text, frame, charInterval, charStayDuration]);
  
  // 当前需要渲染的文字
  const currentText = charAnimationMode === "together" ? text : currentCharInfo.char;
  
  // 计算填充点
  useEffect(() => {
    const points = getTextFillPoints(currentText, fontSize, fontFamily, fontWeight, elementSpacing, textOrientation);
    setPathPoints(points);
  }, [currentText, fontSize, fontFamily, fontWeight, elementSpacing, textOrientation]);
  
  // 生成混合输入元素
  const elements = useMemo(() => {
    const available = detectAvailableContent({
      contentType,
      words,
      images,
      blessingTypes,
    });
    
    const result: Array<{
      item: MixedInputItem;
      x: number;
      y: number;
      color: string;
      charIndex: number;  // 所属字符索引
    }> = [];
    
    const counters = { text: 0, image: 0, blessing: 0 };
    const effectiveBlessingTypes = blessingTypes.length > 0 ? blessingTypes : DEFAULT_BLESSING_TYPES;
    
    // 计算每个字符的点数（用于分配 charIndex）
    const pointsPerChar = charAnimationMode === "together" 
      ? Math.ceil(pathPoints.length / text.length)
      : pathPoints.length;
    
    for (let i = 0; i < pathPoints.length; i++) {
      const point = pathPoints[i];
      const seedValue = seed + i * 1000;
      
      // 计算该点属于哪个字符（用于颜色分配）
      const charIndex = charAnimationMode === "together"
        ? Math.floor(i / pointsPerChar)
        : currentCharInfo.charIndex;
      
      // 确定内容类型和内容
      const { type, content } = determineContentType(
        { contentType, words, images, blessingTypes: effectiveBlessingTypes, imageWeight },
        available,
        seedValue
      );
      
      // 获取轮询内容
      const { content: actualContent } = getNextContent(type, {
        words,
        images,
        blessingTypes: effectiveBlessingTypes,
      }, counters[type]);
      counters[type]++;
      
      // 计算元素大小
      const sizeRange = elementSizeRange || [elementSize * 0.7, elementSize * 1.3];
      const size = sizeRange[0] + random(`size-${seedValue}`) * (sizeRange[1] - sizeRange[0]);
      
      // 选择颜色（基于字符索引）
      const colorIndex = charIndex % effectiveColors.length;
      const color = effectiveColors[colorIndex];
      
      // 创建元素项
      const item: MixedInputItem = {
        type,
        id: i,
        content: actualContent,
        x: point.x,
        y: point.y,
        width: size,
        height: size,
        opacity: 1,
        rotation: random(`rotation-${seedValue}`) * 30 - 15,
        scale: 1,
        fontSize: size,
        swingPhase: random(`swing-${seedValue}`) * Math.PI * 2,
        spinDirection: random(`spin-${seedValue}`) > 0.5 ? 1 : -1,
      };
      
      // 祝福图案样式
      if (type === "blessing") {
        item.blessingStyle = {
          primaryColor: color,
          secondaryColor: effectiveColors[(colorIndex + 1) % effectiveColors.length],
          enable3D: true,
          enableGlow: true,
          glowIntensity: glowIntensity,
          ...blessingStyle,
        };
      }
      
      result.push({
        item,
        x: point.x,
        y: point.y,
        color,
        charIndex,
      });
    }
    
    return result;
  }, [
    pathPoints,
    contentType,
    words,
    images,
    blessingTypes,
    imageWeight,
    seed,
    elementSize,
    elementSizeRange,
    effectiveColors,
    glowIntensity,
    blessingStyle,
    charAnimationMode,
    text,
    currentCharInfo.charIndex,
  ]);
  
  // 中心点
  const centerX = width / 2;
  const centerY = height / 2;
  
  // 3D 旋转样式
  const container3DStyle: React.CSSProperties = enable3D ? {
    perspective: "1000px",
    transformStyle: "preserve-3d",
  } : {};
  
  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        ...container3DStyle,
      }}
    >
      {/* 渲染所有元素 */}
      {elements.map(({ item, x, y, color }, index) => {
        // 计算动画状态
        const animState = calculateElementAnimation(
          index,
          elements.length,
          frame,
          entranceDuration,
          fillDuration,
          fillType,
          stayAnimation,
          pulseSpeed,
          glowPulseSpeed,
          floatAmplitude,
          floatSpeed,
          x,
          y,
          seed
        );
        
        // 如果不可见，跳过渲染
        if (animState.opacity <= 0) {
          return null;
        }
        
        // 3D 变换
        let transform3D = "";
        if (enable3D) {
          const depth = (y / 200) * rotation3D;
          transform3D = `rotateX(${depth}deg) `;
        }
        
        // 元素样式
        const style: React.CSSProperties = {
          position: "absolute",
          left: centerX + animState.x,
          top: centerY + animState.y,
          transform: `${transform3D}translate(-50%, -50%) scale(${animState.scale}) rotate(${item.rotation}deg)`,
          opacity: animState.opacity,
          filter: `drop-shadow(0 0 ${item.width! * 0.3 * glowIntensity * animState.glowOpacity}px ${glowColor})`,
          pointerEvents: "none",
        };
        
        // 根据类型渲染不同内容
        if (item.type === "text") {
          const mergedTextStyle: MixedTextStyleConfig = {
            color,
            effect: "glow",
            effectIntensity: glowIntensity,
            fontWeight: 700,
            ...textStyle,
          };
          
          return (
            <div
              key={item.id}
              style={{
                ...style,
                fontSize: item.fontSize,
                fontFamily,
                fontWeight: mergedTextStyle.fontWeight,
                color: mergedTextStyle.color,
                textShadow: `0 0 ${item.fontSize! * 0.2}px ${glowColor}`,
                whiteSpace: "nowrap",
              }}
            >
              {item.content}
            </div>
          );
        } else if (item.type === "image") {
          const imgSrc = item.content.startsWith("http") || item.content.startsWith("data:")
            ? item.content
            : item.content;
          
          return (
            <img
              key={item.id}
              src={imgSrc}
              style={{
                ...style,
                width: item.width,
                height: item.height,
                objectFit: "contain",
              }}
              alt=""
            />
          );
        } else {
          // blessing 类型
          return (
            <div
              key={item.id}
              style={{
                ...style,
                width: item.width,
                height: item.height,
              }}
            >
              {/* 祝福图案使用简单的 SVG 表示 */}
              <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill={item.blessingStyle?.primaryColor || color}
                  stroke={item.blessingStyle?.secondaryColor || "#FFA500"}
                  strokeWidth="3"
                />
                <text
                  x="50"
                  y="55"
                  textAnchor="middle"
                  fontSize="24"
                  fill="#FFF"
                  fontWeight="bold"
                >
                  {item.content === "goldCoin" ? "¥" : item.content === "moneyBag" ? "袋" : item.content === "luckyBag" ? "福" : "包"}
                </text>
              </svg>
            </div>
          );
        }
      })}
    </div>
  );
};

export default TextVectorAnimation;
