import type { KidsSubStyle } from '../types';
import type { BlessingSeriesId, KidsPresetId } from './types';

export interface PresetDefinition {
  id: KidsPresetId;
  name: string;
  description: string;
  blessingSeries: BlessingSeriesId;
  subStyle: KidsSubStyle;
  confettiLevel: 'low' | 'medium' | 'high';
}

export const KIDS_PRESETS: Record<KidsPresetId, PresetDefinition> = {
  journey_to_the_west: {
    id: 'journey_to_the_west',
    name: '西游记系列',
    description: '孙悟空师徒五人为你庆祝生日',
    blessingSeries: 'journey_to_the_west',
    subStyle: 'general',
    confettiLevel: 'high',
  },
  zodiac: {
    id: 'zodiac',
    name: '生肖守护神',
    description: '生肖守护神为你送上祝福',
    blessingSeries: 'zodiac',
    subStyle: 'general',
    confettiLevel: 'high',
  },
  girl_unicorn: {
    id: 'girl_unicorn',
    name: '女孩独角兽',
    description: '粉紫配色，适合小女孩',
    blessingSeries: 'journey_to_the_west',
    subStyle: 'girl_unicorn',
    confettiLevel: 'high',
  },
  boy_rocket: {
    id: 'boy_rocket',
    name: '男孩火箭',
    description: '蓝绿配色，适合小男孩',
    blessingSeries: 'journey_to_the_west',
    subStyle: 'boy_rocket',
    confettiLevel: 'high',
  },
  animal: {
    id: 'animal',
    name: '可爱动物',
    description: '可爱动物主题',
    blessingSeries: 'zodiac',
    subStyle: 'animal',
    confettiLevel: 'high',
  },
  general: {
    id: 'general',
    name: '通用派对',
    description: '通用派对风格',
    blessingSeries: 'journey_to_the_west',
    subStyle: 'general',
    confettiLevel: 'high',
  },
};

export function getPreset(id?: KidsPresetId): PresetDefinition {
  if (id && KIDS_PRESETS[id]) return KIDS_PRESETS[id];
  return KIDS_PRESETS.general;
}
