import React from "react";
import { AbsoluteFill } from "remotion";

/**
 * 中心光晕组件 Props
 */
export interface CenterGlowProps {
  /** 光晕颜色 */
  color?: string;
  /** 光晕强度 (0-2) */
  intensity?: number;
}

/**
 * 中心光晕组件
 * 在画面中心添加径向渐变光晕效果
 * 
 * @example
 * // 默认金色光晕
 * <CenterGlow intensity={0.8} />
 * 
 * // 自定义颜色
 * <CenterGlow color="#ff6600" intensity={1.2} />
 */
export const CenterGlow: React.FC<CenterGlowProps> = ({
  color = "#ffd700",
  intensity = 0.8,
}) => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at center, ${color}${Math.round(intensity * 0.3 * 255).toString(16).padStart(2, '0')} 0%, ${color}${Math.round(intensity * 0.1 * 255).toString(16).padStart(2, '0')} 30%, transparent 70%)`,
        pointerEvents: "none",
      }}
    />
  );
};

export default CenterGlow;
