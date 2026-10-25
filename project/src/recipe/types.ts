/**
 * Kids Birthday recipe 层类型（L1）
 */

import type { ColorTheme, KidsSubStyle, PhotoData, ScreenOrientation } from '../types';
import type { StoryChapterConfig } from '../../../effects/shared/components/StoryPanel';
import type {
  NestedAudioProps,
  NestedBackgroundProps,
  NestedOverlayProps,
} from '../../../effects/shared/schemas';

export type BlessingSeriesId =
  | 'journey_to_the_west'
  | 'zodiac'
  | 'fairy_tale'
  | 'custom';

export type KidsPresetId =
  | 'journey_to_the_west'
  | 'zodiac'
  | 'girl_unicorn'
  | 'boy_rocket'
  | 'animal'
  | 'general';

export interface SeriesCharacter {
  type: string;
  imageSrc: string;
  videoSrc?: string;
  name: string;
  greeting: string;
  /** 图片缺失时的卡通回退形象 */
  cartoonFallback?: { series: 'zodiac' | 'pet' | 'hero'; type: string };
  /** 用户显式提供的自定义资源，不做可用性回退 */
  isCustomAsset?: boolean;
}

export interface BlessingSeriesPack {
  id: BlessingSeriesId;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  characters: SeriesCharacter[];
}

export interface KidsBirthdayUserInput {
  name: string;
  age?: number;
  photos?: PhotoData[];
  blessingSeries?: BlessingSeriesId;
  preset?: KidsPresetId;
  orientation?: ScreenOrientation;
  message?: string;
  /** 梦想职业列表（最多5个），显示在 I 梦想种子章节 */
  dreams?: string[];
  /** 名字颜色（可选，默认跟随主题） */
  nameColor?: string;
  musicEnabled?: boolean;
  birthdaySongSource?: string;
  customCharacterImages?: string[];
  customCharacterVideos?: string[];
  /** 高级：按 id 合并覆盖章节 */
  chapterOverrides?: unknown[];
  seed?: number;
  fps?: number;
}

export interface ResolvedKidsBirthdayInput {
  name: string;
  age?: number;
  photos: PhotoData[];
  blessingSeries: BlessingSeriesId;
  preset: KidsPresetId;
  orientation: ScreenOrientation;
  message: string;
  dreams: string[];
  nameColor?: string;
  musicEnabled: boolean;
  birthdaySongSource?: string;
  birthdaySongVolume: number;
  musicTrack: string;
  customCharacterImages?: string[];
  customCharacterVideos?: string[];
  chapterOverrides?: unknown[];
  seed?: number;
  fps: number;
  subStyle: KidsSubStyle;
  confettiLevel: 'low' | 'medium' | 'high';
  width: number;
  height: number;
}

export interface ChapterContext {
  fps: number;
  name: string;
  age?: number;
  message: string;
  dreams: string[];
  nameColor?: string;
  orientation: ScreenOrientation;
  photos: PhotoData[];
  series: BlessingSeriesPack;
  characterResources: SeriesCharacter[];
  mainCharacter: SeriesCharacter | undefined;
  theme: ColorTheme;
  confettiLevel: 'low' | 'medium' | 'high';
  musicEnabled: boolean;
  birthdaySongSource?: string;
  birthdaySongVolume: number;
  seed?: number;
  subStyle: KidsSubStyle;
}

export type ChapterFactory = (ctx: ChapterContext) => StoryChapterConfig;

export interface TimelineSlot {
  id: string;
  factory: string;
  /** 激活该章节所需的最少照片数（0 = 始终激活） */
  minPhotos?: number;
  /** @deprecated 请使用 minPhotos */
  requiresPhotos?: boolean;
  seconds: number;
}

export interface CompiledTimeline {
  chapters: StoryChapterConfig[];
  panel: {
    background: NestedBackgroundProps;
    overlay: NestedOverlayProps;
    audio: NestedAudioProps;
  };
  durationInFrames: number;
  durationSeconds: number;
  width: number;
  height: number;
  fps: number;
  resolved: ResolvedKidsBirthdayInput;
}
