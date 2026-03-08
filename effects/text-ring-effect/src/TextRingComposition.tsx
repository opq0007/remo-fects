import React from "react";
import { TextRing } from "./TextRing";
import { z } from "zod";
import {
  BaseComposition,
  CenterGlow,
  CompleteCompositionSchema,
  MixedInputSchema,
  BlessingStyleSchema,
} from "../../shared/index";
import { MarqueeComponentProps } from "../../shared/schemas/marquee";

// ==================== 主组件 Schema（使用公共 Schema）====================

export const TextRingCompositionSchema = CompleteCompositionSchema.merge(MixedInputSchema).extend({
  // 特有参数
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
  verticalPosition: z.number().min(0).max(1).optional().meta({ description: "垂直位置: 0=顶部, 0.5=中心, 1=底部" }),
  
  // 尺寸配置
  imageSizeRange: z.tuple([z.number(), z.number()]).optional().meta({ description: "图片大小范围" }),
  blessingSizeRange: z.tuple([z.number(), z.number()]).optional().meta({ description: "祝福图案大小范围" }),
  
  // 文字样式
  textStyle: z.object({
    color: z.string().optional(),
    effect: z.enum(["gold3d", "glow", "shadow", "none"]).optional(),
    effectIntensity: z.number().min(0).max(2).optional(),
    fontWeight: z.number().min(100).max(900).optional(),
  }).optional().meta({ description: "文字样式配置" }),
  
  // 兼容旧参数：words 保持向后兼容
  words: z.array(z.string()).optional().meta({ description: "要显示的文字列表（兼容旧版本）" }),
});

export type TextRingCompositionProps = z.infer<typeof TextRingCompositionSchema>;

// ==================== 主组件 ====================

export const TextRingComposition: React.FC<TextRingCompositionProps> = ({
  // 嵌套参数
  background,
  overlay,
  audio,
  watermark,
  marquee,
  radialBurst,
  foreground,
  
  // 混合输入参数
  contentType = "text",
  words = [],
  images = [],
  blessingTypes = [],
  imageWeight = 0.5,
  blessingStyle = {},
  
  // 特有参数
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
  verticalPosition = 0.5,
  imageSizeRange = [50, 100],
  blessingSizeRange = [50, 80],
  textStyle,
}) => {
  return (
    <BaseComposition
      background={background}
      overlay={overlay}
      audio={audio}
      watermark={watermark}
      marquee={marquee as MarqueeComponentProps | undefined}
      radialBurst={radialBurst}
      foreground={foreground}
      extraLayers={<CenterGlow intensity={glowIntensity} />}
    >
      <TextRing
        contentType={contentType}
        words={words}
        images={images}
        blessingTypes={blessingTypes}
        imageWeight={imageWeight}
        blessingStyle={blessingStyle}
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
        verticalPosition={verticalPosition}
        imageSizeRange={imageSizeRange}
        blessingSizeRange={blessingSizeRange}
        textStyle={textStyle}
      />
    </BaseComposition>
  );
};
