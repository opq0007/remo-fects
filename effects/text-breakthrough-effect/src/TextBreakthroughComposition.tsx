import React from "react";
import {
  useVideoConfig,
  useCurrentFrame,
} from "remotion";
import { TextBreakthrough, BreakthroughContentType } from "./TextBreakthrough";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import {
  BaseComposition,
  StarField,
  CenterGlow,
  CompleteCompositionSchema,
  MixedInputSchema,
  BlessingSymbolType,
  DEFAULT_BLESSING_TYPES,
  seededRandom,
} from "../../shared/index";

// ==================== 主组件 Schema ====================

export const TextBreakthroughCompositionSchema = CompleteCompositionSchema.merge(MixedInputSchema).extend({
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

  // 图片/祝福图案配置
  imageSize: z.number().min(20).max(300).optional().meta({ description: "图片大小" }),
  blessingSize: z.number().min(20).max(300).optional().meta({ description: "祝福图案大小" }),

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

  // 内容间隔
  contentInterval: z.number().min(10).max(120).meta({ description: "内容间隔帧数" }),

  // 运动方向配置
  direction: z.enum(["bottom-up", "top-down"]).optional().meta({ description: "运动方向" }),

  // 内容排列方式
  arrangement: z.enum(["horizontal", "vertical", "circular", "stacked"]).optional().meta({ description: "内容排列方式" }),
  arrangementSpacing: z.number().min(0).max(0.5).step(0.01).optional().meta({ description: "排列间距" }),

  // 位置偏移
  centerY: z.number().min(-0.5).max(0.5).step(0.01).optional().meta({ description: "Y轴中心偏移（-0.5到0.5）" }),

  // 循环播放
  enableLoop: z.boolean().optional().meta({ description: "启用循环播放" }),

  // 下落消失效果
  enableFallDown: z.boolean().optional().meta({ description: "启用下落消失" }),
  fallDownDuration: z.number().min(10).max(120).optional().meta({ description: "下落时长" }),
  fallDownEndY: z.number().min(0.1).max(0.5).optional().meta({ description: "下落结束位置" }),
});

export type TextBreakthroughCompositionProps = z.infer<typeof TextBreakthroughCompositionSchema>;

// ==================== 内容项类型 ====================

interface ContentItem {
  type: BreakthroughContentType;
  content: string;
}

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
  // 混合输入参数
  contentType = "text",
  words = [],
  images = [],
  blessingTypes = [],
  imageWeight = 0.5,
  blessingStyle = {},
  
  // 字体配置
  fontSize = 80,
  fontFamily = "PingFang SC, Microsoft YaHei, SimHei, sans-serif",
  fontWeight = 900,
  textColor = "#ffd700",
  glowColor = "#ffaa00",
  secondaryGlowColor = "#ff6600",
  glowIntensity = 1.5,
  bevelDepth = 3,
  imageSize,
  blessingSize,
  startZ = 2000,
  endZ = -100,
  approachDuration = 45,
  breakthroughDuration = 20,
  holdDuration = 40,
  impactScale = 1.3,
  impactRotation = 10,
  shakeIntensity = 8,
  contentInterval = 30,
  direction = "bottom-up",
  arrangement = "circular",
  arrangementSpacing = 0.25,
  centerY = 0,
  enableLoop = false,
  enableFallDown = false,
  fallDownDuration = 40,
  fallDownEndY = 0.2,
  
  // 基础参数
  backgroundType = "color",
  backgroundSource,
  backgroundColor = "#0a0a20",
  backgroundVideoLoop = true,
  backgroundVideoMuted = true,
  overlayColor = "#000000",
  overlayOpacity = 0.1,
  audioEnabled = false,
  audioSource = "coin-sound.mp3",
  audioVolume = 0.5,
  watermarkEnabled = false,
  watermarkText,
  watermarkFontSize,
  watermarkColor,
  watermarkOpacity,
  watermarkSpeed,
  watermarkIntensity,
  watermarkVelocityX,
  watermarkVelocityY,
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
  const frame = useCurrentFrame();

  // 计算有效的祝福图案类型
  const effectiveBlessingTypes = blessingTypes && blessingTypes.length > 0 ? blessingTypes : DEFAULT_BLESSING_TYPES;

  // 检测可用内容
  const hasText = words.length > 0;
  const hasImages = images.length > 0;
  const hasBlessing = effectiveBlessingTypes.length > 0;
  const availableTypes: ("text" | "image" | "blessing")[] = [];
  if (hasText) availableTypes.push("text");
  if (hasImages) availableTypes.push("image");
  if (hasBlessing) availableTypes.push("blessing");

  // 生成内容项列表
  const contentItems = React.useMemo((): ContentItem[] => {
    const items: ContentItem[] = [];

    if (contentType === "text") {
      if (hasText) {
        words.forEach(w => items.push({ type: "text", content: w }));
      } else if (hasBlessing) {
        effectiveBlessingTypes.forEach(t => items.push({ type: "blessing", content: t }));
      }
    } else if (contentType === "image") {
      if (hasImages) {
        images.forEach(img => items.push({ type: "image", content: img }));
      } else if (hasBlessing) {
        effectiveBlessingTypes.forEach(t => items.push({ type: "blessing", content: t }));
      }
    } else if (contentType === "blessing") {
      effectiveBlessingTypes.forEach(t => items.push({ type: "blessing", content: t }));
    } else {
      // mixed 模式：根据权重随机分配类型
      const totalItems = Math.max(words.length, images.length, effectiveBlessingTypes.length, 4);
      const counters = { text: 0, image: 0, blessing: 0 };

      for (let i = 0; i < totalItems; i++) {
        const seedValue = i * 1000;
        let type: "text" | "image" | "blessing" = "blessing";

        // 根据可用类型和权重决定类型
        if (availableTypes.length === 1) {
          type = availableTypes[0];
        } else if (availableTypes.length === 2) {
          const rand = seededRandom(`type-${seedValue}`);
          if (hasText && hasImages) {
            type = rand < imageWeight ? "image" : "text";
          } else if (hasText && hasBlessing) {
            type = rand < 0.5 ? "text" : "blessing";
          } else if (hasImages && hasBlessing) {
            type = rand < 0.5 ? "image" : "blessing";
          }
        } else if (availableTypes.length === 3) {
          const blessingWeight = 0.3;
          const textWeight = 1 - imageWeight - blessingWeight;
          const rand = seededRandom(`type-${seedValue}`);
          if (rand < textWeight) {
            type = "text";
          } else if (rand < textWeight + imageWeight) {
            type = "image";
          } else {
            type = "blessing";
          }
        }

        // 获取实际内容
        let content = "";
        if (type === "text" && hasText) {
          content = words[counters.text % words.length];
          counters.text++;
        } else if (type === "image" && hasImages) {
          content = images[counters.image % images.length];
          counters.image++;
        } else {
          type = "blessing";
          content = effectiveBlessingTypes[counters.blessing % effectiveBlessingTypes.length];
          counters.blessing++;
        }

        items.push({ type, content });
      }
    }

    return items;
  }, [contentType, words, images, effectiveBlessingTypes, imageWeight, availableTypes, hasText, hasImages, hasBlessing]);

  // 计算单个动画周期的总帧数
  const cycleDuration = React.useMemo(() => {
    const lastItemStart = (contentItems.length - 1) * contentInterval;
    const itemDuration = approachDuration + breakthroughDuration + holdDuration + (enableFallDown ? fallDownDuration : 0);
    return lastItemStart + itemDuration;
  }, [contentItems.length, contentInterval, approachDuration, breakthroughDuration, holdDuration, enableFallDown, fallDownDuration]);

  // 计算每个内容项的时间安排（支持循环）
  const contentTimings = React.useMemo(() => {
    const timings: { startFrame: number; item: ContentItem; itemIndex: number; cycleIndex: number }[] = [];
    
    if (enableLoop && cycleDuration > 0) {
      // 循环模式：生成多个周期的内容
      const maxFrame = durationInFrames;
      let cycleIndex = 0;
      let currentFrame = 0;

      while (currentFrame < maxFrame) {
        contentItems.forEach((item, index) => {
          const startFrame = currentFrame + index * contentInterval;
          if (startFrame < maxFrame) {
            timings.push({ startFrame, item, itemIndex: index, cycleIndex });
          }
        });
        currentFrame += cycleDuration;
        cycleIndex++;
      }
    } else {
      // 非循环模式：只生成一次
      contentItems.forEach((item, index) => {
        timings.push({ startFrame: index * contentInterval, item, itemIndex: index, cycleIndex: 0 });
      });
    }

    return timings;
  }, [contentItems, contentInterval, enableLoop, cycleDuration, durationInFrames]);

  // 检测是否有内容正在突破
  const isAnyBreakingThrough = React.useMemo(() => {
    return contentTimings.some((timing) => {
      const approachEnd = timing.startFrame + approachDuration;
      const breakthroughEnd = approachEnd + breakthroughDuration;
      return frame >= approachEnd && frame < breakthroughEnd;
    });
  }, [contentTimings, frame, approachDuration, breakthroughDuration]);

  const breakthroughProgress = React.useMemo(() => {
    let maxProgress = 0;
    contentTimings.forEach((timing) => {
      const approachEnd = timing.startFrame + approachDuration;
      const breakthroughEnd = approachEnd + breakthroughDuration;
      if (frame >= approachEnd && frame < breakthroughEnd) {
        maxProgress = Math.max(maxProgress, (frame - approachEnd) / breakthroughDuration);
      }
    });
    return maxProgress;
  }, [contentTimings, frame, approachDuration, breakthroughDuration]);

  // 计算位置
  const contentPositions = React.useMemo(() => {
    const positions: { x: number; y: number }[] = [];
    const totalItems = contentItems.length;
    const baseY = centerY;

    contentItems.forEach((_, itemIndex) => {
      let offsetX = 0, offsetY = 0;

      if (totalItems > 1) {
        switch (arrangement) {
          case "horizontal":
            offsetX = (itemIndex - (totalItems - 1) / 2) * arrangementSpacing;
            break;
          case "vertical":
            offsetY = (itemIndex - (totalItems - 1) / 2) * arrangementSpacing;
            break;
          case "stacked":
            offsetX = itemIndex * arrangementSpacing * 0.3;
            offsetY = itemIndex * arrangementSpacing * 0.2;
            break;
          case "circular":
          default:
            const angle = (itemIndex / totalItems) * Math.PI * 2 - Math.PI / 2;
            offsetX = Math.cos(angle) * arrangementSpacing;
            offsetY = Math.sin(angle) * arrangementSpacing * 0.5;
        }
      }

      positions.push({ x: offsetX, y: baseY + offsetY });
    });

    return positions;
  }, [contentItems, arrangement, arrangementSpacing, centerY]);

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
      {contentTimings.map((timing, index) => {
        const pos = contentPositions[timing.itemIndex] ?? contentPositions[0] ?? { x: 0, y: 0 };
        const startYOffset = direction === "top-down" ? -0.3 : 0.8;

        return (
          <TextBreakthrough
            key={`${timing.cycleIndex}-${timing.itemIndex}`}
            contentType={timing.item.type}
            text={timing.item.type === "text" ? timing.item.content : undefined}
            imageSrc={timing.item.type === "image" ? timing.item.content : undefined}
            blessingType={timing.item.type === "blessing" ? timing.item.content as BlessingSymbolType : undefined}
            blessingStyle={blessingStyle}
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
            imageSize={imageSize}
            blessingSize={blessingSize}
          />
        );
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
