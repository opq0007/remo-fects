import React from 'react';
import { PhotoFromMagicCircle } from '../../components';
import type { ChapterFactory } from '../types';
import { companionConfig } from './character-config';
import { isAssetAvailable } from '../asset-fallback';

export const buildPhotoInteraction2Chapter: ChapterFactory = (ctx) => {
  const { fps, theme, photos, orientation, characterResources, mainCharacter } = ctx;
  // 有意循环取用：照片不足时复用已有照片（如 1 张时重复第一张），避免空引用报错
  const photo = photos[1 % photos.length];
  if (!photo) {
    throw new Error('photo-interaction-2 requires at least one photo');
  }

  // 仅使用实际存在的绿幕视频，缺失资源自动跳过
  const transparentVideoConfigs = characterResources
    .filter((c) => c.videoSrc && isAssetAvailable(c.videoSrc))
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
    durationInFrames: 25 * fps,
    transition: { type: 'slideUp', durationInFrames: 14 },
    background: {
      type: 'gradient',
      gradient: theme.gradient,
    },
    overlay: {
      opacity: 0.05,
    },
    character: companionConfig(mainCharacter, theme, {
      speech: '哇，更多精彩回忆！',
      speechStartFrame: 15,
      position: { horizontal: 0.16, vertical: 0.78 },
    }),
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
      color: theme.secondary,
    },
    transparentVideos: transparentVideoConfigs.length > 0 ? transparentVideoConfigs : undefined,
  };
};
