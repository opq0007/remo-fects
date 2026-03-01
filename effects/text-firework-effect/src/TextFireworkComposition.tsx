import React from "react";
import { useVideoConfig } from "remotion";
import { Firework, FireworkContentType } from "./Firework";
import { GoldenRain, generateGoldenParticles } from "./GoldenRain";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import {
  BaseComposition,
  StarField,
  CompleteCompositionSchema,
  MixedInputSchema,
  seededRandom,
  BlessingSymbolType,
  DEFAULT_BLESSING_TYPES,
} from "../../shared/index";

// ==================== 主组件 Schema ====================

export const TextFireworkCompositionSchema = CompleteCompositionSchema.merge(MixedInputSchema).extend({
  // 文字配置（兼容旧版本）
  words: z.array(z.string()).optional().meta({ description: "要显示的文字列表（每个文字一个烟花）" }),
  
  // 字体配置
  fontSize: z.number().min(20).max(200).meta({ description: "字体大小" }),
  textColor: zColor().meta({ description: "文字颜色" }),
  glowColor: zColor().meta({ description: "发光颜色" }),
  glowIntensity: z.number().min(0).max(2).meta({ description: "发光强度" }),
  
  // 图片/祝福图案配置
  imageSize: z.number().min(20).max(300).optional().meta({ description: "图片大小" }),
  blessingSize: z.number().min(20).max(300).optional().meta({ description: "祝福图案大小" }),
  
  // 烟花配置
  launchHeight: z.number().min(0.05).max(0.5).meta({ description: "爆炸高度比例" }),
  particleCount: z.number().min(20).max(200).meta({ description: "爆炸粒子数量" }),
  textDuration: z.number().min(20).max(120).meta({ description: "文字显示时长（帧）" }),
  rainDuration: z.number().min(30).max(180).meta({ description: "粒子下雨时长（帧）" }),
  
  // 粒子下雨配置
  gravity: z.number().min(0.05).max(0.5).meta({ description: "重力系数" }),
  wind: z.number().min(-0.2).max(0.2).meta({ description: "风力系数" }),
  rainParticleSize: z.number().min(1).max(10).meta({ description: "雨滴粒子大小" }),
  
  // 时间配置
  interval: z.number().min(10).max(60).meta({ description: "烟花发射间隔（帧）" }),
  
  // 循环播放
  enableLoop: z.boolean().optional().meta({ description: "启用循环播放" }),
});

export type TextFireworkCompositionProps = z.infer<typeof TextFireworkCompositionSchema>;

// ==================== 内容项目类型 ====================

interface ContentItem {
  type: FireworkContentType;
  content: string;
}

// ==================== 主组件 ====================

export const TextFireworkComposition: React.FC<TextFireworkCompositionProps> = ({
  // 混合输入参数
  contentType = "text",
  words = [],
  images = [],
  blessingTypes = [],
  imageWeight = 0.5,
  blessingStyle = {},
  
  // 尺寸配置
  fontSize = 60,
  imageSize,
  blessingSize,
  
  // 颜色配置
  textColor = "#ffd700",
  glowColor = "#ffaa00",
  glowIntensity = 1,
  
  // 烟花配置
  launchHeight = 0.2,
  particleCount = 80,
  textDuration = 60,
  rainDuration = 120,
  gravity = 0.15,
  wind = 0,
  rainParticleSize = 3,
  interval = 30,
  enableLoop = false,
  
  // 基础参数
  backgroundType = "color",
  backgroundSource,
  backgroundColor = "#0a0a20",
  backgroundVideoLoop = true,
  backgroundVideoMuted = true,
  overlayColor = "#000000",
  overlayOpacity = 0.2,
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
  const { width, height, durationInFrames } = useVideoConfig();

  // 检测用户是否提供了祝福图案
  const userProvidedBlessing = blessingTypes && blessingTypes.length > 0;
  
  // 计算有效的祝福图案类型（非 mixed 模式用于回退）
  const effectiveBlessingTypes = userProvidedBlessing ? blessingTypes : DEFAULT_BLESSING_TYPES;

  // 检测可用内容类型
  const hasText = words.length > 0;
  const hasImages = images.length > 0;

  // 生成内容列表
  const contentItems = React.useMemo((): ContentItem[] => {
    const items: ContentItem[] = [];
    
    if (contentType === "text") {
      if (hasText) {
        words.forEach(word => items.push({ type: "text", content: word }));
      } else {
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
      // mixed 模式：只显示用户实际提供的内容
      // 先添加所有文字
      if (hasText) {
        words.forEach(word => items.push({ type: "text", content: word }));
      }
      // 再添加所有图片
      if (hasImages) {
        images.forEach(img => items.push({ type: "image", content: img }));
      }
      // 只有用户提供了祝福图案才添加
      if (userProvidedBlessing) {
        blessingTypes.forEach(type => items.push({ type: "blessing", content: type }));
      }
    }
    
    return items;
  }, [contentType, words, images, blessingTypes, effectiveBlessingTypes, hasText, hasImages, userProvidedBlessing]);

  // 计算单个烟花周期时长
  const cycleDuration = React.useMemo(() => {
    const lastLaunchFrame = (contentItems.length - 1) * interval;
    return lastLaunchFrame + 30 + textDuration + rainDuration + 30;
  }, [contentItems.length, interval, textDuration, rainDuration]);

  // 计算烟花时间安排（支持循环）
  const fireworks = React.useMemo(() => {
    const result: Array<{
      item: ContentItem;
      startX: number;
      startY: number;
      targetX: number;
      targetY: number;
      launchFrame: number;
      explodeFrame: number;
      cycleIndex: number;
      itemIndex: number;
    }> = [];
    
    if (enableLoop && cycleDuration > 0) {
      // 循环模式
      let cycleIndex = 0;
      let currentFrame = 0;

      while (currentFrame < durationInFrames) {
        contentItems.forEach((item, itemIndex) => {
          const launchFrame = currentFrame + itemIndex * interval;
          if (launchFrame < durationInFrames) {
            const explodeFrame = launchFrame + 30;
            
            const random1 = seededRandom(`startX-${cycleIndex}-${itemIndex}-${item.content}`);
            const random2 = seededRandom(`targetX-${cycleIndex}-${itemIndex}-${item.content}`);
            const random3 = seededRandom(`height-${cycleIndex}-${itemIndex}-${item.content}`);
            
            const startX = width * 0.2 + random1 * width * 0.6;
            const startY = height + 20;
            const targetX = width * 0.15 + random2 * width * 0.7;
            const heightVariation = (random3 - 0.5) * 0.1;
            const actualLaunchHeight = Math.max(0.1, Math.min(0.35, launchHeight + heightVariation));
            const targetY = height * actualLaunchHeight;
            
            result.push({
              item,
              startX,
              startY,
              targetX,
              targetY,
              launchFrame,
              explodeFrame,
              cycleIndex,
              itemIndex,
            });
          }
        });
        currentFrame += cycleDuration;
        cycleIndex++;
      }
    } else {
      // 非循环模式
      contentItems.forEach((item, itemIndex) => {
        const launchFrame = itemIndex * interval;
        const explodeFrame = launchFrame + 30;
        
        const random1 = seededRandom(`startX-${itemIndex}-${item.content}`);
        const random2 = seededRandom(`targetX-${itemIndex}-${item.content}`);
        const random3 = seededRandom(`height-${itemIndex}-${item.content}`);
        
        const startX = width * 0.2 + random1 * width * 0.6;
        const startY = height + 20;
        const targetX = width * 0.15 + random2 * width * 0.7;
        const heightVariation = (random3 - 0.5) * 0.1;
        const actualLaunchHeight = Math.max(0.1, Math.min(0.35, launchHeight + heightVariation));
        const targetY = height * actualLaunchHeight;
        
        result.push({
          item,
          startX,
          startY,
          targetX,
          targetY,
          launchFrame,
          explodeFrame,
          cycleIndex: 0,
          itemIndex,
        });
      });
    }
    
    return result;
  }, [contentItems, width, height, launchHeight, interval, enableLoop, cycleDuration, durationInFrames]);

  // 收集所有烟花爆炸时生成的粒子
  const allParticles = React.useMemo(() => {
    const particles: Array<{
      particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string }>;
      startFrame: number;
      duration: number;
    }> = [];
    
    fireworks.forEach((firework, index) => {
      const rainStartFrame = firework.explodeFrame + textDuration;
      
      const fireworkParticles = generateGoldenParticles(
        firework.targetX,
        firework.targetY,
        particleCount,
        rainParticleSize,
        textColor,
        glowColor,
        index * 1000
      );
      
      particles.push({
        particles: fireworkParticles,
        startFrame: rainStartFrame,
        duration: rainDuration,
      });
    });
    
    return particles;
  }, [fireworks, particleCount, rainParticleSize, textDuration, rainDuration, textColor, glowColor]);

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
      extraLayers={<StarField count={100} opacity={0.5} />}
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
      {fireworks.map((firework, index) => (
        <Firework
          key={`${firework.cycleIndex}-${firework.itemIndex}`}
          contentType={firework.item.type}
          text={firework.item.type === "text" ? firework.item.content : undefined}
          imageSrc={firework.item.type === "image" ? firework.item.content : undefined}
          blessingType={firework.item.type === "blessing" ? firework.item.content as BlessingSymbolType : undefined}
          blessingStyle={blessingStyle}
          startX={firework.startX}
          startY={firework.startY}
          targetX={firework.targetX}
          targetY={firework.targetY}
          launchFrame={firework.launchFrame}
          explodeFrame={firework.explodeFrame}
          fontSize={fontSize}
          imageSize={imageSize}
          blessingSize={blessingSize}
          textColor={textColor}
          glowColor={glowColor}
          glowIntensity={glowIntensity}
          particleCount={particleCount}
        />
      ))}

      {allParticles.map((rain, index) => (
        <GoldenRain
          key={index}
          particles={rain.particles}
          startFrame={rain.startFrame}
          duration={rain.duration}
          gravity={gravity}
          wind={wind}
          color={textColor}
          glowColor={glowColor}
          glowIntensity={glowIntensity}
        />
      ))}
    </BaseComposition>
  );
};