import type { ChapterFactory } from '../types';
import { buildCountdownChapter } from './countdown';
import { buildMagicOpeningChapter } from './magic-opening';
import { buildGrowthCelebrationChapter } from './growth-celebration';
import { buildPhotoInteraction1Chapter } from './photo-interaction-1';
import { buildPhotoInteraction2Chapter } from './photo-interaction-2';
import { buildBirthdaySongChapter } from './birthday-song';
import { buildFutureBlessingChapter } from './future-blessing';

export const CHAPTER_FACTORIES: Record<string, ChapterFactory> = {
  countdown: buildCountdownChapter,
  'magic-opening': buildMagicOpeningChapter,
  'growth-celebration': buildGrowthCelebrationChapter,
  'photo-interaction-1': buildPhotoInteraction1Chapter,
  'photo-interaction-2': buildPhotoInteraction2Chapter,
  'birthday-song': buildBirthdaySongChapter,
  'future-blessing': buildFutureBlessingChapter,
};

export function getChapterFactory(key: string): ChapterFactory {
  const factory = CHAPTER_FACTORIES[key];
  if (!factory) {
    throw new Error(`Unknown chapter factory: ${key}`);
  }
  return factory;
}

export {
  buildCountdownChapter,
  buildMagicOpeningChapter,
  buildGrowthCelebrationChapter,
  buildPhotoInteraction1Chapter,
  buildPhotoInteraction2Chapter,
  buildBirthdaySongChapter,
  buildFutureBlessingChapter,
};
