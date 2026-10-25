import { PRIMARY_COLORS } from '../../types';
import type { ChapterFactory } from '../types';
import { leadCharacterConfig } from './character-config';

export const buildFutureBlessingChapter: ChapterFactory = (ctx) => {
  const { fps, orientation, mainCharacter } = ctx;
  return {
    id: 'H_futureBlessing',
    durationInFrames: 8 * fps,
    transition: { type: 'slideRight', durationInFrames: 14 },
    background: {
      type: 'gradient',
      gradient: 'linear-gradient(180deg, #3A2E6E 0%, #4A3F8C 55%, #5D4FA8 100%)',
    },
    character: leadCharacterConfig(mainCharacter, {
      size: orientation === 'portrait' ? 500 : 450,
      direction: 'top',
      delay: 0,
      distance: 400,
      verticalPosition: 0.2,
      horizontalPosition: 0.5,
    }),
    subtitles: [
      {
        text: mainCharacter?.greeting || '未来的一年，我会一直守护你。',
        startFrame: 24,
        durationInFrames: 150,
        position: 'bottom',
        fontSize: 28,
        color: '#FFFFFF',
        backgroundColor: PRIMARY_COLORS.violet,
        backgroundOpacity: 0.8,
      },
    ],
    magicEffects: {
      shootingStar: {
        enabled: true,
        startX: 0.9,
        startY: 0.1,
        endX: 0.3,
        endY: 0.5,
        durationInFrames: 40,
      },
    },
    starFieldBackground: {
      enabled: true,
      starCount: 150,
    },
  };
};
