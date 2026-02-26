import React, { useMemo } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

// 八卦数据：名称和卦象（从下到上，true=阳爻，false=阴爻）
// 数组索引：0=乾, 1=坤, 2=离, 3=坎, 4=兑, 5=艮, 6=震, 7=巽
const BAGUA_DATA = [
  { name: "乾", lines: [true, true, true], direction: "南", element: "天" },    // ☰ 三阳
  { name: "坤", lines: [false, false, false], direction: "北", element: "地" }, // ☷ 三阴
  { name: "离", lines: [true, false, true], direction: "东", element: "火" },   // ☲ 中阴
  { name: "坎", lines: [false, true, false], direction: "西", element: "水" },  // ☵ 中阳
  { name: "兑", lines: [false, true, true], direction: "东南", element: "泽" }, // ☱ 上阴
  { name: "艮", lines: [true, false, false], direction: "西北", element: "山" },// ☶ 上阳
  { name: "震", lines: [false, false, true], direction: "东北", element: "雷" },// ☳ 下阳
  { name: "巽", lines: [true, true, false], direction: "西南", element: "风" }, // ☴ 下阴
];

// 后天八卦（文王八卦）方位排列（从正上方开始，顺时针方向）
// 正上方(南)=乾, 右上(东南)=兑, 正右(东)=离, 右下(东北)=震
// 正下方(北)=坤, 左下(西南)=艮, 正左(西)=坎, 左上(西北)=巽
// 对应 BAGUA_DATA 索引：0=乾, 4=兑, 2=离, 6=震, 1=坤, 5=艮, 3=坎, 7=巽
const HOU_TIAN_ORDER = [0, 4, 2, 6, 1, 5, 3, 7];

// 先天八卦（伏羲八卦）方位排列（保留供选择）
// 正上方(南)=乾, 右下(东南)=兑, 正左(东)=离, 左下(东北)=震
// 正下方(北)=坤, 右上(西南)=巽, 正右(西)=坎, 左上(西北)=艮
const XIAN_TIAN_ORDER = [0, 4, 2, 6, 1, 7, 3, 5];

// 默认使用后天八卦
const BAGUA_ORDER = HOU_TIAN_ORDER;

interface TrigramProps {
  lines: boolean[];
  width: number;
  height: number;
  lineWidth: number;
  gap: number;
  yangColor: string;
}

// 单个卦象 - 所有爻使用同一种颜色，通过连线和断开区分阴阳
const Trigram: React.FC<TrigramProps> = ({
  lines,
  width,
  height,
  lineWidth,
  gap,
  yangColor,
}) => {
  const lineHeight = height / 3 - gap;
  const yangWidth = width;
  const yinHalfWidth = (width - lineWidth) / 2;

  return (
    <g>
      {lines.map((isYang, index) => {
        const y = index * (height / 3) + gap / 2;
        if (isYang) {
          // 阳爻：完整的长条（连线）
          return (
            <rect
              key={index}
              x={-yangWidth / 2}
              y={y}
              width={yangWidth}
              height={lineHeight}
              fill={yangColor}
              rx={lineHeight / 3}
            />
          );
        } else {
          // 阴爻：两段短条（断开），颜色相同
          return (
            <g key={index}>
              <rect
                x={-yangWidth / 2}
                y={y}
                width={yinHalfWidth}
                height={lineHeight}
                fill={yangColor}
                rx={lineHeight / 3}
              />
              <rect
                x={lineWidth / 2}
                y={y}
                width={yinHalfWidth}
                height={lineHeight}
                fill={yangColor}
                rx={lineHeight / 3}
              />
            </g>
          );
        }
      })}
    </g>
  );
};

interface BaguaProps {
  radius: number;
  trigramSize: number;
  yangColor?: string;
  rotationSpeed?: number;
  glowIntensity?: number;
  showLabels?: boolean;
  labelColor?: string;
  staggerAnimation?: boolean;
  labelOffset?: number; // 卦名距离卦象中心的偏移量
}

export const Bagua: React.FC<BaguaProps> = ({
  radius,
  trigramSize,
  yangColor = "#FFD700",
  rotationSpeed = 0.5,
  glowIntensity = 0.8,
  showLabels = true,
  labelColor = "#FFD700",
  staggerAnimation = true,
  labelOffset = 45, // 默认偏移量
}) => {
  const frame = useCurrentFrame();

  // 八卦整体旋转
  const rotation = interpolate(frame, [0, 720 / rotationSpeed], [0, 360], {
    extrapolateRight: "extend",
    easing: Easing.linear,
  });

  // 计算每个卦象的位置和动画
  const trigrams = useMemo(() => {
    return BAGUA_ORDER.map((baguaIndex, positionIndex) => {
      const bagua = BAGUA_DATA[baguaIndex];
      const angle = (positionIndex * 45 - 90) * (Math.PI / 180); // 从顶部开始，每45度一个卦
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      // 错开动画延迟
      const delay = staggerAnimation ? positionIndex * 3 : 0;
      
      // 出现动画（淡入 + 缩放）
      const appearProgress = interpolate(
        frame - delay,
        [0, 20],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

      // 脉冲效果
      const pulse = interpolate(
        frame + positionIndex * 5,
        [0, 30, 60],
        [1, 1.05, 1],
        { extrapolateRight: "extend", easing: Easing.inOut(Easing.sin) }
      );

      return {
        ...bagua,
        x,
        y,
        angle: positionIndex * 45 - 90,
        appearProgress,
        pulse,
      };
    });
  }, [radius, frame, staggerAnimation]);

  const trigramWidth = trigramSize * 0.8;
  const trigramHeight = trigramSize;

  return (
    <g transform={`rotate(${rotation})`}>
      {/* 外圈装饰 */}
      <circle
        cx={0}
        cy={0}
        r={radius + trigramSize / 2 + 10}
        fill="none"
        stroke={yangColor}
        strokeWidth={1.5}
        opacity={0.3 * glowIntensity}
        strokeDasharray="8 4"
      />
      
      <circle
        cx={0}
        cy={0}
        r={radius + trigramSize / 2 + 20}
        fill="none"
        stroke={yangColor}
        strokeWidth={1}
        opacity={0.2 * glowIntensity}
        strokeDasharray="4 8"
      />

      {/* 八卦符号 */}
      {trigrams.map((trigram, index) => (
        <g
          key={index}
          transform={`translate(${trigram.x}, ${trigram.y})`}
          opacity={trigram.appearProgress}
        >
          {/* 卦象主体 - 水平面垂直于半径方向，保持相对角度不变 */}
          <g transform={`scale(${trigram.pulse}) rotate(${trigram.angle + 90})`}>
            <Trigram
              lines={trigram.lines}
              width={trigramWidth}
              height={trigramHeight}
              lineWidth={12}
              gap={6}
              yangColor={yangColor}
            />
          </g>

          {/* 卦名 - 放置在卦象外围 */}
          {showLabels && (
            <text
              x={0}
              y={labelOffset}
              textAnchor="middle"
              fontSize={16}
              fontWeight="bold"
              fill={labelColor}
              fontFamily="serif"
              opacity={0.95 * trigram.appearProgress}
              transform={`rotate(${trigram.angle + 90})`}
            >
              {trigram.name}
            </text>
          )}
        </g>
      ))}

      {/* 连接线（太极到八卦） */}
      {trigrams.map((trigram, index) => (
        <line
          key={`line-${index}`}
          x1={0}
          y1={0}
          x2={trigram.x * 0.6}
          y2={trigram.y * 0.6}
          stroke={yangColor}
          strokeWidth={1}
          opacity={0.15 * trigram.appearProgress * glowIntensity}
          strokeDasharray="4 4"
        />
      ))}
    </g>
  );
};

export { BAGUA_DATA, HOU_TIAN_ORDER, XIAN_TIAN_ORDER, BAGUA_ORDER };
