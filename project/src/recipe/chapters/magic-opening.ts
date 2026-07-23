import type { ChapterFactory } from '../types';

export const buildMagicOpeningChapter: ChapterFactory = (ctx) => {
  const { fps, mainCharacter } = ctx;
  return {
    id: 'A_magicOpening',
    durationInFrames: 2 * fps,
    background: {
      type: 'color',
      color: '#0a0a20',
    },
    magicEffects: {
      blackScreen: {
        enabled: true,
        durationInFrames: 24,
        startFrame: 0,
      },
    },
    character: {
      series: 'image',
      type: mainCharacter?.type as never,
      size: 500,
      animate: true,
      imageSrc: mainCharacter?.imageSrc || 'pic/孙悟空.png',
      entrance: {
        enabled: true,
        direction: 'bottom',
        delay: 20,
        distance: 100,
        springConfig: { damping: 12, stiffness: 80 },
        verticalPosition: 0.3,
        horizontalPosition: 0.5,
      },
      expression: 'happy',
    },
  };
};
