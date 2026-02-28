/**
 * 文字样式工具函数
 */

import React from "react";

/**
 * 文字样式配置
 */
export interface TextStyleConfig {
  color?: string;
  effect?: "none" | "shadow" | "gold3d" | "emboss" | "neon" | "metallic" | "retro" | "glow" | "outline";
  effectIntensity?: number;
  fontWeight?: number;
  fontFamily?: string;
  letterSpacing?: number;
  gradient?: {
    colors: string[];
    angle?: number;
  };
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffset?: [number, number];
  strokeColor?: string;
  strokeWidth?: number;
}

/**
 * 生成渐变 CSS
 */
const generateGradientCSS = (gradient: { colors: string[]; angle?: number }): string => {
  const angle = gradient.angle ?? 180;
  return `linear-gradient(${angle}deg, ${gradient.colors.join(", ")})`;
};

/**
 * 文字特效预设
 */
const EFFECT_PRESETS: Record<string, (fontSize: number, intensity: number) => React.CSSProperties> = {
  none: () => ({}),
  shadow: (fontSize, intensity) => ({
    textShadow: `2px 2px ${fontSize * 0.1}px rgba(0,0,0,${0.5 * intensity})`,
  }),
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

/**
 * 生成文字样式
 * @param fontSize 字体大小
 * @param style 样式配置
 * @returns CSS 样式对象
 */
export const generateTextStyle = (fontSize: number, style: TextStyleConfig): React.CSSProperties => {
  const intensity = style.effectIntensity ?? 0.8;
  const effect = style.effect ?? "gold3d";
  
  const baseStyle: React.CSSProperties = {
    fontSize: fontSize,
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
