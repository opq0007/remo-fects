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
          
          // 嵌套参数
          background: {
            type: "color",
            color: "#0a0a20",
          },
          overlay: {
            color: "#000000",
            opacity: 0.2,
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
