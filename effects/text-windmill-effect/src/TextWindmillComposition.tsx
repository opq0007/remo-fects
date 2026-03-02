import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import {
  BaseComposition,
  StarField,
  CompleteCompositionSchema,
  BlessingSymbolType,
} from "../../shared/index";
import { Windmill, BladesData } from "./Windmill";
import { BladeContentType } from "./WindmillBlade";

// ==================== Schema 定义 ====================

/**
 * 叶片内容项 Schema
 */
const BladeContentItemSchema = z.object({
  type: z.enum(["text", "image", "blessing"]),
  content: z.string(),
});

/**
 * 叶片数据 Schema（二维数组）
 */
const BladesDataSchema = z.array(z.array(BladeContentItemSchema));

/**
 * 祝福图案样式 Schema
 */
const BlessingStyleSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  enable3D: z.boolean().optional(),
  enableGlow: z.boolean().optional(),
  glowIntensity: z.number().min(0).max(3).optional(),
});

/**
 * 主组件 Schema
 */
export const TextWindmillCompositionSchema = CompleteCompositionSchema.extend({
  // 叶片数据（二维数组）
  bladesData: BladesDataSchema.optional().meta({ description: "叶片数据（二维数组），每个第一维是一个叶片，每个第二维是叶片内的内容项" }),
  
  // 简化的文字输入（兼容模式）
  words: z.array(z.string()).optional().meta({ description: "文字列表（简化模式，自动生成叶片）" }),
  
  // 字体配置
  fontSize: z.number().min(20).max(300).meta({ description: "基础字体大小" }),
  
  // 颜色配置
  colors: z.array(zColor()).optional().meta({ description: "叶片颜色列表（循环使用）" }),
  glowColor: zColor().meta({ description: "发光颜色" }),
  glowIntensity: z.number().min(0).max(3).meta({ description: "发光强度" }),
  
  // 旋转配置
  rotationSpeed: z.number().min(0.05).max(2).meta({ description: "旋转速度（圈/秒）" }),
  rotationDirection: z.enum(["clockwise", "counterclockwise"]).meta({ description: "旋转方向" }),
  
  // 中心点配置
  centerOffsetY: z.number().min(-0.5).max(0.5).meta({ description: "中心点垂直偏移（-0.5 到 0.5）" }),
  
  // 3D 视角配置
  tiltAngle: z.number().min(-60).max(60).meta({ description: "3D 视角倾斜角度（度）" }),
  rotateY: z.number().min(-180).max(180).meta({ description: "3D 视角 Y 轴旋转角度（度）" }),
  perspective: z.number().min(200).max(2000).meta({ description: "透视距离" }),
  
  // 效果开关
  enableGlow: z.boolean().optional().meta({ description: "启用发光效果" }),
  appearDuration: z.number().min(10).max(100).optional().meta({ description: "叶片出现动画时长（帧）" }),
  
  // 叶片控制
  itemRotateWithBlade: z.boolean().optional().meta({ description: "叶片内部元素是否随叶片旋转（true: 随叶片旋转, false: 保持水平）" }),
  bladeLengthRatio: z.number().min(0.3).max(1).optional().meta({ description: "叶片长度比例（0.3-1.0）" }),
  enableRandomBladeLength: z.boolean().optional().meta({ description: "是否启用叶片长度随机变化" }),
  
  // 祝福图案样式
  blessingStyle: BlessingStyleSchema.optional(),
});

export type TextWindmillCompositionProps = z.infer<typeof TextWindmillCompositionSchema>;

// ==================== 默认颜色配置 ====================

const DEFAULT_COLORS = [
  "#FFD700", // 金色
  "#FF6B6B", // 珊瑚红
  "#4ECDC4", // 青绿
  "#45B7D1", // 天蓝
  "#96CEB4", // 薄荷绿
  "#DDA0DD", // 梅红
];

// ==================== 辅助函数 ====================

/**
 * 从简单文字列表生成叶片数据
 */
function generateBladesFromWords(words: string[], bladeCount: number): BladesData {
  const blades: BladesData = [];
  const itemsPerBlade = Math.ceil(words.length / bladeCount);
  
  for (let i = 0; i < bladeCount; i++) {
    const bladeItems: Array<{ type: BladeContentType; content: string }> = [];
    for (let j = 0; j < itemsPerBlade; j++) {
      const wordIndex = i * itemsPerBlade + j;
      if (wordIndex < words.length) {
        bladeItems.push({ type: "text", content: words[wordIndex] });
      }
    }
    if (bladeItems.length > 0) {
      blades.push(bladeItems);
    }
  }
  
  return blades;
}

// ==================== 主组件 ====================

export const TextWindmillComposition: React.FC<TextWindmillCompositionProps> = ({
  // 叶片数据
  bladesData: propBladesData,
  words,
  
  // 字体配置
  fontSize = 60,
  
  // 颜色配置
  colors,
  glowColor = "#ffd700",
  glowIntensity = 1.2,
  
  // 旋转配置
  rotationSpeed = 0.3,
  rotationDirection = "clockwise",
  
  // 中心点配置
  centerOffsetY = 0,
  
  // 3D 视角配置
  tiltAngle = 30,
  rotateY = 0,
  perspective = 1000,
  
  // 效果开关
  enableGlow = true,
  appearDuration = 30,
  
  // 叶片控制
  itemRotateWithBlade = false,
  bladeLengthRatio = 0.7,
  enableRandomBladeLength = false,
  
  // 祝福图案样式
  blessingStyle,
  
  // 基础参数
  backgroundType = "color",
  backgroundSource,
  backgroundColor = "#0a0a1a",
  backgroundVideoLoop = true,
  backgroundVideoMuted = true,
  overlayColor = "#000000",
  overlayOpacity = 0.15,
  audioEnabled = false,
  audioSource = "coin-sound.mp3",
  audioVolume = 0.5,
  audioLoop = true,
  
  // 水印参数
  watermarkEnabled = false,
  watermarkText,
  watermarkFontSize,
  watermarkColor,
  watermarkOpacity,
  watermarkSpeed,
  watermarkIntensity,
  watermarkVelocityX,
  watermarkVelocityY,
  
  // 走马灯参数
  marqueeEnabled = false,
  marqueeForegroundTexts,
  marqueeForegroundFontSize,
  marqueeForegroundOpacity,
  marqueeForegroundColor,
  marqueeForegroundEffect,
  marqueeBackgroundTexts,
  marqueeBackgroundFontSize,
  marqueeBackgroundOpacity,
  marqueeBackgroundColor,
  marqueeBackgroundEffect,
  marqueeOrientation,
  marqueeTextOrientation,
  marqueeDirection,
  marqueeSpeed,
  marqueeSpacing,
  marqueeForegroundOffsetX,
  marqueeForegroundOffsetY,
  marqueeBackgroundOffsetX,
  marqueeBackgroundOffsetY,
}) => {
  // 有效颜色列表
  const effectiveColors = colors && colors.length > 0 ? colors : DEFAULT_COLORS;
  
  // 生成叶片数据
  const bladesData = React.useMemo((): BladesData => {
    // 如果提供了 bladesData，直接使用
    if (propBladesData && propBladesData.length > 0) {
      return propBladesData;
    }
    
    // 如果提供了 words，自动生成叶片数据
    if (words && words.length > 0) {
      // 默认生成 4-6 个叶片
      const bladeCount = Math.min(6, Math.max(4, Math.ceil(words.length / 3)));
      return generateBladesFromWords(words, bladeCount);
    }
    
    // 默认示例
    return [
      [{ type: "text", content: "福" }, { type: "text", content: "运" }],
      [{ type: "text", content: "禄" }, { type: "text", content: "财" }],
      [{ type: "text", content: "寿" }, { type: "text", content: "喜" }],
      [{ type: "text", content: "吉" }, { type: "text", content: "祥" }],
    ];
  }, [propBladesData, words]);
  
  // 构建走马灯配置
  const marqueeConfig = marqueeEnabled
    ? {
        enabled: true,
        foreground: {
          texts: (marqueeForegroundTexts ?? ["新年快乐", "万事如意", "恭喜发财"]).map(text => ({ text })),
          fontSize: marqueeForegroundFontSize ?? 32,
          opacity: marqueeForegroundOpacity ?? 0.9,
          spacing: marqueeSpacing ?? 80,
          textStyle: {
            color: marqueeForegroundColor ?? "#ffd700",
            effect: marqueeForegroundEffect ?? "none",
          },
        },
        background: {
          texts: (marqueeBackgroundTexts ?? ["新春大吉", "财源广进", "龙年行大运"]).map(text => ({ text })),
          fontSize: marqueeBackgroundFontSize ?? 24,
          opacity: marqueeBackgroundOpacity ?? 0.5,
          spacing: marqueeSpacing ?? 80,
          textStyle: {
            color: marqueeBackgroundColor ?? "#ffffff",
            effect: marqueeBackgroundEffect ?? "none",
          },
        },
        orientation: marqueeOrientation ?? "horizontal",
        textOrientation: marqueeTextOrientation ?? "horizontal",
        direction: marqueeDirection ?? "left-to-right",
        speed: marqueeSpeed ?? 50,
        foregroundOffsetX: marqueeForegroundOffsetX ?? 0,
        foregroundOffsetY: marqueeForegroundOffsetY ?? 0,
        backgroundOffsetX: marqueeBackgroundOffsetX ?? 0,
        backgroundOffsetY: marqueeBackgroundOffsetY ?? 0,
      }
    : undefined;

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
      extraLayers={<StarField count={60} opacity={0.3} />}
      watermark={
        watermarkEnabled
          ? {
              enabled: true,
              text: watermarkText ?? "© Remo-Fects",
              fontSize: watermarkFontSize ?? 24,
              color: watermarkColor ?? "#ffffff",
              opacity: watermarkOpacity ?? 0.35,
              speed: watermarkSpeed ?? 1,
              intensity: watermarkIntensity ?? 0.8,
              velocityX: watermarkVelocityX ?? 180,
              velocityY: watermarkVelocityY ?? 120,
            }
          : undefined
      }
      marquee={marqueeConfig}
    >
      <Windmill
        bladesData={bladesData}
        colors={effectiveColors}
        glowColor={glowColor}
        fontSize={fontSize}
        rotationSpeed={rotationSpeed}
        rotationDirection={rotationDirection}
        centerOffsetY={centerOffsetY}
        tiltAngle={tiltAngle}
        rotateY={rotateY}
        perspective={perspective}
        enableGlow={enableGlow}
        glowIntensity={glowIntensity}
        appearDuration={appearDuration}
        itemRotateWithBlade={itemRotateWithBlade}
        bladeLengthRatio={bladeLengthRatio}
        enableRandomBladeLength={enableRandomBladeLength}
        blessingStyle={blessingStyle}
      />
    </BaseComposition>
  );
};
