/**
 * 文字龙卷风组合组件
 */

import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import {
  BaseComposition,
  CompleteCompositionSchema,
  MixedInputSchema,
  BlessingStyleSchema,
} from "../../shared/index";
import { TextTornado } from "./TextTornado";

// ==================== 特有 Schema 定义 ====================

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

// ==================== 主组件 Schema ====================

export const TextTornadoSchema = CompleteCompositionSchema.extend({
  // 混合输入配置
  ...MixedInputSchema.shape,
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
});

export type TextTornadoProps = z.infer<typeof TextTornadoSchema>;

// ==================== 主组件 ====================

export const TextTornadoComposition: React.FC<TextTornadoProps> = ({
  // 嵌套参数
  background,
  overlay,
  audio,
  watermark,
  marquee,
  radialBurst,
  foreground,
  
  // 混合输入配置
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
