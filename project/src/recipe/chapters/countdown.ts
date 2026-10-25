import type { ChapterFactory } from '../types';

export const buildCountdownChapter: ChapterFactory = (ctx) => {
  const { fps, orientation, theme } = ctx;
  return {
    id: '0_countdown',
    durationInFrames: 4 * fps,
    transition: { type: 'slideUp', durationInFrames: 14 },
    background: {
      type: 'gradient',
      gradient: 'linear-gradient(180deg, #2B2650 0%, #453B7A 55%, #5D50A8 100%)',
    },
    countdown: {
      enabled: true,
      type: 'number',
      startNumber: 3,
      durationPerNumber: fps,
      effectType: 'bounce',
      effectIntensity: 1.2,
      audio: {
        enabled: true,
        tickSound: 'countDown_common.mp3',
        endSound: 'countDown_game.mp3',
      },
      textStyle: {
        fontSize: orientation === 'portrait' ? 280 : 200,
        fontWeight: 900,
        color: '#FFFFFF',
        strokeColor: theme.primary,
        strokeWidth: 6,
        glowColor: theme.primary,
        glowIntensity: 0.8,
      },
      finalText: {
        enabled: true,
        text: '开始!',
        scaleMultiplier: 1.8,
        extraGlow: true,
        colorChange: theme.primary,
        durationInFrames: fps,
      },
      x: 0.5,
      y: 0.5,
    },
    magicEffects: {
      particles: {
        enabled: true,
        particleCount: 60,
        color: theme.primary,
        durationInFrames: 3 * fps,
      },
    },
    starFieldBackground: {
      enabled: true,
      starCount: 100,
    },
  };
};
