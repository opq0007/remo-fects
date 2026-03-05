import React from 'react';
import { Composition, Folder } from 'remotion';
import { KidsBirthdayComposition } from './compositions';
import { KidsBirthdaySchema } from './schemas';

/**
 * 儿童生日祝福视频生成器 v2.0
 * 
 * 支持模块化分镜系统：
 * - 60秒版本：A+B+C+D+E+F+G（适合短视频平台）
 * - 90秒版本：上述+H（适合分享给亲友）
 * - 120秒版本：全模块（完整祝福体验）
 * 
 * 支持角色系统：
 * - 生肖守护神系列（12生肖）
 * - 萌宠精灵系列（兔子、猫咪、小狗、熊、狐狸、熊猫）
 * - 勇气超人系列（超级英雄、宇航员、骑士、巫师、海盗）
 */
export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="儿童生日祝福">
      {/* ========== 时长版本 ========== */}
      <Folder name="时长版本">
        {/* 120秒完整版 */}
        <Composition
          id="KidsBirthday120s"
          component={KidsBirthdayComposition}
          durationInFrames={2880} // 120秒 @ 24fps
          fps={24}
          width={720}
          height={1280}
          schema={KidsBirthdaySchema}
          defaultProps={{
            name: '小明',
            age: 6,
            message: '愿你每天开心成长，梦想成真！',
            videoVersion: '120s',
            duration: 120,
            fps: 24,
            width: 720,
            height: 1280,
            subStyle: 'general',
            characterSeries: 'zodiac',
            characterType: 'tiger',
            photos: [],
            dreams: ['astronaut', 'artist', 'racer'],
            orientation: 'portrait',
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
        
        {/* 90秒版本 */}
        <Composition
          id="KidsBirthday90s"
          component={KidsBirthdayComposition}
          durationInFrames={2160} // 90秒 @ 24fps
          fps={24}
          width={720}
          height={1280}
          schema={KidsBirthdaySchema}
          defaultProps={{
            name: '小明',
            age: 6,
            message: '愿你每天开心成长！',
            videoVersion: '90s',
            duration: 90,
            fps: 24,
            width: 720,
            height: 1280,
            subStyle: 'general',
            characterSeries: 'zodiac',
            characterType: 'tiger',
            photos: [],
            dreams: ['astronaut', 'artist', 'racer'],
            orientation: 'portrait',
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
        
        {/* 60秒版本 */}
        <Composition
          id="KidsBirthday60s"
          component={KidsBirthdayComposition}
          durationInFrames={1440} // 60秒 @ 24fps
          fps={24}
          width={720}
          height={1280}
          schema={KidsBirthdaySchema}
          defaultProps={{
            name: '小明',
            age: 6,
            message: '生日快乐！',
            videoVersion: '60s',
            duration: 60,
            fps: 24,
            width: 720,
            height: 1280,
            subStyle: 'general',
            characterSeries: 'zodiac',
            characterType: 'tiger',
            photos: [],
            dreams: [],
            orientation: 'portrait',
            nameFontSize: 120,
            showAge: true,
            blessingText: '生日快乐',
            blessingFontSize: 60,
            confettiLevel: 'high',
            animationSpeed: 'normal',
            musicEnabled: true,
            musicTrack: 'JoyfulChildren',
            birthdaySongVolume: 0.6
          }}
        />
      </Folder>
      
      {/* ========== 风格模板 ========== */}
      <Folder name="风格模板">
        {/* 女孩独角兽风格 */}
        <Composition
          id="KidsBirthdayGirl"
          component={KidsBirthdayComposition}
          durationInFrames={2880}
          fps={24}
          width={720}
          height={1280}
          schema={KidsBirthdaySchema}
          defaultProps={{
            name: '小美',
            age: 5,
            message: '小公主生日快乐！',
            videoVersion: '120s',
            duration: 120,
            fps: 24,
            width: 720,
            height: 1280,
            subStyle: 'girl_unicorn',
            characterSeries: 'pet',
            characterType: 'bunny',
            photos: [],
            dreams: ['artist', 'musician', 'teacher'],
            orientation: 'portrait',
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
          durationInFrames={2880}
          fps={24}
          width={720}
          height={1280}
          schema={KidsBirthdaySchema}
          defaultProps={{
            name: '小强',
            age: 7,
            message: '小小男子汉生日快乐！',
            videoVersion: '120s',
            duration: 120,
            fps: 24,
            width: 720,
            height: 1280,
            subStyle: 'boy_rocket',
            characterSeries: 'hero',
            characterType: 'astronaut',
            photos: [],
            dreams: ['astronaut', 'racer', 'scientist'],
            orientation: 'portrait',
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
      
      {/* ========== 屏幕方向 ========== */}
      <Folder name="屏幕方向">
        {/* 横屏版本 */}
        <Composition
          id="KidsBirthdayLandscape"
          component={KidsBirthdayComposition}
          durationInFrames={2880}
          fps={24}
          width={1280}
          height={720}
          schema={KidsBirthdaySchema}
          defaultProps={{
            name: '小明',
            age: 6,
            message: '生日快乐！',
            videoVersion: '120s',
            duration: 120,
            fps: 24,
            width: 1280,
            height: 720,
            subStyle: 'general',
            characterSeries: 'zodiac',
            characterType: 'tiger',
            photos: [],
            dreams: ['astronaut', 'artist', 'racer'],
            orientation: 'landscape',
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