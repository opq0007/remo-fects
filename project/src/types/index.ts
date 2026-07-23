/**
 * 儿童生日祝福视频 - 精简类型定义（重构后）
 * 系列/预设/时间轴真相在 recipe/
 */

// ==================== 布局 / 风格 ====================

export type ScreenOrientation = 'portrait' | 'landscape';

export type KidsSubStyle = 'girl_unicorn' | 'boy_rocket' | 'animal' | 'general';

export type AnimationSpeed = 'slow' | 'normal' | 'fast';

export interface PrimaryColors {
  creamYellow: string;
  skyBlue: string;
  strawberryPink: string;
  mintGreen: string;
  violet: string;
}

export interface ColorTheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  gradient: string;
  gradientSecondary?: string;
}

export interface GradientBackground {
  name: string;
  colors: [string, string];
  type: 'dreamy' | 'energetic' | 'soft';
}

export interface PhotoData {
  id?: string;
  src: string;
}

export interface LayoutConfig {
  orientation: ScreenOrientation;
  aspectRatio: string;
  characterPosition: 'center' | 'left' | 'right';
  photoPosition: 'float' | 'right' | 'left';
  namePosition: 'center-top' | 'center';
}

// 遗留角色类型（组件内部 Story 仍可能引用；用户 API 已不暴露）
export type CharacterSeries = 'zodiac' | 'pet' | 'hero' | 'image';
export type ZodiacType =
  | 'rat'
  | 'ox'
  | 'tiger'
  | 'rabbit'
  | 'dragon'
  | 'snake'
  | 'horse'
  | 'goat'
  | 'monkey'
  | 'rooster'
  | 'dog'
  | 'pig';
export type PetType = 'bunny' | 'kitten' | 'puppy' | 'bear' | 'fox' | 'panda';
export type HeroType = 'superhero' | 'astronaut' | 'knight' | 'wizard' | 'pirate';

export interface CharacterConfig {
  series: CharacterSeries;
  type: ZodiacType | PetType | HeroType;
  name: string;
  greeting: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  imageSrc?: string;
}

// ==================== 常量 ====================

export const PRIMARY_COLORS: PrimaryColors = {
  creamYellow: '#FFD76A',
  skyBlue: '#7EC8FF',
  strawberryPink: '#FF8FA3',
  mintGreen: '#82E6C5',
  violet: '#B892FF',
};

export const GRADIENT_BACKGROUNDS: GradientBackground[] = [
  { name: '梦幻蓝紫', colors: ['#7EC8FF', '#B892FF'], type: 'dreamy' },
  { name: '活力粉橙', colors: ['#FF8FA3', '#FFD76A'], type: 'energetic' },
  { name: '柔和粉紫', colors: ['#FFB6D9', '#E8D4F8'], type: 'soft' },
];

export const KIDS_COLOR_THEMES: Record<KidsSubStyle, ColorTheme> = {
  girl_unicorn: {
    name: '女孩独角兽',
    primary: PRIMARY_COLORS.strawberryPink,
    secondary: PRIMARY_COLORS.creamYellow,
    accent: PRIMARY_COLORS.violet,
    background: '#FFE4EC',
    gradient: `linear-gradient(135deg, ${PRIMARY_COLORS.strawberryPink} 0%, ${PRIMARY_COLORS.violet} 100%)`,
    gradientSecondary: `linear-gradient(180deg, ${PRIMARY_COLORS.skyBlue} 0%, ${PRIMARY_COLORS.violet} 100%)`,
  },
  boy_rocket: {
    name: '男孩火箭',
    primary: PRIMARY_COLORS.skyBlue,
    secondary: PRIMARY_COLORS.creamYellow,
    accent: PRIMARY_COLORS.mintGreen,
    background: '#E4F3FF',
    gradient: `linear-gradient(135deg, ${PRIMARY_COLORS.skyBlue} 0%, ${PRIMARY_COLORS.violet} 100%)`,
    gradientSecondary: `linear-gradient(180deg, ${PRIMARY_COLORS.skyBlue} 0%, ${PRIMARY_COLORS.mintGreen} 100%)`,
  },
  animal: {
    name: '可爱动物',
    primary: PRIMARY_COLORS.mintGreen,
    secondary: PRIMARY_COLORS.creamYellow,
    accent: PRIMARY_COLORS.strawberryPink,
    background: '#F0FFF0',
    gradient: `linear-gradient(135deg, ${PRIMARY_COLORS.mintGreen} 0%, ${PRIMARY_COLORS.creamYellow} 100%)`,
    gradientSecondary: `linear-gradient(180deg, ${PRIMARY_COLORS.skyBlue} 0%, ${PRIMARY_COLORS.mintGreen} 100%)`,
  },
  general: {
    name: '通用派对',
    primary: PRIMARY_COLORS.creamYellow,
    secondary: PRIMARY_COLORS.skyBlue,
    accent: PRIMARY_COLORS.strawberryPink,
    background: '#FFF9E6',
    gradient: `linear-gradient(180deg, ${PRIMARY_COLORS.skyBlue} 0%, ${PRIMARY_COLORS.violet} 100%)`,
    gradientSecondary: `linear-gradient(135deg, ${PRIMARY_COLORS.strawberryPink} 0%, ${PRIMARY_COLORS.creamYellow} 100%)`,
  },
};

export const LAYOUT_CONFIGS: Record<ScreenOrientation, LayoutConfig> = {
  portrait: {
    orientation: 'portrait',
    aspectRatio: '9:16',
    characterPosition: 'center',
    photoPosition: 'float',
    namePosition: 'center-top',
  },
  landscape: {
    orientation: 'landscape',
    aspectRatio: '16:9',
    characterPosition: 'left',
    photoPosition: 'right',
    namePosition: 'center',
  },
};

// 兼容旧 colors 工具中的角色表（非用户 API）
export const ZODIAC_CHARACTERS: Record<ZodiacType, CharacterConfig> = {
  rat: { series: 'zodiac', type: 'rat', name: '小老鼠', greeting: '吱吱！', primaryColor: '#A0A0A0', secondaryColor: '#FFD76A', accentColor: '#FF8FA3' },
  ox: { series: 'zodiac', type: 'ox', name: '小牛牛', greeting: '哞～', primaryColor: '#8B4513', secondaryColor: '#FFD76A', accentColor: '#82E6C5' },
  tiger: { series: 'zodiac', type: 'tiger', name: '小老虎', greeting: '嗷呜～', primaryColor: '#FF8C00', secondaryColor: '#FFD76A', accentColor: '#7EC8FF' },
  rabbit: { series: 'zodiac', type: 'rabbit', name: '小兔子', greeting: '蹦蹦跳～', primaryColor: '#FFB6C1', secondaryColor: '#FFD76A', accentColor: '#B892FF' },
  dragon: { series: 'zodiac', type: 'dragon', name: '小龙龙', greeting: '吼～', primaryColor: '#FFD700', secondaryColor: '#FF6347', accentColor: '#7EC8FF' },
  snake: { series: 'zodiac', type: 'snake', name: '小蛇蛇', greeting: '嘶嘶～', primaryColor: '#32CD32', secondaryColor: '#FFD76A', accentColor: '#B892FF' },
  horse: { series: 'zodiac', type: 'horse', name: '小马驹', greeting: '咴咴～', primaryColor: '#DEB887', secondaryColor: '#FFD76A', accentColor: '#82E6C5' },
  goat: { series: 'zodiac', type: 'goat', name: '小山羊', greeting: '咩～', primaryColor: '#F5F5DC', secondaryColor: '#FFD76A', accentColor: '#FF8FA3' },
  monkey: { series: 'zodiac', type: 'monkey', name: '小猴子', greeting: '嘻嘻～', primaryColor: '#D2691E', secondaryColor: '#FFD76A', accentColor: '#7EC8FF' },
  rooster: { series: 'zodiac', type: 'rooster', name: '小公鸡', greeting: '喔喔～', primaryColor: '#FF4500', secondaryColor: '#FFD76A', accentColor: '#82E6C5' },
  dog: { series: 'zodiac', type: 'dog', name: '小狗汪', greeting: '汪汪～', primaryColor: '#DAA520', secondaryColor: '#FFD76A', accentColor: '#B892FF' },
  pig: { series: 'zodiac', type: 'pig', name: '小猪猪', greeting: '哼哼～', primaryColor: '#FFC0CB', secondaryColor: '#FFD76A', accentColor: '#82E6C5' },
};

export const PET_CHARACTERS: Record<PetType, CharacterConfig> = {
  bunny: { series: 'pet', type: 'bunny', name: '蹦蹦兔', greeting: '蹦蹦跳跳～', primaryColor: '#FFB6C1', secondaryColor: '#FFD76A', accentColor: '#B892FF' },
  kitten: { series: 'pet', type: 'kitten', name: '喵喵猫', greeting: '喵～', primaryColor: '#FFA07A', secondaryColor: '#FFD76A', accentColor: '#7EC8FF' },
  puppy: { series: 'pet', type: 'puppy', name: '汪汪狗', greeting: '汪汪～', primaryColor: '#DAA520', secondaryColor: '#FFD76A', accentColor: '#82E6C5' },
  bear: { series: 'pet', type: 'bear', name: '小熊熊', greeting: '抱抱～', primaryColor: '#8B4513', secondaryColor: '#FFD76A', accentColor: '#FF8FA3' },
  fox: { series: 'pet', type: 'fox', name: '小狐狸', greeting: '叮铃～', primaryColor: '#FF6347', secondaryColor: '#FFD76A', accentColor: '#B892FF' },
  panda: { series: 'pet', type: 'panda', name: '盼盼熊', greeting: '滚滚～', primaryColor: '#2F4F4F', secondaryColor: '#FFFFFF', accentColor: '#82E6C5' },
};

export const HERO_CHARACTERS: Record<HeroType, CharacterConfig> = {
  superhero: { series: 'hero', type: 'superhero', name: '超级小英雄', greeting: '冲呀～', primaryColor: '#FF4500', secondaryColor: '#FFD76A', accentColor: '#7EC8FF' },
  astronaut: { series: 'hero', type: 'astronaut', name: '小小宇航员', greeting: '出发～', primaryColor: '#7EC8FF', secondaryColor: '#FFD76A', accentColor: '#B892FF' },
  knight: { series: 'hero', type: 'knight', name: '勇敢小骑士', greeting: '守护～', primaryColor: '#C0C0C0', secondaryColor: '#FFD76A', accentColor: '#82E6C5' },
  wizard: { series: 'hero', type: 'wizard', name: '魔法小巫师', greeting: '魔法～', primaryColor: '#B892FF', secondaryColor: '#FFD76A', accentColor: '#FF8FA3' },
  pirate: { series: 'hero', type: 'pirate', name: '冒险小海盗', greeting: '冒险～', primaryColor: '#2F4F4F', secondaryColor: '#FFD76A', accentColor: '#FF4500' },
};
