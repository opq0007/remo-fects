import React from 'react';
import { DreamBubblesScene } from '../../components';
import type { DreamJob } from '../../types';
import type { ChapterFactory } from '../types';
import { companionConfig } from './character-config';

/**
 * 模块 I：梦想种子
 * dreams 梦想职业泡泡 + 陪伴角色台词盖章
 */
export const buildDreamSeedsChapter: ChapterFactory = (ctx) => {
  const { fps, theme, orientation } = ctx;

  return {
    id: 'I_dreamSeeds',
    durationInFrames: 10 * fps,
    transition: { type: 'crossfade', durationInFrames: 14 },
    background: {
      type: 'gradient',
      gradient: theme.gradient,
    },
    character: companionConfig(ctx.mainCharacter, theme, {
      speech: '未来的你，一定了不起！',
      speechStartFrame: 60,
      position: { horizontal: 0.5, vertical: 0.82 },
      size: orientation === 'portrait' ? 150 : 120,
    }),
    floatingElements: {
      enabled: true,
      type: 'stars',
      count: 12,
      startFrame: 20,
      color: theme.primary,
    },
    children: (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <DreamBubblesScene dreams={ctx.dreams as DreamJob[]} visible={true} showText={true} />
      </div>
    ),
  };
};
