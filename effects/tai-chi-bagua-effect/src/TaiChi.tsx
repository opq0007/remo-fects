import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

interface TaiChiProps {
  size: number;
  yangColor?: string;
  yinColor?: string;
  glowIntensity?: number;
  rotationSpeed?: number;
  pulseSpeed?: number;
  centerX?: number;
  centerY?: number;
}

export const TaiChi: React.FC<TaiChiProps> = ({
  size,
  yangColor = "#FFD700",
  yinColor = "#1a1a1a",
  glowIntensity = 0.8,
  rotationSpeed = 1,
  pulseSpeed = 1,
  centerX = 0,
  centerY = 0,
}) => {
  const frame = useCurrentFrame();

  // 太极图自转动画
  const rotation = interpolate(frame, [0, 360 / rotationSpeed], [0, 360], {
    extrapolateRight: "extend",
    easing: Easing.linear,
  });

  // 内部呼吸效果
  const breath = interpolate(
    frame,
    [0, 45 / pulseSpeed, 90 / pulseSpeed],
    [1, 1.03, 1],
    { extrapolateRight: "extend", easing: Easing.inOut(Easing.sin) }
  );

  const R = size / 2; // 大圆半径
  const r = R / 2; // 小圆半径（鱼头/鱼尾的小圆）
  const eyeR = R / 8; // 鱼眼半径（更小一些）

  return (
    <g transform={`translate(${centerX}, ${centerY})`}>
      <g transform={`rotate(${rotation}) scale(${breath})`}>
        {/* 
          太极图绘制原理（经典叠加法）：
          1. 画完整大圆（阴色）
          2. 画右半圆（阳色）- 形成左右分割
          3. 画上方小圆（阳色）- 阳鱼头部向左凸出
          4. 画下方小圆（阴色）- 阴鱼头部向右凸出（覆盖部分阳色）
          5. 画鱼眼
        */}

        {/* 第1层：完整大圆（阴色背景） */}
        <circle cx={0} cy={0} r={R} fill={yinColor} />

        {/* 第2层：右半圆（阳色）*/}
        <path
          d={`M 0 ${-R} A ${R} ${R} 0 0 1 0 ${R} L 0 0 Z`}
          fill={yangColor}
        />

        {/* 第3层：上方小圆（阳色）- 圆心在(0, -r)，向左凸出 */}
        <circle cx={0} cy={-r} r={r} fill={yangColor} />

        {/* 第4层：下方小圆（阴色）- 圆心在(0, r)，向右凸出，覆盖部分阳色 */}
        <circle cx={0} cy={r} r={r} fill={yinColor} />

        {/* 第5层：阳鱼的鱼眼（阴色）- 在上方小圆中心 */}
        <circle cx={0} cy={-r} r={eyeR} fill={yinColor} />

        {/* 第6层：阴鱼的鱼眼（阳色）- 在下方小圆中心 */}
        <circle cx={0} cy={r} r={eyeR} fill={yangColor} />
      </g>
    </g>
  );
};
