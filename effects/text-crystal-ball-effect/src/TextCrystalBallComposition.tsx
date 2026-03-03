/**
 * 文字水晶球特效组合组件
 * 
 * 支持文字、图片、祝福图案混合输入，附着在立体水晶球表面旋转
 */

import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import {
  BaseComposition,
  FullBackgroundSchema,
  OverlaySchema,
  NestedAudioSchema,
  BlessingSymbolTypeSchema,
  RadialBurstSchema,
  extractRadialBurstProps,
} from "../../shared/index";
import { CrystalBall } from "./CrystalBall";

// ==================== 特有 Schema 定义 ====================

/**
 * 内容类型 Schema
 */
const ContentTypeSchema = z.enum(["text", "image", "blessing", "mixed"]).meta({
  description: "内容类型",
});

/**
 * 文字样式 Schema
 */
const TextStyleSchema = z.object({
  color: zColor().optional().meta({ description: "文字颜色" }),
  effect: z.enum(["none", "gold3d", "glow", "shadow"]).optional().meta({ description: "特效类型" }),
  effectIntensity: z.number().min(0).max(1).optional().meta({ description: "特效强度" }),
  fontWeight: z.number().min(100).max(900).optional().meta({ description: "字重" }),
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

export const TextCrystalBallSchema = z.object({
  // 内容配置
  contentType: ContentTypeSchema,
  words: z.array(z.string()).optional().meta({ description: "文字列表" }),
  images: z.array(z.string()).optional().meta({ description: "图片路径列表（支持：public目录相对路径、网络URL、Data URL）" }),
  imageWeight: z.number().min(0).max(1).optional().meta({ description: "图片出现权重" }),
  blessingTypes: z.array(BlessingSymbolTypeSchema).optional().meta({ description: "祝福图案类型列表" }),
  blessingStyle: BlessingStyleSchema.optional().meta({ description: "祝福图案样式配置" }),

  // 水晶球配置
  ballRadius: z.number().min(50).max(400).step(10).meta({ description: "水晶球半径" }),
  ballColor: zColor().optional().meta({ description: "水晶球颜色" }),
  ballOpacity: z.number().min(0).max(1).step(0.05).optional().meta({ description: "水晶球透明度" }),
  glowColor: zColor().optional().meta({ description: "发光颜色" }),
  glowIntensity: z.number().min(0).max(2).step(0.1).meta({ description: "发光强度" }),

  // 位置配置
  verticalOffset: z.number().min(0).max(1).step(0.05).meta({ description: "垂直偏移（0=顶部，0.5=居中，1=底部）" }),

  // 旋转动画配置
  rotationSpeedX: z.number().min(0).max(2).step(0.05).optional().meta({ description: "X轴旋转速度" }),
  rotationSpeedY: z.number().min(0).max(2).step(0.05).meta({ description: "Y轴旋转速度" }),
  rotationSpeedZ: z.number().min(0).max(2).step(0.05).optional().meta({ description: "Z轴旋转速度" }),
  autoRotate: z.boolean().optional().meta({ description: "是否自动旋转" }),

  // 镜头推进配置
  zoomEnabled: z.boolean().optional().meta({ description: "是否启用镜头推进效果" }),
  zoomProgress: z.number().min(0).max(1).step(0.05).optional().meta({ description: "镜头推进进度（0=正常，1=最近）" }),

  // 内容配置
  particleCount: z.number().min(10).max(100).step(5).meta({ description: "粒子数量" }),
  fontSizeRange: z.tuple([z.number().step(5), z.number().step(5)]).meta({ description: "字体大小范围" }),
  imageSizeRange: z.tuple([z.number().step(5), z.number().step(5)]).meta({ description: "图片大小范围" }),
  blessingSizeRange: z.tuple([z.number().step(5), z.number().step(5)]).meta({ description: "祝福图案大小范围" }),

  // 样式配置
  textStyle: TextStyleSchema.optional().meta({ description: "文字样式配置" }),

  // 透视配置
  perspective: z.number().min(200).max(2000).step(50).optional().meta({ description: "透视距离" }),

  // 入场动画
  entranceDuration: z.number().min(10).max(60).step(5).optional().meta({ description: "入场动画时长（帧）" }),

  // 随机种子
  seed: z.number().optional().meta({ description: "随机种子" }),

  // 音效配置
  audio: NestedAudioSchema.optional().meta({ description: "音效配置" }),

  // 背景配置
  ...FullBackgroundSchema.shape,

  // 遮罩效果
  ...OverlaySchema.shape,

  // 发散粒子效果配置
  ...RadialBurstSchema.shape,
});

export type TextCrystalBallProps = z.infer<typeof TextCrystalBallSchema>;

// ==================== 主组件 ====================

export const TextCrystalBallComposition: React.FC<TextCrystalBallProps> = ({
  // 内容配置
  contentType = "text",
  words = [],
  images = [],
  imageWeight = 0.5,
  blessingTypes = [],
  blessingStyle,
  // 水晶球配置
  ballRadius = 200,
  ballColor = "#4169E1",
  ballOpacity = 0.3,
  glowColor = "#87CEEB",
  glowIntensity = 1,
  // 位置配置
  verticalOffset = 0.5,
  // 旋转动画配置
  rotationSpeedX = 0.2,
  rotationSpeedY = 0.5,
  rotationSpeedZ = 0.1,
  autoRotate = true,
  // 镜头推进配置
  zoomEnabled = false,
  zoomProgress = 0,
  // 内容配置
  particleCount = 30,
  fontSizeRange = [30, 60],
  imageSizeRange = [40, 80],
  blessingSizeRange = [35, 70],
  // 样式配置
  textStyle,
  // 透视配置
  perspective = 1000,
  // 入场动画
  entranceDuration = 30,
  // 随机种子
  seed,
  // 音频参数
  audio,
  // 背景参数
  backgroundType = "color",
  backgroundColor = "#0a0a30",
  backgroundSource,
  backgroundVideoLoop = true,
  backgroundVideoMuted = true,
  // 遮罩参数
  overlayColor = "#000000",
  overlayOpacity = 0.2,
  // 发散粒子效果参数
  radialBurstEnabled,
  radialBurstEffectType,
  radialBurstColor,
  radialBurstSecondaryColor,
  radialBurstIntensity,
  radialBurstVerticalOffset,
  radialBurstCount,
  radialBurstSpeed,
  radialBurstOpacity,
  radialBurstSeed,
  radialBurstRotate,
  radialBurstRotationSpeed,
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

  // 提取发散粒子效果参数
  const radialBurstConfig = extractRadialBurstProps({
    radialBurstEnabled,
    radialBurstEffectType,
    radialBurstColor,
    radialBurstSecondaryColor,
    radialBurstIntensity,
    radialBurstVerticalOffset,
    radialBurstCount,
    radialBurstSpeed,
    radialBurstOpacity,
    radialBurstSeed,
    radialBurstRotate,
    radialBurstRotationSpeed,
  });

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
      radialBurst={radialBurstConfig}
    >
      <CrystalBall
        contentType={contentType}
        words={words}
        images={images}
        imageWeight={imageWeight}
        blessingTypes={blessingTypes as any}
        blessingStyle={defaultBlessingStyle}
        ballRadius={ballRadius}
        ballColor={ballColor}
        ballOpacity={ballOpacity}
        glowColor={glowColor}
        glowIntensity={glowIntensity}
        verticalOffset={verticalOffset}
        rotationSpeedX={rotationSpeedX}
        rotationSpeedY={rotationSpeedY}
        rotationSpeedZ={rotationSpeedZ}
        autoRotate={autoRotate}
        zoomEnabled={zoomEnabled}
        zoomProgress={zoomProgress}
        particleCount={particleCount}
        fontSizeRange={fontSizeRange as [number, number]}
        imageSizeRange={imageSizeRange as [number, number]}
        blessingSizeRange={blessingSizeRange as [number, number]}
        textStyle={defaultTextStyle}
        perspective={perspective}
        entranceDuration={entranceDuration}
        seed={seed ?? Date.now()}
      />
    </BaseComposition>
  );
};