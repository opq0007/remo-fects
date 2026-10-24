import React from 'react';
import { Composition, Folder, type CalculateMetadataFunction } from 'remotion';
import { z } from 'zod';
import { KidsBirthdayComposition } from './compositions';
import { KidsBirthdaySchema, computeContentPlan } from './schemas';

type KidsProps = z.infer<typeof KidsBirthdaySchema>;

/**
 * 儿童生日祝福视频生成器 v4.0
 *
 * 视频总时长随照片数量自动伸缩（无照片74s / 1张99s / 2张及以上124s），
 * 通过 calculateMetadata 动态计算，Studio 预览与 API 渲染行为一致。
 *
 * 支持角色系统（blessingSeries）：
 * - 西游记系列（图片缺失自动回退内置卡通形象）
 * - 生肖守护神系列
 * - 童话系列
 * - 自定义系列（customCharacterImages / customCharacterVideos）
 */

// 公共默认参数（所有 composition 共享，改一处全局生效）
const BASE_DEFAULTS = {
  name: '小明',
  age: 6,
  message: '愿你每天开心成长，梦想成真！',
  duration: 124,
  fps: 24,
  width: 720,
  height: 1280,
  subStyle: 'general' as const,
  photos: [{ src: '熊猫.png' }],
  dreams: ['astronaut', 'artist', 'racer'] as ('astronaut' | 'artist' | 'racer')[],
  orientation: 'portrait' as const,
  blessingSeries: 'journey_to_the_west' as const,
  nameFontSize: 120,
  showAge: true,
  blessingText: '生日快乐',
  blessingFontSize: 60,
  confettiLevel: 'high' as const,
  musicEnabled: true,
  musicTrack: 'JoyfulChildren',
  birthdaySongSource: 'birthday_audio.mp3',
  birthdaySongVolume: 0.6,
};

// 面板级公共配置（走马灯/水印/径向粒子）
const PANEL_DEFAULTS = {
  marquee: {
    enabled: true,
    positionY: 0.85,
    foreground: {
      texts: [
        { text: '生日快乐' },
        { text: 'Happy Birthday' },
        { text: '快乐成长' },
      ],
      fontSize: 24,
      opacity: 0.8,
    },
    background: {
      texts: [
        { text: '✨' },
        { text: '🎉' },
        { text: '🎂' },
      ],
      fontSize: 18,
      opacity: 0.4,
    },
    direction: 'left-to-right' as const,
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
    effectType: 'sparkleBurst' as const,
    color: '#FFD76A',
    secondaryColor: '#7EC8FF',
    intensity: 0.8,
  },
};

/**
 * 按照片数量动态计算视频总时长：
 * Studio 预览与渲染都不会出现"内容播完后黑屏等待"的空档
 */
const calculateMetadata: CalculateMetadataFunction<KidsProps> = ({ props }) => {
  const plan = computeContentPlan(props.photos?.length ?? 0, props.fps || 24);
  return {
    durationInFrames: Math.round(plan.totalFrames),
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="KidsBirthday">
      <Composition
        id="KidsBirthday"
        component={KidsBirthdayComposition}
        durationInFrames={2976} // 兜底值，实际由 calculateMetadata 按照片数量计算
        calculateMetadata={calculateMetadata}
        fps={24}
        width={720}
        height={1280}
        schema={KidsBirthdaySchema}
        defaultProps={{ ...BASE_DEFAULTS, ...PANEL_DEFAULTS }}
      />

      <Folder name="Style-Preview">
        {/* 女孩独角兽风格 */}
        <Composition
          id="KidsBirthdayGirl"
          component={KidsBirthdayComposition}
          durationInFrames={2976}
          calculateMetadata={calculateMetadata}
          fps={24}
          width={720}
          height={1280}
          schema={KidsBirthdaySchema}
          defaultProps={{
            ...BASE_DEFAULTS,
            ...PANEL_DEFAULTS,
            name: '小美',
            age: 5,
            message: '小公主生日快乐！',
            subStyle: 'girl_unicorn' as const,
            dreams: ['artist', 'musician', 'teacher'],
          }}
        />

        {/* 男孩火箭风格 */}
        <Composition
          id="KidsBirthdayBoy"
          component={KidsBirthdayComposition}
          durationInFrames={2976}
          calculateMetadata={calculateMetadata}
          fps={24}
          width={720}
          height={1280}
          schema={KidsBirthdaySchema}
          defaultProps={{
            ...BASE_DEFAULTS,
            ...PANEL_DEFAULTS,
            name: '小强',
            age: 7,
            message: '小小男子汉生日快乐！',
            subStyle: 'boy_rocket' as const,
            dreams: ['astronaut', 'racer', 'scientist'],
          }}
        />
      </Folder>

      <Folder name="Landscape-Preview">
        <Composition
          id="KidsBirthdayLandscape"
          component={KidsBirthdayComposition}
          durationInFrames={2976}
          calculateMetadata={calculateMetadata}
          fps={24}
          width={1280}
          height={720}
          schema={KidsBirthdaySchema}
          defaultProps={{
            ...BASE_DEFAULTS,
            ...PANEL_DEFAULTS,
            orientation: 'landscape' as const,
            width: 1280,
            height: 720,
            nameFontSize: 100,
            blessingFontSize: 50,
          }}
        />
      </Folder>
    </Folder>
  );
};
