import type { SeriesCharacter } from '../types';
import type { StoryCharacterConfig } from '../../../../effects/shared/components/StoryChapter';
import { isAssetAvailable } from '../asset-fallback';

/**
 * 主/陪伴角色 → StoryChapterConfig.character 配置
 *
 * imageSrc 存在（或用户显式提供自定义资源）→ 图片模式
 * 否则 → cartoonFallback 的内置卡通角色（零资源依赖）
 */

interface CharacterOverrides {
  size?: number;
  direction?: 'left' | 'right' | 'bottom' | 'top';
  delay?: number;
  distance?: number;
  verticalPosition?: number;
  horizontalPosition?: number;
  speech?: { text: string; startFrame: number; bubbleColor?: string };
  expression?: 'happy' | 'excited' | 'waving' | 'hugging';
}

export function leadCharacterConfig(
  character: SeriesCharacter | undefined,
  overrides: CharacterOverrides = {}
): StoryCharacterConfig | undefined {
  if (!character) return undefined;

  const useImage = isAssetAvailable(character.imageSrc) || character.isCustomAsset;

  const base = {
    size: overrides.size ?? 500,
    animate: true,
    entrance: {
      enabled: true,
      direction: overrides.direction ?? 'bottom',
      delay: overrides.delay ?? 20,
      distance: overrides.distance ?? 100,
      springConfig: { damping: 12, stiffness: 80 },
      verticalPosition: overrides.verticalPosition ?? 0.3,
      horizontalPosition: overrides.horizontalPosition ?? 0.5,
    },
    expression: overrides.expression ?? 'happy',
    ...(overrides.speech
      ? {
          speechTimeline: [
            {
              text: overrides.speech.text,
              startFrame: overrides.speech.startFrame,
              animationType: 'scale' as const,
              bubbleColor: overrides.speech.bubbleColor ?? '#FFD76A',
            },
          ],
        }
      : {}),
  };

  if (useImage) {
    return {
      ...base,
      series: 'image',
      type: character.type,
      imageSrc: character.imageSrc,
    } as unknown as StoryCharacterConfig;
  }

  // 卡通回退：用内置生肖/萌宠/超人形象顶替缺失图片
  return {
    ...base,
    series: character.cartoonFallback?.series ?? 'zodiac',
    type: character.cartoonFallback?.type ?? 'monkey',
  } as unknown as StoryCharacterConfig;
}

/**
 * 陪伴角色：照片/梦想模块的小尺寸主持人，用台词把章节串成连续故事
 */
export function companionConfig(
  character: SeriesCharacter | undefined,
  theme: { secondary: string },
  options: {
    speech: string;
    speechStartFrame: number;
    position: { horizontal: number; vertical: number };
    size?: number;
  }
) {
  return leadCharacterConfig(character, {
    size: options.size ?? 170,
    direction: 'bottom',
    delay: 8,
    distance: 80,
    verticalPosition: options.position.vertical,
    horizontalPosition: options.position.horizontal,
    speech: {
      text: options.speech,
      startFrame: options.speechStartFrame,
      bubbleColor: theme.secondary,
    },
  });
}
