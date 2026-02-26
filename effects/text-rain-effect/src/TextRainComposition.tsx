import React from "react";
import {
  AbsoluteFill,
  useVideoConfig,
  staticFile,
  Audio,
} from "remotion";
import { Img } from "remotion";
import { Video } from "@remotion/media";
import { TextRain, TextStyleConfig, ImageStyleConfig, RainContentType, TextDirection } from "./TextRain";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// ==================== Schema 定义 ====================

const GradientSchema = z.object({
  type: z.enum(["linear", "radial"]).meta({ description: "渐变类型" }),
  colors: z.array(z.string()).meta({ description: "渐变颜色数组" }),
  angle: z.number().optional().meta({ description: "线性渐变角度 (度)" }),
  positions: z.array(z.number()).optional().meta({ description: "颜色位置 (0-1)" }),
});

const TextStyleSchema = z.object({
  color: zColor().optional().meta({ description: "文字颜色" }),
  gradient: GradientSchema.optional().meta({ description: "渐变色配置" }),
  fontFamily: z.string().optional().meta({ description: "字体" }),
  fontWeight: z.number().min(100).max(900).optional().meta({ description: "字重" }),
  letterSpacing: z.number().optional().meta({ description: "字间距 (像素)" }),
  effect: z.enum([
    "none", "3d", "gold3d", "shadow", "emboss", 
    "neon", "metallic", "retro", "glow", "outline"
  ]).optional().meta({ description: "文字特效类型" }),
  effectIntensity: z.number().min(0).max(1).optional().meta({ description: "特效强度" }),
  shadowColor: zColor().optional().meta({ description: "阴影颜色" }),
  shadowBlur: z.number().optional().meta({ description: "阴影模糊" }),
  shadowOffset: z.tuple([z.number(), z.number()]).optional().meta({ description: "阴影偏移" }),
  strokeColor: zColor().optional().meta({ description: "描边颜色" }),
  strokeWidth: z.number().optional().meta({ description: "描边宽度" }),
});

// 图片样式 Schema
const ImageStyleSchema = z.object({
  scale: z.number().optional().meta({ description: "基础缩放" }),
  scaleRange: z.tuple([z.number(), z.number()]).optional().meta({ description: "随机缩放范围" }),
  swing: z.boolean().optional().meta({ description: "是否摇摆" }),
  swingAngle: z.number().optional().meta({ description: "摇摆角度" }),
  swingSpeed: z.number().optional().meta({ description: "摇摆速度" }),
  spin: z.boolean().optional().meta({ description: "是否旋转" }),
  spinSpeed: z.number().optional().meta({ description: "旋转速度 (圈/秒)" }),
  glow: z.boolean().optional().meta({ description: "是否发光" }),
  glowColor: zColor().optional().meta({ description: "发光颜色" }),
  glowIntensity: z.number().min(0).max(1).optional().meta({ description: "发光强度" }),
  shadow: z.boolean().optional().meta({ description: "是否阴影" }),
  shadowColor: zColor().optional().meta({ description: "阴影颜色" }),
  shadowBlur: z.number().optional().meta({ description: "阴影模糊" }),
  shadowOffset: z.tuple([z.number(), z.number()]).optional().meta({ description: "阴影偏移" }),
  tint: zColor().optional().meta({ description: "着色" }),
  brightness: z.number().optional().meta({ description: "亮度 (0-2)" }),
  saturate: z.number().optional().meta({ description: "饱和度 (0-2)" }),
});

// 音频配置 Schema
const AudioSchema = z.object({
  enabled: z.boolean().optional().meta({ description: "是否启用音效" }),
  src: z.string().optional().meta({ description: "音效文件路径 (相对于public目录)" }),
  volume: z.number().min(0).max(2).optional().meta({ description: "音量 (0-2, 1为正常)" }),
  loop: z.boolean().optional().meta({ description: "是否循环播放" }),
});

// 主组件 Schema
export const TextRainCompositionSchema = z.object({
  // 内容配置
  words: z.array(z.string()).optional().meta({ description: "要显示的文字列表" }),
  images: z.array(z.string()).optional().meta({ description: "PNG图片路径列表 (相对于public目录)" }),
  contentType: z.enum(["text", "image", "mixed"]).meta({ description: "内容类型" }),
  imageWeight: z.number().min(0).max(1).optional().meta({ description: "图片出现权重 (mixed模式下)" }),
  
  // 文字排列方向
  textDirection: z.enum(["horizontal", "vertical"]).meta({ description: "文字排列方向：horizontal (从左到右) 或 vertical (从上到下)" }),
  
  // 雨滴配置
  density: z.number().min(1).max(20).meta({ description: "雨滴密度" }),
  fallSpeed: z.number().min(0.1).max(2).meta({ description: "下落速度系数" }),
  fontSizeRange: z.tuple([z.number(), z.number()]).meta({ description: "字体大小范围" }),
  imageSizeRange: z.tuple([z.number(), z.number()]).meta({ description: "图片大小范围" }),
  opacityRange: z.tuple([z.number(), z.number()]).meta({ description: "透明度范围" }),
  rotationRange: z.tuple([z.number(), z.number()]).meta({ description: "旋转角度范围" }),
  seed: z.number().meta({ description: "随机种子" }),
  
  // 防重叠配置
  laneCount: z.number().min(4).max(24).meta({ description: "列道数量" }),
  minVerticalGap: z.number().min(20).max(300).meta({ description: "最小垂直间距" }),

  // 样式配置
  textStyle: TextStyleSchema.optional().meta({ description: "文字样式配置" }),
  imageStyle: ImageStyleSchema.optional().meta({ description: "图片样式配置" }),

  // 音效配置
  audio: AudioSchema.optional().meta({ description: "音效配置" }),

  // 背景配置
  backgroundType: z.enum(["image", "video", "color"]).meta({ description: "背景类型" }),
  backgroundSource: z.string().optional().meta({ description: "背景文件路径" }),
  backgroundColor: zColor().optional().meta({ description: "背景颜色" }),
  backgroundVideoLoop: z.boolean().optional().meta({ description: "背景视频是否循环" }),
  backgroundVideoMuted: z.boolean().optional().meta({ description: "背景视频是否静音" }),

  // 遮罩效果
  overlayColor: zColor().optional().meta({ description: "遮罩颜色" }),
  overlayOpacity: z.number().min(0).max(1).optional().meta({ description: "遮罩透明度" }),
});

export type TextRainCompositionProps = z.infer<typeof TextRainCompositionSchema>;

// ==================== 子组件 ====================

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
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
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

// ==================== 主组件 ====================

export const TextRainComposition: React.FC<TextRainCompositionProps> = ({
  words = [],
  images = [],
  contentType = "text",
  imageWeight = 0.5,
  textDirection = "horizontal",
  density = 2,
  fallSpeed = 0.2,
  fontSizeRange = [72, 140],
  imageSizeRange = [80, 180],
  opacityRange = [0.6, 1],
  rotationRange = [-10, 10],
  seed = 42,
  laneCount = 8,
  minVerticalGap = 140,
  textStyle,
  imageStyle,
  audio,
  backgroundType = "color",
  backgroundSource,
  backgroundColor = "#1a1a2e",
  backgroundVideoLoop = true,
  backgroundVideoMuted = true,
  overlayColor = "#000000",
  overlayOpacity = 0.2,
}) => {
  const defaultTextStyle: TextStyleConfig = {
    color: "#ffd700",
    effect: "gold3d",
    effectIntensity: 0.8,
    fontWeight: 700,
    fontFamily: "PingFang SC, Microsoft YaHei, SimHei, sans-serif",
    letterSpacing: 2,
    ...textStyle,
  };

  const defaultImageStyle: ImageStyleConfig = {
    glow: true,
    glowColor: "#ffd700",
    glowIntensity: 0.6,
    shadow: true,
    shadowBlur: 15,
    swing: true,
    swingAngle: 10,
    swingSpeed: 2,
    ...imageStyle,
  };

  // 默认音频配置
  const audioEnabled = audio?.enabled !== false;
  const audioSrc = audio?.src ?? "coin-sound.mp3";
  const audioVolume = audio?.volume ?? 0.5;
  const audioLoop = audio?.loop ?? true;

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

      <TextRain
        words={words}
        images={images}
        contentType={contentType}
        imageWeight={imageWeight}
        textDirection={textDirection}
        density={density}
        fallSpeed={fallSpeed}
        fontSizeRange={fontSizeRange}
        imageSizeRange={imageSizeRange}
        opacityRange={opacityRange}
        rotationRange={rotationRange}
        seed={seed}
        laneCount={laneCount}
        minVerticalGap={minVerticalGap}
        textStyle={defaultTextStyle}
        imageStyle={defaultImageStyle}
      />

      {/* 默认金钱入账音效 */}
      {audioEnabled && (
        <Audio
          src={staticFile(audioSrc)}
          volume={audioVolume}
          loop={audioLoop}
        />
      )}
    </AbsoluteFill>
  );
};