/**
 * 文字矢量动画特效组合组件
 * 
 * 将文字转为SVG路径轮廓，用混合输入元素填充轨迹
 */

import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import {
  BaseComposition,
  StarField,
  CompleteCompositionSchema,
  MixedInputSchema,
} from "../../shared/index";
import { TextVectorAnimation } from "./TextVectorAnimation";

// ==================== 主组件 Schema ====================

export const TextVectorCompositionSchema = CompleteCompositionSchema.merge(MixedInputSchema).extend({
  // ===== 核心文字配置 =====
  text: z.string().min(1).meta({ description: "要显示的核心文字" }),
  
  // ===== 字体配置 =====
  fontSize: z.number().min(50).max(500).meta({ description: "核心文字字体大小" }),
  fontFamily: z.string().optional().meta({ description: "字体家族" }),
  fontWeight: z.number().min(100).max(900).optional().meta({ description: "字重" }),
  
  // ===== 混合输入配置（用于填充元素） =====
  words: z.array(z.string()).optional().meta({ description: "填充文字列表" }),
  images: z.array(z.string()).optional().meta({ description: "填充图片列表" }),
  blessingTypes: z.array(z.enum(["goldCoin", "moneyBag", "luckyBag", "redPacket"])).optional().meta({ description: "祝福图案类型" }),
  
  // ===== 元素配置 =====
  elementSize: z.number().min(10).max(100).meta({ description: "填充元素大小" }),
  elementSizeRange: z.tuple([z.number(), z.number()]).optional().meta({ description: "元素大小范围" }),
  elementSpacing: z.number().min(5).max(50).meta({ description: "元素间距" }),
  
  // ===== 颜色配置 =====
  textColor: zColor().optional().meta({ description: "文字颜色" }),
  glowColor: zColor().meta({ description: "发光颜色" }),
  glowIntensity: z.number().min(0).max(3).meta({ description: "发光强度" }),
  colors: z.array(zColor()).optional().meta({ description: "颜色列表（循环使用）" }),
  
  // ===== 文字排列配置 =====
  textOrientation: z.enum(["horizontal", "vertical"]).optional().meta({ description: "文字排列方向：horizontal（水平）| vertical（垂直）" }),
  
  // ===== 多字动画配置 =====
  charAnimationMode: z.enum(["together", "sequential"]).optional().meta({ description: "多字动画模式：together（同时展示）| sequential（依次展示）" }),
  charInterval: z.number().min(10).max(300).optional().meta({ description: "依次展示时每字间隔（帧），仅 charAnimationMode=sequential 时有效" }),
  charStayDuration: z.number().min(30).max(600).optional().meta({ description: "依次展示时每字停留时长（帧），仅 charAnimationMode=sequential 时有效" }),
  
  // ===== 动画配置 =====
  entranceDuration: z.number().min(5).max(60).meta({ description: "入场动画时长（帧）" }),
  fillDuration: z.number().min(20).max(200).meta({ description: "填充动画时长（帧）" }),
  fillType: z.enum(["sequential", "random", "radial", "wave"]).meta({ description: "填充动画类型" }),
  stayAnimation: z.enum(["pulse", "glow", "float", "none"]).meta({ description: "停留动画类型" }),
  pulseSpeed: z.number().min(0.1).max(5).optional().meta({ description: "脉冲速度" }),
  glowPulseSpeed: z.number().min(0.1).max(5).optional().meta({ description: "发光脉冲速度" }),
  floatAmplitude: z.number().min(0).max(20).optional().meta({ description: "漂浮幅度" }),
  floatSpeed: z.number().min(0.1).max(5).optional().meta({ description: "漂浮速度" }),
  
  // ===== 3D 效果 =====
  enable3D: z.boolean().optional().meta({ description: "启用3D效果" }),
  rotation3D: z.number().min(-45).max(45).optional().meta({ description: "3D旋转角度" }),
  
  // ===== 背景 StarField =====
  enableStarField: z.boolean().optional().meta({ description: "启用星空背景" }),
  starCount: z.number().min(0).max(200).optional().meta({ description: "星星数量" }),
  starOpacity: z.number().min(0).max(1).optional().meta({ description: "星星透明度" }),
});

export type TextVectorCompositionProps = z.infer<typeof TextVectorCompositionSchema>;

// ==================== 默认颜色配置 ====================

const DEFAULT_COLORS = [
  "#FFD700", // 金色
  "#FF6B6B", // 珊瑚红
  "#4ECDC4", // 青绿
  "#45B7D1", // 天蓝
  "#96CEB4", // 薄荷绿
  "#FFEAA7", // 淡金
  "#DDA0DD", // 梅红
];

// ==================== 主组件 ====================

export const TextVectorComposition: React.FC<TextVectorCompositionProps> = ({
  // 核心文字
  text = "福",
  
  // 字体配置
  fontSize = 300,
  fontFamily = "Arial, sans-serif",
  fontWeight = 700,
  
  // 混合输入配置
  contentType = "text",
  words = [],
  images = [],
  blessingTypes = [],
  imageWeight = 0.5,
  blessingStyle = {},
  
  // 元素配置
  elementSize = 24,
  elementSizeRange,
  elementSpacing = 18,
  
  // 颜色配置
  textColor = "#FFD700",
  glowColor = "#FFD700",
  glowIntensity = 1,
  colors,
  
  // 文字排列配置
  textOrientation = "horizontal",
  
  // 多字动画配置
  charAnimationMode = "together",
  charInterval = 60,
  charStayDuration = 120,
  
  // 动画配置
  entranceDuration = 15,
  fillDuration = 90,
  fillType = "sequential",
  stayAnimation = "pulse",
  pulseSpeed = 1,
  glowPulseSpeed = 1,
  floatAmplitude = 4,
  floatSpeed = 1,
  
  // 3D 效果
  enable3D = true,
  rotation3D = 12,
  
  // StarField
  enableStarField = true,
  starCount = 60,
  starOpacity = 0.4,
  
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
  seed = 12345,
  
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
  // 有效颜色
  const effectiveColors = colors && colors.length > 0 ? colors : DEFAULT_COLORS;
  
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
      extraLayers={
        enableStarField ? <StarField count={starCount} opacity={starOpacity} /> : undefined
      }
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
      <TextVectorAnimation
        text={text}
        contentType={contentType}
        words={words}
        images={images}
        blessingTypes={blessingTypes}
        imageWeight={imageWeight}
        fontSize={fontSize}
        fontFamily={fontFamily}
        fontWeight={fontWeight}
        elementSize={elementSize}
        elementSizeRange={elementSizeRange}
        elementSpacing={elementSpacing}
        textColor={textColor}
        glowColor={glowColor}
        glowIntensity={glowIntensity}
        colors={effectiveColors}
        blessingStyle={blessingStyle}
        textOrientation={textOrientation}
        charAnimationMode={charAnimationMode}
        charInterval={charInterval}
        charStayDuration={charStayDuration}
        entranceDuration={entranceDuration}
        fillDuration={fillDuration}
        fillType={fillType}
        stayAnimation={stayAnimation}
        pulseSpeed={pulseSpeed}
        glowPulseSpeed={glowPulseSpeed}
        floatAmplitude={floatAmplitude}
        floatSpeed={floatSpeed}
        enable3D={enable3D}
        rotation3D={rotation3D}
        seed={seed}
      />
    </BaseComposition>
  );
};

export default TextVectorComposition;
