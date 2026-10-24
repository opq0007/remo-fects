import React, { useMemo } from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  AbsoluteFill,
  Img,
  staticFile,
} from "remotion";
import {
  SingleBlessingSymbol,
  BlessingSymbolType,
  MixedContentType,
  detectAvailableContent,
  determineContentType,
  getNextContent,
  mergeBlessingStyle,
  BlessingStyleConfig,
  generateTextStyle,
  getImageSrc,
} from "../../shared/index";

// ==================== 类型定义 ====================

export interface TextRingProps {
  // 内容配置
  contentType?: MixedContentType;
  words?: string[];
  images?: string[];
  imageWeight?: number;
  blessingTypes?: BlessingSymbolType[];
  blessingStyle?: BlessingStyleConfig;

  // 样式配置
  fontSize: number;
  opacity: number;
  ringRadius: number;
  rotationSpeed: number;
  seed: number;
  glowIntensity: number;
  depth3d: number;
  cylinderHeight: number;
  perspective: number;
  mode: "vertical" | "positions";
  verticalPosition?: number;

  // 尺寸配置
  imageSizeRange?: [number, number];
  blessingSizeRange?: [number, number];

  // 文字样式
  textStyle?: {
    color?: string;
    effect?: "gold3d" | "glow" | "shadow" | "none";
    effectIntensity?: number;
    fontWeight?: number;
  };
}

// 单个项目数据
interface RingItem {
  id: number;
  type: "text" | "image" | "blessing";
  content: string;
  rowY: number;
  angle: number;
  fontSize: number;
  size: number;
  opacity: number;
  blessingStyle?: BlessingStyleConfig;
}

// ==================== 项目生成函数 ====================

const generateRingItems = (
  config: {
    contentType: MixedContentType;
    words: string[];
    images: string[];
    imageWeight: number;
    blessingTypes: BlessingSymbolType[];
    blessingStyle: BlessingStyleConfig;
    fontSize: number;
    imageSizeRange: [number, number];
    blessingSizeRange: [number, number];
    seed: number;
    mode: "vertical" | "positions";
  }
): RingItem[] => {
  const {
    contentType,
    words,
    images,
    imageWeight,
    blessingTypes,
    blessingStyle,
    fontSize,
    imageSizeRange,
    blessingSizeRange,
    seed,
    mode,
  } = config;

  const items: RingItem[] = [];
  const available = detectAvailableContent({ contentType, words, images, blessingTypes, imageWeight });

  // 如果没有可用内容，使用默认祝福图案
  if (available.availableTypes.length === 0) {
    available.availableTypes = ["blessing"];
    available.hasBlessing = true;
  }

  // 计算内容总数
  const contentCount = mode === "vertical"
    ? Math.max(words.length, images.length || 4, blessingTypes.length || 4, 4)
    : Math.min(Math.max(words.length, images.length || 1, blessingTypes.length || 1, 1), 8);

  const rowSpacing = fontSize * 2.5;
  const totalHeight = contentCount * rowSpacing;
  const startY = -totalHeight / 2;
  const angleStep = (Math.PI * 2) / contentCount;

  // 计数器用于轮询
  const counters = { text: 0, image: 0, blessing: 0 };

  for (let i = 0; i < contentCount; i++) {
    const seedValue = seed + i * 1000;
    const { type } = determineContentType(
      { contentType, words, images, blessingTypes, imageWeight },
      available,
      seedValue
    );

    // 获取轮询内容
    const { content, actualIndex } = getNextContent(
      type,
      { words, images, blessingTypes },
      counters[type]
    );
    counters[type]++;

    // 确定尺寸
    let size: number;
    if (type === "text") {
      // 主词条层级：第一个文字项更大更亮，其余为氛围层
      size = fontSize * (counters.text === 0 ? 1.35 : 1);
    } else if (type === "image") {
      size = imageSizeRange[0] + (Math.sin(seedValue) * 0.5 + 0.5) * (imageSizeRange[1] - imageSizeRange[0]);
    } else {
      size = blessingSizeRange[0] + (Math.sin(seedValue) * 0.5 + 0.5) * (blessingSizeRange[1] - blessingSizeRange[0]);
    }

    items.push({
      id: i,
      type,
      content,
      rowY: mode === "vertical" ? startY + i * rowSpacing : 0,
      angle: mode === "positions" ? i * angleStep : 0,
      fontSize: type === "text" ? size : fontSize,
      size,
      opacity: 1,
      blessingStyle: type === "blessing" ? mergeBlessingStyle(blessingStyle) : undefined,
    });
  }

  return items;
};

// ==================== 渲染组件 ====================

// 渲染文字项目
const TextRingItem: React.FC<{
  item: RingItem;
  x: number;
  z: number;
  scale: number;
  opacity: number;
  glowIntensity: number;
  depth3d: number;
  zPercent?: number; // 深度系数 0(远)-1(近)：驱动辉光衰减与远侧失焦
  textStyle?: { color?: string; effect?: string; effectIntensity?: number; fontWeight?: number };
}> = ({ item, x, z, scale, opacity, glowIntensity, depth3d, zPercent = 1, textStyle }) => {
  // 深度驱动的辉光：远处弱光，近处足光（金是材质不是灯泡）
  const styles = generateTextStyle(item.fontSize, {
    color: textStyle?.color ?? "#FFD76A",
    effect: (textStyle?.effect as "gold3d" | "glow" | "shadow" | "none") ?? "gold3d",
    effectIntensity: (textStyle?.effectIntensity ?? 0.6) * (0.5 + zPercent * 0.5),
    fontWeight: textStyle?.fontWeight ?? 800,
  });

  return (
    <div
      style={{
        position: "absolute",
        transform: `translateX(${x}px) translateZ(${z}px) scale(${scale})`,
        opacity,
        whiteSpace: "nowrap",
        letterSpacing: 4,
        transformStyle: "preserve-3d",
        // 远侧轻微失焦，让"转到身后"有空间感
        filter: zPercent < 0.45 ? `blur(${((0.45 - zPercent) * 3).toFixed(2)}px)` : undefined,
        ...styles,
      }}
    >
      {item.content}
    </div>
  );
};

// 渲染图片项目
const ImageRingItem: React.FC<{
  item: RingItem;
  x: number;
  z: number;
  scale: number;
  opacity: number;
  glowIntensity: number;
  zPercent?: number;
}> = ({ item, x, z, scale, opacity, glowIntensity, zPercent = 1 }) => {
  return (
    <div
      style={{
        position: "absolute",
        transform: `translateX(${x}px) translateZ(${z}px) scale(${scale})`,
        opacity,
        width: item.size,
        height: item.size,
        filter: [
          `drop-shadow(0 0 ${item.size * 0.12 * glowIntensity * (0.3 + zPercent * 0.7)}px rgba(255, 215, 0, ${0.35 * glowIntensity}))`,
          zPercent < 0.45 ? `blur(${((0.45 - zPercent) * 3).toFixed(2)}px)` : '',
        ].filter(Boolean).join(' '),
      }}
    >
      <Img
        src={getImageSrc(item.content)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
};

// 渲染祝福图案项目
const BlessingRingItem: React.FC<{
  item: RingItem;
  x: number;
  z: number;
  scale: number;
  opacity: number;
  glowIntensity: number;
  zPercent?: number;
}> = ({ item, x, z, scale, opacity, glowIntensity, zPercent = 1 }) => {
  const style = item.blessingStyle ?? {};

  return (
    <div
      style={{
        position: "absolute",
        transform: `translateX(${x}px) translateZ(${z}px) scale(${scale})`,
        opacity,
        filter: zPercent < 0.45 ? `blur(${((0.45 - zPercent) * 3).toFixed(2)}px)` : undefined,
      }}
    >
      <SingleBlessingSymbol
        type={item.content as BlessingSymbolType}
        size={item.size}
        primaryColor={style.primaryColor ?? "#FFD76A"}
        secondaryColor={style.secondaryColor ?? "#D4A017"}
        enable3D={style.enable3D ?? true}
        enableGlow={style.enableGlow ?? true}
        glowIntensity={(style.glowIntensity ?? glowIntensity) * (0.35 + zPercent * 0.65)}
      />
    </div>
  );
};

// 垂直排列模式组件
const VerticalMode: React.FC<{
  items: RingItem[];
  frame: number;
  rotationSpeed: number;
  width: number;
  height: number;
  ringRadius: number;
  glowIntensity: number;
  depth3d: number;
  perspective: number;
  centerY: number;
  textStyle?: { color?: string; effect?: string; effectIntensity?: number; fontWeight?: number };
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
  textStyle,
}) => {
  const centerX = width / 2;
  const rotationAngle = (frame * rotationSpeed * 0.02) % (Math.PI * 2);
  // 入场渐入：替代第 0 帧即满速运转的生硬开场
  const entrance = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

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
        // 每行一个相位差，形成螺旋柱而非锁死的木马墙
        const helixPhase = item.id * 0.55;
        const itemAngle = rotationAngle + helixPhase;
        const zPos = Math.cos(itemAngle) * ringRadius;
        const zPercent = (zPos + ringRadius) / (ringRadius * 2);
        const itemOpacity = (0.3 + zPercent * 0.7) * item.opacity * entrance;

        const x = Math.sin(itemAngle) * ringRadius;
        const z = Math.cos(itemAngle) * ringRadius;
        const scale = 0.8 + zPercent * 0.4;

        const commonProps = { x, z, scale, opacity: itemOpacity, glowIntensity, zPercent };

        if (item.type === "text") {
          return (
            <div
              key={item.id}
              style={{
                position: "absolute",
                left: centerX,
                top: centerY + item.rowY,
                transformStyle: "preserve-3d",
              }}
            >
              <TextRingItem item={item} {...commonProps} depth3d={depth3d} textStyle={textStyle} />
            </div>
          );
        } else if (item.type === "image") {
          return (
            <div
              key={item.id}
              style={{
                position: "absolute",
                left: centerX,
                top: centerY + item.rowY,
                transformStyle: "preserve-3d",
              }}
            >
              <ImageRingItem item={item} {...commonProps} />
            </div>
          );
        } else {
          return (
            <div
              key={item.id}
              style={{
                position: "absolute",
                left: centerX,
                top: centerY + item.rowY,
                transformStyle: "preserve-3d",
              }}
            >
              <BlessingRingItem item={item} {...commonProps} />
            </div>
          );
        }
      })}
    </div>
  );
};

// 方位模式组件
const PositionsMode: React.FC<{
  items: RingItem[];
  frame: number;
  rotationSpeed: number;
  width: number;
  height: number;
  ringRadius: number;
  glowIntensity: number;
  depth3d: number;
  perspective: number;
  centerY: number;
  textStyle?: { color?: string; effect?: string; effectIntensity?: number; fontWeight?: number };
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
  textStyle,
}) => {
  const centerX = width / 2;
  const rotationAngle = (frame * rotationSpeed * 0.02) % (Math.PI * 2);
  // 入场渐入
  const entrance = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

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
        const itemOpacity = (0.3 + zPercent * 0.7) * item.opacity * entrance;

        const x = Math.sin(currentAngle) * ringRadius;
        const scale = 0.8 + zPercent * 0.4;

        const commonProps = { x, z, scale, opacity: itemOpacity, glowIntensity, zPercent };

        if (item.type === "text") {
          return (
            <div
              key={item.id}
              style={{
                position: "absolute",
                left: centerX + x,
                top: centerY,
                transform: `translate(-50%, -50%)`,
                writingMode: "vertical-rl",
                textOrientation: "upright",
                transformStyle: "preserve-3d",
              }}
            >
              <TextRingItem item={item} {...commonProps} depth3d={depth3d} textStyle={textStyle} />
            </div>
          );
        } else if (item.type === "image") {
          return (
            <div
              key={item.id}
              style={{
                position: "absolute",
                left: centerX + x,
                top: centerY,
                transform: `translate(-50%, -50%)`,
                transformStyle: "preserve-3d",
              }}
            >
              <ImageRingItem item={item} {...commonProps} />
            </div>
          );
        } else {
          return (
            <div
              key={item.id}
              style={{
                position: "absolute",
                left: centerX + x,
                top: centerY,
                transform: `translate(-50%, -50%)`,
                transformStyle: "preserve-3d",
              }}
            >
              <BlessingRingItem item={item} {...commonProps} />
            </div>
          );
        }
      })}
    </div>
  );
};

// ==================== 主组件 ====================

export const TextRing: React.FC<TextRingProps> = ({
  contentType = "text",
  words = [],
  images = [],
  imageWeight = 0.5,
  blessingTypes = [],
  blessingStyle = {},
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
  imageSizeRange = [50, 100],
  blessingSizeRange = [50, 80],
  textStyle = {},
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // 计算垂直偏移位置
  const centerY = interpolate(
    verticalPosition,
    [0, 1],
    [ringRadius + fontSize, height - ringRadius - fontSize]
  );

  // 生成项目列表
  const ringItems = useMemo(() => {
    return generateRingItems({
      contentType,
      words,
      images,
      imageWeight,
      blessingTypes: blessingTypes.length > 0 ? blessingTypes : ["goldCoin", "moneyBag", "luckyBag", "redPacket", "star", "heart", "balloon"],
      blessingStyle,
      fontSize,
      imageSizeRange,
      blessingSizeRange,
      seed,
      mode,
    });
  }, [contentType, words, images, imageWeight, blessingTypes, blessingStyle, fontSize, imageSizeRange, blessingSizeRange, seed, mode]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {mode === "vertical" ? (
        <VerticalMode
          items={ringItems}
          frame={frame}
          rotationSpeed={rotationSpeed}
          width={width}
          height={height}
          ringRadius={ringRadius}
          glowIntensity={glowIntensity}
          depth3d={depth3d}
          perspective={perspective}
          centerY={centerY}
          textStyle={textStyle}
        />
      ) : (
        <PositionsMode
          items={ringItems}
          frame={frame}
          rotationSpeed={rotationSpeed}
          width={width}
          height={height}
          ringRadius={ringRadius}
          glowIntensity={glowIntensity}
          depth3d={depth3d}
          perspective={perspective}
          centerY={centerY}
          textStyle={textStyle}
        />
      )}
    </AbsoluteFill>
  );
};
