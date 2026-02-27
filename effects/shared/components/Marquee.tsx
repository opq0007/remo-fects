import React, { useMemo } from "react";
import {
  useVideoConfig,
  useCurrentFrame,
  staticFile,
  Img,
} from "remotion";

/**
 * 文字样式配置
 */
export interface MarqueeTextStyle {
  color?: string;
  fontFamily?: string;
  fontWeight?: number | string;
  letterSpacing?: number;
  effect?: "none" | "shadow" | "glow" | "outline" | "3d" | "gold3d" | "neon";
  effectIntensity?: number;
  glowColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface MarqueeTextItem {
  text: string;
  style?: MarqueeTextStyle;
}

export interface MarqueeImageItem {
  src: string;
  width?: number;
  height?: number;
  opacity?: number;
}

export interface MarqueeLayerConfig {
  texts?: MarqueeTextItem[];
  images?: MarqueeImageItem[];
  fontSize?: number;
  opacity?: number;
  spacing?: number;
  textStyle?: MarqueeTextStyle;
  name?: string;
}

/**
 * 文字排列方向（文字如何排列）
 * - horizontal: 文字水平排列成一行
 * - vertical: 文字垂直排列成一列
 */
export type MarqueeOrientation = "horizontal" | "vertical";

/**
 * 运动方向（整体往哪个方向移动）
 * - left-to-right: 水平向右移动
 * - right-to-left: 水平向左移动
 * - top-to-bottom: 垂直向下移动
 * - bottom-to-top: 垂直向上移动
 */
export type MarqueeDirection = 
  | "left-to-right" 
  | "right-to-left" 
  | "top-to-bottom" 
  | "bottom-to-top";

export interface MarqueeProps {
  enabled?: boolean;
  foreground?: MarqueeLayerConfig;
  background?: MarqueeLayerConfig;
  /** 文字排列方向：horizontal（水平一行）或 vertical（垂直一列） */
  orientation?: MarqueeOrientation;
  /** 运动方向：文字整体移动的方向 */
  direction?: MarqueeDirection;
  speed?: number;
  perspectiveDepth?: number;
  foregroundOffsetY?: number;
  backgroundOffsetY?: number;
  foregroundOffsetX?: number;
  backgroundOffsetX?: number;
  loop?: boolean;
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  zIndex?: number;
  debugBorders?: boolean;
}

/**
 * 应用文字特效样式
 */
const applyTextEffect = (
  style: MarqueeTextStyle,
  fontSize: number
): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    color: style.color || "#ffffff",
    fontFamily: style.fontFamily || "PingFang SC, Microsoft YaHei, SimHei, sans-serif",
    fontWeight: style.fontWeight || 700,
    letterSpacing: style.letterSpacing || 0,
    fontSize,
    whiteSpace: "nowrap",
  };

  const intensity = style.effectIntensity || 0.8;
  const glowColor = style.glowColor || style.color || "#ffffff";

  switch (style.effect) {
    case "shadow":
      return {
        ...baseStyle,
        textShadow: `2px 2px 4px rgba(0,0,0,${intensity * 0.5}), 4px 4px 8px rgba(0,0,0,${intensity * 0.3})`,
      };
    case "glow":
      return {
        ...baseStyle,
        textShadow: `0 0 ${10 * intensity}px ${glowColor}, 0 0 ${20 * intensity}px ${glowColor}`,
      };
    case "outline":
      return {
        ...baseStyle,
        WebkitTextStroke: `${style.strokeWidth || 1}px ${style.strokeColor || "#000"}`,
      };
    case "3d":
      const shadow3d = [];
      for (let i = 1; i <= 5; i++) {
        shadow3d.push(`${i}px ${i}px 0 rgba(0,0,0,${intensity * 0.3})`);
      }
      return { ...baseStyle, textShadow: shadow3d.join(", ") };
    case "gold3d":
      return {
        ...baseStyle,
        background: `linear-gradient(180deg, #ffd700 0%, #ffaa00 50%, #ff8c00 100%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        filter: `drop-shadow(0 0 ${5 * intensity}px rgba(255,215,0,0.5))`,
      };
    case "neon":
      return {
        ...baseStyle,
        textShadow: `0 0 5px ${glowColor}, 0 0 10px ${glowColor}, 0 0 20px ${glowColor}`,
      };
    default:
      return baseStyle;
  }
};

/**
 * 计算文字宽度
 */
const calculateTextWidth = (text: string, fontSize: number): number => {
  return text.split("").reduce((acc, char) => {
    return acc + (/[\u4e00-\u9fa5]/.test(char) ? fontSize : fontSize * 0.6);
  }, 0);
};

/**
 * 判断运动方向是否为垂直方向
 */
const isVerticalMovement = (direction: MarqueeDirection): boolean => {
  return direction === "top-to-bottom" || direction === "bottom-to-top";
};

/**
 * 判断运动方向是否为反向
 */
const isReverseMovement = (direction: MarqueeDirection): boolean => {
  return direction === "right-to-left" || direction === "bottom-to-top";
};

/**
 * 走马灯组件
 */
export const Marquee: React.FC<MarqueeProps> = ({
  enabled = true,
  foreground,
  background,
  orientation = "horizontal",
  direction = "right-to-left",
  speed = 100,
  foregroundOffsetY = 0,
  backgroundOffsetY = 0,
  foregroundOffsetX = 0,
  backgroundOffsetX = 0,
  zIndex = 100,
  debugBorders = false,
}) => {
  const { width, height, fps } = useVideoConfig();
  const frame = useCurrentFrame();

  if (!enabled || (!foreground?.texts && !foreground?.images && !background?.texts && !background?.images)) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        pointerEvents: "none",
        zIndex,
        overflow: "hidden",
        border: debugBorders ? "2px solid red" : undefined,
      }}
    >
      {/* 后景层（远景） */}
      {background && (
        <MarqueeLayer
          layer={background}
          orientation={orientation}
          direction={direction}
          speed={speed * 0.9}
          frame={frame}
          fps={fps}
          width={width}
          height={height}
          offsetX={backgroundOffsetX}
          offsetY={backgroundOffsetY}
        />
      )}

      {/* 前景层（近景） */}
      {foreground && (
        <MarqueeLayer
          layer={foreground}
          orientation={orientation}
          direction={direction}
          speed={speed}
          frame={frame}
          fps={fps}
          width={width}
          height={height}
          offsetX={foregroundOffsetX}
          offsetY={foregroundOffsetY}
        />
      )}
    </div>
  );
};

/**
 * 走马灯单层渲染组件
 */
const MarqueeLayer: React.FC<{
  layer: MarqueeLayerConfig;
  orientation: MarqueeOrientation;
  direction: MarqueeDirection;
  speed: number;
  frame: number;
  fps: number;
  width: number;
  height: number;
  offsetX?: number;
  offsetY?: number;
}> = ({
  layer,
  orientation,
  direction,
  speed,
  frame,
  fps,
  width,
  height,
  offsetX = 0,
  offsetY = 0,
}) => {
  const fontSize = layer.fontSize || 24;
  const spacing = layer.spacing || 60;
  const opacity = layer.opacity ?? 1;
  const textStyle = layer.textStyle || {};

  // 文字排列方向
  const isHorizontalOrientation = orientation === "horizontal";
  
  // 运动方向
  const isVerticalMove = isVerticalMovement(direction);
  const isReverse = isReverseMovement(direction);

  // 计算内容尺寸（根据排列方向）
  const contentSize = useMemo(() => {
    let size = 0;
    
    if (layer.texts) {
      if (isHorizontalOrientation) {
        // 水平排列：计算总宽度
        layer.texts.forEach((item) => {
          size += calculateTextWidth(item.text, fontSize) + spacing;
        });
      } else {
        // 垂直排列：计算总高度
        size = layer.texts.length * fontSize + (layer.texts.length - 1) * spacing;
      }
    }
    
    if (layer.images) {
      layer.images.forEach((item) => {
        if (isHorizontalOrientation) {
          size += (item.width || fontSize * 1.5) + spacing;
        } else {
          size += (item.height || fontSize * 1.5) + spacing;
        }
      });
    }
    
    return size;
  }, [layer.texts, layer.images, fontSize, spacing, isHorizontalOrientation]);

  // 计算动画偏移（根据运动方向）
  const time = frame / fps;
  const viewportSize = isVerticalMove ? height : width;
  const totalDistance = contentSize + viewportSize;
  let offset = (time * speed) % totalDistance;
  
  if (isReverse) {
    offset = totalDistance - offset;
  }

  // 渲染内容（根据排列方向）
  const renderContent = (startOffset: number): React.ReactNode[] => {
    const items: React.ReactNode[] = [];
    let currentPos = startOffset;

    // 渲染文字
    if (layer.texts) {
      layer.texts.forEach((item, index) => {
        const mergedStyle = { ...textStyle, ...item.style };
        const style = applyTextEffect(mergedStyle, fontSize);
        
        // 基础位置（屏幕中心）
        const baseX = width / 2 + offsetX;
        const baseY = height / 2 + offsetY;
        
        // 根据排列方向决定文字位置
        const itemStyle: React.CSSProperties = {
          ...style,
          position: "absolute",
          opacity,
        };

        if (isHorizontalOrientation) {
          // 水平排列：文字沿 X 轴排列，Y 固定
          const textWidth = calculateTextWidth(item.text, fontSize);
          itemStyle.left = currentPos;
          itemStyle.top = baseY;
          itemStyle.transform = "translateY(-50%)";
          currentPos += textWidth + spacing;
        } else {
          // 垂直排列：文字沿 Y 轴排列，X 固定
          itemStyle.left = baseX;
          itemStyle.top = currentPos;
          itemStyle.transform = "translateX(-50%)";
          currentPos += fontSize + spacing;
        }

        items.push(
          <span key={`text-${index}-${startOffset}`} style={itemStyle}>
            {item.text}
          </span>
        );
      });
    }

    // 渲染图片
    if (layer.images) {
      layer.images.forEach((item, index) => {
        const imgWidth = item.width || fontSize * 1.5;
        const imgHeight = item.height || fontSize * 1.5;
        
        const baseX = width / 2 + offsetX;
        const baseY = height / 2 + offsetY;
        
        const imgStyle: React.CSSProperties = {
          position: "absolute",
          width: imgWidth,
          height: imgHeight,
          objectFit: "contain",
          opacity: item.opacity ?? opacity,
        };

        if (isHorizontalOrientation) {
          imgStyle.left = currentPos;
          imgStyle.top = baseY;
          imgStyle.transform = "translateY(-50%)";
          currentPos += imgWidth + spacing;
        } else {
          imgStyle.left = baseX;
          imgStyle.top = currentPos;
          imgStyle.transform = "translateX(-50%)";
          currentPos += imgHeight + spacing;
        }

        items.push(
          <Img key={`img-${index}-${startOffset}`} src={staticFile(item.src)} style={imgStyle} />
        );
      });
    }

    return items;
  };

  // 容器样式（根据运动方向）
  const containerStyle: React.CSSProperties = {
    position: "absolute",
  };

  if (isVerticalMove) {
    // 垂直运动：top 偏移
    containerStyle.left = 0;
    containerStyle.top = -offset;
    containerStyle.width = width;
    containerStyle.height = totalDistance * 2;
  } else {
    // 水平运动：left 偏移
    containerStyle.left = -offset;
    containerStyle.top = 0;
    containerStyle.width = totalDistance * 2;
    containerStyle.height = height;
  }

  return (
    <div style={containerStyle}>
      {/* 第一组内容 */}
      {renderContent(0)}
      {/* 第二组内容（用于无缝循环） */}
      {renderContent(contentSize + spacing)}
    </div>
  );
};

export default Marquee;