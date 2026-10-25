import type { ChapterFactory } from '../types';
import { leadCharacterConfig } from './character-config';

/**
 * 模块 A：魔法开场（4s 让入场弹簧完整落定，开场白含主角名字引出照片回忆）
 */
export const buildMagicOpeningChapter: ChapterFactory = (ctx) => {
  const { fps, mainCharacter, name } = ctx;

  return {
    id: 'A_magicOpening',
    durationInFrames: 4 * fps,
    transition: { type: 'slideRight', durationInFrames: 16 },
    background: {
      type: 'gradient',
      gradient: 'linear-gradient(180deg, #2B2650 0%, #453B7A 60%, #5D50A8 100%)',
    },
    magicEffects: {
      blackScreen: {
        enabled: true,
        durationInFrames: 24,
        startFrame: 0,
      },
    },
    character: leadCharacterConfig(mainCharacter, {
      size: 500,
      direction: 'bottom',
      delay: 20,
      distance: 100,
      verticalPosition: 0.3,
      horizontalPosition: 0.5,
      speech: { text: `${name}，今天是个特别的日子！`, startFrame: 55, bubbleColor: '#FFD76A' },
    }),
  };
};
