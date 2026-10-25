import React from 'react';
import { CalculateMetadataFunction, Composition, Folder } from 'remotion';
import { KidsBirthdayComposition } from './compositions';
import { estimateKidsBirthdayDuration } from './recipe';
import {
  KidsBirthdayUserSchema,
  KidsBirthdayInternalSchema,
  type KidsBirthdayUserProps,
  type KidsBirthdayInternalProps,
} from './schemas/user';

const DEFAULT_FPS = 24;

export function createDefaultUserProps(
  overrides: Partial<KidsBirthdayUserProps> = {}
): KidsBirthdayUserProps {
  return {
    name: '小明',
    age: 6,
    photos: [],
    preset: 'general',
    blessingSeries: 'journey_to_the_west',
    orientation: 'portrait',
    message: '愿你每天开心成长，梦想成真！',
    musicEnabled: true,
    birthdaySongSource: 'birthday_audio.mp3',
    fps: DEFAULT_FPS,
    ...overrides,
  };
}

function metadataFromUserProps(props: KidsBirthdayUserProps) {
  const estimate = estimateKidsBirthdayDuration(props);
  return {
    durationInFrames: Math.max(estimate.durationInFrames, 1),
    width: estimate.width,
    height: estimate.height,
    fps: estimate.fps || DEFAULT_FPS,
  };
}

const calculateKidsMetadata: CalculateMetadataFunction<KidsBirthdayUserProps> = ({
  props,
}) => metadataFromUserProps(props);

const calculateInternalMetadata: CalculateMetadataFunction<KidsBirthdayInternalProps> = ({
  props,
}) => {
  const { marquee: _a, watermark: _b, radialBurst: _c, foreground: _d, ...user } = props;
  return metadataFromUserProps(user);
};

// Remotion Composition 对 component 泛型较严，统一断言
const Comp = KidsBirthdayComposition as unknown as React.FC;

/**
 * 儿童生日祝福视频生成器（L0 精简参数 + 动态时长）
 */
export const RemotionRoot: React.FC = () => {
  const withPhoto = createDefaultUserProps({
    photos: [{ src: '熊猫.png' }],
  });
  const baseFrames = estimateKidsBirthdayDuration(withPhoto).durationInFrames;

  return (
    <Folder name="KidsBirthday">
      <Composition
        id="KidsBirthday"
        component={Comp}
        durationInFrames={baseFrames}
        fps={DEFAULT_FPS}
        width={720}
        height={1280}
        schema={KidsBirthdayUserSchema}
        defaultProps={withPhoto}
        calculateMetadata={calculateKidsMetadata}
      />

      <Folder name="Portrait-Preview">
        <Composition
          id="KidsBirthdayPortrait"
          component={Comp}
          durationInFrames={baseFrames}
          fps={DEFAULT_FPS}
          width={720}
          height={1280}
          schema={KidsBirthdayUserSchema}
          defaultProps={withPhoto}
          calculateMetadata={calculateKidsMetadata}
        />
        <Composition
          id="KidsBirthdayGirl"
          component={Comp}
          durationInFrames={baseFrames}
          fps={DEFAULT_FPS}
          width={720}
          height={1280}
          schema={KidsBirthdayUserSchema}
          defaultProps={createDefaultUserProps({
            name: '小美',
            age: 5,
            message: '小公主生日快乐！',
            preset: 'girl_unicorn',
            photos: [{ src: '熊猫.png' }],
          })}
          calculateMetadata={calculateKidsMetadata}
        />
        <Composition
          id="KidsBirthdayBoy"
          component={Comp}
          durationInFrames={baseFrames}
          fps={DEFAULT_FPS}
          width={720}
          height={1280}
          schema={KidsBirthdayUserSchema}
          defaultProps={createDefaultUserProps({
            name: '小强',
            age: 7,
            message: '小小男子汉生日快乐！',
            preset: 'boy_rocket',
            photos: [{ src: '熊猫.png' }],
          })}
          calculateMetadata={calculateKidsMetadata}
        />
      </Folder>

      <Folder name="Landscape-Preview">
        <Composition
          id="KidsBirthdayLandscape"
          component={Comp}
          durationInFrames={baseFrames}
          fps={DEFAULT_FPS}
          width={1280}
          height={720}
          schema={KidsBirthdayUserSchema}
          defaultProps={createDefaultUserProps({
            orientation: 'landscape',
            photos: [{ src: '熊猫.png' }],
          })}
          calculateMetadata={calculateKidsMetadata}
        />
      </Folder>

      <Folder name="Internal">
        <Composition
          id="KidsBirthdayInternal"
          component={Comp}
          durationInFrames={baseFrames}
          fps={DEFAULT_FPS}
          width={720}
          height={1280}
          schema={KidsBirthdayInternalSchema}
          defaultProps={{
            ...withPhoto,
            marquee: {
              enabled: true,
              positionY: 0.85,
              foreground: {
                texts: [{ text: '生日快乐' }, { text: 'Happy Birthday' }],
                fontSize: 24,
                opacity: 0.8,
              },
              background: {
                texts: [{ text: '✨' }, { text: '🎉' }],
                fontSize: 18,
                opacity: 0.4,
              },
              direction: 'left-to-right',
              speed: 50,
            },
            watermark: {
              enabled: true,
              text: 'Remo-Fects',
              fontSize: 20,
              opacity: 0.5,
            },
            radialBurst: {
              enabled: true,
              effectType: 'sparkleBurst',
              color: '#FFD76A',
              secondaryColor: '#7EC8FF',
              intensity: 0.8,
            },
          }}
          calculateMetadata={calculateInternalMetadata}
        />
      </Folder>
    </Folder>
  );
};
