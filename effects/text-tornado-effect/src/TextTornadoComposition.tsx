import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { BaseComposition, FullBackgroundSchema, OverlaySchema, NestedAudioSchema, BlessingSymbolTypeSchema } from "../../shared/index";
import { TextTornado } from "./TextTornado";

// ==================== 特有 Schema 定义 ====================

/**
 * 内容类型 Schema
 */
const ContentTypeSchema = z.enum(["text", "image", "blessing", "mixed"]).meta({ 
  description: "内容类型" 
});

/**
 * 文字样式 Schema
 */
const TextStyleSchema = z.object({
  color: zColor().optional().meta({ description: "文字颜色" }),
  effect: z.enum(["none", "gold3d", "glow", "shadow"]).optional().meta({ description: "特效类型" }),
  effectIntensity: z.number().min(0).max(1).optional().meta({ description: "特效强度" }),
  fontWeight: z.number().min(100).max(900).optional().meta({ description: "字重" }),
  letterSpacing: z.number().optional().meta({ description: "字间距" }),
});

/**
 * 祝福图案样式 Schema
 */
const BlessingStyleSchema = z.object({
  primaryColor: zColor().optional().meta({ description: "主颜色" }),
  secondaryColor: zColor().optional().meta({ description: "次颜色" }),
  enable3D: z.boolean().optional().meta({ description: "是否启用3D效果" }),
  enableGlow: z.boolean().optional().meta({ description: "是否启用发光效果" }),
  glowIntensity: z.number().min(0).max(2).optional().meta({ description: "发光强度" }),
});

// ==================== 主组件 Schema ====================

export const TextTornadoSchema = z.object({
  // 内容配置
  contentType: ContentTypeSchema,
  words: z.array(z.string()).optional().meta({ description: "文字列表" }),
  images: z.array(z.string()).optional().meta({ description: "图片路径列表（支持：public目录相对路径、网络URL、Data URL）" }),
  imageWeight: z.number().min(0).max(1).optional().meta({ description: "图片出现权重" }),
  blessingTypes: z.array(BlessingSymbolTypeSchema).optional().meta({ description: "祝福图案类型列表" }),
  blessingStyle: BlessingStyleSchema.optional().meta({ description: "祝福图案样式配置" }),

  // 龙卷风配置
  particleCount: z.number().min(10).max(200).step(5).meta({ description: "粒子数量" }),
  baseRadius: z.number().min(50).max(500).step(10).meta({ description: "底部半径" }),
  topRadius: z.number().min(10).max(200).step(5).meta({ description: "顶部半径" }),
  rotationSpeed: z.number().min(0.5).max(5).step(0.1).meta({ description: "旋转速度" }),
  liftSpeed: z.number().min(0).max(1).step(0.05).meta({ description: "上升速度" }),
  funnelHeight: z.number().min(0.3).max(1).step(0.05).meta({ description: "漏斗高度比例" }),

  // 尺寸配置
  fontSizeRange: z.tuple([z.number().step(5), z.number().step(5)]).meta({ description: "字体大小范围" }),
  imageSizeRange: z.tuple([z.number().step(5), z.number().step(5)]).meta({ description: "图片大小范围" }),
  blessingSizeRange: z.tuple([z.number().step(5), z.number().step(5)]).meta({ description: "祝福图案大小范围" }),

  // 动画配置
  zoomIntensity: z.number().min(0).max(2).step(0.1).meta({ description: "镜头拉近强度" }),
  entranceDuration: z.number().min(10).max(60).step(5).meta({ description: "入场动画时长（帧）" }),
  swirlIntensity: z.number().min(0.5).max(2).step(0.1).meta({ description: "螺旋强度" }),

  // 样式配置
  textStyle: TextStyleSchema.optional().meta({ description: "文字样式配置" }),

  // 随机种子
  seed: z.number().optional().meta({ description: "随机种子" }),

  // 音效配置
  audio: NestedAudioSchema.optional().meta({ description: "音效配置" }),

  // 背景配置
  ...FullBackgroundSchema.shape,

  // 遮罩效果
  ...OverlaySchema.shape,
});

export type TextTornadoProps = z.infer<typeof TextTornadoSchema>;

// ==================== 主组件 ====================

export const TextTornadoComposition: React.FC<TextTornadoProps> = ({
  // 内容配置
  contentType = "text",
  words = [],
  images = [],
  imageWeight = 0.5,
  blessingTypes = [],
  blessingStyle,
  // 龙卷风配置
  particleCount = 60,
  baseRadius = 300,
  topRadius = 50,
  rotationSpeed = 2,
  liftSpeed = 0.3,
  funnelHeight = 0.85,
  // 尺寸配置
  fontSizeRange = [40, 80],
  imageSizeRange = [50, 100],
  blessingSizeRange = [40, 80],
  // 动画配置
  zoomIntensity = 0.5,
  entranceDuration = 30,
  swirlIntensity = 1,
  // 样式配置
  textStyle,
  seed,
  // 音频参数
  audio,
  // 背景参数
  backgroundType = "color",
  backgroundColor = "#0a0a20",
  backgroundSource,
  backgroundVideoLoop = true,
  backgroundVideoMuted = true,
  // 遮罩参数
  overlayColor = "#000000",
  overlayOpacity = 0.2,
}) => {
  // 默认文字样式
  const defaultTextStyle = {
    color: "#FFD700",
    effect: "gold3d" as const,
    effectIntensity: 0.9,
    fontWeight: 700,
    ...textStyle,
  };

  // 默认祝福图案样式
  const defaultBlessingStyle = {
    primaryColor: "#FFD700",
    secondaryColor: "#FFA500",
    enable3D: true,
    enableGlow: true,
    glowIntensity: 1,
    ...blessingStyle,
  };

  // 从嵌套 audio 对象提取扁平化参数
  const audioEnabled = audio?.enabled !== false;
  const audioSource = audio?.src ?? audio?.source ?? "coin-sound.mp3";
  const audioVolume = audio?.volume ?? 0.5;
  const audioLoop = audio?.loop ?? true;

  return (
    <BaseComposition
      backgroundType={backgroundType}
      backgroundColor={backgroundColor}
      backgroundSource={backgroundSource}
      backgroundVideoLoop={backgroundVideoLoop}
      backgroundVideoMuted={backgroundVideoMuted}
      overlayColor={overlayColor}
      overlayOpacity={overlayOpacity}
      audioEnabled={audioEnabled}
      audioSource={audioSource}
      audioVolume={audioVolume}
      audioLoop={audioLoop}
    >
      <TextTornado
        contentType={contentType}
        words={words}
        images={images}
        imageWeight={imageWeight}
        blessingTypes={blessingTypes as any}
        blessingStyle={defaultBlessingStyle}
        particleCount={particleCount}
        baseRadius={baseRadius}
        topRadius={topRadius}
        rotationSpeed={rotationSpeed}
        liftSpeed={liftSpeed}
        funnelHeight={funnelHeight}
        fontSizeRange={fontSizeRange as [number, number]}
        imageSizeRange={imageSizeRange as [number, number]}
        blessingSizeRange={blessingSizeRange as [number, number]}
        zoomIntensity={zoomIntensity}
        entranceDuration={entranceDuration}
        swirlIntensity={swirlIntensity}
        textStyle={defaultTextStyle}
        seed={seed}
      />
    </BaseComposition>
  );
};