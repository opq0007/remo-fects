import React, { useMemo } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  Img,
  interpolate,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { TextGrow } from "./TextGrow";
import { ExplodeParticles, generateParticles, ShockWave } from "./ExplodeParticles";
import { ContourPoint } from "./imageUtils";

// ==================== Schema 定义 ====================

export const TextGrowExplodeCompositionSchema = z.object({
  name: z.string().min(1).meta({ description: "姓名（核心文字）" }),
  words: z.array(z.string()).min(1).meta({ description: "爆炸后的文字碎片数组" }),
  imageSource: z.string().meta({ description: "目标图片路径" }),
  
  // 预计算的轮廓点数据（由服务端或构建时计算）
  contourPointsData: z.array(z.object({
    x: z.number(),
    y: z.number(),
    opacity: z.number()
  })).optional().meta({ description: "预计算的轮廓点数据" }),
  
  growDuration: z.number().min(30).max(300).meta({ description: "生长阶段时长（帧）" }),
  holdDuration: z.number().min(10).max(120).meta({ description: "定格显示时长（帧）" }),
  explodeDuration: z.number().min(15).max(60).meta({ description: "爆炸阶段时长（帧）" }),
  fallDuration: z.number().min(30).max(180).meta({ description: "碎片下落时长（帧）" }),
  fontSize: z.number().min(10).max(100).meta({ description: "生长文字大小" }),
  particleFontSize: z.number().min(10).max(80).meta({ description: "粒子文字大小" }),
  textColor: zColor().meta({ description: "生长文字颜色" }),
  glowColor: zColor().meta({ description: "发光颜色" }),
  glowIntensity: z.number().min(0.1).max(2).meta({ description: "发光强度" }),
  particleCount: z.number().min(20).max(200).meta({ description: "爆炸粒子数量" }),
  gravity: z.number().min(0.05).max(0.5).meta({ description: "重力系数" }),
  wind: z.number().min(-0.3).max(0.3).meta({ description: "风力系数" }),
  threshold: z.number().min(50).max(200).meta({ description: "二值化阈值" }),
  sampleDensity: z.number().min(4).max(20).meta({ description: "采样密度" }),
  growStyle: z.enum(["radial", "wave", "tree"]).meta({ description: "生长样式" }),
  backgroundColor: zColor().meta({ description: "初始背景颜色" }),
  backgroundOpacity: z.number().min(0).max(1).meta({ description: "背景图片透明度" }),
  // 新增：爆炸背景透明度
  explodeBackgroundOpacity: z.number().min(0).max(1).meta({ description: "爆炸后背景图片透明度（0-1，越小越暗，让烟花更突出）" }),
  seed: z.number().meta({ description: "随机种子" }),
});

export type TextGrowExplodeCompositionProps = z.infer<typeof TextGrowExplodeCompositionSchema>;

// ==================== 辅助函数 ====================

/**
 * 在服务端提取轮廓点（使用 canvas 模拟或预计算数据）
 */
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
        points.push({
          x,
          y,
          opacity: 1 - gray * invThreshold
        });
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
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // 使用预计算的轮廓点数据
  const contourPoints = useMemo(() => {
    return contourPointsData || [];
  }, [contourPointsData]);

  // 预计算各阶段的时间点
  const timings = useMemo(() => ({
    growEndFrame: growDuration,
    holdEndFrame: growDuration + holdDuration,
    explodeStartFrame: growDuration + holdDuration,
    explodeEndFrame: growDuration + holdDuration + explodeDuration,
    fallEndFrame: growDuration + holdDuration + explodeDuration + fallDuration,
  }), [growDuration, holdDuration, explodeDuration, fallDuration]);

  // 生成爆炸粒子（缓存）
  const particles = useMemo(() => {
    return generateParticles(
      width / 2,
      height / 2,
      words,
      particleCount,
      particleFontSize,
      seed
    );
  }, [width, height, words, particleCount, particleFontSize, seed]);

  // 计算动画状态
  const backgroundProgress = interpolate(
    frame,
    [timings.explodeStartFrame, timings.explodeStartFrame + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const growOpacity = interpolate(
    frame,
    [timings.explodeStartFrame - 10, timings.explodeStartFrame],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const flashIntensity = interpolate(
    frame,
    [timings.explodeStartFrame, timings.explodeStartFrame + 5, timings.explodeStartFrame + 15],
    [1, 0.5, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 判断当前阶段
  const isGrowPhase = frame < timings.explodeStartFrame;
  const isExplodePhase = frame >= timings.explodeStartFrame;
  const showGrow = isGrowPhase && contourPoints.length > 0 && growOpacity > 0;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* 初始背景（生长阶段） */}
      <AbsoluteFill
        style={{
          backgroundColor: backgroundColor,
          background: `radial-gradient(ellipse at center, ${backgroundColor} 0%, #0a0a1a 70%, #000000 100%)`,
        }}
      />
      
      {/* 爆炸后的背景图（带透明度控制） */}
      {backgroundProgress > 0 && (
        <AbsoluteFill style={{ opacity: backgroundProgress * explodeBackgroundOpacity }}>
          <Img
            src={staticFile(imageSource)}
            style={{ width, height, objectFit: "cover" }}
          />
        </AbsoluteFill>
      )}

      {/* 遮罩 */}
      <AbsoluteFill style={{ backgroundColor: "#000000", opacity: 0.15 }} />

      {/* 生长阶段 */}
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
            seed={seed}
          />
        </AbsoluteFill>
      )}

      {/* 爆炸闪光效果 */}
      {flashIntensity > 0 && (
        <AbsoluteFill
          style={{
            backgroundColor: "#ffffff",
            opacity: flashIntensity * 0.3,
          }}
        />
      )}

      {/* 冲击波效果 */}
      <ShockWave
        centerX={width / 2}
        centerY={height / 2}
        startFrame={timings.explodeStartFrame}
        duration={30}
        maxRadius={Math.max(width, height)}
        color={glowColor}
      />

      {/* 爆炸粒子 */}
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
    </AbsoluteFill>
  );
};

export default TextGrowExplodeComposition;
