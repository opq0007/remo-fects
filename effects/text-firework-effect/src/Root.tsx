import React from "react";
import { Composition } from "remotion";
import { TextFireworkComposition, TextFireworkCompositionSchema } from "./TextFireworkComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TextFirework"
        component={TextFireworkComposition}
        durationInFrames={300}
        fps={24}
        width={720}
        height={1280}
        schema={TextFireworkCompositionSchema}
        defaultProps={{
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
        }}
      />
    </>
  );
};