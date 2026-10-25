import React from 'react';
import { BirthdaySongScene } from '../../components';
import type { ChapterFactory } from '../types';

const ChapterGContent: React.FC<{
  age?: number;
  name?: string;
  birthdaySongSource?: string;
  birthdaySongVolume: number;
  photos: import('../../types').PhotoData[];
  subStyle: import('../../types').KidsSubStyle;
  durationInFrames: number;
  orientation: import('../../types').ScreenOrientation;
}> = ({
  age,
  name,
  birthdaySongSource,
  birthdaySongVolume,
  photos,
  subStyle,
  durationInFrames,
  orientation,
}) => (
  <BirthdaySongScene
    age={age}
    name={name}
    durationInFrames={durationInFrames}
    birthdaySongSource={birthdaySongSource}
    birthdaySongVolume={birthdaySongVolume}
    photos={photos}
    subStyle={subStyle}
    orientation={orientation}
  />
);

export const buildBirthdaySongChapter: ChapterFactory = (ctx) => {
  const {
    fps,
    theme,
    characterResources,
    orientation,
    age,
    name,
    birthdaySongSource,
    birthdaySongVolume,
    photos,
    subStyle,
  } = ctx;

  const celebrationCharacters = characterResources.slice(0, 4).map((char, index) => {
      const positions = [
        { direction: 'left' as const, horizontalPosition: 0.15, verticalPosition: 0.1 },
        { direction: 'right' as const, horizontalPosition: 0.85, verticalPosition: 0.1 },
        { direction: 'bottom' as const, horizontalPosition: 0.15, verticalPosition: 0.65 },
        { direction: 'bottom' as const, horizontalPosition: 0.85, verticalPosition: 0.65 },
      ];
      const greetings = ['生日快乐！', '天天开心！', '健康成长！', '万事如意！'];
      const bubbleColors = ['#FFD76A', '#FF8FA3', '#7EC8FF', '#B892FF'];

      return {
        type: char.type as never,
        series: 'image' as const,
        imageSrc: char.imageSrc,
        size: orientation === 'portrait' ? 120 : 100,
        animate: true,
        entrance: {
          enabled: true,
          direction: positions[index].direction,
          delay: index * 20,
          distance: 150,
          springConfig: { damping: 12, stiffness: 80 },
          horizontalPosition: positions[index].horizontalPosition,
          verticalPosition: positions[index].verticalPosition,
        },
        expressionTimeline: [
          { expression: 'happy' as const, startFrame: 0 },
          { expression: 'excited' as const, startFrame: 120 + index * 20 },
          { expression: 'waving' as const, startFrame: 300 + index * 20 },
        ],
        speechTimeline: [
          {
            text: char.greeting || greetings[index],
            startFrame: 60 + index * 40,
            animationType: 'scale' as const,
            bubbleColor: bubbleColors[index],
          },
        ],
      };
    });

  const durationInFrames = 35 * fps;

  return {
    id: 'G_birthdaySong',
    durationInFrames,
    background: {
      type: 'gradient',
      gradient: theme.gradient,
    },
    characters: celebrationCharacters,
    confetti: {
      enabled: true,
      level: 'high',
      primaryColor: theme.primary,
      secondaryColor: theme.secondary,
    },
    magicEffects: {
      firework: {
        enabled: true,
        x: 0.5,
        y: 0.15,
        particleCount: 40,
        color: theme.primary,
        triggerFrame: 400,
      },
    },
    children: (
      <ChapterGContent
        age={age}
        name={name}
        birthdaySongSource={birthdaySongSource}
        birthdaySongVolume={birthdaySongVolume}
        photos={photos}
        subStyle={subStyle}
        durationInFrames={durationInFrames}
        orientation={orientation}
      />
    ),
  };
};
