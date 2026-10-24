/**
 * 文字样式工具函数
 *
 * 设计原则：金是材质，不是灯泡。
 * - 立体感来自 2-4 层深色挤出，而不是多层同心发光
 * - 发光最多两层（内紧外松），让文字本体可读
 * - 大号文字用更少的发光层数（视觉体积已足够）
 */

import React from "react";
import { GOLD_SCALE } from "./colors";

/**
 * 全项目统一字体栈（中文祝福场景优先）
 */
export const FONT_FAMILY =
  "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Source Han Sans SC', sans-serif";

/**
 * 文字样式配置
 */
export interface TextStyleConfig {
  color?: string;
  effect?: "none" | "shadow" | "gold3d" | "emboss" | "neon" | "metallic" | "retro" | "glow" | "outline" | "hero";
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
 * 立体挤出层：层数随字号收敛（大字少层，投影更实）
 */
const extrusionLayers = (fontSize: number, intensity: number): string[] => {
  const depth = Math.max(2, Math.min(4, Math.floor(fontSize * 0.06 * intensity)));
  const layers: string[] = [];
  for (let i = 1; i <= depth; i++) {
    // 透明度陡降：第一层实、后面快速虚化
    const alpha = Math.max(0.12, 0.42 - i * 0.08);
    layers.push(`${i}px ${i}px 0 rgba(64, 42, 8, ${alpha})`);
  }
  return layers;
};

/**
 * 文字特效预设
 */
const EFFECT_PRESETS: Record<string, (fontSize: number, intensity: number) => React.CSSProperties> = {
  none: () => ({}),
  shadow: (fontSize, intensity) => ({
    textShadow: `2px 3px ${fontSize * 0.08}px rgba(0,0,0,${0.45 * intensity})`,
  }),
  /**
   * 鎏金立体：深色挤出 + 单层柔光
   * 替代旧版 10+ 层阴影，保留立体签名但不再糊成一团
   */
  gold3d: (fontSize, intensity) => {
    const layers = extrusionLayers(fontSize, intensity);
    // 内紧：紧贴字形的高光
    layers.push(`-${fontSize * 0.015}px -${fontSize * 0.015}px ${fontSize * 0.06}px rgba(255, 243, 196, ${0.45 * intensity})`);
    // 外松：一层克制的金色晕
    layers.push(`0 0 ${fontSize * 0.12}px rgba(255, 201, 74, ${0.28 * intensity})`);
    return { textShadow: layers.join(", ") };
  },
  emboss: (fontSize, intensity) => ({
    textShadow: `-${fontSize * 0.03}px -${fontSize * 0.03}px 0 rgba(255,255,255,${0.7 * intensity}), ${fontSize * 0.03}px ${fontSize * 0.03}px 0 rgba(0,0,0,${0.5 * intensity}), 0 0 ${fontSize * 0.1}px rgba(0,0,0,${0.2 * intensity})`,
  }),
  neon: (fontSize, intensity) => ({
    textShadow: `0 0 ${fontSize * 0.08 * intensity}px currentColor, 0 0 ${fontSize * 0.22 * intensity}px currentColor`,
  }),
  metallic: (fontSize, intensity) => ({
    textShadow: `0 ${fontSize * 0.02}px ${fontSize * 0.05}px rgba(0,0,0,${0.8 * intensity}), 0 ${fontSize * 0.05}px ${fontSize * 0.1}px rgba(0,0,0,${0.5 * intensity})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  }),
  retro: (fontSize, intensity) => ({
    textShadow: `${fontSize * 0.04}px ${fontSize * 0.04}px 0 rgba(0,0,0,${0.8 * intensity}), ${fontSize * 0.08}px ${fontSize * 0.08}px 0 rgba(0,0,0,${0.4 * intensity}), 0 0 ${fontSize * 0.05}px rgba(139,69,19,${0.3 * intensity})`,
  }),
  /**
   * 柔光：两层（白色内核 + 主题色外晕）
   */
  glow: (fontSize, intensity) => ({
    textShadow: `0 0 ${fontSize * 0.07 * intensity}px rgba(255,255,255,${0.65 * intensity}), 0 0 ${fontSize * 0.2 * intensity}px currentColor`,
  }),
  outline: (fontSize, intensity) => ({
    WebkitTextStroke: `${fontSize * 0.02 * intensity}px rgba(0,0,0,${0.8 * intensity})`,
    textShadow: `0 0 ${fontSize * 0.05 * intensity}px rgba(0,0,0,${0.3 * intensity})`,
  }),
  /**
   * 主角字：鎏金渐变 + 电影双影（深投影 + 极弱环境光）
   * 用于每个特效的主祝福语
   */
  hero: (fontSize, intensity) => ({
    background: `linear-gradient(180deg, ${GOLD_SCALE.pale} 0%, ${GOLD_SCALE.bright} 45%, ${GOLD_SCALE.mid} 78%, ${GOLD_SCALE.deep} 100%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: `0 ${Math.max(2, fontSize * 0.035)}px ${Math.max(3, fontSize * 0.06)}px rgba(30, 18, 2, ${0.55 * intensity}), 0 0 ${fontSize * 0.1}px rgba(255, 201, 74, ${0.18 * intensity})`,
  }),
};

/**
 * 文字特效预设（导出供各特效按需扩展，如 text-rain 的 "3d"）
 */
export const TEXT_EFFECT_PRESETS = EFFECT_PRESETS;

/**
 * 生成文字样式
 * @param fontSize 字体大小
 * @param style 样式配置
 * @returns CSS 样式对象
 */
export const generateTextStyle = (fontSize: number, style: TextStyleConfig): React.CSSProperties => {
  const intensity = style.effectIntensity ?? 0.6;
  const effect = style.effect ?? "gold3d";

  const baseStyle: React.CSSProperties = {
    fontSize: fontSize,
    fontFamily: style.fontFamily ?? FONT_FAMILY,
    fontWeight: style.fontWeight ?? 700,
    letterSpacing: style.letterSpacing ?? 2,
  };

  if (style.gradient) {
    baseStyle.background = generateGradientCSS(style.gradient);
    baseStyle.WebkitBackgroundClip = "text";
    baseStyle.WebkitTextFillColor = "transparent";
  } else {
    baseStyle.color = style.color ?? GOLD_SCALE.bright;
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
