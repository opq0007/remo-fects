import React from "react";
import { useVideoConfig, useCurrentFrame } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import {
  BaseComposition,
  StarField,
  CompleteCompositionSchema,
  MixedInputSchema,
  BlessingSymbolType,
  DEFAULT_BLESSING_TYPES,
  getEffectiveBlessingTypes,
} from "../../shared/index";
import { Kaleidoscope } from "./Kaleidoscope";
import { CenterBurst } from "./CenterBurst";
import { FocusText } from "./FocusText";

// ==================== 主组件 Schema ====================

export const TextKaleidoscopeCompositionSchema = CompleteCompositionSchema.merge(MixedInputSchema).extend({
  // 文字配置
  words: z.array(z.string()).optional().meta({ description: "要显示的文字列表" }),
  
  // 中心焦点文字配置（独立）
  focusWords: z.array(z.string()).optional().meta({ description: "中心焦点文字列表（不配置则不渲染焦点文字）" }),
  
  // 字体配置
  fontSize: z.number().min(20).max(300).meta({ description: "基础字体大小" }),
  focusFontSize: z.number().min(40).max(400).optional().meta({ description: "焦点文字字体大小" }),
  
  // 颜色配置
  colors: z.array(zColor()).optional().meta({ description: "文字颜色列表（循环使用）" }),
  glowColor: zColor().meta({ description: "发光颜色" }),
  glowIntensity: z.number().min(0).max(3).meta({ description: "发光强度" }),
  
  // 万花筒配置
  itemCount: z.number().min(10).max(200).meta({ description: "万花筒元素数量" }),
  ringCount: z.number().min(2).max(10).meta({ description: "圆环数量" }),
  rotationSpeed: z.number().min(0.1).max(5).meta({ description: "旋转速度（圈/秒）" }),
  
  // 动画配置
  expansionDuration: z.number().min(30).max(300).meta({ description: "扩散动画时长（帧）" }),
  fadeInDuration: z.number().min(10).max(100).meta({ description: "淡入时长（帧）" }),
  
  // 中心爆发配置
  enableCenterBurst: z.boolean().optional().meta({ description: "启用中心爆发效果" }),
  burstParticleCount: z.number().min(5).max(50).optional().meta({ description: "每次爆发粒子数" }),
  burstInterval: z.number().min(30).max(120).optional().meta({ description: "爆发间隔（帧）" }),
  
  // 焦点文字配置（仅当 focusWords 有值时生效）
  focusTextInterval: z.number().min(60).max(240).optional().meta({ description: "焦点文字间隔（帧）" }),
  focusTextDuration: z.number().min(30).max(120).optional().meta({ description: "焦点文字持续时间（帧）" }),
  
  // 3D 效果
  enable3D: z.boolean().optional().meta({ description: "启用3D效果" }),
  
  // 脉冲效果
  enablePulse: z.boolean().optional().meta({ description: "启用脉冲效果" }),
});

export type TextKaleidoscopeCompositionProps = z.infer<typeof TextKaleidoscopeCompositionSchema>;

// ==================== 默认颜色配置 ====================

const DEFAULT_COLORS = [
  "#FFD700", // 金色
  "#FF6B6B", // 珊瑚红
  "#4ECDC4", // 青绿
  "#45B7D1", // 天蓝
  "#96CEB4", // 薄荷绿
  "#FFEAA7", // 淡金
  "#DDA0DD", // 梅红
  "#98D8C8", // 水绿
];

// ==================== 内容项目类型 ====================

interface ContentItem {
  type: "text" | "image" | "blessing";
  content: string;
}

// ==================== 主组件 ====================

export const TextKaleidoscopeComposition: React.FC<TextKaleidoscopeCompositionProps> = ({
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
  
  // 中心焦点文字配置（独立）
  focusWords,
  
  // 字体配置
  fontSize = 60,
  focusFontSize,
  
  // 颜色配置
  colors,
  glowColor = "#ffd700",
  glowIntensity = 1.2,
  
  // 万花筒配置
  itemCount = 60,
  ringCount = 5,
  rotationSpeed = 0.3,
  
  // 动画配置
  expansionDuration = 120,
  fadeInDuration = 60,
  
  // 中心爆发配置
  enableCenterBurst = true,
  burstParticleCount = 20,
  burstInterval = 60,
  
  // 焦点文字配置
  focusTextInterval = 90,
  focusTextDuration = 60,
  
  // 3D 效果
  enable3D = true,
  
  // 脉冲效果
  enablePulse = true,
}) => {
  const { width, height, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  
  // 有效颜色列表
  const effectiveColors = colors && colors.length > 0 ? colors : DEFAULT_COLORS;
  
  // 检测可用内容
  const hasText = words && words.length > 0;
  const hasImages = images && images.length > 0;
  
  // 使用公共函数获取有效的祝福图案类型
  const effectiveBlessingTypes = getEffectiveBlessingTypes({ blessingTypes });
  
  // 生成万花筒内容列表
  const contentItems = React.useMemo((): ContentItem[] => {
    const items: ContentItem[] = [];
    
    if (contentType === "text") {
      if (hasText) {
        words.forEach(word => items.push({ type: "text", content: word }));
      } else {
        // 回退到祝福图案
        effectiveBlessingTypes.forEach(type => items.push({ type: "blessing", content: type }));
      }
    } else if (contentType === "image") {
      if (hasImages) {
        images.forEach(img => items.push({ type: "image", content: img }));
      } else {
        effectiveBlessingTypes.forEach(type => items.push({ type: "blessing", content: type }));
      }
    } else if (contentType === "blessing") {
      effectiveBlessingTypes.forEach(type => items.push({ type: "blessing", content: type }));
    } else {
      // mixed 模式：显示所有提供的内容
      if (hasText) {
        words.forEach(word => items.push({ type: "text", content: word }));
      }
      if (hasImages) {
        images.forEach(img => items.push({ type: "image", content: img }));
      }
      // 只有用户提供了祝福图案才添加
      if (blessingTypes && blessingTypes.length > 0) {
        blessingTypes.forEach(type => items.push({ type: "blessing", content: type }));
      }
      // 如果没有任何内容，使用默认祝福
      if (items.length === 0) {
        effectiveBlessingTypes.forEach(type => items.push({ type: "blessing", content: type }));
      }
    }
    
    return items;
  }, [contentType, words, images, blessingTypes, hasText, hasImages, effectiveBlessingTypes]);
  
  // 有效焦点文字列表
  const effectiveFocusWords = focusWords && focusWords.length > 0 ? focusWords : null;
  
  // 有效焦点文字字体大小
  const effectiveFocusFontSize = focusFontSize ?? fontSize * 2;
  
  // 最大扩散半径
  const maxRadius = Math.min(width, height) * 0.45;

  // 生成焦点文字列表（仅当 focusWords 有值时）
  const focusTexts = React.useMemo(() => {
    if (!effectiveFocusWords) return [];
    
    const result: Array<{ text: string; appearFrame: number }> = [];
    let currentFrame = fadeInDuration;
    
    while (currentFrame < durationInFrames) {
      const textIndex = Math.floor((currentFrame / focusTextInterval) % effectiveFocusWords.length);
      result.push({
        text: effectiveFocusWords[textIndex],
        appearFrame: currentFrame,
      });
      currentFrame += focusTextInterval + focusTextDuration;
    }
    
    return result;
  }, [effectiveFocusWords, focusTextInterval, focusTextDuration, fadeInDuration, durationInFrames]);
  
  // 生成中心爆发用的文字列表（仅文字）
  const burstWords = React.useMemo(() => {
    return contentItems
      .filter(item => item.type === "text")
      .map(item => item.content);
  }, [contentItems]);

  return (
    <BaseComposition
      background={background}
      overlay={overlay}
      audio={audio}
      watermark={watermark}
      marquee={marquee}
      radialBurst={radialBurst}
      foreground={foreground}
      extraLayers={<StarField count={80} opacity={0.4} />}
    >
      {/* 万花筒主体 - 从中心向外圆形扩散 */}
      <Kaleidoscope
        contentItems={contentItems}
        colors={effectiveColors}
        glowColor={glowColor}
        baseFontSize={fontSize}
        itemCount={itemCount}
        ringCount={ringCount}
        rotationSpeed={rotationSpeed}
        expansionDuration={expansionDuration}
        fadeInDuration={fadeInDuration}
        stayDuration={durationInFrames}
        startFrame={0}
        enable3D={enable3D}
        enableGlow={true}
        glowIntensity={glowIntensity}
        blessingStyle={blessingStyle}
      />
      
      {/* 中心爆发效果 - 仅使用文字 */}
      {enableCenterBurst && burstWords.length > 0 && (
        <CenterBurst
          words={burstWords}
          colors={effectiveColors}
          glowColor={glowColor}
          baseFontSize={fontSize * 0.8}
          particleCount={burstParticleCount}
          burstInterval={burstInterval}
          burstDuration={expansionDuration * 0.8}
          maxRadius={maxRadius}
          startFrame={fadeInDuration}
          enableGlow={true}
          glowIntensity={glowIntensity * 0.8}
        />
      )}
      
      {/* 焦点文字 - 仅当 focusWords 有值时渲染 */}
      {effectiveFocusWords && focusTexts.map((focusText, index) => (
        <FocusText
          key={index}
          text={focusText.text}
          fontSize={effectiveFocusFontSize}
          color={effectiveColors[index % effectiveColors.length]}
          glowColor={glowColor}
          appearFrame={focusText.appearFrame}
          stayDuration={focusTextDuration}
          enableGlow={true}
          glowIntensity={glowIntensity * 1.5}
          enablePulse={enablePulse}
        />
      ))}
    </BaseComposition>
  );
};