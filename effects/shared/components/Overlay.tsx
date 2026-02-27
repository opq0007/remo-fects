import React from "react";
import { AbsoluteFill } from "remotion";
import { OverlayComponentProps } from "../schemas";

/**
 * 遮罩组件
 * 在背景上添加半透明遮罩层，用于调节画面亮度和氛围
 * 
 * @example
 * // 默认黑色遮罩，30% 透明度
 * <Overlay />
 * 
 * // 自定义颜色和透明度
 * <Overlay color="#1a0a00" opacity={0.4} />
 */
export const Overlay: React.FC<OverlayComponentProps> = ({
  color = "#000000",
  opacity = 0.3,
}) => {
  // 透明度为 0 时不渲染
  if (opacity <= 0) {
    return null;
  }
  
  return <AbsoluteFill style={{ backgroundColor: color, opacity }} />;
};

export default Overlay;
