import React from "react";
import { TextRain, TextStyleConfig, ImageStyleConfig, RainContentType, TextDirection, FallDirection, BlessingStyleConfig } from "./TextRain";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import {
  BaseComposition,
  CompleteCompositionSchema,
  BlessingSymbolTypeSchema,
  extractRadialBurstProps,
  extractForegroundProps,
  extractWatermarkProps,
  extractMarqueeProps,
  mergeBlessingStyle,
} from "../../shared/index";

// ==================== 特有 Schema 定义 ====================

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

// 祝福图案样式 Schema
const BlessingStyleSchema = z.object({
  primaryColor: zColor().optional().meta({ description: "主颜色" }),
  secondaryColor: zColor().optional().meta({ description: "次颜色" }),
  enable3D: z.boolean().optional().meta({ description: "是否启用3D效果" }),
  enableGlow: z.boolean().optional().meta({ description: "是否启用发光效果" }),
  glowIntensity: z.number().min(0).max(2).optional().meta({ description: "发光强度" }),
  animated: z.boolean().optional().meta({ description: "是否启用动画" }),
});

// ==================== 主组件 Schema（使用公共 Schema）====================

export const TextRainCompositionSchema = CompleteCompositionSchema.extend({
  // 内容配置
  words: z.array(z.string()).optional().meta({ description: "要显示的文字列表" }),
  images: z.array(z.string()).optional().meta({ description: "图片路径列表（支持：public目录相对路径、网络URL、Data URL）" }),
  contentType: z.enum(["text", "image", "mixed", "blessing"]).meta({ description: "内容类型" }),
  imageWeight: z.number().min(0).max(1).optional().meta({ description: "图片出现权重 (mixed模式下)" }),
  
  // 祝福图案配置 (blessing 模式)
  blessingTypes: z.array(BlessingSymbolTypeSchema).optional().meta({ description: "祝福图案类型列表" }),
  blessingStyle: BlessingStyleSchema.optional().meta({ description: "祝福图案样式配置" }),
  
  // 文字排列方向
  textDirection: z.enum(["horizontal", "vertical"]).meta({ description: "文字排列方向：horizontal (从左到右) 或 vertical (从上到下)" }),
  
  // 运动方向
  fallDirection: z.enum(["down", "up"]).optional().meta({ description: "雨滴运动方向：down (从上到下，默认) 或 up (从下到上)" }),
  
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
});

export type TextRainCompositionProps = z.infer<typeof TextRainCompositionSchema>;

// ==================== 主组件 ====================

export const TextRainComposition: React.FC<TextRainCompositionProps> = ({
  words = [],
  images = [],
  contentType = "text",
  imageWeight = 0.5,
  textDirection = "horizontal",
  fallDirection = "down",
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
  blessingTypes,
  blessingStyle,
  // 公共参数（从 CompleteCompositionSchema 继承）
  backgroundType = "color",
  backgroundSource,
  backgroundColor = "#1a1a2e",
  backgroundVideoLoop = true,
  backgroundVideoMuted = true,
  overlayColor = "#000000",
  overlayOpacity = 0.2,
  audioEnabled = false,
  audioSource = "coin-sound.mp3",
  audioVolume = 0.5,
  audioLoop = true,
  ...props
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

  // 使用公共函数合并祝福图案样式
  const mergedBlessingStyle: BlessingStyleConfig = mergeBlessingStyle(blessingStyle);

  // 提取公共配置
  const watermarkConfig = extractWatermarkProps(props);
  const marqueeConfig = extractMarqueeProps(props);
  const radialBurstConfig = extractRadialBurstProps(props);
  const foregroundConfig = extractForegroundProps(props);

  return (
    <BaseComposition
      backgroundType={backgroundType}
      backgroundSource={backgroundSource}
      backgroundColor={backgroundColor}
      backgroundVideoLoop={backgroundVideoLoop}
      backgroundVideoMuted={backgroundVideoMuted}
      overlayColor={overlayColor}
      overlayOpacity={overlayOpacity}
      audioEnabled={audioEnabled}
      audioSource={audioSource}
      audioVolume={audioVolume}
      audioLoop={audioLoop}
      watermark={watermarkConfig}
      marquee={marqueeConfig}
      radialBurst={radialBurstConfig}
      foreground={foregroundConfig ?? undefined}
    >
      <TextRain
        words={words}
        images={images}
        contentType={contentType as RainContentType}
        imageWeight={imageWeight}
        blessingTypes={blessingTypes}
        blessingStyle={mergedBlessingStyle}
        textDirection={textDirection as TextDirection}
        fallDirection={(fallDirection ?? "down") as FallDirection}
        density={density}
        fallSpeed={fallSpeed}
        fontSizeRange={fontSizeRange as [number, number]}
        imageSizeRange={imageSizeRange as [number, number]}
        opacityRange={opacityRange as [number, number]}
        rotationRange={rotationRange as [number, number]}
        seed={seed}
        laneCount={laneCount}
        minVerticalGap={minVerticalGap}
        textStyle={defaultTextStyle}
        imageStyle={defaultImageStyle}
      />
    </BaseComposition>
  );
};

export default TextRainComposition;
