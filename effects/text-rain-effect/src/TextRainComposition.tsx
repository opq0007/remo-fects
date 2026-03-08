import React from "react";
import { TextRain, TextStyleConfig, ImageStyleConfig, RainContentType, TextDirection, FallDirection, BlessingStyleConfig } from "./TextRain";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import {
  BaseComposition,
  BlessingSymbolTypeSchema,
  RadialBurstComponentProps,
  ForegroundComponentProps,
  mergeBlessingStyle,
  NestedBackgroundProps,
  NestedOverlayProps,
  NestedAudioProps,
  WatermarkComponentProps,
  MarqueeComponentProps,
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

const BlessingStyleSchema = z.object({
  primaryColor: zColor().optional().meta({ description: "主颜色" }),
  secondaryColor: zColor().optional().meta({ description: "次颜色" }),
  enable3D: z.boolean().optional().meta({ description: "是否启用3D效果" }),
  enableGlow: z.boolean().optional().meta({ description: "是否启用发光效果" }),
  glowIntensity: z.number().min(0).max(2).optional().meta({ description: "发光强度" }),
  animated: z.boolean().optional().meta({ description: "是否启用动画" }),
});

// ==================== 主组件 Schema ====================

export const TextRainCompositionSchema = z.object({
  // 内容配置
  words: z.array(z.string()).optional().meta({ description: "要显示的文字列表" }),
  images: z.array(z.string()).optional().meta({ description: "图片路径列表" }),
  contentType: z.enum(["text", "image", "mixed", "blessing"]).meta({ description: "内容类型" }),
  imageWeight: z.number().min(0).max(1).optional().meta({ description: "图片出现权重" }),
  blessingTypes: z.array(BlessingSymbolTypeSchema).optional().meta({ description: "祝福图案类型列表" }),
  blessingStyle: BlessingStyleSchema.optional().meta({ description: "祝福图案样式配置" }),
  
  // 文字排列方向
  textDirection: z.enum(["horizontal", "vertical"]).meta({ description: "文字排列方向" }),
  fallDirection: z.enum(["down", "up"]).optional().meta({ description: "雨滴运动方向" }),
  
  // 雨滴配置
  density: z.number().min(1).max(20).meta({ description: "雨滴密度" }),
  fallSpeed: z.number().min(0.1).max(2).meta({ description: "下落速度系数" }),
  fontSizeRange: z.tuple([z.number(), z.number()]).meta({ description: "字体大小范围" }),
  imageSizeRange: z.tuple([z.number(), z.number()]).meta({ description: "图片大小范围" }),
  opacityRange: z.tuple([z.number(), z.number()]).meta({ description: "透明度范围" }),
  rotationRange: z.tuple([z.number(), z.number()]).meta({ description: "旋转角度范围" }),
  seed: z.number().meta({ description: "随机种子" }),
  laneCount: z.number().min(4).max(24).meta({ description: "列道数量" }),
  minVerticalGap: z.number().min(20).max(300).meta({ description: "最小垂直间距" }),

  // 样式配置
  textStyle: TextStyleSchema.optional().meta({ description: "文字样式配置" }),
  imageStyle: ImageStyleSchema.optional().meta({ description: "图片样式配置" }),
  
  // 公共嵌套配置
  background: z.object({
    type: z.enum(["image", "video", "color", "gradient"]).optional(),
    source: z.string().optional(),
    color: zColor().optional(),
    gradient: z.string().optional(),
    videoLoop: z.boolean().optional(),
    videoMuted: z.boolean().optional(),
  }).optional(),
  
  overlay: z.object({
    color: z.string().optional(),
    opacity: z.number().min(0).max(1).optional(),
  }).optional(),
  
  audio: z.object({
    enabled: z.boolean().optional(),
    source: z.string().optional(),
    volume: z.number().min(0).max(1).optional(),
    loop: z.boolean().optional(),
  }).optional(),
  
  watermark: z.object({
    enabled: z.boolean().optional(),
    text: z.string().optional(),
    fontSize: z.number().optional(),
    color: z.string().optional(),
    opacity: z.number().optional(),
    effect: z.enum(["bounce"]).optional(),
    speed: z.number().optional(),
    intensity: z.number().optional(),
  }).optional(),
  
  marquee: z.object({
    enabled: z.boolean().optional(),
    foregroundTexts: z.array(z.string()).optional(),
    foregroundFontSize: z.number().optional(),
    foregroundOpacity: z.number().optional(),
    foregroundColor: z.string().optional(),
    backgroundTexts: z.array(z.string()).optional(),
    backgroundFontSize: z.number().optional(),
    backgroundOpacity: z.number().optional(),
    backgroundColor: z.string().optional(),
    orientation: z.enum(["horizontal", "vertical"]).optional(),
    direction: z.enum(["left-to-right", "right-to-left", "top-to-bottom", "bottom-to-top"]).optional(),
    speed: z.number().optional(),
  }).optional(),
  
  radialBurst: z.object({
    enabled: z.boolean().optional(),
    effectType: z.enum(["buddhaLight", "goldenRays", "meteorShower", "sparkleBurst"]).optional(),
    color: z.string().optional(),
    secondaryColor: z.string().optional(),
    intensity: z.number().optional(),
    verticalOffset: z.number().optional(),
    count: z.number().optional(),
    speed: z.number().optional(),
    opacity: z.number().optional(),
  }).optional(),
  
  foreground: z.object({
    enabled: z.boolean().optional(),
    type: z.enum(["image", "video"]).optional(),
    source: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    verticalOffset: z.number().optional(),
    horizontalOffset: z.number().optional(),
    scale: z.number().optional(),
    opacity: z.number().optional(),
  }).optional(),
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
  // 嵌套参数
  background,
  overlay,
  audio,
  watermark,
  marquee,
  radialBurst,
  foreground,
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

  const mergedBlessingStyle: BlessingStyleConfig = mergeBlessingStyle(blessingStyle);

  // 构建嵌套参数对象（带默认值）
  const backgroundConfig: NestedBackgroundProps = {
    type: background?.type ?? "color",
    source: background?.source,
    color: background?.color ?? "#1a1a2e",
    gradient: background?.gradient,
    videoLoop: background?.videoLoop ?? true,
    videoMuted: background?.videoMuted ?? true,
  };

  const overlayConfig: NestedOverlayProps = {
    color: overlay?.color ?? "#000000",
    opacity: overlay?.opacity ?? 0.2,
  };

  const audioConfig: NestedAudioProps = {
    enabled: audio?.enabled ?? false,
    source: audio?.source ?? "coin-sound.mp3",
    volume: audio?.volume ?? 0.5,
    loop: audio?.loop ?? true,
  };

  const watermarkConfig: WatermarkComponentProps | undefined = watermark?.enabled
    ? {
        enabled: true,
        text: watermark.text ?? "© Remo-Fects",
        fontSize: watermark.fontSize ?? 24,
        color: watermark.color ?? "#ffffff",
        opacity: watermark.opacity ?? 0.35,
        effect: watermark.effect,
        speed: watermark.speed ?? 1,
        intensity: watermark.intensity ?? 0.8,
      }
    : undefined;

  const marqueeConfig: MarqueeComponentProps | undefined = marquee?.enabled
    ? {
        enabled: true,
        foreground: marquee.foregroundTexts?.length
          ? {
              texts: marquee.foregroundTexts.map((text) => ({ text })),
              fontSize: marquee.foregroundFontSize ?? 48,
              opacity: marquee.foregroundOpacity ?? 1,
              textStyle: { color: marquee.foregroundColor ?? "#ffd700" },
            }
          : undefined,
        background: marquee.backgroundTexts?.length
          ? {
              texts: marquee.backgroundTexts.map((text) => ({ text })),
              fontSize: marquee.backgroundFontSize ?? 24,
              opacity: marquee.backgroundOpacity ?? 0.6,
              textStyle: { color: marquee.backgroundColor ?? "#ffaa00" },
            }
          : undefined,
        orientation: marquee.orientation ?? "horizontal",
        direction: marquee.direction ?? "right-to-left",
        speed: marquee.speed ?? 100,
      }
    : undefined;

  const radialBurstConfig: RadialBurstComponentProps | undefined = radialBurst?.enabled
    ? {
        enabled: true,
        effectType: radialBurst.effectType,
        color: radialBurst.color,
        secondaryColor: radialBurst.secondaryColor,
        intensity: radialBurst.intensity,
        verticalOffset: radialBurst.verticalOffset,
        count: radialBurst.count,
        speed: radialBurst.speed,
        opacity: radialBurst.opacity,
      }
    : undefined;

  const foregroundConfig: ForegroundComponentProps | undefined = foreground?.enabled
    ? {
        enabled: true,
        type: foreground.type ?? "image",
        source: foreground.source ?? "",
        width: foreground.width,
        height: foreground.height,
        verticalOffset: foreground.verticalOffset,
        horizontalOffset: foreground.horizontalOffset,
        scale: foreground.scale,
        opacity: foreground.opacity,
      }
    : undefined;

  return (
    <BaseComposition
      background={backgroundConfig}
      overlay={overlayConfig}
      audio={audioConfig}
      watermark={watermarkConfig}
      marquee={marqueeConfig}
      radialBurst={radialBurstConfig}
      foreground={foregroundConfig}
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
