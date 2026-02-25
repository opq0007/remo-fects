import React from "react";
import {
  AbsoluteFill,
  useVideoConfig,
  staticFile,
  Img,
  Sequence,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { Video } from "@remotion/media";
import { TextBreakthrough } from "./TextBreakthrough";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// ==================== Schema 定义 ====================

export const TextBreakthroughCompositionSchema = z.object({
  // 文字配置（支持数组，每组元素为一个整体）
  textGroups: z.array(z.object({
    texts: z.array(z.string()).min(1).meta({ description: "一组文字（同时出现）" }),
    groupDelay: z.number().optional().meta({ description: "该组相对于上一组的延迟帧数" }),
  })).min(1).meta({ description: "文字组列表" }),

  // 字体配置
  fontSize: z.number().min(20).max(300).meta({ description: "基础字体大小" }),
  fontFamily: z.string().meta({ description: "字体名称" }),
  fontWeight: z.number().min(100).max(900).meta({ description: "字体粗细" }),

  // 3D金色效果
  textColor: zColor().meta({ description: "文字主色（金色）" }),
  glowColor: zColor().meta({ description: "发光颜色" }),
  secondaryGlowColor: zColor().meta({ description: "次要发光颜色" }),
  glowIntensity: z.number().min(0.1).max(3).meta({ description: "发光强度" }),
  bevelDepth: z.number().min(0).max(10).meta({ description: "3D立体深度" }),

  // 3D透视参数
  startZ: z.number().min(500).max(3000).meta({ description: "起始深度（远离镜头）" }),
  endZ: z.number().min(-500).max(500).meta({ description: "结束深度（靠近镜头，负数表示突破屏幕）" }),

  // 动画时长配置
  approachDuration: z.number().min(20).max(120).meta({ description: "接近动画时长（帧）" }),
  breakthroughDuration: z.number().min(10).max(60).meta({ description: "突破动画时长（帧）" }),
  holdDuration: z.number().min(20).max(120).meta({ description: "停留时长（帧）" }),

  // 冲击效果
  impactScale: z.number().min(1).max(2).meta({ description: "冲击时的缩放倍数" }),
  impactRotation: z.number().min(0).max(30).meta({ description: "冲击时的最大旋转角度" }),
  shakeIntensity: z.number().min(0).max(20).meta({ description: "震动强度" }),

  // 组间延迟
  groupInterval: z.number().min(10).max(120).meta({ description: "文字组之间的间隔帧数" }),

  // 背景配置
  backgroundType: z.enum(["image", "video", "color", "gradient"]).meta({ description: "背景类型" }),
  backgroundSource: z.string().optional().meta({ description: "背景文件路径" }),
  backgroundColor: zColor().optional().meta({ description: "背景颜色" }),
  backgroundGradient: z.string().optional().meta({ description: "背景渐变CSS" }),
  backgroundVideoLoop: z.boolean().optional().meta({ description: "背景视频是否循环" }),
  backgroundVideoMuted: z.boolean().optional().meta({ description: "背景视频是否静音" }),

  // 遮罩效果
  overlayColor: zColor().optional().meta({ description: "遮罩颜色" }),
  overlayOpacity: z.number().min(0).max(1).optional().meta({ description: "遮罩透明度" }),
});

export type TextBreakthroughCompositionProps = z.infer<typeof TextBreakthroughCompositionSchema>;

// ==================== 子组件 ====================

const Background: React.FC<{
  type: "image" | "video" | "color" | "gradient";
  source?: string;
  color?: string;
  gradient?: string;
  videoLoop?: boolean;
  videoMuted?: boolean;
}> = ({ type, source, color, gradient, videoLoop = true, videoMuted = true }) => {
  const { width, height } = useVideoConfig();

  if (type === "color") {
    return <AbsoluteFill style={{ backgroundColor: color || "#0a0a20" }} />;
  }

  if (type === "gradient") {
    return (
      <AbsoluteFill
        style={{
          background: gradient || "radial-gradient(circle at center, #1a1a40 0%, #0a0a20 50%, #000010 100%)",
        }}
      />
    );
  }

  if (type === "image" && source) {
    return (
      <AbsoluteFill>
        <Img src={staticFile(source)} style={{ width, height, objectFit: "cover" }} />
      </AbsoluteFill>
    );
  }

  if (type === "video" && source) {
    return (
      <AbsoluteFill>
        <Video
          src={staticFile(source)}
          style={{ width, height, objectFit: "cover" }}
          loop={videoLoop}
          muted={videoMuted}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at center, #1a1a40 0%, #0a0a20 50%, #000010 100%)",
      }}
    />
  );
};

const Overlay: React.FC<{ color?: string; opacity?: number }> = ({
  color = "#000000",
  opacity = 0.3,
}) => {
  return <AbsoluteFill style={{ backgroundColor: color, opacity }} />;
};

// 动态星空背景
const StarField: React.FC<{ count: number; opacity: number; frame: number }> = ({ count, opacity, frame }) => {
  const stars = React.useMemo(() => {
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 0.5 + Math.random() * 2,
        baseOpacity: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 0.5 + Math.random() * 2, // 闪烁速度
        twinkleOffset: Math.random() * Math.PI * 2, // 闪烁相位偏移
      });
    }
    return result;
  }, [count]);

  return (
    <AbsoluteFill>
      {stars.map((star, index) => {
        // 动态闪烁效果
        const twinkle = Math.sin(frame * 0.1 * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
        const currentOpacity = star.baseOpacity * twinkle * opacity;
        
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              opacity: currentOpacity,
              boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${currentOpacity * 0.5})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// 中心光晕效果
const CenterGlow: React.FC<{
  color: string;
  intensity: number;
  frame: number;
  isActive: boolean;
}> = ({ color, intensity, frame, isActive }) => {
  // 脉冲效果
  const pulse = isActive 
    ? 0.8 + Math.sin(frame * 0.15) * 0.2 
    : 0.5 + Math.sin(frame * 0.05) * 0.1;
  
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%",
        height: "100%",
        background: `radial-gradient(ellipse at center, ${color}40 0%, transparent 50%)`,
        opacity: intensity * pulse,
        pointerEvents: "none",
      }}
    />
  );
};

// 能量环效果
const EnergyRing: React.FC<{
  centerX: number;
  centerY: number;
  frame: number;
  color: string;
  active: boolean;
}> = ({ centerX, centerY, frame, color, active }) => {
  if (!active) return null;
  
  const rings = [0, 1, 2];
  
  return (
    <>
      {rings.map((ring) => {
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

// 边框破碎效果
const BorderBreakEffect: React.FC<{
  active: boolean;
  progress: number;
  color: string;
}> = ({ active, progress, color }) => {
  if (!active) return null;

  const shards = React.useMemo(() => {
    const result = [];
    // 四边生成碎片
    for (let i = 0; i < 20; i++) {
      const side = i % 4; // 0: top, 1: right, 2: bottom, 3: left
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
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {shards.map((shard, index) => {
        let x, y;
        const offset = progress * shard.speed * 50;
        const rotation = progress * shard.rotationSpeed * 10;

        switch (shard.side) {
          case 0: // top
            x = `${shard.pos}%`;
            y = -offset;
            break;
          case 1: // right
            x = `calc(100% + ${offset}px)`;
            y = `${shard.pos}%`;
            break;
          case 2: // bottom
            x = `${shard.pos}%`;
            y = `calc(100% + ${offset}px)`;
            break;
          default: // left
            x = -offset;
            y = `${shard.pos}%`;
            break;
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
    </AbsoluteFill>
  );
};

// ==================== 主组件 ====================

export const TextBreakthroughComposition: React.FC<TextBreakthroughCompositionProps> = ({
  textGroups,
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
  backgroundType = "gradient",
  backgroundSource,
  backgroundColor = "#0a0a20",
  backgroundGradient = "radial-gradient(ellipse at center, #1a1030 0%, #0d0820 50%, #050510 100%)",
  backgroundVideoLoop = true,
  backgroundVideoMuted = true,
  overlayColor = "#000000",
  overlayOpacity = 0.1,
}) => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  // 计算每组文字的开始时间
  const groupTimings = React.useMemo(() => {
    const result: { startFrame: number; texts: string[] }[] = [];
    let currentFrame = 0;

    textGroups.forEach((group, index) => {
      const delay = group.groupDelay ?? groupInterval;
      result.push({
        startFrame: currentFrame,
        texts: group.texts,
      });
      currentFrame += delay;
    });

    return result;
  }, [textGroups, groupInterval]);

  // 检测是否有文字正在突破
  const isAnyBreakingThrough = React.useMemo(() => {
    return groupTimings.some((timing) => {
      const approachEnd = timing.startFrame + approachDuration;
      const breakthroughEnd = approachEnd + breakthroughDuration;
      return frame >= approachEnd && frame < breakthroughEnd;
    });
  }, [groupTimings, frame, approachDuration, breakthroughDuration]);

  // 突破进度
  const breakthroughProgress = React.useMemo(() => {
    let maxProgress = 0;
    groupTimings.forEach((timing) => {
      const approachEnd = timing.startFrame + approachDuration;
      const breakthroughEnd = approachEnd + breakthroughDuration;
      if (frame >= approachEnd && frame < breakthroughEnd) {
        const progress = (frame - approachEnd) / breakthroughDuration;
        maxProgress = Math.max(maxProgress, progress);
      }
    });
    return maxProgress;
  }, [groupTimings, frame, approachDuration, breakthroughDuration]);

  // 为每组文字生成位置（避免重叠）
  const textPositions = React.useMemo(() => {
    const positions: { x: number; y: number }[] = [];
    
    groupTimings.forEach((timing) => {
      timing.texts.forEach((_, textIndex) => {
        // 根据文字数量计算位置
        const totalTexts = timing.texts.length;
        const spacing = 0.25; // 文字间距
        
        if (totalTexts === 1) {
          positions.push({ x: 0, y: 0 });
        } else if (totalTexts === 2) {
          positions.push({ x: -spacing, y: 0 });
          positions.push({ x: spacing, y: 0 });
        } else {
          // 多个文字：圆形排列
          const angle = (textIndex / totalTexts) * Math.PI * 2 - Math.PI / 2;
          const radius = spacing;
          positions.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius * 0.5, // 椭圆形排列
          });
        }
      });
    });

    return positions;
  }, [groupTimings]);

  return (
    <AbsoluteFill>
      {/* 背景 */}
      <Background
        type={backgroundType}
        source={backgroundSource}
        color={backgroundColor}
        gradient={backgroundGradient}
        videoLoop={backgroundVideoLoop}
        videoMuted={backgroundVideoMuted}
      />

      {/* 中心光晕 */}
      <CenterGlow
        color={glowColor}
        intensity={glowIntensity * 0.5}
        frame={frame}
        isActive={isAnyBreakingThrough}
      />

      {/* 动态星空背景 */}
      <StarField count={200} opacity={0.5} frame={frame} />

      {/* 能量环效果（突破时激活） */}
      <EnergyRing
        centerX={width / 2}
        centerY={height / 2}
        frame={frame}
        color={glowColor}
        active={isAnyBreakingThrough}
      />

      {/* 遮罩 */}
      {overlayOpacity > 0 && (
        <Overlay color={overlayColor} opacity={overlayOpacity} />
      )}

      {/* 边框破碎效果 */}
      <BorderBreakEffect
        active={isAnyBreakingThrough}
        progress={breakthroughProgress}
        color={glowColor}
      />

      {/* 文字组 */}
      {groupTimings.map((timing, groupIndex) => {
        // 计算该组文字在位置数组中的起始索引
        let positionOffset = 0;
        for (let i = 0; i < groupIndex; i++) {
          positionOffset += groupTimings[i].texts.length;
        }

        return timing.texts.map((text, textIndex) => {
          const pos = textPositions[positionOffset + textIndex];
          
          return (
            <TextBreakthrough
              key={`${groupIndex}-${textIndex}`}
              text={text}
              startFrame={timing.startFrame}
              startZ={startZ}
              endZ={endZ}
              startX={pos.x * 0.3} // 从侧面飞入
              startY={pos.y + 0.8} // 从下方飞入
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
            />
          );
        });
      })}

      {/* 全局震动效果（当有文字突破时） */}
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
    </AbsoluteFill>
  );
};
