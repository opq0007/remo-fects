import React from "react";
import { Composition } from "remotion";
import { TextBreakthroughComposition, TextBreakthroughCompositionSchema } from "./TextBreakthroughComposition";
import { BlessingSymbolType } from "../../shared/index";

// 混合输入默认参数
const defaultMixedInput = {
  contentType: "mixed" as const,
  words: ["平安喜乐", "健康成长"],
  images: [] as string[],
  blessingTypes: ["goldCoin", "moneyBag", "luckyBag", "redPacket", "star", "heart", "balloon"] as BlessingSymbolType[],
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

          // 嵌套参数
          background: {
            type: "image",
            source: "财神2.png",
          },
          overlay: {
            color: "#000000",
            opacity: 0.1,
          },
          audio: {
            enabled: true,
            source: "coin-sound.mp3",
            volume: 0.5,
          },
          watermark: {
            enabled: true,
            text: "水印测试",
            fontSize: 24,
            color: "#ffffff",
            opacity: 0.35,
            speed: 1,
            intensity: 0.8,
          },
          radialBurst: {
            enabled: true,
            effectType: "goldenRays",
            color: "#FFD700",
            secondaryColor: "#FFA500",
            intensity: 1.2,
            verticalOffset: 0.5,
            count: 12,
            speed: 1,
            opacity: 0.8,
            rotate: true,
            rotationSpeed: 0.5,
          },
        }}
      />
    </>
  );
};