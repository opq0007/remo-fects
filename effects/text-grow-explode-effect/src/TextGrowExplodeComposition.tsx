import React, { useMemo } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  Img,
  interpolate,
  Audio,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { TextGrow } from "./TextGrow";
import { ExplodeParticles, generateParticles, ShockWave } from "./ExplodeParticles";
import { ContourPoint } from "./imageUtils";
import {
  BackgroundSchema,
  OverlaySchema,
  AudioSchema,
  WatermarkSchema,
  MarqueeSchema,
  Background,
  Overlay,
  Watermark,
  Marquee,
} from "../../shared/index";

// ==================== Schema 定义（使用公共 Schema）====================

export const TextGrowExplodeCompositionSchema = BackgroundSchema.extend({
  // 核心内容
  name: z.string().min(1).meta({ description: "姓名（核心文字）" }),
  words: z.array(z.string()).min(1).meta({ description: "爆炸后的文字碎片数组" }),
  imageSource: z.string().meta({ description: "目标图片路径" }),
  
  // 预计算的轮廓点数据
  contourPointsData: z.array(z.object({
    x: z.number(),
    y: z.number(),
    opacity: z.number()
  })).optional().meta({ description: "预计算的轮廓点数据" }),
  
  // 阶段时长配置
  growDuration: z.number().min(30).max(300).meta({ description: "生长阶段时长（帧）" }),
  holdDuration: z.number().min(10).max(120).meta({ description: "定格显示时长（帧）" }),
  explodeDuration: z.number().min(15).max(60).meta({ description: "爆炸阶段时长（帧）" }),
  fallDuration: z.number().min(30).max(180).meta({ description: "碎片下落时长（帧）" }),
  
  // 文字样式
  fontSize: z.number().min(10).max(100).meta({ description: "生长文字大小" }),
  particleFontSize: z.number().min(10).max(80).meta({ description: "粒子文字大小" }),
  textColor: zColor().meta({ description: "生长文字颜色" }),
  glowColor: zColor().meta({ description: "发光颜色" }),
  glowIntensity: z.number().min(0.1).max(2).meta({ description: "发光强度" }),
  
  // 粒子配置
  particleCount: z.number().min(20).max(200).meta({ description: "爆炸粒子数量" }),
  gravity: z.number().min(0.05).max(0.5).meta({ description: "重力系数" }),
  wind: z.number().min(-0.3).max(0.3).meta({ description: "风力系数" }),
  
  // 轮廓提取
  threshold: z.number().min(50).max(200).meta({ description: "二值化阈值" }),
  sampleDensity: z.number().min(4).max(20).meta({ description: "采样密度" }),
  
  // 生长样式
  growStyle: z.enum(["radial", "wave", "tree"]).meta({ description: "生长样式" }),
  
  // 背景配置
  backgroundOpacity: z.number().min(0).max(1).meta({ description: "背景图片透明度" }),
  explodeBackgroundOpacity: z.number().min(0).max(1).meta({ description: "爆炸后背景图片透明度" }),
  
  // 随机种子
  seed: z.number().meta({ description: "随机种子" }),
  
  // 循环播放
  enableLoop: z.boolean().optional().meta({ description: "启用循环播放" }),

  // 遮罩效果（从 OverlaySchema 继承）
  ...OverlaySchema.shape,

  // 音效配置（使用公共 Schema）
  ...AudioSchema.shape,

  // 水印配置（使用公共 Schema）
  ...WatermarkSchema.shape,

  // 走马灯配置（使用公共 Schema）
  ...MarqueeSchema.shape,
});

export type TextGrowExplodeCompositionProps = z.infer<typeof TextGrowExplodeCompositionSchema>;

// ==================== 辅助函数 ====================

export function extractContourPointsFromImageData(
  imageData: { data: number[]; width: number; height: number },
  threshold: number = 128,
  sampleDensity: number = 8
): ContourPoint[] {
  const { width, height, data } = imageData;
  const points: ContourPoint[] = [];
  const invThreshold = 1 / threshold;

  for (let y = 0; y < height; y += sampleDensity) {
    for (let x = 0; x < width; x += sampleDensity) {
      const idx = (y * width + x) * 4;
      const a = data[idx + 3];

      if (a <= 50) continue;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const gray = (r * 77 + g * 150 + b * 29) >> 8;

      if (gray < threshold) {
        points.push({ x, y, opacity: 1 - gray * invThreshold });
      }
    }
  }

  return points;
}

// ==================== 主组件 ====================

export const TextGrowExplodeComposition: React.FC<TextGrowExplodeCompositionProps> = ({
  name,
  words,
  imageSource,
  contourPointsData,
  growDuration = 90,
  holdDuration = 30,
  explodeDuration = 30,
  fallDuration = 90,
  fontSize = 16,
  particleFontSize = 24,
  textColor = "#ffd700",
  glowColor = "#ffaa00",
  glowIntensity = 1,
  particleCount = 80,
  gravity = 0.15,
  wind = 0,
  threshold = 128,
  sampleDensity = 8,
  growStyle = "tree",
  backgroundColor = "#0a0a1a",
  backgroundOpacity = 0.9,
  explodeBackgroundOpacity = 0.5,
  seed = 42,
  enableLoop = false,
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
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const contourPoints = useMemo(() => {
    return contourPointsData || [];
  }, [contourPointsData]);

  // 单个动画周期的时长
  const cycleDuration = useMemo(() => {
    return growDuration + holdDuration + explodeDuration + fallDuration;
  }, [growDuration, holdDuration, explodeDuration, fallDuration]);

  // 计算当前帧所在的周期和周期内帧数
  const cycleInfo = useMemo(() => {
    if (enableLoop && cycleDuration > 0) {
      const cycleIndex = Math.floor(frame / cycleDuration);
      const frameInCycle = frame % cycleDuration;
      return { cycleIndex, frameInCycle };
    }
    return { cycleIndex: 0, frameInCycle: frame };
  }, [frame, enableLoop, cycleDuration]);

  const currentFrame = cycleInfo.frameInCycle;
  const cycleIndex = cycleInfo.cycleIndex;

  const timings = useMemo(() => ({
    growEndFrame: growDuration,
    holdEndFrame: growDuration + holdDuration,
    explodeStartFrame: growDuration + holdDuration,
    explodeEndFrame: growDuration + holdDuration + explodeDuration,
    fallEndFrame: growDuration + holdDuration + explodeDuration + fallDuration,
  }), [growDuration, holdDuration, explodeDuration, fallDuration]);

  // 使用 cycleIndex 作为 seed 的一部分，确保每个周期粒子不同
  const particles = useMemo(() => {
    return generateParticles(width / 2, height / 2, words, particleCount, particleFontSize, seed + cycleIndex * 1000);
  }, [width, height, words, particleCount, particleFontSize, seed, cycleIndex]);

  const backgroundProgress = interpolate(
    currentFrame,
    [timings.explodeStartFrame, timings.explodeStartFrame + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const growOpacity = interpolate(
    currentFrame,
    [timings.explodeStartFrame - 10, timings.explodeStartFrame],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const flashIntensity = interpolate(
    currentFrame,
    [timings.explodeStartFrame, timings.explodeStartFrame + 5, timings.explodeStartFrame + 15],
    [1, 0.5, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const isGrowPhase = currentFrame < timings.explodeStartFrame;
  const isExplodePhase = currentFrame >= timings.explodeStartFrame;
  const showGrow = isGrowPhase && contourPoints.length > 0 && growOpacity > 0;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background
        type="color"
        color={backgroundColor}
      />
      
      {backgroundProgress > 0 && (
        <AbsoluteFill style={{ opacity: backgroundProgress * explodeBackgroundOpacity }}>
          <Img src={staticFile(imageSource)} style={{ width, height, objectFit: "cover" }} />
        </AbsoluteFill>
      )}

      <Overlay color={overlayColor} opacity={overlayOpacity} />

      {showGrow && (
        <AbsoluteFill style={{ opacity: growOpacity }}>
          <TextGrow
            name={name}
            contourPoints={contourPoints}
            growDuration={growDuration}
            holdDuration={holdDuration}
            fontSize={fontSize}
            textColor={textColor}
            glowColor={glowColor}
            glowIntensity={glowIntensity}
            startY={height + 50}
            growStyle={growStyle}
            seed={seed + cycleIndex * 1000}
          />
        </AbsoluteFill>
      )}

      {flashIntensity > 0 && (
        <AbsoluteFill style={{ backgroundColor: "#ffffff", opacity: flashIntensity * 0.3 }} />
      )}

      <ShockWave
        centerX={width / 2}
        centerY={height / 2}
        startFrame={timings.explodeStartFrame}
        duration={30}
        maxRadius={Math.max(width, height)}
        color={glowColor}
      />

      {isExplodePhase && (
        <ExplodeParticles
          particles={particles}
          explodeDuration={explodeDuration}
          fallDuration={fallDuration}
          startFrame={timings.explodeStartFrame}
          gravity={gravity}
          wind={wind}
          explosionRadius={100}
        />
      )}

      {audioEnabled && (
        <Audio
          src={staticFile(audioSource)}
          volume={audioVolume}
          loop={audioLoop}
        />
      )}

      {watermarkEnabled && (
        <Watermark
          text={watermarkText ?? "© Remo-Fects"}
          fontSize={watermarkFontSize ?? 24}
          color={watermarkColor ?? "#ffffff"}
          opacity={watermarkOpacity ?? 0.35}
          speed={watermarkSpeed ?? 1}
          intensity={watermarkIntensity ?? 0.8}
          velocityX={watermarkVelocityX ?? 180}
          velocityY={watermarkVelocityY ?? 120}
        />
      )}

      {marqueeEnabled && (
        <Marquee
          foreground={{
            texts: (marqueeForegroundTexts ?? ["新年快乐", "万事如意", "恭喜发财"]).map(text => ({ text })),
            fontSize: marqueeForegroundFontSize ?? 32,
            opacity: marqueeForegroundOpacity ?? 0.9,
            textStyle: {
              color: marqueeForegroundColor ?? "#ffd700",
              effect: marqueeForegroundEffect ?? "none",
            },
          }}
          background={{
            texts: (marqueeBackgroundTexts ?? ["新春大吉", "财源广进", "龙年行大运"]).map(text => ({ text })),
            fontSize: marqueeBackgroundFontSize ?? 24,
            opacity: marqueeBackgroundOpacity ?? 0.5,
            textStyle: {
              color: marqueeBackgroundColor ?? "#ffffff",
              effect: marqueeBackgroundEffect ?? "none",
            },
          }}
          orientation={marqueeOrientation ?? "horizontal"}
          textOrientation={marqueeTextOrientation ?? "horizontal"}
          direction={marqueeDirection ?? "left-to-right"}
          speed={marqueeSpeed ?? 50}
          foregroundOffsetX={marqueeForegroundOffsetX ?? 0}
          foregroundOffsetY={marqueeForegroundOffsetY ?? 0}
          backgroundOffsetX={marqueeBackgroundOffsetX ?? 0}
          backgroundOffsetY={marqueeBackgroundOffsetY ?? 0}
        />
      )}
    </AbsoluteFill>
  );
};

export default TextGrowExplodeComposition;