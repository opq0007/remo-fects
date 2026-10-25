import { PRIMARY_COLORS } from '../../types';
import type { ChapterFactory } from '../types';

export const buildFutureBlessingChapter: ChapterFactory = (ctx) => {
  const { fps, orientation, mainCharacter } = ctx;
  return {
    id: 'H_futureBlessing',
    durationInFrames: 10 * fps,
    background: {
      type: 'gradient',
      gradient: 'linear-gradient(180deg, #0a0a2e 0%, #1a1a4e 50%, #2a2a6e 100%)',
    },
    character: {
      type: mainCharacter?.type as never,
      series: 'image',
      imageSrc: mainCharacter?.imageSrc || 'pic/孙悟空.png',
      size: orientation === 'portrait' ? 500 : 450,
      animate: true,
      entrance: {
        enabled: true,
        direction: 'top',
        delay: 0,
        distance: 400,
        verticalPosition: 0.2,
        horizontalPosition: 0.5,
      },
      expression: 'happy',
    },
    subtitles: [
      {
        text: mainCharacter?.greeting || '未来的一年，我会一直守护你。',
        startFrame: 24,
        durationInFrames: 180,
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
