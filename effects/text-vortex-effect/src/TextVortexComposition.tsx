/**
 * 文字旋涡组合组件
 */

import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import {
  BaseComposition,
  CompleteCompositionSchema,
  MixedInputSchema,
  BlessingStyleSchema,
  mergeBlessingStyle,
} from "../../shared/index";
import { TextVortex } from "./TextVortex";

// ==================== 特有 Schema 定义 ====================

/**
 * 旋转方向 Schema
 */
const RotationDirectionSchema = z.enum(["clockwise", "counterclockwise"]).meta({
  description: "旋转方向：clockwise(顺时针) | counterclockwise(逆时针)"
});

/**
 * 文字样式 Schema
 */
const TextStyleSchema = z.object({
  color: zColor().optional().meta({ description: "文字颜色" }),
  effect: z.enum(["none", "gold3d", "glow", "shadow", "neon"]).optional().meta({ description: "特效类型" }),
  effectIntensity: z.number().min(0).max(1).optional().meta({ description: "特效强度" }),
  fontWeight: z.number().min(100).max(900).optional().meta({ description: "字重" }),
});

// ==================== 主组件 Schema ====================

export const TextVortexSchema = CompleteCompositionSchema.extend({
  // 混合输入配置
  ...MixedInputSchema.shape,
  blessingStyle: BlessingStyleSchema.optional().meta({ description: "祝福图案样式配置" }),

  // 旋涡配置
  particleCount: z.number().min(20).max(200).step(5).meta({ description: "粒子数量" }),
  ringCount: z.number().min(2).max(12).step(1).meta({ description: "环的数量" }),
  rotationDirection: RotationDirectionSchema,
  rotationSpeed: z.number().min(0.5).max(4).step(0.1).meta({ description: "旋转速度" }),
  expansionDuration: z.number().min(2).max(15).step(0.5).meta({ description: "散开动画时长（秒）" }),
  initialRadius: z.number().min(10).max(100).step(5).meta({ description: "初始中心半径" }),
  maxRadius: z.number().min(150).max(500).step(10).meta({ description: "最大扩散半径" }),

  // 3D效果配置
  depth3D: z.boolean().optional().meta({ description: "是否启用3D效果" }),
  depthIntensity: z.number().min(0).max(1).step(0.1).optional().meta({ description: "3D深度强度" }),
  perspective: z.number().min(400).max(2000).step(100).optional().meta({ description: "透视距离" }),

  // 尺寸配置
  fontSizeRange: z.tuple([z.number().step(5), z.number().step(5)]).meta({ description: "字体大小范围" }),
  imageSizeRange: z.tuple([z.number().step(5), z.number().step(5)]).meta({ description: "图片大小范围" }),
  blessingSizeRange: z.tuple([z.number().step(5), z.number().step(5)]).meta({ description: "祝福图案大小范围" }),

  // 动画配置
  entranceDuration: z.number().min(10).max(60).step(5).meta({ description: "入场动画时长（帧）" }),
  fadeInEnabled: z.boolean().optional().meta({ description: "是否启用淡入效果" }),
  spiralTightness: z.number().min(0.5).max(2).step(0.1).meta({ description: "螺旋紧密程度" }),
  pulseEnabled: z.boolean().optional().meta({ description: "是否启用脉冲效果" }),
  pulseIntensity: z.number().min(0).max(0.5).step(0.05).optional().meta({ description: "脉冲强度" }),

  // 震撼效果
  shockwaveEnabled: z.boolean().optional().meta({ description: "是否启用冲击波" }),
  shockwaveTiming: z.number().min(1).max(10).step(0.5).optional().meta({ description: "冲击波触发时机（秒）" }),
  suctionEffect: z.boolean().optional().meta({ description: "是否启用吸入效果" }),
  suctionIntensity: z.number().min(0).max(1).step(0.1).optional().meta({ description: "吸入效果强度" }),

  // 样式配置
  textStyle: TextStyleSchema.optional().meta({ description: "文字样式配置" }),

  // 随机种子
  seed: z.number().optional().meta({ description: "随机种子" }),
});

export type TextVortexProps = z.infer<typeof TextVortexSchema>;

// ==================== 主组件 ====================

export const TextVortexComposition: React.FC<TextVortexProps> = ({
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
  
  // 旋涡配置
  particleCount = 80,
  ringCount = 6,
  rotationDirection = "clockwise",
  rotationSpeed = 1.5,
  expansionDuration = 6,
  initialRadius = 30,
  maxRadius = 350,
  
  // 3D效果
  depth3D = true,
  depthIntensity = 0.4,
  perspective = 800,
  
  // 尺寸配置
  fontSizeRange = [30, 70],
  imageSizeRange = [40, 90],
  blessingSizeRange = [30, 70],
  
  // 动画配置
  entranceDuration = 25,
  fadeInEnabled = true,
  spiralTightness = 1.2,
  pulseEnabled = true,
  pulseIntensity = 0.15,
  
  // 震撼效果
  shockwaveEnabled = true,
  shockwaveTiming = 3,
  suctionEffect = true,
  suctionIntensity = 0.3,
  
  // 样式配置
  textStyle,
  seed,
}) => {
  // 默认文字样式（保持原有类型兼容性）
  const defaultTextStyle = {
    color: "#FFD700",
    effect: "gold3d" as const,
    effectIntensity: 0.9,
    fontWeight: 700,
    ...textStyle,
  };

  // 使用公共函数合并祝福图案样式
  const mergedBlessingStyle = mergeBlessingStyle(blessingStyle);

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
      <TextVortex
        contentType={contentType}
        words={words}
        images={images}
        imageWeight={imageWeight}
        blessingTypes={blessingTypes as any}
        blessingStyle={mergedBlessingStyle}
        particleCount={particleCount}
        ringCount={ringCount}
        rotationDirection={rotationDirection}
        rotationSpeed={rotationSpeed}
        expansionDuration={expansionDuration}
        initialRadius={initialRadius}
        maxRadius={maxRadius}
        depth3D={depth3D}
        depthIntensity={depthIntensity}
        perspective={perspective}
        fontSizeRange={fontSizeRange as [number, number]}
        imageSizeRange={imageSizeRange as [number, number]}
        blessingSizeRange={blessingSizeRange as [number, number]}
        entranceDuration={entranceDuration}
        fadeInEnabled={fadeInEnabled}
        spiralTightness={spiralTightness}
        pulseEnabled={pulseEnabled}
        pulseIntensity={pulseIntensity}
        shockwaveEnabled={shockwaveEnabled}
        shockwaveTiming={shockwaveTiming}
        suctionEffect={suctionEffect}
        suctionIntensity={suctionIntensity}
        textStyle={defaultTextStyle}
        seed={seed}
      />
    </BaseComposition>
  );
};