import React from "react";
import { Composition } from "remotion";
import { TextVectorComposition, TextVectorCompositionSchema } from "./TextVectorComposition";

// 混合输入默认参数
const defaultMixedInput = {
  contentType: "mixed" as const,
  images: [],
  blessingTypes: ["goldCoin", "moneyBag", "luckyBag", "redPacket"] as const,
  imageWeight: 0.5,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TextVector"
        component={TextVectorComposition}
        durationInFrames={480}
        fps={24}
        width={720}
        height={1280}
        schema={TextVectorCompositionSchema}
        defaultProps={{
          // 核心文字
          text: "祝福生日快乐",
          fontSize: 350,
          fontFamily: "Arial, sans-serif",
          fontWeight: 700,
          
          // 混合输入
          ...defaultMixedInput,
          words: ["福", "禄", "寿", "喜", "财", "运", "吉", "祥"],
          
          // 元素配置
          elementSize: 20,
          elementSpacing: 16,
          
          // 颜色配置
          textColor: "#FFD700",
          glowColor: "#FFD700",
          glowIntensity: 1.2,
          colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"],
          
          // 文字排列配置
          textOrientation: "horizontal",
          
          // 多字动画配置
          charAnimationMode: "together",
          charInterval: 60,
          charStayDuration: 120,
          
          // 动画配置
          entranceDuration: 12,
          fillDuration: 80,
          fillType: "sequential",
          stayAnimation: "pulse",
          pulseSpeed: 1.2,
          glowPulseSpeed: 0.8,
          floatAmplitude: 4,
          floatSpeed: 1,
          
          // 3D 效果
          enable3D: true,
          rotation3D: 10,
          
          // StarField
          enableStarField: true,
          starCount: 50,
          starOpacity: 0.35,
          
          // 背景
          backgroundType: "color",
          backgroundColor: "#0a0a1a",
          overlayColor: "#000000",
          overlayOpacity: 0.12,
          seed: 12345,
          
          // 水印配置
          watermarkEnabled: true,
          watermarkText: "© Remo-Fects",
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
