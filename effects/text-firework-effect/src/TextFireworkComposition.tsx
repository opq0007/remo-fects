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
  RadialBurstSchema,
  RadialBurst,
  seededRandom,
  BlessingSymbolType,
  getEffectiveBlessingTypes,
  getAvailableTypes,
  mergeBlessingStyle,
} from "../../shared/index";

// ==================== 主组件 Schema ====================

export const TextFireworkCompositionSchema = CompleteCompositionSchema.merge(MixedInputSchema).merge(RadialBurstSchema).extend({
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
}) => {
  const { width, height, durationInFrames } = useVideoConfig();

  // 使用公共函数获取有效的祝福图案类型
  const effectiveBlessingTypes = getEffectiveBlessingTypes({ blessingTypes });
  
  // 使用公共函数获取可用类型列表
  const availableTypes = getAvailableTypes({ contentType, words, images, blessingTypes });

  // 检测可用内容类型
  const hasText = words.length > 0;
  const hasImages = images.length > 0;
  
  // 合并祝福图案样式
  const mergedBlessingStyle = mergeBlessingStyle(blessingStyle);

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
      if (hasText) {
        words.forEach(word => items.push({ type: "text", content: word }));
      }
      if (hasImages) {
        images.forEach(img => items.push({ type: "image", content: img }));
      }
      // 使用 effectiveBlessingTypes（包含默认值）
      effectiveBlessingTypes.forEach(type => items.push({ type: "blessing", content: type }));
    }
    
    return items;
  }, [contentType, words, images, effectiveBlessingTypes, hasText, hasImages]);

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

  return (
    <BaseComposition
      background={background}
      overlay={overlay}
      audio={audio}
      watermark={watermark}
      marquee={marquee}
      radialBurst={radialBurst}
      foreground={foreground}
      extraLayers={<StarField count={100} opacity={0.5} />}
    >
      {fireworks.map((firework, index) => (
        <Firework
          key={`${firework.cycleIndex}-${firework.itemIndex}`}
          contentType={firework.item.type}
          text={firework.item.type === "text" ? firework.item.content : undefined}
          imageSrc={firework.item.type === "image" ? firework.item.content : undefined}
          blessingType={firework.item.type === "blessing" ? firework.item.content as BlessingSymbolType : undefined}
          blessingStyle={mergedBlessingStyle}
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

      {/* 中心发散粒子效果 */}
      {radialBurst?.enabled && <RadialBurst {...radialBurst} />}
    </BaseComposition>
  );
};
