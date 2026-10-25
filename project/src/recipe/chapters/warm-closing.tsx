import React from 'react';
import { BouncingName } from '../../components';
import type { ChapterFactory } from '../types';

/**
 * 模块 J：温暖收尾
 * message 祝福语 + 名字署名 + 日落暖光，长淡出收束全片
 */
export const buildWarmClosingChapter: ChapterFactory = (ctx) => {
  const { fps, theme, orientation, name, message, subStyle, nameColor } = ctx;

  return {
    id: 'J_warmClosing',
    durationInFrames: 3 * fps,
    transition: { type: 'fade', durationInFrames: 20 },
    background: {
      type: 'gradient',
      gradient: 'linear-gradient(180deg, #5D4FA8 0%, #9B7ED9 55%, #FFD76A 100%)',
    },
    confetti: {
      enabled: true,
      level: ctx.confettiLevel === 'low' ? 'low' : 'medium',
      primaryColor: theme.primary,
      secondaryColor: theme.secondary,
    },
    starFieldBackground: {
      enabled: true,
      starCount: 80,
    },
    children: (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          padding: '0 48px',
          textAlign: 'center',
        }}
      >
        <BouncingName
          name={name}
          showAge={false}
          subStyle={subStyle}
          fontSize={orientation === 'portrait' ? 72 : 56}
          color={nameColor}
        />
        <div
          style={{
            fontSize: orientation === 'portrait' ? 36 : 30,
            fontWeight: 600,
            color: '#FFFFFF',
            textShadow: `0 2px 12px rgba(0,0,0,0.4), 0 0 20px ${theme.primary}55`,
            lineHeight: 1.5,
            letterSpacing: 2,
          }}
        >
          {message}
        </div>
      </div>
    ),
  };
};
