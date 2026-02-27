import React from "react";
import {
  AbsoluteFill,
  useVideoConfig,
  staticFile,
  Img,
} from "remotion";
import { Video } from "@remotion/media";
import { BackgroundType, BackgroundComponentProps } from "../schemas";

/**
 * 默认背景渐变
 */
const DEFAULT_GRADIENT = "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";

/**
 * 统一背景组件
 * 支持图片、视频、纯色、渐变四种背景类型
 * 
 * @example
 * // 使用纯色背景
 * <Background type="color" color="#1a1a2e" />
 * 
 * // 使用图片背景
 * <Background type="image" source="background.jpg" />
 * 
 * // 使用视频背景
 * <Background type="video" source="bg.mp4" videoLoop videoMuted />
 * 
 * // 使用渐变背景
 * <Background type="gradient" gradient="radial-gradient(circle, #1a1a2e, #000)" />
 */
export const Background: React.FC<BackgroundComponentProps> = ({
  type = "color",
  source,
  color = "#1a1a2e",
  gradient,
  videoLoop = true,
  videoMuted = true,
}) => {
  const { width, height } = useVideoConfig();

  // 纯色背景
  if (type === "color") {
    return <AbsoluteFill style={{ backgroundColor: color }} />;
  }

  // 渐变背景
  if (type === "gradient") {
    return (
      <AbsoluteFill
        style={{
          background: gradient || DEFAULT_GRADIENT,
        }}
      />
    );
  }

  // 图片背景
  if (type === "image" && source) {
    return (
      <AbsoluteFill>
        <Img 
          src={staticFile(source)} 
          style={{ width, height, objectFit: "cover" }} 
        />
      </AbsoluteFill>
    );
  }

  // 视频背景
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

  // 默认回退：渐变背景
  return (
    <AbsoluteFill
      style={{
        background: DEFAULT_GRADIENT,
      }}
    />
  );
};

export default Background;
