import React from "react";
import { Composition } from "remotion";
import { TextBreakthroughComposition, TextBreakthroughCompositionSchema } from "./TextBreakthroughComposition";
import { BlessingSymbolType } from "../../shared/index";

// 混合输入默认参数
const defaultMixedInput = {
  contentType: "mixed" as const,
  words: ["平安喜乐", "健康成长"],
  images: [] as string[],
  blessingTypes: ["goldCoin", "moneyBag", "luckyBag", "redPacket"] as BlessingSymbolType[],
  imageWeight: 0.3,
  blessingStyle: {
    primaryColor: "#FFD700",
    secondaryColor: "#FFA500",
    enable3D: true,
    enableGlow: true,
    glowIntensity: 1.5,
  },
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TextBreakthrough"
        component={TextBreakthroughComposition}
        durationInFrames={480}
        fps={24}
        width={1080}
        height={1920}
        schema={TextBreakthroughCompositionSchema}
        defaultProps={{
          ...defaultMixedInput,

          // 字体配置
          fontSize: 120,
          fontFamily: "PingFang SC, Microsoft YaHei, SimHei, sans-serif",
          fontWeight: 900,

          // 烫金色3D立体发光效果
          textColor: "#ffd700",
          glowColor: "#ffaa00",
          secondaryGlowColor: "#ff6600",
          glowIntensity: 1.5,
          bevelDepth: 3,

          // 图片/祝福图案大小
          imageSize: 150,
          blessingSize: 120,

          // 3D透视参数
          startZ: 2000,
          endZ: -100,

          // 动画时长
          approachDuration: 45,
          breakthroughDuration: 20,
          holdDuration: 40,

          // 冲击效果
          impactScale: 1.4,
          impactRotation: 12,
          shakeIntensity: 10,

          // 内容间隔
          contentInterval: 50,

          // 运动方向
          direction: "top-down",

          // 排列方式
          arrangement: "circular",
          arrangementSpacing: 0.25,

          // Y轴中心偏移（-0.5到0.5，0为画面中心）
          centerY: 0,

          // 循环播放
          enableLoop: true,

          // 下落消失
          enableFallDown: true,
          fallDownDuration: 40,
          fallDownEndY: 0.2,

          // 背景
          backgroundType: "image",
          backgroundSource: "财神2.png",

          // 遮罩
          overlayColor: "#000000",
          overlayOpacity: 0.1,

          // 音效配置
          audioEnabled: true,
          audioSource: "coin-sound.mp3",
          audioVolume: 0.5,

          // 水印配置
          watermarkEnabled: true,
          watermarkText: "水印测试",
          watermarkFontSize: 24,
          watermarkColor: "#ffffff",
          watermarkOpacity: 0.35,
          watermarkSpeed: 1,
          watermarkIntensity: 0.8,
          watermarkVelocityX: 180,
          watermarkVelocityY: 120,
        }}
      />
    </>
  );
};
