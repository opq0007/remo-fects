import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

/**
 * 星空背景组件 Props
 */
export interface StarFieldProps {
  /** 星星数量 */
  count?: number;
  /** 整体透明度 (0-1) */
  opacity?: number;
  /** 是否启用闪烁效果 */
  twinkle?: boolean;
  /** 闪烁速度系数 */
  twinkleSpeed?: number;
  /** 随机种子（用于生成稳定的位置） */
  seed?: number;
}

/**
 * 星空背景组件
 * 生成动态闪烁的星空效果
 * 
 * @example
 * // 基础星空
 * <StarField count={100} opacity={0.5} />
 * 
 * // 带闪烁效果的星空
 * <StarField count={200} opacity={0.7} twinkle twinkleSpeed={1.5} />
 */
export const StarField: React.FC<StarFieldProps> = ({
  count = 100,
  opacity = 0.5,
  twinkle = false,
  twinkleSpeed = 1,
  seed = 42,
}) => {
  const frame = useCurrentFrame();

  // 使用确定性随机数生成星星位置
  const stars = useMemo(() => {
    const result: Array<{
      x: number;
      y: number;
      size: number;
      baseOpacity: number;
      twinkleSpeedFactor: number;
      twinkleOffset: number;
    }> = [];
    
    // 简单的伪随机数生成器
    let randomState = seed;
    const random = () => {
      randomState = (randomState * 9301 + 49297) % 233280;
      return randomState / 233280;
    };
    
    for (let i = 0; i < count; i++) {
      result.push({
        x: random() * 100,
        y: random() * 100,
        size: 0.5 + random() * 2,
        baseOpacity: 0.3 + random() * 0.7,
        twinkleSpeedFactor: 0.5 + random() * 2,
        twinkleOffset: random() * Math.PI * 2,
      });
    }
    return result;
  }, [count, seed]);

  return (
    <AbsoluteFill>
      {stars.map((star, index) => {
        // 动态闪烁效果
        let starOpacity = star.baseOpacity * opacity;
        
        if (twinkle) {
          const twinkleValue = Math.sin(frame * 0.1 * twinkleSpeed * star.twinkleSpeedFactor + star.twinkleOffset) * 0.3 + 0.7;
          starOpacity *= twinkleValue;
        }

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
              opacity: starOpacity,
              boxShadow: twinkle && starOpacity > 0.5 
                ? `0 0 ${star.size * 2}px rgba(255, 255, 255, ${starOpacity * 0.5})`
                : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export default StarField;
