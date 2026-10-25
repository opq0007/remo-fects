/**
 * 时长估算（与 classic 模板默认秒数同源，可供 API 与 Remotion 共用逻辑）
 */
import timelineDefaults from './timeline-defaults.json';
import type { KidsBirthdayUserInput } from './types';
import { resolveUserInput } from './resolve';

export interface DurationEstimate {
  durationInFrames: number;
  durationSeconds: number;
  width: number;
  height: number;
  fps: number;
  chapterIds: string[];
}

/**
 * 根据是否有照片过滤 slots，求和默认秒数
 */
export function estimateDurationFromUser(user: KidsBirthdayUserInput): DurationEstimate {
  const resolved = resolveUserInput(user);
  const hasPhotos = resolved.photos.length > 0;
  const activeSlots = timelineDefaults.slots.filter(
    (slot) => !slot.requiresPhotos || hasPhotos
  );
  const durationSeconds = activeSlots.reduce((sum, slot) => sum + slot.seconds, 0);
  const durationInFrames = Math.round(durationSeconds * resolved.fps);

  return {
    durationInFrames,
    durationSeconds,
    width: resolved.width,
    height: resolved.height,
    fps: resolved.fps,
    chapterIds: activeSlots.map((s) => s.id),
  };
}

/** 无照片 classic 总秒数（倒计时+正片） */
export function getNoPhotoDurationSeconds(): number {
  return timelineDefaults.slots
    .filter((s) => !s.requiresPhotos)
    .reduce((sum, s) => sum + s.seconds, 0);
}

/** 有照片 classic 总秒数 */
export function getWithPhotoDurationSeconds(): number {
  return timelineDefaults.slots.reduce((sum, s) => sum + s.seconds, 0);
}
