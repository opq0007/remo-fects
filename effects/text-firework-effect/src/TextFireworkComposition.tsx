import React from "react";
import {
  AbsoluteFill,
  useVideoConfig,
  staticFile,
  Img,
} from "remotion";
import { Video } from "@remotion/media";
import { Firework } from "./Firework";
import { GoldenRain, generateGoldenParticles } from "./GoldenRain";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// ==================== Schema 定义 ====================

export const TextFireworkCompositionSchema = z.object({
  // 文字配置
  words: z.array(z.string()).min(1).meta({ description: "要显示的文字列表（每个文字一个烟花）" }),
  
  // 字体配置
  fontSize: z.number().min(20).max(200).meta({ description: "字体大小" }),
  textColor: zColor().meta({ description: "文字颜色" }),
  glowColor: zColor().meta({ description: "发光颜色" }),
  glowIntensity: z.number().min(0).max(2).meta({ description: "发光强度" }),
  
  // 烟花配置
  launchHeight: z.number().min(0.05).max(0.5).meta({ description: "爆炸高度比例（从顶部算起，0.1=顶部10%，0.8=顶部80%即接近底部）" }),
  particleCount: z.number().min(20).max(200).meta({ description: "爆炸粒子数量" }),
  textDuration: z.number().min(20).max(120).meta({ description: "文字显示时长（帧）" }),
  rainDuration: z.number().min(30).max(180).meta({ description: "粒子下雨时长（帧）" }),
  
  // 粒子下雨配置
  gravity: z.number().min(0.05).max(0.5).meta({ description: "重力系数" }),
  wind: z.number().min(-0.2).max(0.2).meta({ description: "风力系数（负数为左风，正数为右风）" }),
  rainParticleSize: z.number().min(1).max(10).meta({ description: "雨滴粒子大小" }),
  
  // 时间配置
  interval: z.number().min(10).max(60).meta({ description: "烟花发射间隔（帧）" }),
  
  // 背景配置
  backgroundType: z.enum(["image", "video", "color"]).meta({ description: "背景类型" }),
  backgroundSource: z.string().optional().meta({ description: "背景文件路径" }),
  backgroundColor: zColor().optional().meta({ description: "背景颜色" }),
  backgroundVideoLoop: z.boolean().optional().meta({ description: "背景视频是否循环" }),
  backgroundVideoMuted: z.boolean().optional().meta({ description: "背景视频是否静音" }),
  
  // 遮罩效果
  overlayColor: zColor().optional().meta({ description: "遮罩颜色" }),
  overlayOpacity: z.number().min(0).max(1).optional().meta({ description: "遮罩透明度" }),
});

export type TextFireworkCompositionProps = z.infer<typeof TextFireworkCompositionSchema>;

// ==================== 子组件 ====================

const Background: React.FC<{
  type: "image" | "video" | "color";
  source?: string;
  color?: string;
  videoLoop?: boolean;
  videoMuted?: boolean;
}> = ({ type, source, color, videoLoop = true, videoMuted = true }) => {
  const { width, height } = useVideoConfig();

  if (type === "color") {
    return <AbsoluteFill style={{ backgroundColor: color || "#0a0a20" }} />;
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

const StarField: React.FC<{ count: number; opacity: number }> = ({ count, opacity }) => {
  const stars = React.useMemo(() => {
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 0.5 + Math.random() * 1.5,
        opacity: 0.3 + Math.random() * 0.7,
      });
    }
    return result;
  }, [count]);

  return (
    <AbsoluteFill>
      {stars.map((star, index) => (
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
            opacity: star.opacity * opacity,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

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
  backgroundType = "color",
  backgroundSource,
  backgroundColor = "#0a0a20",
  backgroundVideoLoop = true,
  backgroundVideoMuted = true,
  overlayColor = "#000000",
  overlayOpacity = 0.2,
}) => {
  const { width, height } = useVideoConfig();

  // 计算每个烟花的时间安排
  const fireworks = React.useMemo(() => {
    const result = [];
    
    // 使用确定性随机数生成器（基于字符串哈希）
    const seededRandom = (seed: string) => {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
      }
      const x = Math.sin(hash) * 10000;
      return x - Math.floor(x);
    };
    
    for (let i = 0; i < words.length; i++) {
      const launchFrame = i * interval;
      const explodeFrame = launchFrame + 30; // 30帧后爆炸
      
      // 使用确定性随机数生成位置
      const random1 = seededRandom(`startX-${i}-${words[i]}`);
      const random2 = seededRandom(`targetX-${i}-${words[i]}`);
      const random3 = seededRandom(`height-${i}-${words[i]}`);
      
      // 随机起始位置（底部）
      const startX = width * 0.2 + random1 * width * 0.6;
      const startY = height + 20;
      
      // 随机目标位置（顶部区域，高度错落有致）
      const targetX = width * 0.15 + random2 * width * 0.7;
      // launchHeight 表示从屏幕顶部的距离比例
      // 0.1 表示在顶部 10% 位置（屏幕上方），0.8 表示在顶部 80% 位置（屏幕下方）
      const heightVariation = (random3 - 0.5) * 0.1; // ±0.05 的随机变化
      const actualLaunchHeight = Math.max(0.1, Math.min(0.35, launchHeight + heightVariation));
      // targetY = height * actualLaunchHeight，从顶部向下
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
    const particles = [];
    
    fireworks.forEach((firework, index) => {
      const rainStartFrame = firework.explodeFrame + textDuration;
      
      // 在文字显示结束时生成粒子（使用确定性随机数）
      const fireworkParticles = generateGoldenParticles(
        firework.targetX,
        firework.targetY,
        particleCount,
        rainParticleSize,
        textColor,
        glowColor,
        index * 1000 // 每个烟花使用不同的 seed
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
    <AbsoluteFill>
      {/* 背景 */}
      <Background
        type={backgroundType}
        source={backgroundSource}
        color={backgroundColor}
        videoLoop={backgroundVideoLoop}
        videoMuted={backgroundVideoMuted}
      />

      {/* 星空背景 */}
      <StarField count={100} opacity={0.5} />

      {/* 遮罩 */}
      {overlayOpacity > 0 && (
        <Overlay color={overlayColor} opacity={overlayOpacity} />
      )}

      {/* 烟花 */}
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

      {/* 金色粒子下雨 */}
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
    </AbsoluteFill>
  );
};