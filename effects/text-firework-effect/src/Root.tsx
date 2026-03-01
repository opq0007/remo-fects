import React from "react";
import { Composition } from "remotion";
import { TextFireworkComposition, TextFireworkCompositionSchema } from "./TextFireworkComposition";

// 混合输入默认参数
const defaultMixedInput = {
  contentType: "text" as const,
  images: [],
  blessingTypes: [],
  imageWeight: 0.5,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TextFirework"
        component={TextFireworkComposition}
        durationInFrames={480}
        fps={24}
        width={720}
        height={1280}
        schema={TextFireworkCompositionSchema}
        defaultProps={{
          ...defaultMixedInput,
          words: ["新年快乐", "万事如意", "心想事成"],
          fontSize: 60,
          textColor: "#ffd700",
          glowColor: "#ffaa00",
          glowIntensity: 1,
          launchHeight: 0.2,
          particleCount: 80,
          textDuration: 60,
          rainDuration: 120,
          gravity: 0.15,
          wind: 0.1,
          rainParticleSize: 3,
          interval: 40,
          backgroundType: "color",
          backgroundColor: "#0a0a20",
          overlayColor: "#000000",
          overlayOpacity: 0.2,

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