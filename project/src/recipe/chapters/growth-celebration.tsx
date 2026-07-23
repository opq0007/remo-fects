import React from 'react';
import { BouncingName, BlessingText } from '../../components';
import type { ChapterFactory } from '../types';

const ChapterFContent: React.FC<{
  name: string;
  age?: number;
  subStyle: import('../../types').KidsSubStyle;
  orientation: import('../../types').ScreenOrientation;
}> = ({ name, age, subStyle, orientation }) => (
  <>
    <div style={{ position: 'absolute', top: '10%', width: '100%', zIndex: 20 }}>
      <BouncingName
        name={name}
        age={age}
        showAge={true}
        subStyle={subStyle}
        fontSize={orientation === 'portrait' ? 90 : 70}
      />
    </div>
    <div
      style={{
        position: 'absolute',
        top: '30%',
        width: '100%',
        zIndex: 15,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <BlessingText
        text="生日快乐"
        fontSize={orientation === 'portrait' ? 50 : 40}
        subStyle={subStyle}
      />
    </div>
  </>
);

export const buildGrowthCelebrationChapter: ChapterFactory = (ctx) => {
  const { fps, confettiLevel, theme, characterResources, name, age, subStyle, orientation } = ctx;
  const videoCharacter = characterResources.find((c) => c.videoSrc);

  return {
    id: 'F_growthCelebration',
    durationInFrames: 10 * fps,
    background: {
      type: 'gradient',
      gradient: theme.gradient,
    },
    confetti: {
      enabled: true,
      level: confettiLevel,
      primaryColor: theme.primary,
      secondaryColor: theme.secondary,
    },
    magicEffects: {
      firework: {
        enabled: true,
        x: 0.5,
        y: 0.3,
        particleCount: 50,
        color: theme.primary,
        triggerFrame: 20,
      },
    },
    transparentVideos: videoCharacter?.videoSrc
      ? [
          {
            src: videoCharacter.videoSrc,
            mode: 'greenScreen' as const,
            scale: 0.6,
            x: 0.5,
            y: 0.7,
          },
        ]
      : undefined,
    children: (
      <ChapterFContent name={name} age={age} subStyle={subStyle} orientation={orientation} />
    ),
  };
};
