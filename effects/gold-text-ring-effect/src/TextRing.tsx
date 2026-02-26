import React, { useMemo } from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
  random,
} from "remotion";

export interface TextRingProps {
  words: string[];
  fontSize: number;
  opacity: number;
  ringRadius: number;
  rotationSpeed: number;
  seed: number;
  glowIntensity: number;
  depth3d: number;
  cylinderHeight: number;
  perspective: number;
  mode: "vertical" | "positions"; // vertical: 垂直排列模式, positions: 方位模式
  verticalPosition?: number; // 垂直位置偏移：0=顶部, 0.5=中心, 1=底部
}

interface CylinderRowItem {
  id: number;
  text: string;
  rowY: number;
  fontSize: number;
  opacity: number;
  angle: number;
}

interface PositionItem {
  id: number;
  text: string;
  angle: number;
  fontSize: number;
  opacity: number;
}

const generateCylinderRows = (
  words: string[],
  fontSize: number,
  seed: number
): CylinderRowItem[] => {
  const items: CylinderRowItem[] = [];
  const rowSpacing = fontSize * 2.5;
  const totalHeight = words.length * rowSpacing;
  const startY = -totalHeight / 2;

  for (let i = 0; i < words.length; i++) {
    items.push({
      id: i,
      text: words[i],
      rowY: startY + i * rowSpacing,
      fontSize,
      opacity: 1,
      angle: 0,
    });
  }
  return items;
};

const generatePositionItems = (
  words: string[],
  fontSize: number,
  seed: number
): PositionItem[] => {
  const items: PositionItem[] = [];
  const maxPositions = 8;
  const count = Math.min(words.length, maxPositions);
  const angleStep = (Math.PI * 2) / count;

  for (let i = 0; i < count; i++) {
    items.push({
      id: i,
      text: words[i],
      angle: i * angleStep,
      fontSize,
      opacity: 1,
    });
  }
  return items;
};

// 垂直排列模式组件
const VerticalMode: React.FC<{
  items: CylinderRowItem[];
  frame: number;
  rotationSpeed: number;
  width: number;
  height: number;
  ringRadius: number;
  glowIntensity: number;
  depth3d: number;
  perspective: number;
  centerY?: number;
}> = ({
  items,
  frame,
  rotationSpeed,
  width,
  height,
  ringRadius,
  glowIntensity,
  depth3d,
  perspective,
  centerY,
}) => {
  const centerX = width / 2;
  const actualCenterY = centerY ?? height / 2;

  const rotationAngle = (frame * rotationSpeed * 0.02) % (Math.PI * 2);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height,
        pointerEvents: "none",
        transformStyle: "preserve-3d",
        perspective: `${perspective}px`,
      }}
    >
      {items.map((item) => {
        const zPos = Math.cos(rotationAngle) * ringRadius;
        const zPercent = (zPos + ringRadius) / (ringRadius * 2);
        const rowOpacity = 0.3 + zPercent * 0.7;

        const glowSize = item.fontSize * 0.3 * glowIntensity;

        const depthLayers: string[] = [];
        for (let i = 1; i <= depth3d; i++) {
          const alpha = 0.5 - i * 0.03;
          depthLayers.push(`${i}px ${i}px 0 rgba(80, 40, 0, ${alpha})`);
        }
        depthLayers.push(`-${item.fontSize * 0.02}px -${item.fontSize * 0.02}px ${item.fontSize * 0.08}px rgba(255, 215, 0, ${0.6 * glowIntensity})`);
        depthLayers.push(`0 0 ${glowSize}px rgba(255, 200, 50, ${0.4 * glowIntensity})`);
        depthLayers.push(`0 0 ${glowSize * 0.5}px rgba(255, 255, 200, ${0.3 * glowIntensity})`);

        const x = Math.sin(rotationAngle) * ringRadius;
        const z = Math.cos(rotationAngle) * ringRadius;
        const scale = 0.8 + zPercent * 0.4;

        return (
          <div
            key={item.id}
            style={{
              position: "absolute",
              left: centerX,
              top: actualCenterY + item.rowY,
              transform: `translateX(${x}px) translateZ(${z}px) scale(${scale})`,
              fontSize: item.fontSize,
              fontWeight: 800,
              fontFamily: "PingFang SC, Microsoft YaHei, SimHei, sans-serif",
              color: "#ffd700",
              textShadow: depthLayers.join(", "),
              opacity: rowOpacity * item.opacity,
              whiteSpace: "nowrap",
              letterSpacing: 4,
              filter: `drop-shadow(0 0 ${glowSize}px rgba(255, 215, 0, ${0.5 * glowIntensity}))`,
              transformStyle: "preserve-3d",
            }}
          >
            {item.text}
          </div>
        );
      })}
    </div>
  );
};

// 方位模式组件
const PositionsMode: React.FC<{
  items: PositionItem[];
  frame: number;
  rotationSpeed: number;
  width: number;
  height: number;
  ringRadius: number;
  glowIntensity: number;
  depth3d: number;
  perspective: number;
  centerY?: number;
}> = ({
  items,
  frame,
  rotationSpeed,
  width,
  height,
  ringRadius,
  glowIntensity,
  depth3d,
  perspective,
  centerY,
}) => {
  const centerX = width / 2;
  const actualCenterY = centerY ?? height / 2;

  const rotationAngle = (frame * rotationSpeed * 0.02) % (Math.PI * 2);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height,
        pointerEvents: "none",
        transformStyle: "preserve-3d",
        perspective: `${perspective}px`,
      }}
    >
      {items.map((item) => {
        const currentAngle = item.angle + rotationAngle;
        const z = Math.cos(currentAngle) * ringRadius;
        const zPercent = (z + ringRadius) / (ringRadius * 2);
        const itemOpacity = 0.3 + zPercent * 0.7;

        const glowSize = item.fontSize * 0.3 * glowIntensity;

        const depthLayers: string[] = [];
        for (let i = 1; i <= depth3d; i++) {
          const alpha = 0.5 - i * 0.03;
          depthLayers.push(`${i}px ${i}px 0 rgba(80, 40, 0, ${alpha})`);
        }
        depthLayers.push(`-${item.fontSize * 0.02}px -${item.fontSize * 0.02}px ${item.fontSize * 0.08}px rgba(255, 215, 0, ${0.6 * glowIntensity})`);
        depthLayers.push(`0 0 ${glowSize}px rgba(255, 200, 50, ${0.4 * glowIntensity})`);
        depthLayers.push(`0 0 ${glowSize * 0.5}px rgba(255, 255, 200, ${0.3 * glowIntensity})`);

        const x = Math.sin(currentAngle) * ringRadius;
        const scale = 0.8 + zPercent * 0.4;

        return (
          <div
            key={item.id}
            style={{
              position: "absolute",
              left: centerX + x,
              top: actualCenterY,
              transform: `translate(-50%, -50%) translateZ(${z}px) scale(${scale})`,
              fontSize: item.fontSize,
              fontWeight: 800,
              fontFamily: "PingFang SC, Microsoft YaHei, SimHei, sans-serif",
              color: "#ffd700",
              textShadow: depthLayers.join(", "),
              opacity: itemOpacity * item.opacity,
              whiteSpace: "nowrap",
              letterSpacing: 4,
              writingMode: "vertical-rl",
              textOrientation: "upright",
              filter: `drop-shadow(0 0 ${glowSize}px rgba(255, 215, 0, ${0.5 * glowIntensity}))`,
              transformStyle: "preserve-3d",
            }}
          >
            {item.text}
          </div>
        );
      })}
    </div>
  );
};

export const TextRing: React.FC<TextRingProps> = ({
  words,
  fontSize = 60,
  opacity = 1,
  ringRadius = 250,
  rotationSpeed = 1,
  seed = 42,
  glowIntensity = 0.8,
  depth3d = 8,
  cylinderHeight = 400,
  perspective = 1000,
  mode = "vertical",
  verticalPosition = 0.5,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // 计算垂直偏移位置
  const centerY = interpolate(
    verticalPosition,
    [0, 1],
    [ringRadius + fontSize, height - ringRadius - fontSize]
  );

  const cylinderRows = useMemo(() => {
    return generateCylinderRows(words, fontSize, seed);
  }, [words, fontSize, seed]);

  const positionItems = useMemo(() => {
    return generatePositionItems(words, fontSize, seed);
  }, [words, fontSize, seed]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {mode === "vertical" ? (
        <VerticalMode
          items={cylinderRows}
          frame={frame}
          rotationSpeed={rotationSpeed}
          width={width}
          height={height}
          ringRadius={ringRadius}
          glowIntensity={glowIntensity}
          depth3d={depth3d}
          perspective={perspective}
          centerY={centerY}
        />
      ) : (
        <PositionsMode
          items={positionItems}
          frame={frame}
          rotationSpeed={rotationSpeed}
          width={width}
          height={height}
          ringRadius={ringRadius}
          glowIntensity={glowIntensity}
          depth3d={depth3d}
          perspective={perspective}
          centerY={centerY}
        />
      )}
    </AbsoluteFill>
  );
};