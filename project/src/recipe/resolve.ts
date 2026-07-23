import type { KidsSubStyle, ScreenOrientation } from '../types';
import { getPreset } from './presets';
import timelineDefaults from './timeline-defaults.json';
import type {
  BlessingSeriesId,
  KidsBirthdayUserInput,
  KidsPresetId,
  ResolvedKidsBirthdayInput,
} from './types';

const VALID_SERIES = new Set<BlessingSeriesId>([
  'journey_to_the_west',
  'zodiac',
  'fairy_tale',
  'custom',
]);

const VALID_PRESETS = new Set<KidsPresetId>([
  'journey_to_the_west',
  'zodiac',
  'girl_unicorn',
  'boy_rocket',
  'animal',
  'general',
]);

function resolveOrientation(orientation?: ScreenOrientation): {
  orientation: ScreenOrientation;
  width: number;
  height: number;
} {
  if (orientation === 'landscape') {
    return { orientation: 'landscape', width: 1280, height: 720 };
  }
  return { orientation: 'portrait', width: 720, height: 1280 };
}

/**
 * L0 用户输入 → 内部解析结果（preset / series / 尺寸 / 默认文案）
 * blessingSeries 显式传入时优先于 preset 中的 series
 */
export function resolveUserInput(user: KidsBirthdayUserInput): ResolvedKidsBirthdayInput {
  const presetId =
    user.preset && VALID_PRESETS.has(user.preset) ? user.preset : ('general' as KidsPresetId);
  const preset = getPreset(presetId);

  let blessingSeries: BlessingSeriesId = preset.blessingSeries;
  if (user.blessingSeries && VALID_SERIES.has(user.blessingSeries)) {
    blessingSeries = user.blessingSeries;
  }

  const { orientation, width, height } = resolveOrientation(user.orientation);
  const fps = user.fps && user.fps > 0 ? user.fps : timelineDefaults.fpsDefault;
  const subStyle: KidsSubStyle = preset.subStyle;

  return {
    name: (user.name || '').trim(),
    age: user.age,
    photos: user.photos ?? [],
    blessingSeries,
    preset: presetId,
    orientation,
    message: user.message?.trim() || '愿你每天开心成长',
    musicEnabled: user.musicEnabled ?? true,
    birthdaySongSource: user.birthdaySongSource,
    birthdaySongVolume: timelineDefaults.birthdaySongVolume,
    musicTrack: timelineDefaults.musicTrack,
    customCharacterImages: user.customCharacterImages,
    customCharacterVideos: user.customCharacterVideos,
    chapterOverrides: user.chapterOverrides,
    seed: user.seed,
    fps,
    subStyle,
    confettiLevel: preset.confettiLevel,
    width,
    height,
  };
}
