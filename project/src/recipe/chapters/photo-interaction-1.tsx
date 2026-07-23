import React from 'react';
import { PhotoFromMagicCircle } from '../../components';
import type { ChapterFactory } from '../types';

export const buildPhotoInteraction1Chapter: ChapterFactory = (ctx) => {
  const { fps, theme, photos, orientation } = ctx;
  const photo = photos[0];
  if (!photo) {
    throw new Error('photo-interaction-1 requires at least one photo');
  }

  return {
    id: 'C_photoInteraction1',
    durationInFrames: 30 * fps,
    background: {
      type: 'gradient',
      gradient: theme.gradient,
    },
    overlay: {
      opacity: 0.05,
    },
    plusEffects: [
      {
        effectType: 'textFirework',
        contentType: 'mixed',
        words: ['生日快乐', 'Happy Birthday', '快乐成长'],
        images: [],
        imageWeight: 0.3,
        blessingTypes: ['goldCoin', 'redPacket'],
        fontSize: 60,
        colors: ['#FFD700', '#FF6B6B'],
        glowColor: '#FFD700',
        glowIntensity: 1.2,
        x: 0.5,
        y: 0.4,
        scale: 1,
        opacity: 0.9,
        animationSpeed: 2,
        seed: 12345,
      },
      {
        effectType: 'textRain',
        contentType: 'mixed',
        words: ['健康', '快乐', '成长', '平安'],
        images: [],
        imageWeight: 0.3,
        blessingTypes: ['goldCoin', 'star', 'redPacket'],
        fontSize: 60,
        colors: ['#FFD700', '#FF6B6B'],
        glowColor: '#FFD700',
        glowIntensity: 0.8,
        x: 0.5,
        y: 0.5,
        scale: 1,
        opacity: 0.7,
        animationSpeed: 0.3,
        seed: 54321,
      },
    ],
    children: (
      <PhotoFromMagicCircle photo={photo} visible={true} orientation={orientation} />
    ),
  };
};
