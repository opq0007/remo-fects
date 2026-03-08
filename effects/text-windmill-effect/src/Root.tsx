import React from "react";
import { Composition } from "remotion";
import { TextWindmillComposition, TextWindmillCompositionSchema } from "./TextWindmillComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TextWindmill"
        component={TextWindmillComposition}
        durationInFrames={360}
        fps={24}
        width={720}
        height={1280}
        schema={TextWindmillCompositionSchema}
        defaultProps={{
          // 叶片数据（二维数组）- 4个叶片，每个叶片2-3个内容项
          bladesData: [
            [{ type: "text", content: "福" }, { type: "text", content: "运" }],
            [{ type: "text", content: "禄" }, { type: "text", content: "财" }],
            [{ type: "text", content: "寿" }, { type: "text", content: "喜" }],
            [{ type: "text", content: "吉" }, { type: "text", content: "祥" }],
          ],
          fontSize: 70,
          colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#DDA0DD"],
          glowColor: "#ffd700",
          glowIntensity: 1.2,
          rotationSpeed: 0.3,
          rotationDirection: "clockwise",
          centerOffsetY: 0,
          tiltAngle: 30,
          rotateY: 0,
          perspective: 1000,
          enableGlow: true,
          appearDuration: 30,
          
          // 嵌套参数
          background: {
            type: "color",
            color: "#0a0a1a",
          },
          overlay: {
            color: "#000000",
            opacity: 0.15,
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