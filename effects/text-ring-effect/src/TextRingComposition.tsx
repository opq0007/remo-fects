import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TextRing } from "./TextRing";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import {
  Background,
  Overlay,
  CenterGlow,
  BackgroundType,
  FullBackgroundSchema,
  OverlaySchema,
  AudioSchema,
} from "../../shared/index";

// ==================== 主组件 Schema（使用公共 Schema）====================

export const TextRingCompositionSchema = z.object({
  // 特有参数
  words: z.array(z.string()).meta({ description: "要显示的文字列表" }),
  fontSize: z.number().min(20).max(200).meta({ description: "字体大小" }),
  opacity: z.number().min(0).max(1).meta({ description: "透明度" }),
  ringRadius: z.number().min(100).max(600).meta({ description: "环绕半径" }),
  rotationSpeed: z.number().min(0.1).max(3).meta({ description: "旋转速度" }),
  seed: z.number().meta({ description: "随机种子" }),
  glowIntensity: z.number().min(0).max(2).meta({ description: "发光强度" }),
  depth3d: z.number().min(1).max(15).meta({ description: "3D深度层数" }),
  cylinderHeight: z.number().min(100).max(1000).meta({ description: "圆柱体高度" }),
  perspective: z.number().min(500).max(2000).meta({ description: "透视距离" }),
  mode: z.enum(["vertical", "positions"]).meta({ description: "显示模式: vertical-垂直排列模式, positions-方位模式" }),
  verticalPosition: z.number().min(0).max(1).optional().meta({ description: "垂直位置: 0=顶部, 0.5=中心, 1=底部" }),

  // 背景配置（使用公共 Schema，包含视频选项）
  ...FullBackgroundSchema.shape,
  
  // 遮罩效果（使用公共 Schema）
  ...OverlaySchema.shape,

  // 音效配置（使用公共 Schema）
  ...AudioSchema.shape,
});

export type TextRingCompositionProps = z.infer<typeof TextRingCompositionSchema>;

// ==================== 主组件 ====================

export const TextRingComposition: React.FC<TextRingCompositionProps> = ({
  words = [],
  fontSize = 60,
  opacity = 1,
  ringRadius = 250,
  rotationSpeed = 1,
  seed = 42,
  glowIntensity = 0.8,
  depth3d = 8,
  cylinderHeight = 400,
  perspective = 1000,
  mode = "vertical",
  verticalPosition = 0.5,
  backgroundType = "color",
  backgroundSource,
  backgroundColor = "#1a0a00",
  backgroundVideoLoop = true,
  backgroundVideoMuted = true,
  overlayColor = "#000000",
  overlayOpacity = 0.2,
  audioEnabled = false,
  audioSource = "coin-sound.mp3",
  audioVolume = 0.5,
  audioLoop = true,
}) => {
  return (
    <AbsoluteFill>
      <Background
        type={backgroundType as BackgroundType}
        source={backgroundSource}
        color={backgroundColor}
        videoLoop={backgroundVideoLoop}
        videoMuted={backgroundVideoMuted}
      />

      {overlayOpacity > 0 && (
        <Overlay color={overlayColor} opacity={overlayOpacity} />
      )}

      <CenterGlow intensity={glowIntensity} />

      <TextRing
        words={words}
        fontSize={fontSize}
        opacity={opacity}
        ringRadius={ringRadius}
        rotationSpeed={rotationSpeed}
        seed={seed}
        glowIntensity={glowIntensity}
        depth3d={depth3d}
        cylinderHeight={cylinderHeight}
        perspective={perspective}
        mode={mode}
        verticalPosition={verticalPosition}
      />

      {audioEnabled && (
        <Audio
          src={staticFile(audioSource)}
          volume={audioVolume}
          loop={audioLoop}
        />
      )}
    </AbsoluteFill>
  );
};
