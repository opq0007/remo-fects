import type { TimelineSlot } from '../types';
import timelineDefaults from '../timeline-defaults.json';

/**
 * classic 时间轴：与 timeline-defaults.json 同源
 * factory key 与 CHAPTER_FACTORIES 对齐
 */
const FACTORY_BY_SLOT_ID: Record<string, string> = {
  '0_countdown': 'countdown',
  A_magicOpening: 'magic-opening',
  F_growthCelebration: 'growth-celebration',
  C_photoInteraction1: 'photo-interaction-1',
  D_photoInteraction2: 'photo-interaction-2',
  G_birthdaySong: 'birthday-song',
  H_futureBlessing: 'future-blessing',
};

export const CLASSIC_TEMPLATE_SLOTS: TimelineSlot[] = timelineDefaults.slots.map((slot) => ({
  id: slot.id,
  seconds: slot.seconds,
  requiresPhotos: slot.requiresPhotos,
  factory: FACTORY_BY_SLOT_ID[slot.id],
}));

export { timelineDefaults };
