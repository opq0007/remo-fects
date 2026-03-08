import React from "react";
import { Composition } from "remotion";
import { TextVectorComposition, TextVectorCompositionSchema } from "./TextVectorComposition";

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
          contentType: "mixed",
          words: ["福", "禄", "寿", "喜", "财", "运", "吉", "祥"],
          images: [],
          blessingTypes: ["goldCoin", "moneyBag", "luckyBag", "redPacket", "star", "heart", "balloon"],
          imageWeight: 0.5,
          
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
          
          // 嵌套参数
          background: {
            type: "color",
            color: "#0a0a1a",
          },
          overlay: {
            color: "#000000",
            opacity: 0.12,
          },
          watermark: {
            enabled: true,
            text: "© Remo-Fects",
            fontSize: 24,
            color: "#ffffff",
            opacity: 0.35,
            speed: 1,
            intensity: 0.8,
          },
        }}
      />
    </>
  );
};