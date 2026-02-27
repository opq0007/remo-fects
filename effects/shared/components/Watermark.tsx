import React, { useMemo } from "react";
import { useVideoConfig, useCurrentFrame } from "remotion";

/**
 * 水印动态效果类型（仅保留 bounce）
 */
export type WatermarkEffectType = "bounce";

/**
 * 水印组件 Props
 */
export interface WatermarkProps {
  /** 水印文字 */
  text: string;
  /** 字体大小 */
  fontSize?: number;
  /** 字体颜色 */
  color?: string;
  /** 透明度 */
  opacity?: number;
  /** 动态效果类型 */
  effect?: WatermarkEffectType;
  /** 动画速度系数（0.1-5） */
  speed?: number;
  /** 效果强度（0-1） */
  intensity?: number;
  /** X 方向速度（像素/秒） */
  velocityX?: number;
  /** Y 方向速度（像素/秒） */
  velocityY?: number;
  /** 是否启用 */
  enabled?: boolean;
  /** z-index 层级 */
  zIndex?: number;
}

/**
 * 动态文字水印组件
 * 
 * 使用碰撞反弹效果，水印在屏幕内快速弹跳移动，用于视频防盗保护
 */
export const Watermark: React.FC<WatermarkProps> = ({
  text,
  fontSize = 24,
  color = "#ffffff",
  opacity = 0.3,
  effect = "bounce",
  speed = 1,
  intensity = 0.5,
  velocityX = 180,
  velocityY = 120,
  enabled = true,
  zIndex = 1000,
}) => {
  const { width, height, fps } = useVideoConfig();
  const frame = useCurrentFrame();

  // 如果禁用或无文字，不渲染
  if (!enabled || !text) return null;

  // 计算动态效果
  const animatedStyle = useMemo(() => {
    const time = frame / fps;  // 时间（秒）
    
    // 碰撞反弹效果 - 快速移动并反弹
    const textWidth = text.length * fontSize * 0.6;
    const margin = 10;
    
    // 计算可移动范围
    const minX = margin;
    const maxX = width - textWidth - margin;
    const minY = margin;
    const maxY = height - fontSize - margin;
    
    // 使用帧数直接计算位置，确保每帧都有明显移动
    const moveX = velocityX * time * speed;
    const moveY = velocityY * time * speed;
    
    // 计算在有效范围内的反弹位置
    const rangeX = Math.max(1, maxX - minX);
    const rangeY = Math.max(1, maxY - minY);
    
    // 使用三角形波实现反弹
    const progressX = (moveX % (2 * rangeX));
    const progressY = (moveY % (2 * rangeY));
    
    let finalX = minX + (progressX > rangeX ? 2 * rangeX - progressX : progressX);
    let finalY = minY + (progressY > rangeY ? 2 * rangeY - progressY : progressY);
    
    // 确保在有效范围内
    finalX = Math.max(minX, Math.min(maxX, finalX));
    finalY = Math.max(minY, Math.min(maxY, finalY));

    return {
      transform: `translate(${finalX - width/2}px, ${finalY - height/2}px)`,
      opacity: opacity,
    };
  }, [
    frame, fps, width, height, fontSize, text, speed, 
    opacity, velocityX, velocityY
  ]);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        pointerEvents: "none",
        zIndex,
        fontSize,
        color,
        fontWeight: 400,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...animatedStyle,
      }}
    >
      {text}
    </div>
  );
};

export default Watermark;
