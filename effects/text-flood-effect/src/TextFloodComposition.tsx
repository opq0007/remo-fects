/**
 * 文字洪水组合组件
 * 
 * 集成 BaseComposition、水印、走马灯等公共功能
 */

import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import {
  BaseComposition,
  CompleteCompositionSchema,
  MixedInputSchema,
  BlessingStyleSchema,
  MixedImageStyleSchema,
  mergeBlessingStyle,
} from "../../shared/index";
import {
  TextFlood,
  TextFloodProps,
  FloodDirection,
  FloodWaveConfig,
  FloodImpactConfig,
} from "./TextFlood";

// ==================== 特有 Schema 定义 ====================

const FloodDirectionSchema = z.enum(["toward", "away"]).meta({
  description: "洪水方向：toward(从远到近，冲击感) | away(从近到远，退去感)",
});

const WaveConfigSchema = z.object({
  waveSpeed: z.number().min(0.1).max(5).optional().meta({ description: "波浪速度" }),
  waveAmplitude: z.number().min(0).max(200).optional().meta({ description: "波浪振幅" }),
  waveFrequency: z.number().min(0.1).max(10).optional().meta({ description: "波浪频率" }),
});

const ImpactConfigSchema = z.object({
  impactStart: z.number().min(0).max(1).optional().meta({ description: "冲击效果开始时间（比例）" }),
  impactScale: z.number().min(1).max(5).optional().meta({ description: "冲击放大倍数" }),
  impactBlur: z.number().min(0).max(20).optional().meta({ description: "冲击模糊强度" }),
  impactShake: z.number().min(0).max(50).optional().meta({ description: "冲击震动幅度" }),
});

const TextStyleSchema = z.object({
  color: zColor().optional().meta({ description: "文字颜色" }),
  effect: z.enum([
    "none", "shadow", "gold3d", "emboss",
    "neon", "glow", "outline"
  ]).optional().meta({ description: "文字特效类型" }),
  effectIntensity: z.number().min(0).max(2).optional().meta({ description: "特效强度" }),
  fontWeight: z.number().min(100).max(900).optional().meta({ description: "字重" }),
  fontFamily: z.string().optional().meta({ description: "字体" }),
});

// ==================== 主组件 Schema ====================

export const TextFloodCompositionSchema = CompleteCompositionSchema.extend({
  // 混合输入配置
  ...MixedInputSchema.shape,
  blessingStyle: BlessingStyleSchema.optional().meta({ description: "祝福图案样式配置" }),

  // 洪水参数
  particleCount: z.number().min(10).max(200).meta({ description: "粒子数量" }),
  waveCount: z.number().min(1).max(10).meta({ description: "波浪层数" }),
  direction: FloodDirectionSchema,

  // 波浪配置
  waveConfig: WaveConfigSchema.optional().meta({ description: "波浪配置" }),

  // 冲击效果配置
  impactConfig: ImpactConfigSchema.optional().meta({ description: "冲击效果配置" }),

  // 尺寸范围
  fontSizeRange: z.tuple([z.number(), z.number()]).meta({ description: "字体大小范围" }),
  imageSizeRange: z.tuple([z.number(), z.number()]).meta({ description: "图片大小范围" }),
  blessingSizeRange: z.tuple([z.number(), z.number()]).optional().meta({ description: "祝福图案大小范围" }),

  // 透明度范围
  opacityRange: z.tuple([z.number(), z.number()]).meta({ description: "透明度范围" }),

  // 样式配置
  textStyle: TextStyleSchema.optional().meta({ description: "文字样式配置" }),
  imageStyle: MixedImageStyleSchema.optional().meta({ description: "图片样式配置" }),

  // 视觉效果
  enablePerspective: z.boolean().optional().meta({ description: "是否启用3D透视效果" }),
  perspectiveStrength: z.number().min(100).max(2000).optional().meta({ description: "透视强度" }),
  enableWaveBackground: z.boolean().optional().meta({ description: "是否启用波浪背景" }),
  waveBackgroundColor: zColor().optional().meta({ description: "波浪背景颜色" }),
  waveBackgroundOpacity: z.number().min(0).max(1).optional().meta({ description: "波浪背景透明度" }),

  // 随机种子
  seed: z.number().meta({ description: "随机种子" }),
});

export type TextFloodCompositionProps = z.infer<typeof TextFloodCompositionSchema>;

// ==================== 主组件 ====================

export const TextFloodComposition: React.FC<TextFloodCompositionProps> = ({
  // 嵌套参数
  background,
  overlay,
  audio,
  watermark,
  marquee,
  radialBurst,
  foreground,
  
  // 混合输入配置
  words = [],
  images = [],
  contentType = "text",
  imageWeight = 0.5,
  particleCount = 80,
  waveCount = 5,
  direction = "toward",
  waveConfig,
  impactConfig,
  fontSizeRange = [50, 100],
  imageSizeRange = [60, 120],
  blessingSizeRange = [60, 120],
  opacityRange = [0.7, 1],
  textStyle,
  imageStyle,
  blessingTypes,
  blessingStyle,
  enablePerspective = true,
  perspectiveStrength = 800,
  enableWaveBackground = true,
  waveBackgroundColor = "#1a4a7a",
  waveBackgroundOpacity = 0.3,
  seed = 42,
}) => {
  // 默认文字样式
  const defaultTextStyle = {
    color: "#00d4ff",
    effect: "glow" as const,
    effectIntensity: 1,
    fontWeight: 800,
    fontFamily: "PingFang SC, Microsoft YaHei, SimHei, sans-serif",
    ...textStyle,
  };

  // 默认图片样式
  const defaultImageStyle = {
    glow: true,
    glowColor: "#00d4ff",
    glowIntensity: 0.8,
    shadow: true,
    shadowBlur: 20,
    ...imageStyle,
  };

  // 使用公共函数合并祝福图案样式
  const mergedBlessingStyle = mergeBlessingStyle({
    primaryColor: "#00d4ff",
    secondaryColor: "#0088cc",
    enable3D: true,
    enableGlow: true,
    glowIntensity: 1.2,
    ...blessingStyle,
  });

  return (
    <BaseComposition
      background={background}
      overlay={overlay}
      audio={audio}
      watermark={watermark}
      marquee={marquee}
      radialBurst={radialBurst}
      foreground={foreground}
    >
      <TextFlood
        words={words}
        images={images}
        blessingTypes={blessingTypes}
        contentType={contentType}
        imageWeight={imageWeight}
        particleCount={particleCount}
        waveCount={waveCount}
        direction={direction}
        waveConfig={waveConfig}
        impactConfig={impactConfig}
        fontSizeRange={fontSizeRange}
        imageSizeRange={imageSizeRange}
        blessingSizeRange={blessingSizeRange}
        opacityRange={opacityRange}
        textStyle={defaultTextStyle}
        imageStyle={defaultImageStyle}
        blessingStyle={mergedBlessingStyle}
        enablePerspective={enablePerspective}
        perspectiveStrength={perspectiveStrength}
        enableWaveBackground={enableWaveBackground}
        waveBackgroundColor={waveBackgroundColor}
        waveBackgroundOpacity={waveBackgroundOpacity}
        seed={seed}
      />
    </BaseComposition>
  );
};

export default TextFloodComposition;