import React from "react";
import { Composition } from "remotion";
import { TextKaleidoscopeComposition, TextKaleidoscopeCompositionSchema } from "./TextKaleidoscopeComposition";

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
        id="TextKaleidoscope"
        component={TextKaleidoscopeComposition}
        durationInFrames={360}
        fps={24}
        width={720}
        height={1280}
        schema={TextKaleidoscopeCompositionSchema}
        defaultProps={{
          ...defaultMixedInput,
          words: ["福", "禄", "寿", "喜", "财", "运"],
          // 中心焦点文字（不配置则不渲染）
          focusWords: ["福", "财"],
          fontSize: 60,
          focusFontSize: 140,
          colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"],
          glowColor: "#ffd700",
          glowIntensity: 1.2,
          itemCount: 60,
          ringCount: 5,
          rotationSpeed: 0.3,
          expansionDuration: 120,
          fadeInDuration: 60,
          enableCenterBurst: true,
          burstParticleCount: 20,
          burstInterval: 60,
          focusTextInterval: 90,
          focusTextDuration: 60,
          enable3D: true,
          enablePulse: true,
          backgroundType: "color",
          backgroundColor: "#0a0a1a",
          overlayColor: "#000000",
          overlayOpacity: 0.15,
          
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