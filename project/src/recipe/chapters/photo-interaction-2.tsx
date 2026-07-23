import React from 'react';
import { PhotoFromMagicCircle } from '../../components';
import type { ChapterFactory } from '../types';

export const buildPhotoInteraction2Chapter: ChapterFactory = (ctx) => {
  const { fps, theme, photos, orientation, characterResources } = ctx;
  const photo = photos[1 % photos.length];
  if (!photo) {
    throw new Error('photo-interaction-2 requires at least one photo');
  }

  const transparentVideoConfigs = characterResources
    .filter((c) => c.videoSrc)
    .slice(0, 5)
    .map((char, index) => ({
      src: char.videoSrc!,
      mode: 'greenScreen' as const,
      startFrame: index * 120,
      durationInFrames: index === 4 ? 144 : 120,
      scale: 0.6,
      x: 0.5,
      y: 0.7,
      flipX: index % 2 === 0,
    }));

  return {
    id: 'D_photoInteraction2',
    durationInFrames: 30 * fps,
    background: {
      type: 'gradient',
      gradient: theme.gradient,
    },
    overlay: {
      opacity: 0.05,
    },
    children: (
      <PhotoFromMagicCircle
        targetY={0.3}
        photo={photo}
        visible={true}
        orientation={orientation}
      />
    ),
    floatingElements: {
      enabled: true,
      type: 'hearts',
      count: 15,
      startFrame: 30,
      color: '#FF6B6B',
    },
    transparentVideos: transparentVideoConfigs.length > 0 ? transparentVideoConfigs : undefined,
  };
};
