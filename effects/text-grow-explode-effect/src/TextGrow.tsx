import React, { useMemo, memo } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { ContourPoint, easing } from "./imageUtils";

// 文字生长动画配置
export interface TextGrowConfig {
  name: string;
  contourPoints: ContourPoint[];
  growDuration: number;
  holdDuration: number;
  fontSize: number;
  textColor: string;
  glowColor: string;
  glowIntensity: number;
  startY: number;
  growStyle: "radial" | "wave" | "tree";
  seed: number;
}

// 单个文字粒子数据
interface TextParticle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  opacity: number;
  delay: number;
  scale: number;
  rotation: number;
}

// 确定性随机数生成器
const seededRandom = (seed: number, index: number, offset: number = 0): number => {
  const x = Math.sin(seed + index * 0.1 + offset) * 10000;
  return x - Math.floor(x);
};

/**
 * 生成文字粒子数据（修复版）
 * 确保起始位置在画面内，延迟计算正确
 */
function generateTextParticles(
  contourPoints: ContourPoint[],
  width: number,
  height: number,
  startY: number,
  seed: number,
  growStyle: "radial" | "wave" | "tree"
): TextParticle[] {
  if (contourPoints.length === 0) return [];

  const particles: TextParticle[] = [];
  const centerX = width / 2;
  
  // 修正：起始Y应该在画面底部附近，但不能超出太多
  // 确保在画面内可见
  const actualStartY = Math.min(height + 20, Math.max(height - 50, startY));
  
  // 计算最大距离（从底部中心到画面顶部）
  const maxDist = Math.sqrt(centerX ** 2 + height ** 2);

  for (let index = 0; index < contourPoints.length; index++) {
    const point = contourPoints[index];
    
    // 计算延迟（基于生长样式）
    let delay: number;
    
    if (growStyle === "radial") {
      // 从底部中心向目标点生长
      const dx = point.x - centerX;
      const dy = actualStartY - point.y; // 从底部到目标点的垂直距离
      const dist = Math.sqrt(dx * dx + dy * dy);
      delay = dist / maxDist;
    } else if (growStyle === "wave") {
      // 波浪式从下到上生长
      // 目标点越靠下，越先显示
      delay = 1 - point.y / height;
    } else {
      // tree: 树式生长
      // 从底部开始，越远的地方延迟越大
      const dx = point.x - centerX;
      const dy = actualStartY - point.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // 距离越远延迟越大，同时考虑高度因素
      delay = (dist / maxDist) * 0.6 + (1 - point.y / height) * 0.4;
    }

    // 添加随机性并限制范围
    delay = Math.max(0, Math.min(0.9, delay + (seededRandom(seed, index) - 0.5) * 0.15));

    particles.push({
      id: index,
      x: centerX,
      y: actualStartY,
      targetX: point.x,
      targetY: point.y,
      opacity: point.opacity,
      delay: delay,
      scale: 0.7 + seededRandom(seed, index + 1000) * 0.3,
      rotation: 0, // 保持水平，不旋转
    });
  }

  return particles;
}

export const TextGrow: React.FC<TextGrowConfig> = memo(({
  name,
  contourPoints,
  growDuration,
  holdDuration,
  fontSize,
  textColor,
  glowColor,
  glowIntensity,
  startY,
  growStyle,
  seed,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // 预计算粒子数据（只在 contourPoints 变化时重新计算）
  const particles = useMemo(() => {
    return generateTextParticles(
      contourPoints,
      width,
      height,
      startY,
      seed,
      growStyle
    );
  }, [contourPoints, width, height, startY, seed, growStyle]);

  // 计算生长进度
  const growProgress = Math.min(1, frame / growDuration);

  // 渲染粒子
  const renderParticle = (particle: TextParticle): React.ReactNode => {
    // 基于延迟计算实际进度（修正除法问题）
    const delayRange = Math.max(0.1, 1 - particle.delay); // 确保除数不为 0
    const adjustedProgress = Math.max(0, Math.min(1, (growProgress - particle.delay) / delayRange));
    
    // 如果进度为 0，跳过渲染
    if (adjustedProgress <= 0.01) return null;
    
    const easedProgress = easing.easeOutCubic(adjustedProgress);

    // 插值位置（从起始位置移动到目标位置）
    const x = particle.x + (particle.targetX - particle.x) * easedProgress;
    const y = particle.y + (particle.targetY - particle.y) * easedProgress;

    // 缩放动画：开始小，中间放大，最后恢复
    const scale = adjustedProgress < 0.3
      ? 0.3 + adjustedProgress * 3 // 0.3 -> 1.2
      : 1.2 - (adjustedProgress - 0.3) * (1.2 - particle.scale) / 0.7;
    
    // 透明度：快速显现，保持高透明度
    const opacity = adjustedProgress < 0.2
      ? adjustedProgress * 5 // 快速显现
      : particle.opacity;

    // 保持水平，不旋转
    const rotation = 0;

    return (
      <div
        key={particle.id}
        style={{
          position: "absolute",
          left: x,
          top: y,
          opacity: Math.min(1, opacity),
          transform: `translate(-50%, -50%) scale(${scale})`,
          fontFamily: "'PingFang SC', 'Microsoft YaHei', 'SimHei', sans-serif",
          fontWeight: 700,
          fontSize: fontSize,
          color: textColor,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          textShadow: `0 0 ${2 + glowIntensity * 4}px ${glowColor}, 0 0 ${(2 + glowIntensity * 4) * 2}px ${glowColor}, 0 0 ${(2 + glowIntensity * 4) * 4}px ${glowColor}`,
        }}
      >
        {name}
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {particles.map(renderParticle)}
    </AbsoluteFill>
  );
});

TextGrow.displayName = 'TextGrow';

export default TextGrow;