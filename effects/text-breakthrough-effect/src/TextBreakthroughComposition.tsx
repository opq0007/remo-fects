import React from "react";
import {
  useVideoConfig,
  useCurrentFrame,
} from "remotion";
import { TextBreakthrough } from "./TextBreakthrough";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import {
  BaseComposition,
  StarField,
  CenterGlow,
  CompleteCompositionSchema,
  type WatermarkProps,
} from "../../shared/index";

// ==================== 特有 Schema 定义 ====================

export const TextFinalPositionSchema = z.object({
  defaultX: z.number().min(-0.5).max(0.5).optional().meta({ description: "默认水平位置" }),
  defaultY: z.number().min(-0.5).max(0.5).optional().meta({ description: "默认垂直位置" }),
  groupPositions: z.array(z.object({
    x: z.number().min(-0.5).max(0.5).meta({ description: "水平位置" }),
    y: z.number().min(-0.5).max(0.5).meta({ description: "垂直位置" }),
    arrangement: z.enum(["horizontal", "vertical", "circular", "stacked"]).optional().meta({ description: "排列方式" }),
    arrangementSpacing: z.number().min(0).max(0.5).optional().meta({ description: "排列间距" }),
  })).optional().meta({ description: "每个文字组的独立位置配置" }),
  autoArrangement: z.enum(["horizontal", "vertical", "circular", "stacked"]).optional().meta({ description: "自动排列方式" }),
  autoArrangementSpacing: z.number().min(0).max(0.5).optional().meta({ description: "自动排列间距" }),
});

// ==================== 主组件 Schema（使用公共 Schema）====================

export const TextBreakthroughCompositionSchema = CompleteCompositionSchema.extend({
  // 文字配置
  textGroups: z.array(z.object({
    texts: z.array(z.string()).min(1).meta({ description: "一组文字" }),
    groupDelay: z.number().optional().meta({ description: "延迟帧数" }),
  })).min(1).meta({ description: "文字组列表" }),

  finalPosition: TextFinalPositionSchema.optional().meta({ description: "文字最终定格位置配置" }),

  // 字体配置
  fontSize: z.number().min(20).max(300).meta({ description: "基础字体大小" }),
  fontFamily: z.string().meta({ description: "字体名称" }),
  fontWeight: z.number().min(100).max(900).meta({ description: "字体粗细" }),

  // 3D金色效果
  textColor: zColor().meta({ description: "文字主色" }),
  glowColor: zColor().meta({ description: "发光颜色" }),
  secondaryGlowColor: zColor().meta({ description: "次要发光颜色" }),
  glowIntensity: z.number().min(0.1).max(3).meta({ description: "发光强度" }),
  bevelDepth: z.number().min(0).max(10).meta({ description: "3D立体深度" }),

  // 3D透视参数
  startZ: z.number().min(500).max(3000).meta({ description: "起始深度" }),
  endZ: z.number().min(-500).max(500).meta({ description: "结束深度" }),

  // 动画时长配置
  approachDuration: z.number().min(20).max(120).meta({ description: "接近动画时长" }),
  breakthroughDuration: z.number().min(10).max(60).meta({ description: "突破动画时长" }),
  holdDuration: z.number().min(20).max(120).meta({ description: "停留时长" }),

  // 冲击效果
  impactScale: z.number().min(1).max(2).meta({ description: "冲击缩放倍数" }),
  impactRotation: z.number().min(0).max(30).meta({ description: "冲击旋转角度" }),
  shakeIntensity: z.number().min(0).max(20).meta({ description: "震动强度" }),

  // 组间延迟
  groupInterval: z.number().min(10).max(120).meta({ description: "文字组间隔帧数" }),

  // 运动方向配置
  direction: z.enum(["bottom-up", "top-down"]).optional().meta({ description: "运动方向" }),

  // 下落消失效果
  enableFallDown: z.boolean().optional().meta({ description: "启用下落消失" }),
  fallDownDuration: z.number().min(10).max(120).optional().meta({ description: "下落时长" }),
  fallDownEndY: z.number().min(0.1).max(0.5).optional().meta({ description: "下落结束位置" }),
});

export type TextBreakthroughCompositionProps = z.infer<typeof TextBreakthroughCompositionSchema>;

// ==================== 特有子组件 ====================

const EnergyRing: React.FC<{
  centerX: number;
  centerY: number;
  frame: number;
  color: string;
  active: boolean;
}> = ({ centerX, centerY, frame, color, active }) => {
  if (!active) return null;
  
  return (
    <>
      {[0, 1, 2].map((ring) => {
        const baseRadius = 50 + ring * 40;
        const rotation = frame * (3 - ring) * (ring % 2 === 0 ? 1 : -1);
        const opacity = 0.3 - ring * 0.08;
        
        return (
          <div
            key={ring}
            style={{
              position: "absolute",
              left: centerX,
              top: centerY,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              width: baseRadius * 2,
              height: baseRadius * 2,
              borderRadius: "50%",
              border: `1px solid ${color}`,
              opacity,
              boxShadow: `0 0 10px ${color}, inset 0 0 10px ${color}`,
            }}
          />
        );
      })}
    </>
  );
};

const BorderBreakEffect: React.FC<{
  active: boolean;
  progress: number;
  color: string;
}> = ({ active, progress, color }) => {
  if (!active) return null;

  const shards = React.useMemo(() => {
    const result = [];
    for (let i = 0; i < 20; i++) {
      const side = i % 4;
      const pos = (Math.floor(i / 4) / 5) * 100;
      result.push({
        side,
        pos,
        size: 10 + Math.random() * 30,
        angle: Math.random() * 360,
        speed: 2 + Math.random() * 5,
        rotationSpeed: (Math.random() - 0.5) * 20,
      });
    }
    return result;
  }, []);

  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" }}>
      {shards.map((shard, index) => {
        let x, y;
        const offset = progress * shard.speed * 50;
        const rotation = progress * shard.rotationSpeed * 10;

        switch (shard.side) {
          case 0: x = `${shard.pos}%`; y = -offset; break;
          case 1: x = `calc(100% + ${offset}px)`; y = `${shard.pos}%`; break;
          case 2: x = `${shard.pos}%`; y = `calc(100% + ${offset}px)`; break;
          default: x = -offset; y = `${shard.pos}%`; break;
        }

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: shard.size,
              height: shard.size * 0.5,
              backgroundColor: color,
              transform: `rotate(${shard.angle + rotation}deg)`,
              opacity: Math.max(0, 1 - progress),
              boxShadow: `0 0 10px ${color}`,
            }}
          />
        );
      })}
    </div>
  );
};

// ==================== 主组件 ====================

export const TextBreakthroughComposition: React.FC<TextBreakthroughCompositionProps> = ({
  textGroups,
  finalPosition,
  fontSize = 80,
  fontFamily = "PingFang SC, Microsoft YaHei, SimHei, sans-serif",
  fontWeight = 900,
  textColor = "#ffd700",
  glowColor = "#ffaa00",
  secondaryGlowColor = "#ff6600",
  glowIntensity = 1.5,
  bevelDepth = 3,
  startZ = 2000,
  endZ = -100,
  approachDuration = 45,
  breakthroughDuration = 20,
  holdDuration = 40,
  impactScale = 1.3,
  impactRotation = 10,
  shakeIntensity = 8,
  groupInterval = 30,
  direction = "bottom-up",
  backgroundType = "color",
  backgroundSource,
  backgroundColor = "#0a0a20",
  backgroundVideoLoop = true,
  backgroundVideoMuted = true,
  overlayColor = "#000000",
  overlayOpacity = 0.1,
  enableFallDown = false,
  fallDownDuration = 40,
  fallDownEndY = 0.2,
  audioEnabled = false,
  audioSource = "coin-sound.mp3",
  audioVolume = 0.5,
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
  marqueeDirection,
  marqueeSpeed,
  marqueeSpacing,
  marqueeForegroundOffsetY,
  marqueeBackgroundOffsetY,
}) => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  const groupTimings = React.useMemo(() => {
    const result: { startFrame: number; texts: string[] }[] = [];
    let currentFrame = 0;
    textGroups.forEach((group) => {
      result.push({ startFrame: currentFrame, texts: group.texts });
      currentFrame += group.groupDelay ?? groupInterval;
    });
    return result;
  }, [textGroups, groupInterval]);

  const isAnyBreakingThrough = React.useMemo(() => {
    return groupTimings.some((timing) => {
      const approachEnd = timing.startFrame + approachDuration;
      const breakthroughEnd = approachEnd + breakthroughDuration;
      return frame >= approachEnd && frame < breakthroughEnd;
    });
  }, [groupTimings, frame, approachDuration, breakthroughDuration]);

  const breakthroughProgress = React.useMemo(() => {
    let maxProgress = 0;
    groupTimings.forEach((timing) => {
      const approachEnd = timing.startFrame + approachDuration;
      const breakthroughEnd = approachEnd + breakthroughDuration;
      if (frame >= approachEnd && frame < breakthroughEnd) {
        maxProgress = Math.max(maxProgress, (frame - approachEnd) / breakthroughDuration);
      }
    });
    return maxProgress;
  }, [groupTimings, frame, approachDuration, breakthroughDuration]);

  const textPositions = React.useMemo(() => {
    const positions: { x: number; y: number }[] = [];
    const defaultX = finalPosition?.defaultX ?? 0;
    const defaultY = finalPosition?.defaultY ?? 0;
    const autoArrangement = finalPosition?.autoArrangement ?? "circular";
    const autoArrangementSpacing = finalPosition?.autoArrangementSpacing ?? 0.25;
    
    groupTimings.forEach((timing, groupIndex) => {
      const groupPosition = finalPosition?.groupPositions?.[groupIndex];
      const groupBaseX = groupPosition?.x ?? defaultX;
      const groupBaseY = groupPosition?.y ?? defaultY;
      const arrangement = groupPosition?.arrangement ?? autoArrangement;
      const spacing = groupPosition?.arrangementSpacing ?? autoArrangementSpacing;
      
      timing.texts.forEach((_, textIndex) => {
        const totalTexts = timing.texts.length;
        let offsetX = 0, offsetY = 0;
        
        if (totalTexts > 1) {
          switch (arrangement) {
            case "horizontal":
              offsetX = (textIndex - (totalTexts - 1) / 2) * spacing;
              break;
            case "vertical":
              offsetY = (textIndex - (totalTexts - 1) / 2) * spacing;
              break;
            case "stacked":
              offsetX = textIndex * spacing * 0.3;
              offsetY = textIndex * spacing * 0.2;
              break;
            default:
              const angle = (textIndex / totalTexts) * Math.PI * 2 - Math.PI / 2;
              offsetX = Math.cos(angle) * spacing;
              offsetY = Math.sin(angle) * spacing * 0.5;
          }
        }
        positions.push({ x: groupBaseX + offsetX, y: groupBaseY + offsetY });
      });
    });
    return positions;
  }, [groupTimings, finalPosition]);

  // 构建额外层
  const extraLayers = (
    <>
      <CenterGlow color={glowColor} intensity={glowIntensity * 0.5} />
      <StarField count={200} opacity={0.5} twinkle />
      <EnergyRing centerX={width / 2} centerY={height / 2} frame={frame} color={glowColor} active={isAnyBreakingThrough} />
      <BorderBreakEffect active={isAnyBreakingThrough} progress={breakthroughProgress} color={glowColor} />
    </>
  );

  // 构建走马灯配置
  const marqueeConfig = marqueeEnabled
    ? {
        enabled: true,
        foregroundTexts: marqueeForegroundTexts ?? ["新年快乐", "万事如意", "恭喜发财"],
        foregroundFontSize: marqueeForegroundFontSize ?? 32,
        foregroundOpacity: marqueeForegroundOpacity ?? 0.9,
        foregroundColor: marqueeForegroundColor ?? "#ffd700",
        foregroundEffect: marqueeForegroundEffect ?? "none",
        backgroundTexts: marqueeBackgroundTexts ?? ["新春大吉", "财源广进", "龙年行大运"],
        backgroundFontSize: marqueeBackgroundFontSize ?? 24,
        backgroundOpacity: marqueeBackgroundOpacity ?? 0.5,
        backgroundColor: marqueeBackgroundColor ?? "#ffffff",
        backgroundEffect: marqueeBackgroundEffect ?? "none",
        orientation: marqueeOrientation ?? "horizontal",
        direction: marqueeDirection ?? "left-to-right",
        speed: marqueeSpeed ?? 50,
        spacing: marqueeSpacing ?? 80,
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
      extraLayers={extraLayers}
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
      {groupTimings.map((timing, groupIndex) => {
        let positionOffset = 0;
        for (let i = 0; i < groupIndex; i++) {
          positionOffset += groupTimings[i].texts.length;
        }

        return timing.texts.map((text, textIndex) => {
          const pos = textPositions[positionOffset + textIndex];
          const startYOffset = direction === "top-down" ? -0.3 : 0.8;
          
          return (
            <TextBreakthrough
              key={`${groupIndex}-${textIndex}`}
              text={text}
              startFrame={timing.startFrame}
              startZ={startZ}
              endZ={endZ}
              startX={pos.x * 0.3}
              startY={pos.y + startYOffset}
              endX={pos.x}
              endY={pos.y}
              fontSize={fontSize}
              fontFamily={fontFamily}
              fontWeight={fontWeight}
              textColor={textColor}
              glowColor={glowColor}
              secondaryGlowColor={secondaryGlowColor}
              glowIntensity={glowIntensity}
              bevelDepth={bevelDepth}
              approachDuration={approachDuration}
              breakthroughDuration={breakthroughDuration}
              holdDuration={holdDuration}
              impactScale={impactScale}
              impactRotation={impactRotation}
              shakeIntensity={shakeIntensity}
              enableFallDown={enableFallDown}
              fallDownDuration={fallDownDuration}
              fallDownEndY={fallDownEndY}
            />
          );
        });
      })}

      {isAnyBreakingThrough && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            transform: `translate(${Math.sin(frame * 1.5) * shakeIntensity * 0.3}px, ${Math.cos(frame * 1.8) * shakeIntensity * 0.3}px)`,
          }}
        />
      )}
    </BaseComposition>
  );
};
