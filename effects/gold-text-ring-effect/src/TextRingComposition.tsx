import React from "react";
import {
  AbsoluteFill,
  useVideoConfig,
  staticFile,
  Img,
} from "remotion";
import { Video } from "@remotion/media";
import { TextRing } from "./TextRing";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const TextRingCompositionSchema = z.object({
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
  backgroundType: z.enum(["image", "video", "color"]).meta({ description: "背景类型" }),
  backgroundSource: z.string().optional().meta({ description: "背景文件路径" }),
  backgroundColor: zColor().optional().meta({ description: "背景颜色" }),
  backgroundVideoLoop: z.boolean().optional().meta({ description: "背景视频是否循环" }),
  backgroundVideoMuted: z.boolean().optional().meta({ description: "背景视频是否静音" }),
  overlayColor: zColor().optional().meta({ description: "遮罩颜色" }),
  overlayOpacity: z.number().min(0).max(1).optional().meta({ description: "遮罩透明度" }),
});

export type TextRingCompositionProps = z.infer<typeof TextRingCompositionSchema>;

const Background: React.FC<{
  type: "image" | "video" | "color";
  source?: string;
  color?: string;
  videoLoop?: boolean;
  videoMuted?: boolean;
}> = ({ type, source, color, videoLoop = true, videoMuted = true }) => {
  const { width, height } = useVideoConfig();

  if (type === "color") {
    return <AbsoluteFill style={{ backgroundColor: color || "#1a1a2e" }} />;
  }

  if (type === "image" && source) {
    return (
      <AbsoluteFill>
        <Img src={staticFile(source)} style={{ width, height, objectFit: "cover" }} />
      </AbsoluteFill>
    );
  }

  if (type === "video" && source) {
    return (
      <AbsoluteFill>
        <Video
          src={staticFile(source)}
          style={{ width, height, objectFit: "cover" }}
          loop={videoLoop}
          muted={videoMuted}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at center, #2d1f14 0%, #1a0a00 50%, #0d0500 100%)",
      }}
    />
  );
};

const Overlay: React.FC<{ color?: string; opacity?: number }> = ({
  color = "#000000",
  opacity = 0.3,
}) => {
  return <AbsoluteFill style={{ backgroundColor: color, opacity }} />;
};

const CenterGlow: React.FC<{ intensity: number }> = ({ intensity }) => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at center, rgba(255, 215, 0, ${intensity * 0.3}) 0%, rgba(255, 200, 50, ${intensity * 0.1}) 30%, transparent 70%)`,
        pointerEvents: "none",
      }}
    />
  );
};

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
  backgroundType = "color",
  backgroundSource,
  backgroundColor = "#1a0a00",
  backgroundVideoLoop = true,
  backgroundVideoMuted = true,
  overlayColor = "#000000",
  overlayOpacity = 0.2,
}) => {
  return (
    <AbsoluteFill>
      <Background
        type={backgroundType}
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
      />
    </AbsoluteFill>
  );
};