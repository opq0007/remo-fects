import React from "react";
import { useVideoConfig } from "remotion";
import { Firework } from "./Firework";
import { GoldenRain, generateGoldenParticles } from "./GoldenRain";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import {
  BaseComposition,
  StarField,
  CompleteCompositionSchema,
  seededRandom,
} from "../../shared/index";

// ==================== 主组件 Schema（使用公共 Schema）====================

export const TextFireworkCompositionSchema = CompleteCompositionSchema.extend({
  // 文字配置
  words: z.array(z.string()).min(1).meta({ description: "要显示的文字列表（每个文字一个烟花）" }),
  
  // 字体配置
  fontSize: z.number().min(20).max(200).meta({ description: "字体大小" }),
  textColor: zColor().meta({ description: "文字颜色" }),
  glowColor: zColor().meta({ description: "发光颜色" }),
  glowIntensity: z.number().min(0).max(2).meta({ description: "发光强度" }),
  
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
});

export type TextFireworkCompositionProps = z.infer<typeof TextFireworkCompositionSchema>;

// ==================== 主组件 ====================

export const TextFireworkComposition: React.FC<TextFireworkCompositionProps> = ({
  words,
  fontSize = 60,
  textColor = "#ffd700",
  glowColor = "#ffaa00",
  glowIntensity = 1,
  launchHeight = 0.2,
  particleCount = 80,
  textDuration = 60,
  rainDuration = 120,
  gravity = 0.15,
  wind = 0,
  rainParticleSize = 3,
  interval = 30,
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
  marqueeForegroundOffsetY,
  marqueeBackgroundOffsetY,
}) => {
  const { width, height } = useVideoConfig();

  // 计算每个烟花的时间安排
  const fireworks = React.useMemo(() => {
    const result = [];
    
    for (let i = 0; i < words.length; i++) {
      const launchFrame = i * interval;
      const explodeFrame = launchFrame + 30;
      
      const random1 = seededRandom(`startX-${i}-${words[i]}`);
      const random2 = seededRandom(`targetX-${i}-${words[i]}`);
      const random3 = seededRandom(`height-${i}-${words[i]}`);
      
      const startX = width * 0.2 + random1 * width * 0.6;
      const startY = height + 20;
      const targetX = width * 0.15 + random2 * width * 0.7;
      const heightVariation = (random3 - 0.5) * 0.1;
      const actualLaunchHeight = Math.max(0.1, Math.min(0.35, launchHeight + heightVariation));
      const targetY = height * actualLaunchHeight;
      
      result.push({
        text: words[i],
        startX,
        startY,
        targetX,
        targetY,
        launchFrame,
        explodeFrame,
      });
    }
    
    return result;
  }, [words, width, height, launchHeight, interval]);

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
        foregroundOffsetY: marqueeForegroundOffsetY ?? 0,
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
          key={index}
          text={firework.text}
          startX={firework.startX}
          startY={firework.startY}
          targetX={firework.targetX}
          targetY={firework.targetY}
          launchFrame={firework.launchFrame}
          explodeFrame={firework.explodeFrame}
          fontSize={fontSize}
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