/**
 * 颜色工具函数
 */

import { 
  PRIMARY_COLORS, 
  ZODIAC_CHARACTERS, 
  PET_CHARACTERS, 
  HERO_CHARACTERS 
} from "../types";
import { ZodiacType, PetType, HeroType, CharacterConfig } from "../types";

/**
 * 统一金阶（全项目唯一的金色梯度）
 * 金是材质不是灯泡：主文案用亮金，投影用深金，高光用淡金
 */
export const GOLD_SCALE = {
  deep: '#8B6914',   // 深金：立体挤出/投影
  mid: '#D4A017',    // 中金：次级元素
  bright: '#FFD76A', // 亮金：主文案
  pale: '#FFF3C4',   // 淡金：高光/描边
} as const;

/**
 * 深色底色阶（带色相的近黑，杜绝纯黑）
 */
export const DEEP_BACKGROUNDS = {
  neutral: '#0C0E16', // 中性蓝黑
  warm: '#161009',    // 暖棕黑
  blue: '#0A1224',    // 深蓝黑
  ink: '#101014',     // 墨黑
} as const;

/**
 * 特效身份色板
 * 统一金色基调下，每个特效用一个冷色/辅色制造区分
 */
export interface EffectPalette {
  /** 主色（文字/主体） */
  primary: string;
  /** 辅色（冷色呼吸，能量环/次级粒子） */
  accent: string;
  /** 推荐深底色 */
  background: string;
  /** 发光色 */
  glow: string;
}

export const EFFECT_PALETTES: Record<string, EffectPalette> = {
  'text-rain':        { primary: GOLD_SCALE.bright, accent: '#7EC8FF', background: DEEP_BACKGROUNDS.neutral, glow: '#FFC94A' },
  'text-ring':        { primary: GOLD_SCALE.bright, accent: '#B892FF', background: DEEP_BACKGROUNDS.blue, glow: '#FFC94A' },
  'text-firework':    { primary: GOLD_SCALE.bright, accent: '#FF9E5E', background: DEEP_BACKGROUNDS.blue, glow: '#FFB347' },
  'text-breakthrough':{ primary: GOLD_SCALE.bright, accent: '#7EC8FF', background: DEEP_BACKGROUNDS.warm, glow: '#FFC94A' },
  'tai-chi-bagua':    { primary: GOLD_SCALE.mid,   accent: '#2C3A6B', background: '#F5EFDF',            glow: '#D4A017' },
  'text-tornado':     { primary: '#FFC87A',         accent: '#8FA3C8', background: DEEP_BACKGROUNDS.warm, glow: '#FF9E3D' },
  'text-flood':       { primary: '#5BC9E8',         accent: '#FFD76A', background: '#07182E',            glow: '#7DD8F2' },
  'text-vortex':      { primary: GOLD_SCALE.bright, accent: '#B892FF', background: '#120E1E',            glow: '#FFC94A' },
  'text-kaleidoscope':{ primary: GOLD_SCALE.bright, accent: '#FF8FA3', background: DEEP_BACKGROUNDS.neutral, glow: '#FFC94A' },
  'text-windmill':    { primary: GOLD_SCALE.bright, accent: '#7EC8FF', background: '#0E1626',            glow: '#FFC94A' },
  'text-vector':      { primary: GOLD_SCALE.bright, accent: '#7EC8FF', background: DEEP_BACKGROUNDS.neutral, glow: '#FFC94A' },
  'text-crystal-ball':{ primary: '#EAF2FF',         accent: GOLD_SCALE.bright, background: '#0A1428',    glow: '#9CD1F5' },
};

/**
 * 获取特效身份色板（未知 id 返回通用金板）
 */
export function getEffectPalette(effectId: string): EffectPalette {
  return EFFECT_PALETTES[effectId] ?? EFFECT_PALETTES['text-rain'];
}

/**
 * 颜色明度调整（amount > 0 变亮，< 0 变暗）
 */
export function shadeColor(hexColor: string, amount: number): string {
  const channel = (start: number) => {
    const v = parseInt(hexColor.slice(start, start + 2), 16);
    const adjusted = amount >= 0
      ? v + (255 - v) * amount
      : v * (1 + amount);
    return Math.round(Math.min(255, Math.max(0, adjusted)));
  };
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(channel(1))}${toHex(channel(3))}${toHex(channel(5))}`;
}

/**
 * 生成背景氛围 CSS：中心微亮 + 边缘暗角
 * 替代平涂纯色，一个函数给所有特效提供空气感
 */
export function generateAtmosphere(backgroundColor: string): string {
  const center = shadeColor(backgroundColor, 0.10);
  const edge = shadeColor(backgroundColor, -0.45);
  return [
    `radial-gradient(ellipse 90% 70% at 50% 42%, ${center} 0%, ${backgroundColor} 55%, ${edge} 100%)`,
  ].join(', ');
}

/**
 * 颜色透明度调整
 */
export function colorWithOpacity(hexColor: string, opacity: number): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * 生成发光阴影效果（两层：内紧外松，避免光斑糊死）
 */
export function generateGlow(color: string, intensity: number = 1): string {
  const inner = Math.round(6 * intensity);
  const outer = Math.round(18 * intensity);
  return `0 0 ${inner}px ${colorWithOpacity(color, 0.55)}, 0 0 ${outer}px ${colorWithOpacity(color, 0.3)}`;
}

/**
 * 生成文字描边效果
 */
export function generateTextStroke(width: number, color: string = '#FFFFFF'): string {
  return `
    -${width}px -${width}px 0 ${color},
    ${width}px -${width}px 0 ${color},
    -${width}px ${width}px 0 ${color},
    ${width}px ${width}px 0 ${color}
  `.trim();
}

/**
 * 生成3D立体文字阴影
 */
export function generate3DTextShadow(color: string, depth: number = 4): string {
  let shadow = '';
  for (let i = 1; i <= depth; i++) {
    shadow += `0 ${i}px 0 ${color}`;
    if (i < depth) shadow += ', ';
  }
  // 添加模糊阴影
  shadow += `, 0 ${depth + 2}px ${depth}px rgba(0,0,0,0.2)`;
  return shadow;
}

/**
 * 获取角色配置
 */
export function getCharacterConfig(series: 'zodiac' | 'pet' | 'hero', type: ZodiacType | PetType | HeroType): CharacterConfig {
  switch (series) {
    case 'zodiac':
      return ZODIAC_CHARACTERS[type as ZodiacType];
    case 'pet':
      return PET_CHARACTERS[type as PetType];
    case 'hero':
      return HERO_CHARACTERS[type as HeroType];
    default:
      return ZODIAC_CHARACTERS.tiger;
  }
}

/**
 * 计算对比色（用于描边等）
 */
export function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
}

/**
 * 混合两种颜色
 */
export function blendColors(color1: string, color2: string, ratio: number = 0.5): string {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);
  
  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * 生成随机颜色
 */
export function randomColor(seed?: number): string {
  const colors = [
    PRIMARY_COLORS.strawberryPink, 
    PRIMARY_COLORS.skyBlue, 
    PRIMARY_COLORS.creamYellow, 
    PRIMARY_COLORS.mintGreen, 
    PRIMARY_COLORS.violet
  ];
  const index = seed !== undefined ? seed % colors.length : Math.floor(Math.random() * colors.length);
  return colors[index];
}
