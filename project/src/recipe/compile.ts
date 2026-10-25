import type { StoryChapterConfig } from '../../../effects/shared/components/StoryPanel';
import { getColorTheme } from '../utils/colors';
import { mergeChapterConfigs } from '../utils/mergeChapterConfig';
import { getChapterFactory } from './chapters';
import { estimateDurationFromUser } from './estimate-duration';
import { resolveUserInput } from './resolve';
import { getSeriesPack, resolveCharacterResources } from './series';
import { getTemplateSlots } from './templates';
import type {
  ChapterContext,
  CompiledTimeline,
  KidsBirthdayUserInput,
} from './types';

function buildChapterContext(user: KidsBirthdayUserInput): {
  ctx: ChapterContext;
  resolved: ReturnType<typeof resolveUserInput>;
} {
  const resolved = resolveUserInput(user);
  const series = getSeriesPack(resolved.blessingSeries);
  const characterResources = resolveCharacterResources(
    series,
    resolved.customCharacterImages,
    resolved.customCharacterVideos
  );
  const theme = getColorTheme(resolved.subStyle);

  const ctx: ChapterContext = {
    fps: resolved.fps,
    name: resolved.name,
    age: resolved.age,
    message: resolved.message,
    orientation: resolved.orientation,
    photos: resolved.photos,
    series,
    characterResources,
    mainCharacter: characterResources[0],
    theme,
    confettiLevel: resolved.confettiLevel,
    musicEnabled: resolved.musicEnabled,
    birthdaySongSource: resolved.birthdaySongSource,
    birthdaySongVolume: resolved.birthdaySongVolume,
    seed: resolved.seed,
    subStyle: resolved.subStyle,
  };

  return { ctx, resolved };
}

/**
 * 用户输入 → StoryPanel 章节 + 面板参数 + 动态时长
 */
export function compileKidsBirthdayTimeline(
  user: KidsBirthdayUserInput,
  fpsOverride?: number
): CompiledTimeline {
  const input: KidsBirthdayUserInput = {
    ...user,
    fps: fpsOverride ?? user.fps,
  };
  const { ctx, resolved } = buildChapterContext(input);
  const hasPhotos = resolved.photos.length > 0;
  const slots = getTemplateSlots('classic').filter(
    (slot) => !slot.requiresPhotos || hasPhotos
  );

  const built: StoryChapterConfig[] = [];
  for (const slot of slots) {
    const factory = getChapterFactory(slot.factory);
    const chapter = factory(ctx);
    // 保证 duration 与模板秒数一致（工厂内已用 fps*seconds，双重保险）
    if (chapter.durationInFrames !== slot.seconds * resolved.fps) {
      chapter.durationInFrames = slot.seconds * resolved.fps;
    }
    built.push(chapter);
  }

  const chapters = mergeChapterConfigs(built, resolved.chapterOverrides);

  // 合并后若 overrides 改了时长，以合并结果为准
  const durationInFrames = chapters.reduce((sum, ch) => sum + (ch.durationInFrames || 0), 0);
  const durationSeconds = durationInFrames / resolved.fps;

  return {
    chapters,
    panel: {
      background: {
        type: 'gradient',
        gradient: ctx.theme.gradient,
        color: ctx.theme.background,
      },
      overlay: {
        opacity: 0.1,
      },
      audio: {
        enabled: resolved.musicEnabled,
        source: `${resolved.musicTrack}.mp3`,
        volume: 0.5,
        loop: true,
      },
    },
    durationInFrames,
    durationSeconds,
    width: resolved.width,
    height: resolved.height,
    fps: resolved.fps,
    resolved,
  };
}

/**
 * 仅估算时长（无 React 章节构建，API 可用；与 compile 在无 overrides 时一致）
 */
export function estimateKidsBirthdayDuration(user: KidsBirthdayUserInput) {
  return estimateDurationFromUser(user);
}
