import React, { useMemo } from 'react';
import { useVideoConfig } from 'remotion';
import {
  StoryPanel,
  NestedMarqueeProps,
  NestedWatermarkProps,
  NestedRadialBurstProps,
  NestedForegroundProps,
} from '../../../effects/shared/index';
import { renderPlusEffects } from '../components/EffectRenderer';
import { compileKidsBirthdayTimeline } from '../recipe';
import type { KidsBirthdayUserProps } from '../schemas/user';

export type KidsBirthdayProps = KidsBirthdayUserProps;

export interface KidsBirthdayCompositionProps extends KidsBirthdayUserProps {
  /** Internal only */
  marquee?: NestedMarqueeProps;
  watermark?: NestedWatermarkProps;
  radialBurst?: NestedRadialBurstProps;
  foreground?: NestedForegroundProps;
}

/**
 * 儿童生日祝福 — 配方编译入口（薄封装）
 */
export const KidsBirthdayComposition: React.FC<KidsBirthdayCompositionProps> = (props) => {
  const { fps } = useVideoConfig();
  const {
    marquee,
    watermark,
    radialBurst,
    foreground,
    name,
    age,
    photos,
    blessingSeries,
    preset,
    orientation,
    message,
    musicEnabled,
    birthdaySongSource,
    customCharacterImages,
    customCharacterVideos,
    chapterOverrides,
    seed,
  } = props;

  const userProps: KidsBirthdayUserProps = {
    name,
    age,
    photos,
    blessingSeries,
    preset,
    orientation,
    message,
    musicEnabled,
    birthdaySongSource,
    customCharacterImages,
    customCharacterVideos,
    chapterOverrides,
    seed,
  };

  const compiled = useMemo(
    () => compileKidsBirthdayTimeline(userProps, fps),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      fps,
      name,
      age,
      message,
      orientation,
      blessingSeries,
      preset,
      musicEnabled,
      birthdaySongSource,
      seed,
      JSON.stringify(photos ?? []),
      JSON.stringify(customCharacterImages ?? []),
      JSON.stringify(customCharacterVideos ?? []),
      JSON.stringify(chapterOverrides ?? []),
    ]
  );

  return (
    <StoryPanel
      chapters={compiled.chapters}
      defaultTransition={{ type: 'fade', durationInFrames: 12 }}
      chapterGap={0}
      background={compiled.panel.background}
      overlay={compiled.panel.overlay}
      audio={compiled.panel.audio}
      marquee={marquee}
      watermark={watermark}
      radialBurst={radialBurst}
      foreground={foreground}
      renderPlusEffects={renderPlusEffects}
    />
  );
};

export default KidsBirthdayComposition;
