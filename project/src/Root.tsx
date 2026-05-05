import React from 'react';
import { Composition, Folder } from 'remotion';
import { KidsBirthdayComposition } from './compositions';
import { KidsBirthdaySchema } from './schemas';

/**
 * 儿童生日祝福视频生成器 v3.0
 * 
 * 固定 124 秒版本（4秒倒计时 + 120秒正片）
 * 
 * 支持角色系统：
 * - 生肖守护神系列（12生肖）
 * - 萌宠精灵系列（兔子、猫咪、小狗、熊、狐狸、熊猫）
 * - 勇气超人系列（超级英雄、宇航员、骑士、巫师、海盗）
 * - 自定义图片系列（支持本地图片或网络图片）
 */
export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="KidsBirthday">
      <Composition
        id="KidsBirthday"
        component={KidsBirthdayComposition}
        durationInFrames={2976} // 124秒 @ 24fps
        fps={24}
        width={720}
        height={1280}
        schema={KidsBirthdaySchema}
        defaultProps={{
          name: '小明',
          age: 6,
          message: '愿你每天开心成长，梦想成真！',
          duration: 124,
          fps: 24,
          width: 720,
          height: 1280,
          subStyle: 'general',
          photos: [{"src":"熊猫.png"}],
          dreams: ['astronaut', 'artist', 'racer'],
          orientation: 'portrait',
          blessingSeries: 'journey_to_the_west',
          nameFontSize: 120,
          showAge: true,
          blessingText: '生日快乐',
          blessingFontSize: 60,
          confettiLevel: 'high',
          animationSpeed: 'normal',
          musicEnabled: true,
          musicTrack: 'JoyfulChildren',
          birthdaySongSource: 'birthday_audio.mp3',
          birthdaySongVolume: 0.6,
          // 走马灯测试配置（添加 positionY 参数）
          marquee: {
            enabled: true,
            positionY: 0.85,  // 新增：垂直位置（0-1）
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
            direction: 'left-to-right',
            speed: 50,
          },
          // 水印测试配置
          watermark: {
            enabled: true,
            text: 'Remo-Fects',
            fontSize: 20,
            opacity: 0.5,
          },
          // 径向发散粒子测试配置
          radialBurst: {
            enabled: true,
            effectType: 'sparkleBurst',
            color: '#FFD76A',
            secondaryColor: '#7EC8FF',
            intensity: 0.8,
          },
        }}
      />

      <Folder name="Portrait-Preview">
        {/* 通用风格 */}
        <Composition
          id="KidsBirthdayPortrait"
          component={KidsBirthdayComposition}
          durationInFrames={2976} // 124秒 @ 24fps
          fps={24}
          width={720}
          height={1280}
          schema={KidsBirthdaySchema}
          defaultProps={{
            name: '小明',
            age: 6,
            message: '愿你每天开心成长，梦想成真！',
            duration: 124,
            fps: 24,
            width: 720,
            height: 1280,
            subStyle: 'general',
            photos: [{"src":"熊猫.png"}],
            dreams: ['astronaut', 'artist', 'racer'],
            orientation: 'portrait',
            blessingSeries: 'journey_to_the_west',
            nameFontSize: 120,
            showAge: true,
            blessingText: '生日快乐',
            blessingFontSize: 60,
            confettiLevel: 'high',
            animationSpeed: 'normal',
            musicEnabled: true,
            musicTrack: 'JoyfulChildren',
            birthdaySongSource: 'birthday_audio.mp3',
            birthdaySongVolume: 0.6,
            // 走马灯测试配置（添加 positionY 参数）
            marquee: {
              enabled: true,
              positionY: 0.85,  // 新增：垂直位置（0-1）
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
              direction: 'left-to-right',
              speed: 50,
            },
            // 水印测试配置
            watermark: {
              enabled: true,
              text: 'Remo-Fects',
              fontSize: 20,
              opacity: 0.5,
            },
            // 径向发散粒子测试配置
            radialBurst: {
              enabled: true,
              effectType: 'sparkleBurst',
              color: '#FFD76A',
              secondaryColor: '#7EC8FF',
              intensity: 0.8,
            },
          }}
        />
        
        {/* 女孩独角兽风格 */}
        <Composition
          id="KidsBirthdayGirl"
          component={KidsBirthdayComposition}
          durationInFrames={2976}
          fps={24}
          width={720}
          height={1280}
          schema={KidsBirthdaySchema}
          defaultProps={{
            name: '小美',
            age: 5,
            message: '小公主生日快乐！',
            duration: 124,
            fps: 24,
            width: 720,
            height: 1280,
            subStyle: 'girl_unicorn',
            photos: [{"src":"熊猫.png"}],
            dreams: ['artist', 'musician', 'teacher'],
            orientation: 'portrait',
            blessingSeries: 'journey_to_the_west',
            nameFontSize: 120,
            showAge: true,
            blessingText: '生日快乐',
            blessingFontSize: 60,
            confettiLevel: 'high',
            animationSpeed: 'normal',
            musicEnabled: true,
            musicTrack: 'JoyfulChildren',
            birthdaySongSource: 'birthday_audio.mp3',
            birthdaySongVolume: 0.6
          }}
        />
        
        {/* 男孩火箭风格 */}
        <Composition
          id="KidsBirthdayBoy"
          component={KidsBirthdayComposition}
          durationInFrames={2976}
          fps={24}
          width={720}
          height={1280}
          schema={KidsBirthdaySchema}
          defaultProps={{
            name: '小强',
            age: 7,
            message: '小小男子汉生日快乐！',
            duration: 124,
            fps: 24,
            width: 720,
            height: 1280,
            subStyle: 'boy_rocket',
            photos: [{"src":"熊猫.png"}],
            dreams: ['astronaut', 'racer', 'scientist'],
            orientation: 'portrait',
            blessingSeries: 'journey_to_the_west',
            nameFontSize: 120,
            showAge: true,
            blessingText: '生日快乐',
            blessingFontSize: 60,
            confettiLevel: 'high',
            animationSpeed: 'normal',
            musicEnabled: true,
            musicTrack: 'JoyfulChildren',
            birthdaySongSource: 'birthday_audio.mp3',
            birthdaySongVolume: 0.6
          }}
        />
      </Folder>

      <Folder name="Landscape-Preview">
        <Composition
          id="KidsBirthdayLandscape"
          component={KidsBirthdayComposition}
          durationInFrames={2976}
          fps={24}
          width={1280}
          height={720}
          schema={KidsBirthdaySchema}
          defaultProps={{
            name: '小明',
            age: 6,
            message: '生日快乐！',
            duration: 124,
            fps: 24,
            width: 1280,
            height: 720,
            subStyle: 'general',
            photos: [{"src":"熊猫.png"}],
            dreams: ['astronaut', 'artist', 'racer'],
            orientation: 'landscape',
            blessingSeries: 'journey_to_the_west',
            nameFontSize: 100,
            showAge: true,
            blessingText: '生日快乐',
            blessingFontSize: 50,
            confettiLevel: 'high',
            animationSpeed: 'normal',
            musicEnabled: true,
            musicTrack: 'JoyfulChildren',
            birthdaySongSource: 'birthday_audio.mp3',
            birthdaySongVolume: 0.6
          }}
        />
      </Folder>
    </Folder>
  );
};